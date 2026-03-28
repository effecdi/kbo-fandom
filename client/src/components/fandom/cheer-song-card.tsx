import { useState } from "react";
import { Music, ChevronDown, ChevronUp, User } from "lucide-react";
import type { CheerSong } from "@/lib/local-store";

const TYPE_CONFIG: Record<CheerSong["type"], { label: string; color: string; bg: string }> = {
  team: { label: "구단가", color: "text-blue-400", bg: "bg-blue-500/15" },
  player: { label: "선수 응원가", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  situation: { label: "상황별", color: "text-amber-400", bg: "bg-amber-500/15" },
};

interface CheerSongCardProps {
  song: CheerSong;
  teamColor: string;
}

export function CheerSongCard({ song, teamColor }: CheerSongCardProps) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = TYPE_CONFIG[song.type];

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/15 transition-all border-l-4"
      style={{ borderLeftColor: teamColor }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Music className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <h3 className="text-sm font-bold text-foreground truncate">
              {song.title}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[13px] font-bold ${typeInfo.color} ${typeInfo.bg}`}
            >
              {typeInfo.label}
            </span>
          </div>

          {/* Player name (for player songs) */}
          {song.type === "player" && song.playerName && (
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mt-1">
              <User className="w-3 h-3" />
              <span>{song.playerName}</span>
            </div>
          )}
        </div>

        {/* Expand/Collapse toggle */}
        <div className="flex-shrink-0 mt-0.5">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable lyrics section */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {song.lyrics}
            </p>
          </div>

          {/* Description */}
          {song.description && (
            <p className="text-[13px] text-muted-foreground px-1">
              {song.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
