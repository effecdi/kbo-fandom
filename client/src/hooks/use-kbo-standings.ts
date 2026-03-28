import { useState, useEffect, useCallback } from "react";

export interface KboStandingLive {
  teamId: string;
  teamName: string;
  teamCode: string;
  teamImageUrl: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  games: number;
  winRate: string;
  gamesBack: string;
  streak: string;
  last5: string;
  era: string;
  battingAvg: string;
  runs: number;
  homeRuns: number;
}

/**
 * Fetches live KBO standings from Naver Sports API (via server proxy).
 * Polls every intervalMs (default 60s since standings don't change that fast).
 */
export function useKboStandings(intervalMs = 60000) {
  const [standings, setStandings] = useState<KboStandingLive[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/kbo/standings");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.standings && data.standings.length > 0) {
        setStandings(data.standings);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
    const timer = setInterval(fetchStandings, intervalMs);
    return () => clearInterval(timer);
  }, [fetchStandings, intervalMs]);

  return { standings, isLoading, error, refetch: fetchStandings };
}
