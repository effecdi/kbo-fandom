import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

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
  img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15, img16, img17, img18, img19, img20
];

export function DomeGallery({ theme }: { theme: string }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentRotation = useRef(0);

  useEffect(() => {
    if (!galleryRef.current) return;

    const items = galleryRef.current.querySelectorAll(".dome-item");
    const radius = 400;
    const angleStep = (2 * Math.PI) / images.length;

    items.forEach((item, index) => {
      const angle = angleStep * index;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - radius;
      const rotateY = -angle * (180 / Math.PI);

      gsap.set(item, {
        x: x,
        z: z,
        rotateY: rotateY,
      });
    });

    // Auto-rotate
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isDragging]);

  useEffect(() => {
    if (!galleryRef.current) return;

    const angleStep = 360 / images.length;
    const targetRotation = -currentIndex * angleStep;

    gsap.to(galleryRef.current, {
      rotateY: targetRotation,
      duration: 1,
      ease: "power2.out",
    });

    currentRotation.current = targetRotation;
  }, [currentIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !galleryRef.current) return;

    const deltaX = e.clientX - startX.current;
    const rotationDelta = deltaX * 0.5;
    const newRotation = currentRotation.current + rotationDelta;

    gsap.to(galleryRef.current, {
      rotateY: newRotation,
      duration: 0.1,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: "1000px" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={galleryRef}
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="dome-item absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="w-64 h-64 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 bg-card border-2 border-border"
              >
                <img
                  src={img}
                  alt={`Character ${index + 1}`}
                  className="w-full h-full object-contain p-4"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-[#00e5cc] w-8"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}