import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { CUP_SLEEVE_SPECS, type CupSleeveSize } from "@/lib/fandom-goods-config";
import { Coffee, Ruler, Eye } from "lucide-react";

export function CupSleevePanel() {
  const { state } = useWorkspace();
  const { sendMessage } = useCopilot();
  const fandomMeta = state.fandomMeta;

  const [cupSize, setCupSize] = useState<CupSleeveSize>("16oz");
  const [showFoldGuide, setShowFoldGuide] = useState(true);
  const [cafeName, setCafeName] = useState("");
  const [dateText, setDateText] = useState("");

  const memberName = fandomMeta?.memberTags[0] || fandomMeta?.groupName || "";
  const spec = CUP_SLEEVE_SPECS[cupSize];

  function handleGenerate() {
    const parts = [`${memberName} 생일카페 컵슬리브 디자인`];
    if (cafeName) parts.push(`카페명: ${cafeName}`);
    if (dateText) parts.push(`날짜: ${dateText}`);
    parts.push(`${spec.label} 사이즈`);
    parts.push("wrap-around print layout, clean design with text areas");
    sendMessage(parts.join(", "));
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-wider px-1">
        컵슬리브 메이커
      </h3>

      {/* Cup Size */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1 flex items-center gap-1">
          <Ruler className="w-3 h-3" /> 컵 사이즈
        </p>
        <div className="space-y-1">
          {(Object.keys(CUP_SLEEVE_SPECS) as CupSleeveSize[]).map((size) => {
            const s = CUP_SLEEVE_SPECS[size];
            return (
              <button
                key={size}
                onClick={() => setCupSize(size)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                  cupSize === size
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span className="text-[13px] font-medium">{s.label}</span>
                <span className="text-[13px] text-white/30 ml-auto">
                  높이 {s.heightMm}mm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fold Guide Toggle */}
      <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer">
        <input
          type="checkbox"
          checked={showFoldGuide}
          onChange={() => setShowFoldGuide(!showFoldGuide)}
          className="w-3.5 h-3.5 rounded accent-primary"
        />
        <Eye className="w-3.5 h-3.5 text-white/30" />
        <span className="text-[13px] text-white/60">접힘선 가이드 표시</span>
      </label>

      {/* Text Areas */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">텍스트 영역</p>
        <input
          type="text"
          value={cafeName}
          onChange={(e) => setCafeName(e.target.value)}
          placeholder="카페명 (선택)"
          className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40"
        />
        <input
          type="text"
          value={dateText}
          onChange={(e) => setDateText(e.target.value)}
          placeholder="날짜 (예: 2024.03.25)"
          className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40"
        />
      </div>

      {/* Spec Info */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-1">
        <p className="text-[13px] text-white/30">전개도 스펙</p>
        <p className="text-[13px] text-white/50">
          상단 둘레: {spec.topCircumferenceMm}mm · 하단 둘레: {spec.bottomCircumferenceMm}mm · 높이: {spec.heightMm}mm
        </p>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary text-[13px] font-bold flex items-center justify-center gap-2"
      >
        <Coffee className="w-4 h-4" />
        컵슬리브 디자인 생성
      </button>
    </div>
  );
}
