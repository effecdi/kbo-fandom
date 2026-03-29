import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import type { KboGameSchedule, KboTeam } from "@/lib/local-store";
import { TeamLogo } from "./team-logo";

interface LiveGameCarouselProps {
  games: KboGameSchedule[];
  teams: KboTeam[];
  myTeamId?: string;
  onActiveIndexChange?: (index: number) => void;
  compact?: boolean;
}

const STATUS_CONFIG: Record<
  KboGameSchedule["status"],
  { label: string; color: string; badgeClass: string }
> = {
  live: { label: "LIVE", color: "#EF4444", badgeClass: "bg-red-500" },
  scheduled: { label: "예정", color: "#3B82F6", badgeClass: "bg-blue-500" },
  finished: { label: "종료", color: "#6B7280", badgeClass: "bg-gray-500" },
  postponed: { label: "연기", color: "#F59E0B", badgeClass: "bg-amber-500" },
};

/**
 * Determine responsive x-offsets based on window width.
 * On smaller screens (< 768px / md breakpoint), offsets are reduced by ~30%.
 */
function getOffsets(compact = false): { adj: number; far: number; hidden: number } {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;
  if (compact) {
    return isMobile
      ? { adj: 150, far: 270, hidden: 360 }
      : { adj: 200, far: 360, hidden: 480 };
  }
  if (isMobile) {
    return { adj: 182, far: 322, hidden: 420 };
  }
  return { adj: 260, far: 460, hidden: 600 };
}

export function LiveGameCarousel({
  games,
  teams,
  myTeamId,
  onActiveIndexChange,
  compact = false,
}: LiveGameCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, isDragging: false });
  const initializedRef = useRef(false);

  // Stable game ID list to detect actual game list changes (not just reference changes from polling)
  const gameIds = useMemo(() => games.map((g) => g.id).join(","), [games]);

  // ── Find initial index based on myTeamId (only on first load or when game list actually changes) ──
  useEffect(() => {
    if (initializedRef.current) return; // already initialized, keep user selection
    if (myTeamId && games.length > 0) {
      const idx = games.findIndex(
        (g) => g.homeTeamId === myTeamId || g.awayTeamId === myTeamId,
      );
      if (idx >= 0) {
        setActiveIndex(idx);
        onActiveIndexChange?.(idx);
        animateCards(idx, false);
      }
      initializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTeamId, gameIds]);

  // ── GSAP animation ──────────────────────────────────────────────────────────
  const animateCards = useCallback(
    (targetIndex: number, animate = true) => {
      const offsets = getOffsets(compact);

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const diff = i - targetIndex;
        const absDiff = Math.abs(diff);
        const sign = diff < 0 ? -1 : 1;

        let x: number;
        let scale: number;
        let opacity: number;
        let grayscale: number;
        let zIndex: number;

        if (absDiff === 0) {
          // Center (active)
          x = 0;
          scale = 1;
          opacity = 1;
          grayscale = 0;
          zIndex = 10;
        } else if (absDiff === 1) {
          // Adjacent
          x = sign * offsets.adj;
          scale = 0.85;
          opacity = 0.6;
          grayscale = 1;
          zIndex = 5;
        } else if (absDiff === 2) {
          // Far
          x = sign * offsets.far;
          scale = 0.7;
          opacity = 0.3;
          grayscale = 1;
          zIndex = 2;
        } else {
          // Hidden
          x = sign * offsets.hidden;
          scale = 0.6;
          opacity = 0;
          grayscale = 1;
          zIndex = 0;
        }

        const props: gsap.TweenVars = {
          x,
          scale,
          opacity,
          zIndex,
          filter: `grayscale(${grayscale})`,
          duration: animate ? 0.5 : 0,
          ease: "power2.out",
          overwrite: true,
        };

        gsap.to(card, props);
      });
    },
    [games.length],
  );

  // ── Animate whenever activeIndex changes ────────────────────────────────────
  useEffect(() => {
    if (games.length > 0) {
      animateCards(activeIndex);
    }
  }, [activeIndex, animateCards, games.length]);

  // ── Cleanup GSAP on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cardRefs.current.forEach((card) => {
        if (card) gsap.killTweensOf(card);
      });
    };
  }, []);

  // ── Re-animate on window resize (responsive offset changes) ─────────────────
  useEffect(() => {
    const handleResize = () => {
      animateCards(activeIndex, false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex, animateCards]);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= games.length) return;
      setActiveIndex(index);
      onActiveIndexChange?.(index);
    },
    [games.length, onActiveIndexChange],
  );

  const goNext = useCallback(() => {
    if (activeIndex < games.length - 1) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      onActiveIndexChange?.(next);
    }
  }, [activeIndex, games.length, onActiveIndexChange]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      const prev = activeIndex - 1;
      setActiveIndex(prev);
      onActiveIndexChange?.(prev);
    }
  }, [activeIndex, onActiveIndexChange]);

  // ── Pointer / drag handlers ─────────────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragRef.current.startX = e.clientX;
      dragRef.current.isDragging = true;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (_e: React.PointerEvent<HTMLDivElement>) => {
      // We only track move to keep pointer captured; actual navigation
      // happens on pointerup based on delta.
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.isDragging) return;
      dragRef.current.isDragging = false;

      const deltaX = e.clientX - dragRef.current.startX;
      if (deltaX > 50) {
        goPrev();
      } else if (deltaX < -50) {
        goNext();
      }
    },
    [goNext, goPrev],
  );

  // ── Helper: get team data ───────────────────────────────────────────────────
  const getTeam = (teamId: string): KboTeam | undefined =>
    teams.find((t) => t.id === teamId);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (games.length === 0) {
    return (
      <div className={`relative py-4 flex items-center justify-center ${compact ? "h-[220px] md:h-[260px]" : "h-[220px] md:h-[260px]"}`}>
        <p className="text-sm text-muted-foreground">
          오늘 예정된 경기가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="relative py-4">
      {/* ── Carousel container ────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`relative mx-auto ${compact ? "h-[220px] md:h-[260px] overflow-hidden" : "h-[220px] md:h-[260px] max-w-4xl overflow-hidden"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "pan-y" }}
      >
        {games.map((game, index) => {
          const homeTeam = getTeam(game.homeTeamId);
          const awayTeam = getTeam(game.awayTeamId);
          const isActive = index === activeIndex;
          const statusCfg = STATUS_CONFIG[game.status];

          // Card background: center card uses bold home team color, side cards are dark gray
          const cardBg: React.CSSProperties = isActive
            ? {
                background: `linear-gradient(135deg, ${homeTeam?.coverColor || "#27272a"} 0%, ${homeTeam?.coverColor || "#27272a"} 60%, ${homeTeam?.secondaryColor || "#18181b"} 100%)`,
                boxShadow: `0 8px 32px ${homeTeam?.coverColor || "#000"}60, 0 0 0 2px ${homeTeam?.coverColor || "#fff"}40`,
              }
            : { backgroundColor: "#27272a" };

          return (
            <div
              key={game.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-4 md:p-5 cursor-pointer select-none ${compact ? "w-[260px] md:w-[300px]" : "w-[280px] md:w-[320px]"}`}
              style={{
                ...cardBg,
                opacity: 0,
                willChange: "transform, opacity, filter",
              }}
              onClick={() => {
                if (!isActive) goToSlide(index);
              }}
            >
              {/* ── Status badge ─────────────────────────────────────────── */}
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[13px] font-bold text-white ${statusCfg.badgeClass}`}
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
                  <span className="text-[13px] font-semibold text-white/80">
                    {game.inning}
                  </span>
                )}
              </div>

              {/* ── Teams + Score row ────────────────────────────────────── */}
              <div className="flex items-center justify-between gap-3">
                {/* Home team */}
                <div className="flex-1 text-center">
                  <div className="mx-auto mb-1.5 w-11 h-11 md:w-12 md:h-12">
                    <TeamLogo team={homeTeam} teamName={game.homeTeamName} size="lg" className="border-2 border-white/20 mx-auto" />
                  </div>
                  <p
                    className={`font-bold text-white truncate ${isActive ? "text-[13px]" : "text-[13px]"}`}
                  >
                    {game.homeTeamName}
                  </p>
                </div>

                {/* Score / VS */}
                <div className="text-center min-w-[60px]">
                  {game.status === "finished" || game.status === "live" ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={`font-black text-white ${isActive ? "text-3xl" : "text-xl"}`}
                      >
                        {game.homeScore ?? 0}
                      </span>
                      <span className="text-sm text-white/50 font-bold">
                        :
                      </span>
                      <span
                        className={`font-black text-white ${isActive ? "text-3xl" : "text-xl"}`}
                      >
                        {game.awayScore ?? 0}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`font-bold text-white/60 ${isActive ? "text-xl" : "text-base"}`}
                    >
                      VS
                    </span>
                  )}
                </div>

                {/* Away team */}
                <div className="flex-1 text-center">
                  <div className="mx-auto mb-1.5 w-11 h-11 md:w-12 md:h-12">
                    <TeamLogo team={awayTeam} teamName={game.awayTeamName} size="lg" className="border-2 border-white/20 mx-auto" />
                  </div>
                  <p
                    className={`font-bold text-white truncate ${isActive ? "text-[13px]" : "text-[13px]"}`}
                  >
                    {game.awayTeamName}
                  </p>
                </div>
              </div>

              {/* ── Stadium + Time ───────────────────────────────────────── */}
              <div className="flex items-center justify-between mt-3 md:mt-4 text-[13px] text-white/60">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">
                    {game.stadium}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{game.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop arrow buttons ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={goPrev}
        disabled={activeIndex === 0}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="이전 경기"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={activeIndex === games.length - 1}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="다음 경기"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── Dot indicators ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {games.map((game, index) => {
          const isActiveDot = index === activeIndex;
          const homeTeam = getTeam(game.homeTeamId);
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`경기 ${index + 1}로 이동`}
              className={`rounded-full transition-all duration-300 ${
                isActiveDot
                  ? "w-6 h-2"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              style={
                isActiveDot
                  ? { backgroundColor: homeTeam?.coverColor || "hsl(var(--primary))" }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
