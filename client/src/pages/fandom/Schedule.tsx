import { useState, useEffect, useMemo } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { FandomFilterBar } from "@/components/fandom/fandom-filter-bar";
import { GameScheduleCard } from "@/components/fandom/game-schedule-card";
import { ScheduleWeekView } from "@/components/fandom/schedule-week-view";
import { ScheduleCalendarView } from "@/components/fandom/schedule-calendar-view";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  List,
  Grid3X3,
  CalendarDays,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import {
  listItems,
  addItem,
  removeItem,
  STORE_KEYS,
  getFandomProfile,
  generateId,
  type KboGameSchedule,
  type KboTeam,
  type KboAttendance,
} from "@/lib/local-store";

type ViewMode = "week" | "list" | "calendar";

const VIEW_TABS: { id: ViewMode; label: string; icon: typeof List }[] = [
  { id: "week", label: "주간", icon: CalendarDays },
  { id: "list", label: "리스트", icon: List },
  { id: "calendar", label: "캘린더", icon: Grid3X3 },
];

const KOREAN_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatKoreanDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dow = KOREAN_DAYS[date.getDay()];
  const todayStr = toDateString(new Date());
  const suffix = dateStr === todayStr ? " - 오늘" : "";
  return `${month}월 ${day}일 (${dow})${suffix}`;
}

export function FandomSchedule() {
  const [allGames, setAllGames] = useState<KboGameSchedule[]>([]);
  const [teams, setTeams] = useState<KboTeam[]>([]);
  const [attendance, setAttendance] = useState<KboAttendance[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [myTeamOnly, setMyTeamOnly] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth());

  const fandomProfile = getFandomProfile();
  const myTeamId = fandomProfile?.groupId || undefined;

  useEffect(() => {
    setAllGames(listItems<KboGameSchedule>(STORE_KEYS.KBO_SCHEDULE));
    setTeams(listItems<KboTeam>(STORE_KEYS.KBO_TEAMS));
    setAttendance(listItems<KboAttendance>(STORE_KEYS.KBO_ATTENDANCE));
  }, []);

  const attendingGameIds = useMemo(
    () => attendance.map((a) => a.gameId),
    [attendance]
  );

  // Filter games
  const filteredGames = useMemo(() => {
    let result = allGames;

    // Team filter from FandomFilterBar
    if (teamFilter) {
      result = result.filter(
        (g) => g.homeTeamId === teamFilter || g.awayTeamId === teamFilter
      );
    }

    // My team only toggle
    if (myTeamOnly && myTeamId) {
      result = result.filter(
        (g) => g.homeTeamId === myTeamId || g.awayTeamId === myTeamId
      );
    }

    return result.sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    );
  }, [allGames, teamFilter, myTeamOnly, myTeamId]);

  // Handle attendance toggle
  const handleToggleAttend = (gameId: string) => {
    const existing = attendance.find((a) => a.gameId === gameId);
    if (existing) {
      removeItem<KboAttendance>(STORE_KEYS.KBO_ATTENDANCE, existing.id);
      setAttendance((prev) => prev.filter((a) => a.id !== existing.id));
    } else {
      const newAttendance: KboAttendance = {
        id: generateId("attend"),
        gameId,
        note: "",
        createdAt: new Date().toISOString(),
      };
      addItem<KboAttendance>(STORE_KEYS.KBO_ATTENDANCE, newAttendance);
      setAttendance((prev) => [...prev, newAttendance]);
    }
  };

  // Navigation handlers
  const handlePrevWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  // Group games by date for list view
  const gamesByDate = useMemo(() => {
    const map = new Map<string, KboGameSchedule[]>();
    for (const game of filteredGames) {
      const existing = map.get(game.date) || [];
      existing.push(game);
      map.set(game.date, existing);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredGames]);

  // Navigation label
  const navLabel = useMemo(() => {
    if (viewMode === "calendar") {
      return `${calYear}년 ${calMonth + 1}월`;
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startM = weekStart.getMonth() + 1;
    const startD = weekStart.getDate();
    const endM = weekEnd.getMonth() + 1;
    const endD = weekEnd.getDate();
    return `${startM}월 ${startD}일 ~ ${endM}월 ${endD}일`;
  }, [viewMode, weekStart, calYear, calMonth]);

  const todayStr = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  // Use teams as KboTeam[] for FandomFilterBar
  const groups = teams as KboTeam[];

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              KBO 경기 일정
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{todayStr}</p>
          </div>
        </div>

        {/* View Toggle + My Team Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* View mode buttons */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {VIEW_TABS.map((vt) => (
              <Button
                key={vt.id}
                variant={viewMode === vt.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(vt.id)}
                className="gap-1.5 text-xs"
              >
                <vt.icon className="w-3.5 h-3.5" />
                {vt.label}
              </Button>
            ))}
          </div>

          {/* My team only */}
          {myTeamId && (
            <Button
              variant={myTeamOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setMyTeamOnly((v) => !v)}
              className="gap-1.5 text-xs"
            >
              <Star className={`w-3.5 h-3.5 ${myTeamOnly ? "fill-current" : ""}`} />
              내 팀 경기만
            </Button>
          )}
        </div>

        {/* Team Filter */}
        <FandomFilterBar selected={teamFilter} onChange={setTeamFilter} />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={viewMode === "calendar" ? handlePrevMonth : handlePrevWeek}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-foreground">{navLabel}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={viewMode === "calendar" ? handleNextMonth : handleNextWeek}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        {viewMode === "week" && (
          <ScheduleWeekView
            games={filteredGames}
            teams={teams}
            weekStart={weekStart}
            myTeamId={myTeamId}
            attendingGameIds={attendingGameIds}
            onToggleAttend={handleToggleAttend}
          />
        )}

        {viewMode === "calendar" && (
          <ScheduleCalendarView
            games={filteredGames}
            teams={teams}
            year={calYear}
            month={calMonth}
            myTeamId={myTeamId}
            attendingGameIds={attendingGameIds}
            onToggleAttend={handleToggleAttend}
          />
        )}

        {viewMode === "list" && (
          <div className="space-y-6">
            {gamesByDate.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  경기 일정이 없습니다
                </p>
              </div>
            ) : (
              gamesByDate.map(([date, dayGames]) => (
                <div key={date}>
                  {/* Day header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm font-bold text-foreground whitespace-nowrap">
                      {formatKoreanDate(date)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dayGames.length}경기
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Game cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayGames.map((game) => (
                      <GameScheduleCard
                        key={game.id}
                        game={game}
                        teams={teams}
                        showAttendButton
                        isAttending={attendingGameIds.includes(game.id)}
                        onToggleAttend={handleToggleAttend}
                        myTeamId={myTeamId}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
