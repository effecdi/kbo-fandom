// ─── Fandom Template & Style Types ───────────────────────────────────────────

export type FandomTemplateType =
  | "portrait"        // 선수 포트레이트
  | "playercard"      // 선수 카드
  | "wallpaper"       // 폰 배경화면
  | "fanart"          // 자유 팬아트
  | "sticker"         // 스티커/이모지
  | "matchday"        // 경기날 포토
  | "edit"            // 에디트/콜라주
  | "instatoon"       // 인스타툰
  | "meme"            // 밈
  | "cheerbanner"     // 응원 배너
  | "slogan"          // 슬로건/배너
  | "stickersheet"    // 스티커시트
  | "stadium-set"     // 경기장 패키지
  | "acrylicstand"    // 아크릴 스탠드
  | "phonecase"       // 폰케이스
  | "deco-playercard" // 꾸미기 선수카드
  | "retro-magazine"  // 레트로 매거진
  | "scorebook-page"  // 스코어북 꾸미기
  | "kitsch-collage"  // 키치 콜라주
  | "ticket-bookmark" // 관람 티켓
  | "profile-deco";   // 프로필 꾸미기

export type FandomStylePreset =
  | "anime" | "watercolor" | "realistic" | "chibi" | "pop-art"
  | "sketch" | "flat" | "pixel" | "manhwa" | "dreamy";

// ─── Fandom Sticker & Tool Types ─────────────────────────────────────────────

export type FandomStickerCategory = "cheer" | "emoji" | "logo" | "text" | "stadium" | "heart";

export interface FandomSticker {
  id: string;
  category: FandomStickerCategory;
  imageUrl: string;
  label: string;
  groupId?: string;
}

export type PhotocardFrame = "basic" | "polaroid" | "player-card" | "holographic" | "vintage" | "neon";

export type ConcertEffect = "cheer-glow" | "spotlight" | "confetti" | "firework" | "laser";

// ─── Print Settings ─────────────────────────────────────────────────────────

export interface PrintSettings {
  dpi: 72 | 150 | 300;
  bleedMm: number;
  showBleedMarks: boolean;
  showTrimLines: boolean;
  showSafeZone: boolean;
  physicalWidthMm: number;
  physicalHeightMm: number;
}

// ─── Stadium Package ────────────────────────────────────────────────────────

export interface BirthdayCafePackage {
  playerId: string;
  playerName: string;
  matchDate: string;
  stadiumName: string;
  themeColors: string[];
  selectedGoods: ("cheerbanner" | "banner" | "poster" | "standee" | "playercard" | "sticker")[];
  coordinatedStyle: string;
}

// ─── Baseball Aesthetic Filter ───────────────────────────────────────────────

export type AestheticFilterId =
  | "classic" | "retro" | "dynamic" | "night-game" | "victory"
  | "daytime" | "stadium" | "magazine" | "summer-day" | "autumn-series"
  | "kitsch-retro" | "kitsch-pop" | "kitsch-heritage";

// ─── Fandom Editor Meta ──────────────────────────────────────────────────────

export interface FandomEditorMeta {
  groupId: string;
  groupName: string;
  coverColor: string;
  memberTags: string[];
  templateType: FandomTemplateType;
  title: string;
  description: string;
  stylePreset?: FandomStylePreset;
  poseHint?: string;
  outfitHint?: string;
  moodHint?: string;
}

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
  style?: "filled" | "box" | "handwritten-box" | "no-bg" | "no-border";
  bgColor?: string;
  bold?: boolean;
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

export type MultiCutLayoutType = "default" | "square";
export type MultiCutBorderStyle = "wobbly" | "simple";

export interface CopilotState {
  input: string;
  messages: CopilotMessage[];
  isGenerating: boolean;
  suggestedChips: string[];
  context: CopilotContext;
  dockExpanded: boolean;
  pinnedCharacters: PinnedCharacter[];
  cutsCount: 2 | 3 | 4;
  layoutType: MultiCutLayoutType;
  borderStyle: MultiCutBorderStyle;
}

// ─── History ────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  scenes: Scene[];
  activeSceneId: string;
  activeCutId: string;
}

// ─── Canvas ─────────────────────────────────────────────────────────────────

export type CanvasAspectRatio = "3:4" | "1:1" | "2:3" | "9:16" | "4:5" | "16:9";

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
  fandomMeta: FandomEditorMeta | null;
  printSettings: PrintSettings | null;
  birthdayCafePackage: BirthdayCafePackage | null;
  activeAestheticFilter: AestheticFilterId | null;
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
  | { type: "COPILOT_SET_LAYOUT_TYPE"; layoutType: MultiCutLayoutType }
  | { type: "COPILOT_SET_BORDER_STYLE"; borderStyle: MultiCutBorderStyle }
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
  | { type: "DISMISS_ONBOARDING" }
  | { type: "SET_FANDOM_META"; meta: FandomEditorMeta | null }
  | { type: "SET_FANDOM_STYLE_PRESET"; preset: FandomStylePreset }
  | { type: "OPEN_STICKER_PANEL" }
  | { type: "SET_PHOTOCARD_FRAME"; frame: PhotocardFrame }
  | { type: "APPLY_FANDOM_COLOR"; color: string }
  | { type: "SET_PRINT_SETTINGS"; settings: PrintSettings | null }
  | { type: "SET_BIRTHDAY_CAFE_PACKAGE"; package: BirthdayCafePackage | null }
  | { type: "SET_AESTHETIC_FILTER"; filterId: AestheticFilterId | null }
  | { type: "SET_PHYSICAL_CANVAS_SIZE"; widthMm: number; heightMm: number; dpi: number };
