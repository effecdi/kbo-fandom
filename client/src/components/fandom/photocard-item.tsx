import { Heart, ArrowRightLeft } from "lucide-react";
import type { PhotocardItem } from "@/lib/local-store";

const RARITY_CONFIG: Record<
  PhotocardItem["rarity"],
  { letter: string; label: string; color: string; bg: string; star?: boolean }
> = {
  common: { letter: "C", label: "Common", color: "text-gray-300", bg: "bg-gray-500/30" },
  rare: { letter: "R", label: "Rare", color: "text-blue-400", bg: "bg-blue-500/25" },
  epic: { letter: "E", label: "Epic", color: "text-purple-400", bg: "bg-purple-500/25" },
  legendary: { letter: "L", label: "Legendary", color: "text-yellow-400", bg: "bg-yellow-500/25", star: true },
};

interface PhotocardItemCardProps {
  card: PhotocardItem;
  teamColor?: string;
  onLike?: (id: string) => void;
}

function getFrameStyle(
  frameType: string,
  teamColor: string,
): React.CSSProperties {
  switch (frameType) {
    case "holographic":
      return {
        border: "2px solid transparent",
        background: `linear-gradient(#1a1a2e, #1a1a2e) padding-box, linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #8a2be2, #ff0080) border-box`,
        borderRadius: "12px",
      };
    case "neon":
      return {
        border: `2px solid ${teamColor}`,
        boxShadow: `0 0 8px ${teamColor}80, 0 0 16px ${teamColor}40, inset 0 0 8px ${teamColor}15`,
        borderRadius: "12px",
      };
    case "vintage":
      return {
        border: "3px solid #a08060",
        borderRadius: "16px",
        boxShadow: "inset 0 0 20px rgba(160, 128, 96, 0.1)",
      };
    case "player-card":
      return {
        border: "2px solid",
        borderColor: `${teamColor}60`,
        borderRadius: "12px",
      };
    case "polaroid":
      return {
        border: "2px solid rgba(255,255,255,0.15)",
        borderRadius: "8px",
      };
    default:
      // basic
      return {
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
      };
  }
}

export function PhotocardItemCard({ card, teamColor = "#666", onLike }: PhotocardItemCardProps) {
  const rarity = RARITY_CONFIG[card.rarity];
  const frameStyle = getFrameStyle(card.frameType, teamColor);
  const initials = (card.playerName || card.teamName || "??").slice(0, 2);

  return (
    <div
      className="group relative flex flex-col bg-card overflow-hidden transition-transform duration-200 hover:scale-[1.03]"
      style={frameStyle}
    >
      {/* Player-card gradient header strip */}
      {card.frameType === "player-card" && (
        <div
          className="h-6 w-full flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${teamColor}, ${teamColor}80)`,
          }}
        />
      )}

      {/* Image area - 2:3 aspect ratio */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {/* Gradient placeholder */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(145deg, ${teamColor}30, ${teamColor}10, ${teamColor}25)`,
          }}
        >
          <span
            className="text-3xl font-black opacity-30 select-none"
            style={{ color: teamColor }}
          >
            {initials}
          </span>
        </div>

        {/* Rarity badge - top right */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${rarity.color} ${rarity.bg} backdrop-blur-sm`}
          >
            {rarity.star ? "\u2605" : ""}
            {rarity.letter}
          </span>
        </div>

        {/* Trade badge - top left */}
        {card.isForTrade && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 backdrop-blur-sm">
              <ArrowRightLeft className="w-3 h-3" />
              거래 가능
            </span>
          </div>
        )}

        {/* Vintage sepia overlay */}
        {card.frameType === "vintage" && (
          <div className="absolute inset-0 bg-amber-900/10 pointer-events-none" />
        )}
      </div>

      {/* Bottom info section */}
      <div
        className={`p-3 space-y-2 ${
          card.frameType === "polaroid" ? "pb-5 bg-white/5" : ""
        }`}
      >
        {/* Title */}
        <h3 className="text-sm font-bold text-foreground truncate">
          {card.title}
        </h3>

        {/* Player name + Team badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {card.playerName && (
            <span className="text-xs text-muted-foreground truncate">
              {card.playerName}
            </span>
          )}
          <span
            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-white/90"
            style={{ backgroundColor: `${teamColor}80` }}
          >
            {card.teamName}
          </span>
        </div>

        {/* Owner + Like */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground truncate max-w-[60%]">
            @{card.ownerName}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(card.id);
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                card.liked
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
            <span className={card.liked ? "text-red-400" : ""}>
              {card.likes}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
