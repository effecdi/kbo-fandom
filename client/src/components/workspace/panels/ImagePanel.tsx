import { useState, useRef, useEffect, useCallback } from "react";
import {
  Image,
  Upload,
  Sparkles,
  Loader2,
  X,
  Trash2,
  User,
  Layers,
} from "lucide-react";
import { FabricImage } from "fabric";
import { useWorkspace, useActiveCut, useCanvasRef } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { apiRequest } from "@/lib/queryClient";
import type { PinnedCharacter } from "@/lib/workspace-types";

type SubTab = "gallery" | "characters" | "upload";

interface GalleryItem {
  id: number;
  imageUrl: string;
  prompt?: string;
  type?: string;
}

export function ImagePanel() {
  const { dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const canvasRef = useCanvasRef();
  const { pinCharacter, unpinCharacter, pinnedCharacters } = useCopilot();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subTab, setSubTab] = useState<SubTab>("gallery");
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [charGallery, setCharGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [charLoading, setCharLoading] = useState(false);

  // Helper: add image as Fabric layer
  const addImageAsLayer = useCallback((imageUrl: string) => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const imgEl = new window.Image();
    imgEl.crossOrigin = "anonymous";
    imgEl.onload = () => {
      const fabricImg = new FabricImage(imgEl, { originX: "center", originY: "center" });
      const canvasW = fc.width || 600;
      const canvasH = fc.height || 800;
      const scaleX = canvasW / (fabricImg.width || 1);
      const scaleY = canvasH / (fabricImg.height || 1);
      const scale = Math.max(scaleX, scaleY);
      fabricImg.set({
        scaleX: scale, scaleY: scale,
        left: canvasW / 2, top: canvasH / 2,
        selectable: true, evented: true,
      });
      fc.add(fabricImg);
      fc.sendObjectToBack(fabricImg);
      fc.setActiveObject(fabricImg);
      fc.requestRenderAll();
    };
    imgEl.src = imageUrl;
  }, [canvasRef]);

  // Load gallery images
  useEffect(() => {
    setLoading(true);
    const source = localStorage.getItem("olli_user_role") || "creator";
    apiRequest("GET", `/api/gallery?source=${source}&limit=50&offset=0`)
      .then((r) => r.json())
      .then((data: any) => {
        const items = Array.isArray(data) ? data : data.items || [];
        setGallery(
          items
            .map((item: any) => ({
              id: item.id,
              imageUrl: item.resultImageUrl || item.thumbnailUrl || item.imageUrl || item.image_url,
              prompt: item.prompt,
              type: item.type,
            }))
            .filter((i: GalleryItem) => !!i.imageUrl)
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load characters
  useEffect(() => {
    if (subTab !== "characters") return;
    if (charGallery.length > 0) return;
    setCharLoading(true);
    const source = localStorage.getItem("olli_user_role") || "creator";
    apiRequest("GET", `/api/gallery?type=character&source=${source}&limit=50&offset=0`)
      .then((r) => r.json())
      .then((data: any) => {
        const items = Array.isArray(data) ? data : data.items || [];
        setCharGallery(
          items
            .filter((item: any) => {
              const prompt = item.prompt || "";
              if (prompt.startsWith("[LOGO]") || prompt.startsWith("[MASCOT]")) return false;
              if (item.type && item.type !== "character") return false;
              return true;
            })
            .map((item: any) => ({
              id: item.id,
              imageUrl: item.resultImageUrl || item.thumbnailUrl || item.imageUrl || item.image_url,
              prompt: item.characterName || item.prompt || `캐릭터 ${item.id}`,
            }))
            .filter((i: GalleryItem) => !!i.imageUrl)
        );
      })
      .catch(() => {})
      .finally(() => setCharLoading(false));
  }, [subTab, charGallery.length]);

  function applyToCanvas(imageUrl: string) {
    if (!activeCut) return;
    dispatch({ type: "HISTORY_PUSH" });
    // Add as canvas layer instead of background
    addImageAsLayer(imageUrl);
    dispatch({ type: "UPDATE_CUT_THUMBNAIL", cutId: activeCut.id, thumbnailUrl: imageUrl });
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
        addImageAsLayer(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handlePinChar(item: GalleryItem) {
    const pinned: PinnedCharacter = {
      id: String(item.id),
      name: item.prompt || `캐릭터 ${item.id}`,
      imageUrl: item.imageUrl,
    };
    if (isPinned(item.id)) {
      unpinCharacter(String(item.id));
    } else {
      pinCharacter(pinned);
    }
  }

  function isPinned(id: number) {
    return pinnedCharacters.some((c) => c.id === String(id));
  }

  const subTabs: { id: SubTab; label: string }[] = [
    { id: "gallery", label: "갤러리" },
    { id: "characters", label: "캐릭터" },
    { id: "upload", label: "업로드" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <Image className="w-5 h-5 text-primary" />
        이미지
      </h3>

      {/* Sub-tabs */}
      <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-lg p-0.5">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`flex-1 px-2 py-1.5 rounded-md text-[12px] font-medium transition-all ${
              subTab === t.id
                ? "bg-primary/10 text-primary"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Gallery */}
      {subTab === "gallery" && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-white/20" />
            </div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-[12px] text-white/30">생성된 이미지가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {gallery.map((item) => (
                <button
                  key={item.id}
                  onClick={() => applyToCanvas(item.imageUrl)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.06] hover:border-primary/40 transition-all group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.prompt || "이미지"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1.5">
                    <span className="flex items-center gap-1 text-[12px] text-white/70 font-medium">
                      <Layers className="w-2.5 h-2.5" />
                      레이어 추가
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Characters */}
      {subTab === "characters" && (
        <div className="space-y-2">
          {pinnedCharacters.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[12px] text-white/30 font-medium">고정된 캐릭터</span>
              <div className="flex gap-1.5 flex-wrap">
                {pinnedCharacters.map((c) => (
                  <div key={c.id} className="relative group">
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="w-10 h-10 rounded-lg object-cover border-2 border-primary ring-1 ring-primary/20"
                    />
                    <button
                      onClick={() => unpinCharacter(c.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[12px] text-white/30">클릭하여 AI 생성 시 캐릭터 고정</p>

          {charLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-white/20" />
            </div>
          ) : charGallery.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-[12px] text-white/30">캐릭터를 먼저 생성해주세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {charGallery.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePinChar(item)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    isPinned(item.id)
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.prompt || "캐릭터"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {isPinned(item.id) && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[12px] text-black font-bold">✓</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                    <span className="text-[12px] text-white truncate block">{item.prompt}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload */}
      {subTab === "upload" && (
        <div className="space-y-3">
          <button
            onClick={handleUpload}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-primary/30 flex flex-col items-center justify-center gap-2 transition-all hover:bg-primary/[0.03]"
          >
            <Upload className="w-6 h-6 text-white/20" />
            <span className="text-xs text-white/40">클릭하여 이미지 업로드</span>
            <span className="text-[12px] text-white/20">PNG, JPG, WebP</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/10 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-primary">AI 탭에서 배경 생성</span>
          </div>

          {activeCut?.backgroundImageUrl && (
            <div className="space-y-1.5">
              <span className="text-[12px] text-white/30">현재 배경</span>
              <div className="relative rounded-lg overflow-hidden border border-white/[0.06]">
                <img
                  src={activeCut.backgroundImageUrl}
                  alt="현재 배경"
                  className="w-full aspect-video object-cover"
                />
                <button
                  onClick={() => {
                    if (!activeCut) return;
                    dispatch({ type: "HISTORY_PUSH" });
                    dispatch({ type: "UPDATE_CUT_BACKGROUND", cutId: activeCut.id, backgroundImageUrl: "" });
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/50 hover:bg-red-500/80 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
