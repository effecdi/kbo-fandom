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
 * Hook that polls the server for live KBO scores every `intervalMs` milliseconds.
 * Returns an array of KboGameSchedule-compatible objects with real scores.
 */
export function useKboLiveScores(intervalMs = 30000) {
  const [liveGames, setLiveGames] = useState<KboGameSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLiveGames, setHasLiveGames] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchScores = useCallback(async () => {
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
      setHasLiveGames(mapped.some((g) => g.status === "live"));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      // Don't clear existing data on error – keep stale data visible
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchScores();

    // Poll interval
    timerRef.current = setInterval(fetchScores, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchScores, intervalMs]);

  return { liveGames, isLoading, error, hasLiveGames };
}
