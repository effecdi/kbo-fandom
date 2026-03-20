import { useRef, useState, useCallback, useEffect } from "react";

interface ExpandCanvasProps {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  onExpand: (top: number, right: number, bottom: number, left: number) => void;
  className?: string;
}

type Edge = "top" | "right" | "bottom" | "left" | null;

/**
 * Canvas overlay that lets users drag edges to define expand area.
 * Shows checkerboard pattern in expanded regions with edge handles.
 */
export default function ExpandCanvas({
  width, height, top, right, bottom, left, onExpand, className,
}: ExpandCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ edge: Edge; startY: number; startX: number; startVal: number } | null>(null);
  const [hoverEdge, setHoverEdge] = useState<Edge>(null);

  // Proportional sizes: expand amounts relative to canvas dimensions, clamped
  const maxExpand = 200; // max px expand per side
  const pxPerUnit = 1; // 1:1

  // Scale factor to convert container px to logical px
  const getScale = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 1;
    // The container represents the original canvas area (width x height)
    // But it might be CSS-scaled due to zoom. Use offsetWidth to find CSS size.
    return el.offsetWidth / width;
  }, [width]);

  const handlePointerDown = useCallback((edge: Edge, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const val = edge === "top" ? top : edge === "right" ? right : edge === "bottom" ? bottom : left;
    dragging.current = { edge, startY: e.clientY, startX: e.clientX, startVal: val };
  }, [top, right, bottom, left]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const { edge, startY, startX, startVal } = dragging.current;
    const scale = getScale();
    let delta = 0;
    if (edge === "top") delta = (startY - e.clientY) / scale;
    else if (edge === "bottom") delta = (e.clientY - startY) / scale;
    else if (edge === "left") delta = (startX - e.clientX) / scale;
    else if (edge === "right") delta = (e.clientX - startX) / scale;
    const newVal = Math.max(0, Math.min(maxExpand, Math.round(startVal + delta)));

    if (edge === "top") onExpand(newVal, right, bottom, left);
    else if (edge === "right") onExpand(top, newVal, bottom, left);
    else if (edge === "bottom") onExpand(top, right, newVal, left);
    else if (edge === "left") onExpand(top, right, bottom, newVal);
  }, [top, right, bottom, left, onExpand, getScale]);

  const handlePointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  // Checkerboard pattern via CSS
  const checkerBg = `
    repeating-conic-gradient(
      hsl(var(--muted) / 0.5) 0% 25%,
      hsl(var(--background) / 0.3) 0% 50%
    ) 0 0 / 16px 16px
  `;

  const scale = getScale();
  const handleSize = 8;
  const handleStyle = (edge: Edge): React.CSSProperties => {
    const isHover = hoverEdge === edge || dragging.current?.edge === edge;
    const base: React.CSSProperties = {
      position: "absolute",
      background: isHover ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)",
      borderRadius: 4,
      zIndex: 10,
      transition: dragging.current ? "none" : "all 150ms ease",
      boxShadow: isHover ? "0 0 8px hsl(var(--primary) / 0.4)" : "none",
    };
    if (edge === "top" || edge === "bottom") {
      return {
        ...base,
        left: "25%",
        width: "50%",
        height: handleSize,
        cursor: "ns-resize",
        ...(edge === "top" ? { top: -handleSize / 2 } : { bottom: -handleSize / 2 }),
      };
    }
    return {
      ...base,
      top: "25%",
      height: "50%",
      width: handleSize,
      cursor: "ew-resize",
      ...(edge === "left" ? { left: -handleSize / 2 } : { right: -handleSize / 2 }),
    };
  };

  // Edge labels
  const labelStyle = (edge: Edge): React.CSSProperties => {
    const val = edge === "top" ? top : edge === "right" ? right : edge === "bottom" ? bottom : left;
    if (val === 0) return { display: "none" };
    const base: React.CSSProperties = {
      position: "absolute",
      fontSize: 10,
      fontWeight: 600,
      color: "hsl(var(--primary))",
      background: "hsl(var(--background) / 0.85)",
      padding: "1px 6px",
      borderRadius: 4,
      zIndex: 11,
      pointerEvents: "none",
      whiteSpace: "nowrap",
    };
    if (edge === "top") return { ...base, top: -(val + 16), left: "50%", transform: "translateX(-50%)" };
    if (edge === "bottom") return { ...base, bottom: -(val + 16), left: "50%", transform: "translateX(-50%)" };
    if (edge === "left") return { ...base, left: -(val + 28), top: "50%", transform: "translateY(-50%)" };
    return { ...base, right: -(val + 28), top: "50%", transform: "translateY(-50%)" };
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 20,
        overflow: "visible",
        pointerEvents: "none",
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Expand areas — checkerboard pattern */}
      {top > 0 && (
        <div style={{
          position: "absolute", top: -top, left: -left, right: -right, height: top,
          background: checkerBg, borderTop: "2px dashed hsl(var(--primary) / 0.5)",
          borderLeft: left > 0 ? "2px dashed hsl(var(--primary) / 0.5)" : "none",
          borderRight: right > 0 ? "2px dashed hsl(var(--primary) / 0.5)" : "none",
          pointerEvents: "none",
        }} />
      )}
      {bottom > 0 && (
        <div style={{
          position: "absolute", bottom: -bottom, left: -left, right: -right, height: bottom,
          background: checkerBg, borderBottom: "2px dashed hsl(var(--primary) / 0.5)",
          borderLeft: left > 0 ? "2px dashed hsl(var(--primary) / 0.5)" : "none",
          borderRight: right > 0 ? "2px dashed hsl(var(--primary) / 0.5)" : "none",
          pointerEvents: "none",
        }} />
      )}
      {left > 0 && (
        <div style={{
          position: "absolute", top: 0, left: -left, width: left, height: "100%",
          background: checkerBg, borderLeft: "2px dashed hsl(var(--primary) / 0.5)",
          pointerEvents: "none",
        }} />
      )}
      {right > 0 && (
        <div style={{
          position: "absolute", top: 0, right: -right, width: right, height: "100%",
          background: checkerBg, borderRight: "2px dashed hsl(var(--primary) / 0.5)",
          pointerEvents: "none",
        }} />
      )}

      {/* Drag handles */}
      {(["top", "right", "bottom", "left"] as Edge[]).map((edge) => (
        <div
          key={edge!}
          style={{ ...handleStyle(edge), pointerEvents: "auto" }}
          onPointerDown={(e) => handlePointerDown(edge, e)}
          onPointerEnter={() => setHoverEdge(edge)}
          onPointerLeave={() => { if (!dragging.current) setHoverEdge(null); }}
        />
      ))}

      {/* Labels showing px values */}
      {(["top", "right", "bottom", "left"] as Edge[]).map((edge) => {
        const val = edge === "top" ? top : edge === "right" ? right : edge === "bottom" ? bottom : left;
        if (val === 0) return null;
        return <span key={`label-${edge}`} style={labelStyle(edge)}>{val}px</span>;
      })}
    </div>
  );
}
