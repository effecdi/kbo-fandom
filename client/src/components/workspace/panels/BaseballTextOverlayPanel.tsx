import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { BASEBALL_TEXT_PRESETS, FANDOM_COLOR_PALETTES, findFandomPalette } from "@/lib/fandom-templates";
import { Type, Palette } from "lucide-react";

type TextCategory = "cheer" | "birthday" | "love" | "general";

const FONT_SUGGESTIONS = [
  { id: "handwriting", label: "손글씨", desc: "귀여운 손글씨체" },
  { id: "cute", label: "귀여운", desc: "둥글고 귀여운 폰트" },
  { id: "bold-display", label: "굵은 디스플레이", desc: "임팩트 있는 제목용" },
  { id: "elegant", label: "우아한", desc: "세련된 세리프체" },
];

export function BaseballTextOverlayPanel() {
  const { state } = useWorkspace();
  const { sendMessage } = useCopilot();
  const fandomMeta = state.fandomMeta;

  const [activeCategory, setActiveCategory] = useState<TextCategory>("cheer");
  const [customText, setCustomText] = useState("");
  const [selectedFont, setSelectedFont] = useState("cute");

  const groupName = fandomMeta?.groupName || "";
  const memberName = fandomMeta?.memberTags[0] || "";
  const palette = findFandomPalette(groupName);

  function handlePresetClick(text: string) {
    const resolved = text
      .replace(/\{name\}/g, memberName || "___")
      .replace(/\{group\}/g, groupName || "___");
    sendMessage(`"${resolved}" 텍스트를 ${selectedFont} 스타일로 캔버스에 추가해줘`);
  }

  function handleCustomText() {
    if (!customText.trim()) return;
    sendMessage(`"${customText}" 텍스트를 ${selectedFont} 스타일로 캔버스에 추가해줘`);
  }

  const categories: { id: TextCategory; label: string }[] = [
    { id: "cheer", label: "응원" },
    { id: "birthday", label: "생일" },
    { id: "love", label: "사랑" },
    { id: "general", label: "일반" },
  ];

  const filteredPresets = BASEBALL_TEXT_PRESETS.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-wider px-1">
        야구 텍스트
      </h3>

      {/* Font Style */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">폰트 스타일</p>
        <div className="grid grid-cols-2 gap-1.5">
          {FONT_SUGGESTIONS.map((font) => (
            <button
              key={font.id}
              onClick={() => setSelectedFont(font.id)}
              className={`p-2 rounded-xl border text-left transition-all ${
                selectedFont === font.id
                  ? "bg-primary/10 border-primary/30"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]"
              }`}
            >
              <p className={`text-[13px] font-semibold ${selectedFont === font.id ? "text-primary" : "text-white/70"}`}>
                {font.label}
              </p>
              <p className="text-[13px] text-white/30">{font.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[13px] font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-primary/20 text-primary"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Preset Texts */}
      <div className="space-y-1.5">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.text)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all text-left"
          >
            <Type className="w-3.5 h-3.5 text-primary/60 shrink-0" />
            <span className="text-[13px] text-white/70">{preset.text}</span>
            <span className="text-[13px] text-white/20 ml-auto">{preset.lang === "ko" ? "한" : "EN"}</span>
          </button>
        ))}
      </div>

      {/* Custom Text */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">직접 입력</p>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="텍스트를 입력하세요"
            className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40"
            onKeyDown={(e) => e.key === "Enter" && handleCustomText()}
          />
          <button
            onClick={handleCustomText}
            disabled={!customText.trim()}
            className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary text-[13px] font-bold disabled:opacity-30"
          >
            추가
          </button>
        </div>
      </div>

      {/* Auto-color hint */}
      {palette && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <Palette className="w-3 h-3 text-white/30" />
          <span className="text-[13px] text-white/30">팬덤 컬러 자동 매칭</span>
          <div className="flex gap-1 ml-auto">
            <div className="w-3 h-3 rounded-full" style={{ background: palette.primary }} />
            <div className="w-3 h-3 rounded-full" style={{ background: palette.secondary }} />
            <div className="w-3 h-3 rounded-full" style={{ background: palette.accent }} />
          </div>
        </div>
      )}
    </div>
  );
}
