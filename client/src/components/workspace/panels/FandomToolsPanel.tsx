import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import {
  PHOTOCARD_FRAMES,
  LIGHTSTICK_COLORS,
  CONCERT_EFFECTS,
  type PhotocardFrame,
  type ConcertEffect,
} from "@/lib/fandom-templates";
import {
  Camera,
  Palette,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

type ToolSection = "photocard" | "colors" | "concert" | "presets";

export function FandomToolsPanel() {
  const { state, dispatch } = useWorkspace();
  const { sendMessage } = useCopilot();
  const fandomMeta = state.fandomMeta;
  const [activeSection, setActiveSection] = useState<ToolSection>("photocard");

  const themeColor = fandomMeta?.coverColor || "#7B2FF7";

  const sections: { id: ToolSection; label: string; icon: typeof Camera }[] = [
    { id: "photocard", label: "포토카드", icon: Camera },
    { id: "colors", label: "팬덤 컬러", icon: Palette },
    { id: "concert", label: "콘서트 효과", icon: Sparkles },
    { id: "presets", label: "팬아트 프리셋", icon: Wand2 },
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
    if (effectDef) {
      sendMessage(effectDef.prompt);
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
      <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider px-1">팬덤 도구</h3>

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

      {/* Photocard Maker */}
      {activeSection === "photocard" && (
        <div className="space-y-2">
          <p className="text-[11px] text-white/40 px-1">프레임을 선택하면 2:3 비율이 자동 설정됩니다</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PHOTOCARD_FRAMES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => handleFrameSelect(frame.id)}
                className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
              >
                <p className="text-xs font-semibold text-white/80">{frame.label}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{frame.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fandom Colors */}
      {activeSection === "colors" && (
        <div className="space-y-2">
          {fandomMeta && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-white/40 px-1">{fandomMeta.groupName} 컬러</p>
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

          <p className="text-[11px] text-white/40 px-1">응원봉 컬러</p>
          <div className="flex flex-wrap gap-1.5">
            {LIGHTSTICK_COLORS.map((lc) => (
              <button
                key={lc.groupName}
                onClick={() => handleColorApply(lc.color)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/20 transition-all"
                title={lc.groupName}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: lc.color }} />
                <span className="text-[10px] text-white/50">{lc.groupName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Concert Effects */}
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
                <p className="text-xs font-semibold text-white/80">{effect.label}</p>
                <p className="text-[10px] text-white/30">{effect.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Fanart Presets */}
      {activeSection === "presets" && (
        <div className="space-y-1.5">
          {fanartPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => sendMessage(preset.prompt)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
            >
              <Wand2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-medium text-white/70">{preset.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
