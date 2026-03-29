import { useState, useMemo } from "react";
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

  // Mobile: find today's index or first day with games
  const defaultMobileDay = useMemo(() => {
    const todayIdx = columns.findIndex((c) => c.dateStr === today);
    if (todayIdx >= 0) return todayIdx;
    const firstWithGames = columns.findIndex((c) => c.games.length > 0);
    return firstWithGames >= 0 ? firstWithGames : 0;
  }, [columns, today]);

  const [selectedDayIdx, setSelectedDayIdx] = useState(defaultMobileDay);

  const selectedCol = columns[selectedDayIdx];

  return (
    <>
      {/* ── Mobile: Day tabs + single day view ─────────────────────── */}
      <div className="md:hidden">
        {/* Day tab bar */}
        <div className="flex items-center gap-1 mb-4">
          {columns.map((col, idx) => {
            const isToday = col.dateStr === today;
            const isSelected = idx === selectedDayIdx;
            const hasGames = col.games.length > 0;
            return (
              <button
                key={col.dateStr}
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all text-center ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : isToday
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-[13px] font-bold">{col.dayName}</span>
                <span className={`text-[13px] ${isSelected ? "font-bold" : ""}`}>
                  {formatDate(col.date)}
                </span>
                {hasGames && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day games */}
        <div className="space-y-3">
          {selectedCol && selectedCol.games.length > 0 ? (
            selectedCol.games.map((game) => (
              <GameScheduleCard
                key={game.id}
                game={game}
                teams={teams}
                showAttendButton
                isAttending={attendingGameIds.includes(game.id)}
                onToggleAttend={onToggleAttend}
                myTeamId={myTeamId}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[13px] text-muted-foreground">경기 없음</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop: 7-column grid ─────────────────────────────────── */}
      <div className="hidden md:grid grid-cols-7 gap-1">
        {columns.map((col) => {
          const isToday = col.dateStr === today;
          return (
            <div
              key={col.dateStr}
              className={`min-h-[180px] rounded-xl border p-1.5 transition-all ${
                isToday
                  ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {/* Day header */}
              <div className="text-center mb-1.5 pb-1.5 border-b border-border">
                <p
                  className={`text-[13px] font-bold ${
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
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full text-[13px] font-bold bg-primary text-primary-foreground">
                    오늘
                  </span>
                )}
              </div>

              {/* Games */}
              <div className="space-y-1.5">
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
                  <p className="text-[13px] text-muted-foreground/50 text-center py-4">
                    경기 없음
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
