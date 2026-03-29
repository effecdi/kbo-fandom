import { useState, useRef, useEffect } from "react";
import { Image, Sparkles, Upload, Loader2, Sticker, Star, Frame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopilot } from "@/hooks/use-copilot";
import { useWorkspace, useActiveCut } from "@/hooks/use-workspace";
import { apiRequest } from "@/lib/queryClient";

interface GalleryItem {
  id: number;
  imageUrl: string;
  prompt?: string;
}

type AssetTab = "background" | "sticker" | "effect";

const TABS: { id: AssetTab; label: string; icon: typeof Image }[] = [
  { id: "background", label: "배경", icon: Image },
  { id: "sticker", label: "스티커", icon: Sticker },
  { id: "effect", label: "효과", icon: Star },
];

// Built-in sticker/effect assets (decorative overlays)
const BUILT_IN_STICKERS = [
  { id: "s1", label: "하트", emoji: "❤️" },
  { id: "s2", label: "별", emoji: "⭐" },
  { id: "s3", label: "불꽃", emoji: "🔥" },
  { id: "s4", label: "반짝", emoji: "✨" },
  { id: "s5", label: "음표", emoji: "🎵" },
  { id: "s6", label: "꽃", emoji: "🌸" },
  { id: "s7", label: "번개", emoji: "⚡" },
  { id: "s8", label: "무지개", emoji: "🌈" },
  { id: "s9", label: "웃음", emoji: "😂" },
  { id: "s10", label: "눈물", emoji: "😢" },
  { id: "s11", label: "화남", emoji: "😤" },
  { id: "s12", label: "놀람", emoji: "😱" },
];

const BUILT_IN_EFFECTS = [
  { id: "e1", label: "집중선", prompt: "집중선 효과 추가해줘" },
  { id: "e2", label: "속도선", prompt: "속도감 있는 선 효과 추가해줘" },
  { id: "e3", label: "감정 폭발", prompt: "감정 폭발 효과 추가해줘" },
  { id: "e4", label: "배경 블러", prompt: "배경에 블러 효과 추가해줘" },
  { id: "e5", label: "반짝이", prompt: "반짝이 효과 추가해줘" },
  { id: "e6", label: "어둡게", prompt: "어두운 분위기 효과 추가해줘" },
];

export function AssetBrowser() {
  const { sendMessage } = useCopilot();
  const { dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bgGallery, setBgGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AssetTab>("background");

  // Load background gallery
  useEffect(() => {
    apiRequest("GET", "/api/gallery?type=background")
      .then((res) => res.json())
      .then((data: any[]) => {
        setBgGallery(
          data.slice(0, 12).map((item) => ({
            id: item.id,
            imageUrl: item.imageUrl || item.image_url,
            prompt: item.prompt,
          }))
        );
      })
      .catch(() => {});
  }, []);

  function handleAIBackground() {
    sendMessage("배경 생성해줘");
  }

  function handleUpload() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeCut) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        dispatch({ type: "HISTORY_PUSH" });
        dispatch({
          type: "UPDATE_CUT_BACKGROUND",
          cutId: activeCut.id,
          backgroundImageUrl: dataUrl,
        });
        dispatch({
          type: "UPDATE_CUT_THUMBNAIL",
          cutId: activeCut.id,
          thumbnailUrl: dataUrl,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function applyBackground(imageUrl: string) {
    if (!activeCut) return;
    dispatch({ type: "HISTORY_PUSH" });
    dispatch({
      type: "UPDATE_CUT_BACKGROUND",
      cutId: activeCut.id,
      backgroundImageUrl: imageUrl,
    });
    dispatch({
      type: "UPDATE_CUT_THUMBNAIL",
      cutId: activeCut.id,
      thumbnailUrl: imageUrl,
    });
  }

  function handleStickerAdd(emoji: string) {
    sendMessage(`${emoji} 스티커를 캔버스에 추가해줘`);
  }

  function handleEffectAdd(prompt: string) {
    sendMessage(prompt);
  }

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-all ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Background tab */}
      {activeTab === "background" && (
        <>
          <p className="text-[13px] text-muted-foreground">
            배경을 생성하거나 업로드하세요
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleAIBackground}
          >
            <Sparkles className="w-5 h-5" />
            AI 배경 생성
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleUpload}
          >
            <Upload className="w-5 h-5" />
            이미지 업로드
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="grid grid-cols-2 gap-2">
            {bgGallery.length === 0
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-muted border border-border flex items-center justify-center"
                  >
                    <Image className="w-6 h-6 text-muted-foreground/20" />
                  </div>
                ))
              : bgGallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => applyBackground(item.imageUrl)}
                    className="aspect-video rounded-lg bg-muted border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.prompt || "배경"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
          </div>
        </>
      )}

      {/* Sticker tab */}
      {activeTab === "sticker" && (
        <>
          <p className="text-[13px] text-muted-foreground">
            스티커를 클릭하면 AI가 캔버스에 추가합니다
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {BUILT_IN_STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleStickerAdd(sticker.emoji)}
                className="aspect-square rounded-lg bg-muted border border-border flex flex-col items-center justify-center gap-0.5 hover:bg-muted/80 hover:border-primary/50 transition-colors cursor-pointer"
              >
                <span className="text-xl">{sticker.emoji}</span>
                <span className="text-[13px] text-muted-foreground">{sticker.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Effect tab */}
      {activeTab === "effect" && (
        <>
          <p className="text-[13px] text-muted-foreground">
            효과를 선택하면 현재 컷에 적용됩니다
          </p>
          <div className="space-y-1.5">
            {BUILT_IN_EFFECTS.map((effect) => (
              <Button
                key={effect.id}
                variant="outline"
                size="sm"
                className="w-full gap-2 text-[13px] justify-start"
                onClick={() => handleEffectAdd(effect.prompt)}
              >
                <Star className="w-5 h-5 text-primary" />
                {effect.label}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
