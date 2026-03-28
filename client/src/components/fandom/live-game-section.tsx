import { useState } from "react";
import { LiveGameCarousel } from "./live-game-carousel";
import { LiveGameDetailPanel } from "./live-game-detail-panel";
import { useKboGameRelay } from "@/hooks/use-kbo-game-relay";
import type { KboGameSchedule, KboTeam } from "@/lib/local-store";

interface LiveGameSectionProps {
  games: KboGameSchedule[];
  teams: KboTeam[];
  myTeamId?: string;
}

export function LiveGameSection({
  games,
  teams,
  myTeamId,
}: LiveGameSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedGame = games[activeIndex] || null;
  // Only fetch relay data for live games
  const relayGameId =
    selectedGame?.status === "live" ? selectedGame.id : null;
  const { relay, isLoading: relayLoading } = useKboGameRelay(relayGameId, 15000);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left: Carousel */}
      <div className="w-full lg:w-[55%] overflow-hidden">
        <LiveGameCarousel
          games={games}
          teams={teams}
          myTeamId={myTeamId}
          onActiveIndexChange={setActiveIndex}
          compact
        />
      </div>

      {/* Right: Game Detail Panel with Diamond */}
      <div className="w-full lg:w-[45%]">
        <LiveGameDetailPanel
          game={selectedGame}
          teams={teams}
          relay={relay}
          relayLoading={relayLoading}
        />
      </div>
    </div>
  );
}
