import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Loader2, CheckCircle2, AlertCircle, Image, Images, Clock, GalleryHorizontalEnd, LayoutPanelTop } from "lucide-react";

interface PanelInfo {
  id: string;
  index: number;
  thumbnail: string; // base64 data url
}

interface GalleryItem {
  id: number;
  resultImageUrl: string;
  prompt?: string;
  createdAt?: string;
}

interface InstagramPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panels: PanelInfo[];
  onCapturePanel: (index: number) => Promise<string>; // returns base64 1080x1350
}

type PublishType = "feed" | "carousel" | "story";
type SourceTab = "panels" | "gallery";

interface InstagramStatus {
  connected: boolean;
  igUsername?: string;
}

export function InstagramPublishDialog({
  open,
  onOpenChange,
  panels,
  onCapturePanel,
}: InstagramPublishDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [publishType, setPublishType] = useState<PublishType>("feed");
  const [selectedPanels, setSelectedPanels] = useState<Set<number>>(new Set([0]));
  const [selectedGalleryIds, setSelectedGalleryIds] = useState<Set<number>>(new Set());
  const [caption, setCaption] = useState("");
  const [step, setStep] = useState<"select" | "publishing" | "done" | "error">("select");
  const [sourceTab, setSourceTab] = useState<SourceTab>("gallery");

  const { data: igStatus } = useQuery<InstagramStatus>({
    queryKey: ["/api/instagram/status"],
    staleTime: 60_000,
  });

  const { data: galleryItems } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
    enabled: open,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      setStep("publishing");
      const images: string[] = [];

      if (sourceTab === "panels") {
        const sortedIndices = Array.from(selectedPanels.values()).sort((a, b) => a - b);
        for (const idx of sortedIndices) {
          const base64 = await onCapturePanel(idx);
          images.push(base64);
        }
      } else {
        // Gallery images — use URLs directly
        const gallery = galleryItems || [];
        const sortedIds = Array.from(selectedGalleryIds.values());
        for (const gId of sortedIds) {
          const item = gallery.find(g => g.id === gId);
          if (item) images.push(item.resultImageUrl);
        }
      }

      const res = await apiRequest("POST", "/api/instagram/publish", {
        publishType,
        images,
        caption: caption || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/publish-history"] });
      toast({ title: "게시 완료!", description: "Instagram에 게시되었습니다." });
    },
    onError: (err: Error) => {
      setStep("error");
      toast({ title: "게시 실패", description: err.message, variant: "destructive" });
    },
  });

  const handleClose = () => {
    if (step !== "publishing") {
      setStep("select");
      setCaption("");
      setSelectedPanels(new Set([0]));
      setSelectedGalleryIds(new Set());
      setPublishType("feed");
      onOpenChange(false);
    }
  };

  const handleTypeChange = (type: PublishType) => {
    setPublishType(type);
    if (type === "feed" || type === "story") {
      if (sourceTab === "panels") {
        const first = selectedPanels.size > 0 ? Math.min(...Array.from(selectedPanels.values())) : 0;
        setSelectedPanels(new Set([first]));
      } else {
        const first = selectedGalleryIds.size > 0 ? Array.from(selectedGalleryIds.values())[0] : undefined;
        setSelectedGalleryIds(first !== undefined ? new Set([first]) : new Set());
      }
    }
  };

  const togglePanel = (idx: number) => {
    const next = new Set(selectedPanels);
    if (publishType === "feed" || publishType === "story") {
      next.clear();
      next.add(idx);
    } else {
      if (next.has(idx)) next.delete(idx);
      else if (next.size < 10) next.add(idx);
    }
    setSelectedPanels(next);
  };

  const toggleGallery = (id: number) => {
    const next = new Set(selectedGalleryIds);
    if (publishType === "feed" || publishType === "story") {
      next.clear();
      next.add(id);
    } else {
      if (next.has(id)) next.delete(id);
      else if (next.size < 10) next.add(id);
    }
    setSelectedGalleryIds(next);
  };

  const selectedCount = sourceTab === "panels" ? selectedPanels.size : selectedGalleryIds.size;

  const canPublish = () => {
    if (!igStatus?.connected) return false;
    if (selectedCount === 0) return false;
    if (publishType === "carousel" && selectedCount < 2) return false;
    return true;
  };

  const notConnected = !igStatus?.connected;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram에 게시
          </DialogTitle>
          <DialogDescription>
            이미지를 선택하고 게시 유형을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        {notConnected ? (
          <div className="text-center py-8 space-y-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Instagram 계정이 연결되어 있지 않습니다.
            </p>
            <p className="text-xs text-muted-foreground">
              대시보드에서 Instagram 계정을 먼저 연결해주세요.
            </p>
            <Button variant="outline" size="sm" onClick={() => { handleClose(); window.location.href = "/dashboard"; }}>
              대시보드로 이동
            </Button>
          </div>
        ) : step === "publishing" ? (
          <div className="text-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <div>
              <p className="text-sm font-medium">Instagram에 게시 중...</p>
              <p className="text-xs text-muted-foreground mt-1">이미지 업로드 및 게시가 진행 중입니다.</p>
            </div>
          </div>
        ) : step === "done" ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
            <div>
              <p className="text-sm font-medium">게시 완료!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Instagram에서 확인해보세요.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose}>닫기</Button>
          </div>
        ) : step === "error" ? (
          <div className="text-center py-12 space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <div>
              <p className="text-sm font-medium">게시에 실패했습니다</p>
              <p className="text-xs text-muted-foreground mt-1">다시 시도해주세요.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep("select")}>다시 시도</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Publish type */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">게시 유형</Label>
              <RadioGroup
                value={publishType}
                onValueChange={(v) => handleTypeChange(v as PublishType)}
                className="flex gap-3"
              >
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="feed" id="type-feed" />
                  <Label htmlFor="type-feed" className="text-xs cursor-pointer flex items-center gap-1">
                    <Image className="h-3 w-3" /> 피드
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="carousel" id="type-carousel" />
                  <Label htmlFor="type-carousel" className="text-xs cursor-pointer flex items-center gap-1">
                    <Images className="h-3 w-3" /> 캐러셀
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="story" id="type-story" />
                  <Label htmlFor="type-story" className="text-xs cursor-pointer flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 스토리
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-[11px] text-muted-foreground">
                {publishType === "feed" && "이미지 1장을 피드에 게시합니다."}
                {publishType === "carousel" && "2~10장의 이미지를 캐러셀로 게시합니다."}
                {publishType === "story" && "이미지 1장을 스토리에 게시합니다 (24시간 후 사라짐)."}
              </p>
            </div>

            {/* Source tab selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">이미지 소스</Label>
              <div className="flex gap-2">
                <Button
                  variant={sourceTab === "gallery" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => { setSourceTab("gallery"); setSelectedPanels(new Set()); }}
                >
                  <GalleryHorizontalEnd className="h-3.5 w-3.5" />
                  갤러리
                </Button>
                {panels.length > 0 && (
                  <Button
                    variant={sourceTab === "panels" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => { setSourceTab("panels"); setSelectedGalleryIds(new Set()); }}
                  >
                    <LayoutPanelTop className="h-3.5 w-3.5" />
                    스토리 패널
                  </Button>
                )}
              </div>
            </div>

            {/* Image selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  {sourceTab === "panels" ? "패널 선택" : "이미지 선택"}
                </Label>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedCount}장 선택
                  {publishType === "carousel" && ` / 최소 2장`}
                </Badge>
              </div>

              {sourceTab === "panels" ? (
                <div className="grid grid-cols-4 gap-2">
                  {panels.map((panel) => {
                    const isSelected = selectedPanels.has(panel.index);
                    return (
                      <button
                        key={panel.id}
                        onClick={() => togglePanel(panel.index)}
                        className={`relative aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {panel.thumbnail ? (
                          <img
                            src={panel.thumbnail}
                            alt={`패널 ${panel.index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">{panel.index + 1}</span>
                          </div>
                        )}
                        {publishType === "carousel" && (
                          <div className="absolute top-1 left-1">
                            <Checkbox
                              checked={isSelected}
                              className="h-4 w-4 bg-white/80 border-white/50"
                              tabIndex={-1}
                            />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                          <span className="text-[10px] text-white font-medium">{panel.index + 1}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto">
                  {(galleryItems || []).map((item) => {
                    const isSelected = selectedGalleryIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleGallery(item.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={item.resultImageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {publishType === "carousel" && (
                          <div className="absolute top-1 left-1">
                            <Checkbox
                              checked={isSelected}
                              className="h-4 w-4 bg-white/80 border-white/50"
                              tabIndex={-1}
                            />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/10" />
                        )}
                      </button>
                    );
                  })}
                  {(!galleryItems || galleryItems.length === 0) && (
                    <div className="col-span-4 text-center py-8">
                      <p className="text-sm text-muted-foreground">갤러리에 이미지가 없습니다.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Caption */}
            {publishType !== "story" && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">캡션</Label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
                  placeholder="캡션을 입력하세요 (선택)"
                  className="resize-none text-sm"
                  rows={3}
                />
                <p className="text-[11px] text-muted-foreground text-right">
                  {caption.length} / 2,200
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-muted-foreground">
                @{igStatus?.igUsername}으로 게시
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  취소
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={!canPublish() || publishMutation.isPending}
                  onClick={() => publishMutation.mutate()}
                >
                  <Instagram className="h-3.5 w-3.5" />
                  게시하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
