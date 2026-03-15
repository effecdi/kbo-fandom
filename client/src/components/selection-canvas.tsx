import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useState } from "react";

export type SelectionMode = "brush" | "lasso" | "rectangle" | "ellipse" | "click";

export interface SelectionCanvasHandle {
  exportMask(): string;
  clearSelection(): void;
  expandSelection(px: number): void;
  shrinkSelection(px: number): void;
  setMask(maskDataUrl: string): void;
  floodFillAt(x: number, y: number, tolerance: number): void;
}

interface SelectionCanvasProps {
  width: number;
  height: number;
  mode: SelectionMode;
  brushSize: number;
  className?: string;
  /** When mode is "click", this callback fires with canvas-space coordinates */
  onClickPoint?: (x: number, y: number) => void;
  /** Source canvas to read pixel data from for flood fill */
  imageSource?: HTMLCanvasElement | null;
}

const SelectionCanvas = forwardRef<SelectionCanvasHandle, SelectionCanvasProps>(
  ({ width, height, mode, brushSize, className, onClickPoint, imageSource }, ref) => {
    const displayCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawing = useRef(false);
    const lassoPoints = useRef<{ x: number; y: number }[]>([]);
    const rectStart = useRef<{ x: number; y: number } | null>(null);
    const [marchOffset, setMarchOffset] = useState(0);

    // Initialize offscreen mask canvas
    useEffect(() => {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      maskCanvasRef.current = c;
    }, [width, height]);

    // Marching ants animation
    useEffect(() => {
      const id = setInterval(() => setMarchOffset((o) => (o + 1) % 16), 100);
      return () => clearInterval(id);
    }, []);

    // Render display from mask
    const renderDisplay = useCallback(() => {
      const display = displayCanvasRef.current;
      const mask = maskCanvasRef.current;
      if (!display || !mask) return;
      const ctx = display.getContext("2d")!;
      ctx.clearRect(0, 0, width, height);

      // Darken unselected areas
      const maskCtx = mask.getContext("2d")!;
      const maskData = maskCtx.getImageData(0, 0, width, height);

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, width, height);

      // Clear selected areas (where mask is white)
      const imgData = ctx.getImageData(0, 0, width, height);
      for (let i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i] > 128) {
          imgData.data[i + 3] = 0; // make transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);

      // Draw marching ants border
      drawMarchingAnts(ctx, maskData);
    }, [width, height]);

    // Re-render on marchOffset change
    useEffect(() => {
      renderDisplay();
    }, [marchOffset, renderDisplay]);

    const drawMarchingAnts = (ctx: CanvasRenderingContext2D, maskData: ImageData) => {
      // Find border pixels (mask white pixel adjacent to black pixel)
      const w = maskData.width;
      const h = maskData.height;
      const data = maskData.data;

      ctx.save();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -marchOffset;

      ctx.beginPath();
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          if (data[idx] > 128) {
            // Check neighbors
            const top = ((y - 1) * w + x) * 4;
            const bot = ((y + 1) * w + x) * 4;
            const left = (y * w + (x - 1)) * 4;
            const right = (y * w + (x + 1)) * 4;
            if (data[top] <= 128 || data[bot] <= 128 || data[left] <= 128 || data[right] <= 128) {
              ctx.rect(x - 0.5, y - 0.5, 1, 1);
            }
          }
        }
      }
      ctx.stroke();

      // Second pass with black dashes offset
      ctx.strokeStyle = "#000";
      ctx.lineDashOffset = -(marchOffset + 4);
      ctx.beginPath();
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          if (data[idx] > 128) {
            const top = ((y - 1) * w + x) * 4;
            const bot = ((y + 1) * w + x) * 4;
            const left = (y * w + (x - 1)) * 4;
            const right = (y * w + (x + 1)) * 4;
            if (data[top] <= 128 || data[bot] <= 128 || data[left] <= 128 || data[right] <= 128) {
              ctx.rect(x - 0.5, y - 0.5, 1, 1);
            }
          }
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    const getCanvasCoords = (e: React.PointerEvent) => {
      const canvas = displayCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height,
      };
    };

    const lastBrushPos = useRef<{ x: number; y: number } | null>(null);

    const paintBrushAt = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const paintBrushStroke = (x: number, y: number) => {
      const mask = maskCanvasRef.current;
      if (!mask) return;
      const ctx = mask.getContext("2d")!;
      ctx.fillStyle = "#fff";

      const last = lastBrushPos.current;
      if (last) {
        // Interpolate between last and current point
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const step = Math.max(1, brushSize / 4); // step size based on brush
        const steps = Math.ceil(dist / step);
        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 1 : i / steps;
          paintBrushAt(ctx, last.x + dx * t, last.y + dy * t);
        }
      } else {
        paintBrushAt(ctx, x, y);
      }
      lastBrushPos.current = { x, y };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const { x, y } = getCanvasCoords(e);

      if (mode === "click") {
        onClickPoint?.(Math.round(x), Math.round(y));
        return;
      }

      isDrawing.current = true;

      if (mode === "brush") {
        lastBrushPos.current = null;
        paintBrushStroke(x, y);
        renderDisplay();
      } else if (mode === "lasso") {
        lassoPoints.current = [{ x, y }];
      } else if (mode === "rectangle" || mode === "ellipse") {
        rectStart.current = { x, y };
      }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDrawing.current) return;
      const { x, y } = getCanvasCoords(e);

      if (mode === "brush") {
        paintBrushStroke(x, y);
        renderDisplay();
      } else if (mode === "lasso") {
        lassoPoints.current.push({ x, y });
        // Draw preview on display
        const display = displayCanvasRef.current;
        if (display) {
          renderDisplay();
          const ctx = display.getContext("2d")!;
          ctx.save();
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          const pts = lassoPoints.current;
          if (pts.length > 0) {
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.stroke();
          ctx.restore();
        }
      } else if ((mode === "rectangle" || mode === "ellipse") && rectStart.current) {
        // Draw preview
        const display = displayCanvasRef.current;
        if (display) {
          renderDisplay();
          const ctx = display.getContext("2d")!;
          ctx.save();
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          const sx = rectStart.current.x, sy = rectStart.current.y;
          const w = x - sx, h = y - sy;
          if (mode === "rectangle") {
            ctx.strokeRect(sx, sy, w, h);
          } else {
            ctx.beginPath();
            ctx.ellipse(sx + w / 2, sy + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      lastBrushPos.current = null;
      const { x, y } = getCanvasCoords(e);
      const mask = maskCanvasRef.current;
      if (!mask) return;
      const ctx = mask.getContext("2d")!;

      if (mode === "lasso") {
        const pts = lassoPoints.current;
        if (pts.length > 2) {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.fill();
        }
        lassoPoints.current = [];
      } else if (mode === "rectangle" && rectStart.current) {
        ctx.fillStyle = "#fff";
        const sx = rectStart.current.x, sy = rectStart.current.y;
        ctx.fillRect(sx, sy, x - sx, y - sy);
        rectStart.current = null;
      } else if (mode === "ellipse" && rectStart.current) {
        ctx.fillStyle = "#fff";
        const sx = rectStart.current.x, sy = rectStart.current.y;
        const w = x - sx, h = y - sy;
        ctx.beginPath();
        ctx.ellipse(sx + w / 2, sy + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
        ctx.fill();
        rectStart.current = null;
      }

      renderDisplay();
    };

    const floodFillAt = useCallback((startX: number, startY: number, tolerance: number) => {
      const mask = maskCanvasRef.current;
      if (!mask || !imageSource) return;

      // Draw source canvas to offscreen at logical size to handle DPR scaling
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const offCtx = off.getContext("2d")!;
      offCtx.drawImage(imageSource, 0, 0, width, height);
      let srcData: Uint8ClampedArray;
      try {
        srcData = offCtx.getImageData(0, 0, width, height).data;
      } catch {
        // Canvas tainted — cannot read pixel data
        console.warn("floodFillAt: canvas tainted, cannot read pixel data");
        return;
      }

      const total = width * height;
      const visited = new Uint8Array(total);
      const result = new Uint8Array(total);

      // Clamp start coordinates
      const sx0 = Math.max(0, Math.min(width - 1, Math.round(startX)));
      const sy0 = Math.max(0, Math.min(height - 1, Math.round(startY)));

      // Get target color at click point
      const idx0 = (sy0 * width + sx0) * 4;
      const tR = srcData[idx0], tG = srcData[idx0 + 1], tB = srcData[idx0 + 2];

      // BFS flood fill using a stack
      const stack = [sx0, sy0];
      visited[sy0 * width + sx0] = 1;

      while (stack.length > 0) {
        const sy = stack.pop()!;
        const sx = stack.pop()!;
        const pi = (sy * width + sx) * 4;
        const dr = srcData[pi] - tR;
        const dg = srcData[pi + 1] - tG;
        const db = srcData[pi + 2] - tB;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist <= tolerance) {
          result[sy * width + sx] = 1;
          // Push 4-connected neighbors
          if (sx > 0 && !visited[sy * width + sx - 1]) { visited[sy * width + sx - 1] = 1; stack.push(sx - 1, sy); }
          if (sx < width - 1 && !visited[sy * width + sx + 1]) { visited[sy * width + sx + 1] = 1; stack.push(sx + 1, sy); }
          if (sy > 0 && !visited[(sy - 1) * width + sx]) { visited[(sy - 1) * width + sx] = 1; stack.push(sx, sy - 1); }
          if (sy < height - 1 && !visited[(sy + 1) * width + sx]) { visited[(sy + 1) * width + sx] = 1; stack.push(sx, sy + 1); }
        }
      }

      // Write result to mask canvas
      const maskCtx = mask.getContext("2d")!;
      const maskImgData = maskCtx.getImageData(0, 0, width, height);
      const md = maskImgData.data;
      for (let i = 0; i < total; i++) {
        if (result[i]) {
          const pi = i * 4;
          md[pi] = 255;
          md[pi + 1] = 255;
          md[pi + 2] = 255;
          md[pi + 3] = 255;
        }
      }
      maskCtx.putImageData(maskImgData, 0, 0);
      renderDisplay();
    }, [imageSource, width, height, renderDisplay]);

    // Expose handle
    useImperativeHandle(ref, () => ({
      exportMask() {
        const mask = maskCanvasRef.current;
        if (!mask) return "";
        return mask.toDataURL("image/png");
      },
      clearSelection() {
        const mask = maskCanvasRef.current;
        if (!mask) return;
        const ctx = mask.getContext("2d")!;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
        renderDisplay();
      },
      expandSelection(px: number) {
        dilateOrErode(px, true);
      },
      shrinkSelection(px: number) {
        dilateOrErode(px, false);
      },
      setMask(maskDataUrl: string) {
        const mask = maskCanvasRef.current;
        if (!mask) return;
        const ctx = mask.getContext("2d")!;
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          renderDisplay();
        };
        img.src = maskDataUrl;
      },
      floodFillAt(x: number, y: number, tolerance: number) {
        floodFillAt(x, y, tolerance);
      },
    }));

    const dilateOrErode = (px: number, expand: boolean) => {
      const mask = maskCanvasRef.current;
      if (!mask) return;
      const ctx = mask.getContext("2d")!;
      const src = ctx.getImageData(0, 0, width, height);
      const dst = ctx.createImageData(width, height);
      // Copy source to dst
      dst.data.set(src.data);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const isWhite = src.data[idx] > 128;

          if (expand && !isWhite) {
            // Check if any neighbor within px is white
            let found = false;
            for (let dy = -px; dy <= px && !found; dy++) {
              for (let dx = -px; dx <= px && !found; dx++) {
                if (dx * dx + dy * dy > px * px) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                if (src.data[(ny * width + nx) * 4] > 128) found = true;
              }
            }
            if (found) {
              dst.data[idx] = dst.data[idx + 1] = dst.data[idx + 2] = 255;
              dst.data[idx + 3] = 255;
            }
          } else if (!expand && isWhite) {
            // Check if any neighbor within px is black
            let found = false;
            for (let dy = -px; dy <= px && !found; dy++) {
              for (let dx = -px; dx <= px && !found; dx++) {
                if (dx * dx + dy * dy > px * px) continue;
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                if (src.data[(ny * width + nx) * 4] <= 128) found = true;
              }
            }
            if (found) {
              dst.data[idx] = dst.data[idx + 1] = dst.data[idx + 2] = 0;
              dst.data[idx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(dst, 0, 0);
      renderDisplay();
    };

    return (
      <canvas
        ref={displayCanvasRef}
        width={width}
        height={height}
        className={className}
        style={{ display: "block", width: "100%", height: "100%", cursor: mode === "click" ? "pointer" : "crosshair" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    );
  }
);

SelectionCanvas.displayName = "SelectionCanvas";
export default SelectionCanvas;
