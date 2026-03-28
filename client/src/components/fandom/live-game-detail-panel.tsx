import { Tv, Radio, MapPin, Clock, Users } from "lucide-react";
import type { KboGameSchedule, KboTeam, KboPlayer } from "@/lib/local-store";
import { getBroadcastForGame } from "@/lib/kbo-broadcast";

interface LiveGameDetailPanelProps {
  game: KboGameSchedule | null;
  teams: KboTeam[];
  players: KboPlayer[];
}

const STATUS_CONFIG: Record<
  KboGameSchedule["status"],
  { label: string; badgeClass: string }
> = {
  live: { label: "LIVE", badgeClass: "bg-red-500" },
  scheduled: { label: "예정", badgeClass: "bg-blue-500" },
  finished: { label: "종료", badgeClass: "bg-gray-500" },
  postponed: { label: "연기", badgeClass: "bg-amber-500" },
};

// Sort players: pitchers first, then position players
function sortPlayers(players: KboPlayer[]): KboPlayer[] {
  const order: Record<string, number> = {
    "투수": 0,
    "포수": 1,
    "내야수": 2,
    "외야수": 3,
    "지명타자": 4,
  };
  return [...players].sort(
    (a, b) => (order[a.position] ?? 5) - (order[b.position] ?? 5),
  );
}

export function LiveGameDetailPanel({
  game,
  teams,
  players,
}: LiveGameDetailPanelProps) {
  if (!game) {
    return (
      <div className="rounded-2xl border bg-card border-border p-6 h-full flex items-center justify-center min-h-[280px]">
        <p className="text-sm text-muted-foreground">경기를 선택하세요</p>
      </div>
    );
  }

  const homeTeam = teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = teams.find((t) => t.id === game.awayTeamId);
  const statusCfg = STATUS_CONFIG[game.status];
  const broadcast = getBroadcastForGame(game.homeTeamId);

  const homePlayers = sortPlayers(
    players.filter((p) => p.groupId === game.homeTeamId),
  );
  const awayPlayers = sortPlayers(
    players.filter((p) => p.groupId === game.awayTeamId),
  );

  return (
    <div
      key={game.id}
      className="rounded-2xl border bg-card border-border overflow-hidden animate-in fade-in duration-300"
    >
      {/* ── Score Header ──────────────────────────────────────────────── */}
      <div
        className="p-4 md:p-5"
        style={{
          background: `linear-gradient(135deg, ${homeTeam?.coverColor || "#27272a"}cc 0%, ${homeTeam?.secondaryColor || "#18181b"}cc 100%)`,
        }}
      >
        {/* Status + Inning */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${statusCfg.badgeClass}`}
          >
            {game.status === "live" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-100" />
              </span>
            )}
            {statusCfg.label}
          </span>
          {game.status === "live" && game.inning && (
            <span className="text-xs font-semibold text-white/80">
              {game.inning}
            </span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between">
          {/* Home */}
          <div className="flex-1 text-center">
            <div
              className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-black text-[10px] border-2 border-white/20"
              style={{ backgroundColor: homeTeam?.coverColor || "#666" }}
            >
              {game.homeTeamName.slice(0, 2)}
            </div>
            <p className="text-xs font-bold text-white truncate">
              {game.homeTeamName}
            </p>
          </div>

          {/* Score */}
          <div className="text-center min-w-[60px]">
            {game.status === "finished" || game.status === "live" ? (
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-black text-white">
                  {game.homeScore ?? 0}
                </span>
                <span className="text-sm text-white/50 font-bold">:</span>
                <span className="text-2xl font-black text-white">
                  {game.awayScore ?? 0}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-white/60">VS</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 text-center">
            <div
              className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-black text-[10px] border-2 border-white/20"
              style={{ backgroundColor: awayTeam?.coverColor || "#666" }}
            >
              {game.awayTeamName.slice(0, 2)}
            </div>
            <p className="text-xs font-bold text-white truncate">
              {game.awayTeamName}
            </p>
          </div>
        </div>

        {/* Stadium + Time */}
        <div className="flex items-center justify-between mt-3 text-[11px] text-white/60">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{game.stadium}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{game.time}</span>
          </div>
        </div>
      </div>

      {/* ── Broadcast Info ────────────────────────────────────────────── */}
      <div className="px-4 md:px-5 py-3 border-b border-border">
        <h4 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5" />
          중계
        </h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-8 shrink-0">TV</span>
            <span className="text-foreground font-medium">
              {broadcast.tv.join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Radio className="w-3 h-3 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {broadcast.radio.join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Key Players ───────────────────────────────────────────────── */}
      <div className="px-4 md:px-5 py-3">
        <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          주요 선수
        </h4>
        <div className="grid grid-cols-2 gap-x-4">
          {/* Home Team Players */}
          <div>
            <p
              className="text-[11px] font-bold mb-2 pb-1 border-b"
              style={{
                color: homeTeam?.coverColor || "#888",
                borderColor: `${homeTeam?.coverColor || "#888"}30`,
              }}
            >
              {game.homeTeamName}
            </p>
            <div className="space-y-1">
              {homePlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-1.5 text-[11px]"
                >
                  <span className="text-muted-foreground font-mono w-5 text-right shrink-0">
                    {player.jerseyNumber}
                  </span>
                  <span className="text-foreground font-medium truncate">
                    {player.nameKo}
                  </span>
                  <span className="text-muted-foreground text-[10px] shrink-0">
                    {player.position}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Away Team Players */}
          <div>
            <p
              className="text-[11px] font-bold mb-2 pb-1 border-b"
              style={{
                color: awayTeam?.coverColor || "#888",
                borderColor: `${awayTeam?.coverColor || "#888"}30`,
              }}
            >
              {game.awayTeamName}
            </p>
            <div className="space-y-1">
              {awayPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-1.5 text-[11px]"
                >
                  <span className="text-muted-foreground font-mono w-5 text-right shrink-0">
                    {player.jerseyNumber}
                  </span>
                  <span className="text-foreground font-medium truncate">
                    {player.nameKo}
                  </span>
                  <span className="text-muted-foreground text-[10px] shrink-0">
                    {player.position}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
