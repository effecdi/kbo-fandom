import { useRef, useState, useEffect, useCallback } from 'react';

interface LanyardCardProps {
  teamColor?: string;
  teamName?: string;
  playerName?: string;
  cardImageUrl?: string;
  height?: number;
}

export default function LanyardCard({
  teamColor = '#7B2FF7',
  teamName = 'KBO',
  playerName,
  cardImageUrl,
  height = 360,
}: LanyardCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swingDeg, setSwingDeg] = useState(0);

  // Idle swing animation
  useEffect(() => {
    if (isDragging) return;
    let frame: number;
    let t = 0;
    const animate = () => {
      t += 0.02;
      setSwingDeg(Math.sin(t) * 3);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isDragging]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (e.clientX - cx) / (rect.width / 2);
    const y = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: y * -15, y: x * 15 });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const rotateX = isDragging ? tilt.x : swingDeg * 0.5;
  const rotateY = isDragging ? tilt.y : swingDeg;

  return (
    <div
      className="flex flex-col items-center justify-start"
      style={{ height, perspective: '800px' }}
    >
      {/* Lanyard string */}
      <div
        className="w-[2px] rounded-full"
        style={{
          height: 40,
          background: `linear-gradient(180deg, ${teamColor}88, ${teamColor})`,
          transformOrigin: 'top center',
          transform: `rotateZ(${swingDeg * 0.3}deg)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      />

      {/* Card */}
      <div
        ref={cardRef}
        className="relative cursor-grab active:cursor-grabbing select-none"
        style={{
          width: 180,
          height: 252,
          transformOrigin: 'top center',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${swingDeg * 0.5}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
        }}
        onPointerMove={handlePointerMove}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerLeave={handlePointerLeave}
      >
        {/* Clip */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3.5 h-3.5 rounded-full border-2 z-10"
          style={{ borderColor: '#999', backgroundColor: '#bbb' }}
        />

        {/* Card face */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: cardImageUrl
              ? `url(${cardImageUrl}) center/cover`
              : `linear-gradient(135deg, ${teamColor}, ${teamColor}CC, ${teamColor}88)`,
            boxShadow: `0 16px 48px ${teamColor}44, 0 6px 20px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Only show generated content when no custom image */}
          {!cardImageUrl && (
            <div className="relative flex flex-col items-center justify-center h-full text-white px-4">
              {/* Scan lines overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)',
              }} />

              {/* Top badge */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 bg-black/20 px-3.5 py-0.5 rounded-full">
                <span className="text-[13px] font-bold tracking-wider">KBO FANDOM</span>
              </div>

              {/* Plus icon */}
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>

              {/* CTA text */}
              <p className="text-[13px] font-bold text-white/80 text-center leading-snug">
                카드를 생성해서<br />넣어주세요
              </p>

              {/* Bottom */}
              <p className="absolute bottom-3.5 text-[13px] opacity-30 tracking-widest">2026</p>
            </div>
          )}

          {/* 변경 badge when image exists */}
          {cardImageUrl && (
            <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
              <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
              </svg>
              <span className="text-[13px] font-bold text-white/80">변경</span>
            </div>
          )}

          {/* Holographic shine effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(${105 + tilt.y * 2}deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)`,
              transition: isDragging ? 'none' : 'background 0.3s ease-out',
            }}
          />
        </div>

        {/* Card back (visible when flipped) */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${teamColor}DD, ${teamColor}66)`,
          }}
        />
      </div>
    </div>
  );
}
