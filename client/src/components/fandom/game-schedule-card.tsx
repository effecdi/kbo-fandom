import { Calendar, MapPin, Clock, Star } from "lucide-react";
import type { KboGameSchedule, KboTeam } from "@/lib/local-store";
import { TeamLogo } from "./team-logo";

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

  // ── Compact mode (vertical card for dashboard / calendar) ────────────────
  if (compact) {
    const hasScore = game.status === "finished" || game.status === "live";

    return (
      <div
        className={`relative bg-card border rounded-2xl p-4 hover:border-foreground/15 transition-all ${myTeamMatch ? "ring-1" : "border-border"}`}
        style={{
          ...cardStyle,
          ...(myTeamMatch ? { "--tw-ring-color": myTeamMatch.coverColor } as React.CSSProperties : {}),
        }}
      >
        {/* Status badge — top right */}
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[13px] font-bold text-white"
          style={{ backgroundColor: status.color }}
        >
          {status.label}
        </span>

        {/* Time */}
        <p className="text-base font-black text-foreground">{game.time || "TBD"}</p>

        {/* Teams: Away vs Home */}
        <div className="flex items-center gap-3 mt-3">
          <TeamLogo team={awayTeam} teamName={game.awayTeamName} size="sm" className="flex-shrink-0" />
          <span className="text-base font-bold text-foreground truncate">{game.awayTeamName}</span>
          {hasScore ? (
            <span className="text-[19px] font-black text-foreground ml-auto tabular-nums">{game.awayScore ?? 0}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <TeamLogo team={homeTeam} teamName={game.homeTeamName} size="sm" className="flex-shrink-0" />
          <span className="text-base font-bold text-foreground truncate">{game.homeTeamName}</span>
          {hasScore ? (
            <span className="text-[19px] font-black text-foreground ml-auto tabular-nums">{game.homeScore ?? 0}</span>
          ) : null}
        </div>

        {/* Stadium + Date */}
        <div className="mt-3 space-y-1">
          {game.stadium && (
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {game.stadium}
            </p>
          )}
          <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            {game.date}
          </p>
        </div>

        {/* Attend button */}
        {showAttendButton && (
          <button
            type="button"
            onClick={() => onToggleAttend?.(game.id)}
            className="absolute bottom-3 right-3"
            aria-label={isAttending ? "직관 예정 취소" : "직관 예정 등록"}
            title={isAttending ? "직관 예정 취소" : "직관 예정"}
          >
            <Star
              className={`w-4 h-4 transition-colors ${isAttending ? "text-amber-400" : "text-muted-foreground/30 hover:text-amber-300"}`}
              {...(isAttending ? { fill: "currentColor" } : {})}
            />
          </button>
        )}
      </div>
    );
  }

  // ── Default (full) mode ───────────────────────────────────────────────────
  return (
    <div
      className={`relative bg-card border rounded-2xl p-3 sm:p-5 hover:border-foreground/15 transition-all ${myTeamMatch ? "ring-2" : "border-border"}`}
      style={{
        ...cardStyle,
        ...(myTeamMatch ? { "--tw-ring-color": myTeamMatch.coverColor } as React.CSSProperties : {}),
      }}
    >
      {/* Status badge — top right */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{game.date}</span>
          <Clock className="w-4 h-4 ml-1" />
          <span>{game.time}</span>
        </div>
        <div className="flex items-center gap-2.5">
          {showAttendButton && (
            <button
              type="button"
              onClick={() => onToggleAttend?.(game.id)}
              className="flex-shrink-0"
              aria-label={isAttending ? "직관 예정 취소" : "직관 예정 등록"}
              title={isAttending ? "직관 예정 취소" : "직관 예정"}
            >
              <Star
                className={`w-5 h-5 transition-colors ${isAttending ? "text-amber-400" : "text-muted-foreground/50 hover:text-amber-300"}`}
                {...(isAttending ? { fill: "currentColor" } : {})}
              />
            </button>
          )}
          <span
            className="px-2.5 py-1 rounded-full text-[13px] font-bold text-white"
            style={{ backgroundColor: status.color }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Home Team */}
        <div className="flex-1 text-center min-w-0">
          <TeamLogo team={homeTeam} teamName={game.homeTeamName} size="lg" className="mx-auto mb-2" />
          <p className="text-[13px] sm:text-base font-bold text-foreground truncate">{game.homeTeamName}</p>
          <p className="text-[13px] text-muted-foreground">홈</p>
        </div>

        {/* Score / VS */}
        <div className="text-center min-w-[50px] sm:min-w-[70px]">
          {game.status === "finished" || game.status === "live" ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-foreground">{game.homeScore ?? 0}</span>
              <span className="text-base text-muted-foreground">:</span>
              <span className="text-2xl font-black text-foreground">{game.awayScore ?? 0}</span>
            </div>
          ) : (
            <span className="text-[19px] font-bold text-muted-foreground">VS</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center min-w-0">
          <TeamLogo team={awayTeam} teamName={game.awayTeamName} size="lg" className="mx-auto mb-2" />
          <p className="text-[13px] sm:text-base font-bold text-foreground truncate">{game.awayTeamName}</p>
          <p className="text-[13px] text-muted-foreground">원정</p>
        </div>
      </div>

      {/* Stadium */}
      <div className="flex items-center gap-2 mt-3 sm:mt-4 text-[13px] text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>{game.stadium}</span>
      </div>
    </div>
  );
}
