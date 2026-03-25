import { useState, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  FlipHorizontal2,
  ArrowUp,
  ArrowDown,
  Palette,
  Type,
  Minus,
  Pencil,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Wand2,
  ImageOff,
  ZoomIn,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace, useCanvasRef } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { COLOR_PRESETS, FONT_OPTIONS } from "@/components/canva-editor/types";

// ─── Floating Context Toolbar ────────────────────────────────────────────────

export function ContextToolbar() {
  const { state, dispatch } = useWorkspace();
  const canvasRef = useCanvasRef();
  const { sendMessage, isGenerating } = useCopilot();
  const hasSelection = state.selectedObjectIds.length > 0;

  const [objType, setObjType] = useState("");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [regenPrompt, setRegenPrompt] = useState("");

  // Track selected object position
  const updatePosition = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const obj = fc.getActiveObject();
    if (!obj) {
      setVisible(false);
      return;
    }

    setObjType(obj.type || "");
    const bound = obj.getBoundingRect();
    const canvasEl = fc.getElement();
    if (!canvasEl) return;

    const canvasRect = canvasEl.getBoundingClientRect();
    const x = canvasRect.left + bound.left + bound.width / 2;
    const y = canvasRect.top + bound.top - 12;

    setPos({ x, y });
    setVisible(true);
  }, [canvasRef]);

  useEffect(() => {
    updatePosition();
  }, [state.selectedObjectIds, updatePosition]);

  // Listen to canvas events
  useEffect(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const handler = () => updatePosition();
    fc.on("object:moving", handler);
    fc.on("object:scaling", handler);
    fc.on("object:rotating", handler);
    fc.on("selection:created", handler);
    fc.on("selection:updated", handler);
    fc.on("selection:cleared", () => {
      setVisible(false);
      setColorOpen(false);
      setFontOpen(false);
      setAiOpen(false);
    });
    return () => {
      fc.off("object:moving", handler);
      fc.off("object:scaling", handler);
      fc.off("object:rotating", handler);
      fc.off("selection:created", handler);
      fc.off("selection:updated", handler);
      fc.off("selection:cleared");
    };
  }, [canvasRef, updatePosition]);

  // ─── Helpers ──────────────────────────────────────────────────

  function getObj() {
    const fc = canvasRef.current?.getCanvas();
    return { fc, obj: fc?.getActiveObject() };
  }

  function applyFill(color: string) {
    const { fc, obj } = getObj();
    if (!obj) return;
    if (obj.type === "path" || obj.type === "line") {
      obj.set({ stroke: color });
    } else {
      obj.set({ fill: color });
    }
    fc!.requestRenderAll();
    setColorOpen(false);
  }

  function applyFont(family: string) {
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ fontFamily: family });
      fc!.requestRenderAll();
    }
    setFontOpen(false);
  }

  function toggleBold() {
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      const t = obj as any;
      t.set({ fontWeight: t.fontWeight === "bold" ? "normal" : "bold" });
      fc!.requestRenderAll();
    }
  }

  function toggleItalic() {
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      const t = obj as any;
      t.set({ fontStyle: t.fontStyle === "italic" ? "normal" : "italic" });
      fc!.requestRenderAll();
    }
  }

  function toggleUnderline() {
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      const t = obj as any;
      t.set({ underline: !t.underline });
      fc!.requestRenderAll();
    }
  }

  function setTextAlign(align: string) {
    const { fc, obj } = getObj();
    if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
      (obj as any).set({ textAlign: align });
      fc!.requestRenderAll();
    }
  }

  function deleteObject() {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    fc.getActiveObjects().forEach((o: any) => fc.remove(o));
    fc.discardActiveObject();
    fc.requestRenderAll();
    dispatch({ type: "SELECT_OBJECTS", objectIds: [] });
    setVisible(false);
  }

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

  function flipH() {
    const { fc, obj } = getObj();
    if (obj) { obj.set({ flipX: !obj.flipX }); fc!.requestRenderAll(); }
  }

  function bringForward() {
    const { fc, obj } = getObj();
    if (fc && obj) { fc.bringObjectForward(obj); fc.requestRenderAll(); }
  }

  function sendBackward() {
    const { fc, obj } = getObj();
    if (fc && obj) { fc.sendObjectBackwards(obj); fc.requestRenderAll(); }
  }

  // ─── AI Actions ──────────────────────────────────────────────

  function handleAIRegenerate() {
    const prompt = regenPrompt.trim() || "이 요소를 다른 스타일로 다시 생성해줘";
    sendMessage(prompt);
    setAiOpen(false);
    setRegenPrompt("");
  }

  function handleAIStyleChange() {
    sendMessage("현재 컷의 스타일을 변경해줘");
    setAiOpen(false);
  }

  function handleAIUpscale() {
    sendMessage("현재 이미지를 2배 고해상도로 업스케일 해줘");
    setAiOpen(false);
  }

  function handleAIRemoveBg() {
    sendMessage("선택한 이미지의 배경을 제거해줘");
    setAiOpen(false);
  }

  if (!visible || !hasSelection) return null;

  const isText = objType === "textbox" || objType === "i-text";
  const isImage = objType === "image";
  const isGroup = objType === "group";
  const isPath = objType === "path";
  const isLine = objType === "line";

  // Type label + icon
  const typeLabel = isText ? "텍스트" : isPath ? "드로잉" : isLine ? "선" : isGroup ? "말풍선" : isImage ? "이미지" : "요소";
  const TypeIcon = isText ? Type : isPath ? Pencil : isLine ? Minus : isGroup ? MessageSquare : isImage ? Palette : Palette;

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#111116]/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl shadow-[0_16px_56px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)_inset]">
        {/* Type indicator chip */}
        <div className="flex items-center gap-2 px-3.5 py-2 mr-1 bg-white/[0.04] rounded-2xl">
          <TypeIcon className="w-5 h-5 text-primary" />
          <span className="text-[12px] text-white/50 font-bold">{typeLabel}</span>
        </div>

        <Divider />

        {/* Text formatting */}
        {isText && (
          <>
            {/* Font picker */}
            <div className="relative">
              <ToolBtn icon={Type} onClick={() => { setFontOpen(!fontOpen); setColorOpen(false); setAiOpen(false); }} tooltip="폰트" active={fontOpen} size="lg" />
              {fontOpen && (
                <DropdownPanel className="w-44">
                  <span className="text-[12px] text-white/30 font-semibold px-1 mb-1 block">폰트 선택</span>
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.family}
                      onClick={() => applyFont(f.family)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] text-white/60 hover:bg-white/[0.06] hover:text-white transition-colors"
                      style={{ fontFamily: f.family }}
                    >
                      {f.label}
                    </button>
                  ))}
                </DropdownPanel>
              )}
            </div>
            <ToolBtn icon={Bold} onClick={toggleBold} tooltip="굵게" size="lg" />
            <ToolBtn icon={Italic} onClick={toggleItalic} tooltip="기울임" size="lg" />
            <ToolBtn icon={Underline} onClick={toggleUnderline} tooltip="밑줄" size="lg" />
            <Divider />
            <ToolBtn icon={AlignLeft} onClick={() => setTextAlign("left")} tooltip="왼쪽" size="lg" />
            <ToolBtn icon={AlignCenter} onClick={() => setTextAlign("center")} tooltip="가운데" size="lg" />
            <ToolBtn icon={AlignRight} onClick={() => setTextAlign("right")} tooltip="오른쪽" size="lg" />
            <Divider />
          </>
        )}

        {/* Color */}
        <div className="relative">
          <ToolBtn
            icon={Palette}
            onClick={() => { setColorOpen(!colorOpen); setFontOpen(false); setAiOpen(false); }}
            tooltip="색상"
            active={colorOpen}
            size="lg"
          />
          {colorOpen && (
            <DropdownPanel className="w-[168px]">
              <span className="text-[12px] text-white/30 font-semibold px-1 mb-1.5 block">빠른 색상</span>
              <div className="grid grid-cols-6 gap-1.5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => applyFill(c)}
                    className="w-6 h-6 rounded-lg border border-white/10 hover:scale-125 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </DropdownPanel>
          )}
        </div>

        <Divider />

        {/* Common actions */}
        <ToolBtn icon={FlipHorizontal2} onClick={flipH} tooltip="반전" size="lg" />
        <ToolBtn icon={ArrowUp} onClick={bringForward} tooltip="앞으로" size="lg" />
        <ToolBtn icon={ArrowDown} onClick={sendBackward} tooltip="뒤로" size="lg" />

        <Divider />

        {/* AI Actions */}
        <div className="relative">
          <button
            onClick={() => { setAiOpen(!aiOpen); setColorOpen(false); setFontOpen(false); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[12px] font-bold transition-all",
              aiOpen
                ? "bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary border border-primary/30"
                : isGenerating
                  ? "bg-primary/10 text-primary/60 border border-primary/20"
                  : "bg-gradient-to-r from-primary/10 to-purple-500/10 text-white/50 hover:text-primary border border-white/[0.06] hover:border-primary/30"
            )}
            title="AI 도구"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            AI
          </button>
          {aiOpen && (
            <DropdownPanel className="w-56 right-0 left-auto">
              <span className="text-[12px] text-white/30 font-semibold px-1 mb-2 block">AI 도구</span>

              {/* Quick AI actions */}
              <div className="space-y-0.5 mb-2">
                <AIActionBtn
                  icon={RefreshCw}
                  label="재생성"
                  desc="다른 버전으로 다시 생성"
                  onClick={handleAIRegenerate}
                  disabled={isGenerating}
                />
                <AIActionBtn
                  icon={Wand2}
                  label="스타일 변경"
                  desc="다른 아트 스타일 적용"
                  onClick={handleAIStyleChange}
                  disabled={isGenerating}
                />
                <AIActionBtn
                  icon={ZoomIn}
                  label="업스케일 2x"
                  desc="고해상도로 확대"
                  onClick={handleAIUpscale}
                  disabled={isGenerating}
                />
                {isImage && (
                  <AIActionBtn
                    icon={ImageOff}
                    label="배경 제거"
                    desc="이미지 배경 투명 처리"
                    onClick={handleAIRemoveBg}
                    disabled={isGenerating}
                  />
                )}
              </div>

              {/* Custom prompt */}
              <div className="border-t border-white/[0.06] pt-2">
                <span className="text-[12px] text-white/25 block mb-1.5">프롬프트로 수정</span>
                <div className="flex gap-1">
                  <input
                    value={regenPrompt}
                    onChange={(e) => setRegenPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAIRegenerate(); }}
                    placeholder="예: 웃는 표정으로..."
                    className="flex-1 px-2.5 py-1.5 text-[12px] bg-white/[0.04] text-white/70 rounded-lg border border-white/[0.08] focus:outline-none focus:border-primary/40 placeholder:text-white/20"
                  />
                  <button
                    onClick={handleAIRegenerate}
                    disabled={isGenerating}
                    className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-bold hover:bg-primary/90 disabled:opacity-30 transition-all"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "실행"}
                  </button>
                </div>
              </div>
            </DropdownPanel>
          )}
        </div>

        <Divider />

        {/* Copy / Delete */}
        <ToolBtn icon={Copy} onClick={duplicateObject} tooltip="복제" size="lg" />
        <ToolBtn icon={Trash2} onClick={deleteObject} tooltip="삭제" size="lg" destructive />
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-px h-8 bg-white/[0.06] mx-1" />;
}

function ToolBtn({
  icon: Icon,
  onClick,
  tooltip,
  active,
  destructive,
  size = "md",
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  tooltip: string;
  active?: boolean;
  destructive?: boolean;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const iconSize = size === "lg" ? "w-5 h-5" : "w-5 h-5";
  return (
    <button
      onClick={onClick}
      className={cn(
        sizeClass,
        "rounded-2xl flex items-center justify-center transition-all",
        active
          ? "bg-primary/15 text-primary shadow-[0_0_12px_rgba(0,229,204,0.15)]"
          : destructive
            ? "text-white/30 hover:text-red-400 hover:bg-red-500/10"
            : "text-white/35 hover:text-white/80 hover:bg-white/[0.08]"
      )}
      title={tooltip}
    >
      <Icon className={iconSize} />
    </button>
  );
}

function DropdownPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "absolute top-full left-1/2 -translate-x-1/2 mt-3 p-2.5 bg-[#111116]/98 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-[0_16px_64px_rgba(0,0,0,0.6)] z-50",
      className
    )}>
      {children}
    </div>
  );
}

function AIActionBtn({
  icon: Icon,
  label,
  desc,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all disabled:opacity-30 group text-left"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center shrink-0 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-[12px] font-semibold text-white/70 group-hover:text-white/90">{label}</p>
        <p className="text-[12px] text-white/25">{desc}</p>
      </div>
    </button>
  );
}
