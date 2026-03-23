// ─── Workspace Types ────────────────────────────────────────────────────────

export interface WorkspaceProject {
  id: string;
  title: string;
  style: string;
}

export interface Scene {
  id: string;
  title: string;
  order: number;
  cuts: Cut[];
}

export interface CutBubble {
  text: string;
  style?: string;   // "handwritten" | "linedrawing" | "wobbly" etc
  position?: string; // "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
}

export interface CutScript {
  text: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
}

export interface Cut {
  id: string;
  sceneId: string;
  order: number;
  canvasJSON: any;
  thumbnailUrl: string | null;
  backgroundImageUrl: string | null;
  pendingBubbles?: CutBubble[] | null;
  scriptTop?: CutScript | null;
  scriptBottom?: CutScript | null;
}

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string;
}

// ─── UI Level (Progressive Disclosure) ──────────────────────────────────────

export type UILevel = "beginner" | "intermediate" | "pro";

// ─── Copilot Types ──────────────────────────────────────────────────────────

export type CopilotActionType =
  | "generate_story"
  | "modify_cut"
  | "add_character"
  | "change_style"
  | "add_bubble"
  | "add_effect"
  | "generate_background"
  | "auto_generate";

export interface CopilotAction {
  type: CopilotActionType;
  params?: Record<string, any>;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  action?: CopilotAction;
  preview?: {
    type: "image" | "canvas";
    data: string;
    applied: boolean;
  };
}

export interface CopilotContext {
  selectedElementId?: string;
  type?: "scene" | "character" | "bubble";
}

export interface PinnedCharacter {
  id: string;
  name: string;
  imageUrl: string;
  imageDataUrl?: string; // base64 for API calls
}

export interface CopilotState {
  input: string;
  messages: CopilotMessage[];
  isGenerating: boolean;
  suggestedChips: string[];
  context: CopilotContext;
  dockExpanded: boolean;
  pinnedCharacters: PinnedCharacter[];
  cutsCount: 2 | 3 | 4;
}

// ─── History ────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  scenes: Scene[];
  activeSceneId: string;
  activeCutId: string;
}

// ─── Canvas ─────────────────────────────────────────────────────────────────

export type CanvasAspectRatio = "3:4" | "1:1";

export interface CanvasLayer {
  id: string;
  type: string; // "textbox" | "group" | "path" | "rect" | "image"
  label: string;
}

// ─── UI State ───────────────────────────────────────────────────────────────

export interface UIState {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  zoom: number;
}

// ─── Workspace State ────────────────────────────────────────────────────────

export interface WorkspaceState {
  project: WorkspaceProject;
  scenes: Scene[];
  activeSceneId: string;
  activeCutId: string;
  selectedObjectIds: string[];
  characters: Character[];
  copilot: CopilotState;
  history: { past: HistoryEntry[]; future: HistoryEntry[] };
  activeModule: string | null;
  ui: UIState;
  canvasAspectRatio: CanvasAspectRatio;
  canvasLayers: CanvasLayer[];
  uiLevel: UILevel;
  interactionCount: number;
  onboardingDismissed: boolean;
}

// ─── Actions ────────────────────────────────────────────────────────────────

export type WorkspaceAction =
  | { type: "SET_PROJECT_TITLE"; title: string }
  | { type: "SET_ACTIVE_SCENE"; sceneId: string }
  | { type: "SET_ACTIVE_CUT"; cutId: string }
  | { type: "ADD_SCENE"; scene: Scene }
  | { type: "REMOVE_SCENE"; sceneId: string }
  | { type: "ADD_CUT"; sceneId: string; cut: Cut }
  | { type: "REMOVE_CUT"; cutId: string }
  | { type: "UPDATE_CUT_CANVAS"; cutId: string; canvasJSON: any }
  | { type: "UPDATE_CUT_THUMBNAIL"; cutId: string; thumbnailUrl: string }
  | { type: "UPDATE_CUT_BACKGROUND"; cutId: string; backgroundImageUrl: string }
  | { type: "UPDATE_CUT_BUBBLES"; cutId: string; bubbles: CutBubble[] }
  | { type: "CLEAR_CUT_BUBBLES"; cutId: string }
  | { type: "UPDATE_CUT_SCRIPT"; cutId: string; position: "top" | "bottom"; script: CutScript | null }
  | { type: "SELECT_OBJECTS"; objectIds: string[] }
  | { type: "ADD_CHARACTER"; character: Character }
  | { type: "REMOVE_CHARACTER"; characterId: string }
  | { type: "COPILOT_ADD_MESSAGE"; message: CopilotMessage }
  | { type: "COPILOT_SET_GENERATING"; isGenerating: boolean }
  | { type: "COPILOT_SET_CHIPS"; chips: string[] }
  | { type: "COPILOT_APPLY_PREVIEW"; messageId: string }
  | { type: "COPILOT_SET_INPUT"; input: string }
  | { type: "COPILOT_SET_CONTEXT"; context: CopilotContext }
  | { type: "COPILOT_TOGGLE_DOCK" }
  | { type: "COPILOT_PIN_CHARACTER"; character: PinnedCharacter }
  | { type: "COPILOT_UNPIN_CHARACTER"; characterId: string }
  | { type: "COPILOT_SET_CUTS_COUNT"; count: 2 | 3 | 4 }
  | { type: "HISTORY_PUSH" }
  | { type: "HISTORY_UNDO" }
  | { type: "HISTORY_REDO" }
  | { type: "SET_ACTIVE_MODULE"; module: string | null }
  | { type: "TOGGLE_LEFT_PANEL" }
  | { type: "TOGGLE_RIGHT_PANEL" }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_CANVAS_ASPECT_RATIO"; ratio: CanvasAspectRatio }
  | { type: "UPDATE_CANVAS_LAYERS"; layers: CanvasLayer[] }
  | { type: "REORDER_CUTS"; sceneId: string; cutIds: string[] }
  | { type: "SET_UI_LEVEL"; level: UILevel }
  | { type: "INCREMENT_INTERACTION" }
  | { type: "DISMISS_ONBOARDING" };
