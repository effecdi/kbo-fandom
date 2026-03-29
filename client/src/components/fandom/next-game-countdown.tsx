import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { KboGameSchedule } from "@/lib/local-store";
import { useKboSchedule } from "@/hooks/use-kbo-schedule";

interface NextGameCountdownProps {
  teamId: string;
  teamName: string;
  teamColor: string;
}

export function NextGameCountdown({ teamId, teamName, teamColor }: NextGameCountdownProps) {
  const [nextGame, setNextGame] = useState<KboGameSchedule | null>(null);
  const [dDay, setDDay] = useState<string>("");
  const { games } = useKboSchedule();

  useEffect(() => {
    if (games.length === 0) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = games
      .filter(
        (g) =>
          (g.status === "scheduled" || g.status === "live") &&
          (g.homeTeamId === teamId || g.awayTeamId === teamId)
      )
      .filter((g) => {
        const gameDate = new Date(g.date);
        gameDate.setHours(0, 0, 0, 0);
        return gameDate >= today;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    if (upcoming.length > 0) {
      const game = upcoming[0];
      setNextGame(game);

      const gameDate = new Date(game.date);
      gameDate.setHours(0, 0, 0, 0);
      const diffTime = gameDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        setDDay("오늘!");
      } else {
        setDDay(`D-${diffDays}`);
      }
    }
  }, [teamId, games]);

  // Determine opponent name
  const opponentName = nextGame
    ? nextGame.homeTeamId === teamId
      ? nextGame.awayTeamName
      : nextGame.homeTeamName
    : "";

  const isHome = nextGame ? nextGame.homeTeamId === teamId : false;

  return (
    <div
      className="rounded-2xl p-5 text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${teamColor}, ${teamColor}CC)`,
      }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold opacity-90">다음 경기</h3>
          {nextGame && (
            <span className="text-2xl font-black">{dDay}</span>
          )}
        </div>

        {nextGame ? (
          <>
            {/* Matchup */}
            <div className="mb-3">
              <p className="text-lg font-black">
                {teamName} vs {opponentName}
              </p>
              <p className="text-[13px] opacity-75 mt-0.5">
                {isHome ? "홈 경기" : "원정 경기"}
              </p>
            </div>

            {/* Details */}
            <div className="flex flex-wrap items-center gap-3 text-[13px] opacity-80">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{nextGame.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{nextGame.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{nextGame.stadium}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-4">
            <p className="text-sm opacity-75">예정된 경기가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
