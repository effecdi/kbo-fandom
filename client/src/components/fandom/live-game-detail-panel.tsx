import { Tv, Radio, MapPin, Clock } from "lucide-react";
import type { KboGameSchedule, KboTeam } from "@/lib/local-store";
import type { GameRelayData } from "@/hooks/use-kbo-game-relay";
import { getBroadcastForGame } from "@/lib/kbo-broadcast";
import { BaseballDiamond } from "./baseball-diamond";

interface LiveGameDetailPanelProps {
  game: KboGameSchedule | null;
  teams: KboTeam[];
  relay: GameRelayData | null;
  relayLoading?: boolean;
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

export function LiveGameDetailPanel({
  game,
  teams,
  relay,
  relayLoading,
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

  return (
    <div
      key={game.id}
      className="rounded-2xl border bg-card border-border overflow-hidden animate-in fade-in duration-300"
    >
      {/* ── Score Header ──────────────────────────────────────────────── */}
      <div
        className="p-4"
        style={{
          background: `linear-gradient(135deg, ${homeTeam?.coverColor || "#27272a"}cc 0%, ${homeTeam?.secondaryColor || "#18181b"}cc 100%)`,
        }}
      >
        {/* Status + Inning */}
        <div className="flex items-center gap-2 mb-2">
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
          {/* Broadcast inline */}
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-white/50">
            <Tv className="w-3 h-3" />
            <span>{broadcast.tv[0]}</span>
          </div>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div
              className="w-9 h-9 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-black text-[10px] border-2 border-white/20"
              style={{ backgroundColor: homeTeam?.coverColor || "#666" }}
            >
              {game.homeTeamName.slice(0, 2)}
            </div>
            <p className="text-[11px] font-bold text-white truncate">
              {game.homeTeamName}
            </p>
          </div>

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

          <div className="flex-1 text-center">
            <div
              className="w-9 h-9 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-black text-[10px] border-2 border-white/20"
              style={{ backgroundColor: awayTeam?.coverColor || "#666" }}
            >
              {game.awayTeamName.slice(0, 2)}
            </div>
            <p className="text-[11px] font-bold text-white truncate">
              {game.awayTeamName}
            </p>
          </div>
        </div>

        {/* Stadium + Time */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-white/50">
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

      {/* ── Baseball Diamond (live relay) ─────────────────────────────── */}
      {game.status === "live" && relay ? (
        <BaseballDiamond
          relay={relay}
          homeColor={homeTeam?.coverColor}
          awayColor={awayTeam?.coverColor}
        />
      ) : game.status === "live" && relayLoading ? (
        <div className="h-[200px] flex items-center justify-center bg-gradient-to-b from-[#2d5a27] to-[#3a7233]">
          <div className="text-white/50 text-xs animate-pulse">
            중계 데이터 로딩 중...
          </div>
        </div>
      ) : (
        /* Broadcast info for non-live games */
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground font-medium">
                {broadcast.tv.join(", ")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground font-medium">
                {broadcast.radio.join(", ")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
