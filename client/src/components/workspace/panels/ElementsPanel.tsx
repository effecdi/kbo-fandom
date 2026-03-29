import { useState } from "react";
import {
  MessageSquare,
  Type,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { useWorkspace, useActiveCut, useCanvasRef } from "@/hooks/use-workspace";
import { Textbox, Rect, Group } from "fabric";
import { FONT_OPTIONS, COLOR_PRESETS } from "@/components/canva-editor/types";
import {
  BUBBLE_STYLE_DEFS,
  BUBBLE_COLOR_PRESETS,
  BUBBLE_TEMPLATES,
  SCRIPT_STYLES,
  SCRIPT_COLOR_PRESETS,
  type BubbleStyle,
  type ScriptStyle,
} from "@/lib/bubble-types";

type SubTab = "script" | "bubble" | "template";

// ─── Bubble positions on canvas ─────────────────────────────────────────────

const BUBBLE_POSITIONS: Record<string, { left: number; top: number }> = {
  "top-left": { left: 30, top: 30 },
  "top-right": { left: 320, top: 30 },
  "bottom-left": { left: 30, top: 620 },
  "bottom-right": { left: 320, top: 620 },
  "center": { left: 180, top: 340 },
};

function getBubbleFont(style?: string): string {
  switch (style) {
    case "handwritten": return "Cafe24Surround, Apple SD Gothic Neo, sans-serif";
    case "wobbly": return "MemomentKkukkukk, Apple SD Gothic Neo, sans-serif";
    default: return "Pretendard, Apple SD Gothic Neo, sans-serif";
  }
}

// ─── Bubble Shape Preview SVG ────────────────────────────────────────────────

function BubblePreview({ style, selected }: { style: BubbleStyle; selected: boolean }) {
  const color = selected ? "hsl(var(--primary))" : "#666";
  const fill = selected ? "rgba(0,229,204,0.1)" : "rgba(255,255,255,0.05)";

  const shapes: Record<string, React.ReactNode> = {
    rounded: <rect x="4" y="6" width="32" height="20" rx="10" fill={fill} stroke={color} strokeWidth="1.5" />,
    rectangle: <rect x="4" y="6" width="32" height="20" rx="2" fill={fill} stroke={color} strokeWidth="1.5" />,
    handwritten: (
      <path d="M6 8 Q4 6 8 6 L32 6 Q36 6 35 9 L35 23 Q36 26 32 26 L16 26 L10 30 L12 26 L8 26 Q4 26 6 23 Z"
        fill={fill} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    ),
    thought: (
      <>
        <ellipse cx="20" cy="15" rx="14" ry="9" fill={fill} stroke={color} strokeWidth="1.5" />
        <circle cx="12" cy="26" r="2" fill={fill} stroke={color} strokeWidth="1" />
        <circle cx="8" cy="29" r="1.2" fill={fill} stroke={color} strokeWidth="1" />
      </>
    ),
    shout: (
      <path d="M20 2 L26 8 L36 6 L32 14 L38 18 L30 20 L28 30 L20 24 L12 30 L10 20 L2 18 L8 14 L4 6 L14 8 Z"
        fill={fill} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    ),
    cloud: (
      <path d="M10 22 Q4 22 4 17 Q4 12 10 12 Q10 6 18 6 Q26 6 28 10 Q34 10 34 16 Q34 22 28 22 Z"
        fill={fill} stroke={color} strokeWidth="1.5" />
    ),
    spiky: (
      <path d="M20 3 L24 10 L32 6 L28 14 L36 16 L28 20 L32 28 L24 24 L20 31 L16 24 L8 28 L12 20 L4 16 L12 14 L8 6 L16 10 Z"
        fill={fill} stroke={color} strokeWidth="1.5" />
    ),
    wavy: (
      <path d="M6 10 Q10 6 14 10 Q18 14 22 10 Q26 6 30 10 L34 10 L34 22 Q30 26 26 22 Q22 18 18 22 Q14 26 10 22 Q6 18 6 22 L6 10 Z"
        fill={fill} stroke={color} strokeWidth="1.5" />
    ),
    dashed: <rect x="4" y="6" width="32" height="20" rx="10" fill={fill} stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />,
    monologue: <rect x="6" y="6" width="28" height="20" rx="1" fill={fill} stroke={color} strokeWidth="1.5" />,
  };

  return (
    <svg viewBox="0 0 40 32" className="w-full h-full">
      {shapes[style] || <rect x="4" y="6" width="32" height="20" rx="6" fill={fill} stroke={color} strokeWidth="1.5" />}
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ElementsPanel() {
  const { state, dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const canvasRef = useCanvasRef();

  const [subTab, setSubTab] = useState<SubTab>("bubble");
  const [selectedBubbleStyle, setSelectedBubbleStyle] = useState<BubbleStyle>("rounded");
  const [selectedBubbleColor, setSelectedBubbleColor] = useState(0);
  const [bubbleCategory, setBubbleCategory] = useState<"basic" | "expressive" | "decorative" | "special">("basic");

  // Script state
  const [scriptStyle, setScriptStyle] = useState<ScriptStyle>("filled");
  const [scriptColorIdx, setScriptColorIdx] = useState(0);

  // ── Add bubble to canvas ────────────────────────────────────────────────
  function addBubble(style: BubbleStyle, text: string = "", position: string = "center") {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;

    const pos = BUBBLE_POSITIONS[position] || BUBBLE_POSITIONS["center"];
    const colorPreset = BUBBLE_COLOR_PRESETS[selectedBubbleColor];

    const textObj = new Textbox(text || "텍스트 입력", {
      left: 14, top: 10, width: 200, fontSize: 16,
      fontFamily: getBubbleFont(style),
      fill: "#000000", textAlign: "center", editable: true, splitByGrapheme: true,
    });
    const textHeight = textObj.calcTextHeight();
    const bgWidth = 228;
    const bgHeight = Math.max(textHeight + 24, 50);

    const isExpressive = ["shout", "spiky", "flash_black", "flash_dense"].includes(style);
    const rx = style === "rectangle" || style === "monologue" ? 4 :
               isExpressive ? 0 : 20;

    const bg = new Rect({
      left: 0, top: 0, width: bgWidth, height: bgHeight,
      rx, ry: rx,
      fill: colorPreset.fill === "transparent" ? "rgba(0,0,0,0)" : colorPreset.fill,
      stroke: colorPreset.stroke, strokeWidth: style === "doubleline" ? 3 : 2,
      ...(style === "dashed" ? { strokeDashArray: [6, 4] } : {}),
    });

    const group = new Group([bg, textObj], {
      left: pos.left, top: pos.top,
      selectable: true, evented: true, subTargetCheck: true, interactive: true,
    });

    fc.add(group);
    fc.setActiveObject(group);
    fc.requestRenderAll();

    dispatch({ type: "INCREMENT_INTERACTION" });
  }

  // ── Apply template ────────────────────────────────────────────────────────
  function applyTemplate(templateId: string) {
    const tmpl = BUBBLE_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    tmpl.bubbles.forEach((b) => {
      addBubble(b.style, b.text, b.position);
    });
  }

  // ── Update script ─────────────────────────────────────────────────────────
  function updateScript(position: "top" | "bottom", text: string) {
    if (!activeCut) return;
    const colorPreset = SCRIPT_COLOR_PRESETS[scriptColorIdx];
    dispatch({
      type: "UPDATE_CUT_SCRIPT",
      cutId: activeCut.id,
      position,
      script: text ? {
        text,
        fontSize: 14,
        color: colorPreset.text,
        fontFamily: FONT_OPTIONS[0].family,
        style: scriptStyle,
        bgColor: colorPreset.bg,
      } : null,
    });
  }

  const categories: { id: typeof bubbleCategory; label: string }[] = [
    { id: "basic", label: "기본" },
    { id: "expressive", label: "감정" },
    { id: "decorative", label: "장식" },
    { id: "special", label: "특수" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
        <MessageSquare className="w-5 h-5 text-primary" />
        요소
      </h3>

      {/* Sub-tabs */}
      <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5">
        {([
          { id: "bubble" as SubTab, label: "말풍선", icon: MessageSquare },
          { id: "script" as SubTab, label: "자막", icon: Type },
          { id: "template" as SubTab, label: "템플릿", icon: LayoutGrid },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              subTab === t.id
                ? "bg-primary/10 text-primary"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <t.icon className="w-5 h-5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Bubble Tab ────────────────────────────────────── */}
      {subTab === "bubble" && (
        <div className="space-y-3">
          {/* Category filter */}
          <div className="flex gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setBubbleCategory(cat.id)}
                className={`px-2 py-1 rounded-lg text-[13px] font-medium transition-all ${
                  bubbleCategory === cat.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-white/30 hover:text-white/50 border border-transparent"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Bubble style grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {BUBBLE_STYLE_DEFS.filter((s) => s.category === bubbleCategory).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedBubbleStyle(s.id);
                  addBubble(s.id);
                }}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border transition-all aspect-square justify-center ${
                  selectedBubbleStyle === s.id
                    ? "border-primary/40 bg-primary/[0.06]"
                    : "border-white/[0.04] hover:border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="w-full aspect-[5/4]">
                  <BubblePreview style={s.id} selected={selectedBubbleStyle === s.id} />
                </div>
                <span className={`text-[13px] ${selectedBubbleStyle === s.id ? "text-primary" : "text-white/30"}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          {/* Color presets */}
          <div>
            <span className="text-[13px] text-white/30 font-medium block mb-1.5">색상</span>
            <div className="flex gap-1.5 flex-wrap">
              {BUBBLE_COLOR_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedBubbleColor(i)}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${
                    selectedBubbleColor === i
                      ? "border-primary ring-1 ring-primary/30 scale-110"
                      : "border-white/10 hover:border-white/20"
                  }`}
                  title={preset.label}
                >
                  <div
                    className="w-full h-full rounded-[5px] overflow-hidden"
                    style={{
                      background: preset.fill === "transparent" ? "repeating-conic-gradient(#333 0% 25%, #555 0% 50%) 50%/8px 8px" : preset.fill,
                      border: `1.5px solid ${preset.stroke}`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Script Tab ────────────────────────────────────── */}
      {subTab === "script" && (
        <div className="space-y-3">
          {/* Script style */}
          <div>
            <span className="text-[13px] text-white/30 font-medium block mb-1.5">스타일</span>
            <div className="flex gap-1 flex-wrap">
              {SCRIPT_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScriptStyle(s.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all border ${
                    scriptStyle === s.id
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "text-white/30 border-white/[0.06] hover:border-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Script color */}
          <div>
            <span className="text-[13px] text-white/30 font-medium block mb-1.5">색상</span>
            <div className="flex gap-1.5 flex-wrap">
              {SCRIPT_COLOR_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setScriptColorIdx(i)}
                  className={`px-2 py-1 rounded-lg text-[13px] transition-all border ${
                    scriptColorIdx === i
                      ? "border-primary/40"
                      : "border-white/[0.06] hover:border-white/10"
                  }`}
                  style={{ backgroundColor: preset.bg, color: preset.text }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top script */}
          <div>
            <label className="text-[13px] text-white/40 font-medium block mb-1">상단 자막</label>
            <textarea
              value={activeCut?.scriptTop?.text || ""}
              onChange={(e) => updateScript("top", e.target.value)}
              placeholder="상단 자막 텍스트..."
              rows={2}
              className="w-full px-3 py-2 text-[13px] bg-white/[0.03] rounded-xl border border-white/[0.06] focus:outline-none focus:border-primary/40 resize-none text-white/80 placeholder:text-white/20"
            />
          </div>

          {/* Bottom script */}
          <div>
            <label className="text-[13px] text-white/40 font-medium block mb-1">하단 자막</label>
            <textarea
              value={activeCut?.scriptBottom?.text || ""}
              onChange={(e) => updateScript("bottom", e.target.value)}
              placeholder="하단 자막 텍스트..."
              rows={2}
              className="w-full px-3 py-2 text-[13px] bg-white/[0.03] rounded-xl border border-white/[0.06] focus:outline-none focus:border-primary/40 resize-none text-white/80 placeholder:text-white/20"
            />
          </div>
        </div>
      )}

      {/* ── Template Tab ──────────────────────────────────── */}
      {subTab === "template" && (
        <div className="space-y-2">
          <p className="text-[13px] text-white/30">클릭하면 말풍선 세트가 캔버스에 추가됩니다</p>
          {BUBBLE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => applyTemplate(tmpl.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.06] hover:border-primary/30 hover:bg-primary/[0.03] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-white/20 group-hover:text-primary/60 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/70 group-hover:text-white/90 transition-colors">
                  {tmpl.label}
                </p>
                <p className="text-[13px] text-white/30">
                  {tmpl.category} · {tmpl.bubbles.length}개 말풍선
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-white/30 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
