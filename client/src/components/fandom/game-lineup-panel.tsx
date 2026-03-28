import type { KboGameSchedule, KboTeam } from "@/lib/local-store";
import type { GameRelayData } from "@/hooks/use-kbo-game-relay";

interface GameLineupPanelProps {
  game: KboGameSchedule | null;
  teams: KboTeam[];
  relay: GameRelayData | null;
}

// Map Korean position to short label
const POS_SHORT: Record<string, string> = {
  "투수": "투",
  "포수": "포",
  "1루수": "1B",
  "2루수": "2B",
  "3루수": "3B",
  "유격수": "유",
  "좌익수": "좌",
  "중견수": "중",
  "우익수": "우",
  "지명타자": "DH",
  "타자": "타",
};

export function GameLineupPanel({
  game,
  teams,
  relay,
}: GameLineupPanelProps) {
  if (!game || !relay) return null;

  const homeTeam = teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = teams.find((t) => t.id === game.awayTeamId);

  // Determine which team is on offense/defense
  const offTeamName = relay.isTopInning ? game.awayTeamName : game.homeTeamName;
  const defTeamName = relay.isTopInning ? game.homeTeamName : game.awayTeamName;
  const offColor = relay.isTopInning ? awayTeam?.coverColor : homeTeam?.coverColor;
  const defColor = relay.isTopInning ? homeTeam?.coverColor : awayTeam?.coverColor;

  // Build defense list from relay.defense
  const defenseList = Object.entries(relay.defense).map(([pos, player]) => ({
    pos,
    name: player.name,
  }));

  // Position order for defense display
  const posOrder = ["pitcher", "catcher", "first", "second", "third", "shortstop", "left", "center", "right"];
  const posLabel: Record<string, string> = {
    pitcher: "투", catcher: "포", first: "1B", second: "2B", third: "3B",
    shortstop: "유", left: "좌", center: "중", right: "우",
  };
  defenseList.sort((a, b) => posOrder.indexOf(a.pos) - posOrder.indexOf(b.pos));

  return (
    <div className="mt-3 rounded-xl border bg-card border-border overflow-hidden animate-in fade-in duration-300">
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Offensive team lineup (batting order) */}
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: offColor || "#666" }}
            />
            <span className="text-[11px] font-bold text-foreground">
              {offTeamName}
            </span>
            <span className="text-[9px] text-muted-foreground ml-auto">공격</span>
          </div>
          <div className="space-y-0.5">
            {relay.battingOrder.slice(0, 9).map((b) => {
              const isActive = relay.currentBatter?.name === b.name;
              return (
                <div
                  key={b.order}
                  className={`flex items-center gap-1.5 text-[11px] px-1.5 py-0.5 rounded ${
                    isActive ? "bg-yellow-500/15 font-bold" : ""
                  }`}
                >
                  <span className="text-muted-foreground w-3 text-right shrink-0">
                    {b.order}
                  </span>
                  <span className={`truncate ${isActive ? "text-foreground" : "text-foreground/80"}`}>
                    {b.name}
                  </span>
                  <span className="text-muted-foreground text-[9px] ml-auto shrink-0">
                    {POS_SHORT[b.pos] || b.pos}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Defensive team lineup (field positions) */}
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: defColor || "#666" }}
            />
            <span className="text-[11px] font-bold text-foreground">
              {defTeamName}
            </span>
            <span className="text-[9px] text-muted-foreground ml-auto">수비</span>
          </div>
          <div className="space-y-0.5">
            {defenseList.map((d) => {
              const isActive = relay.currentPitcher?.name === d.name;
              return (
                <div
                  key={d.pos}
                  className={`flex items-center gap-1.5 text-[11px] px-1.5 py-0.5 rounded ${
                    isActive ? "bg-red-500/15 font-bold" : ""
                  }`}
                >
                  <span className="text-muted-foreground w-4 text-right shrink-0 text-[9px]">
                    {posLabel[d.pos] || d.pos}
                  </span>
                  <span className={`truncate ${isActive ? "text-foreground" : "text-foreground/80"}`}>
                    {d.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
