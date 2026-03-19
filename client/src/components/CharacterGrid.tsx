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
  img1,
  img2,
  img3,
  img4,
  img5,
  img6,
  img7,
  img8,
  img9,
  img10,
  img11,
  img12,
  img13,
  img14,
  img15,
  img16,
  img17,
  img18,
  img19,
  img20,
];

gsap.registerPlugin(ScrollTrigger);

interface CharacterGridProps {
  theme: string;
}

export function CharacterGrid({ theme }: CharacterGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".character-card");

    // Stagger animation on scroll
    gsap.from(cards, {
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top center+=100",
        toggleActions: "play none none reverse",
      },
      y: 100,
      opacity: 0,
      scale: 0.8,
      rotation: -5,
      duration: 0.8,
      stagger: {
        amount: 1.5,
        from: "random",
      },
      ease: "back.out(1.2)",
    });

    // Parallax effect on individual cards
    cards.forEach((card) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        y: -30,
      });
    });
  }, []);

  return (
    <div ref={gridRef} className="relative">
      {/* Masonry-style grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {images.map((img, index) => (
          <div
            key={index}
            className={`character-card group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:scale-105 hover:z-10 ${
              index % 3 === 0 ? "md:row-span-2" : ""
            } ${index % 5 === 0 ? "lg:col-span-2" : ""}`}
          >
            {/* Glare effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(0, 229, 204, 0.3), transparent 60%)",
              }}
            />

            {/* Image */}
            <img
              src={img}
              alt={`Character ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Border on hover */}
            <div
              className={`absolute inset-0 border-4 border-transparent group-hover:border-[#00e5cc] transition-all duration-300 rounded-3xl`}
            />

            {/* Number badge */}
            <div
              className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg backdrop-blur-xl transition-all duration-300 ${
                theme === "dark"
                  ? "bg-black/50 text-white group-hover:bg-[#00e5cc] group-hover:text-black"
                  : "bg-white/50 text-gray-900 group-hover:bg-[#00e5cc] group-hover:text-white"
              }`}
            >
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Floating gradient orbs */}
      <div
        className={`absolute top-1/4 left-10 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
          theme === "dark" ? "bg-[#00e5cc]" : "bg-[#00e5cc]"
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-10 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-400"
        }`}
      />
    </div>
  );
}
