import type { SpeechBubble } from "./bubble-types";
import type { CanvasTextElement, CanvasLineElement } from "@/components/canvas-context-toolbar";

export type ScriptStyle = "filled" | "box" | "handwritten-box" | "no-bg" | "no-border";

export interface CharacterPlacement {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
  width?: number;
  height?: number;
  rotation?: number;
  flipX?: boolean;
  imageEl: HTMLImageElement | null;
  zIndex?: number;
  locked?: boolean;
}

export interface ScriptData {
  text: string;
  style: ScriptStyle;
  color: string;
  fontSize?: number;
  fontKey?: string;
  textColor?: string;
  bold?: boolean;
  x?: number;
  y?: number;
}

export type DrawingLayerType = "drawing" | "straight" | "curve" | "polyline" | "text" | "eraser";

export interface DrawingLayer {
  id: string;
  type: DrawingLayerType;
  imageData: string;
  imageEl?: HTMLImageElement | null;
  visible: boolean;
  zIndex: number;
  label: string;
  opacity: number;
  x?: number;
  y?: number;
}

export interface PanelData {
  id: string;
  topScript: ScriptData | null;
  bottomScript: ScriptData | null;
  bubbles: SpeechBubble[];
  characters: CharacterPlacement[];
  textElements: CanvasTextElement[];
  lineElements: CanvasLineElement[];
  backgroundImageUrl?: string;
  backgroundImageEl?: HTMLImageElement | null;
  drawingLayers: DrawingLayer[];
}
