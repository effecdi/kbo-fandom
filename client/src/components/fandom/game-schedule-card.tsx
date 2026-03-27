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

export function GameScheduleCard({ game, teams, showAttendButton, isAttending, onToggleAttend, myTeamId, compact }: GameScheduleCardProps) {
  const homeTeam = teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = teams.find((t) => t.id === game.awayTeamId);
  const status = STATUS_LABELS[game.status];

  // Determine if my team is playing and get the matching team's color
  const myTeamMatch = myTeamId
    ? myTeamId === game.homeTeamId
      ? homeTeam
      : myTeamId === game.awayTeamId
        ? awayTeam
        : null
    : null;

  // Build dynamic styles for the card wrapper
  const cardStyle: React.CSSProperties = myTeamMatch
    ? { borderColor: myTeamMatch.coverColor, boxShadow: `0 0 8px ${myTeamMatch.coverColor}33` }
    : {};

  // ── Compact mode ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div
        className={`bg-card border rounded-xl p-2 hover:border-foreground/15 transition-all ${myTeamMatch ? "ring-2" : "border-border"}`}
        style={{
          ...cardStyle,
          ...(myTeamMatch ? { "--tw-ring-color": myTeamMatch.coverColor } as React.CSSProperties : {}),
        }}
      >
        {/* Teams (compact) */}
        <div className="flex items-center justify-between gap-2">
          {/* Home Team (compact) */}
          <div className="flex-1 text-center">
            <div
              className="w-7 h-7 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-black text-[9px]"
              style={{ backgroundColor: homeTeam?.coverColor || "#666" }}
            >
              {game.homeTeamName.slice(0, 2)}
            </div>
            <p className="text-[10px] font-bold text-foreground truncate">{game.homeTeamName}</p>
          </div>

          {/* Score / VS (compact) */}
          <div className="text-center min-w-[40px]">
            {game.status === "finished" || game.status === "live" ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-foreground">{game.homeScore ?? 0}</span>
                <span className="text-[10px] text-muted-foreground">:</span>
                <span className="text-sm font-black text-foreground">{game.awayScore ?? 0}</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-muted-foreground">VS</span>
            )}
          </div>

          {/* Away Team (compact) */}
          <div className="flex-1 text-center">
            <div
              className="w-7 h-7 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-black text-[9px]"
              style={{ backgroundColor: awayTeam?.coverColor || "#666" }}
            >
              {game.awayTeamName.slice(0, 2)}
            </div>
            <p className="text-[10px] font-bold text-foreground truncate">{game.awayTeamName}</p>
          </div>

          {/* Attend button in compact mode */}
          {showAttendButton && (
            <button
              type="button"
              onClick={() => onToggleAttend?.(game.id)}
              className="ml-1 flex-shrink-0"
              aria-label={isAttending ? "직관 예정 취소" : "직관 예정 등록"}
              title={isAttending ? "직관 예정 취소" : "직관 예정"}
            >
              <Star
                className={`w-4 h-4 transition-colors ${isAttending ? "text-amber-400" : "text-muted-foreground/50 hover:text-amber-300"}`}
                {...(isAttending ? { fill: "currentColor" } : {})}
              />
            </button>
          )}
        </div>

        {/* Status badge (compact) */}
        <div className="flex items-center justify-center mt-1.5">
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: status.color }}
          >
            {status.label}
          </span>
        </div>
      </div>
    );
  }

  // ── Default (full) mode ───────────────────────────────────────────────────
  return (
    <div
      className={`bg-card border rounded-xl p-4 hover:border-foreground/15 transition-all ${myTeamMatch ? "ring-2" : "border-border"}`}
      style={{
        ...cardStyle,
        ...(myTeamMatch ? { "--tw-ring-color": myTeamMatch.coverColor } as React.CSSProperties : {}),
      }}
    >
      {/* Status + Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{game.date}</span>
          <Clock className="w-3.5 h-3.5 ml-1" />
          <span>{game.time}</span>
        </div>
        <div className="flex items-center gap-2">
          {showAttendButton && (
            <button
              type="button"
              onClick={() => onToggleAttend?.(game.id)}
              className="flex-shrink-0"
              aria-label={isAttending ? "직관 예정 취소" : "직관 예정 등록"}
              title={isAttending ? "직관 예정 취소" : "직관 예정"}
            >
              <Star
                className={`w-4 h-4 transition-colors ${isAttending ? "text-amber-400" : "text-muted-foreground/50 hover:text-amber-300"}`}
                {...(isAttending ? { fill: "currentColor" } : {})}
              />
            </button>
          )}
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: status.color }}
          >
            {status.label}
          </span>
        </div>
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
