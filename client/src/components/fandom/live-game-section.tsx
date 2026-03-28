import { useState } from "react";
import { LiveGameCarousel } from "./live-game-carousel";
import { LiveGameDetailPanel } from "./live-game-detail-panel";
import { GameLineupPanel } from "./game-lineup-panel";
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
    <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
      {/* Left: Carousel + Lineup */}
      <div className="w-full lg:w-[55%] overflow-hidden flex flex-col">
        <LiveGameCarousel
          games={games}
          teams={teams}
          myTeamId={myTeamId}
          onActiveIndexChange={setActiveIndex}
          compact
        />
        {/* Lineup below carousel */}
        <div className="flex-1">
          <GameLineupPanel
            game={selectedGame}
            teams={teams}
            relay={relay}
          />
        </div>
      </div>

      {/* Right: Baseball Diamond only */}
      <div className="w-full lg:w-[45%] flex flex-col">
        <div className="flex-1 flex flex-col">
          <LiveGameDetailPanel
            game={selectedGame}
            teams={teams}
            relay={relay}
            relayLoading={relayLoading}
          />
        </div>
      </div>
    </div>
  );
}
