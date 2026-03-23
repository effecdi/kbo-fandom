import { useCallback, useEffect, useRef } from "react";
import { useWorkspace, useActiveCut } from "./use-workspace";
import { genId } from "@/contexts/workspace-context";
import { apiRequest } from "@/lib/queryClient";
import type { CopilotMessage, CopilotContext, Cut, CutBubble, PinnedCharacter } from "@/lib/workspace-types";

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

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCopilot() {
  const { state, dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const abortRef = useRef<AbortController | null>(null);

  // ── Sync selection → copilot context ──────────────────────────────────────
  useEffect(() => {
    const ctx: CopilotContext = {};
    if (state.selectedObjectIds.length > 0) {
      ctx.selectedElementId = state.selectedObjectIds[0];
      ctx.type = "scene";
    }
    dispatch({ type: "COPILOT_SET_CONTEXT", context: ctx });
  }, [state.selectedObjectIds, dispatch]);

  // ── Auto-generate context-aware chips ─────────────────────────────────────
  useEffect(() => {
    const chips: string[] = [];
    const hasSelection = state.selectedObjectIds.length > 0;
    const hasContent = !!activeCut?.canvasJSON;
    const hasBg = !!activeCut?.backgroundImageUrl;

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

    dispatch({ type: "COPILOT_SET_CHIPS", chips: chips.slice(0, 5) });
  }, [
    activeCut?.backgroundImageUrl,
    activeCut?.canvasJSON,
    state.selectedObjectIds.length,
    dispatch,
  ]);

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

  // ── Generate multi-cut instatoon (core flow) ─────────────────────────────
  const generateMultiCut = useCallback(
    async (prompt: string) => {
      const ac = new AbortController();
      abortRef.current = ac;

      const cutsCount = state.copilot.cutsCount;
      const pinnedChars = state.copilot.pinnedCharacters;

      // Build character reference images from pinned characters
      const charImageUrls = pinnedChars
        .map((c) => c.imageDataUrl || c.imageUrl)
        .filter(Boolean);

      const charNames = pinnedChars.map((c) => c.name).filter(Boolean);
      const charDesc = charNames.length > 0
        ? `\n캐릭터: ${charNames.join(", ")}`
        : "";

      try {
        // Ensure storyPrompt is at least 5 chars (server requirement)
        let storyPrompt = prompt + charDesc;
        if (storyPrompt.trim().length < 5) {
          storyPrompt = `${prompt} 주제의 인스타툰`;
        }

        // Step 1: Scene breakdown
        addAssistantMsg(
          `"${prompt}" 주제로 ${cutsCount}컷 스토리를 구성하고 있어요...${pinnedChars.length > 0 ? `\n고정 캐릭터 ${pinnedChars.length}명 적용` : ""} ✍️`
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

        // Show scene breakdown
        const sceneList = scenes
          .map((s, i) => `${i + 1}컷: ${s.sceneDescription.slice(0, 40)}`)
          .join("\n");
        addAssistantMsg(
          `${scenes.length}컷 스토리가 완성됐어요!\n\n${sceneList}\n\n이제 각 컷의 이미지를 생성할게요... 🎨`
        );

        // Step 2: Ensure we have enough cuts
        dispatch({ type: "HISTORY_PUSH" });
        const activeScene = state.scenes.find(
          (s) => s.id === state.activeSceneId
        );
        if (!activeScene) return;

        // Create additional cuts if needed
        const existingCuts = activeScene.cuts;
        const cutsNeeded = scenes.length - existingCuts.length;
        const newCutIds: string[] = [...existingCuts.map((c) => c.id)];

        for (let i = 0; i < cutsNeeded; i++) {
          const newCut: Cut = {
            id: genId("cut"),
            sceneId: activeScene.id,
            order: existingCuts.length + i + 1,
            canvasJSON: null,
            thumbnailUrl: null,
            backgroundImageUrl: null,
          };
          dispatch({ type: "ADD_CUT", sceneId: activeScene.id, cut: newCut });
          newCutIds.push(newCut.id);
        }

        // Step 3: Generate each scene image
        // Use pinned characters as source images; also chain first cut for style consistency
        const ART_STYLE = "simple line art, thick clean outlines, minimal flat color, webtoon style, consistent character design";
        let referenceImageUrl: string | null = null;

        for (let i = 0; i < scenes.length; i++) {
          if (ac.signal.aborted) break;

          const scene = scenes[i];
          const cutId = newCutIds[i];

          addAssistantMsg(
            `컷 ${i + 1}/${scenes.length} 생성 중... 🎨\n"${scene.sceneDescription.slice(0, 50)}"`
          );

          try {
            // Prepend art style to scene description for consistency
            const styledDescription = `${ART_STYLE}, ${scene.sceneDescription}`;

            // Build sourceImageDataList: pinned chars first, then previous cut reference
            const sourceImages: string[] = [...charImageUrls];
            if (referenceImageUrl) {
              sourceImages.push(referenceImageUrl);
            }

            const genRes = await apiRequest(
              "POST",
              "/api/auto-webtoon/generate-scene",
              {
                sceneDescription: styledDescription,
                storyContext: prompt,
                sourceImageDataList: sourceImages.length > 0 ? sourceImages : undefined,
                aspectRatio: "3:4",
                sceneIndex: i,
                totalScenes: scenes.length,
                previousSceneDescription:
                  i > 0 ? scenes[i - 1].sceneDescription : undefined,
              },
              { signal: ac.signal }
            );

            const genData = (await genRes.json()) as GenerateSceneResponse;

            if (genData.imageUrl && cutId) {
              // Save first cut's image as reference for subsequent cuts
              if (i === 0) {
                referenceImageUrl = genData.imageUrl;
              }

              dispatch({
                type: "UPDATE_CUT_BACKGROUND",
                cutId,
                backgroundImageUrl: genData.imageUrl,
              });
              dispatch({
                type: "UPDATE_CUT_THUMBNAIL",
                cutId,
                thumbnailUrl: genData.imageUrl,
              });

              // Auto-add speech bubbles from breakdown data
              if (scene.bubbles && scene.bubbles.length > 0) {
                const cutBubbles: CutBubble[] = scene.bubbles.map((b) => ({
                  text: b.text,
                  style: b.style,
                  position: b.position,
                }));
                dispatch({
                  type: "UPDATE_CUT_BUBBLES",
                  cutId,
                  bubbles: cutBubbles,
                });
              }
            }
          } catch (err: any) {
            if (err?.name === "AbortError") throw err;
            addAssistantMsg(`⚠️ 컷 ${i + 1} 생성 실패: ${err?.message || "알 수 없는 오류"}`);
          }
        }

        // Switch to first cut
        if (newCutIds[0]) {
          dispatch({ type: "SET_ACTIVE_CUT", cutId: newCutIds[0] });
        }

        addAssistantMsg(
          `✅ ${scenes.length}컷 인스타툰이 완성됐어요!\n\n하단의 컷 스트립에서 각 컷을 확인하고 수정할 수 있어요.`
        );
      } catch (err: any) {
        if (err?.name === "AbortError") {
          addAssistantMsg("생성이 중단됐어요.");
        } else {
          addAssistantMsg(`❌ 오류가 발생했어요: ${err?.message || "알 수 없는 오류"}`);
        }
      }
    },
    [dispatch, state.scenes, state.activeSceneId, state.copilot.cutsCount, state.copilot.pinnedCharacters, addAssistantMsg]
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
          addAssistantMsg("배경이 생성됐어요! 적용하시겠어요?", {
            type: "image",
            data: data.imageUrl,
            applied: false,
          });
          // Store the image URL so "적용" button can use it
          // We'll auto-apply for now
          dispatch({ type: "HISTORY_PUSH" });
          dispatch({
            type: "UPDATE_CUT_BACKGROUND",
            cutId: activeCut.id,
            backgroundImageUrl: data.imageUrl,
          });
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
    [dispatch, activeCut, addAssistantMsg]
  );

  // ── Regenerate current cut ────────────────────────────────────────────────
  const regenerateCurrentCut = useCallback(
    async (prompt: string) => {
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        addAssistantMsg(`현재 컷을 다시 생성하고 있어요... 🔄`);

        const res = await apiRequest(
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
          dispatch({
            type: "UPDATE_CUT_BACKGROUND",
            cutId: activeCut.id,
            backgroundImageUrl: data.imageUrl,
          });
          dispatch({
            type: "UPDATE_CUT_THUMBNAIL",
            cutId: activeCut.id,
            thumbnailUrl: data.imageUrl,
          });
          addAssistantMsg("✅ 컷이 새로 생성됐어요!");
        } else {
          addAssistantMsg("생성에 실패했어요. 다시 시도해주세요.");
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          addAssistantMsg(`❌ 오류: ${err?.message || "알 수 없는 오류"}`);
        }
      }
    },
    [dispatch, activeCut, addAssistantMsg]
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
            const genRes = await apiRequest(
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

      try {
        // Route to appropriate handler
        if (
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
          // Short action commands — respond with guidance instead of API call
          addAssistantMsg("캔버스의 요소를 클릭해서 직접 수정/삭제할 수 있어요. 새로운 인스타툰을 만들려면 주제를 입력해주세요!");
        } else {
          // Default: treat as multi-cut generation with the prompt as theme
          await generateMultiCut(content);
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
      generateMultiCut,
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
        case "/pro":
          dispatch({ type: "SET_UI_LEVEL", level: "pro" });
          break;
      }
      dispatch({ type: "INCREMENT_INTERACTION" });
    },
    [dispatch]
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

  return {
    messages: state.copilot.messages,
    isGenerating: state.copilot.isGenerating,
    suggestedChips: state.copilot.suggestedChips,
    context: state.copilot.context,
    dockExpanded: state.copilot.dockExpanded,
    input: state.copilot.input,
    pinnedCharacters: state.copilot.pinnedCharacters,
    cutsCount: state.copilot.cutsCount,
    sendMessage,
    handleSlashCommand,
    setInput: (input: string) =>
      dispatch({ type: "COPILOT_SET_INPUT", input }),
    toggleDock: () => dispatch({ type: "COPILOT_TOGGLE_DOCK" }),
    pinCharacter,
    unpinCharacter,
    setCutsCount,
  };
}
