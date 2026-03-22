import { useRef } from "react";

const POSE_IMAGES = Array.from({ length: 24 }, (_, i) => ({
  src: `/images/pose-${i + 1}.png`,
  alt: `포즈/표정 변형 ${i + 1}`,
}));

export function PoseMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full overflow-hidden py-8 group">
      <div
        ref={trackRef}
        className="flex gap-6 animate-marquee group-hover:[animation-play-state:paused]"
        style={{ width: "max-content" }}
      >
        {/* 두 번 반복하여 끊김 없는 루프 */}
        {[...POSE_IMAGES, ...POSE_IMAGES].map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-muted border border-border"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
