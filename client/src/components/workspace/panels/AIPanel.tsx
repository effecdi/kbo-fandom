import { useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Zap,
  BookOpen,
  Loader2,
  RefreshCw,
  Image,
  ArrowRight,
  Users,
  Grid2x2,
  LayoutGrid,
} from "lucide-react";
import { useCopilot } from "@/hooks/use-copilot";
import { getCutRegions } from "@/lib/webtoon-layout";
import type { CutLayoutType } from "@/lib/webtoon-layout";
import type { MultiCutLayoutType, MultiCutBorderStyle } from "@/lib/workspace-types";

type AIMode = "subtitle" | "instatoonFull" | "instatoonPrompt" | "autoWebtoon";

const AI_MODES: { id: AIMode; label: string; desc: string; icon: React.ComponentType<{ className?: string }>; gradient: string }[] = [
  { id: "subtitle", label: "AI 대사", desc: "주제로 대사/자막 생성", icon: MessageSquare, gradient: "from-violet-500/20 to-purple-500/20" },
  { id: "instatoonFull", label: "전체 자동", desc: "캐릭터+주제 자동 생성", icon: Zap, gradient: "from-amber-500/20 to-orange-500/20" },
  { id: "instatoonPrompt", label: "이미지 생성", desc: "포즈/배경 프롬프트", icon: Image, gradient: "from-blue-500/20 to-cyan-500/20" },
  { id: "autoWebtoon", label: "멀티컷", desc: "하나의 캔버스에 여러 컷", icon: BookOpen, gradient: "from-emerald-500/20 to-teal-500/20" },
];

const ART_STYLES = [
  { id: "instatoon", label: "인스타툰", emoji: "✨" },
  { id: "comic", label: "만화", emoji: "💥" },
  { id: "webtoon", label: "웹툰", emoji: "📱" },
  { id: "realistic", label: "실사", emoji: "📷" },
  { id: "minimal", label: "미니멀", emoji: "🖤" },
  { id: "doodle", label: "낙서", emoji: "✏️" },
];

export function AIPanel() {
  const {
    sendMessage, isGenerating, pinnedCharacters,
    cutsCount, layoutType, borderStyle,
    setCutsCount, setLayoutType, setBorderStyle,
  } = useCopilot();

  const [aiMode, setAIMode] = useState<AIMode>("subtitle");
  const [topic, setTopic] = useState("");
  const [scope, setScope] = useState<"current" | "all">("current");
  const [posePrompt, setPosePrompt] = useState("");
  const [bgPrompt, setBgPrompt] = useState("");
  const [storyPrompt, setStoryPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("instatoon");

  function handleSubtitleGenerate() {
    if (!topic.trim() || isGenerating) return;
    const scopeText = scope === "all" ? "모든 컷에" : "현재 컷에";
    sendMessage(`${scopeText} "${topic}" 주제로 대사와 자막을 생성해줘`);
  }

  function handleInstatoonFull() {
    if (isGenerating) return;
    const charNames = pinnedCharacters.map((c) => c.name).join(", ");
    const topicText = topic.trim() ? ` 주제: ${topic}` : "";
    sendMessage(`${charNames || "캐릭터"}로 인스타툰을 자동 생성해줘.${topicText}`);
  }

  function handleImageGenerate() {
    if (isGenerating) return;
    const parts: string[] = [];
    if (posePrompt.trim()) parts.push(`포즈: ${posePrompt}`);
    if (bgPrompt.trim()) parts.push(`배경: ${bgPrompt}`);
    if (parts.length === 0) {
      sendMessage("캐릭터 이미지를 생성해줘");
    } else {
      const scopeText = scope === "all" ? "모든 컷에" : "현재 컷에";
      sendMessage(`${scopeText} ${parts.join(", ")}로 이미지를 생성해줘`);
    }
  }

  function handleAutoWebtoon() {
    if (!storyPrompt.trim() || isGenerating) return;
    sendMessage(`"${storyPrompt}" 스토리로 ${cutsCount}컷 인스타툰을 자동 생성해줘. 스타일: ${artStyle}`);
  }

  function handleTopicSuggest() {
    sendMessage("재미있는 인스타툰 주제 5개 추천해줘");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-white/80">AI 생성</h3>
          <p className="text-[13px] text-white/25">AI로 콘텐츠를 자동 생성</p>
        </div>
      </div>

      {/* Mode selector - 2x2 grid cards */}
      <div className="grid grid-cols-2 gap-2">
        {AI_MODES.map((mode) => {
          const isActive = aiMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setAIMode(mode.id)}
              className={`relative p-3 rounded-2xl border text-left transition-all overflow-hidden group ${
                isActive
                  ? "border-primary/30 bg-gradient-to-br " + mode.gradient
                  : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 transition-all ${
                isActive
                  ? "bg-white/10"
                  : "bg-white/[0.04] group-hover:bg-white/[0.06]"
              }`}>
                <mode.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-white/25"}`} />
              </div>
              <p className={`text-[13px] font-bold ${isActive ? "text-white/90" : "text-white/50"}`}>
                {mode.label}
              </p>
              <p className={`text-[13px] mt-0.5 ${isActive ? "text-white/40" : "text-white/20"}`}>
                {mode.desc}
              </p>
              {isActive && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,229,204,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Subtitle Mode ─────────────────────────────────── */}
      {aiMode === "subtitle" && (
        <div className="space-y-3">
          <InputField
            label="주제"
            value={topic}
            onChange={setTopic}
            placeholder="예: 카페에서 친구와 수다떠는 이야기"
            multiline
          />

          <button
            onClick={handleTopicSuggest}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-[13px] text-primary/50 hover:text-primary transition-colors disabled:opacity-30"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`} />
            AI 주제 추천
          </button>

          <ScopeSelector scope={scope} onChange={setScope} />

          <GenerateButton
            onClick={handleSubtitleGenerate}
            disabled={!topic.trim() || isGenerating}
            loading={isGenerating}
            icon={MessageSquare}
            label="대사 생성"
          />
        </div>
      )}

      {/* ── Instatoon Full Auto ──────────────────────────── */}
      {aiMode === "instatoonFull" && (
        <div className="space-y-3">
          {/* Pinned characters display */}
          {pinnedCharacters.length === 0 ? (
            <div className="px-4 py-5 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] text-center">
              <Users className="w-6 h-6 text-white/10 mx-auto mb-2" />
              <p className="text-[13px] text-white/30 font-medium">캐릭터를 먼저 고정하세요</p>
              <p className="text-[13px] text-white/15 mt-0.5">이미지 탭 → 캐릭터에서 선택</p>
            </div>
          ) : (
            <div className="flex gap-2.5 px-1">
              {pinnedCharacters.map((c) => (
                <div key={c.id} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/30 shadow-[0_0_16px_rgba(0,229,204,0.1)]"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[13px] text-black font-bold">✓</span>
                    </div>
                  </div>
                  <span className="text-[13px] text-white/35 truncate max-w-14 font-medium">{c.name}</span>
                </div>
              ))}
            </div>
          )}

          <InputField
            label="주제 (선택)"
            value={topic}
            onChange={setTopic}
            placeholder="예: 학교에서 생긴 재미있는 일"
          />

          <GenerateButton
            onClick={handleInstatoonFull}
            disabled={pinnedCharacters.length === 0 || isGenerating}
            loading={isGenerating}
            icon={Zap}
            label="전체 자동 생성"
            gradient="from-amber-500 to-orange-500"
          />
        </div>
      )}

      {/* ── Image Generation ─────────────────────────────── */}
      {aiMode === "instatoonPrompt" && (
        <div className="space-y-3">
          <InputField
            label="포즈 / 표정"
            value={posePrompt}
            onChange={setPosePrompt}
            placeholder="예: 손 흔들며 웃는 모습"
          />

          <InputField
            label="배경"
            value={bgPrompt}
            onChange={setBgPrompt}
            placeholder="예: 벚꽃이 흩날리는 공원"
          />

          <ScopeSelector scope={scope} onChange={setScope} />

          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10">
            <p className="text-[13px] text-white/30 leading-relaxed">
              생성된 이미지는 <strong className="text-primary">레이어</strong>로 추가됩니다.
              크기/위치를 자유롭게 조절하세요.
            </p>
          </div>

          <GenerateButton
            onClick={handleImageGenerate}
            disabled={isGenerating}
            loading={isGenerating}
            icon={Image}
            label="이미지 생성"
            gradient="from-blue-500 to-cyan-500"
          />
        </div>
      )}

      {/* ── Auto Webtoon (Multi-cut on Single Canvas) ──────── */}
      {aiMode === "autoWebtoon" && (
        <div className="space-y-3">
          {/* Info banner */}
          <div className="px-3 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
            <p className="text-[13px] text-white/40 leading-relaxed">
              <strong className="text-primary">하나의 캔버스</strong>에 여러 컷을 배치합니다.
              스토리를 입력하면 AI가 자동으로 장면을 나누고 이미지를 생성해요.
            </p>
          </div>

          <InputField
            label="스토리"
            value={storyPrompt}
            onChange={setStoryPrompt}
            placeholder="예: 직장인이 월요일 아침에 출근하면서 겪는 에피소드..."
            multiline
            rows={3}
          />

          {/* Cut count with layout preview */}
          <div>
            <label className="text-[13px] text-white/30 font-semibold block mb-2">컷 수 & 레이아웃</label>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setCutsCount(n);
                    if (n !== 4 && layoutType === "square") setLayoutType("default");
                  }}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all ${
                    cutsCount === n
                      ? "border-primary/40 bg-primary/[0.06]"
                      : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.02]"
                  }`}
                >
                  <LayoutPreviewSVG cuts={n} layoutType={n === cutsCount ? layoutType : "default"} active={cutsCount === n} />
                  <span className={`text-[13px] font-bold ${cutsCount === n ? "text-primary" : "text-white/25"}`}>
                    {n}컷
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout type (only for 4 cuts) */}
          {cutsCount === 4 && (
            <div>
              <label className="text-[13px] text-white/30 font-semibold block mb-1.5">레이아웃 형태</label>
              <div className="flex gap-1.5">
                {([
                  { id: "default" as MultiCutLayoutType, label: "기본", icon: LayoutGrid },
                  { id: "square" as MultiCutLayoutType, label: "정사각형", icon: Grid2x2 },
                ]).map((lt) => (
                  <button
                    key={lt.id}
                    onClick={() => setLayoutType(lt.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border transition-all ${
                      layoutType === lt.id
                        ? "border-primary/30 bg-primary/[0.06]"
                        : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.02]"
                    }`}
                  >
                    <lt.icon className={`w-5 h-5 ${layoutType === lt.id ? "text-primary" : "text-white/20"}`} />
                    <span className={`text-[13px] font-medium ${layoutType === lt.id ? "text-primary" : "text-white/30"}`}>
                      {lt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Border style */}
          <div>
            <label className="text-[13px] text-white/30 font-semibold block mb-1.5">보더 스타일</label>
            <div className="flex gap-1.5">
              {([
                { id: "wobbly" as MultiCutBorderStyle, label: "손그림", svg: "M2,6 C4,3 6,9 8,6 C10,3 12,9 14,6 C16,3 18,9 20,6" },
                { id: "simple" as MultiCutBorderStyle, label: "심플", svg: null },
              ]).map((bs) => (
                <button
                  key={bs.id}
                  onClick={() => setBorderStyle(bs.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
                    borderStyle === bs.id
                      ? "border-primary/30 bg-primary/[0.06]"
                      : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.02]"
                  }`}
                >
                  <svg width="24" height="12" viewBox="0 0 24 12" className={borderStyle === bs.id ? "text-primary" : "text-white/20"}>
                    {bs.svg ? (
                      <path d={bs.svg} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    ) : (
                      <rect x="2" y="2" width="20" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    )}
                  </svg>
                  <span className={`text-[13px] font-medium ${borderStyle === bs.id ? "text-primary" : "text-white/30"}`}>
                    {bs.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Art style */}
          <div>
            <label className="text-[13px] text-white/30 font-semibold block mb-1.5">아트 스타일</label>
            <div className="grid grid-cols-3 gap-1.5">
              {ART_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setArtStyle(s.id)}
                  className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border transition-all ${
                    artStyle === s.id
                      ? "border-primary/30 bg-primary/[0.06]"
                      : "border-white/[0.04] hover:border-white/[0.08] bg-white/[0.02]"
                  }`}
                >
                  <span className="text-sm">{s.emoji}</span>
                  <span className={`text-[13px] font-medium ${artStyle === s.id ? "text-primary" : "text-white/30"}`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <GenerateButton
            onClick={handleAutoWebtoon}
            disabled={!storyPrompt.trim() || isGenerating}
            loading={isGenerating}
            icon={BookOpen}
            label={`${cutsCount}컷 자동 생성`}
            gradient="from-emerald-500 to-teal-500"
          />
        </div>
      )}
    </div>
  );
}

// ─── Shared Sub-components ───────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  rows?: number;
}) {
  const className = "w-full px-3.5 py-2.5 text-[13px] bg-white/[0.03] rounded-xl border border-white/[0.06] focus:outline-none focus:border-primary/30 focus:bg-white/[0.04] text-white/80 placeholder:text-white/15 transition-all";

  return (
    <div>
      <label className="text-[13px] text-white/30 font-semibold block mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={className + " resize-none"}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
}

function ScopeSelector({
  scope,
  onChange,
}: {
  scope: "current" | "all";
  onChange: (s: "current" | "all") => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.04]">
      {(["current", "all"] as const).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`flex-1 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
            scope === s
              ? "bg-primary/10 text-primary shadow-[0_0_8px_rgba(0,229,204,0.08)]"
              : "text-white/25 hover:text-white/40"
          }`}
        >
          {s === "current" ? "현재 컷" : "전체 컷"}
        </button>
      ))}
    </div>
  );
}

function LayoutPreviewSVG({
  cuts,
  layoutType = "default",
  active,
  size = 36,
}: {
  cuts: number;
  layoutType?: string;
  active: boolean;
  size?: number;
}) {
  const CW = 540;
  const CH = 675;
  const regions = getCutRegions(cuts, layoutType as CutLayoutType, CW, CH);
  const aspect = CH / CW;
  const scaleX = size / CW;
  const scaleY = (size * aspect) / CH;

  return (
    <svg width={size} height={size * aspect} className="rounded">
      <rect width={size} height={size * aspect} rx={2} fill={active ? "rgba(0,229,204,0.06)" : "rgba(255,255,255,0.02)"} />
      {regions.map((r, i) => (
        <rect
          key={i}
          x={r.x * scaleX + 0.5}
          y={r.y * scaleY + 0.5}
          width={r.width * scaleX - 1}
          height={r.height * scaleY - 1}
          rx={1.5}
          fill="none"
          stroke={active ? "hsl(var(--primary))" : "rgba(255,255,255,0.15)"}
          strokeWidth={active ? 1 : 0.5}
        />
      ))}
      {regions.map((r, i) => (
        <text
          key={`t-${i}`}
          x={r.x * scaleX + (r.width * scaleX) / 2}
          y={r.y * scaleY + (r.height * scaleY) / 2 + 3}
          textAnchor="middle"
          fill={active ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)"}
          fontSize={7}
          fontWeight="bold"
        >
          {i + 1}
        </text>
      ))}
    </svg>
  );
}

function GenerateButton({
  onClick,
  disabled,
  loading,
  icon: Icon,
  label,
  gradient = "from-primary to-primary/80",
}: {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  gradient?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r ${gradient} text-white text-[13px] font-bold disabled:opacity-20 hover:shadow-[0_0_24px_rgba(0,229,204,0.15)] hover:scale-[1.01] active:scale-[0.99] transition-all`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      {label}
      {!loading && <ArrowRight className="w-5 h-5 ml-auto opacity-50" />}
    </button>
  );
}
