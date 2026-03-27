import { createContext, useReducer, useRef, type ReactNode } from "react";
import type {
  WorkspaceState,
  WorkspaceAction,
  HistoryEntry,
  Scene,
  Cut,
  CutBubble,
  CutScript,
  CanvasAspectRatio,
  CanvasLayer,
  UILevel,
  PinnedCharacter,
  MultiCutLayoutType,
  MultiCutBorderStyle,
  FandomEditorMeta,
  FandomStylePreset,
  PhotocardFrame,
  PrintSettings,
  BirthdayCafePackage,
  AestheticFilterId,
} from "@/lib/workspace-types";
import type { CanvaEditorHandle } from "@/components/canva-editor/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

let idCounter = 0;
export function genId(prefix = "ws") {
  return `${prefix}-${Date.now()}-${++idCounter}`;
}

function makeDefaultCut(sceneId: string, order: number): Cut {
  return {
    id: genId("cut"),
    sceneId,
    order,
    canvasJSON: null,
    thumbnailUrl: null,
    backgroundImageUrl: null,
  };
}

function makeDefaultScene(order: number): Scene {
  const sceneId = genId("scene");
  return {
    id: sceneId,
    title: `씬 ${order}`,
    order,
    cuts: [makeDefaultCut(sceneId, 1)],
  };
}

// ─── Progressive disclosure thresholds ──────────────────────────────────────

function computeUILevel(count: number): UILevel {
  if (count >= 8) return "pro";
  if (count >= 3) return "intermediate";
  return "beginner";
}

// ─── Initial State ──────────────────────────────────────────────────────────

const defaultScene = makeDefaultScene(1);

export const initialState: WorkspaceState = {
  project: { id: "new", title: "새 프로젝트", style: "instatoon" },
  scenes: [defaultScene],
  activeSceneId: defaultScene.id,
  activeCutId: defaultScene.cuts[0].id,
  selectedObjectIds: [],
  characters: [],
  copilot: {
    input: "",
    messages: [],
    isGenerating: false,
    suggestedChips: [],
    context: {},
    dockExpanded: false,
    pinnedCharacters: [],
    cutsCount: 4,
    layoutType: "default",
    borderStyle: "wobbly",
  },
  history: { past: [], future: [] },
  activeModule: null,
  ui: { leftCollapsed: false, rightCollapsed: false, zoom: 100 },
  canvasAspectRatio: "3:4",
  canvasLayers: [],
  uiLevel: "pro",
  interactionCount: 99,
  onboardingDismissed: false,
  fandomMeta: null,
  printSettings: null,
  birthdayCafePackage: null,
  activeAestheticFilter: null,
};

// ─── Snapshot for undo/redo ─────────────────────────────────────────────────

function takeSnapshot(state: WorkspaceState): HistoryEntry {
  return {
    scenes: JSON.parse(JSON.stringify(state.scenes)),
    activeSceneId: state.activeSceneId,
    activeCutId: state.activeCutId,
  };
}

// ─── Reducer ────────────────────────────────────────────────────────────────

function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case "SET_PROJECT_TITLE":
      return { ...state, project: { ...state.project, title: action.title } };

    case "SET_ACTIVE_SCENE":
      return { ...state, activeSceneId: action.sceneId };

    case "SET_ACTIVE_CUT":
      return { ...state, activeCutId: action.cutId };

    case "ADD_SCENE":
      return { ...state, scenes: [...state.scenes, action.scene] };

    case "REMOVE_SCENE": {
      if (state.scenes.length <= 1) return state;
      const scenes = state.scenes.filter((s) => s.id !== action.sceneId);
      const activeSceneId =
        state.activeSceneId === action.sceneId
          ? scenes[0].id
          : state.activeSceneId;
      const activeCutId =
        state.activeSceneId === action.sceneId
          ? scenes[0].cuts[0]?.id ?? ""
          : state.activeCutId;
      return { ...state, scenes, activeSceneId, activeCutId };
    }

    case "ADD_CUT": {
      const scenes = state.scenes.map((s) =>
        s.id === action.sceneId
          ? { ...s, cuts: [...s.cuts, action.cut] }
          : s
      );
      return { ...state, scenes };
    }

    case "REMOVE_CUT": {
      const scenes = state.scenes.map((s) => {
        const filtered = s.cuts.filter((c) => c.id !== action.cutId);
        return filtered.length < s.cuts.length ? { ...s, cuts: filtered } : s;
      });
      const allCuts = scenes.flatMap((s) => s.cuts);
      const activeCutId =
        allCuts.find((c) => c.id === state.activeCutId)
          ? state.activeCutId
          : allCuts[0]?.id ?? "";
      return { ...state, scenes, activeCutId };
    }

    case "UPDATE_CUT_CANVAS": {
      const scenes = state.scenes.map((s) => ({
        ...s,
        cuts: s.cuts.map((c) =>
          c.id === action.cutId
            ? { ...c, canvasJSON: action.canvasJSON }
            : c
        ),
      }));
      return { ...state, scenes };
    }

    case "UPDATE_CUT_THUMBNAIL": {
      const scenes = state.scenes.map((s) => ({
        ...s,
        cuts: s.cuts.map((c) =>
          c.id === action.cutId
            ? { ...c, thumbnailUrl: action.thumbnailUrl }
            : c
        ),
      }));
      return { ...state, scenes };
    }

    case "UPDATE_CUT_BACKGROUND": {
      const scenes = state.scenes.map((s) => ({
        ...s,
        cuts: s.cuts.map((c) =>
          c.id === action.cutId
            ? { ...c, backgroundImageUrl: action.backgroundImageUrl }
            : c
        ),
      }));
      return { ...state, scenes };
    }

    case "UPDATE_CUT_BUBBLES": {
      const scenes = state.scenes.map((s) => ({
        ...s,
        cuts: s.cuts.map((c) =>
          c.id === action.cutId
            ? { ...c, pendingBubbles: action.bubbles }
            : c
        ),
      }));
      return { ...state, scenes };
    }

    case "CLEAR_CUT_BUBBLES": {
      const scenes = state.scenes.map((s) => ({
        ...s,
        cuts: s.cuts.map((c) =>
          c.id === action.cutId
            ? { ...c, pendingBubbles: null }
            : c
        ),
      }));
      return { ...state, scenes };
    }

    case "UPDATE_CUT_SCRIPT": {
      const scenes = state.scenes.map((s) => ({
        ...s,
        cuts: s.cuts.map((c) =>
          c.id === action.cutId
            ? {
                ...c,
                ...(action.position === "top"
                  ? { scriptTop: action.script }
                  : { scriptBottom: action.script }),
              }
            : c
        ),
      }));
      return { ...state, scenes };
    }

    case "SELECT_OBJECTS": {
      // Skip if selection hasn't changed
      const oldIds = state.selectedObjectIds;
      if (
        oldIds.length === action.objectIds.length &&
        oldIds.every((id, i) => id === action.objectIds[i])
      ) {
        return state;
      }
      return { ...state, selectedObjectIds: action.objectIds };
    }

    case "ADD_CHARACTER":
      return {
        ...state,
        characters: [...state.characters, action.character],
      };

    case "REMOVE_CHARACTER":
      return {
        ...state,
        characters: state.characters.filter(
          (c) => c.id !== action.characterId
        ),
      };

    case "COPILOT_ADD_MESSAGE":
      return {
        ...state,
        copilot: {
          ...state.copilot,
          messages: [...state.copilot.messages, action.message],
        },
      };

    case "COPILOT_SET_GENERATING":
      return {
        ...state,
        copilot: { ...state.copilot, isGenerating: action.isGenerating },
      };

    case "COPILOT_SET_CHIPS": {
      // Skip if chips are identical
      const oldChips = state.copilot.suggestedChips;
      if (
        oldChips.length === action.chips.length &&
        oldChips.every((c, i) => c === action.chips[i])
      ) {
        return state;
      }
      return {
        ...state,
        copilot: { ...state.copilot, suggestedChips: action.chips },
      };
    }

    case "COPILOT_APPLY_PREVIEW": {
      const messages = state.copilot.messages.map((m) =>
        m.id === action.messageId && m.preview
          ? { ...m, preview: { ...m.preview, applied: true } }
          : m
      );
      return {
        ...state,
        copilot: { ...state.copilot, messages },
      };
    }

    case "COPILOT_SET_INPUT":
      return {
        ...state,
        copilot: { ...state.copilot, input: action.input },
      };

    case "COPILOT_SET_CONTEXT": {
      // Skip if context hasn't changed
      const oldCtx = state.copilot.context;
      if (
        oldCtx.selectedElementId === action.context.selectedElementId &&
        oldCtx.type === action.context.type
      ) {
        return state;
      }
      return {
        ...state,
        copilot: { ...state.copilot, context: action.context },
      };
    }

    case "COPILOT_TOGGLE_DOCK":
      return {
        ...state,
        copilot: { ...state.copilot, dockExpanded: !state.copilot.dockExpanded },
      };

    case "COPILOT_PIN_CHARACTER": {
      const exists = state.copilot.pinnedCharacters.some(
        (c) => c.id === action.character.id
      );
      if (exists) return state;
      return {
        ...state,
        copilot: {
          ...state.copilot,
          pinnedCharacters: [...state.copilot.pinnedCharacters, action.character],
        },
      };
    }

    case "COPILOT_UNPIN_CHARACTER":
      return {
        ...state,
        copilot: {
          ...state.copilot,
          pinnedCharacters: state.copilot.pinnedCharacters.filter(
            (c) => c.id !== action.characterId
          ),
        },
      };

    case "COPILOT_SET_CUTS_COUNT":
      return {
        ...state,
        copilot: { ...state.copilot, cutsCount: action.count },
      };

    case "COPILOT_SET_LAYOUT_TYPE":
      return {
        ...state,
        copilot: { ...state.copilot, layoutType: action.layoutType },
      };

    case "COPILOT_SET_BORDER_STYLE":
      return {
        ...state,
        copilot: { ...state.copilot, borderStyle: action.borderStyle },
      };

    case "HISTORY_PUSH": {
      const snapshot = takeSnapshot(state);
      return {
        ...state,
        history: {
          past: [...state.history.past.slice(-39), snapshot],
          future: [],
        },
      };
    }

    case "HISTORY_UNDO": {
      if (state.history.past.length === 0) return state;
      const past = [...state.history.past];
      const prev = past.pop()!;
      const current = takeSnapshot(state);
      return {
        ...state,
        scenes: prev.scenes,
        activeSceneId: prev.activeSceneId,
        activeCutId: prev.activeCutId,
        history: {
          past,
          future: [current, ...state.history.future],
        },
      };
    }

    case "HISTORY_REDO": {
      if (state.history.future.length === 0) return state;
      const [next, ...future] = state.history.future;
      const current = takeSnapshot(state);
      return {
        ...state,
        scenes: next.scenes,
        activeSceneId: next.activeSceneId,
        activeCutId: next.activeCutId,
        history: {
          past: [...state.history.past, current],
          future,
        },
      };
    }

    case "SET_ACTIVE_MODULE":
      return { ...state, activeModule: action.module };

    case "TOGGLE_LEFT_PANEL":
      return {
        ...state,
        ui: { ...state.ui, leftCollapsed: !state.ui.leftCollapsed },
      };

    case "TOGGLE_RIGHT_PANEL":
      return {
        ...state,
        ui: { ...state.ui, rightCollapsed: !state.ui.rightCollapsed },
      };

    case "SET_ZOOM":
      return { ...state, ui: { ...state.ui, zoom: action.zoom } };

    case "SET_CANVAS_ASPECT_RATIO":
      return { ...state, canvasAspectRatio: action.ratio };

    case "UPDATE_CANVAS_LAYERS": {
      // Skip if layers haven't actually changed (avoid re-renders)
      if (
        state.canvasLayers.length === action.layers.length &&
        state.canvasLayers.every((l, i) => l.id === action.layers[i]?.id && l.type === action.layers[i]?.type)
      ) {
        return state;
      }
      return { ...state, canvasLayers: action.layers };
    }

    case "REORDER_CUTS": {
      const scenes = state.scenes.map((s) => {
        if (s.id !== action.sceneId) return s;
        const cutMap = new Map(s.cuts.map((c) => [c.id, c]));
        const reordered = action.cutIds
          .map((id) => cutMap.get(id))
          .filter(Boolean) as typeof s.cuts;
        return { ...s, cuts: reordered };
      });
      return { ...state, scenes };
    }

    case "SET_UI_LEVEL":
      return { ...state, uiLevel: action.level };

    case "INCREMENT_INTERACTION": {
      const newCount = state.interactionCount + 1;
      const newLevel = computeUILevel(newCount);
      return {
        ...state,
        interactionCount: newCount,
        uiLevel: newLevel,
      };
    }

    case "DISMISS_ONBOARDING":
      return { ...state, onboardingDismissed: true };

    case "SET_FANDOM_META":
      return { ...state, fandomMeta: action.meta };

    case "SET_FANDOM_STYLE_PRESET":
      if (!state.fandomMeta) return state;
      return {
        ...state,
        fandomMeta: { ...state.fandomMeta, stylePreset: action.preset },
      };

    case "OPEN_STICKER_PANEL":
      return state; // handled by ContextPanel UI

    case "SET_PHOTOCARD_FRAME":
      return { ...state, canvasAspectRatio: "2:3" as CanvasAspectRatio };

    case "APPLY_FANDOM_COLOR":
      return state; // handled by canvas UI directly

    case "SET_PRINT_SETTINGS":
      return { ...state, printSettings: action.settings };

    case "SET_BIRTHDAY_CAFE_PACKAGE":
      return { ...state, birthdayCafePackage: action.package };

    case "SET_AESTHETIC_FILTER":
      return { ...state, activeAestheticFilter: action.filterId };

    case "SET_PHYSICAL_CANVAS_SIZE":
      return state; // Canvas pixel size is computed at render time via DPI

    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

export const WorkspaceContext = createContext<{
  state: WorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  canvasRef: React.RefObject<CanvaEditorHandle | null>;
}>({ state: initialState, dispatch: () => {}, canvasRef: { current: null } });

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);
  const canvasRef = useRef<CanvaEditorHandle>(null);
  return (
    <WorkspaceContext.Provider value={{ state, dispatch, canvasRef }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
