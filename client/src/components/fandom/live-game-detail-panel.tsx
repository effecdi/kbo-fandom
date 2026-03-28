import type { KboGameSchedule, KboTeam } from "@/lib/local-store";
import type { GameRelayData } from "@/hooks/use-kbo-game-relay";
import { BaseballDiamond } from "./baseball-diamond";

interface LiveGameDetailPanelProps {
  game: KboGameSchedule | null;
  teams: KboTeam[];
  relay: GameRelayData | null;
  relayLoading?: boolean;
}

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

  // Diamond only for live games with relay data
  if (game.status === "live" && relay) {
    return (
      <div key={game.id} className="rounded-2xl overflow-hidden animate-in fade-in duration-300">
        <BaseballDiamond
          relay={relay}
          homeColor={homeTeam?.coverColor}
          awayColor={awayTeam?.coverColor}
        />
      </div>
    );
  }

  if (game.status === "live" && relayLoading) {
    return (
      <div className="rounded-2xl overflow-hidden h-[300px] flex items-center justify-center bg-gradient-to-b from-[#2d5a27] to-[#3a7233]">
        <div className="text-white/50 text-xs animate-pulse">
          중계 데이터 로딩 중...
        </div>
      </div>
    );
  }

  // Non-live: show empty state
  return (
    <div className="rounded-2xl border bg-card border-border p-6 h-full flex items-center justify-center min-h-[280px]">
      <p className="text-sm text-muted-foreground">
        경기가 시작되면 중계가 표시됩니다
      </p>
    </div>
  );
}
