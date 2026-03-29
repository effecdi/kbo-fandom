import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { RefreshCw } from "lucide-react";
import { getPlayerPhotoUrl } from "@/lib/local-store";
import type { GameRelayData } from "@/hooks/use-kbo-game-relay";

interface BaseballDiamondProps {
  relay: GameRelayData;
  homeColor?: string;
  awayColor?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Diamond field positions (percentage-based coordinates)
// Adjusted so catcher/batter aren't clipped at bottom
const FIELD_POSITIONS: Record<string, { x: number; y: number }> = {
  pitcher:   { x: 50, y: 54 },
  catcher:   { x: 50, y: 84 },
  first:     { x: 72, y: 58 },
  second:    { x: 62, y: 42 },
  third:     { x: 28, y: 58 },
  shortstop: { x: 38, y: 42 },
  left:      { x: 15, y: 24 },
  center:    { x: 50, y: 14 },
  right:     { x: 85, y: 24 },
};

// Korean position abbreviation labels
const POSITION_LABELS: Record<string, string> = {
  pitcher:   "투",
  catcher:   "포",
  first:     "1루",
  second:    "2루",
  third:     "3루",
  shortstop: "유격",
  left:      "좌익",
  center:    "중견",
  right:     "우익",
};

// Base positions
const BASE_POSITIONS = {
  first:  { x: 72, y: 62 },
  second: { x: 50, y: 40 },
  third:  { x: 28, y: 62 },
};

function PlayerNode({
  name,
  pcode,
  posLabel,
  x,
  y,
  isPitcher,
  isBatter,
  color,
}: {
  name: string;
  pcode?: string;
  posLabel?: string;
  x: number;
  y: number;
  isPitcher?: boolean;
  isBatter?: boolean;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
      );
    }
  }, [name]);

  // Reset error state when pcode changes
  useEffect(() => { setImgError(false); }, [pcode]);

  const showPhoto = pcode && !imgError;

  return (
    <div
      ref={ref}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Position label above circle */}
      {posLabel && !isPitcher && !isBatter && (
        <span className="text-[13px] font-bold text-white/50 leading-none">
          {posLabel}
        </span>
      )}
      <div className="relative">
        <div
          className={`w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-[13px] md:text-[13px] font-bold border-2 shadow-md ${
            isPitcher
              ? "border-red-400"
              : isBatter
                ? "border-yellow-400"
                : "border-white/40"
          }`}
          style={{ backgroundColor: color || "#374151" }}
        >
          {showPhoto ? (
            <img
              src={getPlayerPhotoUrl(pcode)}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            isPitcher ? "P" : isBatter ? "B" : name.slice(0, 1)
          )}
        </div>
        {/* P/B badge on photo */}
        {showPhoto && (isPitcher || isBatter) && (
          <span
            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black border border-white/60 ${
              isPitcher ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
            }`}
          >
            {isPitcher ? "P" : "B"}
          </span>
        )}
      </div>
      <span
        className={`text-[13px] md:text-[13px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap ${
          isPitcher
            ? "bg-red-500/90 text-white"
            : isBatter
              ? "bg-yellow-500/90 text-black"
              : "bg-black/60 text-white"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

function BaseRunner({ x, y }: { x: number; y: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { scale: 0 },
        { scale: 1, duration: 0.3, ease: "back.out(2)" },
      );
    }
  }, []);

  return (
    <div
      ref={ref}
      className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-400 border-2 border-yellow-300 shadow-lg z-20"
      style={{ left: `${x}%`, top: `${y}%` }}
    />
  );
}

function CountDisplay({
  count,
}: {
  count: { ball: number; strike: number; out: number };
}) {
  // Clamp values to valid ranges
  const ball = Math.min(Math.max(count.ball || 0, 0), 3);
  const strike = Math.min(Math.max(count.strike || 0, 0), 2);
  const out = Math.min(Math.max(count.out || 0, 0), 2);

  return (
    <div className="flex gap-2 text-[13px] md:text-[13px] font-bold">
      <div className="flex items-center gap-1">
        <span className="text-green-400">B</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
                i < ball ? "bg-green-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-yellow-400">S</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
                i < strike ? "bg-yellow-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-red-400">O</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
                i < out ? "bg-red-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BaseballDiamond({
  relay,
  homeColor = "#374151",
  awayColor = "#374151",
  onRefresh,
  isRefreshing,
}: BaseballDiamondProps) {
  const defColor = relay.isTopInning ? homeColor : awayColor;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#2d5a27] via-[#3a7233] to-[#2d5a27]">
      {/* Inning indicator - top left */}
      <div className="absolute top-2 left-2 z-30">
        <div className="bg-black/50 px-2 py-1 rounded-lg text-[13px] font-bold text-white">
          {relay.inning}회 {relay.isTopInning ? "초" : "말"}
        </div>
      </div>

      {/* Diamond field SVG */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0">
          {/* Field lines SVG */}
          <svg
            viewBox="0 0 200 180"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Outfield arc */}
            <path
              d="M 10,52 Q 100,-3 190,52"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.5"
            />

            {/* Infield diamond */}
            <polygon
              points="100,67 140,102 100,137 60,102"
              fill="rgba(139,90,43,0.35)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.8"
            />

            {/* Foul lines */}
            <line
              x1="100" y1="137" x2="10" y2="52"
              stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
            />
            <line
              x1="100" y1="137" x2="190" y2="52"
              stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
            />

            {/* Pitcher's mound */}
            <circle
              cx="100" cy="102" r="5"
              fill="rgba(139,90,43,0.5)"
              stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
            />

            {/* Bases */}
            <rect
              x="96" y="63" width="8" height="8"
              fill={relay.bases.second ? "#FBBF24" : "white"}
              transform="rotate(45, 100, 67)"
              opacity={relay.bases.second ? 1 : 0.6}
            />
            <rect
              x="136" y="98" width="8" height="8"
              fill={relay.bases.first ? "#FBBF24" : "white"}
              transform="rotate(45, 140, 102)"
              opacity={relay.bases.first ? 1 : 0.6}
            />
            <rect
              x="56" y="98" width="8" height="8"
              fill={relay.bases.third ? "#FBBF24" : "white"}
              transform="rotate(45, 60, 102)"
              opacity={relay.bases.third ? 1 : 0.6}
            />

            {/* Home plate */}
            <polygon
              points="97,135 100,132 103,135 103,138 97,138"
              fill="white"
              opacity="0.8"
            />
          </svg>

          {/* Defense players on field */}
          {Object.entries(relay.defense).map(([pos, player]) => {
            const coords = FIELD_POSITIONS[pos];
            if (!coords) return null;
            return (
              <PlayerNode
                key={`${pos}-${player.name}`}
                name={player.name}
                pcode={player.pcode}
                posLabel={POSITION_LABELS[pos]}
                x={coords.x}
                y={coords.y}
                isPitcher={pos === "pitcher"}
                color={defColor}
              />
            );
          })}

          {/* Batter at home plate */}
          {relay.currentBatter && (
            <PlayerNode
              name={relay.currentBatter.name}
              pcode={relay.currentBatter.pcode}
              x={42}
              y={86}
              isBatter
            />
          )}

          {/* Base runners */}
          {relay.bases.first && (
            <BaseRunner x={BASE_POSITIONS.first.x + 3} y={BASE_POSITIONS.first.y - 4} />
          )}
          {relay.bases.second && (
            <BaseRunner x={BASE_POSITIONS.second.x} y={BASE_POSITIONS.second.y - 4} />
          )}
          {relay.bases.third && (
            <BaseRunner x={BASE_POSITIONS.third.x - 3} y={BASE_POSITIONS.third.y - 4} />
          )}
        </div>
      </div>

      {/* Bottom info bar: Matchup + BSO Count + Refresh */}
      <div className="px-3 py-2.5 bg-black/40 border-t border-white/10">
        <div className="flex items-center justify-between gap-2">
          {/* Matchup info */}
          <div className="text-[13px] md:text-[13px] text-white/70">
            <span className="bg-red-500/80 text-white px-1.5 py-0.5 rounded font-bold mr-1">
              투
            </span>
            {relay.currentPitcher?.name || "-"}
            <span className="mx-1.5 text-white/40">vs</span>
            <span className="bg-blue-500/80 text-white px-1.5 py-0.5 rounded font-bold mr-1">
              타
            </span>
            {relay.currentBatter?.name || "-"}
          </div>

          <div className="flex items-center gap-2">
            {/* BSO Count */}
            <CountDisplay count={relay.count} />
            {/* Refresh button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                title="새로고침"
              >
                <RefreshCw
                  className={`w-4 h-4 text-white/70 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Batting order at bottom */}
      {relay.battingOrder.length > 0 && (
        <div className="px-3 py-2 bg-black/30 border-t border-white/10">
          <p className="text-[13px] text-white/50 mb-1 font-bold">
            {relay.isTopInning ? "원정" : "홈"} 타선
          </p>
          <div className="flex flex-wrap gap-1">
            {relay.battingOrder.slice(0, 9).map((b) => {
              const isCurrentBatter = relay.currentBatter?.name === b.name;
              return (
                <div
                  key={b.order}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[13px] md:text-[13px] ${
                    isCurrentBatter
                      ? "bg-yellow-500/90 text-black font-bold"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {b.pcode && (
                    <img
                      src={getPlayerPhotoUrl(b.pcode)}
                      alt={b.name}
                      className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                  {b.order}.{b.name}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
