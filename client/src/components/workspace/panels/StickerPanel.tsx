import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { FANDOM_STICKER_PACKS, type FandomStickerCategory } from "@/lib/fandom-templates";
import { Heart, Star, Music, Type, Sparkles, PartyPopper } from "lucide-react";

const CATEGORY_ICONS: Record<FandomStickerCategory, typeof Heart> = {
  heart: Heart,
  lightstick: Star,
  emoji: Sparkles,
  logo: Music,
  text: Type,
  concert: PartyPopper,
};

const CATEGORY_LABELS: Record<FandomStickerCategory, string> = {
  heart: "하트",
  lightstick: "응원봉",
  emoji: "이모지",
  logo: "로고",
  text: "텍스트",
  concert: "콘서트",
};

export function StickerPanel() {
  const { state, canvasRef } = useWorkspace();
  const fandomMeta = state.fandomMeta;
  const [activeCategory, setActiveCategory] = useState<FandomStickerCategory>("heart");

  const categories: FandomStickerCategory[] = ["heart", "lightstick", "emoji", "logo", "text", "concert"];

  const stickers = FANDOM_STICKER_PACKS.filter(
    (s) => s.category === activeCategory && (!s.groupId || s.groupId === fandomMeta?.groupId)
  );

  function handleAddSticker(sticker: typeof stickers[number]) {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    // Add sticker as text placeholder (image loading would need real URLs)
    const { Textbox } = require("fabric");
    const text = new Textbox(sticker.label, {
      left: fc.width! / 2 - 30,
      top: fc.height! / 2 - 30,
      fontSize: 40,
      fontFamily: "Apple Color Emoji, Segoe UI Emoji, sans-serif",
      textAlign: "center",
      width: 60,
    });
    fc.add(text);
    fc.setActiveObject(text);
    fc.requestRenderAll();
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider px-1">스티커</h3>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3 h-3" />
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Sticker grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {stickers.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => handleAddSticker(sticker)}
            className="aspect-square rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-1 group"
            title={sticker.label}
          >
            <span className="text-2xl">{sticker.imageUrl}</span>
            <span className="text-[9px] text-white/30 group-hover:text-white/60 truncate w-full text-center px-1">
              {sticker.label}
            </span>
          </button>
        ))}
      </div>

      {stickers.length === 0 && (
        <p className="text-[11px] text-white/20 text-center py-4">
          이 카테고리에 스티커가 없습니다
        </p>
      )}
    </div>
  );
}
