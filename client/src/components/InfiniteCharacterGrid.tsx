import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 기존 이미지
const img1 = "/favicon.png";
const img2 = "/favicon.png";
const img3 = "/favicon.png";
const img4 = "/favicon.png";
const img5 = "/favicon.png";
const img6 = "/favicon.png";
const img7 = "/favicon.png";
const img8 = "/favicon.png";
const img9 = "/favicon.png";
const img10 = "/favicon.png";

// 새로운 이미지
const img11 = "/favicon.png";
const img12 = "/favicon.png";
const img13 = "/favicon.png";
const img14 = "/favicon.png";
const img15 = "/favicon.png";
const img16 = "/favicon.png";
const img17 = "/favicon.png";
const img18 = "/favicon.png";
const img19 = "/favicon.png";
const img20 = "/favicon.png";

const images = [
  img1, img2, img3, img4, img5,
  img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15,
  img16, img17, img18, img19, img20,
];

gsap.registerPlugin(ScrollTrigger);

interface InfiniteCharacterGridProps {
  theme: string;
}

export function InfiniteCharacterGrid({ theme }: InfiniteCharacterGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current || !containerRef.current) return;

    const cards = gridRef.current.querySelectorAll(".char-card");

    // Entrance animation
    gsap.from(cards, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top center+=100",
        toggleActions: "play none none reverse",
      },
      opacity: 0,
      scale: 0.5,
      rotationY: -45,
      z: -500,
      duration: 1,
      stagger: {
        amount: 1.2,
        from: "random",
      },
      ease: "power3.out",
    });

    // Continuous wave animation
    cards.forEach((card, i) => {
      const row = Math.floor(i / 5);
      const col = i % 5;

      gsap.to(card, {
        y: Math.sin((row + col) * 0.5) * 20,
        rotationX: Math.sin((row + col) * 0.3) * 5,
        rotationY: Math.cos((row + col) * 0.4) * 5,
        duration: 3 + (i % 3),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: (row + col) * 0.1,
      });
    });

    // Mouse move parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

      gsap.to(gridRef.current, {
        rotationY: x * 15,
        rotationX: -y * 15,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(gridRef.current, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    containerRef.current?.addEventListener("mousemove", handleMouseMove);
    containerRef.current?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      containerRef.current?.removeEventListener("mousemove", handleMouseMove);
      containerRef.current?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        perspective: "1500px",
        perspectiveOrigin: "center center",
      }}
    >
      {/* 3D Grid Container */}
      <div
        ref={gridRef}
        className="relative grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 p-8"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {images.map((img, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;

          return (
            <div
              key={index}
              className="char-card group relative cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transform: `translateZ(${Math.sin(row + col) * 50}px)`,
              }}
            >
              {/* Card wrapper with 3D effect */}
              <div
                className={`relative w-full aspect-[3/4] rounded-3xl overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:z-50 ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl shadow-[#00e5cc]/20"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl shadow-black/20"
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${Math.sin((row + col) * 0.3) * 3}deg) rotateY(${Math.cos((row + col) * 0.4) * 3}deg)`,
                }}
              >
                {/* Image */}
                <img
                  src={img}
                  alt={`Character ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                  style={{
                    filter: theme === "dark" ? "grayscale(0.2) contrast(1.1)" : "grayscale(0.1)",
                  }}
                />

                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(circle at 50% 50%, rgba(0, 229, 204, 0.3), rgba(59, 130, 246, 0.2), transparent 70%)",
                  }}
                />

                {/* Glowing border */}
                <div
                  className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 border-2 ${
                    theme === "dark" ? "border-[#00e5cc]" : "border-blue-500"
                  }`}
                  style={{
                    boxShadow: theme === "dark"
                      ? "0 0 30px rgba(0, 229, 204, 0.5), inset 0 0 30px rgba(0, 229, 204, 0.1)"
                      : "0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 30px rgba(59, 130, 246, 0.1)",
                  }}
                />

                {/* Number badge */}
                <div
                  className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm backdrop-blur-xl transition-all duration-500 group-hover:scale-125 ${
                    theme === "dark"
                      ? "bg-black/60 text-white border border-white/20 group-hover:bg-[#00e5cc] group-hover:text-black group-hover:border-[#00e5cc]"
                      : "bg-white/60 text-foreground border border-border group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500"
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(30px)",
                  }}
                >
                  {index + 1}
                </div>

                {/* 3D depth indicator */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg,
                      rgba(0, 0, 0, ${0.3 - (row + col) * 0.02}) 0%,
                      rgba(255, 255, 255, ${0.1 + (row + col) * 0.01}) 100%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ambient light effects */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #00e5cc, transparent 70%)",
          transform: "translateZ(-200px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #3b82f6, transparent 70%)",
          transform: "translateZ(-200px)",
        }}
      />
    </div>
  );
}
