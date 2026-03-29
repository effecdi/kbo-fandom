import { useState, useEffect, useRef, useCallback } from "react";

export interface GameRelayData {
  gameId: string;
  inning: number;
  isTopInning: boolean;
  currentPitcher: { name: string; style: string } | null;
  currentBatter: { name: string; pos: string; hittype: string } | null;
  count: { ball: number; strike: number; out: number };
  bases: { first: boolean; second: boolean; third: boolean };
  defense: Record<string, { name: string; pcode: string }>;
  battingOrder: { order: number; name: string; pos: string; pcode: string }[];
  inningScore: { home: Record<string, string>; away: Record<string, string> } | null;
  matchup: string | null;
}

/**
 * Polls the server for live KBO relay data (lineup, count, bases) for a specific game.
 */
export function useKboGameRelay(gameId: string | null, intervalMs = 10000) {
  const [relay, setRelay] = useState<GameRelayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRelay = useCallback(async () => {
    if (!gameId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/kbo/relay/${gameId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.gameId) {
        setRelay(data);
        setError(null);
        setLastUpdated(Date.now());
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) {
      setRelay(null);
      setLastUpdated(null);
      return;
    }

    fetchRelay();
    timerRef.current = setInterval(fetchRelay, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchRelay, intervalMs, gameId]);

  return { relay, isLoading, error, lastUpdated, refetch: fetchRelay };
}
