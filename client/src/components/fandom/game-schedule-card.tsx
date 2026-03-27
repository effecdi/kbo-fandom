import { Calendar, MapPin, Clock, Star } from "lucide-react";
import type { KboGameSchedule, KboTeam } from "@/lib/local-store";

interface GameScheduleCardProps {
  game: KboGameSchedule;
  teams: KboTeam[];
  showAttendButton?: boolean;    // show "직관 예정" star toggle
  isAttending?: boolean;         // whether user marked this game
  onToggleAttend?: (gameId: string) => void;
  myTeamId?: string;             // highlight when my team is playing
  compact?: boolean;             // compact mode for calendar view
}

const STATUS_LABELS: Record<KboGameSchedule["status"], { label: string; color: string }> = {
  scheduled: { label: "예정", color: "#3B82F6" },
  live: { label: "LIVE", color: "#EF4444" },
  finished: { label: "종료", color: "#6B7280" },
  postponed: { label: "연기", color: "#F59E0B" },
};

export function GameScheduleCard({ game, teams }: GameScheduleCardProps) {
  const homeTeam = teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = teams.find((t) => t.id === game.awayTeamId);
  const status = STATUS_LABELS[game.status];

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-foreground/15 transition-all">
      {/* Status + Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{game.date}</span>
          <Clock className="w-3.5 h-3.5 ml-1" />
          <span>{game.time}</span>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: status.color }}
        >
          {status.label}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 text-center">
          <div
            className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-white font-black text-xs"
            style={{ backgroundColor: homeTeam?.coverColor || "#666" }}
          >
            {game.homeTeamName.slice(0, 2)}
          </div>
          <p className="text-xs font-bold text-foreground truncate">{game.homeTeamName}</p>
          <p className="text-[10px] text-muted-foreground">홈</p>
        </div>

        {/* Score / VS */}
        <div className="text-center min-w-[60px]">
          {game.status === "finished" || game.status === "live" ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-foreground">{game.homeScore ?? 0}</span>
              <span className="text-sm text-muted-foreground">:</span>
              <span className="text-xl font-black text-foreground">{game.awayScore ?? 0}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-muted-foreground">VS</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          <div
            className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-white font-black text-xs"
            style={{ backgroundColor: awayTeam?.coverColor || "#666" }}
          >
            {game.awayTeamName.slice(0, 2)}
          </div>
          <p className="text-xs font-bold text-foreground truncate">{game.awayTeamName}</p>
          <p className="text-[10px] text-muted-foreground">원정</p>
        </div>
      </div>

      {/* Stadium */}
      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
        <MapPin className="w-3 h-3" />
        <span>{game.stadium}</span>
      </div>
    </div>
  );
}
