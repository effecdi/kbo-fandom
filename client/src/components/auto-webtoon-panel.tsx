/**
 * AutoWebtoonPanel - story editor 내 자동화툰 3단계 위자드
 * Step 1: 설정 (스토리, 캔버스 수, 컷 수, 캐릭터, 스타일)
 * Step 2: 장면 편집 (AI 분해 결과 편집)
 * Step 3: 생성 진행 + 에디터 적용
 */
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { getCutRegions, buildDividerLines, type CutLayoutType, type CutBorderStyle } from "@/lib/webtoon-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wand2, ArrowLeft, Loader2, Check, X, RefreshCw,
  Sparkles, ImageIcon, ArrowRight, Plus, Trash2,
} from "lucide-react";
import type { GenerationLight, CharacterFolder } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { CharacterPicker, type CharacterImage } from "@/components/character-picker";

// ---- Types ----

interface WebtoonScene {
  sceneDescription: string;
  narrativeText: string;
  bubbleText: string; // legacy compat
  bubbles: Array<{ text: string; style?: string; position?: string }>;
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

function LayoutPreview({ cuts, size = 40, layoutType = "default", canvasW = CANVAS_W, canvasH = CANVAS_H }: { cuts: number; size?: number; layoutType?: CutLayoutType; canvasW?: number; canvasH?: number }) {
  const regions = getCutRegions(cuts, layoutType, canvasW, canvasH);
  const aspect = canvasH / canvasW;
  const scaleX = size / canvasW;
  const scaleY = (size * aspect) / canvasH;
  return (
    <svg width={size} height={size * aspect} className="border rounded bg-white dark:bg-zinc-800">
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

type CharacterFolderWithItems = CharacterFolder & { items: { generationId: number }[] };

export interface AutoWebtoonPanelProps {
  isAuthenticated: boolean;
  isPro: boolean;
  maxPanels: number;
  currentPanelCount: number;
  galleryData: GenerationLight[];
  galleryLoading: boolean;
  onPanelsGenerated: (panels: GeneratedPanelData[]) => void;
  onClose: () => void;
  canvasWidth?: number;
  canvasHeight?: number;
  characterStripData?: any[];
  characterFolders?: CharacterFolderWithItems[];
  fetchFullGeneration?: (id: number) => Promise<any>;
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
  canvasWidth: propCanvasW,
  canvasHeight: propCanvasH,
  characterStripData: externalCharacterStripData,
  characterFolders: externalCharacterFolders,
  fetchFullGeneration: externalFetchFullGeneration,
}: AutoWebtoonPanelProps) {
  const effectiveCanvasW = propCanvasW ?? CANVAS_W;
  const effectiveCanvasH = propCanvasH ?? CANVAS_H;
  const { toast } = useToast();
  const { showLoginDialog, setShowLoginDialog, guard } = useLoginGuard();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [storyPrompt, setStoryPrompt] = useState("");
  const [canvasCount, setCanvasCount] = useState(Math.max(1, currentPanelCount));
  const [cutsPerCanvas, setCutsPerCanvas] = useState(4);
  const [cutLayoutType, setCutLayoutType] = useState<CutLayoutType>("default");
  const [cutBorderStyle, setCutBorderStyle] = useState<CutBorderStyle>("wobbly");
  const [selectedStyle, setSelectedStyle] = useState("simple-line");
  const [selectedCharacters, setSelectedCharacters] = useState<CharacterImage[]>([]);
  const [activePickerFolderId, setActivePickerFolderId] = useState<number | null>(null);

  // Step 2 state
  const [scenes, setScenes] = useState<WebtoonScene[]>([]);

  // Step 3 state
  const [cutResults, setCutResults] = useState<CutResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Usage data
  const { data: usage } = useQuery<{
    credits: number;
    dailyBonusCredits: number;
    tier: string;
  }>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  // Character strip data from parent (or fallback query)
  const { data: fallbackCharacterStripRaw } = useQuery<{ items: GenerationLight[] }>({
    queryKey: ["/api/gallery", "character-strip"],
    staleTime: 30_000,
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/gallery?type=character&limit=12", { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load character strip");
      return res.json();
    },
    enabled: isAuthenticated && !externalCharacterStripData,
  });
  const characterStripData = externalCharacterStripData ?? fallbackCharacterStripRaw?.items ?? [];

  // Character folders from parent (or fallback query)
  const { data: fallbackCharacterFolders = [] } = useQuery<CharacterFolderWithItems[]>({
    queryKey: ["/api/character-folders"],
    enabled: isAuthenticated && !externalCharacterFolders,
  });
  const characterFolders = externalCharacterFolders ?? fallbackCharacterFolders;

  // Gallery data for picker — use external or own query
  const [galleryPickerKey, setGalleryPickerKey] = useState(0);
  const { data: galleryPickerRaw, isLoading: galleryPickerLoading } = useQuery<{ items: GenerationLight[]; hasMore?: boolean }>({
    queryKey: ["/api/gallery", "picker", galleryPickerKey, activePickerFolderId],
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      const authHeaders = await getAuthHeaders();
      const folderParam = activePickerFolderId ? `&folderId=${activePickerFolderId}` : "";
      const res = await fetch(`/api/gallery?limit=100&offset=0${folderParam}`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load gallery");
      return res.json();
    },
    enabled: isAuthenticated,
  });
  const galleryPickerData = galleryPickerRaw?.items ?? [];

  // fetchFullGeneration from parent or fallback
  const fetchFullGeneration = useCallback(async (id: number): Promise<any> => {
    if (externalFetchFullGeneration) return externalFetchFullGeneration(id);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/gallery/${id}`, { headers: authHeaders });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }, [externalFetchFullGeneration]);

  // localStorage: restore storyPrompt on mount
  useEffect(() => {
    const saved = localStorage.getItem("olli_autowebtoon_story");
    if (saved) setStoryPrompt(saved);
  }, []);

  // localStorage: save storyPrompt on change
  useEffect(() => {
    if (storyPrompt) {
      localStorage.setItem("olli_autowebtoon_story", storyPrompt);
    }
  }, [storyPrompt]);

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

  // Helper to update character name after AI analysis
  const updateCharName = useCallback((charId: string, name: string) => {
    setSelectedCharacters((prev) =>
      prev.map((c) => c.id === charId ? { ...c, name } : c)
    );
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
    setPreviewIndex(null);
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

      const regions = getCutRegions(cutsPerCanvas, cutLayoutType, effectiveCanvasW, effectiveCanvasH);
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
          const sourceImages = selectedCharacters.map((c) => c.imageDataUrl || c.imageUrl);
          const charNames = selectedCharacters.map((c) => c.name).filter(Boolean);
          const res = await apiRequest("POST", "/api/auto-webtoon/generate-scene", {
            sceneDescription: sceneDesc,
            storyContext: storyPrompt,
            sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
            characterNames: charNames.length > 0 ? charNames : undefined,
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
      const regions = getCutRegions(cutsPerCanvas, cutLayoutType, effectiveCanvasW, effectiveCanvasH);
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
          const sourceImages = selectedCharacters.map((c) => c.imageDataUrl || c.imageUrl);
          const charNames = selectedCharacters.map((c) => c.name).filter(Boolean);
          const res = await apiRequest("POST", "/api/auto-webtoon/generate-scene", {
            sceneDescription: sceneDesc,
            storyContext: storyPrompt,
            sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
            characterNames: charNames.length > 0 ? charNames : undefined,
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

  // Regenerate single cut
  const regenerateSingle = async (idx: number) => {
    const ac = new AbortController();
    abortRef.current = ac;
    cancelledRef.current = false;
    setIsGenerating(true);

    const results = [...cutResults];
    results[idx] = { ...results[idx], status: "generating", error: undefined };
    setCutResults([...results]);

    const scene = scenes[idx];
    const styleKeyword = ART_STYLES[selectedStyle]?.promptKeyword || "";
    const cleanDesc = scene.sceneDescription.replace(/,?\s*simple line art,?\s*webtoon style/gi, "").trim();
    const storyPrefix = storyPrompt ? `[Story: ${storyPrompt}] ` : "";
    const sceneDesc = [styleKeyword, `${storyPrefix}${cleanDesc}`].filter(Boolean).join(", ");

    const regions = getCutRegions(cutsPerCanvas, cutLayoutType, effectiveCanvasW, effectiveCanvasH);
    const cutIdx = idx % cutsPerCanvas;
    const region = regions[cutIdx];
    const geminiRatio = getGeminiAspectRatio(region.width, region.height);

    try {
      const sourceImages = selectedCharacters.map((c) => c.imageDataUrl || c.imageUrl);
      const charNames = selectedCharacters.map((c) => c.name).filter(Boolean);
      const res = await apiRequest("POST", "/api/auto-webtoon/generate-scene", {
        sceneDescription: sceneDesc,
        storyContext: storyPrompt,
        sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
        characterNames: charNames.length > 0 ? charNames : undefined,
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
      } else {
        results[idx] = { index: idx, status: "failed", error: err.message };
      }
    }

    setCutResults([...results]);
    setIsGenerating(false);
    abortRef.current = null;
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
      const regions = getCutRegions(cutsPerCanvas, cutLayoutType, effectiveCanvasW, effectiveCanvasH);
      const dividers = buildDividerLines(cutsPerCanvas, cutLayoutType, cutBorderStyle, undefined, effectiveCanvasW, effectiveCanvasH);

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

      // Position → 컷 영역 내 좌표 변환
      const getBubblePos = (position: string | undefined, region: { x: number; y: number; width: number; height: number }, index: number) => {
        const pos = position || (index % 2 === 0 ? "top-left" : "bottom-right");
        switch (pos) {
          case "top-left": return { x: region.x + region.width * 0.08, y: region.y + region.height * 0.1 };
          case "top-right": return { x: region.x + region.width * 0.5, y: region.y + region.height * 0.1 };
          case "bottom-left": return { x: region.x + region.width * 0.08, y: region.y + region.height * 0.55 };
          case "bottom-right": return { x: region.x + region.width * 0.5, y: region.y + region.height * 0.55 };
          case "center": return { x: region.x + region.width * 0.3, y: region.y + region.height * 0.3 };
          default: return { x: region.x + region.width * 0.25, y: region.y + region.height * 0.15 };
        }
      };

      for (let ci = 0; ci < cutsPerCanvas && cutStart + ci < cutEnd; ci++) {
        const scene = scenes[cutStart + ci];
        const region = regions[ci];
        const sceneBubbles = scene?.bubbles || [];

        // bubbles 배열에서 말풍선 생성
        for (let bi = 0; bi < sceneBubbles.length; bi++) {
          const b = sceneBubbles[bi];
          if (!b.text) continue;
          const coords = getBubblePos(b.position, region, bi);
          let tailDirection = "bottom";
          if (b.position?.includes("top")) tailDirection = "bottom";
          if (b.position?.includes("bottom")) tailDirection = "top";
          bubbles.push({
            id: Math.random().toString(36).slice(2, 10),
            seed: Math.floor(Math.random() * 1000000),
            x: coords.x,
            y: coords.y,
            width: 140,
            height: 60,
            text: b.text,
            style: b.style || "linedrawing",
            tailStyle: "short",
            tailDirection,
            tailBaseSpread: 20,
            tailCurve: 0.5,
            tailJitter: 1,
            dotsScale: 1,
            dotsSpacing: 1,
            strokeWidth: 2,
            wobble: 5,
            fontSize: 15,
            fontKey: "default",
            zIndex: 10 + ci * 2 + bi,
          });
        }
        // 나레이션: narrativeText가 있으면 텍스트 요소로 추가
        if (scene?.narrativeText) {
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
                className="cursor-pointer hover:bg-primary/10 transition-colors text-[13px]"
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCutsPerCanvas(n); if (n !== 4) setCutLayoutType("default"); }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <LayoutPreview cuts={n} size={32} layoutType={n === cutsPerCanvas ? cutLayoutType : "default"} canvasW={effectiveCanvasW} canvasH={effectiveCanvasH} />
              <span className="text-[13px] font-medium">{n}컷</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cut design - layout & border */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">컷 디자인</Label>

        {/* Layout type */}
        <div className="space-y-1">
          <span className="text-[13px] text-muted-foreground">레이아웃</span>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-colors cursor-pointer ${
                cutLayoutType === "default"
                  ? "border-primary bg-primary/20 shadow-sm"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCutLayoutType("default"); }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <LayoutPreview cuts={cutsPerCanvas} size={32} layoutType="default" canvasW={effectiveCanvasW} canvasH={effectiveCanvasH} />
              <span className="text-[13px] font-medium">기본</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-colors ${
                cutsPerCanvas !== 4
                  ? "border-border opacity-40 cursor-not-allowed"
                  : cutLayoutType === "square"
                    ? "border-primary bg-primary/20 shadow-sm cursor-pointer"
                    : "border-border hover:border-primary/50 cursor-pointer"
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (cutsPerCanvas === 4) setCutLayoutType("square"); }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={cutsPerCanvas !== 4}
              title={cutsPerCanvas !== 4 ? "4컷일 때만 사용 가능" : undefined}
            >
              <LayoutPreview cuts={4} size={32} layoutType="square" canvasW={effectiveCanvasW} canvasH={effectiveCanvasH} />
              <span className="text-[13px] font-medium">정사각형</span>
            </button>
          </div>
        </div>

        {/* Border style */}
        <div className="space-y-1">
          <span className="text-[13px] text-muted-foreground">보더 스타일</span>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 transition-colors cursor-pointer text-[13px] font-medium ${
                cutBorderStyle === "wobbly"
                  ? "border-primary bg-primary/20 shadow-sm"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCutBorderStyle("wobbly"); }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg width="24" height="12" viewBox="0 0 24 12" className="text-foreground">
                <path d="M2,6 C4,3 6,9 8,6 C10,3 12,9 14,6 C16,3 18,9 20,6 C21,4 22,7 22,6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              꾹꾹체
            </button>
            <button
              type="button"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 transition-colors cursor-pointer text-[13px] font-medium ${
                cutBorderStyle === "simple"
                  ? "border-primary bg-primary/20 shadow-sm"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCutBorderStyle("simple"); }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg width="24" height="12" viewBox="0 0 24 12" className="text-foreground">
                <rect x="2" y="2" width="20" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              심플라인
            </button>
          </div>
        </div>
      </div>

      {/* Character selection */}
      <CharacterPicker
        mode="multi"
        maxImages={4}
        label="캐릭터"
        description="(최대 4개, 선택사항)"
        galleryPickerVariant="dialog"
        convertToDataUrl
        selectedImages={selectedCharacters}
        onSelectedImagesChange={setSelectedCharacters}
        characterStripData={characterStripData}
        galleryData={galleryPickerData}
        galleryLoading={galleryPickerLoading}
        characterFolders={characterFolders}
        activeGalleryFolderId={activePickerFolderId}
        onActiveGalleryFolderIdChange={setActivePickerFolderId}
        fetchFullGeneration={fetchFullGeneration}
        onImageUploaded={(img) => {
          apiRequest("POST", "/api/analyze-character", { imageUrl: img.imageDataUrl || img.imageUrl })
            .then(r => r.json())
            .then(d => { if (d.names?.[0]) updateCharName(img.id, d.names[0]); })
            .catch(() => {});
        }}
      />

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
            {!isPro && <span className="text-[13px] ml-1">(분해 {breakdownCost} + 이미지 {imageCost})</span>}
          </div>
          {!isPro && (
            <div className="text-[13px] text-muted-foreground">
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
              <div className="text-[13px] text-muted-foreground mb-0.5">C{ci + 1}</div>
              <LayoutPreview cuts={cutsPerCanvas} size={36} layoutType={cutLayoutType} canvasW={effectiveCanvasW} canvasH={effectiveCanvasH} />
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
                  <Badge variant="secondary" className="shrink-0 text-[13px] px-1.5 py-0">
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
                    {/* Bubbles editor */}
                    {(scene.bubbles || []).map((bubble, bi) => (
                      <div key={bi} className="flex gap-1 items-center">
                        <Input
                          value={bubble.text}
                          onChange={(e) => {
                            const updated = [...scenes];
                            const newBubbles = [...(scene.bubbles || [])];
                            newBubbles[bi] = { ...bubble, text: e.target.value };
                            updated[idx] = { ...scene, bubbles: newBubbles, bubbleText: newBubbles[0]?.text || "" };
                            setScenes(updated);
                          }}
                          placeholder="대사"
                          className="text-xs h-7 flex-1"
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                        <Select
                          value={bubble.style || "linedrawing"}
                          onValueChange={(v) => {
                            const updated = [...scenes];
                            const newBubbles = [...(scene.bubbles || [])];
                            newBubbles[bi] = { ...bubble, style: v };
                            updated[idx] = { ...scene, bubbles: newBubbles };
                            setScenes(updated);
                          }}
                        >
                          <SelectTrigger className="text-[13px] h-7 w-[72px] px-1.5" onMouseDown={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linedrawing">일반</SelectItem>
                            <SelectItem value="handwritten">감성</SelectItem>
                            <SelectItem value="wobbly">충격</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={bubble.position || "center"}
                          onValueChange={(v) => {
                            const updated = [...scenes];
                            const newBubbles = [...(scene.bubbles || [])];
                            newBubbles[bi] = { ...bubble, position: v };
                            updated[idx] = { ...scene, bubbles: newBubbles };
                            setScenes(updated);
                          }}
                        >
                          <SelectTrigger className="text-[13px] h-7 w-[56px] px-1.5" onMouseDown={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top-left">↖</SelectItem>
                            <SelectItem value="top-right">↗</SelectItem>
                            <SelectItem value="center">⊙</SelectItem>
                            <SelectItem value="bottom-left">↙</SelectItem>
                            <SelectItem value="bottom-right">↘</SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            const updated = [...scenes];
                            const newBubbles = (scene.bubbles || []).filter((_, i) => i !== bi);
                            updated[idx] = { ...scene, bubbles: newBubbles, bubbleText: newBubbles[0]?.text || "" };
                            setScenes(updated);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {(scene.bubbles || []).length < 2 && (
                      <button
                        type="button"
                        className="text-[13px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          const updated = [...scenes];
                          const newBubbles = [...(scene.bubbles || []), { text: "", style: "linedrawing", position: "center" }];
                          updated[idx] = { ...scene, bubbles: newBubbles };
                          setScenes(updated);
                        }}
                      >
                        <Plus className="h-3 w-3" /> 말풍선 추가
                      </button>
                    )}
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
            const isSelected = previewIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                className={`aspect-[3/4] rounded border overflow-hidden bg-muted/30 relative cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary border-primary" : "hover:ring-1 hover:ring-primary/50"
                }`}
                onClick={(e) => { e.stopPropagation(); setPreviewIndex(isSelected ? null : idx); }}
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
              </button>
            );
          })}
        </div>

        {/* Preview + Regenerate */}
        {previewIndex !== null && cutResults[previewIndex] && (() => {
          const r = cutResults[previewIndex];
          const canvasIdx = Math.floor(previewIndex / cutsPerCanvas);
          const cutIdx = previewIndex % cutsPerCanvas;
          return (
            <Card className="p-3 space-y-2">
              {/* Image preview */}
              {r.status === "done" && r.imageUrl ? (
                <img
                  src={r.imageUrl}
                  alt={`C${canvasIdx + 1}-${cutIdx + 1}`}
                  className="w-full max-h-[40vh] object-contain rounded border bg-muted/20"
                />
              ) : r.status === "generating" ? (
                <div className="w-full aspect-[3/4] max-h-[40vh] flex items-center justify-center rounded border bg-muted/20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : r.status === "failed" ? (
                <div className="w-full aspect-[3/4] max-h-[40vh] flex items-center justify-center rounded border bg-destructive/10">
                  <div className="text-center">
                    <X className="h-6 w-6 text-destructive mx-auto mb-1" />
                    <span className="text-xs text-destructive">{r.error || "생성 실패"}</span>
                  </div>
                </div>
              ) : null}

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[13px] px-1.5 py-0">
                  C{canvasIdx + 1}-{cutIdx + 1}
                </Badge>
                <Badge
                  variant={r.status === "done" ? "default" : r.status === "failed" ? "destructive" : "secondary"}
                  className="text-[13px] px-1.5 py-0"
                >
                  {r.status === "done" ? "완료" : r.status === "generating" ? "생성중" : r.status === "failed" ? "실패" : "대기"}
                </Badge>
              </div>

              {/* Prompt textarea */}
              <Textarea
                value={scenes[previewIndex]?.sceneDescription || ""}
                onChange={(e) => {
                  const updated = [...scenes];
                  updated[previewIndex] = { ...updated[previewIndex], sceneDescription: e.target.value };
                  setScenes(updated);
                }}
                rows={3}
                className="text-xs resize-none"
                placeholder="프롬프트 수정"
                onMouseDown={(e) => e.stopPropagation()}
              />

              {/* Regenerate button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs"
                disabled={isGenerating}
                onClick={(e) => { e.stopPropagation(); regenerateSingle(previewIndex); }}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isGenerating && r.status === "generating" ? "animate-spin" : ""}`} />
                이 컷만 재생성
              </Button>
            </Card>
          );
        })()}

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
            onClick={(e) => { e.stopPropagation(); setStep(1); setCutResults([]); setPreviewIndex(null); }}
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
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-medium transition-colors ${
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
