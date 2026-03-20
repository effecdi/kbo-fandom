import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRecentCharacters } from "@/hooks/use-recent-characters";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  UploadCloud, ImagePlus, X, CheckCircle2, Check, Loader2,
} from "lucide-react";
import type { GenerationLight, CharacterFolder } from "@shared/schema";

// ---- Types ----

export interface CharacterImage {
  id: string;
  name: string;
  imageUrl: string;
  fullImageUrl?: string;
  imageDataUrl?: string;
}

type CharacterFolderWithItems = CharacterFolder & { items: { generationId: number }[] };

interface CharacterPickerProps {
  mode: "single" | "multi";
  maxImages?: number;
  required?: boolean;
  label?: string;
  description?: string;
  showStyleHint?: boolean;
  galleryPickerVariant?: "inline" | "dialog";
  convertToDataUrl?: boolean;

  selectedImages: CharacterImage[];
  onSelectedImagesChange: (images: CharacterImage[]) => void;

  // Gallery data from parent (avoid duplicate queries)
  characterStripData: any[];
  galleryData: GenerationLight[];
  galleryLoading: boolean;
  galleryHasMore?: boolean;
  characterFolders: CharacterFolderWithItems[];
  activeGalleryFolderId: number | null;
  onActiveGalleryFolderIdChange: (id: number | null) => void;
  onLoadMoreGallery?: () => void;
  fetchFullGeneration: (id: number) => Promise<any>;

  // Mode-specific callbacks
  onFirstImageSelected?: (img: CharacterImage) => void;
  onImageUploaded?: (img: CharacterImage) => void;
}

/** Convert an image URL to a data URL via canvas (CORS-aware). */
function urlToDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        reject(new Error("CORS"));
      }
    };
    img.onerror = () => reject(new Error("load"));
    img.src = url;
  });
}

export function CharacterPicker({
  mode,
  maxImages = 4,
  required = false,
  label,
  description,
  showStyleHint = false,
  galleryPickerVariant = "inline",
  convertToDataUrl = false,

  selectedImages,
  onSelectedImagesChange,

  characterStripData,
  galleryData,
  galleryLoading,
  galleryHasMore,
  characterFolders,
  activeGalleryFolderId,
  onActiveGalleryFolderIdChange,
  onLoadMoreGallery,
  fetchFullGeneration,

  onFirstImageSelected,
  onImageUploaded,
}: CharacterPickerProps) {
  const { toast } = useToast();
  const { recentChars, addRecentCharacter } = useRecentCharacters();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGallery, setShowGallery] = useState(false);

  const max = mode === "single" ? 1 : maxImages;
  const canAddMore = selectedImages.length < max;

  // ---- Quick-select strip: only recently used characters ----
  const quickItems = recentChars.slice(0, 12).map((rc) => ({
    id: rc.id,
    name: rc.name,
    thumbUrl: rc.imageUrl,
    fullUrl: rc.imageUrl,
    genId: undefined as number | undefined,
  }));

  // ---- Helpers ----

  const addImage = useCallback(
    (img: CharacterImage) => {
      const isFirst = selectedImages.length === 0;
      if (mode === "single") {
        onSelectedImagesChange([img]);
      } else {
        onSelectedImagesChange([...selectedImages, img]);
      }
      addRecentCharacter({ id: img.id, name: img.name, imageUrl: img.imageUrl });
      if (isFirst) onFirstImageSelected?.(img);
    },
    [selectedImages, mode, onSelectedImagesChange, addRecentCharacter, onFirstImageSelected]
  );

  const removeImage = useCallback(
    (id: string) => {
      onSelectedImagesChange(selectedImages.filter((img) => img.id !== id));
    },
    [selectedImages, onSelectedImagesChange]
  );

  const isSelected = useCallback(
    (imageUrl: string) => selectedImages.some((img) => img.imageUrl === imageUrl),
    [selectedImages]
  );

  // ---- Upload handler ----
  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!canAddMore) {
        toast({ title: `최대 ${max}개`, description: `캐릭터 이미지는 최대 ${max}개까지 선택 가능합니다.`, variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const charId = Math.random().toString(36).slice(2, 10);
        const fallbackName = file.name.replace(/\.[^/.]+$/, "");
        const img: CharacterImage = {
          id: charId,
          name: fallbackName,
          imageUrl: dataUrl,
          imageDataUrl: dataUrl,
        };
        addImage(img);
        onImageUploaded?.(img);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [canAddMore, max, toast, addImage, onImageUploaded]
  );

  // ---- Quick-select handler ----
  const handleQuickSelect = useCallback(
    async (item: (typeof quickItems)[0]) => {
      // Toggle off if already selected
      const existing = selectedImages.find((img) => img.imageUrl === item.fullUrl);
      if (existing) {
        removeImage(existing.id);
        return;
      }
      if (!canAddMore) {
        toast({ title: `최대 ${max}개`, variant: "destructive" });
        return;
      }

      let imageUrl = item.fullUrl;

      // If there's a genId, fetch full resolution
      if (item.genId) {
        const full = await fetchFullGeneration(item.genId);
        if (full?.resultImageUrl) imageUrl = full.resultImageUrl;
      }

      const img: CharacterImage = {
        id: item.id,
        name: item.name,
        imageUrl,
      };

      if (convertToDataUrl) {
        try {
          img.imageDataUrl = await urlToDataUrl(imageUrl);
        } catch {
          img.imageDataUrl = imageUrl;
        }
      }

      addImage(img);
    },
    [selectedImages, canAddMore, max, toast, fetchFullGeneration, convertToDataUrl, addImage, removeImage]
  );

  // ---- Gallery select handler ----
  const handleGallerySelect = useCallback(
    async (gen: GenerationLight) => {
      const genUrl = gen.resultImageUrl || "";
      const existing = selectedImages.find((img) => img.imageUrl === genUrl || img.id === String(gen.id));
      if (existing) {
        removeImage(existing.id);
        return;
      }
      if (!canAddMore) {
        toast({ title: `최대 ${max}개`, variant: "destructive" });
        return;
      }

      const full = await fetchFullGeneration(gen.id);
      if (!full) return;

      const imageUrl = full.resultImageUrl || genUrl;
      const imgName = gen.characterName || gen.prompt?.slice(0, 20) || "갤러리 이미지";

      const img: CharacterImage = {
        id: String(gen.id),
        name: imgName,
        imageUrl,
      };

      if (convertToDataUrl) {
        try {
          img.imageDataUrl = await urlToDataUrl(imageUrl);
        } catch {
          img.imageDataUrl = imageUrl;
        }
      }

      addImage(img);
      if (mode === "single") setShowGallery(false);
    },
    [selectedImages, canAddMore, max, toast, fetchFullGeneration, convertToDataUrl, addImage, removeImage, mode]
  );

  // ---- Gallery UI (shared between inline & dialog) ----
  const galleryContent = (
    <div className="space-y-1.5">
      {galleryPickerVariant === "inline" && (
        <p className="text-[13px] text-muted-foreground">
          생성된 이미지 선택 {mode === "multi" ? `(최대 ${max}개, 클릭으로 토글)` : "(클릭으로 선택)"}:
        </p>
      )}

      {/* Folder filters */}
      {characterFolders.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <button
            className={`text-[13px] px-2 py-0.5 rounded-full border transition-colors ${
              activeGalleryFolderId === null
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
            onClick={() => onActiveGalleryFolderIdChange(null)}
          >
            전체
          </button>
          {characterFolders.map((f) => (
            <button
              key={f.id}
              className={`text-[13px] px-2 py-0.5 rounded-full border transition-colors ${
                activeGalleryFolderId === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
              onClick={() => onActiveGalleryFolderIdChange(f.id)}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Gallery grid */}
      {galleryLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !galleryData?.length ? (
        <p className="text-[13px] text-muted-foreground text-center py-3">
          생성된 이미지가 없어요.<br />먼저 캐릭터를 만들어주세요.
        </p>
      ) : (
        <>
          <div className={`grid gap-1.5 overflow-y-auto ${
            galleryPickerVariant === "dialog" ? "grid-cols-4 max-h-[40vh]" : "grid-cols-3 max-h-[160px]"
          }`}>
            {galleryData
              .filter((g) => g.resultImageUrl || g.thumbnailUrl)
              .map((gen) => {
                const selected = selectedImages.some(
                  (img) => img.imageUrl === gen.resultImageUrl || img.id === String(gen.id)
                );
                const isFull = !canAddMore && !selected;
                return (
                  <button
                    key={gen.id}
                    type="button"
                    disabled={isFull}
                    className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : isFull
                          ? "border-transparent opacity-40 cursor-not-allowed"
                          : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleGallerySelect(gen)}
                  >
                    <img
                      src={gen.thumbnailUrl || gen.resultImageUrl!}
                      alt={gen.prompt || ""}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    {selected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-primary drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
          {galleryHasMore && onLoadMoreGallery && (
            <button
              className="w-full py-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={onLoadMoreGallery}
            >
              더 보기
            </button>
          )}
          {galleryPickerVariant === "dialog" && (
            <div className="flex justify-end mt-3">
              <Button type="button" size="sm" onClick={() => setShowGallery(false)}>
                선택 완료 ({selectedImages.length}개)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-foreground">{label}</span>
          {required && <span className="text-[13px] text-destructive font-medium">필수</span>}
          {!required && description && (
            <span className="text-[13px] text-muted-foreground">{description}</span>
          )}
        </div>
      )}

      {/* Description (below label when required) */}
      {required && description && (
        <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
      )}

      {/* Style hint */}
      {showStyleHint && (
        <p className="text-[13px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded px-2 py-1">
          🎨 이미지 업로드 시 그림 스타일을 자동 감지 → 배경·아이템도 같은 스타일로 생성됩니다
        </p>
      )}

      {/* Quick-select strip */}
      {quickItems.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {quickItems.map((item) => {
            const selected = isSelected(item.fullUrl);
            return (
              <button
                key={item.id}
                type="button"
                disabled={!canAddMore && !selected}
                onClick={() => handleQuickSelect(item)}
                className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                  selected
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                } ${!canAddMore && !selected ? "opacity-40" : ""}`}
              >
                <img
                  src={item.thumbUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {selected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary drop-shadow" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[7px] px-0.5 truncate text-center">
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected images preview */}
      {mode === "multi" && selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedImages.map((img) => (
            <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted">
              <img src={img.imageUrl} alt={img.name} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
              >
                <X className="h-2.5 w-2.5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] px-0.5 py-0.5 truncate text-center">
                {img.name?.slice(0, 8) || "캐릭터"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single mode: inline card preview */}
      {mode === "single" && selectedImages.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-2">
          <img
            src={selectedImages[0].imageUrl}
            alt="기준"
            className="h-10 w-10 rounded object-cover border border-border flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate">{selectedImages[0].name || "선택된 이미지"}</p>
            <p className="text-[13px] text-muted-foreground">이 캐릭터 기반으로 프롬프트 자동 작성</p>
          </div>
          <button
            onClick={() => onSelectedImagesChange([])}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Upload & Gallery buttons */}
      {canAddMore && !(mode === "single" && selectedImages.length > 0) && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/40 p-2.5 text-[13px] text-muted-foreground hover:border-primary/50 hover:bg-muted/70 transition-colors"
          >
            <UploadCloud className={mode === "multi" ? "h-5 w-5 text-muted-foreground/70" : "h-4 w-4 opacity-70"} />
            <span className="text-[13px] font-medium">이미지 업로드</span>
            {mode === "multi" && (
              <span className="text-[13px] opacity-70">JPG·PNG ({selectedImages.length}/{max})</span>
            )}
          </button>
          <button
            onClick={() => setShowGallery((v) => !v)}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-2.5 text-[13px] transition-colors ${
              showGallery && galleryPickerVariant === "inline"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:bg-muted/70"
            }`}
          >
            <ImagePlus className={mode === "multi" ? "h-5 w-5 opacity-70" : "h-4 w-4 opacity-70"} />
            <span className="text-[13px] font-medium">갤러리에서</span>
            {mode === "multi" && (
              <span className="text-[13px] opacity-70">생성 이미지 ({selectedImages.length}/{max})</span>
            )}
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Gallery picker - inline variant */}
      {galleryPickerVariant === "inline" && showGallery && galleryContent}

      {/* Gallery picker - dialog variant */}
      {galleryPickerVariant === "dialog" && (
        <Dialog open={showGallery} onOpenChange={setShowGallery}>
          <DialogContent
            className="max-w-lg max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent
          >
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>갤러리에서 캐릭터 선택</span>
                <span className="text-[13px] font-normal text-muted-foreground">
                  {selectedImages.length}/{max} 선택됨
                </span>
              </DialogTitle>
            </DialogHeader>
            {galleryContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
