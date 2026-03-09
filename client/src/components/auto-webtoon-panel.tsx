/**
 * AutoWebtoonPanel - story editor 내 자동화툰 3단계 위자드
 * Step 1: 설정 (스토리, 캔버스 수, 컷 수, 캐릭터, 스타일)
 * Step 2: 장면 편집 (AI 분해 결과 편집)
 * Step 3: 생성 진행 + 에디터 적용
 */
import { useState, useRef, useCallback, useMemo } from "react";
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

const CANVAS_W = 540;
const CANVAS_H = 675;

// ---- Layout Preview (외부 정의: 리렌더 방지) ----

function LayoutPreview({ cuts, size = 40 }: { cuts: number; size?: number }) {
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
}

// ---- Panel Data types (matches story.tsx PanelData) ----

export interface GeneratedPanelData {
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
  currentPanelCount: number;
  galleryData: GenerationLight[];
  galleryLoading: boolean;
  onPanelsGenerated: (panels: GeneratedPanelData[]) => void;
  onClose: () => void;
}

// ---- Helper ----

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

// ---- Component ----

export function AutoWebtoonPanel({
  isAuthenticated,
  isPro,
  maxPanels,
  currentPanelCount,
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
  const [canvasCount, setCanvasCount] = useState(Math.max(1, currentPanelCount));
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
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  // Usage data
  const { data: usage } = useQuery<{
    credits: number;
    dailyBonusCredits: number;
    tier: string;
  }>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  // Gallery data for picker — 열릴 때마다 항상 최신 데이터 fetch
  const [galleryPickerKey, setGalleryPickerKey] = useState(0);
  const { data: galleryPickerRaw, isLoading: galleryPickerLoading } = useQuery<{ items: GenerationLight[] }>({
    queryKey: ["/api/gallery", "picker", galleryPickerKey],
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/gallery?limit=100&offset=0`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load gallery");
      return res.json();
    },
    enabled: isAuthenticated && showGalleryPicker,
  });
  const galleryPickerData = galleryPickerRaw?.items ?? [];
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
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedCharacters((prev) => {
        if (prev.length >= 4) return prev;
        return [
          ...prev,
          {
            id: Math.random().toString(36).slice(2, 10),
            name: file.name.replace(/\.[^/.]+$/, ""),
            imageUrl: dataUrl,
            imageDataUrl: dataUrl,
          },
        ];
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  // Gallery pick - 다이얼로그 닫지 않고 토글 방식으로 여러개 선택
  const handleGalleryToggle = useCallback((gen: GenerationLight) => {
    setSelectedCharacters((prev) => {
      const existIdx = prev.findIndex((c) => c.id === String(gen.id));
      // 이미 선택됨 → 해제
      if (existIdx >= 0) {
        return prev.filter((_, i) => i !== existIdx);
      }
      // 4개 제한
      if (prev.length >= 4) return prev;

      // 추가 - thumbnailUrl 또는 resultImageUrl 사용 (light 쿼리에서 thumbnailUrl 있으면 resultImageUrl이 null)
      const imageSource = gen.resultImageUrl || gen.thumbnailUrl || "";
      const newChar: SelectedCharacter = {
        id: String(gen.id),
        name: gen.prompt?.slice(0, 20) || "캐릭터",
        imageUrl: imageSource,
        imageDataUrl: imageSource, // fallback, will try to convert or fetch full image
      };

      // thumbnailUrl만 있는 경우 full 이미지를 /api/gallery/:id 에서 가져오기
      if (!gen.resultImageUrl && gen.thumbnailUrl) {
        (async () => {
          try {
            const { getAuthHeaders } = await import("@/lib/supabase");
            const headers = await getAuthHeaders();
            const resp = await fetch(`/api/gallery/${gen.id}`, { headers });
            if (resp.ok) {
              const full = await resp.json();
              if (full.resultImageUrl) {
                // full 이미지로 base64 변환
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  try {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL("image/png");
                    setSelectedCharacters((cur) =>
                      cur.map((c) => c.id === String(gen.id) ? { ...c, imageUrl: full.resultImageUrl, imageDataUrl: dataUrl } : c)
                    );
                  } catch {
                    setSelectedCharacters((cur) =>
                      cur.map((c) => c.id === String(gen.id) ? { ...c, imageUrl: full.resultImageUrl, imageDataUrl: full.resultImageUrl } : c)
                    );
                  }
                };
                img.src = full.resultImageUrl;
                return;
              }
            }
          } catch { /* fallback to thumbnail */ }
        })();
      } else if (imageSource) {
        // resultImageUrl이 있는 경우 기존 로직대로 base64 변환
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            setSelectedCharacters((cur) =>
              cur.map((c) => c.id === String(gen.id) ? { ...c, imageDataUrl: dataUrl } : c)
            );
          } catch {
            // CORS 실패시 URL 그대로 사용
          }
        };
        img.src = imageSource;
      }

      return [...prev, newChar];
    });
  }, []);

  const removeCharacter = useCallback((id: string) => {
    setSelectedCharacters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // 컷 영역 비율 → Gemini 지원 비율 매핑
  const getGeminiAspectRatio = (width: number, height: number): string => {
    const ratio = width / height;
    if (ratio > 1.5) return "16:9";
    if (ratio > 1.1) return "4:3";
    if (ratio > 0.9) return "1:1";
    if (ratio > 0.6) return "3:4";
    return "9:16";
  };

  // ---- Generation ----
  const startGeneration = async () => {
    const ac = new AbortController();
    abortRef.current = ac;
    cancelledRef.current = false;
    const total = scenes.length;
    const initial: CutResult[] = scenes.map((_, i) => ({ index: i, status: "pending" as CutStatus }));
    setCutResults(initial);
    setIsGenerating(true);
    setStep(3);

    const results = [...initial];
    const BATCH_SIZE = 3;

    for (let batchStart = 0; batchStart < total; batchStart += BATCH_SIZE) {
      if (cancelledRef.current) break;

      const batchEnd = Math.min(batchStart + BATCH_SIZE, total);
      const batchIndices = Array.from({ length: batchEnd - batchStart }, (_, i) => batchStart + i);

      for (const idx of batchIndices) {
        results[idx] = { ...results[idx], status: "generating" };
      }
      setCutResults([...results]);

      const regions = getCutRegions(cutsPerCanvas);
      const promises = batchIndices.map(async (idx) => {
        if (cancelledRef.current) {
          results[idx] = { ...results[idx], status: "pending" };
          return;
        }
        const scene = scenes[idx];
        const styleKeyword = ART_STYLES[selectedStyle]?.promptKeyword || "";
        const cleanDesc = scene.sceneDescription.replace(/,?\s*simple line art,?\s*webtoon style/gi, "").trim();
        const storyPrefix = storyPrompt ? `[Story: ${storyPrompt}] ` : "";
        const sceneDesc = [styleKeyword, `${storyPrefix}${cleanDesc}`].filter(Boolean).join(", ");

        const cutIdx = idx % cutsPerCanvas;
        const region = regions[cutIdx];
        const geminiRatio = getGeminiAspectRatio(region.width, region.height);

        try {
          const sourceImages = selectedCharacters.map((c) => c.imageDataUrl);
          const res = await apiRequest("POST", "/api/auto-webtoon/generate-scene", {
            sceneDescription: sceneDesc,
            storyContext: storyPrompt,
            sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
            aspectRatio: geminiRatio,
            sceneIndex: idx,
            totalScenes: scenes.length,
            previousSceneDescription: idx > 0 ? scenes[idx - 1]?.sceneDescription : undefined,
          }, { signal: ac.signal });
          const data = (await res.json()) as { imageUrl: string };
          if (!data.imageUrl) throw new Error("No image");
          results[idx] = { index: idx, status: "done", imageUrl: data.imageUrl };
        } catch (err: any) {
          if (err?.name === "AbortError") {
            results[idx] = { ...results[idx], status: "pending" };
            return;
          }
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

      if (results.some((r) => r.error?.includes("403"))) {
        toast({
          title: "크레딧 부족",
          description: "크레딧이 부족합니다. 크레딧을 충전해주세요.",
          variant: "destructive",
        });
        break;
      }
    }

    setIsGenerating(false);
    abortRef.current = null;
    if (cancelledRef.current) {
      toast({ title: "생성 취소됨", description: "완료된 이미지는 유지됩니다." });
    }
    queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
    queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
  };

  // Retry failed
  const retryFailed = async () => {
    const failedIndices = cutResults.filter((r) => r.status === "failed").map((r) => r.index);
    if (failedIndices.length === 0) return;

    const ac = new AbortController();
    abortRef.current = ac;
    cancelledRef.current = false;
    setIsGenerating(true);
    const results = [...cutResults];

    for (const idx of failedIndices) {
      results[idx] = { ...results[idx], status: "generating", error: undefined };
    }
    setCutResults([...results]);

    const BATCH_SIZE = 3;
    for (let i = 0; i < failedIndices.length; i += BATCH_SIZE) {
      if (cancelledRef.current) break;

      const batch = failedIndices.slice(i, i + BATCH_SIZE);
      const regions = getCutRegions(cutsPerCanvas);
      const promises = batch.map(async (idx) => {
        if (cancelledRef.current) {
          results[idx] = { ...results[idx], status: "failed" };
          return;
        }
        const scene = scenes[idx];
        const styleKeyword = ART_STYLES[selectedStyle]?.promptKeyword || "";
        const cleanDesc = scene.sceneDescription.replace(/,?\s*simple line art,?\s*webtoon style/gi, "").trim();
        const storyPrefix = storyPrompt ? `[Story: ${storyPrompt}] ` : "";
        const sceneDesc = [styleKeyword, `${storyPrefix}${cleanDesc}`].filter(Boolean).join(", ");

        const cutIdx = idx % cutsPerCanvas;
        const region = regions[cutIdx];
        const geminiRatio = getGeminiAspectRatio(region.width, region.height);

        try {
          const sourceImages = selectedCharacters.map((c) => c.imageDataUrl);
          const res = await apiRequest("POST", "/api/auto-webtoon/generate-scene", {
            sceneDescription: sceneDesc,
            storyContext: storyPrompt,
            sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
            aspectRatio: geminiRatio,
            sceneIndex: idx,
            totalScenes: scenes.length,
            previousSceneDescription: idx > 0 ? scenes[idx - 1]?.sceneDescription : undefined,
          }, { signal: ac.signal });
          const data = (await res.json()) as { imageUrl: string };
          if (!data.imageUrl) throw new Error("No image");
          results[idx] = { index: idx, status: "done", imageUrl: data.imageUrl };
        } catch (err: any) {
          if (err?.name === "AbortError") {
            results[idx] = { ...results[idx], status: "failed" };
            return;
          }
          results[idx] = { index: idx, status: "failed", error: err.message };
        }
      });
      await Promise.allSettled(promises);
      setCutResults([...results]);

      if (results.some((r) => r.error?.includes("403"))) {
        toast({
          title: "크레딧 부족",
          description: "크레딧이 부족합니다. 크레딧을 충전해주세요.",
          variant: "destructive",
        });
        break;
      }
    }

    setIsGenerating(false);
    abortRef.current = null;
    if (cancelledRef.current) {
      toast({ title: "재시도 취소됨", description: "완료된 이미지는 유지됩니다." });
    }
    queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
    queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
  };

  // Build panels and apply to editor
  const applyToEditor = async () => {
    const panels: GeneratedPanelData[] = [];

    // Helper: load image and return HTMLImageElement with natural dimensions
    const loadImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

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
          // Pre-load image to calculate proper scale to fill cut region (cover)
          let scale = 1;
          let imageEl: HTMLImageElement | null = null;
          try {
            imageEl = await loadImage(r.imageUrl);
            scale = Math.max(
              region.width / imageEl.naturalWidth,
              region.height / imageEl.naturalHeight,
            );
          } catch {
            scale = Math.max(region.width / 1024, region.height / 1024);
          }
          characters.push({
            id: Math.random().toString(36).slice(2, 10),
            imageUrl: r.imageUrl,
            x: region.x + region.width / 2,
            y: region.y + region.height / 2,
            scale,
            width: region.width,
            height: region.height,
            imageEl,
            zIndex: ci,
          });
        }
      }

      const bubbles: any[] = [];
      const textElements: any[] = [];
      for (let ci = 0; ci < cutsPerCanvas && cutStart + ci < cutEnd; ci++) {
        const scene = scenes[cutStart + ci];
        const region = regions[ci];
        // 말풍선: bubbleText 또는 narrativeText 중 하나라도 있으면 생성
        const bubbleContent = scene?.bubbleText || scene?.narrativeText || "";
        if (bubbleContent) {
          bubbles.push({
            id: Math.random().toString(36).slice(2, 10),
            seed: Math.floor(Math.random() * 1000000),
            x: region.x + region.width / 2 - 70,
            y: region.y + region.height / 2 - 30,
            width: 140,
            height: 60,
            text: bubbleContent,
            style: "linedrawing",
            tailStyle: "short",
            tailDirection: "bottom",
            tailBaseSpread: 20,
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
        // 나레이션: bubbleText와 별도로 narrativeText가 있으면 텍스트 요소로 추가
        if (scene?.narrativeText && scene?.bubbleText) {
          textElements.push({
            id: Math.random().toString(36).slice(2, 10),
            text: scene.narrativeText,
            x: region.x + 8,
            y: region.y + 8,
            width: region.width - 16,
            height: 30,
            fontSize: 12,
            fontFamily: "default",
            color: "#333333",
            textAlign: "left",
            opacity: 1,
            zIndex: 20 + ci,
          });
        }
      }

      panels.push({
        id: Math.random().toString(36).slice(2, 10),
        topScript: null,
        bottomScript: null,
        bubbles,
        characters,
        textElements,
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

  // ========== STEP 1 ==========
  const renderStep1 = () => (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      {/* Story input */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">스토리 입력</Label>
        <Textarea
          value={storyPrompt}
          onChange={(e) => setStoryPrompt(e.target.value)}
          placeholder="고양이가 카페에서 커피를 마시다가 바리스타가 되어버린 이야기..."
          rows={3}
          className="resize-none text-sm"
          onMouseDown={(e) => e.stopPropagation()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={(e) => { e.stopPropagation(); topicMutation.mutate(); }}
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
                onClick={(e) => { e.stopPropagation(); setStoryPrompt(topic); }}
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
              type="button"
              variant={canvasCount === n ? "default" : "outline"}
              size="sm"
              className="w-7 h-7 p-0 text-xs"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCanvasCount(n); }}
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
              type="button"
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-colors cursor-pointer ${
                cutsPerCanvas === n
                  ? "border-primary bg-primary/20 shadow-sm"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCutsPerCanvas(n); }}
              onMouseDown={(e) => e.stopPropagation()}
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
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => { e.stopPropagation(); setGalleryPickerKey(k => k + 1); setShowGalleryPicker(true); }}
            disabled={selectedCharacters.length >= 4}
          >
            <FolderOpen className="h-3 w-3 mr-1" />
            갤러리
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => { e.stopPropagation(); uploadInputRef.current?.click(); }}
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
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeCharacter(char.id); }}
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
              type="button"
              variant={selectedStyle === key ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => { e.stopPropagation(); setSelectedStyle(key); }}
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
            type="button"
            className="w-full"
            size="sm"
            disabled={
              !storyPrompt.trim() ||
              storyPrompt.length < 5 ||
              breakdownMutation.isPending ||
              (!isPro && !hasEnoughCredits)
            }
            onClick={(e) => { e.stopPropagation(); guard(() => breakdownMutation.mutate()); }}
          >
            {breakdownMutation.isPending ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> 분석 중...</>
            ) : (
              <><Wand2 className="h-3.5 w-3.5 mr-1.5" /> 장면 분해하기</>
            )}
          </Button>
        </div>
      </Card>

      {/* Gallery picker dialog - 멀티 선택 지원 */}
      <Dialog open={showGalleryPicker} onOpenChange={setShowGalleryPicker}>
        <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>갤러리에서 캐릭터 선택</span>
              <span className="text-xs font-normal text-muted-foreground">
                {selectedCharacters.length}/4 선택됨
              </span>
            </DialogTitle>
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
            <>
              <div className="grid grid-cols-4 gap-2">
                {galleryPickerData
                  .filter((g) => g.resultImageUrl || g.thumbnailUrl)
                  .map((gen) => {
                    const isSelected = selectedCharacters.some((c) => c.id === String(gen.id));
                    const isFull = selectedCharacters.length >= 4 && !isSelected;
                    return (
                      <button
                        key={gen.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => handleGalleryToggle(gen)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/30"
                            : isFull
                              ? "border-transparent opacity-40 cursor-not-allowed"
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
              <div className="flex justify-end mt-3">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowGalleryPicker(false)}
                >
                  선택 완료 ({selectedCharacters.length}개)
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // ========== STEP 2 ==========
  const renderStep2 = () => (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
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
                      onMouseDown={(e) => e.stopPropagation()}
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
                        onMouseDown={(e) => e.stopPropagation()}
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
                        onMouseDown={(e) => e.stopPropagation()}
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
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setStep(1); }}>
          <ArrowLeft className="h-3 w-3 mr-1" /> 이전
        </Button>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => { e.stopPropagation(); breakdownMutation.mutate(); }}
            disabled={breakdownMutation.isPending}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${breakdownMutation.isPending ? "animate-spin" : ""}`} />
            다시
          </Button>
          <Button type="button" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); startGeneration(); }}>
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
      <div className="space-y-3" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
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
          {isGenerating && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                cancelledRef.current = true;
                abortRef.current?.abort();
              }}
            >
              <X className="h-3 w-3 mr-1" /> 생성 취소
            </Button>
          )}
          {failedCount > 0 && !isGenerating && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={(e) => { e.stopPropagation(); retryFailed(); }}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> 실패 재시도 ({failedCount}컷)
            </Button>
          )}
          <Button
            type="button"
            className="w-full"
            size="sm"
            disabled={isGenerating || doneCount === 0}
            onClick={(e) => { e.stopPropagation(); applyToEditor(); }}
          >
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
            에디터에 적용 ({canvasCount}패널)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            disabled={isGenerating}
            onClick={(e) => { e.stopPropagation(); setStep(1); setCutResults([]); }}
          >
            처음부터 다시
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
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
