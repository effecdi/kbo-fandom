import { useState } from "react";
import { Link } from "react-router";
import { Calendar } from "lucide-react";
import { LiveGameCarousel } from "./live-game-carousel";
import { LiveGameDetailPanel } from "./live-game-detail-panel";
import { GameLineupPanel } from "./game-lineup-panel";
import { EmojiReactions } from "./emoji-reactions";
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
  const { relay, isLoading: relayLoading } = useKboGameRelay(relayGameId, 10000);

  return (
    <div className="space-y-3">
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

        {/* Right: Detail panel (diamond / score / info) */}
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

      {/* Bottom bar: Emoji reactions + Schedule link */}
      <div className="flex items-center gap-3">
        {/* Emoji reactions */}
        <div className="flex-1 min-w-0">
          {selectedGame && (
            <EmojiReactions gameId={selectedGame.id} />
          )}
        </div>

        {/* Schedule shortcut */}
        <Link
          to="/fandom/schedule"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-sm font-bold text-foreground hover:bg-muted/80 transition-all border border-border"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">경기 일정</span>
        </Link>
      </div>
    </div>
  );
}
