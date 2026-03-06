import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { TOUR_STEPS, type TourStep } from "@/lib/tour-steps";
import { ChevronLeft, ChevronRight, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Context ──────────────────────────────────────────────

interface TourContextValue {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within SpotlightTourProvider");
  return ctx;
}

const STORAGE_KEY = "olli_tour_completed";

// ─── Provider ─────────────────────────────────────────────

export function SpotlightTourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [, navigate] = useLocation();

  const currentStep = isActive ? TOUR_STEPS[stepIndex] ?? null : null;

  const startTour = useCallback(() => {
    setStepIndex(0);
    setIsActive(true);
    const firstStep = TOUR_STEPS[0];
    if (firstStep) {
      navigate(firstStep.page);
    }
  }, [navigate]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setStepIndex(0);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  }, []);

  const nextStep = useCallback(() => {
    const next = stepIndex + 1;
    if (next >= TOUR_STEPS.length) {
      endTour();
      return;
    }
    setStepIndex(next);
    const nextStepData = TOUR_STEPS[next];
    if (nextStepData && nextStepData.page !== TOUR_STEPS[stepIndex]?.page) {
      navigate(nextStepData.page);
    }
  }, [stepIndex, navigate, endTour]);

  const prevStep = useCallback(() => {
    const prev = stepIndex - 1;
    if (prev < 0) return;
    setStepIndex(prev);
    const prevStepData = TOUR_STEPS[prev];
    if (prevStepData && prevStepData.page !== TOUR_STEPS[stepIndex]?.page) {
      navigate(prevStepData.page);
    }
  }, [stepIndex, navigate]);

  const value: TourContextValue = {
    isActive,
    currentStepIndex: stepIndex,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    startTour,
    nextStep,
    prevStep,
    endTour,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {isActive && <SpotlightOverlay />}
    </TourContext.Provider>
  );
}

// ─── Overlay ──────────────────────────────────────────────

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function SpotlightOverlay() {
  const { currentStep, currentStepIndex, totalSteps, nextStep, prevStep, endTour } =
    useTour();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const rafRef = useRef<number>(0);

  const TOOLTIP_W = 340;
  const GAP = 16;
  const EDGE_PAD = 12;

  // ── compute tooltip position with viewport clamping ──────
  const computeTooltipPosition = useCallback(
    (rect: Rect, position: TourStep["position"]) => {
      const tooltipH = tooltipRef.current?.offsetHeight ?? 220;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = 0;
      let left = 0;
      let resolvedPos = position;

      // Auto-flip if not enough space
      if (resolvedPos === "bottom" && rect.top + rect.height + GAP + tooltipH > vh) {
        resolvedPos = "top";
      }
      if (resolvedPos === "top" && rect.top - GAP - tooltipH < 0) {
        resolvedPos = "bottom";
      }

      switch (resolvedPos) {
        case "bottom":
          top = rect.top + rect.height + GAP;
          left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
          break;
        case "top":
          top = rect.top - GAP - tooltipH;
          left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipH / 2;
          left = rect.left + rect.width + GAP;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipH / 2;
          left = rect.left - TOOLTIP_W - GAP;
          break;
      }

      // Clamp horizontal
      left = Math.max(EDGE_PAD, Math.min(left, vw - TOOLTIP_W - EDGE_PAD));
      // Clamp vertical
      top = Math.max(EDGE_PAD, Math.min(top, vh - tooltipH - EDGE_PAD));

      setTooltipPos({ top, left });
    },
    [],
  );

  // ── locate target element ────────────────────────────────
  const measureAndSet = useCallback(
    (el: HTMLElement) => {
      if (!currentStep) return;
      const pad = currentStep.spotlightPadding ?? 8;
      const r = el.getBoundingClientRect();
      const rect: Rect = {
        top: r.top - pad,
        left: r.left - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      };
      setTargetRect(rect);
      requestAnimationFrame(() => {
        computeTooltipPosition(rect, currentStep.position);
      });
    },
    [currentStep, computeTooltipPosition],
  );

  const locateTarget = useCallback(() => {
    if (!currentStep) return;

    const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const inView =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth;

    if (!inView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        measureAndSet(el);
      }, 400);
    } else {
      measureAndSet(el);
    }
  }, [currentStep, measureAndSet]);

  // ── watch for target element to appear ───────────────────
  useEffect(() => {
    const timeout = setTimeout(() => {
      locateTarget();
    }, 300);

    observerRef.current = new MutationObserver(() => {
      if (!currentStep) return;
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        locateTarget();
        observerRef.current?.disconnect();
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(locateTarget);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      clearTimeout(timeout);
      observerRef.current?.disconnect();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [currentStep, locateTarget]);

  // ── re-calc position after tooltip renders ──
  useEffect(() => {
    if (targetRect && currentStep) {
      requestAnimationFrame(() => {
        computeTooltipPosition(targetRect, currentStep.position);
      });
    }
  }, [currentStepIndex]);

  // ── keyboard shortcuts ───────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [endTour, nextStep, prevStep]);

  if (!currentStep) return null;

  const maskId = "spotlight-mask";
  const svgMask = targetRect ? (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 9999 }}
    >
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <motion.rect
            initial={false}
            animate={{
              x: targetRect.left,
              y: targetRect.top,
              width: targetRect.width,
              height: targetRect.height,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            rx="12"
            ry="12"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.7)"
        mask={`url(#${maskId})`}
      />
    </svg>
  ) : (
    <div
      className="fixed inset-0 bg-black/70"
      style={{ zIndex: 9999 }}
    />
  );

  return createPortal(
    <>
      {svgMask}

      {/* Click catcher */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9999, pointerEvents: "none" }}
      />

      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          ref={tooltipRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            top: tooltipPos.top,
            left: tooltipPos.left,
            width: TOOLTIP_W,
            maxWidth: `calc(100vw - ${EDGE_PAD * 2}px)`,
            maxHeight: `calc(100vh - ${EDGE_PAD * 2}px)`,
            zIndex: 10000,
          }}
          className="bg-background border border-border rounded-xl shadow-2xl overflow-auto"
        >
          {/* Video player */}
          {currentStep.videoUrl && <VideoPlayer url={currentStep.videoUrl} />}

          <div className="p-5 space-y-3">
            <h3 className="font-bold text-base leading-tight">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              <span className="text-xs text-muted-foreground tabular-nums">
                {currentStepIndex + 1} / {totalSteps}
              </span>

              <Button
                variant="default"
                size="sm"
                onClick={nextStep}
                className="gap-1"
              >
                {currentStepIndex === totalSteps - 1 ? "완료" : "다음"}
                {currentStepIndex < totalSteps - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            <button
              onClick={endTour}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
            >
              건너뛰기
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Close button (top-right) */}
      <button
        onClick={endTour}
        className="fixed top-4 right-4 p-2 rounded-full bg-background/90 border border-border shadow-lg hover:bg-background transition-colors"
        style={{ zIndex: 10001 }}
        aria-label="투어 닫기"
      >
        <X className="h-5 w-5" />
      </button>
    </>,
    document.body,
  );
}

// ─── Video Player ─────────────────────────────────────────

function VideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative bg-black aspect-video">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        playsInline
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
      >
        {playing ? (
          <Pause className="h-10 w-10 text-white/90" />
        ) : (
          <Play className="h-10 w-10 text-white/90" />
        )}
      </button>
    </div>
  );
}
