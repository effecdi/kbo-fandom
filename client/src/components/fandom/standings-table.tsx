import { Trophy } from "lucide-react";
import type { KboStanding } from "@/lib/local-store";

interface StandingsTableProps {
  standings: KboStanding[];
  myTeamId?: string;
  compact?: boolean; // for showing top 5 only on home page
}

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-700",
};

export function StandingsTable({ standings, myTeamId, compact }: StandingsTableProps) {
  const sorted = [...standings].sort((a, b) => a.rank - b.rank);
  const rows = compact ? sorted.slice(0, 5) : sorted;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card max-w-full overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="bg-muted/60 text-muted-foreground text-[13px]">
            <th className="px-4 py-3 text-left font-semibold">순위</th>
            <th className="px-4 py-3 text-left font-semibold">팀명</th>
            <th className="px-4 py-3 text-center font-semibold">승</th>
            <th className="px-4 py-3 text-center font-semibold">패</th>
            {!compact && (
              <th className="px-4 py-3 text-center font-semibold">무</th>
            )}
            <th className="px-4 py-3 text-center font-semibold">승률</th>
            {!compact && (
              <>
                <th className="px-4 py-3 text-center font-semibold">게임차</th>
                <th className="px-4 py-3 text-center font-semibold">연승</th>
                <th className="px-4 py-3 text-center font-semibold">최근10</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((standing, idx) => {
            const isMyTeam = myTeamId && standing.teamId === myTeamId;
            const rankColor = RANK_COLORS[standing.rank];

            return (
              <tr
                key={standing.teamId}
                className={`border-t border-border transition-colors ${
                  idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                } ${isMyTeam ? "ring-1 ring-inset" : ""}`}
                style={
                  isMyTeam
                    ? {
                        backgroundColor: `${standing.teamColor}15`,
                        ["--tw-ring-color" as string]: standing.teamColor,
                      }
                    : {}
                }
              >
                {/* 순위 */}
                <td className="px-4 py-3">
                  <span
                    className={`text-sm ${
                      rankColor
                        ? `${rankColor} font-black`
                        : "text-muted-foreground font-medium"
                    }`}
                  >
                    {standing.rank <= 3 && (
                      <Trophy
                        className={`w-3.5 h-3.5 inline-block mr-1 -mt-0.5 ${rankColor}`}
                      />
                    )}
                    {standing.rank}
                  </span>
                </td>

                {/* 팀명 */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: standing.teamColor }}
                    />
                    <span
                      className={`text-foreground ${
                        isMyTeam ? "font-bold" : "font-medium"
                      }`}
                    >
                      {standing.teamName}
                    </span>
                  </div>
                </td>

                {/* 승 */}
                <td className="px-4 py-3 text-center text-foreground">
                  {standing.wins}
                </td>

                {/* 패 */}
                <td className="px-4 py-3 text-center text-foreground">
                  {standing.losses}
                </td>

                {/* 무 (full only) */}
                {!compact && (
                  <td className="px-4 py-3 text-center text-foreground">
                    {standing.draws}
                  </td>
                )}

                {/* 승률 */}
                <td className="px-4 py-3 text-center text-foreground font-medium">
                  {standing.winRate}
                </td>

                {/* 게임차, 연승, 최근10 (full only) */}
                {!compact && (
                  <>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {standing.gamesBack}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {standing.streak}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {standing.last10}
                    </td>
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
