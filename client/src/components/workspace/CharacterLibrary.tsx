import { useState, useEffect } from "react";
import { Plus, User, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { apiRequest } from "@/lib/queryClient";
import type { PinnedCharacter } from "@/lib/workspace-types";

interface GalleryChar {
  id: number;
  name: string;
  imageUrl: string;
}

export function CharacterLibrary() {
  const { state, dispatch } = useWorkspace();
  const { pinCharacter, pinnedCharacters } = useCopilot();
  const [galleryChars, setGalleryChars] = useState<GalleryChar[]>([]);
  const [loading, setLoading] = useState(false);

  // Load characters from gallery
  useEffect(() => {
    setLoading(true);
    const source = (localStorage.getItem("olli_user_role") as string) || "creator";
    apiRequest("GET", `/api/gallery?type=character&source=${source}&limit=50&offset=0`)
      .then((res) => res.json())
      .then((data: any) => {
        const items = data.items || data;
        if (!Array.isArray(items)) return;
        setGalleryChars(
          items
            .filter((item: any) => {
              // Filter out logo/mascot generations — only pure characters
              const prompt = item.prompt || "";
              if (prompt.startsWith("[LOGO]")) return false;
              if (prompt.startsWith("[MASCOT]")) return false;
              if (item.type && item.type !== "character") return false;
              return true;
            })
            .map((item: any) => ({
              id: item.id,
              name: item.characterName || item.prompt || item.name || `캐릭터 ${item.id}`,
              imageUrl: item.resultImageUrl || item.thumbnailUrl || item.imageUrl || item.image_url,
            }))
            .filter((c: GalleryChar) => !!c.imageUrl)
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handlePinCharacter(char: GalleryChar) {
    const pinned: PinnedCharacter = {
      id: String(char.id),
      name: char.name,
      imageUrl: char.imageUrl,
    };
    pinCharacter(pinned);
  }

  function isPinned(charId: number) {
    return pinnedCharacters.some((c) => c.id === String(charId));
  }

  // Merge workspace characters + gallery characters
  const allChars = [
    ...state.characters.map((c) => ({
      id: Number(c.id) || 0,
      name: c.name,
      imageUrl: c.thumbnailUrl || c.imageUrl,
      isLocal: true,
    })),
    ...galleryChars
      .filter((gc) => !state.characters.some((c) => c.id === String(gc.id)))
      .map((gc) => ({ ...gc, isLocal: false })),
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        캐릭터를 선택하면 AI 생성 시 적용됩니다
      </p>
      <div className="grid grid-cols-2 gap-2">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : allChars.length === 0 ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center"
              >
                <User className="w-8 h-8 text-muted-foreground/20" />
              </div>
            ))}
            <p className="col-span-2 text-[10px] text-muted-foreground/50 text-center">
              생성된 캐릭터가 없습니다
            </p>
          </>
        ) : (
          allChars.map((char) => (
            <div
              key={char.id}
              onClick={() => handlePinCharacter(char)}
              className={`relative aspect-square rounded-lg border-2 overflow-hidden group cursor-pointer transition-all ${
                isPinned(char.id)
                  ? "border-[#00e5cc] ring-2 ring-[#00e5cc]/30"
                  : "border-border hover:border-[#00e5cc]/50"
              }`}
            >
              <img
                src={char.imageUrl}
                alt={char.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {isPinned(char.id) && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#00e5cc] flex items-center justify-center">
                  <span className="text-[10px] text-black font-bold">✓</span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1.5 py-1">
                <span className="text-[10px] text-white truncate block">
                  {char.name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
