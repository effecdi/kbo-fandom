import { useState, useEffect } from "react";
import type { KboGameSchedule } from "@/lib/local-store";
import { generateKbo2026Schedule } from "@/lib/kbo-schedule-generator";

/**
 * useKboSchedule — 네이버 스포츠 API에서 KBO 월별 일정 가져오기
 *
 * 1순위: localStorage 캐시 (1시간 TTL)
 * 2순위: 서버 /api/kbo/schedule → 네이버 API 프록시
 * 3순위: 클라이언트 generator 폴백 (API 실패 시)
 */

const CACHE_KEY = "olli-kbo-schedule-api";
const CACHE_TTL = 3600_000; // 1 hour

interface CachedData {
  games: KboGameSchedule[];
  fetchedAt: number;
  months: string[];
}

function getMonthKeys(extraMonths?: { year: number; month: number }[]): { year: number; month: number }[] {
  const now = new Date();
  const base = [
    { year: now.getFullYear(), month: now.getMonth() },     // prev month
    { year: now.getFullYear(), month: now.getMonth() + 1 }, // current
    { year: now.getFullYear(), month: now.getMonth() + 2 }, // next
  ].map((m) => {
    let y = m.year;
    let mo = m.month;
    if (mo > 12) { y++; mo -= 12; }
    if (mo < 1) { y--; mo += 12; }
    return { year: y, month: mo };
  }).filter((m) => m.month >= 3 && m.month <= 10); // KBO season: March-October

  if (extraMonths) {
    for (const em of extraMonths) {
      if (!base.some((b) => b.year === em.year && b.month === em.month)) {
        base.push(em);
      }
    }
  }

  return base;
}

/** 폴백: 클라이언트 generator에서 일정 가져오기 */
let generatorCache: KboGameSchedule[] | null = null;
function getGeneratorFallback(): KboGameSchedule[] {
  if (!generatorCache) {
    generatorCache = generateKbo2026Schedule();
  }
  return generatorCache;
}

export function useKboSchedule(extraMonths?: { year: number; month: number }[]) {
  const [games, setGames] = useState<KboGameSchedule[]>(() => {
    // Immediate: try cache first, then generator fallback
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: CachedData = JSON.parse(raw);
        if (cached.games.length > 0) return cached.games;
      }
    } catch { /* ignore */ }
    return getGeneratorFallback();
  });
  const [loading, setLoading] = useState(true);
  const extraKey = extraMonths?.map((m) => `${m.year}-${m.month}`).join(",") || "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const months = getMonthKeys(extraMonths);
      const monthKeys = months.map((m) => `${m.year}-${m.month}`);

      // 1. Check localStorage cache freshness
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached: CachedData = JSON.parse(raw);
          const allMonthsCached = monthKeys.every((k) => cached.months.includes(k));
          if (allMonthsCached && cached.fetchedAt > Date.now() - CACHE_TTL && cached.games.length > 0) {
            if (!cancelled) {
              setGames(cached.games);
              setLoading(false);
            }
            return;
          }
        }
      } catch { /* corrupted cache */ }

      // 2. Fetch from API
      try {
        const allGames: KboGameSchedule[] = [];
        const fetched: string[] = [];

        for (const { year, month } of months) {
          try {
            const resp = await fetch(`/api/kbo/schedule?year=${year}&month=${month}`);
            if (!resp.ok) continue;
            const data = await resp.json();
            if (data.games && Array.isArray(data.games) && data.games.length > 0) {
              allGames.push(...data.games);
              fetched.push(`${year}-${month}`);
            }
          } catch { /* skip */ }
        }

        if (!cancelled) {
          const seen = new Set<string>();
          const deduped = allGames.filter((g) => {
            if (seen.has(g.id)) return false;
            seen.add(g.id);
            return true;
          });

          // Merge: API data (real scores) + generator data (future schedule)
          // API games override generator games for the same date
          const generator = getGeneratorFallback();
          const apiDateSet = new Set(deduped.map((g) => g.date));
          const generatorFill = generator.filter((g) => !apiDateSet.has(g.date));
          const merged = [...deduped, ...generatorFill];

          setGames(merged);
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            games: merged,
            fetchedAt: Date.now(),
            months: fetched,
          } satisfies CachedData));
        }
        // If fetch threw, keep existing state (generator fallback or stale cache)
      } catch {
        // API entirely failed — keep generator fallback
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [extraKey]);

  return { games, loading };
}
