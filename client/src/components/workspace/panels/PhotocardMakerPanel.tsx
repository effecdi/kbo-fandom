import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import {
  PHOTOCARD_FRAMES,
  type PhotocardFrameDef,
} from "@/lib/fandom-templates";
import { PHYSICAL_SIZES } from "@/lib/fandom-goods-config";
import { Camera, Sparkles, CreditCard, Hash } from "lucide-react";
import type { PhotocardFrame } from "@/lib/workspace-types";

type PhotocardSize = "standard" | "mini";

const PHOTOCARD_SIZES: { id: PhotocardSize; label: string; desc: string }[] = [
  { id: "standard", label: "표준 (55×85mm)", desc: PHYSICAL_SIZES.photocard.label },
  { id: "mini", label: "미니 (50×70mm)", desc: PHYSICAL_SIZES.photocardMini.label },
];

export function PhotocardMakerPanel() {
  const { state, dispatch } = useWorkspace();
  const { sendMessage } = useCopilot();
  const [selectedSize, setSelectedSize] = useState<PhotocardSize>("standard");
  const [holoEffect, setHoloEffect] = useState(false);
  const [showSerial, setShowSerial] = useState(false);

  const fandomMeta = state.fandomMeta;
  const memberName = fandomMeta?.memberTags[0] || fandomMeta?.groupName || "";

  function handleFrameSelect(frame: PhotocardFrame) {
    dispatch({ type: "SET_PHOTOCARD_FRAME", frame });
    dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio: "2:3" });
    const label = PHOTOCARD_FRAMES.find(f => f.id === frame)?.label || frame;
    sendMessage(`포토카드 프레임을 ${label}으로 설정해줘`);
  }

  function handleHoloToggle() {
    setHoloEffect(!holoEffect);
    if (!holoEffect) {
      sendMessage("홀로그래픽 반짝이 효과를 추가해줘");
    }
  }

  function handleAutoLayout() {
    const serial = showSerial ? `, 하단에 랜덤 시리얼넘버 #${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}` : "";
    const prompt = `${memberName} 트레이딩 카드 레이아웃으로 자동 생성 (이름표, 그룹 로고 위치 포함${serial})`;
    sendMessage(prompt);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-wider px-1">
        포토카드 메이커
      </h3>

      {/* Size Selection */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">사이즈</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PHOTOCARD_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedSize === size.id
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
              }`}
            >
              <p className="text-[13px] font-semibold">{size.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Selection */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">프레임 템플릿</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PHOTOCARD_FRAMES.map((frame) => (
            <button
              key={frame.id}
              onClick={() => handleFrameSelect(frame.id)}
              className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard className="w-3 h-3 text-primary/60" />
                <p className="text-[13px] font-semibold text-white/80">{frame.label}</p>
              </div>
              <p className="text-[13px] text-white/30">{frame.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Effects */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">효과</p>
        <button
          onClick={handleHoloToggle}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
            holoEffect
              ? "bg-primary/10 border-primary/30"
              : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${holoEffect ? "text-primary" : "text-white/30"}`} />
          <div>
            <p className="text-[13px] font-semibold text-white/80">홀로그래픽 효과</p>
            <p className="text-[13px] text-white/30">반짝이는 홀로 그라데이션</p>
          </div>
        </button>

        <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer">
          <input
            type="checkbox"
            checked={showSerial}
            onChange={() => setShowSerial(!showSerial)}
            className="w-3.5 h-3.5 rounded accent-primary"
          />
          <Hash className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[13px] text-white/60">시리얼 넘버 표시</span>
        </label>
      </div>

      {/* Auto Layout */}
      <button
        onClick={handleAutoLayout}
        className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary text-[13px] font-bold"
      >
        <Camera className="w-4 h-4" />
        트레이딩 카드 자동 레이아웃
      </button>
    </div>
  );
}
