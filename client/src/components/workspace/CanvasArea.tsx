import { useRef, useState, useCallback, useEffect } from "react";
import { Textbox, Rect, Group } from "fabric";
import CanvaEditor from "@/components/canva-editor/canva-editor";
import CanvaToolbar from "@/components/canva-editor/canva-toolbar";
import type {
  CanvaEditorHandle,
  ToolMode,
  DrawingConfig,
  LineConfig,
  TextConfig,
} from "@/components/canva-editor/types";
import { FONT_OPTIONS } from "@/components/canva-editor/types";
import { useWorkspace, useActiveCut, useCanvasRef } from "@/hooks/use-workspace";
import { useProgressiveUI } from "@/hooks/use-progressive-ui";
import type { CutBubble, CutScript, CanvasLayer, CanvasAspectRatio } from "@/lib/workspace-types";
import { RectangleHorizontal, Square } from "lucide-react";

// ─── Canvas dimensions by aspect ratio ──────────────────────────────────────

const CANVAS_DIMS: Record<CanvasAspectRatio, { w: number; h: number }> = {
  "3:4": { w: 600, h: 800 },
  "1:1": { w: 700, h: 700 },
};

// ─── Bubble helpers ─────────────────────────────────────────────────────────

const BUBBLE_POSITIONS: Record<string, { left: number; top: number }> = {
  "top-left": { left: 30, top: 30 },
  "top-right": { left: 320, top: 30 },
  "bottom-left": { left: 30, top: 620 },
  "bottom-right": { left: 320, top: 620 },
  "center": { left: 180, top: 340 },
};

function getBubbleFont(style?: string): string {
  switch (style) {
    case "handwritten":
      return "Cafe24Surround, Apple SD Gothic Neo, sans-serif";
    case "wobbly":
      return "MemomentKkukkukk, Apple SD Gothic Neo, sans-serif";
    default:
      return "Pretendard, Apple SD Gothic Neo, sans-serif";
  }
}

function createBubbleObjects(bubbles: CutBubble[]) {
  const objects: Group[] = [];
  bubbles.forEach((bubble, idx) => {
    const pos = BUBBLE_POSITIONS[bubble.position || "center"] || BUBBLE_POSITIONS["center"];
    const offsetY = idx * 10;
    const text = new Textbox(bubble.text, {
      left: 14, top: 10, width: 200, fontSize: 18,
      fontFamily: getBubbleFont(bubble.style),
      fill: "#000000", textAlign: "center", editable: true, splitByGrapheme: true,
    });
    const textHeight = text.calcTextHeight();
    const bgWidth = 228;
    const bgHeight = Math.max(textHeight + 24, 50);
    const bg = new Rect({
      left: 0, top: 0, width: bgWidth, height: bgHeight,
      rx: 20, ry: 20, fill: "rgba(255,255,255,0.92)",
      stroke: "#222222", strokeWidth: 2.5,
    });
    const group = new Group([bg, text], {
      left: pos.left, top: pos.top + offsetY,
      selectable: true, evented: true, subTargetCheck: true,
    });
    objects.push(group);
  });
  return objects;
}

// ─── Layer sync helper ──────────────────────────────────────────────────────

function getLayerLabel(obj: any): string {
  if (obj.type === "textbox") return `텍스트: ${(obj.text || "").slice(0, 10)}`;
  if (obj.type === "group") return "말풍선";
  if (obj.type === "path") return "그리기";
  if (obj.type === "line") return "선";
  if (obj.type === "rect") return "사각형";
  if (obj.type === "image") return "이미지";
  return obj.type || "오브젝트";
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CanvasArea() {
  const canvasRef = useCanvasRef();
  const { state, dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const prevCutIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { showToolbar, recordInteraction } = useProgressiveUI();

  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [fitScale, setFitScale] = useState(1);
  const [drawConfig, setDrawConfig] = useState<DrawingConfig>({
    subTool: "pencil", color: "#000000", size: 4, opacity: 1,
  });
  const [lineConfig, setLineConfig] = useState<LineConfig>({
    subTool: "straight", color: "#000000", size: 2, opacity: 1,
  });
  const [textConfig, setTextConfig] = useState<TextConfig>({
    fontFamily: "Pretendard, Apple SD Gothic Neo, sans-serif",
    fontSize: 24, color: "#000000", bold: false, italic: false,
  });

  const dims = CANVAS_DIMS[state.canvasAspectRatio];

  // ── Auto-fit canvas to container ──────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const pad = 32; // padding
      const availW = rect.width - pad * 2;
      const availH = rect.height - pad * 2;
      const scale = Math.min(availW / dims.w, availH / dims.h, 1);
      setFitScale(Math.max(scale, 0.2));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims.w, dims.h]);

  // ── Sync canvas layers to state ───────────────────────────────────────────
  const syncLayers = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const objs = fc.getObjects();
    const layers: CanvasLayer[] = objs.map((obj: any, i: number) => ({
      id: obj.id || `obj-${i}`,
      type: obj.type || "unknown",
      label: getLayerLabel(obj),
    }));
    dispatch({ type: "UPDATE_CANVAS_LAYERS", layers });
  }, [canvasRef, dispatch]);

  // Listen for canvas object changes to sync layers
  useEffect(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const handler = () => syncLayers();
    fc.on("object:added", handler);
    fc.on("object:removed", handler);
    fc.on("object:modified", handler);
    // initial sync
    syncLayers();
    return () => {
      fc.off("object:added", handler);
      fc.off("object:removed", handler);
      fc.off("object:modified", handler);
    };
  }, [canvasRef, syncLayers, activeCut?.id]);

  // ── Save current cut canvas before switching ──────────────────────────────
  const saveCurrent = useCallback(() => {
    if (prevCutIdRef.current && canvasRef.current) {
      const json = canvasRef.current.toJSON();
      dispatch({ type: "UPDATE_CUT_CANVAS", cutId: prevCutIdRef.current, canvasJSON: json });
      const thumb = canvasRef.current.exportImage("jpeg");
      if (thumb) {
        dispatch({ type: "UPDATE_CUT_THUMBNAIL", cutId: prevCutIdRef.current, thumbnailUrl: thumb });
      }
    }
  }, [canvasRef, dispatch]);

  // ── Handle cut switching ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCut) return;
    if (prevCutIdRef.current === activeCut.id) return;
    saveCurrent();
    if (canvasRef.current) {
      if (activeCut.canvasJSON) {
        canvasRef.current.loadJSON(activeCut.canvasJSON);
      } else {
        canvasRef.current.clear();
      }
    }
    prevCutIdRef.current = activeCut.id;
  }, [activeCut, canvasRef, saveCurrent]);

  // ── Auto-add pending bubbles to canvas ────────────────────────────────────
  useEffect(() => {
    if (!activeCut?.pendingBubbles || activeCut.pendingBubbles.length === 0) return;
    if (!canvasRef.current) return;
    const fc = canvasRef.current.getCanvas();
    if (!fc) return;
    const timer = setTimeout(() => {
      const bubbleObjs = createBubbleObjects(activeCut.pendingBubbles!);
      bubbleObjs.forEach((obj) => fc.add(obj));
      fc.requestRenderAll();
      const json = canvasRef.current!.toJSON();
      dispatch({ type: "UPDATE_CUT_CANVAS", cutId: activeCut.id, canvasJSON: json });
      dispatch({ type: "CLEAR_CUT_BUBBLES", cutId: activeCut.id });
    }, 500);
    return () => clearTimeout(timer);
  }, [activeCut?.pendingBubbles, activeCut?.id, canvasRef, dispatch]);

  const handleObjectSelected = useCallback(
    (obj: any) => {
      if (obj) {
        dispatch({ type: "SELECT_OBJECTS", objectIds: [obj.id || "selected"] });
      } else {
        dispatch({ type: "SELECT_OBJECTS", objectIds: [] });
      }
    },
    [dispatch]
  );

  const handleToolModeChange = useCallback(
    (mode: ToolMode) => {
      setToolMode(mode);
    },
    []
  );

  // Script rendering
  const scriptTop = activeCut?.scriptTop;
  const scriptBottom = activeCut?.scriptBottom;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {showToolbar && (
        <div className="shrink-0 border-b border-border bg-card/50 px-2 py-1">
          <CanvaToolbar
            toolMode={toolMode}
            onToolModeChange={handleToolModeChange}
            drawConfig={drawConfig}
            onDrawConfigChange={setDrawConfig}
            lineConfig={lineConfig}
            onLineConfigChange={setLineConfig}
            textConfig={textConfig}
            onTextConfigChange={setTextConfig}
          />
        </div>
      )}

      {/* Canvas container - NO scroll, auto-fit */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center bg-muted/20 overflow-hidden relative">
        {/* Aspect ratio selector */}
        <div className="absolute top-3 right-3 z-10 flex items-center bg-card/90 backdrop-blur border border-border rounded-lg p-0.5 gap-0.5">
          {(["3:4", "1:1"] as CanvasAspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio })}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                state.canvasAspectRatio === ratio
                  ? "bg-[#00e5cc] text-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {ratio === "3:4" ? <RectangleHorizontal className="w-3 h-3 rotate-90" /> : <Square className="w-3 h-3" />}
              {ratio}
            </button>
          ))}
        </div>

        <div
          className="relative shadow-xl rounded-lg overflow-hidden border border-border"
          style={{
            transform: `scale(${fitScale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Top script overlay */}
          {scriptTop?.text && (
            <div
              className="absolute top-0 left-0 right-0 z-10 text-center px-3 py-2 pointer-events-none"
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                fontFamily: scriptTop.fontFamily || FONT_OPTIONS[0].family,
                fontSize: `${scriptTop.fontSize || 14}px`,
                color: scriptTop.color || "#ffffff",
              }}
            >
              {scriptTop.text}
            </div>
          )}

          <CanvaEditor
            ref={canvasRef}
            width={dims.w}
            height={dims.h}
            toolMode={toolMode}
            drawConfig={drawConfig}
            lineConfig={lineConfig}
            textConfig={textConfig}
            onToolModeChange={handleToolModeChange}
            onObjectSelected={handleObjectSelected}
            backgroundImage={activeCut?.backgroundImageUrl}
          />

          {/* Bottom script overlay */}
          {scriptBottom?.text && (
            <div
              className="absolute bottom-0 left-0 right-0 z-10 text-center px-3 py-2 pointer-events-none"
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                fontFamily: scriptBottom.fontFamily || FONT_OPTIONS[0].family,
                fontSize: `${scriptBottom.fontSize || 14}px`,
                color: scriptBottom.color || "#ffffff",
              }}
            >
              {scriptBottom.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
