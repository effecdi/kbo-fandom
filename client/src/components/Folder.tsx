import { useState, useCallback } from "react";

function darkenColor(hex: string, percent: number): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const darken = (value: number) =>
    Math.max(0, Math.min(255, Math.floor(value * (1 - percent / 100))));
  return `#${darken(r).toString(16).padStart(2, "0")}${darken(g).toString(16).padStart(2, "0")}${darken(b).toString(16).padStart(2, "0")}`;
}

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  label?: string;
  className?: string;
}

export function Folder({
  color = "#00e5cc",
  size = 1,
  items = [],
  label,
  className = "",
}: FolderProps) {
  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(
    Array(3).fill({ x: 0, y: 0 })
  );

  const maxItems = 3;
  const papers = [...items.slice(0, maxItems)];
  while (papers.length < maxItems) papers.push(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!open) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = (e.clientX - centerX) * 0.15;
      const offsetY = (e.clientY - centerY) * 0.15;
      setPaperOffsets(Array(3).fill({ x: offsetX, y: offsetY }));
    },
    [open]
  );

  const handleMouseEnter = useCallback(() => {
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpen(false);
    setPaperOffsets(Array(3).fill({ x: 0, y: 0 }));
  }, []);

  const folderColor = color;
  const backColor = darkenColor(color, 15);

  const baseWidth = 100 * size;
  const baseHeight = 80 * size;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          cursor: "pointer",
          transition: "all 0.2s ease-in",
          transform: open ? "translateY(-8px)" : undefined,
          width: baseWidth,
          height: baseHeight,
        }}
      >
        {/* Papers */}
        {papers.map((item, i) => {
          const paperBg =
            i === 0 ? "#e6e6e6" : i === 1 ? "#f2f2f2" : "#ffffff";
          const widthPercent = i === 0 ? 70 : i === 1 ? 80 : 90;
          const heightPercent = i === 0 ? 80 : i === 1 ? 70 : 60;

          let openTransform = "";
          if (open) {
            if (i === 0)
              openTransform = `translate(calc(-120% + ${paperOffsets[0].x}px), calc(-70% + ${paperOffsets[0].y}px)) rotateZ(-15deg)`;
            if (i === 1)
              openTransform = `translate(calc(10% + ${paperOffsets[1].x}px), calc(-70% + ${paperOffsets[1].y}px)) rotateZ(15deg)`;
            if (i === 2)
              openTransform = `translate(calc(-50% + ${paperOffsets[2].x}px), calc(-100% + ${paperOffsets[2].y}px)) rotateZ(5deg)`;
          }

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                zIndex: 2,
                bottom: "10%",
                left: "50%",
                transform: open
                  ? openTransform
                  : "translate(-50%, 10%)",
                width: `${widthPercent}%`,
                height: open && i > 0 ? "80%" : `${heightPercent}%`,
                background: paperBg,
                borderRadius: 10 * size,
                transition: "all 0.3s ease-in-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 4 * size,
                overflow: "hidden",
                fontSize: 10 * size,
              }}
            >
              {open && item}
            </div>
          );
        })}

        {/* Back */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: backColor,
            borderRadius: `0px ${10 * size}px ${10 * size}px ${10 * size}px`,
          }}
        >
          {/* Tab */}
          <div
            style={{
              position: "absolute",
              zIndex: 0,
              bottom: "98%",
              left: 0,
              width: 30 * size,
              height: 10 * size,
              background: backColor,
              borderRadius: `${5 * size}px ${5 * size}px 0 0`,
            }}
          />
        </div>

        {/* Front */}
        <div
          style={{
            position: "absolute",
            zIndex: 3,
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: folderColor,
            borderRadius: `${5 * size}px ${10 * size}px ${10 * size}px ${10 * size}px`,
            transformOrigin: "bottom",
            transition: "all 0.3s ease-in-out",
            transform: open ? "skew(15deg) scaleY(0.6)" : undefined,
          }}
        />

        {/* Right flap */}
        <div
          style={{
            position: "absolute",
            zIndex: 3,
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            background: folderColor,
            borderRadius: `0 ${10 * size}px ${10 * size}px 0`,
            transformOrigin: "bottom",
            transition: "all 0.3s ease-in-out",
            transform: open ? "skew(-15deg) scaleY(0.6)" : undefined,
          }}
        />
      </div>

      {/* Label */}
      {label && (
        <span
          className="text-center font-bold leading-tight mt-2"
          style={{ fontSize: 13 * size, maxWidth: baseWidth * 1.3 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
