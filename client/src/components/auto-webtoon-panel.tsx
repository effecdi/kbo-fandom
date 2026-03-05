/**
 * AutoWebtoonPanel - story editor 내 자동화툰 3단계 위자드
 * Step 1: 설정 (스토리, 캔버스 수, 컷 수, 캐릭터, 스타일)
 * Step 2: 장면 편집 (AI 분해 결과 편집)
 * Step 3: 생성 진행 + 에디터 적용
 */
import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { getCutRegions, buildDividerLines } from "@/lib/webtoon-layout";
import {
  Wand2, ArrowLeft, Loader2, Check, X, RefreshCw,
  Upload, FolderOpen, Sparkles, ImageIcon, ArrowRight,
} from "lucide-react";
import type { GenerationLight } from "@shared/schema";
import { supabase } from "@/lib/supabase";

// ---- Types ----

interface WebtoonScene {
  sceneDescription: string;
  narrativeText: string;
  bubbleText: string;
}

interface SelectedCharacter {
  id: string;
  name: string;
  imageUrl: string;
  imageDataUrl: string;
}

type CutStatus = "pending" | "generating" | "done" | "failed";

interface CutResult {
  index: number;
  status: CutStatus;
  imageUrl?: string;
  error?: string;
}

const ART_STYLES: Record<string, { label: string; promptKeyword: string }> = {
  "simple-line":  { label: "심플 라인",    promptKeyword: "simple line art, thick clean outlines, minimal flat color, webtoon style" },
  "minimal":      { label: "미니멀",        promptKeyword: "minimal cartoon, dot eyes, geometric shapes, ultra-simple line art" },
  "doodle":       { label: "낙서풍",        promptKeyword: "doodle sketch style, rough pen lines, hand-drawn scribble, sketch art" },
  "cute-animal":  { label: "귀여운 동물",    promptKeyword: "cute chibi animal style, round shapes, pastel color, kawaii cartoon" },
};

const CANVAS_W = 450;
const CANVAS_H = 600;

// ---- Panel Data types (matches story.tsx PanelData) ----

interface GeneratedPanelData {
  id: string;
  topScript: any;
  bottomScript: any;
  bubbles: any[];
  characters: any[];
  textElements: any[];
  lineElements: any[];
  shapeElements: any[];
  backgroundColor: string;
  backgroundImageUrl?: string;
  backgroundImageEl: null;
  drawingLayers: any[];
}

// ---- Props ----

export interface AutoWebtoonPanelProps {
  isAuthenticated: boolean;
  isPro: boolean;
  maxPanels: number;
  galleryData: GenerationLight[];
  galleryLoading: boolean;
  onPanelsGenerated: (panels: GeneratedPanelData[]) => void;
  onClose: () => void;
}

// ---- Component ----

export function AutoWebtoonPanel({
  isAuthenticated,
  isPro,
  maxPanels,
  galleryData: externalGalleryData,
  galleryLoading: externalGalleryLoading,
  onPanelsGenerated,
  onClose,
}: AutoWebtoonPanelProps) {
  const { toast } = useToast();
  const { showLoginDialog, setShowLoginDialog, guard } = useLoginGuard();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [storyPrompt, setStoryPrompt] = useState("");
  const [canvasCount, setCanvasCount] = useState(3);
  const [cutsPerCanvas, setCutsPerCanvas] = useState(4);
  const [selectedStyle, setSelectedStyle] = useState("simple-line");
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Step 2 state
  const [scenes, setScenes] = useState<WebtoonScene[]>([]);

  // Step 3 state
  const [cutResults, setCutResults] = useState<CutResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Usage data
  const { data: usage } = useQuery<{
    credits: number;
    dailyBonusCredits: number;
    tier: string;
  }>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  // Gallery data for picker (use external or fetch own)
  const { data: galleryPickerRaw, isLoading: galleryPickerLoading } = useQuery<{ items: GenerationLight[] }>({
    queryKey: ["/api/gallery", 100, "auto-webtoon-picker"],
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/gallery?limit=100&offset=0`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load gallery");
      return res.json();
    },
    enabled: isAuthenticated && showGalleryPicker,
  });
  const galleryPickerData = galleryPickerRaw?.items ?? externalGalleryData;
  const isGalleryLoading = showGalleryPicker ? galleryPickerLoading : externalGalleryLoading;

  // Cost
  const totalCuts = canvasCount * cutsPerCanvas;
  const breakdownCost = 1;
  const imageCost = totalCuts;
  const totalCost = breakdownCost + imageCost;
  const availableCredits = (usage?.credits ?? 0) + (usage?.dailyBonusCredits ?? 0);
  const hasEnoughCredits = isPro || availableCredits >= totalCost;

  // Enforce maxPanels for canvas count
  const effectiveMaxCanvas = Math.min(14, maxPanels);

  // Topic suggestion
  const topicMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/story-topic-suggest", {});
      return (await res.json()).topics as string[];
    },
    onError: (err: any) => {
      toast({ title: "주제 추천 실패", description: err.message, variant: "destructive" });
    },
  });

  // Breakdown
  const breakdownMutation = useMutation({
    mutationFn: async () => {
      const charDescs = selectedCharacters.map((c) => c.name || "캐릭터");
      const res = await apiRequest("POST", "/api/auto-webtoon/breakdown", {
        storyPrompt,
        canvasCount,
        cutsPerCanvas,
        characterDescriptions: charDescs,
      });
      return (await res.json()) as { scenes: WebtoonScene[] };
    },
    onSuccess: (data) => {
      setScenes(data.scenes);
      setStep(2);
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
    },
    onError: (err: any) => {
      toast({ title: "장면 분해 실패", description: err.message, variant: "destructive" });
    },
  });

  // Image upload
  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (selectedCharacters.length >= 4) {
      toast({ title: "최대 4개까지 선택 가능합니다.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedCharacters((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2, 10),
          name: file.name.replace(/\.[^/.]+$/, ""),
          imageUrl: dataUrl,
          imageDataUrl: dataUrl,
        },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [selectedCharacters.length, toast]);

  // Gallery pick
  const handleGalleryPick = useCallback((gen: GenerationLight) => {
    if (selectedCharacters.length >= 4) {
      toast({ title: "최대 4개까지 선택 가능합니다.", variant: "destructive" });
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      setSelectedCharacters((prev) => [
        ...prev,
        {
          id: String(gen.id),
          name: gen.prompt?.slice(0, 20) || "캐릭터",
          imageUrl: gen.resultImageUrl!,
          imageDataUrl: dataUrl,
        },
      ]);
    };
    img.onerror = () => {
      setSelectedCharacters((prev) => [
        ...prev,
        {
          id: String(gen.id),
          name: gen.prompt?.slice(0, 20) || "캐릭터",
          imageUrl: gen.resultImageUrl!,
          imageDataUrl: gen.resultImageUrl!,
        },
      ]);
    };
    img.src = gen.resultImageUrl!;
    setShowGalleryPicker(false);
  }, [selectedCharacters.length, toast]);

  const removeCharacter = (id: string) => {
    setSelectedCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  // ---- Generation ----
  const startGeneration = async () => {
    const total = scenes.length;
    const initial: CutResult[] = scenes.map((_, i) => ({ index: i, status: "pending" as CutStatus }));
    setCutResults(initial);
    setIsGenerating(true);
    setStep(3);

    const results = [...initial];
    const BATCH_SIZE = 3;

    for (let batchStart = 0; batchStart < total; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, total);
      const batchIndices = Array.from({ length: batchEnd - batchStart }, (_, i) => batchStart + i);

      for (const idx of batchIndices) {
        results[idx] = { ...results[idx], status: "generating" };
      }
      setCutResults([...results]);

      const promises = batchIndices.map(async (idx) => {
        const scene = scenes[idx];
        const styleKeyword = ART_STYLES[selectedStyle]?.promptKeyword || "";
        const scenePrompt = [styleKeyword, scene.sceneDescription].filter(Boolean).join(", ");

        try {
          const sourceImages = selectedCharacters.map((c) => c.imageDataUrl);
          const res = await apiRequest("POST", "/api/generate-background", {
            sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
            backgroundPrompt: scenePrompt,
          });
          const data = (await res.json()) as { imageUrl: string };
          if (!data.imageUrl) throw new Error("No image");
          results[idx] = { index: idx, status: "done", imageUrl: data.imageUrl };
        } catch (err: any) {
          results[idx] = { index: idx, status: "failed", error: err.message };
          if (/403/.test(err.message)) {
            for (let j = idx + 1; j < total; j++) {
              if (results[j].status === "pending" || results[j].status === "generating") {
                results[j] = { ...results[j], status: "failed", error: "크레딧 부족" };
              }
            }
          }
        }
      });

      await Promise.allSettled(promises);
      setCutResults([...results]);

      if (results.some((r) => r.error?.includes("403"))) break;
    }

    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
  };

  // Retry failed
  const retryFailed = async () => {
    const failedIndices = cutResults.filter((r) => r.status === "failed").map((r) => r.index);
    if (failedIndices.length === 0) return;

    setIsGenerating(true);
    const results = [...cutResults];

    for (const idx of failedIndices) {
      results[idx] = { ...results[idx], status: "generating", error: undefined };
    }
    setCutResults([...results]);

    const BATCH_SIZE = 3;
    for (let i = 0; i < failedIndices.length; i += BATCH_SIZE) {
      const batch = failedIndices.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (idx) => {
        const scene = scenes[idx];
        const styleKeyword = ART_STYLES[selectedStyle]?.promptKeyword || "";
        const scenePrompt = [styleKeyword, scene.sceneDescription].filter(Boolean).join(", ");

        try {
          const sourceImages = selectedCharacters.map((c) => c.imageDataUrl);
          const res = await apiRequest("POST", "/api/generate-background", {
            sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
            backgroundPrompt: scenePrompt,
          });
          const data = (await res.json()) as { imageUrl: string };
          if (!data.imageUrl) throw new Error("No image");
          results[idx] = { index: idx, status: "done", imageUrl: data.imageUrl };
        } catch (err: any) {
          results[idx] = { index: idx, status: "failed", error: err.message };
        }
      });
      await Promise.allSettled(promises);
      setCutResults([...results]);
    }

    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
  };

  // Build panels and apply to editor
  const applyToEditor = () => {
    const panels: GeneratedPanelData[] = [];

    for (let canvasIdx = 0; canvasIdx < canvasCount; canvasIdx++) {
      const cutStart = canvasIdx * cutsPerCanvas;
      const cutEnd = Math.min(cutStart + cutsPerCanvas, cutResults.length);
      const regions = getCutRegions(cutsPerCanvas);
      const dividers = buildDividerLines(cutsPerCanvas);

      const characters: any[] = [];
      for (let ci = 0; ci < cutsPerCanvas && cutStart + ci < cutEnd; ci++) {
        const r = cutResults[cutStart + ci];
        if (r.status === "done" && r.imageUrl) {
          const region = regions[ci];
          characters.push({
            id: Math.random().toString(36).slice(2, 10),
            imageUrl: r.imageUrl,
            x: region.x + region.width / 2,
            y: region.y + region.height / 2,
            scale: 1,
            width: region.width,
            height: region.height,
            imageEl: null,
            zIndex: ci,
          });
        }
      }

      const bubbles: any[] = [];
      for (let ci = 0; ci < cutsPerCanvas && cutStart + ci < cutEnd; ci++) {
        const scene = scenes[cutStart + ci];
        if (scene.bubbleText) {
          const region = regions[ci];
          bubbles.push({
            id: Math.random().toString(36).slice(2, 10),
            seed: Math.floor(Math.random() * 1000000),
            x: region.x + region.width / 2 - 70,
            y: region.y + region.height / 2 - 30,
            width: 140,
            height: 60,
            text: scene.bubbleText,
            style: "handwritten",
            tailStyle: "short",
            tailDirection: "bottom",
            tailBaseSpread: 8,
            tailCurve: 0.5,
            tailJitter: 1,
            dotsScale: 1,
            dotsSpacing: 1,
            strokeWidth: 2,
            wobble: 5,
            fontSize: 15,
            fontKey: "default",
            zIndex: 10 + ci,
          });
        }
      }

      let topScript = null;
      if (cutsPerCanvas === 1 && scenes[cutStart]?.narrativeText) {
        topScript = {
          text: scenes[cutStart].narrativeText,
          style: "default",
          color: "#000000",
          visible: true,
        };
      }

      panels.push({
        id: Math.random().toString(36).slice(2, 10),
        topScript,
        bottomScript: null,
        bubbles,
        characters,
        textElements: [],
        lineElements: dividers,
        shapeElements: [],
        backgroundColor: "#ffffff",
        backgroundImageUrl: undefined,
        backgroundImageEl: null,
        drawingLayers: [],
      });
    }

    onPanelsGenerated(panels);
    toast({ title: "에디터에 적용 완료!", description: `${panels.length}개 패널이 생성되었습니다.` });
  };

  // Layout preview
  const LayoutPreview = ({ cuts, size = 40 }: { cuts: number; size?: number }) => {
    const regions = getCutRegions(cuts);
    const scaleX = size / CANVAS_W;
    const scaleY = (size * 1.33) / CANVAS_H;
    return (
      <svg width={size} height={size * 1.33} className="border rounded bg-white dark:bg-zinc-800">
        {regions.map((r, i) => (
          <rect
            key={i}
            x={r.x * scaleX + 1}
            y={r.y * scaleY + 1}
            width={r.width * scaleX - 2}
            height={r.height * scaleY - 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className="text-muted-foreground"
          />
        ))}
        {regions.map((r, i) => (
          <text
            key={`t-${i}`}
            x={r.x * scaleX + (r.width * scaleX) / 2}
            y={r.y * scaleY + (r.height * scaleY) / 2 + 3}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={7}
          >
            {i + 1}
          </text>
        ))}
      </svg>
    );
  };

  // ========== STEP 1 ==========
  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Story input */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">스토리 입력</Label>
        <Textarea
          value={storyPrompt}
          onChange={(e) => setStoryPrompt(e.target.value)}
          placeholder="고양이가 카페에서 커피를 마시다가 바리스타가 되어버린 이야기..."
          rows={3}
          className="resize-none text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => topicMutation.mutate()}
          disabled={topicMutation.isPending}
        >
          {topicMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
          AI 주제 추천
        </Button>
        {topicMutation.data && (
          <div className="flex flex-wrap gap-1 mt-1">
            {topicMutation.data.map((topic, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors text-[10px]"
                onClick={() => setStoryPrompt(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Canvas count */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">캔버스 수 (최대 {effectiveMaxCanvas})</Label>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: effectiveMaxCanvas }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={canvasCount === n ? "default" : "outline"}
              size="sm"
              className="w-7 h-7 p-0 text-xs"
              onClick={() => setCanvasCount(n)}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>

      {/* Cuts per canvas */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">캔버스당 컷 수</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-colors ${
                cutsPerCanvas === n
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setCutsPerCanvas(n)}
            >
              <LayoutPreview cuts={n} size={32} />
              <span className="text-[10px] font-medium">{n}컷</span>
            </button>
          ))}
        </div>
      </div>

      {/* Character selection */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          캐릭터 <span className="text-muted-foreground font-normal">(최대 4개, 선택사항)</span>
        </Label>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowGalleryPicker(true)}
            disabled={selectedCharacters.length >= 4}
          >
            <FolderOpen className="h-3 w-3 mr-1" />
            갤러리
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => uploadInputRef.current?.click()}
            disabled={selectedCharacters.length >= 4}
          >
            <Upload className="h-3 w-3 mr-1" />
            업로드
          </Button>
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
        {selectedCharacters.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {selectedCharacters.map((char) => (
              <div key={char.id} className="relative group w-14 h-14 rounded-lg overflow-hidden border">
                <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeCharacter(char.id)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">스타일</Label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ART_STYLES).map(([key, s]) => (
            <Button
              key={key}
              variant={selectedStyle === key ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedStyle(key)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cost & Action */}
      <Card className="p-3">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            총 비용: <span className="font-bold text-foreground">{isPro ? "무료 (Pro)" : `${totalCost} 크레딧`}</span>
            {!isPro && <span className="text-[10px] ml-1">(분해 {breakdownCost} + 이미지 {imageCost})</span>}
          </div>
          {!isPro && (
            <div className="text-[10px] text-muted-foreground">
              보유: {availableCredits} 크레딧
              {!hasEnoughCredits && <a href="/pricing" className="text-primary ml-1 underline">충전</a>}
            </div>
          )}
          <Button
            className="w-full"
            size="sm"
            disabled={
              !storyPrompt.trim() ||
              storyPrompt.length < 5 ||
              breakdownMutation.isPending ||
              (!isPro && !hasEnoughCredits)
            }
            onClick={() => guard(() => breakdownMutation.mutate())}
          >
            {breakdownMutation.isPending ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> 분석 중...</>
            ) : (
              <><Wand2 className="h-3.5 w-3.5 mr-1.5" /> 장면 분해하기</>
            )}
          </Button>
        </div>
      </Card>

      {/* Gallery picker dialog */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>갤러리에서 캐릭터 선택</DialogTitle>
          </DialogHeader>
          {isGalleryLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : galleryPickerData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              갤러리가 비어있습니다.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {galleryPickerData
                .filter((g) => g.resultImageUrl)
                .map((gen) => {
                  const isSelected = selectedCharacters.some((c) => c.id === String(gen.id));
                  return (
                    <button
                      key={gen.id}
                      disabled={isSelected}
                      onClick={() => handleGalleryPick(gen)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-primary opacity-50 cursor-not-allowed"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={gen.thumbnailUrl || gen.resultImageUrl!}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // ========== STEP 2 ==========
  const renderStep2 = () => (
    <div className="space-y-3">
      {/* Layout preview */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          레이아웃 ({canvasCount}캔버스 x {cutsPerCanvas}컷)
        </Label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: canvasCount }, (_, ci) => (
            <div key={ci} className="flex-shrink-0 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">C{ci + 1}</div>
              <LayoutPreview cuts={cutsPerCanvas} size={36} />
            </div>
          ))}
        </div>
      </div>

      {/* Scene list */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">장면 목록 ({scenes.length}컷)</Label>
        <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-0.5">
          {scenes.map((scene, idx) => {
            const canvasIdx = Math.floor(idx / cutsPerCanvas);
            const cutIdx = idx % cutsPerCanvas;
            return (
              <Card key={idx} className="p-2">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
                    C{canvasIdx + 1}-{cutIdx + 1}
                  </Badge>
                  <div className="flex-1 space-y-1 min-w-0">
                    <Textarea
                      value={scene.sceneDescription}
                      onChange={(e) => {
                        const updated = [...scenes];
                        updated[idx] = { ...scene, sceneDescription: e.target.value };
                        setScenes(updated);
                      }}
                      rows={2}
                      className="text-xs resize-none"
                      placeholder="장면 묘사 (English)"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        value={scene.narrativeText}
                        onChange={(e) => {
                          const updated = [...scenes];
                          updated[idx] = { ...scene, narrativeText: e.target.value };
                          setScenes(updated);
                        }}
                        placeholder="나레이션"
                        className="text-xs h-7"
                      />
                      <Input
                        value={scene.bubbleText}
                        onChange={(e) => {
                          const updated = [...scenes];
                          updated[idx] = { ...scene, bubbleText: e.target.value };
                          setScenes(updated);
                        }}
                        placeholder="대사"
                        className="text-xs h-7"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-between">
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setStep(1)}>
          <ArrowLeft className="h-3 w-3 mr-1" /> 이전
        </Button>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => breakdownMutation.mutate()}
            disabled={breakdownMutation.isPending}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${breakdownMutation.isPending ? "animate-spin" : ""}`} />
            다시
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={startGeneration}>
            <ImageIcon className="h-3 w-3 mr-1" />
            생성 시작
          </Button>
        </div>
      </div>
    </div>
  );

  // ========== STEP 3 ==========
  const renderStep3 = () => {
    const doneCount = cutResults.filter((r) => r.status === "done").length;
    const failedCount = cutResults.filter((r) => r.status === "failed").length;
    const progress = cutResults.length > 0 ? (doneCount / cutResults.length) * 100 : 0;

    return (
      <div className="space-y-3">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium">
              {isGenerating ? `${doneCount}/${cutResults.length} 생성 중...` : `완료 (${doneCount}/${cutResults.length})`}
            </span>
            {failedCount > 0 && <span className="text-destructive">{failedCount} 실패</span>}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {cutResults.map((r, idx) => {
            const canvasIdx = Math.floor(idx / cutsPerCanvas);
            const cutIdx = idx % cutsPerCanvas;
            return (
              <div
                key={idx}
                className="aspect-[3/4] rounded border overflow-hidden bg-muted/30 relative"
              >
                {r.status === "done" && r.imageUrl ? (
                  <img src={r.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : r.status === "generating" ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                ) : r.status === "failed" ? (
                  <div className="flex items-center justify-center h-full bg-destructive/10">
                    <X className="h-4 w-4 text-destructive" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-[9px]">
                    {idx + 1}
                  </div>
                )}
                <span className="absolute top-0.5 left-0.5 bg-black/50 text-white text-[8px] px-0.5 rounded">
                  C{canvasIdx + 1}-{cutIdx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-1.5">
          {failedCount > 0 && !isGenerating && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={retryFailed}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> 실패 재시도 ({failedCount}컷)
            </Button>
          )}
          <Button
            className="w-full"
            size="sm"
            disabled={isGenerating || doneCount === 0}
            onClick={applyToEditor}
          >
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
            에디터에 적용 ({canvasCount}패널)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={() => { setStep(1); setCutResults([]); }}
          >
            처음부터 다시
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

      {/* Step indicator */}
      <div className="flex items-center gap-1.5">
        {[
          { num: 1, label: "설정" },
          { num: 2, label: "장면" },
          { num: 3, label: "생성" },
        ].map(({ num, label }, i) => (
          <div key={num} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                step === num
                  ? "bg-primary text-primary-foreground"
                  : step > num
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > num ? <Check className="h-2.5 w-2.5" /> : <span>{num}</span>}
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}

// Helper
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}
