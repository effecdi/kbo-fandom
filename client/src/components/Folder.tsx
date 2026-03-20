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

function lightenColor(hex: string, percent: number): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const lighten = (value: number) =>
    Math.max(0, Math.min(255, Math.floor(value + (255 - value) * (percent / 100))));
  return `#${lighten(r).toString(16).padStart(2, "0")}${lighten(g).toString(16).padStart(2, "0")}${lighten(b).toString(16).padStart(2, "0")}`;
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
      const offsetX = (e.clientX - centerX) * 0.1;
      const offsetY = (e.clientY - centerY) * 0.1;
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
  const backColor = darkenColor(color, 20);
  const paper1 = lightenColor(color, 85);
  const paper2 = lightenColor(color, 90);
  const paper3 = "hsl(var(--card))";

  const w = 160 * size;
  const h = 120 * size;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Hover zone — taller to include paper fan-out area */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          cursor: "pointer",
          width: w * 1.8,
          height: h + (open ? h * 1.2 : 20),
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          transition: "height 0.3s ease",
        }}
      >
        {/* Folder body */}
        <div
          style={{
            position: "relative",
            width: w,
            height: h,
            transition: "transform 0.2s ease-in",
            transform: open ? "translateY(-4px)" : undefined,
          }}
        >
          {/* Papers */}
          {papers.map((item, i) => {
            const paperBg = i === 0 ? paper1 : i === 1 ? paper2 : paper3;
            const paperW = i === 0 ? w * 0.75 : i === 1 ? w * 0.85 : w * 0.92;
            const paperH = i === 0 ? h * 0.85 : i === 1 ? h * 0.75 : h * 0.65;

            const closedStyle: React.CSSProperties = {
              left: "50%",
              bottom: "8%",
              transform: "translate(-50%, 8%)",
              width: paperW,
              height: paperH,
            };

            const openStyles: React.CSSProperties[] = [
              {
                left: "50%",
                bottom: "15%",
                transform: `translate(calc(-140% + ${paperOffsets[0].x}px), calc(-55% + ${paperOffsets[0].y}px)) rotateZ(-12deg)`,
                width: paperW * 1.1,
                height: h * 1.05,
              },
              {
                left: "50%",
                bottom: "15%",
                transform: `translate(calc(15% + ${paperOffsets[1].x}px), calc(-55% + ${paperOffsets[1].y}px)) rotateZ(12deg)`,
                width: paperW * 1.05,
                height: h * 1.0,
              },
              {
                left: "50%",
                bottom: "15%",
                transform: `translate(calc(-50% + ${paperOffsets[2].x}px), calc(-80% + ${paperOffsets[2].y}px)) rotateZ(2deg)`,
                width: paperW * 1.15,
                height: h * 1.1,
              },
            ];

            const style = open ? openStyles[i] : closedStyle;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  zIndex: 2,
                  ...style,
                  background: paperBg,
                  borderRadius: 12 * size,
                  transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 12 * size,
                  boxShadow: open
                    ? "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)"
                    : "0 1px 3px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                {open && item && (
                  <div
                    style={{
                      fontSize: 15 * size,
                      fontWeight: 800,
                      color: "hsl(var(--foreground))",
                      textAlign: "center",
                      lineHeight: 1.5,
                      whiteSpace: "pre-line",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item}
                  </div>
                )}
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
              borderRadius: `0 ${12 * size}px ${12 * size}px ${12 * size}px`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {/* Tab */}
            <div
              style={{
                position: "absolute",
                bottom: "98%",
                left: 0,
                width: w * 0.35,
                height: 14 * size,
                background: backColor,
                borderRadius: `${8 * size}px ${8 * size}px 0 0`,
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
              background: `linear-gradient(135deg, ${folderColor}, ${darkenColor(folderColor, 8)})`,
              borderRadius: `${6 * size}px ${12 * size}px ${12 * size}px ${12 * size}px`,
              transformOrigin: "bottom",
              transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: open ? "skew(15deg) scaleY(0.55)" : undefined,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
              background: `linear-gradient(135deg, ${darkenColor(folderColor, 5)}, ${darkenColor(folderColor, 12)})`,
              borderRadius: `0 ${12 * size}px ${12 * size}px 0`,
              transformOrigin: "bottom",
              transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: open ? "skew(-15deg) scaleY(0.55)" : undefined,
            }}
          />
        </div>
      </div>

      {/* Label */}
      {label && (
        <div
          className="text-center font-black leading-snug"
          style={{
            fontSize: 18 * size,
            marginTop: 8 * size,
            maxWidth: w * 1.2,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
