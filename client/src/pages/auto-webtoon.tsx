import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { useAuth } from "@/hooks/use-auth";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { getCutRegions, buildDividerLines } from "@/lib/webtoon-layout";
import {
  Wand2, ArrowRight, ArrowLeft, Loader2, Check, X, RefreshCw,
  ImageIcon, Upload, FolderOpen, Sparkles, BookOpen, Trash2,
} from "lucide-react";
import type { GenerationLight } from "@shared/schema";
import { supabase } from "@/lib/supabase";

const CANVAS_W = 450;
const CANVAS_H = 600;

interface UsageData {
  credits: number;
  dailyBonusCredits: number;
  tier: string;
}

interface WebtoonScene {
  sceneDescription: string;
  narrativeText: string;
  bubbleText: string;
}

interface SelectedCharacter {
  id: string;
  name: string;
  imageUrl: string;
  imageDataUrl: string; // base64 data url for API
}

type CutStatus = "pending" | "generating" | "done" | "failed";

interface CutResult {
  index: number;
  status: CutStatus;
  imageUrl?: string;
  error?: string;
}

const ART_STYLES: Record<string, { label: string; promptKeyword: string }> = {
  "simple-line":  { label: "심플 라인",      promptKeyword: "simple line art, thick clean outlines, minimal flat color, webtoon style" },
  "minimal":      { label: "미니멀",          promptKeyword: "minimal cartoon, dot eyes, geometric shapes, ultra-simple line art" },
  "doodle":       { label: "낙서풍",          promptKeyword: "doodle sketch style, rough pen lines, hand-drawn scribble, sketch art" },
  "cute-animal":  { label: "귀여운 동물",      promptKeyword: "cute chibi animal style, round shapes, pastel color, kawaii cartoon" },
};

export default function AutoWebtoonPage() {
  const { isAuthenticated } = useAuth();
  const { showLoginDialog, setShowLoginDialog, guard } = useLoginGuard();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // ---- Step state ----
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ---- Step 1 state ----
  const [storyPrompt, setStoryPrompt] = useState("");
  const [canvasCount, setCanvasCount] = useState(3);
  const [cutsPerCanvas, setCutsPerCanvas] = useState(4);
  const [selectedStyle, setSelectedStyle] = useState("simple-line");
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // ---- Step 2 state ----
  const [scenes, setScenes] = useState<WebtoonScene[]>([]);

  // ---- Step 3 state ----
  const [cutResults, setCutResults] = useState<CutResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProjectId, setGeneratedProjectId] = useState<number | null>(null);

  // ---- Usage data ----
  const { data: usage } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  // ---- Gallery data ----
  const { data: galleryRaw, isLoading: galleryLoading } = useQuery<{ items: GenerationLight[] }>({
    queryKey: ["/api/gallery", 100],
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/gallery?limit=100&offset=0`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load gallery");
      return res.json();
    },
    enabled: isAuthenticated && showGalleryPicker,
  });
  const galleryData = galleryRaw?.items ?? [];

  // ---- Cost calculation ----
  const totalCuts = canvasCount * cutsPerCanvas;
  const breakdownCost = 1;
  const imageCost = totalCuts;
  const totalCost = breakdownCost + imageCost;
  const availableCredits = (usage?.credits ?? 0) + (usage?.dailyBonusCredits ?? 0);
  const isPro = usage?.tier === "pro";
  const hasEnoughCredits = isPro || availableCredits >= totalCost;

  // ---- Topic suggestion ----
  const topicMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/story-topic-suggest", {});
      return (await res.json()).topics as string[];
    },
    onError: (err: any) => {
      toast({ title: "주제 추천 실패", description: err.message, variant: "destructive" });
    },
  });

  // ---- Step 1 → Step 2: breakdown ----
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

  // ---- Image upload handler ----
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

  // ---- Gallery pick handler ----
  const handleGalleryPick = useCallback((gen: GenerationLight) => {
    if (selectedCharacters.length >= 4) {
      toast({ title: "최대 4개까지 선택 가능합니다.", variant: "destructive" });
      return;
    }
    // Load the image as base64
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
      // Fallback: use URL directly (may not work for generate-background API)
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

  // ---- Step 2 → Step 3: generate images ----
  const startGeneration = async () => {
    const totalCuts = scenes.length;
    const initial: CutResult[] = scenes.map((_, i) => ({
      index: i,
      status: "pending" as CutStatus,
    }));
    setCutResults(initial);
    setIsGenerating(true);
    setStep(3);

    const results = [...initial];
    const BATCH_SIZE = 3;

    // Process in batches
    for (let batchStart = 0; batchStart < totalCuts; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalCuts);
      const batchIndices = Array.from({ length: batchEnd - batchStart }, (_, i) => batchStart + i);

      // Mark batch as generating
      for (const idx of batchIndices) {
        results[idx] = { ...results[idx], status: "generating" };
      }
      setCutResults([...results]);

      // Parallel requests in batch
      const promises = batchIndices.map(async (idx) => {
        const scene = scenes[idx];
        const styleKeyword = ART_STYLES[selectedStyle]?.promptKeyword || "";
        const scenePrompt = [styleKeyword, scene.sceneDescription].filter(Boolean).join(", ");

        try {
          const sourceImages = selectedCharacters.map((c) => c.imageDataUrl);
          const res = await apiRequest("POST", "/api/generate-background", {
            sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
            backgroundPrompt: sourceImages.length > 0 ? scenePrompt : scenePrompt,
          });
          const data = (await res.json()) as { imageUrl: string };
          if (!data.imageUrl) throw new Error("No image");
          results[idx] = { index: idx, status: "done", imageUrl: data.imageUrl };
        } catch (err: any) {
          results[idx] = { index: idx, status: "failed", error: err.message };
          // Stop on credit error
          if (/403/.test(err.message)) {
            for (let j = idx + 1; j < totalCuts; j++) {
              if (results[j].status === "pending" || results[j].status === "generating") {
                results[j] = { ...results[j], status: "failed", error: "크레딧 부족" };
              }
            }
          }
        }
      });

      await Promise.allSettled(promises);
      setCutResults([...results]);

      // Abort remaining if credit error
      if (results.some((r) => r.error?.includes("403"))) break;
    }

    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ["/api/usage"] });

    // Auto-save project
    const successResults = results.filter((r) => r.status === "done" && r.imageUrl);
    if (successResults.length > 0) {
      try {
        const projectId = await saveProject(results);
        setGeneratedProjectId(projectId);
        toast({ title: "자동화툰 생성 완료!", description: `${successResults.length}/${totalCuts}컷 성공` });
      } catch (err: any) {
        toast({ title: "프로젝트 저장 실패", description: err.message, variant: "destructive" });
      }
    }
  };

  // ---- Retry failed cuts ----
  const retryFailed = async () => {
    const failedIndices = cutResults
      .filter((r) => r.status === "failed")
      .map((r) => r.index);
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

  // ---- Save to bubble-projects ----
  const saveProject = async (results: CutResult[]): Promise<number> => {
    // Build PanelData array - one per canvas
    const panels: any[] = [];

    for (let canvasIdx = 0; canvasIdx < canvasCount; canvasIdx++) {
      const cutStart = canvasIdx * cutsPerCanvas;
      const cutEnd = Math.min(cutStart + cutsPerCanvas, results.length);
      const regions = getCutRegions(cutsPerCanvas);
      const dividers = buildDividerLines(cutsPerCanvas);

      const characters: any[] = [];
      for (let ci = 0; ci < cutsPerCanvas && cutStart + ci < cutEnd; ci++) {
        const r = results[cutStart + ci];
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

      // Add bubble text from scenes
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

      // Add narrative text as top/bottom scripts
      let topScript = null;
      let bottomScript = null;
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
        bottomScript,
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

    const canvasData = JSON.stringify(panels);
    const res = await apiRequest("POST", "/api/bubble-projects", {
      name: `자동화툰: ${storyPrompt.slice(0, 30)}...`,
      canvasData,
      editorType: "story",
    });
    const project = await res.json();
    return project.id;
  };

  // ---- Layout preview component ----
  const LayoutPreview = ({ cuts, size = 60 }: { cuts: number; size?: number }) => {
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
            x={r.x * scaleX + r.width * scaleX / 2}
            y={r.y * scaleY + r.height * scaleY / 2 + 3}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={8}
          >
            {i + 1}
          </text>
        ))}
      </svg>
    );
  };

  // ---- Step 1: Settings ----
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Story input */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">스토리 입력</Label>
        <Textarea
          value={storyPrompt}
          onChange={(e) => setStoryPrompt(e.target.value)}
          placeholder="고양이가 카페에서 커피를 마시다가 갑자기 바리스타가 되어버린 이야기..."
          rows={4}
          className="resize-none"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => topicMutation.mutate()}
            disabled={topicMutation.isPending}
          >
            {topicMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            AI 주제 추천
          </Button>
        </div>
        {topicMutation.data && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {topicMutation.data.map((topic, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setStoryPrompt(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Canvas & Cut settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-base font-semibold">캔버스 수</Label>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((n) => (
              <Button
                key={n}
                variant={canvasCount === n ? "default" : "outline"}
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => setCanvasCount(n)}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base font-semibold">컷/캔버스</Label>
          <div className="flex gap-3 items-end">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors ${
                  cutsPerCanvas === n
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setCutsPerCanvas(n)}
              >
                <LayoutPreview cuts={n} size={40} />
                <span className="text-xs font-medium">{n}컷</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Character selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          캐릭터 선택 <span className="text-muted-foreground font-normal text-sm">(최대 4개, 선택 사항)</span>
        </Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGalleryPicker(true)}
            disabled={selectedCharacters.length >= 4}
          >
            <FolderOpen className="h-3.5 w-3.5 mr-1" />
            갤러리에서 선택
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => uploadInputRef.current?.click()}
            disabled={selectedCharacters.length >= 4}
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            이미지 업로드
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
          <div className="flex gap-2 flex-wrap">
            {selectedCharacters.map((char) => (
              <div
                key={char.id}
                className="relative group w-20 h-20 rounded-lg overflow-hidden border"
              >
                <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeCharacter(char.id)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center truncate px-1">
                  {char.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style selection */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">스타일</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ART_STYLES).map(([key, s]) => (
            <Button
              key={key}
              variant={selectedStyle === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStyle(key)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cost & Action */}
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              총 비용: <span className="font-bold text-foreground">{isPro ? "무료 (Pro)" : `${totalCost} 크레딧`}</span>
              {!isPro && (
                <span className="text-xs ml-2">(분해 {breakdownCost} + 이미지 {imageCost})</span>
              )}
            </div>
            {!isPro && (
              <div className="text-xs text-muted-foreground">
                보유: {availableCredits} 크레딧
                {!hasEnoughCredits && (
                  <a href="/pricing" className="text-primary ml-1 underline">충전하기</a>
                )}
              </div>
            )}
          </div>
          <Button
            size="lg"
            disabled={
              !storyPrompt.trim() ||
              storyPrompt.length < 5 ||
              breakdownMutation.isPending ||
              (!isPro && !hasEnoughCredits)
            }
            onClick={() => guard(() => breakdownMutation.mutate())}
          >
            {breakdownMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 분석 중...</>
            ) : (
              <><Wand2 className="h-4 w-4 mr-2" /> 장면 분배하기</>
            )}
          </Button>
        </div>
      </Card>

      {/* Gallery picker dialog */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto" data-lenis-prevent>
          <DialogHeader>
            <DialogTitle>갤러리에서 캐릭터 선택</DialogTitle>
          </DialogHeader>
          {galleryLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : galleryData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              갤러리가 비어있습니다. 먼저 캐릭터를 생성해주세요.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {galleryData
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

  // ---- Step 2: Preview scenes ----
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Canvas layout preview */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          레이아웃 미리보기 ({canvasCount}캔버스 x {cutsPerCanvas}컷)
        </Label>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: canvasCount }, (_, ci) => (
            <div key={ci} className="flex-shrink-0">
              <div className="text-xs text-muted-foreground text-center mb-1">Canvas {ci + 1}</div>
              <LayoutPreview cuts={cutsPerCanvas} size={60} />
            </div>
          ))}
        </div>
      </div>

      {/* Scene list */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">장면 목록 ({scenes.length}컷)</Label>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {scenes.map((scene, idx) => {
            const canvasIdx = Math.floor(idx / cutsPerCanvas);
            const cutIdx = idx % cutsPerCanvas;
            return (
              <Card key={idx} className="p-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="shrink-0 mt-0.5">
                    C{canvasIdx + 1}-{cutIdx + 1}
                  </Badge>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Textarea
                      value={scene.sceneDescription}
                      onChange={(e) => {
                        const updated = [...scenes];
                        updated[idx] = { ...scene, sceneDescription: e.target.value };
                        setScenes(updated);
                      }}
                      rows={2}
                      className="text-sm resize-none"
                      placeholder="Scene description (English)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={scene.narrativeText}
                        onChange={(e) => {
                          const updated = [...scenes];
                          updated[idx] = { ...scene, narrativeText: e.target.value };
                          setScenes(updated);
                        }}
                        placeholder="나레이션 (한국어)"
                        className="text-sm"
                      />
                      <Input
                        value={scene.bubbleText}
                        onChange={(e) => {
                          const updated = [...scenes];
                          updated[idx] = { ...scene, bubbleText: e.target.value };
                          setScenes(updated);
                        }}
                        placeholder="대사 (한국어)"
                        className="text-sm"
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
      <div className="flex gap-3 justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> 이전
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => breakdownMutation.mutate()}
            disabled={breakdownMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${breakdownMutation.isPending ? "animate-spin" : ""}`} />
            다시 분배
          </Button>
          <Button onClick={startGeneration}>
            <ImageIcon className="h-4 w-4 mr-2" />
            이미지 생성 시작 ({isPro ? "Pro" : `${imageCost} 크레딧`})
          </Button>
        </div>
      </div>
    </div>
  );

  // ---- Step 3: Generation progress ----
  const renderStep3 = () => {
    const doneCount = cutResults.filter((r) => r.status === "done").length;
    const failedCount = cutResults.filter((r) => r.status === "failed").length;
    const progress = cutResults.length > 0 ? (doneCount / cutResults.length) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {isGenerating ? `${doneCount}/${cutResults.length} 컷 생성 중...` : `생성 완료 (${doneCount}/${cutResults.length})`}
            </span>
            {failedCount > 0 && (
              <span className="text-destructive">{failedCount}컷 실패</span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Grid of results */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {cutResults.map((r, idx) => {
            const canvasIdx = Math.floor(idx / cutsPerCanvas);
            const cutIdx = idx % cutsPerCanvas;
            return (
              <div
                key={idx}
                className="aspect-[3/4] rounded-lg border overflow-hidden bg-muted/30 relative"
              >
                {r.status === "done" && r.imageUrl ? (
                  <img src={r.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : r.status === "generating" ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : r.status === "failed" ? (
                  <div className="flex items-center justify-center h-full bg-destructive/10">
                    <X className="h-5 w-5 text-destructive" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                    {idx + 1}
                  </div>
                )}
                <span className="absolute top-0.5 left-0.5 bg-black/50 text-white text-[9px] px-1 rounded">
                  C{canvasIdx + 1}-{cutIdx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-between flex-wrap">
          <div className="flex gap-2">
            {failedCount > 0 && !isGenerating && (
              <Button variant="outline" onClick={retryFailed}>
                <RefreshCw className="h-4 w-4 mr-1" /> 실패한 컷 재시도 ({failedCount}컷)
              </Button>
            )}
          </div>
          <Button
            disabled={isGenerating || doneCount === 0}
            onClick={() => {
              if (generatedProjectId) {
                navigate(`/story?projectId=${generatedProjectId}`);
              }
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            스토리 편집기에서 열기
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-20">
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          자동화툰 생성기
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          스토리를 입력하면 AI가 자동으로 컷별 장면을 생성합니다
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { num: 1, label: "설정" },
          { num: 2, label: "장면 미리보기" },
          { num: 3, label: "생성" },
        ].map(({ num, label }, i) => (
          <div key={num} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                step === num
                  ? "bg-primary text-primary-foreground"
                  : step > num
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > num ? <Check className="h-3.5 w-3.5" /> : <span>{num}</span>}
              <span className="hidden sm:inline">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </Card>
    </div>
  );
}

// Helper to get auth headers (same pattern as queryClient.ts)
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
