import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import { useCopilot } from "@/hooks/use-copilot";
import { useWorkspace } from "@/hooks/use-workspace";

/**
 * EditorAutoStart
 *
 * 1. `:projectId` → loads saved project from localStorage (full state restore)
 * 2. `?prompt=...` → auto-sends to copilot
 * 3. `?mode=auto` → auto-generates 4-cut instatoon
 */
export function EditorAutoStart() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const { sendMessage } = useCopilot();
  const { dispatch, canvasRef } = useWorkspace();
  const loadedRef = useRef(false);
  const promptedRef = useRef(false);

  // ── Load saved project ────────────────────────────────────────────────
  useEffect(() => {
    if (loadedRef.current || !projectId || projectId === "new") return;

    const raw = localStorage.getItem(`olli-project-${projectId}`);
    if (!raw) return;

    loadedRef.current = true;

    try {
      const data = JSON.parse(raw);

      // Title
      if (data.project?.title) {
        dispatch({ type: "SET_PROJECT_TITLE", title: data.project.title });
      }

      // Aspect ratio
      if (data.canvasAspectRatio) {
        dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio: data.canvasAspectRatio });
      }

      // Scenes — add all saved scenes, then set active
      if (data.scenes?.length) {
        for (const scene of data.scenes) {
          dispatch({ type: "ADD_SCENE", scene });
        }

        // Set active scene/cut
        if (data.activeSceneId) dispatch({ type: "SET_ACTIVE_SCENE", sceneId: data.activeSceneId });
        if (data.activeCutId) dispatch({ type: "SET_ACTIVE_CUT", cutId: data.activeCutId });

        // Load active cut canvas
        const activeCut = data.scenes
          .flatMap((s: any) => s.cuts || [])
          .find((c: any) => c.id === data.activeCutId);

        if (activeCut?.canvasJSON) {
          setTimeout(() => {
            canvasRef.current?.loadJSON(activeCut.canvasJSON);
          }, 600);
        }
      }
    } catch {
      // Corrupted data — start fresh
    }
  }, [projectId, dispatch, canvasRef]);

  // ── Auto-prompt ───────────────────────────────────────────────────────
  useEffect(() => {
    if (promptedRef.current) return;

    const prompt = searchParams.get("prompt");
    const mode = searchParams.get("mode");

    if (prompt) {
      promptedRef.current = true;
      setTimeout(() => sendMessage(decodeURIComponent(prompt)), 700);
    } else if (mode === "auto") {
      promptedRef.current = true;
      setTimeout(() => sendMessage("인스타툰 4컷을 자동으로 생성해줘"), 700);
    }
  }, [searchParams, sendMessage]);

  return null;
}
