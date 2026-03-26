import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import {
  FANDOM_COLOR_PALETTES,
  LIGHTSTICK_COLORS,
} from "@/lib/fandom-templates";
import {
  BIRTHDAY_GOODS_OPTIONS,
  type BirthdayGoodsType,
} from "@/lib/fandom-goods-config";
import type { BirthdayCafePackage } from "@/lib/workspace-types";
import {
  Gift,
  Calendar,
  Palette,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  X,
} from "lucide-react";

type WizardStep = "member" | "goods" | "theme" | "generate";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BirthdayCafeWizard({ open, onClose }: Props) {
  const { state, dispatch } = useWorkspace();
  const { sendMessage } = useCopilot();
  const fandomMeta = state.fandomMeta;

  const [step, setStep] = useState<WizardStep>("member");
  const [memberName, setMemberName] = useState(fandomMeta?.memberTags[0] || "");
  const [birthdayDate, setBirthdayDate] = useState("");
  const [cafeName, setCafeName] = useState("");
  const [selectedGoods, setSelectedGoods] = useState<BirthdayGoodsType[]>(["cupsleeve", "banner", "photocard"]);
  const [themeColors, setThemeColors] = useState<string[]>([fandomMeta?.coverColor || "#EC4899"]);
  const [coordinatedStyle, setCoordinatedStyle] = useState("dreamy");
  const [generating, setGenerating] = useState(false);

  if (!open) return null;

  const groupColor = fandomMeta?.coverColor || "#7B2FF7";
  const palette = FANDOM_COLOR_PALETTES.find(p => p.groupName === fandomMeta?.groupName);
  const suggestedColors = palette
    ? [palette.primary, palette.secondary, palette.accent]
    : [groupColor, "#EC4899", "#F472B6"];

  function toggleGoods(id: BirthdayGoodsType) {
    setSelectedGoods(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  }

  function toggleColor(color: string) {
    setThemeColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  }

  async function handleGenerate() {
    setGenerating(true);

    const pkg: BirthdayCafePackage = {
      memberId: fandomMeta?.groupId || "",
      memberName,
      birthdayDate,
      cafeName,
      themeColors,
      selectedGoods: selectedGoods as BirthdayCafePackage["selectedGoods"],
      coordinatedStyle,
    };

    dispatch({ type: "SET_BIRTHDAY_CAFE_PACKAGE", package: pkg });

    // Create multi-cut from selected goods — each goods = one cut
    const goodsPrompts = selectedGoods.map(g => {
      const label = BIRTHDAY_GOODS_OPTIONS.find(o => o.id === g)?.label || g;
      return `${memberName} 생일카페 ${label} 디자인, ${cafeName ? `카페명: ${cafeName}, ` : ""}${coordinatedStyle} 스타일, 테마컬러: ${themeColors.join(", ")}`;
    });

    // Generate each goods as a separate image via copilot
    for (const prompt of goodsPrompts) {
      await sendMessage(prompt);
    }

    setGenerating(false);
    onClose();
  }

  const steps: { id: WizardStep; label: string; num: number }[] = [
    { id: "member", label: "멤버 정보", num: 1 },
    { id: "goods", label: "굿즈 선택", num: 2 },
    { id: "theme", label: "테마", num: 3 },
    { id: "generate", label: "생성", num: 4 },
  ];

  const currentIdx = steps.findIndex(s => s.id === step);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="absolute inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-[600px] sm:max-h-[80vh] bg-[#0c0c0f] border border-white/[0.06] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: groupColor }}>
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">생일카페 패키지 위자드</h2>
              <p className="text-[12px] text-white/40">일관된 테마로 굿즈 세트를 한번에 생성</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06]">
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i <= currentIdx ? "text-white" : "bg-white/[0.06] text-white/30"
                }`}
                style={i <= currentIdx ? { background: groupColor } : {}}
              >
                {i < currentIdx ? <Check className="w-3 h-3" /> : s.num}
              </div>
              <span className={`text-[11px] ${i <= currentIdx ? "text-white/80" : "text-white/30"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-6 h-0.5 rounded" style={{ background: i < currentIdx ? groupColor : "rgba(255,255,255,0.06)" }} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Step 1: Member Info */}
          {step === "member" && (
            <>
              <div>
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">멤버 이름</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="멤버 이름"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">생일 날짜</label>
                <input
                  type="date"
                  value={birthdayDate}
                  onChange={(e) => setBirthdayDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-1.5 block">카페명 (선택)</label>
                <input
                  type="text"
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  placeholder="예: 민지의 생일카페"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40"
                />
              </div>
            </>
          )}

          {/* Step 2: Goods Selection */}
          {step === "goods" && (
            <>
              <p className="text-[12px] text-white/40">포함할 굿즈를 선택하세요 (각각 별도 컷으로 생성)</p>
              <div className="grid grid-cols-2 gap-2">
                {BIRTHDAY_GOODS_OPTIONS.map((g) => {
                  const isSelected = selectedGoods.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGoods(g.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-primary/40 bg-primary/10"
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]"
                      }`}
                    >
                      <p className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-white/70"}`}>{g.label}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 3: Theme Colors */}
          {step === "theme" && (
            <>
              <div>
                <p className="text-[12px] text-white/40 mb-2">추천 컬러 (멤버/그룹 기반)</p>
                <div className="flex gap-2 flex-wrap">
                  {suggestedColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleColor(c)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        themeColors.includes(c) ? "border-white/60 scale-110" : "border-white/10 hover:border-white/30"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                  {LIGHTSTICK_COLORS.slice(0, 5).map((lc) => (
                    <button
                      key={lc.groupName}
                      onClick={() => toggleColor(lc.color)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        themeColors.includes(lc.color) ? "border-white/60 scale-110" : "border-white/10 hover:border-white/30"
                      }`}
                      style={{ background: lc.color }}
                      title={lc.groupName}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[12px] text-white/40 mb-2">비주얼 스타일</p>
                <div className="flex flex-wrap gap-2">
                  {["dreamy", "cute", "elegant", "minimal", "retro"].map((style) => (
                    <button
                      key={style}
                      onClick={() => setCoordinatedStyle(style)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        coordinatedStyle === style
                          ? "text-white border-transparent"
                          : "border-white/[0.06] text-white/50 hover:text-white/70"
                      }`}
                      style={coordinatedStyle === style ? { background: groupColor } : {}}
                    >
                      {style === "dreamy" ? "몽환적" : style === "cute" ? "귀여운" : style === "elegant" ? "우아한" : style === "minimal" ? "미니멀" : "레트로"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 4: Summary & Generate */}
          {step === "generate" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-2">
                <p className="text-xs font-semibold text-white/40 uppercase">요약</p>
                <p className="text-sm text-white/80">멤버: <span className="font-bold">{memberName}</span></p>
                {birthdayDate && <p className="text-sm text-white/80">날짜: {birthdayDate}</p>}
                {cafeName && <p className="text-sm text-white/80">카페명: {cafeName}</p>}
                <p className="text-sm text-white/80">
                  굿즈: {selectedGoods.map(g => BIRTHDAY_GOODS_OPTIONS.find(o => o.id === g)?.label).join(", ")}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-white/80">테마 컬러:</span>
                  {themeColors.map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-white/20" style={{ background: c }} />
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !memberName.trim()}
                className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 text-white"
                style={{ background: `linear-gradient(135deg, ${groupColor}, ${groupColor}cc)` }}
              >
                {generating ? (
                  <><Sparkles className="w-5 h-5 animate-spin" /> 생성 중...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> {selectedGoods.length}개 굿즈 일괄 생성</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex justify-between px-5 py-3 border-t border-white/[0.06]">
          <button
            onClick={() => setStep(steps[Math.max(0, currentIdx - 1)].id)}
            disabled={currentIdx === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/80 disabled:opacity-30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> 이전
          </button>
          {currentIdx < steps.length - 1 && (
            <button
              onClick={() => setStep(steps[currentIdx + 1].id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
              style={{ background: groupColor }}
            >
              다음 <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
