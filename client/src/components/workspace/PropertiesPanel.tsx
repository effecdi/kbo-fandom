import { useState, useEffect, useCallback } from "react";
import {
  Copy,
  Trash2,
  GripVertical,
  Type,
  Pencil,
  Image,
  MessageSquare,
  Layers,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FlipHorizontal2,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace, useActiveCut, useActiveScene, useCanvasRef } from "@/hooks/use-workspace";
import { useProgressiveUI } from "@/hooks/use-progressive-ui";
import { genId } from "@/contexts/workspace-context";
import { FONT_OPTIONS, COLOR_PRESETS } from "@/components/canva-editor/types";
import type { Cut, CutScript } from "@/lib/workspace-types";

function getLayerIcon(type: string) {
  switch (type) {
    case "textbox": return Type;
    case "group": return MessageSquare;
    case "path": return Pencil;
    case "image": return Image;
    default: return Layers;
  }
}

// ─── Color Picker Inline ────────────────────────────────────────────────────

function ColorPickerInline({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"
        >
          <span
            className="w-4 h-4 rounded-sm border border-border"
            style={{ backgroundColor: value }}
          />
          <span className="text-[10px] text-muted-foreground font-mono">{value}</span>
        </button>
      </div>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-xl p-2 w-48">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                className={`w-6 h-6 rounded-sm border transition-all ${
                  value === c ? "border-[#00e5cc] ring-1 ring-[#00e5cc]" : "border-border hover:border-foreground/30"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => { onChange(c); setOpen(false); }}
              />
            ))}
          </div>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-7 cursor-pointer rounded border border-border"
          />
        </div>
      )}
    </div>
  );
}

// ─── Script Editor ──────────────────────────────────────────────────────────

function ScriptEditor({
  label,
  script,
  onChange,
}: {
  label: string;
  script: CutScript | null | undefined;
  onChange: (s: CutScript | null) => void;
}) {
  const text = script?.text || "";
  const fontSize = script?.fontSize || 14;
  const color = script?.color || "#000000";
  const fontFamily = script?.fontFamily || FONT_OPTIONS[0].family;

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium text-muted-foreground block">{label}</label>
      <textarea
        value={text}
        onChange={(e) =>
          onChange(
            e.target.value
              ? { text: e.target.value, fontSize, color, fontFamily }
              : null
          )
        }
        placeholder="스크립트 입력..."
        rows={2}
        className="w-full px-2 py-1.5 text-xs bg-muted rounded-lg border border-border focus:outline-none focus:border-[#00e5cc] resize-none"
      />
      {text && (
        <div className="flex items-center gap-2">
          <select
            value={fontFamily}
            onChange={(e) =>
              onChange({ text, fontSize, color, fontFamily: e.target.value })
            }
            className="flex-1 text-[10px] bg-muted rounded border border-border px-1 py-0.5"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.family} value={f.family}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={fontSize}
            onChange={(e) =>
              onChange({ text, fontSize: Number(e.target.value), color, fontFamily })
            }
            min={8}
            max={48}
            className="w-12 text-[10px] bg-muted rounded border border-border px-1 py-0.5 text-center"
          />
          <input
            type="color"
            value={color}
            onChange={(e) =>
              onChange({ text, fontSize, color: e.target.value, fontFamily })
            }
            className="w-6 h-5 cursor-pointer rounded border border-border"
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function PropertiesPanel() {
  const { state, dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const activeScene = useActiveScene();
  const canvasRef = useCanvasRef();
  const { uiLevel } = useProgressiveUI();
  const isPro = uiLevel === "pro";
  const hasSelection = state.selectedObjectIds.length > 0;
  const layers = state.canvasLayers;

  // Selected object properties
  const [objScale, setObjScale] = useState(100);
  const [objOpacity, setObjOpacity] = useState(100);
  const [objAngle, setObjAngle] = useState(0);
  const [objLocked, setObjLocked] = useState(false);
  // Text properties
  const [objFontFamily, setObjFontFamily] = useState(FONT_OPTIONS[0].family);
  const [objFontSize, setObjFontSize] = useState(24);
  const [objBold, setObjBold] = useState(false);
  const [objItalic, setObjItalic] = useState(false);
  const [objUnderline, setObjUnderline] = useState(false);
  const [objStrikethrough, setObjStrikethrough] = useState(false);
  const [objTextAlign, setObjTextAlign] = useState("left");
  // Color properties
  const [objFillColor, setObjFillColor] = useState("#000000");
  const [objStrokeColor, setObjStrokeColor] = useState("");
  // Object type
  const [objType, setObjType] = useState("");

  // Sync from canvas selection
  const syncFromCanvas = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (obj) {
      setObjScale(Math.round((obj.scaleX || 1) * 100));
      setObjOpacity(Math.round((obj.opacity ?? 1) * 100));
      setObjAngle(Math.round(obj.angle || 0));
      setObjLocked(!!obj.lockMovementX);
      setObjType(obj.type || "");

      // Fill/stroke
      setObjFillColor((obj.fill as string) || "#000000");
      setObjStrokeColor((obj.stroke as string) || "");

      // Text properties
      if (obj.type === "textbox" || obj.type === "i-text") {
        const t = obj as any;
        setObjFontFamily(t.fontFamily || FONT_OPTIONS[0].family);
        setObjFontSize(t.fontSize || 24);
        setObjBold(t.fontWeight === "bold");
        setObjItalic(t.fontStyle === "italic");
        setObjUnderline(!!t.underline);
        setObjStrikethrough(!!t.linethrough);
        setObjTextAlign(t.textAlign || "left");
      }
    }
  }, [canvasRef]);

  useEffect(() => {
    syncFromCanvas();
  }, [state.selectedObjectIds, syncFromCanvas]);

  // ─── Apply helpers ──────────────────────────────────────────────────

  function getObj() {
    const fc = canvasRef.current?.getCanvas();
    return { fc, obj: fc?.getActiveObject() };
  }

  function applyScale(val: number) {
    setObjScale(val);
    const { fc, obj } = getObj();
    if (obj) { const s = val / 100; obj.scaleX = s; obj.scaleY = s; fc!.requestRenderAll(); }
  }

  function applyOpacity(val: number) {
    setObjOpacity(val);
    const { fc, obj } = getObj();
    if (obj) { obj.opacity = val / 100; fc!.requestRenderAll(); }
  }

  function applyAngle(val: number) {
    setObjAngle(val);
    const { fc, obj } = getObj();
    if (obj) { obj.angle = val; fc!.requestRenderAll(); }
  }

  function toggleLock() {
    const { fc, obj } = getObj();
    if (!obj) return;
    const locked = !obj.lockMovementX;
    obj.set({
      lockMovementX: locked, lockMovementY: locked,
      lockRotation: locked, lockScalingX: locked, lockScalingY: locked,
      hasControls: !locked,
    });
    setObjLocked(locked);
    fc!.requestRenderAll();
  }

  function applyFontFamily(val: string) {
    setObjFontFamily(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ fontFamily: val });
      fc!.requestRenderAll();
    }
  }

  function applyFontSize(val: number) {
    setObjFontSize(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ fontSize: val });
      fc!.requestRenderAll();
    }
  }

  function applyBold(val: boolean) {
    setObjBold(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ fontWeight: val ? "bold" : "normal" });
      fc!.requestRenderAll();
    }
  }

  function applyItalic(val: boolean) {
    setObjItalic(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ fontStyle: val ? "italic" : "normal" });
      fc!.requestRenderAll();
    }
  }

  function applyUnderline(val: boolean) {
    setObjUnderline(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ underline: val });
      fc!.requestRenderAll();
    }
  }

  function applyStrikethrough(val: boolean) {
    setObjStrikethrough(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ linethrough: val });
      fc!.requestRenderAll();
    }
  }

  function applyTextAlign(val: string) {
    setObjTextAlign(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ textAlign: val });
      fc!.requestRenderAll();
    }
  }

  function applyFillColor(val: string) {
    setObjFillColor(val);
    const { fc, obj } = getObj();
    if (!obj) return;
    if (obj.type === "path" || obj.type === "line" || obj.type === "polyline") {
      obj.set({ stroke: val });
    } else {
      obj.set({ fill: val });
    }
    fc!.requestRenderAll();
  }

  function applyStrokeColor(val: string) {
    setObjStrokeColor(val);
    const { fc, obj } = getObj();
    if (obj) { obj.set({ stroke: val }); fc!.requestRenderAll(); }
  }

  // Z-order
  function bringToFront() {
    const { fc, obj } = getObj();
    if (fc && obj) { fc.bringObjectToFront(obj); fc.requestRenderAll(); }
  }
  function bringForward() {
    const { fc, obj } = getObj();
    if (fc && obj) { fc.bringObjectForward(obj); fc.requestRenderAll(); }
  }
  function sendBackward() {
    const { fc, obj } = getObj();
    if (fc && obj) { fc.sendObjectBackwards(obj); fc.requestRenderAll(); }
  }
  function sendToBack() {
    const { fc, obj } = getObj();
    if (fc && obj) { fc.sendObjectToBack(obj); fc.requestRenderAll(); }
  }

  // Duplicate/Delete object
  function duplicateObject() {
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
  }

  function deleteObject() {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    fc.getActiveObjects().forEach((o: any) => fc.remove(o));
    fc.discardActiveObject();
    fc.requestRenderAll();
    dispatch({ type: "SELECT_OBJECTS", objectIds: [] });
  }

  function flipHorizontal() {
    const { fc, obj } = getObj();
    if (obj) { obj.set({ flipX: !obj.flipX }); fc!.requestRenderAll(); }
  }

  // Layer
  function handleDeleteLayer(index: number) {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const objs = fc.getObjects();
    const target = objs[index];
    if (target) { fc.remove(target); fc.requestRenderAll(); }
  }

  function handleSelectLayer(index: number) {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const objs = fc.getObjects();
    const target = objs[index];
    if (target) { fc.setActiveObject(target); fc.requestRenderAll(); }
  }

  // Cut actions
  function handleDuplicateCut() {
    if (!activeCut || !activeScene) return;
    dispatch({ type: "HISTORY_PUSH" });
    const newCut: Cut = {
      id: genId("cut"),
      sceneId: activeScene.id,
      order: activeScene.cuts.length + 1,
      canvasJSON: activeCut.canvasJSON ? JSON.parse(JSON.stringify(activeCut.canvasJSON)) : null,
      thumbnailUrl: activeCut.thumbnailUrl,
      backgroundImageUrl: activeCut.backgroundImageUrl,
      scriptTop: activeCut.scriptTop ? { ...activeCut.scriptTop } : null,
      scriptBottom: activeCut.scriptBottom ? { ...activeCut.scriptBottom } : null,
    };
    dispatch({ type: "ADD_CUT", sceneId: activeScene.id, cut: newCut });
    dispatch({ type: "SET_ACTIVE_CUT", cutId: newCut.id });
  }

  const isTextObj = objType === "textbox" || objType === "i-text";
  const isPathObj = objType === "path" || objType === "line" || objType === "polyline";

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-bold text-xs text-foreground">속성</h3>

      {/* ── Selected Object Properties ── */}
      {hasSelection && (
        <div className="space-y-3">
          {/* Object actions bar */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={toggleLock}
              className={`p-1.5 rounded-md border transition-colors ${
                objLocked
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-500"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
              title={objLocked ? "잠금 해제" : "잠금"}
            >
              {objLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={flipHorizontal}
              className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors"
              title="좌우 반전"
            >
              <FlipHorizontal2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={duplicateObject}
              className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors"
              title="복제"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={deleteObject}
              className="p-1.5 rounded-md border border-border hover:bg-destructive/20 text-destructive transition-colors"
              title="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-5 bg-border mx-0.5" />
            {/* Z-order */}
            <button onClick={bringToFront} className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors" title="맨 앞으로">
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={bringForward} className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors" title="앞으로">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={sendBackward} className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors" title="뒤로">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button onClick={sendToBack} className="p-1.5 rounded-md border border-border hover:bg-muted text-muted-foreground transition-colors" title="맨 뒤로">
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Transform sliders */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-2">변환</label>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">크기</span>
                  <span className="text-[10px] text-muted-foreground">{objScale}%</span>
                </div>
                <input type="range" min={10} max={300} value={objScale}
                  onChange={(e) => applyScale(Number(e.target.value))}
                  className="w-full mt-1 accent-[#00e5cc]" />
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">투명도</span>
                  <span className="text-[10px] text-muted-foreground">{objOpacity}%</span>
                </div>
                <input type="range" min={0} max={100} value={objOpacity}
                  onChange={(e) => applyOpacity(Number(e.target.value))}
                  className="w-full mt-1 accent-[#00e5cc]" />
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">회전</span>
                  <span className="text-[10px] text-muted-foreground">{objAngle}°</span>
                </div>
                <input type="range" min={0} max={360} value={objAngle}
                  onChange={(e) => applyAngle(Number(e.target.value))}
                  className="w-full mt-1 accent-[#00e5cc]" />
              </div>
            </div>
          </div>

          {/* ── Text formatting (textbox only) ── */}
          {isTextObj && (
            <div>
              <label className="text-[10px] font-medium text-muted-foreground block mb-2">텍스트</label>
              <div className="space-y-2">
                {/* Font family */}
                <select
                  value={objFontFamily}
                  onChange={(e) => applyFontFamily(e.target.value)}
                  className="w-full text-xs bg-muted rounded-lg border border-border px-2 py-1.5 focus:outline-none focus:border-[#00e5cc]"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.family} value={f.family}>{f.label}</option>
                  ))}
                </select>

                {/* Font size */}
                <div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">크기</span>
                    <span className="text-[10px] text-muted-foreground">{objFontSize}px</span>
                  </div>
                  <input type="range" min={8} max={120} value={objFontSize}
                    onChange={(e) => applyFontSize(Number(e.target.value))}
                    className="w-full mt-1 accent-[#00e5cc]" />
                </div>

                {/* Style toggles */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => applyBold(!objBold)}
                    className={`p-1.5 rounded-md border transition-colors ${
                      objBold ? "bg-[#00e5cc]/20 border-[#00e5cc]/30 text-[#00e5cc]" : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                    title="굵게"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => applyItalic(!objItalic)}
                    className={`p-1.5 rounded-md border transition-colors ${
                      objItalic ? "bg-[#00e5cc]/20 border-[#00e5cc]/30 text-[#00e5cc]" : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                    title="기울임"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => applyUnderline(!objUnderline)}
                    className={`p-1.5 rounded-md border transition-colors ${
                      objUnderline ? "bg-[#00e5cc]/20 border-[#00e5cc]/30 text-[#00e5cc]" : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                    title="밑줄"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => applyStrikethrough(!objStrikethrough)}
                    className={`p-1.5 rounded-md border transition-colors ${
                      objStrikethrough ? "bg-[#00e5cc]/20 border-[#00e5cc]/30 text-[#00e5cc]" : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                    title="취소선"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-5 bg-border mx-0.5" />

                  {/* Text alignment */}
                  <button
                    onClick={() => applyTextAlign("left")}
                    className={`p-1.5 rounded-md border transition-colors ${
                      objTextAlign === "left" ? "bg-[#00e5cc]/20 border-[#00e5cc]/30 text-[#00e5cc]" : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                    title="왼쪽 정렬"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => applyTextAlign("center")}
                    className={`p-1.5 rounded-md border transition-colors ${
                      objTextAlign === "center" ? "bg-[#00e5cc]/20 border-[#00e5cc]/30 text-[#00e5cc]" : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                    title="가운데 정렬"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => applyTextAlign("right")}
                    className={`p-1.5 rounded-md border transition-colors ${
                      objTextAlign === "right" ? "bg-[#00e5cc]/20 border-[#00e5cc]/30 text-[#00e5cc]" : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                    title="오른쪽 정렬"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Color Controls ── */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground block mb-2">색상</label>
            <div className="space-y-2">
              <ColorPickerInline
                label={isPathObj ? "선 색상" : "채우기"}
                value={objFillColor}
                onChange={applyFillColor}
              />
              {!isPathObj && (
                <ColorPickerInline
                  label="테두리"
                  value={objStrokeColor || "transparent"}
                  onChange={applyStrokeColor}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Script Editor (pro mode) ── */}
      {isPro && activeCut && (
        <div className="border-t border-border pt-3">
          <label className="text-[10px] font-medium text-muted-foreground block mb-2">스크립트</label>
          <div className="space-y-3">
            <ScriptEditor
              label="상단 자막"
              script={activeCut.scriptTop}
              onChange={(s) =>
                dispatch({ type: "UPDATE_CUT_SCRIPT", cutId: activeCut.id, position: "top", script: s })
              }
            />
            <ScriptEditor
              label="하단 자막"
              script={activeCut.scriptBottom}
              onChange={(s) =>
                dispatch({ type: "UPDATE_CUT_SCRIPT", cutId: activeCut.id, position: "bottom", script: s })
              }
            />
          </div>
        </div>
      )}

      {/* ── Layer list ── */}
      <div className="border-t border-border pt-3">
        <label className="text-[10px] font-medium text-muted-foreground block mb-2">
          레이어 ({layers.length})
        </label>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50 text-xs text-muted-foreground">
            <Image className="w-3 h-3 shrink-0" />
            <span className="flex-1 truncate">
              {activeCut?.backgroundImageUrl ? "배경 이미지" : "배경 (없음)"}
            </span>
          </div>

          {layers.length === 0 && !hasSelection && (
            <p className="text-[10px] text-muted-foreground/50 text-center py-2">
              캔버스에 오브젝트가 없습니다
            </p>
          )}

          {layers.map((layer, i) => {
            const Icon = getLayerIcon(layer.type);
            return (
              <div
                key={layer.id + i}
                onClick={() => handleSelectLayer(i)}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-xs text-foreground cursor-pointer group transition-colors"
              >
                <GripVertical className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate">{layer.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLayer(i);
                  }}
                  className="p-0.5 rounded hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="삭제"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cut actions ── */}
      <div className="border-t border-border pt-3">
        <label className="text-[10px] font-medium text-muted-foreground block mb-2">
          컷 설정
        </label>
        <div className="space-y-1.5">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs"
            onClick={handleDuplicateCut}
          >
            <Copy className="w-3 h-3" />
            컷 복제
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs text-red-400 hover:text-red-300"
            onClick={() => {
              if (activeCut) {
                dispatch({ type: "HISTORY_PUSH" });
                dispatch({ type: "REMOVE_CUT", cutId: activeCut.id });
              }
            }}
          >
            <Trash2 className="w-3 h-3" />
            컷 삭제
          </Button>
        </div>
      </div>
    </div>
  );
}
