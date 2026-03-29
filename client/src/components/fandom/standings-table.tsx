import { Trophy } from "lucide-react";
import type { KboStanding } from "@/lib/local-store";
import type { KboStandingLive } from "@/hooks/use-kbo-standings";

// Unified row type that works with both local seed data and live API data
interface StandingRow {
  teamId: string;
  teamName: string;
  teamColor?: string;
  teamImageUrl?: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: string;
  gamesBack: string;
  streak: string;
  last5?: string;
  last10?: string;
  era?: string;
  battingAvg?: string;
  runs?: number;
  homeRuns?: number;
}

interface StandingsTableProps {
  standings?: KboStanding[];
  liveStandings?: KboStandingLive[];
  myTeamId?: string;
  compact?: boolean;
}

// Team color fallback
const TEAM_COLORS: Record<string, string> = {
  "team-lg": "#C60C30", "team-kt": "#000000", "team-ssg": "#CE0E2D",
  "team-nc": "#315288", "team-doo": "#131230", "team-kia": "#EA0029",
  "team-lot": "#041E42", "team-sam": "#074CA1", "team-han": "#FF6600",
  "team-kiw": "#820024",
};

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-700",
};

export function StandingsTable({ standings, liveStandings, myTeamId, compact }: StandingsTableProps) {
  // Normalize data into unified rows
  const rows: StandingRow[] = [];

  if (liveStandings && liveStandings.length > 0) {
    for (const t of liveStandings) {
      rows.push({
        teamId: t.teamId,
        teamName: t.teamName,
        teamColor: TEAM_COLORS[t.teamId],
        teamImageUrl: t.teamImageUrl,
        rank: t.rank,
        wins: t.wins,
        losses: t.losses,
        draws: t.draws,
        winRate: t.winRate,
        gamesBack: t.gamesBack,
        streak: t.streak,
        last5: t.last5,
        era: t.era,
        battingAvg: t.battingAvg,
        runs: t.runs,
        homeRuns: t.homeRuns,
      });
    }
  } else if (standings) {
    for (const s of standings) {
      rows.push({
        teamId: s.teamId,
        teamName: s.teamName,
        teamColor: s.teamColor,
        rank: s.rank,
        wins: s.wins,
        losses: s.losses,
        draws: s.draws,
        winRate: s.winRate,
        gamesBack: s.gamesBack,
        streak: s.streak,
        last10: s.last10,
      });
    }
  }

  const sorted = [...rows].sort((a, b) => a.rank - b.rank);
  const display = compact ? sorted.slice(0, 5) : sorted;
  const hasLiveData = liveStandings && liveStandings.length > 0;

  if (display.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        순위 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card max-w-full min-w-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 text-muted-foreground text-[13px]">
            <th className="px-3 py-3 text-left font-semibold w-12">순위</th>
            <th className="px-3 py-3 text-left font-semibold">팀명</th>
            <th className="px-3 py-3 text-center font-semibold">승</th>
            <th className="px-3 py-3 text-center font-semibold">패</th>
            {!compact && (
              <th className="hidden sm:table-cell px-3 py-3 text-center font-semibold">무</th>
            )}
            <th className="px-3 py-3 text-center font-semibold">승률</th>
            {!compact && (
              <>
                <th className="hidden sm:table-cell px-3 py-3 text-center font-semibold">게임차</th>
                <th className="hidden md:table-cell px-3 py-3 text-center font-semibold">연속</th>
                {hasLiveData ? (
                  <>
                    <th className="hidden lg:table-cell px-3 py-3 text-center font-semibold">최근5</th>
                    <th className="hidden lg:table-cell px-3 py-3 text-center font-semibold">타율</th>
                    <th className="hidden lg:table-cell px-3 py-3 text-center font-semibold">ERA</th>
                  </>
                ) : (
                  <th className="hidden lg:table-cell px-3 py-3 text-center font-semibold">최근10</th>
                )}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {display.map((row, idx) => {
            const isMyTeam = myTeamId && row.teamId === myTeamId;
            const rankColor = RANK_COLORS[row.rank];
            const teamColor = row.teamColor || "#666";

            return (
              <tr
                key={row.teamId}
                className={`border-t border-border transition-colors ${
                  idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                } ${isMyTeam ? "ring-1 ring-inset" : ""}`}
                style={
                  isMyTeam
                    ? {
                        backgroundColor: `${teamColor}15`,
                        ["--tw-ring-color" as string]: teamColor,
                      }
                    : {}
                }
              >
                <td className="px-3 py-3">
                  <span className={`text-sm ${rankColor ? `${rankColor} font-black` : "text-muted-foreground font-medium"}`}>
                    {row.rank <= 3 && <Trophy className={`w-3.5 h-3.5 inline-block mr-1 -mt-0.5 ${rankColor}`} />}
                    {row.rank}
                  </span>
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {row.teamImageUrl ? (
                      <img src={row.teamImageUrl} alt={row.teamName} className="w-5 h-5 object-contain flex-shrink-0" />
                    ) : (
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: teamColor }} />
                    )}
                    <span className={`text-foreground ${isMyTeam ? "font-bold" : "font-medium"}`}>
                      {row.teamName}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-3 text-center text-foreground">{row.wins}</td>
                <td className="px-3 py-3 text-center text-foreground">{row.losses}</td>

                {!compact && <td className="hidden sm:table-cell px-3 py-3 text-center text-foreground">{row.draws}</td>}

                <td className="px-3 py-3 text-center text-foreground font-medium">{row.winRate}</td>

                {!compact && (
                  <>
                    <td className="hidden sm:table-cell px-3 py-3 text-center text-muted-foreground">{row.gamesBack}</td>
                    <td className="hidden md:table-cell px-3 py-3 text-center text-muted-foreground">{row.streak}</td>
                    {hasLiveData ? (
                      <>
                        <td className="hidden lg:table-cell px-3 py-3 text-center text-muted-foreground font-mono text-[13px]">
                          {row.last5 || "-"}
                        </td>
                        <td className="hidden lg:table-cell px-3 py-3 text-center text-muted-foreground">{row.battingAvg || "-"}</td>
                        <td className="hidden lg:table-cell px-3 py-3 text-center text-muted-foreground">{row.era || "-"}</td>
                      </>
                    ) : (
                      <td className="hidden lg:table-cell px-3 py-3 text-center text-muted-foreground">{row.last10 || "-"}</td>
                    )}
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
