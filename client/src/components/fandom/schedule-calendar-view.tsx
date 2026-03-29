import { useState, useMemo } from "react";
import { GameScheduleCard } from "@/components/fandom/game-schedule-card";
import type { KboGameSchedule, KboTeam } from "@/lib/local-store";

interface ScheduleCalendarViewProps {
  games: KboGameSchedule[];
  teams: KboTeam[];
  year: number;
  month: number; // 0-indexed
  myTeamId?: string;
  attendingGameIds: string[];
  onToggleAttend: (gameId: string) => void;
}

const DAY_HEADERS = ["월", "화", "수", "목", "금", "토", "일"];

function toDateString(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

interface CalendarDay {
  day: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  games: KboGameSchedule[];
}

export function ScheduleCalendarView({
  games,
  teams,
  year,
  month,
  myTeamId,
  attendingGameIds,
  onToggleAttend,
}: ScheduleCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const now = new Date();
    return toDateString(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    // getDay() returns 0=Sun, we want 0=Mon
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month fill
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    const days: CalendarDay[] = [];

    // Fill previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateStr = toDateString(prevYear, prevMonth, day);
      days.push({
        day,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        games: games.filter((g) => g.date === dateStr),
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateString(year, month, d);
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        games: games.filter((g) => g.date === dateStr),
      });
    }

    // Fill next month to complete last row
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      for (let d = 1; d <= remaining; d++) {
        const dateStr = toDateString(nextYear, nextMonth, d);
        days.push({
          day: d,
          dateStr,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          games: games.filter((g) => g.date === dateStr),
        });
      }
    }

    return days;
  }, [games, year, month, todayStr]);

  // Get team colors for dots
  const getTeamColors = (game: KboGameSchedule): string[] => {
    const colors: string[] = [];
    const home = teams.find((t) => t.id === game.homeTeamId);
    const away = teams.find((t) => t.id === game.awayTeamId);
    if (home) colors.push(home.coverColor);
    if (away) colors.push(away.coverColor);
    return colors;
  };

  const selectedDayGames = selectedDate
    ? calendarDays.find((d) => d.dateStr === selectedDate)?.games || []
    : [];

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_HEADERS.map((dh) => (
            <div
              key={dh}
              className="text-center py-2 text-[13px] font-bold text-muted-foreground"
            >
              {dh}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cd, idx) => {
            const isSelected = selectedDate === cd.dateStr;
            // Collect unique team color dots for this day (max 6 to avoid overflow)
            const dotColors: string[] = [];
            for (const g of cd.games) {
              for (const c of getTeamColors(g)) {
                if (!dotColors.includes(c)) dotColors.push(c);
              }
              if (dotColors.length >= 6) break;
            }

            return (
              <button
                key={idx}
                onClick={() =>
                  setSelectedDate(isSelected ? null : cd.dateStr)
                }
                className={`relative min-h-[48px] sm:min-h-[72px] p-0.5 sm:p-1.5 border-b border-r border-border text-left transition-all hover:bg-muted/50 ${
                  !cd.isCurrentMonth ? "opacity-30" : ""
                } ${isSelected ? "bg-primary/10 ring-1 ring-primary/40" : ""}`}
              >
                {/* Day number */}
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[13px] font-bold ${
                    cd.isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {cd.day}
                </span>

                {/* Team color dots */}
                {dotColors.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dotColors.map((color, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                {/* Game count badge */}
                {cd.games.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center rounded-full bg-muted text-[13px] font-bold text-foreground">
                    {cd.games.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded day detail */}
      {selectedDate && selectedDayGames.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[15px] font-bold text-foreground">
            {selectedDate} 경기 ({selectedDayGames.length}경기)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDayGames.map((game) => (
              <GameScheduleCard
                key={game.id}
                game={game}
                teams={teams}
                showAttendButton
                isAttending={attendingGameIds.includes(game.id)}
                onToggleAttend={onToggleAttend}
                myTeamId={myTeamId}
              />
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedDayGames.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            {selectedDate}에 예정된 경기가 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
