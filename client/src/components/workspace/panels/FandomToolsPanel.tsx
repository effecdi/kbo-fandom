import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import {
  PHOTOCARD_FRAMES,
  LIGHTSTICK_COLORS,
  CONCERT_EFFECTS,
  BASEBALL_AESTHETIC_FILTERS,
  FANDOM_DESIGN_ELEMENTS,
  BASEBALL_TEXT_PRESETS,
  WALLPAPER_LAYOUTS,
  type PhotocardFrame,
  type ConcertEffect,
} from "@/lib/fandom-templates";
import type { AestheticFilterId } from "@/lib/workspace-types";
import {
  Camera,
  Palette,
  Sparkles,
  Wand2,
  Zap,
  Paintbrush,
  Layers,
  Grid3X3,
  Type,
  Smartphone,
} from "lucide-react";

type ToolSection = "photocard" | "colors" | "concert" | "presets" | "aesthetics" | "elements" | "patterns" | "text-overlay";

export function FandomToolsPanel() {
  const { state, dispatch } = useWorkspace();
  const { sendMessage } = useCopilot();
  const fandomMeta = state.fandomMeta;
  const [activeSection, setActiveSection] = useState<ToolSection>("photocard");

  const isWallpaper = fandomMeta?.templateType === "wallpaper";

  const sections: { id: ToolSection; label: string; icon: typeof Camera }[] = [
    { id: "photocard", label: "포토카드", icon: Camera },
    { id: "colors", label: "팬덤 컬러", icon: Palette },
    { id: "concert", label: "콘서트", icon: Sparkles },
    { id: "presets", label: "프리셋", icon: Wand2 },
    { id: "aesthetics", label: "미학", icon: Paintbrush },
    { id: "elements", label: "요소", icon: Layers },
    { id: "patterns", label: "패턴", icon: Grid3X3 },
    { id: "text-overlay", label: "텍스트", icon: Type },
  ];

  function handleFrameSelect(frame: PhotocardFrame) {
    dispatch({ type: "SET_PHOTOCARD_FRAME", frame });
    dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio: "2:3" });
    sendMessage(`포토카드 프레임을 ${PHOTOCARD_FRAMES.find(f => f.id === frame)?.label || frame}으로 설정해줘`);
  }

  function handleColorApply(color: string) {
    dispatch({ type: "APPLY_FANDOM_COLOR", color });
  }

  function handleConcertEffect(effect: ConcertEffect) {
    const effectDef = CONCERT_EFFECTS.find(e => e.id === effect);
    if (effectDef) sendMessage(effectDef.prompt);
  }

  function handleAestheticFilter(filterId: AestheticFilterId) {
    const current = state.activeAestheticFilter;
    const newFilter = current === filterId ? null : filterId;
    dispatch({ type: "SET_AESTHETIC_FILTER", filterId: newFilter });
    if (newFilter) {
      const filter = BASEBALL_AESTHETIC_FILTERS.find(f => f.id === newFilter);
      if (filter) sendMessage(`${filter.label} 스타일로 변경해줘`);
    }
  }

  function handleDesignElement(prompt: string) {
    sendMessage(`${prompt} 효과를 추가해줘`);
  }

  function handleTextPreset(text: string) {
    sendMessage(`"${text}" 텍스트를 추가해줘`);
  }

  function handleWallpaperLayout(layoutId: string) {
    const layout = WALLPAPER_LAYOUTS.find(l => l.id === layoutId);
    if (layout) {
      sendMessage(`${layout.label} 가이드에 맞춰 배경화면을 조정해줘`);
    }
  }

  const fanartPresets = [
    { label: "셀카 포즈", prompt: "셀카 포즈로 변경해줘" },
    { label: "전신 포즈", prompt: "전신 포즈로 변경해줘" },
    { label: "무대 의상", prompt: "무대 의상으로 변경해줘" },
    { label: "교복 스타일", prompt: "교복 스타일로 변경해줘" },
    { label: "밝은 분위기", prompt: "밝고 화사한 분위기로 변경해줘" },
    { label: "다크 분위기", prompt: "어둡고 시크한 분위기로 변경해줘" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-wider px-1">팬덤 도구</h3>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
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

      {/* ── Photocard Maker ── */}
      {activeSection === "photocard" && (
        <div className="space-y-2">
          <p className="text-[13px] text-white/40 px-1">프레임을 선택하면 2:3 비율이 자동 설정됩니다</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PHOTOCARD_FRAMES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => handleFrameSelect(frame.id)}
                className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
              >
                <p className="text-[13px] font-semibold text-white/80">{frame.label}</p>
                <p className="text-[13px] text-white/30 mt-0.5">{frame.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Fandom Colors ── */}
      {activeSection === "colors" && (
        <div className="space-y-2">
          {fandomMeta && (
            <div className="space-y-1.5">
              <p className="text-[13px] text-white/40 px-1">{fandomMeta.groupName} 컬러</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleColorApply(fandomMeta.coverColor)}
                  className="w-10 h-10 rounded-xl border-2 border-white/10 hover:border-white/30 transition-all"
                  style={{ background: fandomMeta.coverColor }}
                  title="그룹 메인 컬러"
                />
              </div>
            </div>
          )}
          <p className="text-[13px] text-white/40 px-1">응원봉 컬러</p>
          <div className="flex flex-wrap gap-1.5">
            {LIGHTSTICK_COLORS.map((lc) => (
              <button
                key={lc.groupName}
                onClick={() => handleColorApply(lc.color)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/20 transition-all"
                title={lc.groupName}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: lc.color }} />
                <span className="text-[13px] text-white/50">{lc.groupName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Concert Effects ── */}
      {activeSection === "concert" && (
        <div className="space-y-1.5">
          {CONCERT_EFFECTS.map((effect) => (
            <button
              key={effect.id}
              onClick={() => handleConcertEffect(effect.id)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
            >
              <Zap className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-white/80">{effect.label}</p>
                <p className="text-[13px] text-white/30">{effect.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Fanart Presets ── */}
      {activeSection === "presets" && (
        <div className="space-y-1.5">
          {fanartPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => sendMessage(preset.prompt)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
            >
              <Wand2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-[13px] font-medium text-white/70">{preset.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Baseball Aesthetic Filters ── */}
      {activeSection === "aesthetics" && (
        <div className="space-y-2">
          <p className="text-[13px] text-white/40 px-1">AI 생성 시 스타일이 적용됩니다</p>
          <div className="grid grid-cols-2 gap-1.5">
            {BASEBALL_AESTHETIC_FILTERS.map((filter) => {
              const isActive = state.activeAestheticFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => handleAestheticFilter(filter.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ background: filter.color }}
                    />
                    <p className={`text-[13px] font-semibold ${isActive ? "text-primary" : "text-white/70"}`}>
                      {filter.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Wallpaper layouts (only for wallpaper template) */}
          {isWallpaper && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[13px] text-white/40 px-1">배경화면 위젯 레이아웃</p>
              {WALLPAPER_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleWallpaperLayout(layout.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
                >
                  <Smartphone className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[13px] text-white/60">{layout.label}</span>
                  {layout.safeZones.length === 0 && (
                    <span className="text-[13px] text-white/20 ml-auto">가이드 없음</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Design Elements ── */}
      {activeSection === "elements" && (
        <div className="space-y-3">
          {(["texture", "overlay", "deco"] as const).map((cat) => {
            const items = FANDOM_DESIGN_ELEMENTS.filter(e => e.category === cat);
            const catLabel = cat === "texture" ? "텍스처" : cat === "overlay" ? "오버레이" : "데코";
            return (
              <div key={cat} className="space-y-1.5">
                <p className="text-[13px] text-white/40 px-1">{catLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => handleDesignElement(el.prompt)}
                      className="px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-[13px] text-white/60"
                    >
                      {el.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Patterns ── */}
      {activeSection === "patterns" && (
        <div className="space-y-2">
          <p className="text-[13px] text-white/40 px-1">캔버스 배경 또는 오버레이로 적용</p>
          {FANDOM_DESIGN_ELEMENTS.filter(e => e.category === "pattern").map((el) => (
            <button
              key={el.id}
              onClick={() => sendMessage(`${el.prompt}을 배경 패턴으로 적용해줘`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
            >
              <Grid3X3 className="w-4 h-4 text-primary/60 shrink-0" />
              <span className="text-[13px] text-white/70">{el.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Text Overlay ── */}
      {activeSection === "text-overlay" && (
        <div className="space-y-3">
          {(["cheer", "birthday", "love", "general"] as const).map((cat) => {
            const items = BASEBALL_TEXT_PRESETS.filter(t => t.category === cat);
            const catLabel = cat === "cheer" ? "응원" : cat === "birthday" ? "생일" : cat === "love" ? "사랑" : "일반";
            return (
              <div key={cat} className="space-y-1.5">
                <p className="text-[13px] text-white/40 px-1">{catLabel}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTextPreset(t.text)}
                      className="px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-[13px] text-white/60"
                    >
                      {t.text}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
