import { useState } from "react";
import {
  Wand2,
  PaintBucket,
  Expand,
  ZoomIn,
  MousePointer,
  Loader2,
  Brush,
  Circle,
  Square,
  Lasso,
  Palette,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopilot } from "@/hooks/use-copilot";

type GenTool = "fill" | "expand" | "upscale" | "object";
type SelectionTool = "brush" | "lasso" | "rectangle" | "ellipse";

const GEN_TOOLS: { id: GenTool; label: string; desc: string; icon: React.ComponentType<{ className?: string }>; gradient: string }[] = [
  { id: "fill", label: "생성 채우기", desc: "영역 선택 후 AI 채우기", icon: PaintBucket, gradient: "from-violet-500/15 to-fuchsia-500/15" },
  { id: "expand", label: "캔버스 확장", desc: "AI로 가장자리 확장", icon: Expand, gradient: "from-blue-500/15 to-cyan-500/15" },
  { id: "upscale", label: "고해상도 2x", desc: "AI 업스케일링", icon: ZoomIn, gradient: "from-emerald-500/15 to-green-500/15" },
  { id: "object", label: "오브젝트", desc: "자동 감지 + 수정", icon: MousePointer, gradient: "from-amber-500/15 to-orange-500/15" },
];

const SELECTION_TOOLS: { id: SelectionTool; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "brush", label: "브러시", icon: Brush },
  { id: "lasso", label: "올가미", icon: Lasso },
  { id: "rectangle", label: "사각형", icon: Square },
  { id: "ellipse", label: "타원", icon: Circle },
];

export function GenerativePanel() {
  const { sendMessage, isGenerating } = useCopilot();
  const [activeTool, setActiveTool] = useState<GenTool>("fill");
  const [selectionTool, setSelectionTool] = useState<SelectionTool>("brush");
  const [fillPrompt, setFillPrompt] = useState("");
  const [brushSize, setBrushSize] = useState(30);
  const [expandPrompt, setExpandPrompt] = useState("");

  function handleGenFill() {
    if (!fillPrompt.trim() || isGenerating) return;
    sendMessage(`선택한 영역을 "${fillPrompt}" 으로 AI 생성 채우기 해줘`);
  }

  function handleExpand(direction?: string) {
    if (isGenerating) return;
    const dirText = direction ? `${direction} 방향으로 ` : "";
    const promptText = expandPrompt.trim() ? ` "${expandPrompt}" 스타일로` : "";
    sendMessage(`캔버스를 ${dirText}AI로 확장해줘${promptText}`);
  }

  function handleUpscale() {
    if (isGenerating) return;
    sendMessage("현재 이미지를 2배 고해상도로 업스케일 해줘");
  }

  function handleObjectAction(action: "color" | "fill") {
    if (isGenerating) return;
    if (action === "color") {
      sendMessage("선택한 오브젝트의 색상을 변경해줘");
    } else {
      sendMessage("선택한 오브젝트를 AI로 수정해줘");
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-white/80">생성 AI</h3>
          <p className="text-[13px] text-white/25">고급 AI 이미지 편집 도구</p>
        </div>
      </div>

      {/* Tool selector - horizontal strip */}
      <div className="flex gap-1.5">
        {GEN_TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border transition-all",
                isActive
                  ? `border-primary/20 bg-gradient-to-b ${tool.gradient}`
                  : "border-white/[0.03] hover:border-white/[0.06] bg-white/[0.01]"
              )}
            >
              <tool.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-white/20")} />
              <span className={cn("text-[13px] font-semibold", isActive ? "text-primary/80" : "text-white/20")}>
                {tool.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active tool description */}
      <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.03]">
        <p className="text-[13px] text-white/40 font-medium">
          {GEN_TOOLS.find((t) => t.id === activeTool)?.desc}
        </p>
      </div>

      {/* ── Generative Fill ────────────────────────────────── */}
      {activeTool === "fill" && (
        <div className="space-y-3">
          {/* Selection tools */}
          <div>
            <span className="text-[13px] text-white/25 font-semibold block mb-2">선택 도구</span>
            <div className="grid grid-cols-4 gap-1.5">
              {SELECTION_TOOLS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectionTool(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all",
                    selectionTool === t.id
                      ? "border-primary/30 bg-primary/[0.06] text-primary"
                      : "border-white/[0.03] text-white/20 hover:text-white/35 hover:bg-white/[0.03]"
                  )}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-[13px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brush size */}
          {selectionTool === "brush" && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[13px] text-white/25 font-semibold">브러시 크기</span>
                <span className="text-[13px] text-white/20 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded-md">{brushSize}px</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-primary h-1"
              />
            </div>
          )}

          {/* Prompt */}
          <div>
            <label className="text-[13px] text-white/25 font-semibold block mb-1.5">채울 내용</label>
            <textarea
              value={fillPrompt}
              onChange={(e) => setFillPrompt(e.target.value)}
              placeholder="예: 파란 하늘과 흰 구름"
              rows={2}
              className="w-full px-3.5 py-2.5 text-[13px] bg-white/[0.03] rounded-xl border border-white/[0.06] focus:outline-none focus:border-primary/30 resize-none text-white/80 placeholder:text-white/15 transition-all"
            />
          </div>

          <button
            onClick={handleGenFill}
            disabled={!fillPrompt.trim() || isGenerating}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[13px] font-bold disabled:opacity-20 hover:shadow-[0_0_24px_rgba(139,92,246,0.2)] transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <PaintBucket className="w-5 h-5" />}
            생성 채우기
          </button>
        </div>
      )}

      {/* ── Canvas Expand ──────────────────────────────────── */}
      {activeTool === "expand" && (
        <div className="space-y-3">
          {/* Direction grid */}
          <div>
            <span className="text-[13px] text-white/25 font-semibold block mb-2">확장 방향</span>
            <div className="grid grid-cols-3 gap-1.5 w-32 mx-auto">
              <div />
              <ExpandBtn icon={ChevronUp} label="상" onClick={() => handleExpand("상")} disabled={isGenerating} />
              <div />
              <ExpandBtn icon={ChevronLeft} label="좌" onClick={() => handleExpand("좌")} disabled={isGenerating} />
              <button
                onClick={() => handleExpand()}
                disabled={isGenerating}
                className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-primary/10 border border-primary/20 flex items-center justify-center hover:from-primary/20 hover:to-blue-500/20 transition-all disabled:opacity-30"
              >
                <Expand className="w-5 h-5 text-primary" />
              </button>
              <ExpandBtn icon={ChevronRight} label="우" onClick={() => handleExpand("우")} disabled={isGenerating} />
              <div />
              <ExpandBtn icon={ChevronDown} label="하" onClick={() => handleExpand("하")} disabled={isGenerating} />
              <div />
            </div>
          </div>

          {/* Optional prompt */}
          <div>
            <label className="text-[13px] text-white/25 font-semibold block mb-1.5">프롬프트 (선택)</label>
            <input
              value={expandPrompt}
              onChange={(e) => setExpandPrompt(e.target.value)}
              placeholder="예: 자연스러운 풍경으로..."
              className="w-full px-3.5 py-2.5 text-[13px] bg-white/[0.03] rounded-xl border border-white/[0.06] focus:outline-none focus:border-primary/30 text-white/80 placeholder:text-white/15 transition-all"
            />
          </div>

          <button
            onClick={() => handleExpand()}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[13px] font-bold disabled:opacity-20 hover:shadow-[0_0_24px_rgba(59,130,246,0.2)] transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Expand className="w-5 h-5" />}
            전체 방향 확장
          </button>
        </div>
      )}

      {/* ── Upscale ────────────────────────────────────────── */}
      {activeTool === "upscale" && (
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.06] to-green-500/[0.06] border border-emerald-500/10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
              <ZoomIn className="w-7 h-7 text-emerald-400/50" />
            </div>
            <p className="text-sm font-bold text-white/60 mb-1">2x 업스케일</p>
            <p className="text-[13px] text-white/25 leading-relaxed">
              현재 캔버스의 해상도를 2배로<br />
              AI가 선명하게 확대합니다
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
              <p className="text-[13px] text-white/20 mb-0.5">입력</p>
              <p className="text-[13px] font-bold text-white/40">600×800</p>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 text-center">
              <p className="text-[13px] text-emerald-400/40 mb-0.5">출력</p>
              <p className="text-[13px] font-bold text-emerald-400/60">1200×1600</p>
            </div>
          </div>

          <button
            onClick={handleUpscale}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[13px] font-bold disabled:opacity-20 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)] transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ZoomIn className="w-5 h-5" />}
            업스케일 실행
          </button>
        </div>
      )}

      {/* ── Object Selection ───────────────────────────────── */}
      {activeTool === "object" && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[13px] text-white/30 leading-relaxed">
              캔버스의 오브젝트를 클릭하면 AI가 자동으로 영역을 감지합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleObjectAction("color")}
              disabled={isGenerating}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/[0.04] hover:border-amber-500/20 hover:bg-amber-500/[0.03] transition-all disabled:opacity-30 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-all">
                <Palette className="w-5 h-5 text-amber-400/60" />
              </div>
              <span className="text-[13px] text-white/40 font-semibold group-hover:text-white/60">색상 변경</span>
            </button>
            <button
              onClick={() => handleObjectAction("fill")}
              disabled={isGenerating}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/[0.04] hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition-all disabled:opacity-30 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center group-hover:from-violet-500/20 group-hover:to-fuchsia-500/20 transition-all">
                <Wand2 className="w-5 h-5 text-violet-400/60" />
              </div>
              <span className="text-[13px] text-white/40 font-semibold group-hover:text-white/60">AI 채우기</span>
            </button>
          </div>

          <button
            onClick={() => handleObjectAction("fill")}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[13px] font-bold disabled:opacity-20 hover:shadow-[0_0_24px_rgba(245,158,11,0.2)] transition-all"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MousePointer className="w-5 h-5" />}
            오브젝트 감지
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Expand direction button ─────────────────────────────────────────────────

function ExpandBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="aspect-square rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center hover:border-primary/20 hover:bg-primary/[0.03] transition-all disabled:opacity-30"
      title={`${label} 확장`}
    >
      <Icon className="w-5 h-5 text-white/25" />
    </button>
  );
}
