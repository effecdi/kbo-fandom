export type BubbleStyle =
    | "handwritten"
    | "linedrawing"
    | "wobbly"
    | "thought"
    | "shout"
    | "rectangle"
    | "rounded"
    | "doubleline"
    | "wavy"
    | "image"
    | "flash_black"
    | "flash_dense"
    | "cloud"
    | "sticker"
    | "polygon"
    | "spiky"
    | "dashed"
    | "brush"
    | "drip"
    | "sparkle_ring"
    | "flash_eyelash"
    | "embarrassed"
    | "monologue"
    | "tall_rough";
export type TailStyle = "none" | "long" | "short" | "dots_handwritten" | "dots_linedrawing";

export type TailDrawMode = "bezier" | "straight" | "polyline" | "spline";

export interface SpeechBubble {
    id: string;
    seed: number;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    style: BubbleStyle;
    tailStyle: TailStyle;
    tailDirection: "bottom" | "left" | "right" | "top";
    tailTipX?: number;
    tailTipY?: number;
    tailBaseSpread?: number;
    tailLength?: number;
    tailCurve?: number;
    tailJitter?: number;
    tailRoundness?: number;
    tailCtrl1X?: number;
    tailCtrl1Y?: number;
    tailCtrl2X?: number;
    tailCtrl2Y?: number;
    tailCtrl3X?: number;
    tailCtrl3Y?: number;
    tailCtrl4X?: number;
    tailCtrl4Y?: number;
    dotsScale?: number;
    dotsSpacing?: number;
    tailDrawMode?: TailDrawMode;
    tailPoints?: { x: number; y: number }[];
    drawMode?: "both" | "fill_only" | "stroke_only";
    fillColor?: string;
    strokeColor?: string;
    fillOpacity?: number;
    flashLineCount?: number;
    flashLineLength?: number;
    flashLineSpacing?: number;
    flashLineThickness?: number;
    flashBumpCount?: number;
    flashBumpHeight?: number;
    flashInnerRadius?: number;
    flashFilled?: boolean;
    shapeSides?: number;
    shapeCornerRadius?: number;
    shapeWobble?: number;
    shapeSpikeCount?: number;
    shapeSpikeHeight?: number;
    shapeSpikeSharpness?: number;
    shapeBumpCount?: number;
    shapeBumpSize?: number;
    shapeBumpRoundness?: number;
    strokeWidth: number;
    wobble: number;
    fontSize: number;
    fontKey: string;
    templateSrc?: string;
    templateImg?: HTMLImageElement;
    zIndex?: number;
    groupId?: string;
    locked?: boolean;
    visible?: boolean;
}

export interface CharacterOverlay {
    id: string;
    imageUrl: string;
    imgElement: HTMLImageElement | null;
    x: number;
    y: number;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
    label: string;
    rotation?: number;
    zIndex?: number;
    locked?: boolean;
}

export type DragMode = null | "move" | "move-tail" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl" | "resize-r" | "resize-l" | "resize-t" | "resize-b"
    | "char-move" | "char-resize-br" | "char-resize-bl" | "char-resize-tr" | "char-resize-tl" | "char-rotate"
    | "tail-ctrl1" | "tail-ctrl2";

export interface PageData {
    id: string;
    bubbles: SpeechBubble[];
    characters: CharacterOverlay[];
    imageDataUrl?: string;
    imageElement?: HTMLImageElement | null;
    canvasSize: { width: number; height: number };
    backgroundColor?: string;
    name?: string;
}

// ─── UI Definitions for B2B Editor ──────────────────────────────────────────

export interface BubbleStyleDef {
  id: BubbleStyle;
  label: string;
  category: "basic" | "expressive" | "decorative" | "special";
}

export const BUBBLE_STYLE_DEFS: BubbleStyleDef[] = [
  { id: "rounded", label: "둥근", category: "basic" },
  { id: "rectangle", label: "사각", category: "basic" },
  { id: "handwritten", label: "손글씨", category: "basic" },
  { id: "linedrawing", label: "라인", category: "basic" },
  { id: "doubleline", label: "이중선", category: "basic" },
  { id: "dashed", label: "점선", category: "basic" },
  { id: "thought", label: "생각", category: "expressive" },
  { id: "shout", label: "외침", category: "expressive" },
  { id: "wobbly", label: "흔들림", category: "expressive" },
  { id: "flash_black", label: "번쩍", category: "expressive" },
  { id: "flash_dense", label: "집중", category: "expressive" },
  { id: "spiky", label: "뾰족", category: "expressive" },
  { id: "embarrassed", label: "당황", category: "expressive" },
  { id: "cloud", label: "구름", category: "decorative" },
  { id: "wavy", label: "물결", category: "decorative" },
  { id: "sticker", label: "스티커", category: "decorative" },
  { id: "polygon", label: "다각형", category: "decorative" },
  { id: "sparkle_ring", label: "반짝링", category: "decorative" },
  { id: "flash_eyelash", label: "속눈썹", category: "decorative" },
  { id: "brush", label: "브러시", category: "special" },
  { id: "drip", label: "드립", category: "special" },
  { id: "monologue", label: "독백", category: "special" },
  { id: "tall_rough", label: "러프", category: "special" },
  { id: "image", label: "이미지", category: "special" },
];

export const BUBBLE_COLOR_PRESETS = [
  { fill: "#ffffff", stroke: "#222222", label: "기본" },
  { fill: "#fff8e1", stroke: "#f9a825", label: "노란" },
  { fill: "#e8f5e9", stroke: "#43a047", label: "초록" },
  { fill: "#e3f2fd", stroke: "#1e88e5", label: "파란" },
  { fill: "#fce4ec", stroke: "#e53935", label: "빨간" },
  { fill: "#f3e5f5", stroke: "#8e24aa", label: "보라" },
  { fill: "#222222", stroke: "#ffffff", label: "다크" },
  { fill: "#00e5cc", stroke: "#0a0a0a", label: "민트" },
  { fill: "transparent", stroke: "#222222", label: "투명" },
];

// ─── Script Style Types ────────────────────────────────────────────────────

export type ScriptStyle = "filled" | "box" | "handwritten-box" | "no-bg" | "no-border";

export const SCRIPT_STYLES: { id: ScriptStyle; label: string }[] = [
  { id: "filled", label: "채움" },
  { id: "box", label: "박스" },
  { id: "handwritten-box", label: "손그림" },
  { id: "no-bg", label: "투명" },
  { id: "no-border", label: "무테두리" },
];

export const SCRIPT_COLOR_PRESETS = [
  { bg: "rgba(0,0,0,0.6)", text: "#ffffff", label: "기본" },
  { bg: "rgba(255,255,255,0.85)", text: "#000000", label: "밝은" },
  { bg: "rgba(0,229,204,0.2)", text: "#00e5cc", label: "민트" },
  { bg: "rgba(255,59,48,0.15)", text: "#ff3b30", label: "빨간" },
  { bg: "rgba(0,122,255,0.15)", text: "#007aff", label: "파란" },
  { bg: "rgba(255,204,0,0.2)", text: "#996600", label: "노란" },
  { bg: "rgba(88,86,214,0.15)", text: "#5856d6", label: "보라" },
  { bg: "rgba(52,199,89,0.15)", text: "#34c759", label: "초록" },
];

export interface BubbleTemplate {
  id: string;
  label: string;
  category: string;
  bubbles: { style: BubbleStyle; x: number; y: number; text: string; position: string }[];
}

export const BUBBLE_TEMPLATES: BubbleTemplate[] = [
  {
    id: "dialog-2",
    label: "대화 (2인)",
    category: "대화",
    bubbles: [
      { style: "rounded", x: 30, y: 30, text: "안녕!", position: "top-left" },
      { style: "rounded", x: 280, y: 30, text: "반가워!", position: "top-right" },
    ],
  },
  {
    id: "thought-solo",
    label: "생각 (1인)",
    category: "독백",
    bubbles: [
      { style: "thought", x: 150, y: 40, text: "뭔가 이상한데...", position: "top-left" },
    ],
  },
  {
    id: "shout-action",
    label: "외침 + 리액션",
    category: "액션",
    bubbles: [
      { style: "shout", x: 100, y: 20, text: "아악!!", position: "top-left" },
      { style: "flash_black", x: 250, y: 200, text: "쿵!", position: "bottom-right" },
    ],
  },
  {
    id: "narration",
    label: "나레이션 + 대사",
    category: "스토리",
    bubbles: [
      { style: "monologue", x: 30, y: 20, text: "그날은 비가 왔다.", position: "top-left" },
      { style: "rounded", x: 200, y: 350, text: "우산 가져왔어?", position: "bottom-right" },
    ],
  },
  {
    id: "comic-4",
    label: "4칸 대화",
    category: "대화",
    bubbles: [
      { style: "rounded", x: 30, y: 30, text: "", position: "top-left" },
      { style: "rounded", x: 280, y: 30, text: "", position: "top-right" },
      { style: "rounded", x: 30, y: 300, text: "", position: "bottom-left" },
      { style: "rounded", x: 280, y: 300, text: "", position: "bottom-right" },
    ],
  },
  {
    id: "whisper",
    label: "속삭임",
    category: "감정",
    bubbles: [
      { style: "dashed", x: 150, y: 50, text: "쉿... 조용히", position: "center" },
    ],
  },
];
