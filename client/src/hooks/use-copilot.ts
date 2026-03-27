import { useCallback, useEffect, useRef, useMemo } from "react";
import { FabricImage, Path, Rect } from "fabric";
import { useWorkspace, useActiveCut, useCanvasRef } from "./use-workspace";
import { genId } from "@/contexts/workspace-context";
import { apiRequest } from "@/lib/queryClient";
import { getCutRegions, regenerateBorderPoints } from "@/lib/webtoon-layout";
import type { CutLayoutType, CutBorderStyle } from "@/lib/webtoon-layout";
import type { CopilotMessage, CopilotContext, Cut, CutBubble, PinnedCharacter, MultiCutLayoutType, MultiCutBorderStyle } from "@/lib/workspace-types";
import {
  isSingleImageTemplate,
  STYLE_PRESETS,
  getTemplateChips,
  TEMPLATE_LABELS,
  BASEBALL_AESTHETIC_FILTERS,
} from "@/lib/fandom-templates";

// ─── Types for API responses ────────────────────────────────────────────────

interface WebtoonScene {
  sceneDescription: string;
  narrativeText: string;
  bubbleText: string;
  bubbles: Array<{ text: string; style?: string; position?: string }>;
}

interface BreakdownResponse {
  scenes: WebtoonScene[];
}

interface GenerateSceneResponse {
  imageUrl: string;
}

// ─── Retry helper for flaky API calls ────────────────────────────────────────

async function fetchWithRetry(
  method: string,
  url: string,
  body: any,
  opts: { signal?: AbortSignal } = {},
  maxRetries = 2,
): Promise<Response> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await apiRequest(method, url, body, opts);
      // Retry on 502/503/504 gateway errors
      if (res.status >= 502 && res.status <= 504 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (err: any) {
      if (err?.name === "AbortError") throw err;
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

// ─── Goods-specific prompt suffix ────────────────────────────────────────────

function getGoodsPromptSuffix(templateType: string): string | null {
  switch (templateType) {
    case "cheerbanner":
      return "baseball cheer banner, bold readable text at distance, team colors, stadium atmosphere";
    case "slogan":
      return "baseball stadium banner, bold readable text at distance, vibrant team colors";
    case "stickersheet":
      return "multiple cute sticker designs, white background, kiss-cut ready, separated stickers";
    case "stadium-set":
      return "coordinated stadium goods design set, consistent visual theme across all items, team colors";
    case "acrylicstand":
      return "acrylic stand design, clear outline, full body character, transparent background ready";
    case "phonecase":
      return "phone case design, full coverage pattern, considering camera cutout area";
    case "meme":
      return "2-panel meme comic layout, bold text captions, humorous baseball theme";
    // backward compat
    case "cupsleeve":
      return "baseball cheer banner, bold readable text at distance, team colors";
    case "birthday-set":
      return "coordinated stadium goods design set, consistent visual theme";
    default:
      return null;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCopilot() {
  const { state, dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const canvasRef = useCanvasRef();
  const abortRef = useRef<AbortController | null>(null);

  // ── Helper: add image as Fabric.js canvas layer ────────────────────────────
  const addImageAsLayer = useCallback(
    async (imageUrl: string): Promise<boolean> => {
      const fc = canvasRef.current?.getCanvas();
      if (!fc) return false;

      try {
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";

        return new Promise((resolve) => {
          imgEl.onload = () => {
            const fabricImg = new FabricImage(imgEl, {
              originX: "center",
              originY: "center",
            });

            // Scale to cover canvas while maintaining aspect ratio
            const canvasW = fc.width || 600;
            const canvasH = fc.height || 800;
            const scaleX = canvasW / (fabricImg.width || 1);
            const scaleY = canvasH / (fabricImg.height || 1);
            const scale = Math.max(scaleX, scaleY);

            fabricImg.set({
              scaleX: scale,
              scaleY: scale,
              left: canvasW / 2,
              top: canvasH / 2,
              selectable: true,
              evented: true,
            });

            fc.add(fabricImg);
            // Move to bottom (behind other layers)
            fc.sendObjectToBack(fabricImg);
            fc.setActiveObject(fabricImg);
            fc.requestRenderAll();
            resolve(true);
          };
          imgEl.onerror = () => resolve(false);
          imgEl.src = imageUrl;
        });
      } catch {
        return false;
      }
    },
    [canvasRef]
  );

  // ── Sync selection → copilot context (with equality check) ───────────────
  const prevContextRef = useRef<string>("");
  useEffect(() => {
    const selId = state.selectedObjectIds.length > 0 ? state.selectedObjectIds[0] : undefined;
    const key = selId || "";
    if (key === prevContextRef.current) return;
    prevContextRef.current = key;
    const ctx: CopilotContext = {};
    if (selId) {
      ctx.selectedElementId = selId;
      ctx.type = "scene";
    }
    dispatch({ type: "COPILOT_SET_CONTEXT", context: ctx });
  }, [state.selectedObjectIds, dispatch]);

  // ── Auto-generate context-aware chips (memoized) ──────────────────────────
  const hasSelection = state.selectedObjectIds.length > 0;
  const hasContent = !!activeCut?.canvasJSON;
  const hasBg = !!activeCut?.backgroundImageUrl;
  const fandomMeta = state.fandomMeta;

  const computedChips = useMemo(() => {
    // Fandom mode: use template-specific chips
    if (fandomMeta) {
      if (hasSelection) {
        return ["이 요소 수정", "표정 변경", "삭제"];
      }
      if (hasContent || hasBg) {
        // After content is generated, show template-specific follow-up chips
        const templateChips = getTemplateChips(fandomMeta.templateType);
        // Replace first chip with "다시 생성" since content exists
        return ["다시 생성", ...templateChips.slice(1)].slice(0, 5);
      }
      return getTemplateChips(fandomMeta.templateType).slice(0, 5);
    }

    // Non-fandom mode: original logic
    const chips: string[] = [];
    if (hasSelection) {
      chips.push("이 요소 수정", "표정 변경", "삭제");
    } else if (!hasContent && !hasBg) {
      chips.push("인스타툰 4컷 자동 생성", "배경 생성");
    } else {
      chips.push("이 컷 다시 생성", "컷 추가");
      if (!hasBg) chips.push("배경 생성");
    }
    if (!hasSelection) {
      chips.push("스타일 변경", "말풍선 추가");
    }
    return chips.slice(0, 5);
  }, [hasSelection, hasContent, hasBg, fandomMeta]);

  const prevChipsRef = useRef<string>("");
  useEffect(() => {
    const key = computedChips.join(",");
    if (key === prevChipsRef.current) return;
    prevChipsRef.current = key;
    dispatch({ type: "COPILOT_SET_CHIPS", chips: computedChips });
  }, [computedChips, dispatch]);

  // ── Helper: add assistant message ─────────────────────────────────────────
  const addAssistantMsg = useCallback(
    (content: string, preview?: CopilotMessage["preview"]) => {
      const msg: CopilotMessage = {
        id: genId("msg"),
        role: "assistant",
        content,
        timestamp: Date.now(),
        preview,
      };
      dispatch({ type: "COPILOT_ADD_MESSAGE", message: msg });
      return msg;
    },
    [dispatch]
  );

  // ── Helper: update assistant message content ──────────────────────────────
  const updateLastAssistantMsg = useCallback(
    (content: string) => {
      // We add a new message to show progress instead of editing
      addAssistantMsg(content);
    },
    [addAssistantMsg]
  );

  // ── Helper: compute Gemini aspect ratio from pixel dimensions ────────────
  const getGeminiAspectRatio = useCallback((width: number, height: number): string => {
    const ratio = width / height;
    if (ratio > 1.5) return "16:9";
    if (ratio > 1.1) return "4:3";
    if (ratio > 0.9) return "1:1";
    if (ratio > 0.6) return "3:4";
    return "9:16";
  }, []);

  // ── Helper: load image element ─────────────────────────────────────────────
  const loadImageElement = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  // ── Helper: composite all images + borders onto a single canvas ─────────
  const compositeMultiCutOnCanvas = useCallback(
    async (
      imageUrls: (string | null)[],
      cutsCount: number,
      layoutType: CutLayoutType,
      borderStyle: CutBorderStyle,
    ) => {
      const fc = canvasRef.current?.getCanvas();
      if (!fc) return;

      const canvasW = fc.width || 600;
      const canvasH = fc.height || 800;
      const regions = getCutRegions(cutsCount, layoutType, canvasW, canvasH);

      // Set white background
      fc.backgroundColor = "#ffffff";

      // Add each scene image clipped to its cut region
      for (let i = 0; i < regions.length; i++) {
        const url = imageUrls[i];
        if (!url) continue;

        const region = regions[i];
        try {
          const imgEl = await loadImageElement(url);
          const fabricImg = new FabricImage(imgEl, {
            originX: "center",
            originY: "center",
          });

          // Scale to cover the cut region
          const scaleX = region.width / (fabricImg.width || 1);
          const scaleY = region.height / (fabricImg.height || 1);
          const scale = Math.max(scaleX, scaleY);

          // Clip path: restrict image to cut region
          const clipRect = new Rect({
            originX: "center",
            originY: "center",
            width: region.width,
            height: region.height,
            absolutePositioned: true,
            left: region.x + region.width / 2,
            top: region.y + region.height / 2,
          });

          fabricImg.set({
            scaleX: scale,
            scaleY: scale,
            left: region.x + region.width / 2,
            top: region.y + region.height / 2,
            selectable: true,
            evented: true,
            clipPath: clipRect,
          });

          fc.add(fabricImg);
        } catch {
          // Skip failed images
        }
      }

      // Add border lines between cuts (only for 2+ cuts)
      if (cutsCount >= 2) {
        for (let i = 0; i < regions.length; i++) {
          const region = regions[i];
          const pts = regenerateBorderPoints(
            region.x, region.y, region.width, region.height,
            borderStyle, 42 + i * 137,
          );

          // Build SVG path string from points for exact positioning
          if (pts.length >= 2) {
            const pathData = pts.map((p, idx) =>
              `${idx === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
            ).join(" ") + " Z";

            const borderPath = new Path(pathData, {
              fill: "transparent",
              stroke: "#000000",
              strokeWidth: 3,
              strokeLineCap: borderStyle === "simple" ? "square" : "round",
              strokeLineJoin: borderStyle === "simple" ? "miter" : "round",
              selectable: false,
              evented: false,
              objectCaching: false,
            });
            fc.add(borderPath);
          }
        }
      }

      fc.requestRenderAll();
    },
    [canvasRef, loadImageElement]
  );

  // ── Generate single image (portrait, photocard, wallpaper, etc.) ──────────
  const generateSingleImage = useCallback(
    async (prompt: string) => {
      const ac = new AbortController();
      abortRef.current = ac;

      const pinnedChars = state.copilot.pinnedCharacters;
      const charImageUrls = pinnedChars
        .map((c) => c.imageDataUrl || c.imageUrl)
        .filter(Boolean);
      const charNames = pinnedChars.map((c) => c.name).filter(Boolean);

      // Prepend style prefix if fandom meta has a style preset
      let styledPrompt = prompt;
      if (fandomMeta?.stylePreset) {
        const styleDef = STYLE_PRESETS.find((s) => s.id === fandomMeta.stylePreset);
        if (styleDef) {
          styledPrompt = `${styleDef.prompt}, ${prompt}`;
        }
      }

      // Inject baseball aesthetic filter if active
      const aestheticFilter = state.activeAestheticFilter;
      if (aestheticFilter) {
        const filterDef = BASEBALL_AESTHETIC_FILTERS.find((f) => f.id === aestheticFilter);
        if (filterDef) {
          styledPrompt = `${filterDef.prompt}, ${styledPrompt}`;
        }
      }

      // Add goods-specific prompt suffix
      if (fandomMeta) {
        const goodsSuffix = getGoodsPromptSuffix(fandomMeta.templateType);
        if (goodsSuffix) {
          styledPrompt = `${styledPrompt}, ${goodsSuffix}`;
        }
      }

      const label = fandomMeta ? TEMPLATE_LABELS[fandomMeta.templateType] : "이미지";

      try {
        addAssistantMsg(`"${prompt}" ${label}를 생성하고 있어요...`);

        const fc = canvasRef.current?.getCanvas();
        const canvasW = fc?.width || 600;
        const canvasH = fc?.height || 800;
        const geminiRatio = getGeminiAspectRatio(canvasW, canvasH);

        const genRes = await fetchWithRetry(
          "POST",
          "/api/auto-webtoon/generate-scene",
          {
            sceneDescription: styledPrompt,
            storyContext: prompt,
            sourceImageDataList: charImageUrls.length > 0 ? charImageUrls : undefined,
            characterNames: charNames.length > 0 ? charNames : undefined,
            aspectRatio: geminiRatio,
            sceneIndex: 0,
            totalScenes: 1,
          },
          { signal: ac.signal }
        );

        const genData = (await genRes.json()) as GenerateSceneResponse;

        if (genData.imageUrl && activeCut) {
          dispatch({ type: "HISTORY_PUSH" });
          const added = await addImageAsLayer(genData.imageUrl);
          if (added) {
            addAssistantMsg(`${label}가 생성됐어요!`, {
              type: "image",
              data: genData.imageUrl,
              applied: true,
            });
          } else {
            dispatch({
              type: "UPDATE_CUT_BACKGROUND",
              cutId: activeCut.id,
              backgroundImageUrl: genData.imageUrl,
            });
            addAssistantMsg(`${label}가 배경으로 적용됐어요!`, {
              type: "image",
              data: genData.imageUrl,
              applied: true,
            });
          }
          dispatch({
            type: "UPDATE_CUT_THUMBNAIL",
            cutId: activeCut.id,
            thumbnailUrl: genData.imageUrl,
          });
        } else {
          addAssistantMsg("생성에 실패했어요. 다시 시도해주세요.");
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          addAssistantMsg(`오류: ${err?.message || "알 수 없는 오류"}`);
        }
      }
    },
    [dispatch, state.copilot.pinnedCharacters, fandomMeta, state.activeAestheticFilter, addAssistantMsg, canvasRef, activeCut, getGeminiAspectRatio, addImageAsLayer]
  );

  // ── Generate multi-cut instatoon (single canvas compositing) ──────────────
  const generateMultiCut = useCallback(
    async (prompt: string) => {
      const ac = new AbortController();
      abortRef.current = ac;

      const cutsCount = state.copilot.cutsCount;
      const layoutType = state.copilot.layoutType as CutLayoutType;
      const borderStyle = state.copilot.borderStyle as CutBorderStyle;
      const pinnedChars = state.copilot.pinnedCharacters;

      const charImageUrls = pinnedChars
        .map((c) => c.imageDataUrl || c.imageUrl)
        .filter(Boolean);
      const charNames = pinnedChars.map((c) => c.name).filter(Boolean);
      const charDesc = charNames.length > 0 ? `\n캐릭터: ${charNames.join(", ")}` : "";

      try {
        let storyPrompt = prompt + charDesc;
        if (storyPrompt.trim().length < 5) {
          storyPrompt = `${prompt} 주제의 인스타툰`;
        }

        // Step 1: Scene breakdown
        addAssistantMsg(
          `"${prompt}" 주제로 ${cutsCount}컷 스토리를 구성하고 있어요...${pinnedChars.length > 0 ? `\n캐릭터 ${pinnedChars.length}명 적용` : ""}`
        );

        const breakdownRes = await apiRequest(
          "POST",
          "/api/auto-webtoon/breakdown",
          {
            storyPrompt,
            canvasCount: 1,
            cutsPerCanvas: cutsCount,
            characterDescriptions: charNames,
          },
          { signal: ac.signal }
        );
        const breakdownData = (await breakdownRes.json()) as BreakdownResponse;
        const scenes = breakdownData.scenes;

        if (!scenes || scenes.length === 0) {
          addAssistantMsg("스토리 분해에 실패했어요. 다시 시도해주세요.");
          return;
        }

        const sceneList = scenes
          .map((s, i) => `${i + 1}컷: ${s.sceneDescription.slice(0, 40)}`)
          .join("\n");
        addAssistantMsg(
          `${scenes.length}컷 스토리 완성!\n\n${sceneList}\n\n이미지 생성 시작...`
        );

        dispatch({ type: "HISTORY_PUSH" });

        // Step 2: Generate each scene image with correct aspect ratio
        const fc = canvasRef.current?.getCanvas();
        const canvasW = fc?.width || 600;
        const canvasH = fc?.height || 800;
        const regions = getCutRegions(cutsCount, layoutType, canvasW, canvasH);

        const ART_STYLE = "simple line art, thick clean outlines, minimal flat color, webtoon style, consistent character design";
        const generatedUrls: (string | null)[] = new Array(scenes.length).fill(null);
        let referenceImageUrl: string | null = null;

        for (let i = 0; i < scenes.length; i++) {
          if (ac.signal.aborted) break;

          const scene = scenes[i];
          const region = regions[i % regions.length];
          const geminiRatio = getGeminiAspectRatio(region.width, region.height);

          addAssistantMsg(`컷 ${i + 1}/${scenes.length} 생성 중...`);

          try {
            const styledDescription = `${ART_STYLE}, ${scene.sceneDescription}`;
            const sourceImages: string[] = [...charImageUrls];
            if (referenceImageUrl) sourceImages.push(referenceImageUrl);

            const genRes = await fetchWithRetry(
              "POST",
              "/api/auto-webtoon/generate-scene",
              {
                sceneDescription: styledDescription,
                storyContext: prompt,
                sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
                characterNames: charNames.length > 0 ? charNames : undefined,
                aspectRatio: geminiRatio,
                sceneIndex: i,
                totalScenes: scenes.length,
                previousSceneDescription: i > 0 ? scenes[i - 1].sceneDescription : undefined,
              },
              { signal: ac.signal }
            );

            const genData = (await genRes.json()) as GenerateSceneResponse;
            if (genData.imageUrl) {
              generatedUrls[i] = genData.imageUrl;
              if (i === 0) referenceImageUrl = genData.imageUrl;
            }
          } catch (err: any) {
            if (err?.name === "AbortError") throw err;
            addAssistantMsg(`컷 ${i + 1} 생성 실패: ${err?.message || "오류"}`);
          }
        }

        // Step 3: Composite all images onto single canvas
        addAssistantMsg("캔버스에 합성 중...");

        // Clear canvas first
        if (fc) {
          fc.clear();
        }

        await compositeMultiCutOnCanvas(generatedUrls, cutsCount, layoutType, borderStyle);

        // Auto-add bubbles to active cut as pending bubbles
        if (activeCut) {
          const allBubbles: CutBubble[] = [];
          for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            if (scene.bubbles && scene.bubbles.length > 0) {
              const region = regions[i % regions.length];
              for (const b of scene.bubbles) {
                if (!b.text) continue;
                // Map bubble position relative to its cut region
                allBubbles.push({
                  text: b.text,
                  style: b.style,
                  position: b.position,
                });
              }
            }
          }
          if (allBubbles.length > 0) {
            dispatch({ type: "UPDATE_CUT_BUBBLES", cutId: activeCut.id, bubbles: allBubbles });
          }

          // Update thumbnail
          const thumb = canvasRef.current?.exportImage("jpeg");
          if (thumb) {
            dispatch({ type: "UPDATE_CUT_THUMBNAIL", cutId: activeCut.id, thumbnailUrl: thumb });
          }
        }

        const successCount = generatedUrls.filter(Boolean).length;
        addAssistantMsg(
          `${successCount}/${scenes.length}컷 인스타툰이 하나의 캔버스에 완성됐어요!\n\n각 이미지를 클릭해서 위치와 크기를 조정할 수 있어요.`
        );
      } catch (err: any) {
        if (err?.name === "AbortError") {
          addAssistantMsg("생성이 중단됐어요.");
        } else {
          addAssistantMsg(`오류가 발생했어요: ${err?.message || "알 수 없는 오류"}`);
        }
      }
    },
    [dispatch, state.copilot.cutsCount, state.copilot.layoutType, state.copilot.borderStyle, state.copilot.pinnedCharacters, addAssistantMsg, canvasRef, activeCut, getGeminiAspectRatio, compositeMultiCutOnCanvas]
  );

  // ── Generate single cut background ────────────────────────────────────────
  const generateBackground = useCallback(
    async (prompt: string) => {
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        addAssistantMsg(`"${prompt}" 배경을 생성하고 있어요... 🎨`);

        const res = await apiRequest(
          "POST",
          "/api/generate-background",
          {
            sourceImageDataList: [],
            backgroundPrompt: prompt,
            skipGallery: true,
          },
          { signal: ac.signal }
        );

        const data = (await res.json()) as { imageUrl: string };

        if (data.imageUrl && activeCut) {
          dispatch({ type: "HISTORY_PUSH" });
          // Add as canvas layer instead of background
          const added = await addImageAsLayer(data.imageUrl);
          if (added) {
            addAssistantMsg("✅ 이미지가 레이어로 추가됐어요!", {
              type: "image",
              data: data.imageUrl,
              applied: true,
            });
          } else {
            // Fallback to background if layer add fails
            dispatch({
              type: "UPDATE_CUT_BACKGROUND",
              cutId: activeCut.id,
              backgroundImageUrl: data.imageUrl,
            });
            addAssistantMsg("✅ 배경으로 적용됐어요!", {
              type: "image",
              data: data.imageUrl,
              applied: true,
            });
          }
          dispatch({
            type: "UPDATE_CUT_THUMBNAIL",
            cutId: activeCut.id,
            thumbnailUrl: data.imageUrl,
          });
        } else {
          addAssistantMsg("배경 생성에 실패했어요. 다시 시도해주세요.");
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          addAssistantMsg(`❌ 오류: ${err?.message || "알 수 없는 오류"}`);
        }
      }
    },
    [dispatch, activeCut, addAssistantMsg, addImageAsLayer]
  );

  // ── Regenerate current cut ────────────────────────────────────────────────
  const regenerateCurrentCut = useCallback(
    async (prompt: string) => {
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        addAssistantMsg(`현재 컷을 다시 생성하고 있어요... 🔄`);

        const res = await fetchWithRetry(
          "POST",
          "/api/auto-webtoon/generate-scene",
          {
            sceneDescription: prompt || "인스타툰 장면",
            storyContext: prompt,
            aspectRatio: "3:4",
          },
          { signal: ac.signal }
        );

        const data = (await res.json()) as GenerateSceneResponse;

        if (data.imageUrl && activeCut) {
          dispatch({ type: "HISTORY_PUSH" });
          // Add regenerated image as layer
          const added = await addImageAsLayer(data.imageUrl);
          if (added) {
            addAssistantMsg("✅ 새 이미지가 레이어로 추가됐어요!");
          } else {
            dispatch({
              type: "UPDATE_CUT_BACKGROUND",
              cutId: activeCut.id,
              backgroundImageUrl: data.imageUrl,
            });
            addAssistantMsg("✅ 컷이 새로 생성됐어요!");
          }
          dispatch({
            type: "UPDATE_CUT_THUMBNAIL",
            cutId: activeCut.id,
            thumbnailUrl: data.imageUrl,
          });
        } else {
          addAssistantMsg("생성에 실패했어요. 다시 시도해주세요.");
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          addAssistantMsg(`❌ 오류: ${err?.message || "알 수 없는 오류"}`);
        }
      }
    },
    [dispatch, activeCut, addAssistantMsg, addImageAsLayer]
  );

  // ── Change style of existing cuts ────────────────────────────────────────
  const changeStyle = useCallback(
    async (prompt: string) => {
      const ac = new AbortController();
      abortRef.current = ac;

      // Find all cuts with existing backgrounds
      const activeScene = state.scenes.find((s) => s.id === state.activeSceneId);
      if (!activeScene) return;

      const cutsWithBg = activeScene.cuts.filter((c) => c.backgroundImageUrl);
      if (cutsWithBg.length === 0) {
        addAssistantMsg("스타일을 변경할 컷이 없어요. 먼저 인스타툰을 생성해주세요.");
        return;
      }

      try {
        dispatch({ type: "HISTORY_PUSH" });
        addAssistantMsg(`기존 ${cutsWithBg.length}컷의 스타일을 변경하고 있어요... 🎨`);

        for (let i = 0; i < cutsWithBg.length; i++) {
          if (ac.signal.aborted) break;
          const cut = cutsWithBg[i];

          addAssistantMsg(`컷 ${i + 1}/${cutsWithBg.length} 스타일 변경 중...`);

          try {
            const genRes = await fetchWithRetry(
              "POST",
              "/api/auto-webtoon/generate-scene",
              {
                sceneDescription: prompt || "스타일 변경",
                storyContext: prompt,
                sourceImageDataList: [cut.backgroundImageUrl],
                aspectRatio: "3:4",
                sceneIndex: i,
                totalScenes: cutsWithBg.length,
              },
              { signal: ac.signal }
            );

            const genData = (await genRes.json()) as GenerateSceneResponse;

            if (genData.imageUrl) {
              dispatch({
                type: "UPDATE_CUT_BACKGROUND",
                cutId: cut.id,
                backgroundImageUrl: genData.imageUrl,
              });
              dispatch({
                type: "UPDATE_CUT_THUMBNAIL",
                cutId: cut.id,
                thumbnailUrl: genData.imageUrl,
              });
            }
          } catch (err: any) {
            if (err?.name === "AbortError") throw err;
            addAssistantMsg(`⚠️ 컷 ${i + 1} 스타일 변경 실패`);
          }
        }

        addAssistantMsg(`✅ ${cutsWithBg.length}컷 스타일이 변경됐어요!`);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          addAssistantMsg(`❌ 오류: ${err?.message || "알 수 없는 오류"}`);
        }
      }
    },
    [dispatch, state.scenes, state.activeSceneId, addAssistantMsg]
  );

  // ── Send message (main dispatcher) ────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: CopilotMessage = {
        id: genId("msg"),
        role: "user",
        content,
        timestamp: Date.now(),
      };
      dispatch({ type: "COPILOT_ADD_MESSAGE", message: userMsg });
      dispatch({ type: "COPILOT_SET_GENERATING", isGenerating: true });
      dispatch({ type: "COPILOT_SET_INPUT", input: "" });

      // Expand dock
      if (!state.copilot.dockExpanded) {
        dispatch({ type: "COPILOT_TOGGLE_DOCK" });
      }

      const lower = content.toLowerCase();
      const meta = state.fandomMeta;

      try {
        // ── Fandom mode: route based on template type ──
        if (meta && isSingleImageTemplate(meta.templateType)) {
          // Single image templates: skip breakdown, go straight to generate
          if (lower.includes("스타일")) {
            await changeStyle(content);
          } else if (
            lower.includes("다시") ||
            lower.includes("재생성")
          ) {
            await generateSingleImage(content);
          } else if (lower.includes("배경")) {
            await generateBackground(content);
          } else if (lower.includes("효과")) {
            dispatch({ type: "SET_ACTIVE_MODULE", module: "effects" });
            addAssistantMsg("효과 에디터를 열었어요.");
          } else {
            await generateSingleImage(content);
          }
        } else if (
          lower.includes("자동") ||
          lower.includes("4컷") ||
          lower.includes("인스타툰") ||
          lower.includes("생성해") ||
          lower.includes("만들어") ||
          lower.includes("스토리")
        ) {
          await generateMultiCut(content);
        } else if (lower.includes("배경")) {
          await generateBackground(content);
        } else if (
          lower.includes("다시") ||
          lower.includes("재생성") ||
          lower.includes("다른")
        ) {
          await regenerateCurrentCut(content);
        } else if (lower.includes("스타일")) {
          await changeStyle(content);
        } else if (lower.includes("말풍선")) {
          addAssistantMsg("말풍선은 인스타툰 생성 시 자동으로 추가돼요! 캔버스에서 직접 클릭해서 수정할 수 있어요.");
        } else if (lower.includes("효과")) {
          dispatch({ type: "SET_ACTIVE_MODULE", module: "effects" });
          addAssistantMsg("효과 에디터를 열었어요.");
        } else if (
          lower.includes("삭제") ||
          lower.includes("수정") ||
          lower.includes("추가")
        ) {
          addAssistantMsg("캔버스의 요소를 클릭해서 직접 수정/삭제할 수 있어요. 새로운 인스타툰을 만들려면 주제를 입력해주세요!");
        } else {
          // Default: multi-cut or single based on fandom meta
          if (meta && isSingleImageTemplate(meta.templateType)) {
            await generateSingleImage(content);
          } else {
            await generateMultiCut(content);
          }
        }

        dispatch({ type: "INCREMENT_INTERACTION" });
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          addAssistantMsg(`❌ 오류가 발생했어요: ${err?.message || "알 수 없는 오류"}`);
        }
      } finally {
        dispatch({ type: "COPILOT_SET_GENERATING", isGenerating: false });
        abortRef.current = null;
      }
    },
    [
      dispatch,
      state.copilot.dockExpanded,
      state.fandomMeta,
      generateMultiCut,
      generateSingleImage,
      generateBackground,
      regenerateCurrentCut,
      changeStyle,
      addAssistantMsg,
    ]
  );

  const handleSlashCommand = useCallback(
    (command: string) => {
      switch (command) {
        case "/bubble":
          dispatch({ type: "SET_ACTIVE_MODULE", module: "bubble" });
          break;
        case "/effects":
          dispatch({ type: "SET_ACTIVE_MODULE", module: "effects" });
          break;
        case "/auto":
          dispatch({ type: "SET_ACTIVE_MODULE", module: "autogen" });
          break;
        case "/story":
          dispatch({ type: "SET_ACTIVE_MODULE", module: "story" });
          break;
        case "/chat":
          dispatch({ type: "SET_ACTIVE_MODULE", module: "chat" });
          break;
        case "/pose":
          dispatch({ type: "SET_ACTIVE_MODULE", module: "pose" });
          break;
        case "/background":
          dispatch({ type: "SET_ACTIVE_MODULE", module: "background" });
          break;
        case "/photocard":
          dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio: "2:3" });
          addAssistantMsg("포토카드 모드로 전환했어요! (2:3 비율)");
          break;
        case "/sticker":
          dispatch({ type: "OPEN_STICKER_PANEL" });
          addAssistantMsg("스티커 패널을 열었어요!");
          break;
        case "/pro":
          dispatch({ type: "SET_UI_LEVEL", level: "pro" });
          break;
      }
      dispatch({ type: "INCREMENT_INTERACTION" });
    },
    [dispatch, addAssistantMsg]
  );

  // ── Pin/unpin characters ──────────────────────────────────────────────────
  const pinCharacter = useCallback(
    (character: PinnedCharacter) => {
      dispatch({ type: "COPILOT_PIN_CHARACTER", character });
    },
    [dispatch]
  );

  const unpinCharacter = useCallback(
    (characterId: string) => {
      dispatch({ type: "COPILOT_UNPIN_CHARACTER", characterId });
    },
    [dispatch]
  );

  const setCutsCount = useCallback(
    (count: 2 | 3 | 4) => {
      dispatch({ type: "COPILOT_SET_CUTS_COUNT", count });
    },
    [dispatch]
  );

  const setLayoutType = useCallback(
    (layoutType: MultiCutLayoutType) => {
      dispatch({ type: "COPILOT_SET_LAYOUT_TYPE", layoutType });
    },
    [dispatch]
  );

  const setBorderStyle = useCallback(
    (borderStyle: MultiCutBorderStyle) => {
      dispatch({ type: "COPILOT_SET_BORDER_STYLE", borderStyle });
    },
    [dispatch]
  );

  return {
    messages: state.copilot.messages,
    isGenerating: state.copilot.isGenerating,
    suggestedChips: state.copilot.suggestedChips,
    context: state.copilot.context,
    dockExpanded: state.copilot.dockExpanded,
    input: state.copilot.input,
    pinnedCharacters: state.copilot.pinnedCharacters,
    cutsCount: state.copilot.cutsCount,
    layoutType: state.copilot.layoutType,
    borderStyle: state.copilot.borderStyle,
    sendMessage,
    handleSlashCommand,
    setInput: (input: string) =>
      dispatch({ type: "COPILOT_SET_INPUT", input }),
    toggleDock: () => dispatch({ type: "COPILOT_TOGGLE_DOCK" }),
    pinCharacter,
    unpinCharacter,
    setCutsCount,
    setLayoutType,
    setBorderStyle,
  };
}
