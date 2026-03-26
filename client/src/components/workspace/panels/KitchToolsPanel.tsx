import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import {
  KPOP_AESTHETIC_FILTERS,
  FANDOM_DESIGN_ELEMENTS,
  KPOP_TEXT_PRESETS,
} from "@/lib/fandom-templates";
import type { KpopAestheticFilterId } from "@/lib/workspace-types";
import {
  Sparkles,
  Star,
  Type,
  Layers,
  Grid3X3,
} from "lucide-react";

type KitchSection = "frames" | "stickers" | "chrome-neon" | "deco" | "patterns";

const KITSCH_FRAMES = [
  { id: "y2k-heart", label: "Y2K 하트", prompt: "Y2K heart-shaped photo frame with chrome and sparkles" },
  { id: "butterfly", label: "나비 프레임", prompt: "butterfly wing decorative frame, Y2K kitsch style" },
  { id: "star-frame", label: "별 프레임", prompt: "star-shaped frame with glitter and gems" },
  { id: "ribbon-frame", label: "리본 프레임", prompt: "cute ribbon bow decorative frame, pastel pink" },
  { id: "retro-tv", label: "레트로 TV", prompt: "retro CRT TV shaped frame, Y2K aesthetic" },
  { id: "polaroid-deco", label: "데코 폴라로이드", prompt: "decorated polaroid frame with stickers and washi tape" },
];

const KITSCH_STICKERS = [
  { id: "chrome-heart", label: "크롬 하트", prompt: "chrome metallic heart sticker decoration" },
  { id: "gem-star", label: "젬 별", prompt: "sparkly rhinestone gem star stickers" },
  { id: "butterfly-clip", label: "나비 클립", prompt: "Y2K butterfly hair clip stickers" },
  { id: "cherry", label: "체리", prompt: "cute cherry sticker, retro kitsch style" },
  { id: "bow-ribbon", label: "리본", prompt: "cute bow ribbon stickers, pink and red" },
  { id: "angel-wing", label: "천사 날개", prompt: "angel wing sticker decoration" },
  { id: "daisy", label: "데이지", prompt: "retro daisy flower sticker" },
  { id: "lips", label: "입술", prompt: "glossy lips sticker, Y2K pop style" },
];

const CHROME_NEON_EFFECTS = [
  { id: "chrome-3d", label: "크롬 3D 텍스트", prompt: "chrome metallic 3D text with reflection" },
  { id: "neon-glow", label: "네온 글로우", prompt: "neon glow text effect, pink and blue" },
  { id: "glitter-text", label: "글리터 텍스트", prompt: "sparkle glitter text effect" },
  { id: "holographic-text", label: "홀로 텍스트", prompt: "holographic iridescent text effect" },
  { id: "bubble-text", label: "버블 텍스트", prompt: "bubbly inflated 3D text, Y2K style" },
];

const KITSCH_PATTERNS = [
  { id: "checkerboard-pink", label: "핑크 체커보드", prompt: "pink and white checkerboard pattern overlay" },
  { id: "star-pattern", label: "별 패턴", prompt: "retro star pattern, Y2K kitsch background" },
  { id: "heart-grid", label: "하트 그리드", prompt: "heart pattern grid background, pastel colors" },
  { id: "flame-pattern", label: "플레임 패턴", prompt: "retro flame pattern border, Y2K style" },
  { id: "leopard-pink", label: "핑크 레오파드", prompt: "pink leopard print pattern overlay" },
];

export function KitchToolsPanel() {
  const { state, dispatch } = useWorkspace();
  const { sendMessage } = useCopilot();
  const [activeSection, setActiveSection] = useState<KitchSection>("frames");

  const sections: { id: KitchSection; label: string; icon: typeof Sparkles }[] = [
    { id: "frames", label: "Y2K 프레임", icon: Sparkles },
    { id: "stickers", label: "키치 스티커", icon: Star },
    { id: "chrome-neon", label: "크롬/네온", icon: Type },
    { id: "deco", label: "데코 요소", icon: Layers },
    { id: "patterns", label: "패턴", icon: Grid3X3 },
  ];

  function handleApply(prompt: string) {
    sendMessage(`${prompt} 효과를 추가해줘`);
  }

  function handleAestheticFilter(filterId: KpopAestheticFilterId) {
    const current = state.activeAestheticFilter;
    const newFilter = current === filterId ? null : filterId;
    dispatch({ type: "SET_AESTHETIC_FILTER", filterId: newFilter });
    if (newFilter) {
      const filter = KPOP_AESTHETIC_FILTERS.find(f => f.id === newFilter);
      if (filter) sendMessage(`${filter.label} 스타일로 변경해줘`);
    }
  }

  const kitschFilters = KPOP_AESTHETIC_FILTERS.filter(f =>
    f.id === "kitsch-y2k" || f.id === "kitsch-retro" || f.id === "kitsch-dreampop" || f.id === "y2k"
  );

  const kitschDesignElements = FANDOM_DESIGN_ELEMENTS.filter(e =>
    ["y2k-sticker", "chrome-text", "masking-tape", "gem-sticker", "neon-frame"].includes(e.id)
  );

  const kitschTextPresets = KPOP_TEXT_PRESETS.filter(t =>
    ["t13", "t14", "t15", "t16", "t17"].includes(t.id)
  );

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider px-1">키치 도구</h3>

      {/* Kitsch aesthetic filter shortcuts */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-white/40 px-1">키치 필터</p>
        <div className="grid grid-cols-2 gap-1.5">
          {kitschFilters.map((filter) => {
            const isActive = state.activeAestheticFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleAestheticFilter(filter.id)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-primary/40 bg-primary/10"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ background: filter.color }}
                  />
                  <p className={`text-[11px] font-semibold ${isActive ? "text-primary" : "text-white/70"}`}>
                    {filter.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              activeSection === sec.id
                ? "bg-primary/20 text-primary"
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
            }`}
          >
            <sec.icon className="w-3 h-3" />
            {sec.label}
          </button>
        ))}
      </div>

      {/* Y2K Frames */}
      {activeSection === "frames" && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-white/40 px-1">Y2K 스타일 프레임</p>
          <div className="grid grid-cols-2 gap-1.5">
            {KITSCH_FRAMES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => handleApply(frame.prompt)}
                className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
              >
                <p className="text-[11px] font-semibold text-white/80">{frame.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kitsch Stickers */}
      {activeSection === "stickers" && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-white/40 px-1">키치 데코 스티커</p>
          <div className="flex flex-wrap gap-1.5">
            {KITSCH_STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleApply(sticker.prompt)}
                className="px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-[11px] text-white/60"
              >
                {sticker.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chrome/Neon Text */}
      {activeSection === "chrome-neon" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-[11px] text-white/40 px-1">크롬 & 네온 텍스트 효과</p>
            {CHROME_NEON_EFFECTS.map((effect) => (
              <button
                key={effect.id}
                onClick={() => handleApply(effect.prompt)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
              >
                <Type className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                <span className="text-[11px] font-medium text-white/70">{effect.label}</span>
              </button>
            ))}
          </div>
          {/* Kitsch text presets */}
          <div className="space-y-1.5">
            <p className="text-[11px] text-white/40 px-1">키치 텍스트 프리셋</p>
            <div className="flex flex-wrap gap-1.5">
              {kitschTextPresets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => sendMessage(`"${t.text}" 텍스트를 추가해줘`)}
                  className="px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-[11px] text-white/60"
                >
                  {t.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deco Elements */}
      {activeSection === "deco" && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-white/40 px-1">키치 데코 요소</p>
          <div className="flex flex-wrap gap-1.5">
            {kitschDesignElements.map((el) => (
              <button
                key={el.id}
                onClick={() => handleApply(el.prompt)}
                className="px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-[11px] text-white/60"
              >
                {el.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {activeSection === "patterns" && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-white/40 px-1">키치 패턴 오버레이</p>
          {KITSCH_PATTERNS.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => sendMessage(`${pattern.prompt}을 배경 패턴으로 적용해줘`)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
            >
              <Grid3X3 className="w-3.5 h-3.5 text-primary/60 shrink-0" />
              <span className="text-[11px] text-white/70">{pattern.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
