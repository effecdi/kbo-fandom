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
  ShapeConfig,
} from "@/components/canva-editor/types";
import { FONT_OPTIONS } from "@/components/canva-editor/types";
import { useWorkspace, useActiveCut, useCanvasRef } from "@/hooks/use-workspace";
import { useProgressiveUI } from "@/hooks/use-progressive-ui";
import type { CutBubble, CutScript, CanvasLayer, CanvasAspectRatio } from "@/lib/workspace-types";
import { TEMPLATE_RATIOS } from "@/lib/fandom-templates";
import {
  RectangleHorizontal,
  Square,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize,
  Copy,
  Clipboard,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Scissors,
  CopyPlus,
} from "lucide-react";

// ─── Canvas dimensions by aspect ratio ──────────────────────────────────────

const CANVAS_DIMS: Record<CanvasAspectRatio, { w: number; h: number }> = {
  "3:4":  { w: 600, h: 800 },
  "1:1":  { w: 700, h: 700 },
  "2:3":  { w: 540, h: 810 },
  "9:16": { w: 450, h: 800 },
  "4:5":  { w: 640, h: 800 },
  "16:9": { w: 960, h: 540 },
};

const RATIO_ICON: Record<CanvasAspectRatio, typeof Square> = {
  "3:4": RectangleHorizontal,
  "1:1": Square,
  "2:3": RectangleHorizontal,
  "9:16": Smartphone,
  "4:5": RectangleHorizontal,
  "16:9": RectangleHorizontal,
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
      selectable: true, evented: true, subTargetCheck: true, interactive: true,
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

// ─── Context menu item ──────────────────────────────────────────────────────

function CtxMenuItem({ icon, label, shortcut, onClick, danger }: {
  icon: React.ReactNode; label: string; shortcut?: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] transition-all ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-white/70 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <span className="opacity-60">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-[12px] text-white/25 font-mono">{shortcut}</span>}
    </button>
  );
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
  const [shapeConfig, setShapeConfig] = useState<ShapeConfig>({
    subTool: "rectangle", fill: "#34c759", stroke: "#000000", strokeWidth: 2, opacity: 1,
  });

  // Zoom
  const [zoom, setZoom] = useState(100);

  // Right-click context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const dims = CANVAS_DIMS[state.canvasAspectRatio];

  // ── Auto-fit canvas to container ──────────────────────────────────────────
  const fitToViewRef = useRef<() => void>(() => {});
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const pad = 32;
      const availW = rect.width - pad * 2;
      const availH = rect.height - pad * 2;
      const scale = Math.min(availW / dims.w, availH / dims.h, 1);
      setFitScale(Math.max(scale, 0.2));
    };

    fitToViewRef.current = update;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims.w, dims.h]);

  // ── Zoom: keyboard + wheel ────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.round(Math.max(20, Math.min(300, z * (e.deltaY < 0 ? 1.1 : 0.9)))));
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setZoom((z) => Math.min(300, z + 10));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(20, z - 10));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoom(100);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // ── Close context menu on click outside ───────────────────────────────────
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    window.addEventListener("contextmenu", handler);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("contextmenu", handler);
    };
  }, [contextMenu]);

  // ── Sync canvas layers to state (debounced) ─────────────────────────────
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLayerKeyRef = useRef<string>("");

  const syncLayers = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const objs = fc.getObjects();
    const layers: CanvasLayer[] = objs.map((obj: any, i: number) => ({
      id: obj.id || `obj-${i}`,
      type: obj.type || "unknown",
      label: getLayerLabel(obj),
    }));
    // Skip dispatch if layers haven't actually changed
    const key = layers.map((l) => `${l.id}:${l.type}`).join("|");
    if (key === lastLayerKeyRef.current) return;
    lastLayerKeyRef.current = key;
    dispatch({ type: "UPDATE_CANVAS_LAYERS", layers });
  }, [canvasRef, dispatch]);

  const debouncedSyncLayers = useCallback(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(syncLayers, 150);
  }, [syncLayers]);

  // Listen for canvas object changes to sync layers
  useEffect(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    // object:added/removed need immediate sync; object:modified is debounced
    const immediateHandler = () => syncLayers();
    const debouncedHandler = () => debouncedSyncLayers();
    fc.on("object:added", immediateHandler);
    fc.on("object:removed", immediateHandler);
    fc.on("object:modified", debouncedHandler);
    // initial sync
    syncLayers();
    return () => {
      fc.off("object:added", immediateHandler);
      fc.off("object:removed", immediateHandler);
      fc.off("object:modified", debouncedHandler);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [canvasRef, syncLayers, debouncedSyncLayers, activeCut?.id]);

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

  // ── Download handler ────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.exportImage("png");
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `panel_${activeCut?.id || "canvas"}.png`;
    link.href = dataUrl;
    link.click();
  }, [canvasRef, activeCut?.id]);

  const handleDownloadAll = useCallback(() => {
    const scenes = state.scenes;
    scenes.forEach((scene, si) => {
      scene.cuts.forEach((cut, ci) => {
        if (!canvasRef.current) return;
        // For active cut, export directly
        if (cut.id === activeCut?.id) {
          const dataUrl = canvasRef.current.exportImage("png");
          if (dataUrl) {
            setTimeout(() => {
              const link = document.createElement("a");
              link.download = `scene${si + 1}_cut${ci + 1}.png`;
              link.href = dataUrl;
              link.click();
            }, ci * 300);
          }
        } else if (cut.thumbnailUrl) {
          setTimeout(() => {
            const link = document.createElement("a");
            link.download = `scene${si + 1}_cut${ci + 1}.png`;
            link.href = cut.thumbnailUrl!;
            link.click();
          }, (si * scene.cuts.length + ci) * 300);
        }
      });
    });
  }, [state.scenes, canvasRef, activeCut?.id]);

  // ── Context menu handlers ─────────────────────────────────────────────────
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, [canvasRef]);

  const ctxCopy = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    obj.clone().then((cloned: any) => { (window as any).__olli_clipboard = cloned; });
    setContextMenu(null);
  }, [canvasRef]);

  const ctxPaste = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const cloned = (window as any).__olli_clipboard;
    if (!cloned) return;
    cloned.clone().then((pasted: any) => {
      pasted.set({ left: (pasted.left || 0) + 20, top: (pasted.top || 0) + 20 });
      fc.add(pasted);
      (window as any).__olli_clipboard = pasted;
      fc.setActiveObject(pasted);
      fc.requestRenderAll();
    });
    setContextMenu(null);
  }, [canvasRef]);

  const ctxCut = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    obj.clone().then((cloned: any) => {
      (window as any).__olli_clipboard = cloned;
      fc.getActiveObjects().forEach((o: any) => fc.remove(o));
      fc.discardActiveObject();
      fc.requestRenderAll();
    });
    setContextMenu(null);
  }, [canvasRef]);

  const ctxDuplicate = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    obj.clone().then((cloned: any) => {
      cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
      fc.add(cloned);
      fc.setActiveObject(cloned);
      fc.requestRenderAll();
    });
    setContextMenu(null);
  }, [canvasRef]);

  const ctxDelete = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    fc.getActiveObjects().forEach((o: any) => fc.remove(o));
    fc.discardActiveObject();
    fc.requestRenderAll();
    setContextMenu(null);
  }, [canvasRef]);

  const ctxBringForward = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (obj) { fc.bringObjectForward(obj); fc.requestRenderAll(); }
    setContextMenu(null);
  }, [canvasRef]);

  const ctxSendBackward = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (obj) { fc.sendObjectBackwards(obj); fc.requestRenderAll(); }
    setContextMenu(null);
  }, [canvasRef]);

  const ctxBringToFront = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (obj) { fc.bringObjectToFront(obj); fc.requestRenderAll(); }
    setContextMenu(null);
  }, [canvasRef]);

  const ctxSendToBack = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (obj) { fc.sendObjectToBack(obj); fc.requestRenderAll(); }
    setContextMenu(null);
  }, [canvasRef]);

  const ctxLock = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    const locked = !obj.lockMovementX;
    obj.set({ lockMovementX: locked, lockMovementY: locked, lockRotation: locked, lockScalingX: locked, lockScalingY: locked, hasControls: !locked });
    fc.requestRenderAll();
    setContextMenu(null);
  }, [canvasRef]);

  // Script rendering
  const scriptTop = activeCut?.scriptTop;
  const scriptBottom = activeCut?.scriptBottom;

  // Script style renderer
  function getScriptStyle(script: typeof scriptTop) {
    if (!script) return {};
    const style = script.style || "filled";
    const bgColor = script.bgColor || "rgba(0,0,0,0.6)";
    const base: React.CSSProperties = {
      fontFamily: script.fontFamily || FONT_OPTIONS[0].family,
      fontSize: `${script.fontSize || 14}px`,
      color: script.color || "#ffffff",
      fontWeight: script.bold ? "bold" : "normal",
    };

    switch (style) {
      case "filled":
        return { ...base, backgroundColor: bgColor };
      case "box":
        return { ...base, backgroundColor: "transparent", border: `2px solid ${script.color || "#ffffff"}`, borderLeft: "none", borderRight: "none" };
      case "handwritten-box":
        return { ...base, backgroundColor: bgColor, borderRadius: "4px", boxShadow: `2px 2px 0 ${script.color || "#ffffff"}22` };
      case "no-bg":
        return { ...base, backgroundColor: "transparent", textShadow: "0 1px 4px rgba(0,0,0,0.8)" };
      case "no-border":
        return { ...base, backgroundColor: bgColor, border: "none" };
      default:
        return { ...base, backgroundColor: bgColor };
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      {showToolbar && (
        <div className="shrink-0 border-b border-white/[0.04] bg-[#0e0e12]/80 backdrop-blur-sm px-2 py-1">
          <CanvaToolbar
            toolMode={toolMode}
            onToolModeChange={handleToolModeChange}
            drawConfig={drawConfig}
            onDrawConfigChange={setDrawConfig}
            lineConfig={lineConfig}
            onLineConfigChange={setLineConfig}
            textConfig={textConfig}
            onTextConfigChange={setTextConfig}
            shapeConfig={shapeConfig}
            onShapeConfigChange={setShapeConfig}
          />
        </div>
      )}

      {/* Canvas area wrapper */}
      <div ref={containerRef} className="flex-1 relative bg-[#111115]">
        {/* Scrollable canvas area */}
        <div className="absolute inset-0 overflow-auto">
          <div
            className="flex items-center justify-center"
            style={{
              minWidth: "100%",
              minHeight: "100%",
              width: Math.max(dims.w * (zoom / 100) * fitScale + 64, 0),
              height: Math.max(dims.h * (zoom / 100) * fitScale + 64, 0),
            }}
          >
            {/* Scaled size wrapper — real layout size for scrolling */}
            <div
              className="relative shrink-0"
              style={{
                width: dims.w * (zoom / 100) * fitScale,
                height: dims.h * (zoom / 100) * fitScale,
              }}
            >
              {/* Canvas at original size, scaled via transform */}
              <div
                className="absolute top-0 left-0 rounded-xl overflow-visible"
                style={{
                  width: dims.w,
                  height: dims.h,
                  transform: `scale(${(zoom / 100) * fitScale})`,
                  transformOrigin: "top left",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -10px rgba(0,0,0,0.5)",
                }}
                onContextMenu={handleContextMenu}
              >
            {/* Top script overlay */}
            {scriptTop?.text && (
              <div
                className="absolute top-0 left-0 right-0 z-10 text-center px-4 py-2.5 pointer-events-none"
                style={getScriptStyle(scriptTop)}
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
              shapeConfig={shapeConfig}
              onToolModeChange={handleToolModeChange}
              onObjectSelected={handleObjectSelected}
              backgroundImage={activeCut?.backgroundImageUrl}
            />

            {/* Bottom script overlay */}
            {scriptBottom?.text && (
              <div
                className="absolute bottom-0 left-0 right-0 z-10 text-center px-4 py-2.5 pointer-events-none"
                style={getScriptStyle(scriptBottom)}
              >
                {scriptBottom.text}
              </div>
            )}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay controls — stay fixed on top */}
        {/* Aspect ratio — top right */}
        <div className="absolute top-3 right-3 z-20 flex items-center bg-[#1a1a1f]/90 backdrop-blur-xl border border-white/[0.06] rounded-xl p-0.5 gap-0.5">
          {(state.fandomMeta
            ? TEMPLATE_RATIOS[state.fandomMeta.templateType] || ["3:4", "1:1"]
            : ["3:4", "1:1"] as CanvasAspectRatio[]
          ).map((ratio) => {
            const IconComp = RATIO_ICON[ratio] || Square;
            const isVertical = ratio === "3:4" || ratio === "2:3" || ratio === "9:16" || ratio === "4:5";
            return (
              <button
                key={ratio}
                onClick={() => dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
                  state.canvasAspectRatio === ratio
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,204,0.3)]"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
                }`}
              >
                <IconComp className={`w-5 h-5 ${isVertical && ratio !== "9:16" ? "rotate-90" : ""}`} />
                {ratio}
              </button>
            );
          })}
        </div>

        {/* Zoom — bottom center */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 bg-[#1a1a1f]/90 backdrop-blur-xl rounded-2xl border border-white/[0.06]">
          <button
            onClick={() => setZoom((z) => Math.max(20, z - 10))}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            disabled={zoom <= 20}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <input
            type="range" min={20} max={300} step={5} value={zoom}
            onChange={(e) => setZoom(+e.target.value)}
            className="w-24 h-1.5 accent-primary"
          />
          <button
            onClick={() => setZoom((z) => Math.min(300, z + 10))}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            disabled={zoom >= 300}
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <span className="text-[13px] text-white/50 font-mono w-12 text-center">{zoom}%</span>
          <button
            onClick={() => { setZoom(100); fitToViewRef.current(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            title="화면에 맞추기"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>

        {/* Right-click context menu */}
        {contextMenu && (
          <div
            className="fixed z-50 min-w-[180px] bg-[#1a1a1f]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl py-1.5 overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <CtxMenuItem icon={<Copy className="w-5 h-5" />} label="복사" shortcut="⌘C" onClick={ctxCopy} />
            <CtxMenuItem icon={<Scissors className="w-5 h-5" />} label="잘라내기" shortcut="⌘X" onClick={ctxCut} />
            <CtxMenuItem icon={<Clipboard className="w-5 h-5" />} label="붙여넣기" shortcut="⌘V" onClick={ctxPaste} />
            <CtxMenuItem icon={<CopyPlus className="w-5 h-5" />} label="복제" shortcut="⌘D" onClick={ctxDuplicate} />
            <div className="h-px bg-white/[0.06] my-1" />
            <CtxMenuItem icon={<ChevronsUp className="w-5 h-5" />} label="맨 앞으로" shortcut="⌘⇧]" onClick={ctxBringToFront} />
            <CtxMenuItem icon={<ArrowUpToLine className="w-5 h-5" />} label="앞으로" shortcut="⌘]" onClick={ctxBringForward} />
            <CtxMenuItem icon={<ArrowDownToLine className="w-5 h-5" />} label="뒤로" shortcut="⌘[" onClick={ctxSendBackward} />
            <CtxMenuItem icon={<ChevronsDown className="w-5 h-5" />} label="맨 뒤로" shortcut="⌘⇧[" onClick={ctxSendToBack} />
            <div className="h-px bg-white/[0.06] my-1" />
            <CtxMenuItem icon={<Lock className="w-5 h-5" />} label="잠금 토글" shortcut="⌘L" onClick={ctxLock} />
            <CtxMenuItem icon={<Trash2 className="w-5 h-5" />} label="삭제" shortcut="Del" onClick={ctxDelete} danger />
          </div>
        )}
      </div>
    </div>
  );
}
