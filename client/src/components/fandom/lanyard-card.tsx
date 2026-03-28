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
  height = 420,
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
      className="flex flex-col items-center justify-start pt-2"
      style={{ height, perspective: '800px' }}
    >
      {/* Lanyard string */}
      <div
        className="w-[3px] rounded-full"
        style={{
          height: 50,
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
          width: 200,
          height: 280,
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
          className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 rounded-full border-2 z-10"
          style={{ borderColor: '#999', backgroundColor: '#bbb' }}
        />

        {/* Card face */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: cardImageUrl
              ? `url(${cardImageUrl}) center/cover`
              : `linear-gradient(135deg, ${teamColor}, ${teamColor}CC, ${teamColor}88)`,
            boxShadow: `0 20px 60px ${teamColor}44, 0 8px 24px rgba(0,0,0,0.3)`,
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
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/20 px-4 py-1 rounded-full">
                <span className="text-[13px] font-bold tracking-wider">KBO FANDOM</span>
              </div>

              {/* Team circle */}
              <div
                className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-3"
              >
                <span className="text-[32px] font-black">{teamName.slice(0, 2)}</span>
              </div>

              {/* Team name */}
              <p className="text-2xl font-black tracking-tight">{teamName}</p>

              {/* Divider */}
              <div className="w-12 h-[1.5px] bg-white/25 my-2.5" />

              {/* Player name */}
              {playerName && (
                <p className="text-base font-bold opacity-85">{playerName}</p>
              )}

              {/* Bottom */}
              <p className="absolute bottom-4 text-[13px] opacity-30 tracking-widest">2026 SEASON</p>
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
