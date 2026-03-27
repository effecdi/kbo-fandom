import { useMemo } from "react";
import { GameScheduleCard } from "@/components/fandom/game-schedule-card";
import type { KboGameSchedule, KboTeam } from "@/lib/local-store";

interface ScheduleWeekViewProps {
  games: KboGameSchedule[];
  teams: KboTeam[];
  weekStart: Date;
  myTeamId?: string;
  attendingGameIds: string[];
  onToggleAttend: (gameId: string) => void;
}

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

function formatDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}/${d}`;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ScheduleWeekView({
  games,
  teams,
  weekStart,
  myTeamId,
  attendingGameIds,
  onToggleAttend,
}: ScheduleWeekViewProps) {
  const today = toDateString(new Date());

  // Build 7 day columns
  const columns = useMemo(() => {
    const cols: { date: Date; dateStr: string; dayName: string; games: KboGameSchedule[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = toDateString(date);
      cols.push({
        date,
        dateStr,
        dayName: DAY_NAMES[i],
        games: games.filter((g) => g.date === dateStr),
      });
    }
    return cols;
  }, [games, weekStart]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {columns.map((col) => {
        const isToday = col.dateStr === today;
        return (
          <div
            key={col.dateStr}
            className={`min-h-[200px] rounded-xl border p-2 transition-all ${
              isToday
                ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            {/* Day header */}
            <div className="text-center mb-2 pb-2 border-b border-border">
              <p
                className={`text-xs font-bold ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {col.dayName}
              </p>
              <p
                className={`text-sm font-bold ${
                  isToday ? "text-foreground" : "text-foreground/80"
                }`}
              >
                {formatDate(col.date)}
              </p>
              {isToday && (
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground">
                  오늘
                </span>
              )}
            </div>

            {/* Games */}
            <div className="space-y-2">
              {col.games.length > 0 ? (
                col.games.map((game) => (
                  <GameScheduleCard
                    key={game.id}
                    game={game}
                    teams={teams}
                    showAttendButton
                    isAttending={attendingGameIds.includes(game.id)}
                    onToggleAttend={onToggleAttend}
                    myTeamId={myTeamId}
                    compact
                  />
                ))
              ) : (
                <p className="text-[10px] text-muted-foreground/50 text-center py-4">
                  경기 없음
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
