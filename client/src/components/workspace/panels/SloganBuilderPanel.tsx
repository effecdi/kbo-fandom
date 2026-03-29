import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { SLOGAN_TEXT_TEMPLATES } from "@/lib/fandom-goods-config";
import { Flag, Type, AlertTriangle } from "lucide-react";

type SloganSize = "20x60" | "30x80";

const SLOGAN_SIZES: { id: SloganSize; label: string; desc: string }[] = [
  { id: "20x60", label: "20×60cm", desc: "일반 콘서트 슬로건" },
  { id: "30x80", label: "30×80cm", desc: "대형 슬로건" },
];

export function SloganBuilderPanel() {
  const { state, dispatch } = useWorkspace();
  const { sendMessage } = useCopilot();
  const fandomMeta = state.fandomMeta;

  const [selectedSize, setSelectedSize] = useState<SloganSize>("20x60");
  const [customText, setCustomText] = useState("");

  const memberName = fandomMeta?.memberTags[0] || "";
  const groupName = fandomMeta?.groupName || "";

  function handleTemplate(template: string) {
    const text = template
      .replace("{name}", memberName || "___")
      .replace("{group}", groupName || "___")
      .replace("{years}", "10");
    setCustomText(text);
    sendMessage(`슬로건 배너에 "${text}" 텍스트를 크고 굵게 넣어줘, 콘서트장에서 먼 거리에서도 읽을 수 있게`);
  }

  function handleApplyText() {
    if (!customText.trim()) return;
    sendMessage(`슬로건 배너에 "${customText}" 텍스트를 크고 굵게 넣어줘, 콘서트장에서 먼 거리에서도 읽을 수 있게`);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-wider px-1">
        슬로건 빌더
      </h3>

      {/* Size */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">사이즈 프리셋</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SLOGAN_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => {
                setSelectedSize(size.id);
                dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio: "16:9" });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedSize === size.id
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
              }`}
            >
              <p className="text-[13px] font-semibold">{size.label}</p>
              <p className="text-[13px] text-white/30">{size.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Text Templates */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">응원 문구 템플릿</p>
        <div className="flex flex-wrap gap-1.5">
          {SLOGAN_TEXT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplate(t.template)}
              className="px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-[13px] text-white/60"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">직접 입력</p>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="응원 문구를 입력하세요"
            className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={handleApplyText}
            disabled={!customText.trim()}
            className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary text-[13px] font-bold disabled:opacity-30"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Readability Guide */}
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 space-y-1">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <p className="text-[13px] font-semibold text-amber-400">가독성 가이드</p>
        </div>
        <p className="text-[13px] text-white/40 leading-relaxed">
          콘서트장에서 10m 거리 가독성: 최소 5cm 이상 글자 권장.
          밝은 색상은 패브릭 인쇄 시 번질 수 있으니 진한 색상 권장.
        </p>
      </div>
    </div>
  );
}
