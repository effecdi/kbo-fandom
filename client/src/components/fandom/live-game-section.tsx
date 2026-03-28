import { useState } from "react";
import { LiveGameCarousel } from "./live-game-carousel";
import { LiveGameDetailPanel } from "./live-game-detail-panel";
import {
  listItems,
  STORE_KEYS,
  type KboGameSchedule,
  type KboTeam,
  type KboPlayer,
} from "@/lib/local-store";

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
  const players = listItems<KboPlayer>(STORE_KEYS.KBO_PLAYERS);

  const selectedGame = games[activeIndex] || null;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left: Carousel */}
      <div className="w-full lg:w-[58%]">
        <LiveGameCarousel
          games={games}
          teams={teams}
          myTeamId={myTeamId}
          onActiveIndexChange={setActiveIndex}
          compact
        />
      </div>

      {/* Right: Game Detail Panel */}
      <div className="w-full lg:w-[42%]">
        <LiveGameDetailPanel
          game={selectedGame}
          teams={teams}
          players={players}
        />
      </div>
    </div>
  );
}
