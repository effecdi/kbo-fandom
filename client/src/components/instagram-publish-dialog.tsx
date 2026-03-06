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
import { Instagram, Loader2, CheckCircle2, AlertCircle, Image, Images, Clock } from "lucide-react";

interface PanelInfo {
  id: string;
  index: number;
  thumbnail: string; // base64 data url
}

interface InstagramPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panels: PanelInfo[];
  onCapturePanel: (index: number) => Promise<string>; // returns base64 1080x1350
}

type PublishType = "feed" | "carousel" | "story";

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
  const [caption, setCaption] = useState("");
  const [step, setStep] = useState<"select" | "publishing" | "done" | "error">("select");

  const { data: igStatus } = useQuery<InstagramStatus>({
    queryKey: ["/api/instagram/status"],
    staleTime: 60_000,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      setStep("publishing");
      const sortedIndices = Array.from(selectedPanels.values()).sort((a, b) => a - b);

      // Capture panels at high resolution
      const images: string[] = [];
      for (const idx of sortedIndices) {
        const base64 = await onCapturePanel(idx);
        images.push(base64);
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
      setPublishType("feed");
      onOpenChange(false);
    }
  };

  const handleTypeChange = (type: PublishType) => {
    setPublishType(type);
    // Reset selection based on type
    if (type === "feed" || type === "story") {
      // Keep only first selected or default to 0
      const first = selectedPanels.size > 0 ? Math.min(...Array.from(selectedPanels.values())) : 0;
      setSelectedPanels(new Set([first]));
    }
  };

  const togglePanel = (idx: number) => {
    const next = new Set(selectedPanels);
    if (publishType === "feed" || publishType === "story") {
      // Single select
      next.clear();
      next.add(idx);
    } else {
      // Multi select (carousel)
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        if (next.size < 10) next.add(idx);
      }
    }
    setSelectedPanels(next);
  };

  const canPublish = () => {
    if (!igStatus?.connected) return false;
    if (selectedPanels.size === 0) return false;
    if (publishType === "carousel" && selectedPanels.size < 2) return false;
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
            패널을 선택하고 게시 유형을 선택하세요.
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

            {/* Panel selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">패널 선택</Label>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedPanels.size}장 선택
                  {publishType === "carousel" && ` / 최소 2장`}
                </Badge>
              </div>
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
