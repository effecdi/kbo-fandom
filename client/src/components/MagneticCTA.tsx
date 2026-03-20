import { useRef, useEffect } from "react";
import { Award, Rocket } from "lucide-react";

interface MagneticCTAProps {
  onButtonClick: () => void;
}

export function MagneticCTA({ onButtonClick }: MagneticCTAProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update CSS variables for gradient position
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);

      // Update glow position
      glow.style.transform = `translate(${x - glow.offsetWidth / 2}px, ${
        y - glow.offsetHeight / 2
      }px)`;
    };

    const handleMouseEnter = () => {
      if (glow) {
        glow.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      if (glow) {
        glow.style.opacity = "0";
      }
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative rounded-[4rem] p-20 md:p-32 text-center overflow-hidden border-2 bg-gradient-to-br from-muted to-card border-border shadow-2xl"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >

      {/* Radial gradient that follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(0, 229, 204, 0.15), rgba(59, 130, 246, 0.1), transparent 40%)`,
        }}
      />

      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-[-2px] bg-gradient-to-r from-[#00e5cc] via-blue-500 to-purple-600 rounded-[4rem] animate-spin-slow blur-sm" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 inline-block">
          <Award className="w-24 h-24 text-[#00e5cc] animate-bounce" />
        </div>
        <h2
          className="text-6xl md:text-8xl font-black mb-8 text-foreground"
        >
          지금 바로 시작하세요
        </h2>
        <p
          className="text-2xl md:text-3xl mb-12 max-w-3xl mx-auto text-muted-foreground"
        >
          무료 계정을 만들고 AI로 당신의 첫 작품을 완성하세요
        </p>
        <button
          onClick={onButtonClick}
          className="group/btn relative px-16 py-8 bg-gradient-to-r from-[#00e5cc] via-teal-500 to-blue-500 text-white font-black text-3xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#00e5cc]/50"
        >
          <span className="relative z-10 flex items-center gap-4">
            <Rocket className="w-8 h-8" />
            무료로 시작하기
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
        </button>
      </div>

      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
