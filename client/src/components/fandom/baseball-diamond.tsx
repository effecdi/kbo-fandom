import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { GameRelayData } from "@/hooks/use-kbo-game-relay";

interface BaseballDiamondProps {
  relay: GameRelayData;
  homeColor?: string;
  awayColor?: string;
}

// Diamond field positions (percentage-based coordinates)
const FIELD_POSITIONS: Record<string, { x: number; y: number }> = {
  pitcher:   { x: 50, y: 52 },
  catcher:   { x: 50, y: 88 },
  first:     { x: 72, y: 56 },
  second:    { x: 62, y: 40 },
  third:     { x: 28, y: 56 },
  shortstop: { x: 38, y: 40 },
  left:      { x: 15, y: 22 },
  center:    { x: 50, y: 12 },
  right:     { x: 85, y: 22 },
};

// Base positions
const BASE_POSITIONS = {
  first:  { x: 72, y: 62 },
  second: { x: 50, y: 38 },
  third:  { x: 28, y: 62 },
};

function PlayerNode({
  name,
  x,
  y,
  isPitcher,
  isBatter,
  color,
}: {
  name: string;
  x: number;
  y: number;
  isPitcher?: boolean;
  isBatter?: boolean;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
      );
    }
  }, [name]);

  return (
    <div
      ref={ref}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-[13px] md:text-[13px] font-bold border-2 shadow-md ${
          isPitcher
            ? "border-red-400"
            : isBatter
              ? "border-yellow-400"
              : "border-white/40"
        }`}
        style={{ backgroundColor: color || "#374151" }}
      >
        {isPitcher ? "P" : isBatter ? "B" : name.slice(0, 1)}
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
}: BaseballDiamondProps) {
  const defColor = relay.isTopInning ? homeColor : awayColor;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#2d5a27] via-[#3a7233] to-[#2d5a27]">
      {/* BSO Count - top right */}
      <div className="absolute top-2 right-2 z-30">
        <CountDisplay count={relay.count} />
      </div>

      {/* Matchup info - top left */}
      <div className="absolute top-2 left-2 z-30">
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
      </div>

      {/* Diamond field SVG */}
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0">
          {/* Field lines SVG */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Outfield arc */}
            <path
              d="M 10,50 Q 100,-10 190,50"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.5"
            />

            {/* Infield diamond */}
            <polygon
              points="100,70 140,105 100,140 60,105"
              fill="rgba(139,90,43,0.35)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.8"
            />

            {/* Foul lines */}
            <line
              x1="100" y1="140" x2="10" y2="50"
              stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
            />
            <line
              x1="100" y1="140" x2="190" y2="50"
              stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
            />

            {/* Pitcher's mound */}
            <circle
              cx="100" cy="105" r="5"
              fill="rgba(139,90,43,0.5)"
              stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
            />

            {/* Bases */}
            <rect
              x="96" y="66" width="8" height="8"
              fill={relay.bases.second ? "#FBBF24" : "white"}
              transform="rotate(45, 100, 70)"
              opacity={relay.bases.second ? 1 : 0.6}
            />
            <rect
              x="136" y="101" width="8" height="8"
              fill={relay.bases.first ? "#FBBF24" : "white"}
              transform="rotate(45, 140, 105)"
              opacity={relay.bases.first ? 1 : 0.6}
            />
            <rect
              x="56" y="101" width="8" height="8"
              fill={relay.bases.third ? "#FBBF24" : "white"}
              transform="rotate(45, 60, 105)"
              opacity={relay.bases.third ? 1 : 0.6}
            />

            {/* Home plate */}
            <polygon
              points="97,138 100,135 103,138 103,141 97,141"
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
              x={42}
              y={90}
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
                  className={`px-1.5 py-0.5 rounded text-[13px] md:text-[13px] ${
                    isCurrentBatter
                      ? "bg-yellow-500/90 text-black font-bold"
                      : "bg-white/10 text-white/70"
                  }`}
                >
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
