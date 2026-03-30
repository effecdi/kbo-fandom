import { useState, useEffect, useRef, useCallback } from "react";
import type { KboGameSchedule } from "@/lib/local-store";

interface NaverKboGame {
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  status: "scheduled" | "live" | "finished" | "postponed";
  inning: string | null;
  stadium: string;
  date: string;
  time: string;
  homeEmblemUrl: string | null;
  awayEmblemUrl: string | null;
  gameOnAir: boolean;
}

interface KboScoresResponse {
  games: NaverKboGame[];
  date: string;
}

/**
 * Hook that polls the server for live KBO scores.
 * Polling interval is auto-managed based on game state:
 *   - Live game in progress → every 10s
 *   - Scheduled games today (not yet started) → every 60s
 *   - No games today or all finished → no polling (stop)
 *
 * @param slowIntervalMs interval used when games are scheduled but not live (default 60s)
 */
export function useKboLiveScores(slowIntervalMs = 60000) {
  const [liveGames, setLiveGames] = useState<KboGameSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLiveGames, setHasLiveGames] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slowIntervalRef = useRef(slowIntervalMs);
  slowIntervalRef.current = slowIntervalMs;

  const fetchScores = useCallback(async () => {
    // Clear any pending timer before fetching
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/kbo/scores?date=${today}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: KboScoresResponse = await res.json();

      const mapped: KboGameSchedule[] = data.games.map((g, i) => ({
        id: g.gameId || `live-${i}`,
        homeTeamId: g.homeTeamId,
        awayTeamId: g.awayTeamId,
        homeTeamName: g.homeTeamName,
        awayTeamName: g.awayTeamName,
        homeScore: g.homeScore,
        awayScore: g.awayScore,
        status: g.status as KboGameSchedule["status"],
        inning: g.inning || undefined,
        stadium: g.stadium,
        date: g.date,
        time: g.time,
      }));

      setLiveGames(mapped);
      const hasLive = mapped.some((g) => g.status === "live");
      setHasLiveGames(hasLive);
      setError(null);

      // Schedule next poll based on game state
      const hasScheduled = mapped.some((g) => g.status === "scheduled");
      if (hasLive) {
        // 경기 진행 중 → 10초마다 갱신
        timerRef.current = setTimeout(fetchScores, 10000);
      } else if (hasScheduled) {
        // 예정 경기 있음 → slowInterval(기본 60초)마다 확인 (경기 시작 감지)
        timerRef.current = setTimeout(fetchScores, slowIntervalRef.current);
      }
      // 오늘 경기 없음 or 전부 종료 → 폴링 중단
    } catch (err: any) {
      setError(err.message);
      // 에러 시 slowInterval 후 재시도
      timerRef.current = setTimeout(fetchScores, slowIntervalRef.current);
    } finally {
      setIsLoading(false);
    }
  }, []); // stable — uses refs for interval values

  useEffect(() => {
    fetchScores();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchScores]);

  return { liveGames, isLoading, error, hasLiveGames };
}
