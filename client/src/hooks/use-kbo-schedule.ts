import { useState, useEffect, useRef } from "react";
import type { KboGameSchedule } from "@/lib/local-store";

/**
 * useKboSchedule — 네이버 스포츠 API에서 KBO 월별 일정 가져오기
 *
 * - 서버 `/api/kbo/schedule?year=&month=` → 네이버 API 프록시 (1시간 서버캐시)
 * - 클라이언트 localStorage 캐시 (1시간 TTL, stale-while-revalidate)
 * - 현재월 ± 1개월 자동 fetch
 * - `extraMonths`로 추가 월 요청 가능 (캘린더 탐색 시)
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
    // Handle year overflow
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

export function useKboSchedule(extraMonths?: { year: number; month: number }[]) {
  const [games, setGames] = useState<KboGameSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  const extraKey = extraMonths?.map((m) => `${m.year}-${m.month}`).join(",") || "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const months = getMonthKeys(extraMonths);
      const monthKeys = months.map((m) => `${m.year}-${m.month}`);

      // 1. Check localStorage cache
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached: CachedData = JSON.parse(raw);
          const allMonthsCached = monthKeys.every((k) => cached.months.includes(k));
          if (allMonthsCached && cached.fetchedAt > Date.now() - CACHE_TTL) {
            // Fresh cache — use directly
            if (!cancelled) {
              setGames(cached.games);
              setLoading(false);
            }
            return;
          }
          // Stale cache — show while revalidating
          if (cached.games.length > 0 && !cancelled) {
            setGames(cached.games);
          }
        }
      } catch { /* corrupted cache */ }

      // 2. Fetch from API
      try {
        const allGames: KboGameSchedule[] = [];
        const fetched: string[] = [];

        // Fetch each month
        for (const { year, month } of months) {
          try {
            const resp = await fetch(`/api/kbo/schedule?year=${year}&month=${month}`);
            if (!resp.ok) continue;
            const data = await resp.json();
            if (data.games && Array.isArray(data.games)) {
              allGames.push(...data.games);
              fetched.push(`${year}-${month}`);
            }
          } catch {
            // Individual month fetch failed — skip
          }
        }

        if (!cancelled && allGames.length > 0) {
          // Deduplicate by game id
          const seen = new Set<string>();
          const deduped = allGames.filter((g) => {
            if (seen.has(g.id)) return false;
            seen.add(g.id);
            return true;
          });

          setGames(deduped);

          // Update cache
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            games: deduped,
            fetchedAt: Date.now(),
            months: fetched,
          } satisfies CachedData));
        }
      } catch {
        // API entirely failed — keep whatever we have
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [extraKey]);

  return { games, loading };
}
