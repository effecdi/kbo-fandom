import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import { useCopilot } from "@/hooks/use-copilot";
import { useWorkspace } from "@/hooks/use-workspace";
import { genId } from "@/contexts/workspace-context";
import type { FandomEditorMeta, Cut, AestheticFilterId } from "@/lib/workspace-types";
import {
  FANDOM_TEMPLATES,
  TEMPLATE_LABELS,
  buildAutoPrompt,
} from "@/lib/fandom-templates";

function makeCut(sceneId: string, order: number): Cut {
  return {
    id: genId("cut"),
    sceneId,
    order,
    canvasJSON: null,
    thumbnailUrl: null,
    backgroundImageUrl: null,
  };
}

/**
 * EditorAutoStart
 *
 * 1. `:projectId` → loads saved project from localStorage (full state restore)
 * 2. `?prompt=...` → auto-sends to copilot
 * 3. `?mode=auto` → auto-generates 4-cut instatoon
 * 4. `?mode=fandom` → loads fandom meta, sets template-specific canvas, auto-sends prompt
 */
export function EditorAutoStart() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const { sendMessage } = useCopilot();
  const { state, dispatch, canvasRef } = useWorkspace();
  const loadedRef = useRef(false);
  const promptedRef = useRef(false);
  const fandomRef = useRef(false);

  // ── Load saved project ────────────────────────────────────────────────
  useEffect(() => {
    if (loadedRef.current || !projectId || projectId === "new") return;

    const raw = localStorage.getItem(`olli-project-${projectId}`);
    if (!raw) return;

    loadedRef.current = true;

    try {
      const data = JSON.parse(raw);

      if (data.project?.title) {
        dispatch({ type: "SET_PROJECT_TITLE", title: data.project.title });
      }

      if (data.canvasAspectRatio) {
        dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio: data.canvasAspectRatio });
      }

      if (data.scenes?.length) {
        for (const scene of data.scenes) {
          dispatch({ type: "ADD_SCENE", scene });
        }

        if (data.activeSceneId) dispatch({ type: "SET_ACTIVE_SCENE", sceneId: data.activeSceneId });
        if (data.activeCutId) dispatch({ type: "SET_ACTIVE_CUT", cutId: data.activeCutId });

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

  // ── Fandom mode initialization ────────────────────────────────────────
  useEffect(() => {
    if (fandomRef.current) return;
    if (searchParams.get("mode") !== "fandom") return;

    const pid = projectId || "new";
    const key = `olli-fandom-editor-${pid}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const meta: FandomEditorMeta = JSON.parse(raw);
      fandomRef.current = true;

      // Set fandom meta in workspace state
      dispatch({ type: "SET_FANDOM_META", meta });

      // Set project title from fandom meta
      dispatch({ type: "SET_PROJECT_TITLE", title: meta.title });

      // ── Template-specific canvas setup ──
      const tmplDef = FANDOM_TEMPLATES.find((t) => t.type === meta.templateType);
      const defaultAspect = tmplDef?.aspect || "3:4";
      const cutsCount = tmplDef?.panels || 1;

      // Set aspect ratio from template
      dispatch({ type: "SET_CANVAS_ASPECT_RATIO", ratio: defaultAspect });

      // Set cuts count for copilot (only relevant for multi-cut templates)
      if (cutsCount >= 2 && cutsCount <= 4) {
        dispatch({ type: "COPILOT_SET_CUTS_COUNT", count: cutsCount as 2 | 3 | 4 });
      }

      // Create additional cuts if template requires more than 1
      if (cutsCount > 1) {
        const sceneId = state.activeSceneId;
        for (let i = 2; i <= cutsCount; i++) {
          dispatch({
            type: "ADD_CUT",
            sceneId,
            cut: makeCut(sceneId, i),
          });
        }
      }

      // Load extended settings (aesthetic filter, DPI, goods mode)
      const extKey = `olli-fandom-editor-ext-${pid}`;
      const extRaw = localStorage.getItem(extKey);
      if (extRaw) {
        try {
          const ext = JSON.parse(extRaw);
          if (ext.aestheticFilter) {
            dispatch({ type: "SET_AESTHETIC_FILTER", filterId: ext.aestheticFilter as AestheticFilterId });
          }
          if (ext.isGoods && ext.dpi) {
            // Goods mode: set print settings from template defaults
            const tmplDef2 = FANDOM_TEMPLATES.find((t) => t.type === meta.templateType);
            if (tmplDef2) {
              dispatch({
                type: "SET_PRINT_SETTINGS",
                settings: {
                  dpi: ext.dpi,
                  bleedMm: 3,
                  showBleedMarks: false,
                  showTrimLines: true,
                  showSafeZone: false,
                  physicalWidthMm: 0,
                  physicalHeightMm: 0,
                },
              });
            }
          }
        } catch { /* ignore */ }
      }

      // Auto-send fandom prompt with template context
      const prompt = buildAutoPrompt(meta);

      promptedRef.current = true;
      setTimeout(() => sendMessage(prompt), 800);
    } catch {
      // Invalid meta
    }
  }, [searchParams, projectId, dispatch, sendMessage]);

  // ── Birthday cafe mode ──────────────────────────────────────────────────
  useEffect(() => {
    if (searchParams.get("mode") !== "birthday-cafe") return;
    if (fandomRef.current) return;

    const pid = projectId || "new";
    const pkgKey = `olli-birthday-cafe-${pid}`;
    const raw = localStorage.getItem(pkgKey);
    if (!raw) return;

    try {
      const pkg = JSON.parse(raw);
      dispatch({ type: "SET_BIRTHDAY_CAFE_PACKAGE", package: pkg });
    } catch { /* ignore */ }
  }, [searchParams, projectId, dispatch]);

  // ── Auto-prompt (generic, non-fandom) ─────────────────────────────────
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

  // ── Module parameter → auto-open ModuleDialog ──────────────────────────
  useEffect(() => {
    const moduleParam = searchParams.get("module");
    if (moduleParam) {
      setTimeout(() => {
        dispatch({ type: "SET_ACTIVE_MODULE", module: moduleParam });
      }, 500);
    }
  }, [searchParams, dispatch]);

  return null;
}
