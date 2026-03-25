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
  Eye,
  RotateCw,
  Maximize2,
  Palette,
  Scissors,
  FileText,
} from "lucide-react";
import { useWorkspace, useActiveCut, useActiveScene, useCanvasRef } from "@/hooks/use-workspace";
import { genId } from "@/contexts/workspace-context";
import { FONT_OPTIONS, COLOR_PRESETS } from "@/components/canva-editor/types";
import type { Cut, CutScript } from "@/lib/workspace-types";

// ─── Layer icon helper ───────────────────────────────────────────────────────

function getLayerIcon(type: string) {
  switch (type) {
    case "textbox": return Type;
    case "group": return MessageSquare;
    case "path": return Pencil;
    case "image": return Image;
    default: return Layers;
  }
}

// ─── Tab Types (3 merged tabs) ──────────────────────────────────────────────

type PanelTab = "layers" | "format" | "cutSettings";

interface TabDef {
  id: PanelTab;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const TABS: TabDef[] = [
  { id: "layers", icon: Layers, label: "레이어" },
  { id: "format", icon: Palette, label: "포맷" },
  { id: "cutSettings", icon: Scissors, label: "컷" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export function PropertiesPanel() {
  const { state, dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const activeScene = useActiveScene();
  const canvasRef = useCanvasRef();
  const hasSelection = state.selectedObjectIds.length > 0;
  const layers = state.canvasLayers;

  const [activeTab, setActiveTab] = useState<PanelTab | null>(null);

  const toggleTab = (id: PanelTab) => {
    setActiveTab((prev) => (prev === id ? null : id));
  };
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(-1);

  // Selected object properties
  const [objScale, setObjScale] = useState(100);
  const [objOpacity, setObjOpacity] = useState(100);
  const [objAngle, setObjAngle] = useState(0);
  const [objLocked, setObjLocked] = useState(false);
  const [objFontFamily, setObjFontFamily] = useState(FONT_OPTIONS[0].family);
  const [objFontSize, setObjFontSize] = useState(24);
  const [objBold, setObjBold] = useState(false);
  const [objItalic, setObjItalic] = useState(false);
  const [objUnderline, setObjUnderline] = useState(false);
  const [objStrikethrough, setObjStrikethrough] = useState(false);
  const [objTextAlign, setObjTextAlign] = useState("left");
  const [objFillColor, setObjFillColor] = useState("#000000");
  const [objStrokeColor, setObjStrokeColor] = useState("");
  const [objType, setObjType] = useState("");

  // ─── Sync from canvas selection ────────────────────────────────────────────

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
      setObjFillColor((obj.fill as string) || "#000000");
      setObjStrokeColor((obj.stroke as string) || "");

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

      const objs = fc.getObjects();
      setActiveLayerIndex(objs.indexOf(obj));
    } else {
      setActiveLayerIndex(-1);
    }
  }, [canvasRef]);

  useEffect(() => { syncFromCanvas(); }, [state.selectedObjectIds, syncFromCanvas]);

  useEffect(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const onSelect = () => {
      const obj = fc.getActiveObject();
      if (obj) setActiveLayerIndex(fc.getObjects().indexOf(obj));
    };
    const onClear = () => setActiveLayerIndex(-1);
    fc.on("selection:created", onSelect);
    fc.on("selection:updated", onSelect);
    fc.on("selection:cleared", onClear);
    return () => {
      fc.off("selection:created", onSelect);
      fc.off("selection:updated", onSelect);
      fc.off("selection:cleared", onClear);
    };
  }, [canvasRef, activeCut?.id]);

  // Auto-switch to format tab when object selected
  useEffect(() => {
    if (hasSelection) {
      setActiveTab("format");
    }
  }, [hasSelection]);

  // ─── Apply helpers ─────────────────────────────────────────────────────────

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
    obj.set({ lockMovementX: locked, lockMovementY: locked, lockRotation: locked, lockScalingX: locked, lockScalingY: locked, hasControls: !locked });
    setObjLocked(locked);
    fc!.requestRenderAll();
  }
  function applyFontFamily(val: string) {
    setObjFontFamily(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) { (obj as any).set({ fontFamily: val }); fc!.requestRenderAll(); }
  }
  function applyFontSize(val: number) {
    setObjFontSize(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) { (obj as any).set({ fontSize: val }); fc!.requestRenderAll(); }
  }
  function applyBold(val: boolean) {
    setObjBold(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) { (obj as any).set({ fontWeight: val ? "bold" : "normal" }); fc!.requestRenderAll(); }
  }
  function applyItalic(val: boolean) {
    setObjItalic(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) { (obj as any).set({ fontStyle: val ? "italic" : "normal" }); fc!.requestRenderAll(); }
  }
  function applyUnderline(val: boolean) {
    setObjUnderline(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) { (obj as any).set({ underline: val }); fc!.requestRenderAll(); }
  }
  function applyStrikethrough(val: boolean) {
    setObjStrikethrough(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) { (obj as any).set({ linethrough: val }); fc!.requestRenderAll(); }
  }
  function applyTextAlign(val: string) {
    setObjTextAlign(val);
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) { (obj as any).set({ textAlign: val }); fc!.requestRenderAll(); }
  }
  function applyFillColor(val: string) {
    setObjFillColor(val);
    const { fc, obj } = getObj();
    if (!obj) return;
    if (obj.type === "path" || obj.type === "line" || obj.type === "polyline") { obj.set({ stroke: val }); }
    else { obj.set({ fill: val }); }
    fc!.requestRenderAll();
  }
  function applyStrokeColor(val: string) {
    setObjStrokeColor(val);
    const { fc, obj } = getObj();
    if (obj) { obj.set({ stroke: val }); fc!.requestRenderAll(); }
  }
  function bringToFront() { const { fc, obj } = getObj(); if (fc && obj) { fc.bringObjectToFront(obj); fc.requestRenderAll(); } }
  function bringForward() { const { fc, obj } = getObj(); if (fc && obj) { fc.bringObjectForward(obj); fc.requestRenderAll(); } }
  function sendBackward() { const { fc, obj } = getObj(); if (fc && obj) { fc.sendObjectBackwards(obj); fc.requestRenderAll(); } }
  function sendToBack() { const { fc, obj } = getObj(); if (fc && obj) { fc.sendObjectToBack(obj); fc.requestRenderAll(); } }

  function duplicateObject() {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) return;
    obj.clone().then((cloned: any) => {
      cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
      fc.add(cloned); fc.setActiveObject(cloned); fc.requestRenderAll();
    });
  }
  function deleteObject() {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    fc.getActiveObjects().forEach((o: any) => fc.remove(o));
    fc.discardActiveObject(); fc.requestRenderAll();
    dispatch({ type: "SELECT_OBJECTS", objectIds: [] });
  }
  function flipHorizontal() { const { fc, obj } = getObj(); if (obj) { obj.set({ flipX: !obj.flipX }); fc!.requestRenderAll(); } }

  function handleDeleteLayer(index: number) {
    const fc = canvasRef.current?.getCanvas(); if (!fc) return;
    const target = fc.getObjects()[index];
    if (target) { fc.remove(target); fc.requestRenderAll(); }
  }
  function handleSelectLayer(index: number) {
    const fc = canvasRef.current?.getCanvas(); if (!fc) return;
    const target = fc.getObjects()[index];
    if (target) { fc.setActiveObject(target); fc.requestRenderAll(); setActiveLayerIndex(index); }
  }
  function handleDuplicateCut() {
    if (!activeCut || !activeScene) return;
    dispatch({ type: "HISTORY_PUSH" });
    const newCut: Cut = {
      id: genId("cut"), sceneId: activeScene.id, order: activeScene.cuts.length + 1,
      canvasJSON: activeCut.canvasJSON ? JSON.parse(JSON.stringify(activeCut.canvasJSON)) : null,
      thumbnailUrl: activeCut.thumbnailUrl, backgroundImageUrl: activeCut.backgroundImageUrl,
      scriptTop: activeCut.scriptTop ? { ...activeCut.scriptTop } : null,
      scriptBottom: activeCut.scriptBottom ? { ...activeCut.scriptBottom } : null,
    };
    dispatch({ type: "ADD_CUT", sceneId: activeScene.id, cut: newCut });
    dispatch({ type: "SET_ACTIVE_CUT", cutId: newCut.id });
  }

  const isTextObj = objType === "textbox" || objType === "i-text";
  const isPathObj = objType === "path" || objType === "line" || objType === "polyline";

  return (
    <div className="h-full flex shrink-0">
      {/* ── Panel Content — only when a tab is active ── */}
      {activeTab ? (
      <div className="w-[280px] shrink-0 border-l border-white/[0.04] bg-[#0c0c10] min-h-0 overflow-y-auto">

        {/* ════════════════════════════════════════════════════════════════
            레이어 탭
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "layers" && (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">레이어</span>
              <span className="text-[12px] text-white/20 font-mono">{layers.length}</span>
            </div>

            {/* Background */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white/25">
              <Image className="w-5 h-5 shrink-0" />
              <span className="flex-1 truncate">
                {activeCut?.backgroundImageUrl ? "배경 이미지" : "배경 (없음)"}
              </span>
            </div>

            {layers.length === 0 && (
              <p className="text-center py-8 text-[12px] text-white/15">오브젝트 없음</p>
            )}

            <div className="space-y-0.5">
              {layers.map((layer, i) => {
                const Icon = getLayerIcon(layer.type);
                const isSelected = i === activeLayerIndex;
                return (
                  <div
                    key={layer.id + i}
                    onClick={() => handleSelectLayer(i)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer group transition-all ${
                      isSelected
                        ? "bg-primary/8 border border-primary/15 text-primary"
                        : "border border-transparent hover:bg-white/[0.03] text-white/50 hover:text-white/70"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-white/10 shrink-0" />
                    <Icon className={`w-5 h-5 shrink-0 ${isSelected ? "text-primary" : "text-white/30"}`} />
                    <span className="flex-1 truncate text-[12px]">{layer.label}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteLayer(i); }}
                      className="p-0.5 rounded-lg hover:bg-red-500/15 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4 text-red-400/60" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            포맷 탭 (속성 + 텍스트 + 색상 통합)
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "format" && (
          <div className="p-3 space-y-4">
            {!hasSelection ? (
              <p className="text-center py-12 text-[12px] text-white/15">오브젝트를 선택하세요</p>
            ) : (
              <>
                {/* ── Actions ── */}
                <div className="flex items-center gap-1 flex-wrap">
                  <IcoBtn
                    icon={objLocked ? Lock : Unlock}
                    active={objLocked}
                    activeColor="amber"
                    onClick={toggleLock}
                    tooltip={objLocked ? "잠금 해제" : "잠금"}
                  />
                  <IcoBtn icon={FlipHorizontal2} onClick={flipHorizontal} tooltip="좌우 반전" />
                  <IcoBtn icon={Copy} onClick={duplicateObject} tooltip="복제" />
                  <IcoBtn icon={Trash2} onClick={deleteObject} tooltip="삭제" destructive />
                  <div className="w-px h-4 bg-white/[0.06] mx-0.5" />
                  <IcoBtn icon={ChevronsUp} onClick={bringToFront} tooltip="맨 앞" />
                  <IcoBtn icon={ArrowUp} onClick={bringForward} tooltip="앞으로" />
                  <IcoBtn icon={ArrowDown} onClick={sendBackward} tooltip="뒤로" />
                  <IcoBtn icon={ChevronsDown} onClick={sendToBack} tooltip="맨 뒤" />
                </div>

                {/* ── Transform ── */}
                <Section label="변환">
                  <Slider icon={Maximize2} label="크기" value={objScale} min={10} max={300} unit="%" onChange={applyScale} />
                  <Slider icon={Eye} label="투명" value={objOpacity} min={0} max={100} unit="%" onChange={applyOpacity} />
                  <Slider icon={RotateCw} label="회전" value={objAngle} min={0} max={360} unit="°" onChange={applyAngle} />
                </Section>

                {/* ── Text (conditional) ── */}
                {isTextObj && (
                  <Section label="텍스트">
                    <select
                      value={objFontFamily}
                      onChange={(e) => applyFontFamily(e.target.value)}
                      className="w-full text-[12px] bg-white/[0.03] text-white/70 rounded-xl border border-white/[0.06] px-2.5 py-2 focus:outline-none focus:border-primary/30 transition-colors"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.family} value={f.family}>{f.label}</option>
                      ))}
                    </select>
                    <Slider icon={Type} label="크기" value={objFontSize} min={8} max={120} unit="px" onChange={applyFontSize} />
                    <div className="flex items-center gap-1">
                      <IcoBtn icon={Bold} active={objBold} onClick={() => applyBold(!objBold)} tooltip="굵게" />
                      <IcoBtn icon={Italic} active={objItalic} onClick={() => applyItalic(!objItalic)} tooltip="기울임" />
                      <IcoBtn icon={Underline} active={objUnderline} onClick={() => applyUnderline(!objUnderline)} tooltip="밑줄" />
                      <IcoBtn icon={Strikethrough} active={objStrikethrough} onClick={() => applyStrikethrough(!objStrikethrough)} tooltip="취소선" />
                      <div className="w-px h-4 bg-white/[0.06] mx-0.5" />
                      <IcoBtn icon={AlignLeft} active={objTextAlign === "left"} onClick={() => applyTextAlign("left")} tooltip="왼쪽" />
                      <IcoBtn icon={AlignCenter} active={objTextAlign === "center"} onClick={() => applyTextAlign("center")} tooltip="가운데" />
                      <IcoBtn icon={AlignRight} active={objTextAlign === "right"} onClick={() => applyTextAlign("right")} tooltip="오른쪽" />
                    </div>
                  </Section>
                )}

                {/* ── Color ── */}
                <Section label={isPathObj ? "선 색상" : "색상"}>
                  <ColorGrid value={objFillColor} onChange={applyFillColor} />
                  {!isPathObj && (
                    <>
                      <span className="text-[12px] text-white/20 font-medium block mt-2">테두리</span>
                      <ColorGrid value={objStrokeColor || "transparent"} onChange={applyStrokeColor} />
                    </>
                  )}
                </Section>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            컷 설정 탭 (스크립트 + 컷 통합)
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === "cutSettings" && (
          <div className="p-3 space-y-4">
            {!activeCut ? (
              <p className="text-center py-12 text-[12px] text-white/15">컷을 선택하세요</p>
            ) : (
              <>
                {/* ── Cut actions ── */}
                <div className="flex gap-1.5">
                  <button
                    onClick={handleDuplicateCut}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] text-[12px] text-white/50 hover:text-white/70 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    복제
                  </button>
                  <button
                    onClick={() => {
                      if (activeCut) { dispatch({ type: "HISTORY_PUSH" }); dispatch({ type: "REMOVE_CUT", cutId: activeCut.id }); }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/[0.03] border border-red-500/[0.06] hover:bg-red-500/10 hover:border-red-500/15 text-[12px] text-red-400/50 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </button>
                </div>

                {/* ── Background preview ── */}
                {activeCut.backgroundImageUrl && (
                  <div>
                    <span className="text-[12px] text-white/20 font-medium block mb-1.5">배경</span>
                    <div className="relative rounded-xl overflow-hidden border border-white/[0.04]">
                      <img src={activeCut.backgroundImageUrl} alt="배경" className="w-full aspect-video object-cover" />
                      <button
                        onClick={() => {
                          dispatch({ type: "HISTORY_PUSH" });
                          dispatch({ type: "UPDATE_CUT_BACKGROUND", cutId: activeCut.id, backgroundImageUrl: "" });
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-red-500/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Scripts ── */}
                <Section label="자막">
                  <ScriptEditor
                    label="상단"
                    script={activeCut.scriptTop}
                    onChange={(s) => dispatch({ type: "UPDATE_CUT_SCRIPT", cutId: activeCut.id, position: "top", script: s })}
                  />
                  <ScriptEditor
                    label="하단"
                    script={activeCut.scriptBottom}
                    onChange={(s) => dispatch({ type: "UPDATE_CUT_SCRIPT", cutId: activeCut.id, position: "bottom", script: s })}
                  />
                </Section>
              </>
            )}
          </div>
        )}
      </div>
      ) : null}

      {/* ── Icon Rail (Right) ── */}
      <div className="w-[52px] shrink-0 border-l border-white/[0.04] bg-[#0c0c10] flex flex-col items-center py-3 gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => toggleTab(tab.id)}
              className={`w-11 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative group ${
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-white/25 hover:text-white/50 hover:bg-white/[0.03]"
              }`}
              title={tab.label}
            >
              <tab.icon className="w-5 h-5" />
              <span className={`left-icon-sidebar__label transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}>{tab.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-l-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Script Editor ───────────────────────────────────────────────────────────

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
  const color = script?.color || "#ffffff";
  const fontFamily = script?.fontFamily || FONT_OPTIONS[0].family;
  const bold = script?.bold || false;
  const style = script?.style || "filled";
  const bgColor = script?.bgColor || "rgba(0,0,0,0.6)";

  function update(partial: Partial<CutScript>) {
    const current: CutScript = { text, fontSize, color, fontFamily, bold, style, bgColor, ...partial };
    if (!current.text) { onChange(null); } else { onChange(current); }
  }

  const STYLES: { id: CutScript["style"]; label: string }[] = [
    { id: "filled", label: "채움" },
    { id: "box", label: "박스" },
    { id: "handwritten-box", label: "손글씨" },
    { id: "no-bg", label: "배경없음" },
    { id: "no-border", label: "테두리없음" },
  ];

  return (
    <div className="space-y-1.5">
      <span className="text-[12px] text-white/25 font-medium">{label}</span>
      <textarea
        value={text}
        onChange={(e) => update({ text: e.target.value })}
        placeholder={`${label} 자막...`}
        rows={2}
        className="w-full px-2.5 py-2 text-[12px] bg-white/[0.03] text-white/70 rounded-xl border border-white/[0.04] focus:outline-none focus:border-primary/25 resize-none placeholder:text-white/15 transition-colors"
      />
      {text && (
        <div className="space-y-1.5">
          <select
            value={fontFamily}
            onChange={(e) => update({ fontFamily: e.target.value })}
            className="w-full text-[12px] bg-white/[0.03] text-white/60 rounded-lg border border-white/[0.04] px-2 py-1.5 focus:outline-none focus:border-primary/25 transition-colors"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.family} value={f.family}>{f.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={fontSize}
              onChange={(e) => update({ fontSize: Number(e.target.value) })}
              min={8}
              max={48}
              className="w-12 text-[12px] bg-white/[0.03] text-white/60 rounded-lg border border-white/[0.04] px-2 py-1.5 text-center focus:outline-none focus:border-primary/25 transition-colors"
            />
            <button
              onClick={() => update({ bold: !bold })}
              className={`px-2 py-1.5 rounded-lg border text-[12px] font-bold transition-all ${
                bold ? "bg-primary/10 border-primary/20 text-primary" : "border-white/[0.04] text-white/25 hover:text-white/40"
              }`}
            >B</button>
            <input type="color" value={color} onChange={(e) => update({ color: e.target.value })} className="w-8 h-8 cursor-pointer rounded-lg border border-white/[0.06] bg-transparent" />
            <input type="color" value={bgColor === "rgba(0,0,0,0.6)" ? "#000000" : bgColor} onChange={(e) => update({ bgColor: e.target.value })} className="w-8 h-8 cursor-pointer rounded-lg border border-white/[0.06] bg-transparent" title="배경" />
          </div>
          <div className="flex gap-0.5 flex-wrap">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => update({ style: s.id })}
                className={`px-2 py-1 rounded-lg text-[12px] font-medium transition-all ${
                  style === s.id
                    ? "bg-primary/10 text-primary border border-primary/15"
                    : "bg-white/[0.02] text-white/25 border border-white/[0.04] hover:text-white/40"
                }`}
              >{s.label}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared Sub-components ───────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-semibold text-white/25 uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-white/[0.03]" />
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function IcoBtn({
  icon: Icon, onClick, tooltip, active, activeColor, destructive,
}: {
  icon: React.ComponentType<{ className?: string }>; onClick: () => void; tooltip: string;
  active?: boolean; activeColor?: "amber"; destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        active
          ? activeColor === "amber"
            ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
            : "bg-primary/10 text-primary border border-primary/15"
          : destructive
            ? "text-white/25 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
            : "text-white/25 hover:text-white/50 hover:bg-white/[0.04] border border-transparent"
      }`}
      title={tooltip}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function Slider({
  icon: Icon, label, value, min, max, unit, onChange,
}: {
  icon: React.ComponentType<{ className?: string }>; label: string;
  value: number; min: number; max: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-white/20 shrink-0" />
      <span className="text-[12px] text-white/30 w-8 shrink-0">{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary h-[3px]"
      />
      <span className="text-[12px] text-white/40 w-10 text-right font-mono">{value}{unit}</span>
    </div>
  );
}

function ColorGrid({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-7 gap-1">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            className={`w-full aspect-square rounded-lg border transition-all hover:scale-110 ${
              value === c
                ? "border-primary ring-1 ring-primary/20"
                : "border-white/[0.06] hover:border-white/15"
            }`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value === "transparent" ? "#000000" : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 cursor-pointer rounded-lg border border-white/[0.04] bg-transparent"
        />
        <span className="text-[12px] text-white/20 font-mono">{value}</span>
      </div>
    </div>
  );
}
