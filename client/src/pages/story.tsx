import { useState, useRef, useCallback, useEffect, useMemo, startTransition } from "react";
import { regenerateBorderPoints } from "@/lib/webtoon-layout";
import { useSearch } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ElementPropertiesPanel } from "@/components/element-properties-panel";
import { LayerListPanel, type LayerItem } from "@/components/layer-list-panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { useAuth } from "@/hooks/use-auth";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { LeaveEditorDialog } from "@/components/leave-editor-dialog";
import { useNavigationGuard } from "@/hooks/use-navigation-guard";
import { useLocation } from "wouter";
import {
  Plus,
  Trash2,
  Wand2,
  RotateCcw,
  Lightbulb,
  MessageSquare,
  ImageIcon,
  Download,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  X,
  Type,
  Layers,
  ChevronLeft,
  ChevronRight,
  Copy,
  Undo2,
  Redo2,
  Save,
  ZoomIn,
  ZoomOut,
  Minimize2,
  LayoutGrid,
  Maximize,
  BookOpen,
  Share2,
  FolderOpen,
  Crown,
  Loader2,
  ChevronUp,
  ChevronDown,
  UploadCloud,
  ImagePlus,
  Check,
  CheckCircle2,
  Zap,
  Star,
  Pen,
  ArrowLeft,
  Boxes,
  FlipHorizontal2,
  MousePointer2,
  Eraser,
  Highlighter,
  Pencil,
  PenLine,
  Minus,
  Menu,
  Spline,
  GitCommitHorizontal,
  Eye,
  EyeOff,
  Square,
  Circle,
  Triangle,
  Diamond,
  ArrowRight as ArrowRightIcon,
  Sparkles,
  FolderPlus,
  Paintbrush,
  Maximize,
  ZoomIn as ZoomInIcon,
  CircleDot,
  PlusCircle,
  MinusCircle,
  Scaling,
  ScanSearch,
  Palette,
  MousePointerClick,
} from "lucide-react";
import DrawingCanvas, { type DrawingToolState, type DrawingCanvasHandle } from "@/components/drawing-canvas";
import SelectionCanvas, { type SelectionCanvasHandle, type SelectionMode } from "@/components/selection-canvas";
import ExpandCanvas from "@/components/expand-canvas";
import "@/components/drawing-tools-panel.scss";
import { FlowStepper } from "@/components/flow-stepper";
import { AutoWebtoonPanel } from "@/components/auto-webtoon-panel";
import { CharacterPicker, type CharacterImage } from "@/components/character-picker";
import { EditorChecklistPopover } from "@/components/editor-checklist-popover";
import { StoryGuidePanel } from "@/components/story-guide-panel";
import { startStoryTour } from "@/lib/story-tour";
import { InstagramPublishDialog } from "@/components/instagram-publish-dialog";
import { getFlowState, clearFlowState } from "@/lib/flow";
import type { StoryPanelScript, Generation, GenerationLight, CharacterFolder } from "@shared/schema";
import { Instagram } from "lucide-react";
import ReactFlow, { Background, Controls, type Node, type NodeChange, applyNodeChanges } from "reactflow";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { KOREAN_FONTS, FONT_CSS, getFontFamily, getDefaultTailTip, getTailGeometry, drawBubble, STYLE_LABELS, FLASH_STYLE_LABELS, TAIL_LABELS } from "@/lib/bubble-utils";
import { SpeechBubble, BubbleStyle, TailStyle, TailDrawMode } from "@/lib/bubble-types";
import { HANDLE_COLOR } from "@/lib/editor-constants";
import {
  TextContextToolbar,
  LineContextToolbar,
  DrawingContextToolbar,
  BubbleContextToolbar,
  BubbleFloatingSettings,
  FloatingSettingsModal,
  ShapeContextToolbar,
  ScriptContextToolbar,
  CharContextToolbar,
  CanvasBgToolbar,
  CANVAS_BG_COLORS,
  createTextElement,
  createLineElement,
  createShapeElement,
  type CanvasTextElement,
  type CanvasLineElement,
  type CanvasShapeElement,
  type LineType,
  type ShapeType,
} from "@/components/canvas-context-toolbar";
import "@/components/canvas-context-toolbar.scss";

function bubblePath(n: number) {
  return `/assets/bubbles/bubble_${String(n).padStart(3, "0")}.png`;
}

type TemplateCategory = { label: string; ids: number[] };
const BUBBLE_TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { label: "말풍선 (외침/효과)", ids: [109, 110, 111, 112, 113] },
  { label: "이펙트 / 스티커", ids: [108, 114, 115, 116, 117] },
];

type ScriptStyle = "filled" | "box" | "handwritten-box" | "no-bg" | "no-border";

const SCRIPT_STYLE_OPTIONS: { value: ScriptStyle; label: string }[] = [
  { value: "filled", label: "채움" },
  { value: "box", label: "박스라인" },
  { value: "handwritten-box", label: "손글씨 박스" },
  { value: "no-bg", label: "배경없음" },
  { value: "no-border", label: "라인없음" },
];

const SCRIPT_COLOR_OPTIONS = [
  {
    value: "yellow",
    label: "노랑",
    bg: "rgba(250, 204, 21, 0.9)",
    text: "#1a1a1a",
    border: "rgba(202, 160, 0, 0.8)",
  },
  {
    value: "sky",
    label: "하늘",
    bg: "rgba(56, 189, 248, 0.9)",
    text: "#1a1a1a",
    border: "rgba(14, 145, 210, 0.8)",
  },
  {
    value: "pink",
    label: "분홍",
    bg: "rgba(244, 114, 182, 0.9)",
    text: "#1a1a1a",
    border: "rgba(210, 70, 140, 0.8)",
  },
  {
    value: "green",
    label: "초록",
    bg: "rgba(74, 222, 128, 0.9)",
    text: "#1a1a1a",
    border: "rgba(34, 170, 80, 0.8)",
  },
  {
    value: "orange",
    label: "주황",
    bg: "rgba(251, 146, 60, 0.9)",
    text: "#1a1a1a",
    border: "rgba(210, 110, 30, 0.8)",
  },
  {
    value: "purple",
    label: "보라",
    bg: "rgba(167, 139, 250, 0.9)",
    text: "#1a1a1a",
    border: "rgba(120, 90, 220, 0.8)",
  },
  {
    value: "white",
    label: "흰색",
    bg: "rgba(255, 255, 255, 0.95)",
    text: "#1a1a1a",
    border: "rgba(200, 200, 200, 0.8)",
  },
  {
    value: "dark",
    label: "어두운",
    bg: "rgba(30, 30, 30, 0.9)",
    text: "#ffffff",
    border: "rgba(80, 80, 80, 0.8)",
  },
];

const FLOW_NODE_STYLE_CHAR = {
  width: 80,
  height: 40,
  border: "1px solid hsl(150, 80%, 40%)",
  borderRadius: 8,
  background: "white",
  fontSize: 12,
};
const FLOW_NODE_STYLE_BUBBLE = {
  width: 100,
  height: 40,
  border: "1px solid hsl(200, 70%, 40%)",
  borderRadius: 8,
  background: "white",
  fontSize: 12,
};

const SCRIPT_TEXT_COLORS = [
  { value: "", label: "자동", hex: "" },
  { value: "#1a1a1a", label: "검정", hex: "#1a1a1a" },
  { value: "#ffffff", label: "흰색", hex: "#ffffff" },
  { value: "#dc2626", label: "빨강", hex: "#dc2626" },
  { value: "#2563eb", label: "파랑", hex: "#2563eb" },
  { value: "#16a34a", label: "초록", hex: "#16a34a" },
  { value: "#9333ea", label: "보라", hex: "#9333ea" },
  { value: "#ea580c", label: "주황", hex: "#ea580c" },
];

const BUBBLE_COLOR_PRESETS = [
  { label: "흰색", fill: "#ffffff", stroke: "#222222" },
  { label: "검정", fill: "#1a1a1a", stroke: "#000000" },
  { label: "노랑", fill: "#fef08a", stroke: "#ca8a04" },
  { label: "하늘", fill: "#bae6fd", stroke: "#0ea5e9" },
  { label: "분홍", fill: "#fecdd3", stroke: "#e11d48" },
  { label: "연두", fill: "#bbf7d0", stroke: "#16a34a" },
  { label: "보라", fill: "#e9d5ff", stroke: "#9333ea" },
  { label: "주황", fill: "#fed7aa", stroke: "#ea580c" },
  { label: "투명", fill: "transparent", stroke: "#222222" },
];



interface CharacterPlacement {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
  width?: number;   // explicit pixel width (optional, overrides scale if set)
  height?: number;  // explicit pixel height
  rotation?: number;
  flipX?: boolean;  // 좌우 반전
  imageEl: HTMLImageElement | null;
  zIndex?: number;
  locked?: boolean;
  visible?: boolean;
  name?: string;
  generationId?: number;
  prompt?: string;
}

interface ScriptData {
  text: string;
  style: ScriptStyle;
  color: string;
  fontSize?: number;
  fontKey?: string;
  textColor?: string;
  bold?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  visible?: boolean;
}

type DrawingLayerType = "drawing" | "straight" | "curve" | "polyline" | "text" | "eraser";

interface DrawingLayer {
  id: string;
  type: DrawingLayerType;
  imageData: string;       // base64 PNG (single stroke)
  imageEl?: HTMLImageElement | null;  // runtime cache (not serialized)
  visible: boolean;
  zIndex: number;
  label: string;           // "드로잉", "직선", "곡선", "꺾인선", "텍스트", "지우개"
  opacity: number;         // 0-1, per-layer opacity
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  locked?: boolean;
}

interface PanelData {
  id: string;
  topScript: ScriptData | null;
  bottomScript: ScriptData | null;
  bubbles: SpeechBubble[];
  characters: CharacterPlacement[];
  textElements: CanvasTextElement[];
  lineElements: CanvasLineElement[];
  shapeElements: CanvasShapeElement[];
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundImageEl?: HTMLImageElement | null;
  drawingLayers: DrawingLayer[];
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}



function createBubble(
  canvasW: number,
  canvasH: number,
  text = "",
  style: BubbleStyle = "linedrawing",
): SpeechBubble {
  return {
    id: generateId(),
    seed: Math.floor(Math.random() * 1000000),
    x: canvasW / 2 - 70,
    y: canvasH / 2 - 30,
    width: 140,
    height: 60,
    text,
    style,
    tailStyle: "short",
    tailDirection: "bottom",
    tailBaseSpread: 20,
    tailLength: undefined,
    tailCurve: 0.5,
    tailJitter: 1,
    dotsScale: 1,
    dotsSpacing: 1,
    strokeWidth: 2,
    wobble: 5,
    fontSize: 15,
    fontKey: "default",
    zIndex: 10,
  };
}

function createPanel(): PanelData {
  return {
    id: generateId(),
    topScript: null,
    bottomScript: null,
    bubbles: [],
    characters: [],
    textElements: [],
    lineElements: [],
    shapeElements: [],
    backgroundColor: "#ffffff",
    backgroundImageUrl: undefined,
    backgroundImageEl: null,
    drawingLayers: [],
  };
}

function drawHandwrittenPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  sw: number,
  seed: number,
) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const rx = w / 2,
    ry = h / 2,
    cx = x + rx,
    cy = y + ry;
  const segments = 60;
  const rand = seededRandom(seed);
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const jx = (rand() - 0.5) * sw * 1.5;
    const jy = (rand() - 0.5) * sw * 1.5;
    const px = cx + Math.cos(angle) * rx + jx;
    const py = cy + Math.sin(angle) * ry + jy;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawLinedrawingPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  sw: number,
) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.closePath();
}

function drawWobblyPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  sw: number,
  wobble: number,
) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const rx = w / 2,
    ry = h / 2,
    cx = x + rx,
    cy = y + ry;
  const segments = 80;
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const wx = Math.sin(angle * 6) * wobble;
    const wy = Math.cos(angle * 8) * wobble * 0.7;
    const px = cx + Math.cos(angle) * (rx + wx);
    const py = cy + Math.sin(angle) * (ry + wy);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawThoughtPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sw: number, seed: number) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const rx = w / 2, ry = h / 2, cx = x + rx, cy = y + ry;
  const bumps = 16;
  const bumpSize = Math.min(rx, ry) * 0.18;
  const rand = seededRandom(seed);
  ctx.beginPath();
  for (let i = 0; i <= bumps * 4; i++) {
    const t = i / (bumps * 4);
    const angle = t * Math.PI * 2;
    const bumpAngle = angle * bumps;
    const bump = Math.abs(Math.cos(bumpAngle)) * bumpSize + (rand() - 0.5) * bumpSize * 0.3;
    const px = cx + Math.cos(angle) * (rx + bump);
    const py = cy + Math.sin(angle) * (ry + bump);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawShoutPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sw: number, seed: number) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "miter";
  ctx.lineCap = "round";
  const rx = w / 2, ry = h / 2, cx = x + rx, cy = y + ry;
  const spikes = 12;
  const rand = seededRandom(seed);
  ctx.beginPath();
  for (let i = 0; i <= spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const isSpike = i % 2 === 0;
    const spikeLen = isSpike ? 0.25 + rand() * 0.15 : 0;
    const r = isSpike ? 1 + spikeLen : 0.82;
    const px = cx + Math.cos(angle) * rx * r;
    const py = cy + Math.sin(angle) * ry * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawRectanglePath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sw: number) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "miter";
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.closePath();
}

function drawRoundedPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sw: number) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const r = Math.min(w, h) * 0.2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawDoublelinePath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sw: number) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const rx = w / 2, ry = h / 2, cx = x + rx, cy = y + ry;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#222";
  ctx.stroke();
  const gap = sw * 2.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx - gap, ry - gap, 0, 0, Math.PI * 2);
  ctx.closePath();
}

function drawWavyPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sw: number) {
  ctx.lineWidth = sw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const rx = w / 2, ry = h / 2, cx = x + rx, cy = y + ry;
  const waves = 10;
  const waveAmp = Math.min(rx, ry) * 0.08;
  const segments = 120;
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const wave = Math.sin(angle * waves) * waveAmp;
    const px = cx + Math.cos(angle) * (rx + wave);
    const py = cy + Math.sin(angle) * (ry + wave);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function scriptWrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    if (!raw) { lines.push(""); continue; }
    let cur = "";
    for (const ch of raw) {
      const test = cur + ch;
      if (ctx.measureText(test).width > maxWidth && cur) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

function getScriptRect(
  ctx: CanvasRenderingContext2D,
  script: ScriptData,
  type: "top" | "bottom",
  canvasW: number,
  canvasH: number,
) {
  const fs = script.fontSize || 16;
  const padX = Math.max(14, fs * 0.8);
  const padY = Math.max(6, fs * 0.4);
  const fontFamily = getFontFamily(script.fontKey || "default");
  const weight = script.bold !== false ? "bold" : "normal";
  ctx.font = `${weight} ${fs}px ${fontFamily}`;
  // 사용자가 리사이즈한 width가 있으면 해당 너비 사용
  const explicitW = script.width;
  const maxW = explicitW ? explicitW - padX * 2 : canvasW - padX * 2 - 8;
  const lines = scriptWrapLines(ctx, script.text || "", maxW);
  const lineH = fs * 1.35;
  const textW = Math.max(...lines.map(l => ctx.measureText(l).width), 20);
  const bw = explicitW ? explicitW : Math.min(canvasW - 8, textW + padX * 2);
  const autoH = lines.length * lineH + padY * 2;
  const bh = script.height ? Math.max(script.height, autoH) : autoH;
  const defaultX = canvasW / 2 - bw / 2;
  const defaultY = type === "top" ? 8 : canvasH - bh - 8;
  const bx = script.x !== undefined ? script.x : defaultX;
  const by = script.y !== undefined ? script.y : defaultY;
  return { bx, by, bw, bh, fs, lines, lineH, padX, padY };
}

function drawScriptOverlay(
  ctx: CanvasRenderingContext2D,
  script: ScriptData,
  type: "top" | "bottom",
  canvasW: number,
  canvasH: number,
  isSelected?: boolean,
) {
  if (!script.text) return;
  ctx.save();

  const colorOpt =
    SCRIPT_COLOR_OPTIONS.find((c) => c.value === script.color) ||
    SCRIPT_COLOR_OPTIONS[0];
  const style = script.style || "filled";

  const { bx, by, bw, bh, fs } = getScriptRect(
    ctx,
    script,
    type,
    canvasW,
    canvasH,
  );
  const fontFamily = getFontFamily(script.fontKey || "default");
  const weight = script.bold !== false ? "bold" : "normal";
  ctx.font = `${weight} ${fs}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const r = 5;

  const drawRoundedRect = () => {
    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
    ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();
  };

  const drawWobblyRect = () => {
    const seed = script.text.length * 7 + (type === "top" ? 11 : 37);
    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return ((s - 1) / 2147483646) * 2 - 1;
    };
    const wobble = 1.8;
    ctx.beginPath();
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = bx + t * bw + rand() * wobble;
      const py = by + rand() * wobble;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = bx + bw + rand() * wobble;
      const py = by + t * bh + rand() * wobble;
      ctx.lineTo(px, py);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const px = bx + t * bw + rand() * wobble;
      const py = by + bh + rand() * wobble;
      ctx.lineTo(px, py);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const px = bx + rand() * wobble;
      const py = by + t * bh + rand() * wobble;
      ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  if (style === "filled") {
    drawRoundedRect();
    ctx.fillStyle = colorOpt.bg;
    ctx.fill();
    ctx.strokeStyle = colorOpt.border;
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (style === "box") {
    drawRoundedRect();
    ctx.fillStyle = colorOpt.bg.replace(/[\d.]+\)$/, "0.15)");
    ctx.fill();
    ctx.strokeStyle = colorOpt.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (style === "handwritten-box") {
    drawWobblyRect();
    ctx.fillStyle = colorOpt.bg.replace(/[\d.]+\)$/, "0.15)");
    ctx.fill();
    ctx.strokeStyle = colorOpt.border;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  } else if (style === "no-border") {
    drawRoundedRect();
    ctx.fillStyle = colorOpt.bg;
    ctx.fill();
  } else if (style === "no-bg") {
  }

  if (script.textColor) {
    ctx.fillStyle = script.textColor;
  } else if (style === "no-bg") {
    ctx.fillStyle = "#1a1a1a";
  } else {
    ctx.fillStyle = colorOpt.text;
  }
  const { lines: dlines, lineH: dlH } = getScriptRect(ctx, script, type, canvasW, canvasH);
  const totalTH = dlines.length * dlH;
  dlines.forEach((line, i) => {
    const ly = by + (bh - totalTH) / 2 + dlH / 2 + i * dlH;
    ctx.fillText(line, bx + bw / 2, ly);
  });

  // 선택된 경우에만 점선 사각형 + 리사이즈 핸들 표시
  if (isSelected) {
    ctx.strokeStyle = HANDLE_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);
    ctx.setLineDash([]);

    // 네 모서리 리사이즈 핸들
    const hs = 6;
    const corners = [
      { x: bx - 2, y: by - 2 },
      { x: bx + bw + 2, y: by - 2 },
      { x: bx - 2, y: by + bh + 2 },
      { x: bx + bw + 2, y: by + bh + 2 },
    ];
    corners.forEach((c) => {
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.fillRect(c.x - hs / 2, c.y - hs / 2, hs, hs);
      ctx.strokeStyle = HANDLE_COLOR;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(c.x - hs / 2, c.y - hs / 2, hs, hs);
    });
  }

  ctx.restore();
}

function buildShapePath(
  ctx: CanvasRenderingContext2D,
  shapeType: string,
  x: number, y: number, w: number, h: number,
) {
  ctx.beginPath();
  switch (shapeType) {
    case "rectangle":
      ctx.rect(x, y, w, h);
      break;
    case "circle":
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case "triangle":
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      break;
    case "diamond":
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w / 2, y + h);
      ctx.lineTo(x, y + h / 2);
      ctx.closePath();
      break;
    case "star": {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const outerRx = w / 2;
      const outerRy = h / 2;
      const innerRx = outerRx * 0.4;
      const innerRy = outerRy * 0.4;
      const spikes = 5;
      const step = Math.PI / spikes;
      const rot = -Math.PI / 2;
      for (let si = 0; si < spikes * 2; si++) {
        const rx = si % 2 === 0 ? outerRx : innerRx;
        const ry = si % 2 === 0 ? outerRy : innerRy;
        const angle = rot + si * step;
        const px = cx + Math.cos(angle) * rx;
        const py = cy + Math.sin(angle) * ry;
        if (si === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case "arrow": {
      const shaftH = h * 0.4;
      const headStart = w * 0.6;
      ctx.moveTo(x, y + h / 2 - shaftH / 2);
      ctx.lineTo(x + headStart, y + h / 2 - shaftH / 2);
      ctx.lineTo(x + headStart, y);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + headStart, y + h);
      ctx.lineTo(x + headStart, y + h / 2 + shaftH / 2);
      ctx.lineTo(x, y + h / 2 + shaftH / 2);
      ctx.closePath();
      break;
    }
  }
}

// ─── Multi-select utility helpers ──────────────────────────────────────────
type BBox = { x: number; y: number; w: number; h: number };

function getElementBoundingBox(
  type: string,
  el: any,
): BBox | null {
  if (type === "bubble") {
    return { x: el.x, y: el.y, w: el.width, h: el.height };
  }
  if (type === "char") {
    const rawW = el.imageEl ? el.imageEl.naturalWidth * el.scale : 80;
    const rawH = el.imageEl ? el.imageEl.naturalHeight * el.scale : 80;
    const cw = (el.width && el.height && (rawW > el.width + 1 || rawH > el.height + 1)) ? el.width : rawW;
    const ch = (el.width && el.height && (rawW > el.width + 1 || rawH > el.height + 1)) ? el.height : rawH;
    return { x: el.x - cw / 2, y: el.y - ch / 2, w: cw, h: ch };
  }
  if (type === "text") {
    return { x: el.x, y: el.y, w: el.width, h: el.height };
  }
  if (type === "line") {
    if (!el.points || el.points.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pt of el.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
    return { x: minX, y: minY, w: maxX - minX || 4, h: maxY - minY || 4 };
  }
  if (type === "drawing") {
    return { x: el.x ?? 0, y: el.y ?? 0, w: el.width ?? CANVAS_W, h: el.height ?? CANVAS_H };
  }
  if (type === "shape") {
    return { x: el.x, y: el.y, w: el.width, h: el.height };
  }
  return null;
}

function rectsIntersect(a: BBox, b: BBox): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ─── HSL color utilities ─────────────────────────────────────────────────
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

const CANVAS_W = 540;
let CANVAS_H = 675;
type CanvasRatio = "3:4" | "1:1";

function PanelCanvas({
  panel,
  onUpdate,
  selectedBubbleId,
  onSelectBubble,
  selectedCharId,
  onSelectChar,
  selectedShapeId,
  selectedTextId,
  canvasRef: externalCanvasRef,
  zoom,
  fontsReady,
  isPro,
  onEditBubble,
  onDoubleClickBubble,
  onDeletePanel,
  hideDrawingLayers,
  externalEditBubbleId,
  onEditBubbleIdChange,
  onSelectScript,
  externalEditScriptPosition,
  onEditScriptPositionChange,
  externalSelectedScriptPosition,
  isGenerating,
  canvasH,
}: {
  panel: PanelData;
  onUpdate: (updated: PanelData) => void;
  selectedBubbleId: string | null;
  onSelectBubble: (id: string | null) => void;
  selectedCharId: string | null;
  onSelectChar: (id: string | null) => void;
  selectedShapeId?: string | null;
  selectedTextId?: string | null;
  canvasRef?: (el: HTMLCanvasElement | null) => void;
  zoom?: number;
  fontsReady?: boolean;
  isPro: boolean;
  onEditBubble?: () => void;
  onDoubleClickBubble?: () => void;
  onDeletePanel?: () => void;
  hideDrawingLayers?: boolean;
  externalEditBubbleId?: string | null;
  onEditBubbleIdChange?: (id: string | null) => void;
  onSelectScript?: (position: "top" | "bottom" | null) => void;
  externalEditScriptPosition?: "top" | "bottom" | null;
  onEditScriptPositionChange?: (position: "top" | "bottom" | null) => void;
  externalSelectedScriptPosition?: "top" | "bottom" | null;
  isGenerating?: boolean;
  canvasH?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const selectedBubbleIdRef = useRef(selectedBubbleId);
  const selectedCharIdRef = useRef(selectedCharId);
  const selectedShapeIdRef = useRef(selectedShapeId);
  const selectedTextIdRef = useRef(selectedTextId);
  const panelRef = useRef(panel);
  const [editingBubbleId, setEditingBubbleId] = useState<string | null>(null);
  const editingBubbleIdRef = useRef<string | null>(null);
  const [editingScriptPos, setEditingScriptPos] = useState<"top" | "bottom" | null>(null);
  const editingScriptPosRef = useRef<"top" | "bottom" | null>(null);
  const [selectedScriptPos, setSelectedScriptPos] = useState<"top" | "bottom" | null>(null);
  const selectedScriptPosRef = useRef<"top" | "bottom" | null>(null);

  useEffect(() => {
    selectedBubbleIdRef.current = selectedBubbleId;
  }, [selectedBubbleId]);
  useEffect(() => {
    editingBubbleIdRef.current = editingBubbleId;
  }, [editingBubbleId]);
  useEffect(() => {
    editingScriptPosRef.current = editingScriptPos;
  }, [editingScriptPos]);
  useEffect(() => {
    selectedScriptPosRef.current = selectedScriptPos;
  }, [selectedScriptPos]);
  // Sync external editing trigger from overlay double-click
  useEffect(() => {
    if (externalEditBubbleId) {
      onSelectBubble(externalEditBubbleId);
      setEditingBubbleId(externalEditBubbleId);
      onEditBubbleIdChange?.(null);
    }
  }, [externalEditBubbleId, onEditBubbleIdChange, onSelectBubble]);
  // Sync external script editing trigger (from parent 상단/하단 button)
  useEffect(() => {
    if (externalEditScriptPosition) {
      setSelectedScriptPos(externalEditScriptPosition);
      setEditingScriptPos(externalEditScriptPosition);
      onSelectScript?.(externalEditScriptPosition);
      onEditScriptPositionChange?.(null);
    }
  }, [externalEditScriptPosition, onEditScriptPositionChange, onSelectScript]);
  // Sync parent's script selection → PanelCanvas internal state
  useEffect(() => {
    if (externalSelectedScriptPosition === null && selectedScriptPos !== null) {
      setSelectedScriptPos(null);
      setEditingScriptPos(null);
    }
  }, [externalSelectedScriptPosition]);
  useEffect(() => {
    selectedCharIdRef.current = selectedCharId;
  }, [selectedCharId]);
  useEffect(() => {
    selectedShapeIdRef.current = selectedShapeId;
  }, [selectedShapeId]);
  useEffect(() => {
    selectedTextIdRef.current = selectedTextId;
  }, [selectedTextId]);
  useEffect(() => {
    panelRef.current = panel;
  }, [panel]);

  const redrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const toLoad = panel.bubbles.filter(
      (b) => b.style === "image" && b.templateSrc && !b.templateImg
    );
    if (toLoad.length === 0) return;
    toLoad.forEach((b) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        b.templateImg = img;
        redrawRef.current?.();
      };
      img.src = b.templateSrc!;
    });
  }, [panel.bubbles.length]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // DPR scaling for sharp text/graphics on high-DPI screens
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(CANVAS_W * dpr);
    const targetH = Math.round(CANVAS_H * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const p = panelRef.current;
    ctx.fillStyle = p.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw background image if present
    const bgImg = p.backgroundImageEl;
    if (bgImg) {
      // Full-canvas fill with cover scaling
      const scale = Math.max(CANVAS_W / bgImg.naturalWidth, CANVAS_H / bgImg.naturalHeight);
      const sw = bgImg.naturalWidth * scale;
      const sh = bgImg.naturalHeight * scale;
      ctx.drawImage(bgImg, (CANVAS_W - sw) / 2, (CANVAS_H - sh) / 2, sw, sh);
    } else if (p.backgroundImageUrl) {
      // Fallback: try to draw from URL (will not block — imageEl loading in progress)
      const tmpImg = new Image();
      tmpImg.crossOrigin = "anonymous";
      tmpImg.src = p.backgroundImageUrl;
      if (tmpImg.complete && tmpImg.naturalWidth > 0) {
        const scale = Math.max(CANVAS_W / tmpImg.naturalWidth, CANVAS_H / tmpImg.naturalHeight);
        const sw = tmpImg.naturalWidth * scale;
        const sh = tmpImg.naturalHeight * scale;
        ctx.drawImage(tmpImg, (CANVAS_W - sw) / 2, (CANVAS_H - sh) / 2, sw, sh);
      }
    }

    const drawables: Array<
      | { type: "char"; z: number; ch: CharacterPlacement }
      | { type: "bubble"; z: number; b: SpeechBubble }
      | { type: "text"; z: number; te: CanvasTextElement }
      | { type: "line"; z: number; le: CanvasLineElement }
      | { type: "shape"; z: number; se: CanvasShapeElement }
      | { type: "drawing"; z: number; dl: DrawingLayer }
    > = [
        ...p.characters.map((ch) => ({
          type: "char" as const,
          z: ch.zIndex ?? 0,
          ch,
        })),
        ...p.bubbles.map((b) => ({
          type: "bubble" as const,
          z: b.zIndex ?? 10,
          b,
        })),
        ...(p.textElements || []).map((te) => ({
          type: "text" as const,
          z: te.zIndex ?? 20,
          te,
        })),
        ...(p.lineElements || []).map((le) => ({
          type: "line" as const,
          z: le.zIndex ?? 20,
          le,
        })),
        ...(p.shapeElements || []).map((se) => ({
          type: "shape" as const,
          z: se.zIndex ?? 20,
          se,
        })),
        ...(!hideDrawingLayers ? (p.drawingLayers || []).map((dl) => ({
          type: "drawing" as const,
          z: dl.zIndex ?? 15,
          dl,
        })) : []),
      ];
    drawables.sort((a, b) => a.z - b.z);

    // Build mask lookup: layer ID → mask shape element
    const maskLookup = new Map<string, { shapeType: string; x: number; y: number; width: number; height: number }>();
    for (const se of (p.shapeElements || [])) {
      if (se.maskEnabled && se.maskedLayerIds) {
        for (const lid of se.maskedLayerIds) {
          maskLookup.set(lid, se);
        }
      }
    }

    // Deferred selection indicators: drawn AFTER mask clip is restored
    const deferredSelections: (() => void)[] = [];

    drawables.forEach((d) => {
      // Skip invisible elements
      const isHidden =
        (d.type === "char" && d.ch.visible === false) ||
        (d.type === "bubble" && d.b.visible === false) ||
        (d.type === "text" && d.te.visible === false) ||
        (d.type === "line" && d.le.visible === false) ||
        (d.type === "shape" && d.se.visible === false) ||
        (d.type === "drawing" && !d.dl.visible);
      if (isHidden) return;

      // Get the element ID for mask lookup
      const elementId = d.type === "char" ? d.ch.id
        : d.type === "bubble" ? d.b.id
        : d.type === "text" ? d.te.id
        : d.type === "line" ? d.le.id
        : d.type === "drawing" ? d.dl.id
        : d.type === "shape" ? d.se.id
        : null;
      const maskShape = elementId ? maskLookup.get(elementId) : null;

      // If this layer is linked to a mask, apply clipping
      if (maskShape && !(d.type === "shape" && d.se.maskEnabled)) {
        ctx.save();
        buildShapePath(ctx, maskShape.shapeType as any, maskShape.x, maskShape.y, maskShape.width, maskShape.height);
        ctx.clip();
      }

      if (d.type === "text") {
        const te = d.te;
        ctx.save();
        ctx.globalAlpha = te.opacity;
        let fontStyle = "";
        if (te.italic) fontStyle += "italic ";
        if (te.bold) fontStyle += "bold ";
        fontStyle += `${te.fontSize}px `;
        fontStyle += te.fontFamily === "default" ? "sans-serif" : `"${te.fontFamily}", sans-serif`;
        ctx.font = fontStyle;
        ctx.fillStyle = te.color;
        ctx.textAlign = te.textAlign as CanvasTextAlign;
        ctx.textBaseline = "top";

        let displayText = te.text;
        if (te.textTransform === "uppercase") displayText = displayText.toUpperCase();
        else if (te.textTransform === "lowercase") displayText = displayText.toLowerCase();

        const textX =
          te.textAlign === "center"
            ? te.x + te.width / 2
            : te.textAlign === "right"
              ? te.x + te.width
              : te.x;
        const textY = te.y + 8;

        // Word wrap
        const words = displayText.split("");
        let line = "";
        let lineY = textY;
        const lineHeight = te.fontSize * 1.3;
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > te.width && line.length > 0) {
            ctx.fillText(line, textX, lineY);
            // Underline
            if (te.underline) {
              const lw = ctx.measureText(line).width;
              const lx = te.textAlign === "center" ? textX - lw / 2 : te.textAlign === "right" ? textX - lw : textX;
              ctx.fillRect(lx, lineY + te.fontSize + 1, lw, 1);
            }
            // Strikethrough
            if (te.strikethrough) {
              const lw = ctx.measureText(line).width;
              const lx = te.textAlign === "center" ? textX - lw / 2 : te.textAlign === "right" ? textX - lw : textX;
              ctx.fillRect(lx, lineY + te.fontSize / 2, lw, 1);
            }
            line = words[i];
            lineY += lineHeight;
          } else {
            line = testLine;
          }
        }
        if (line) {
          ctx.fillText(line, textX, lineY);
          if (te.underline) {
            const lw = ctx.measureText(line).width;
            const lx = te.textAlign === "center" ? textX - lw / 2 : te.textAlign === "right" ? textX - lw : textX;
            ctx.fillRect(lx, lineY + te.fontSize + 1, lw, 1);
          }
          if (te.strikethrough) {
            const lw = ctx.measureText(line).width;
            const lx = te.textAlign === "center" ? textX - lw / 2 : te.textAlign === "right" ? textX - lw : textX;
            ctx.fillRect(lx, lineY + te.fontSize / 2, lw, 1);
          }
        }

        // Selection indicator is rendered by HTML overlay (circle handles)
        ctx.restore();
      } else if (d.type === "line") {
        const le = d.le;
        ctx.save();
        ctx.globalAlpha = le.opacity;
        ctx.strokeStyle = le.color;
        ctx.lineWidth = le.strokeWidth;
        if ((le as any).borderStyle === "simple") {
          ctx.lineCap = "square";
          ctx.lineJoin = "miter";
        } else {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
        }

        // Dash pattern
        if (le.dashPattern === "dashed") ctx.setLineDash([8, 4]);
        else if (le.dashPattern === "dotted") ctx.setLineDash([2, 4]);
        else ctx.setLineDash([]);

        const pts = le.points;
        if (pts.length >= 2) {
          ctx.beginPath();
          if (le.lineType === "curved" && pts.length >= 3) {
            ctx.moveTo(pts[0].x, pts[0].y);
            if (pts.length === 3) {
              ctx.quadraticCurveTo(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
            } else {
              for (let i = 1; i < pts.length - 1; i++) {
                const midX = (pts[i].x + pts[i + 1].x) / 2;
                const midY = (pts[i].y + pts[i + 1].y) / 2;
                ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
              }
              ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
            }
          } else {
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(pts[i].x, pts[i].y);
            }
          }
          ctx.stroke();

          // Draw arrows
          const drawArrow = (from: { x: number; y: number }, to: { x: number; y: number }) => {
            const angle = Math.atan2(to.y - from.y, to.x - from.x);
            const headLen = Math.max(le.strokeWidth * 3, 8);
            ctx.beginPath();
            ctx.moveTo(to.x, to.y);
            ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(to.x, to.y);
            ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          };

          ctx.setLineDash([]);
          if (le.startArrow && pts.length >= 2) {
            drawArrow(pts[1], pts[0]);
          }
          if (le.endArrow && pts.length >= 2) {
            drawArrow(pts[pts.length - 2], pts[pts.length - 1]);
          }
        }

        ctx.setLineDash([]);
        ctx.restore();
      } else if (d.type === "shape") {
        const se = d.se;

        if (se.maskEnabled) {
          // Mask shape: only show dashed boundary + handles when selected
          if (se.id === selectedShapeIdRef.current) {
            deferredSelections.push(() => {
              ctx.save();
              ctx.globalAlpha = 0.5;
              ctx.strokeStyle = HANDLE_COLOR;
              ctx.lineWidth = 1.5;
              ctx.setLineDash([4, 4]);
              buildShapePath(ctx, se.shapeType, se.x, se.y, se.width, se.height);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.restore();

              ctx.save();
              ctx.globalAlpha = 1;
              ctx.strokeStyle = HANDLE_COLOR;
              ctx.lineWidth = 1.5;
              ctx.setLineDash([5, 4]);
              ctx.strokeRect(se.x - 3, se.y - 3, se.width + 6, se.height + 6);
              ctx.setLineDash([]);
              const hs = 8;
              const handles = [
                { x: se.x - hs / 2, y: se.y - hs / 2 },
                { x: se.x + se.width - hs / 2, y: se.y - hs / 2 },
                { x: se.x - hs / 2, y: se.y + se.height - hs / 2 },
                { x: se.x + se.width - hs / 2, y: se.y + se.height - hs / 2 },
                { x: se.x + se.width / 2 - hs / 2, y: se.y - hs / 2 },
                { x: se.x + se.width / 2 - hs / 2, y: se.y + se.height - hs / 2 },
                { x: se.x - hs / 2, y: se.y + se.height / 2 - hs / 2 },
                { x: se.x + se.width - hs / 2, y: se.y + se.height / 2 - hs / 2 },
              ];
              handles.forEach((c) => {
                ctx.beginPath();
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(c.x, c.y, hs, hs);
                ctx.strokeStyle = HANDLE_COLOR;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(c.x, c.y, hs, hs);
              });
              ctx.restore();
            });
          }
        } else {
          // Normal shape rendering
          ctx.save();
          ctx.globalAlpha = se.opacity;
          buildShapePath(ctx, se.shapeType, se.x, se.y, se.width, se.height);

          if (se.fillColor !== "transparent") {
            ctx.fillStyle = se.fillColor;
            ctx.fill();
          }
          if (se.strokeWidth > 0) {
            ctx.strokeStyle = se.strokeColor;
            ctx.lineWidth = se.strokeWidth;
            ctx.stroke();
          }

          // Selection indicator — always drawn for selected shape
          // Selection indicator is rendered by HTML overlay (circle handles)

          ctx.restore();
        }
      } else if (d.type === "drawing") {
        const dl = d.dl;
        if (dl.visible && dl.imageEl instanceof HTMLImageElement) {
          ctx.save();
          ctx.globalAlpha = dl.opacity ?? 1;
          if (dl.type === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
          }
          const dlW = dl.width ?? CANVAS_W;
          const dlH = dl.height ?? CANVAS_H;
          ctx.drawImage(dl.imageEl, dl.x ?? 0, dl.y ?? 0, dlW, dlH);
          ctx.restore();
        }
      } else if (d.type === "char") {
        const ch = d.ch;
        if (ch.imageEl instanceof HTMLImageElement) {
          const w = ch.imageEl.naturalWidth * ch.scale;
          const h = ch.imageEl.naturalHeight * ch.scale;
          const hasClip = ch.width && ch.height && (w > ch.width + 1 || h > ch.height + 1);
          ctx.save();
          if (hasClip) {
            // Clip to the cut region so cover-fit images don't overflow
            ctx.beginPath();
            ctx.rect(ch.x - ch.width! / 2, ch.y - ch.height! / 2, ch.width!, ch.height!);
            ctx.clip();
          }
          ctx.translate(ch.x, ch.y);
          ctx.rotate(ch.rotation || 0);
          ctx.scale(ch.flipX ? -1 : 1, ch.flipY ? -1 : 1);
          ctx.drawImage(ch.imageEl, -w / 2, -h / 2, w, h);
          ctx.restore();

          // Selection indicator for selected character — use clip dimensions if available
          const displayW = hasClip ? ch.width! : w;
          const displayH = hasClip ? ch.height! : h;
          // Selection indicator is rendered by HTML overlay (circle handles)
        } else if (ch.imageUrl) {
          // Show loading placeholder while imageEl is loading
          const ph = 80;
          ctx.save();
          ctx.translate(ch.x, ch.y);
          ctx.rotate(ch.rotation || 0);
          ctx.beginPath();
          ctx.roundRect(-ph/2, -ph/2, ph, ph, 8);
          ctx.fillStyle = "rgba(200,220,240,0.6)";
          ctx.fill();
          ctx.strokeStyle = HANDLE_COLOR;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#888";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("로딩 중...", 0, 0);
          ctx.restore();
        } else if (!ch.imageUrl) {
          // Loading placeholder — full canvas overlay while AI generates
          ctx.save();
          ctx.fillStyle = "rgba(235,240,255,0.85)";
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          ctx.font = "bold 18px sans-serif";
          ctx.fillStyle = "hsl(220,60%,55%)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🎨 이미지 생성 중...", CANVAS_W / 2, CANVAS_H / 2 - 16);
          ctx.font = "13px sans-serif";
          ctx.fillStyle = "hsl(220,40%,60%)";
          ctx.fillText("잠시만 기다려주세요", CANVAS_W / 2, CANVAS_H / 2 + 14);
          ctx.restore();
        }
      } else {
        const b = d.b;
        const renderB = b.id === editingBubbleIdRef.current ? { ...b, text: "" } : b;
        drawBubble(ctx, renderB, b.id === selectedBubbleIdRef.current);
      }

      // Restore clip if this layer was masked
      if (maskShape && !(d.type === "shape" && d.se.maskEnabled)) {
        ctx.restore();
      }
    });

    // Draw deferred selection indicators (outside mask clip regions)
    deferredSelections.forEach(fn => fn());

    if (p.topScript && p.topScript.visible !== false)
      drawScriptOverlay(ctx, p.topScript, "top", CANVAS_W, CANVAS_H, selectedScriptPos === "top" || editingScriptPos === "top");
    if (p.bottomScript && p.bottomScript.visible !== false)
      drawScriptOverlay(ctx, p.bottomScript, "bottom", CANVAS_W, CANVAS_H, selectedScriptPos === "bottom" || editingScriptPos === "bottom");
    if (!isPro) {
      ctx.save();
      ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
      ctx.rotate(-Math.PI / 8);
      ctx.font = "36px sans-serif";
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("OLLI Free", 0, 0);
      ctx.restore();
    }

    // 이미지 생성 중 오버레이
    if (isGenerating) {
      ctx.save();
      ctx.fillStyle = "rgba(235,240,255,0.85)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.font = "bold 18px sans-serif";
      ctx.fillStyle = "hsl(220,60%,55%)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🎨 이미지 생성 중...", CANVAS_W / 2, CANVAS_H / 2 - 16);
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "hsl(220,40%,60%)";
      ctx.fillText("잠시만 기다려주세요", CANVAS_W / 2, CANVAS_H / 2 + 14);
      ctx.restore();
    }
  }, [isPro, hideDrawingLayers, isGenerating, selectedScriptPos]);

  redrawRef.current = redraw;

  useEffect(() => {
    const raf = requestAnimationFrame(() => redraw());
    return () => cancelAnimationFrame(raf);
  }, [panel, selectedBubbleId, selectedCharId, selectedShapeId, selectedTextId, editingBubbleId, redraw, fontsReady, hideDrawingLayers, isGenerating, canvasH]);

  const updateBubbleInPanel = useCallback(
    (bubbleId: string, updates: Partial<SpeechBubble>) => {
      const p = panelRef.current;
      const newBubbles = p.bubbles.map((b) =>
        b.id === bubbleId ? { ...b, ...updates } : b,
      );
      onUpdate({ ...p, bubbles: newBubbles });
    },
    [onUpdate],
  );

  const updateCharInPanel = useCallback(
    (charId: string, updates: Partial<CharacterPlacement>) => {
      const p = panelRef.current;
      const newChars = p.characters.map((c) =>
        c.id === charId ? { ...c, ...updates } : c,
      );
      onUpdate({ ...p, characters: newChars });
    },
    [onUpdate],
  );

  const hasZoom = zoom !== undefined;
  const zoomScale = (zoom ?? 100) / 100;
  const hasSelection =
    !!selectedBubbleIdRef.current ||
    !!selectedCharIdRef.current;

  const handleDeleteSelection = useCallback(() => {
    const p = panelRef.current;
    const sid = selectedBubbleIdRef.current;
    const cid = selectedCharIdRef.current;
    if (sid) {
      const newBubbles = p.bubbles.filter((b) => b.id !== sid);
      onUpdate({ ...p, bubbles: newBubbles });
      onSelectBubble(null);
      selectedBubbleIdRef.current = null;
    } else if (cid) {
      const newChars = p.characters.filter((c) => c.id !== cid);
      onUpdate({ ...p, characters: newChars });
      onSelectChar(null);
      selectedCharIdRef.current = null;
    }
  }, [onUpdate, onSelectBubble, onSelectChar]);

  const handleDuplicateSelection = useCallback(() => {
    const p = panelRef.current;
    const sid = selectedBubbleIdRef.current;
    const cid = selectedCharIdRef.current;
    if (sid) {
      const b = p.bubbles.find((x) => x.id === sid);
      if (!b) return;
      const maxZ = p.bubbles.reduce((m, cur) => Math.max(m, cur.zIndex ?? 0), 0);
      const duplicated: SpeechBubble = {
        ...b,
        id: generateId(),
        x: b.x + 24,
        y: b.y + 24,
        zIndex: maxZ + 1,
      };
      onUpdate({ ...p, bubbles: [...p.bubbles, duplicated] });
      onSelectBubble(duplicated.id);
      onSelectChar(null);
      selectedBubbleIdRef.current = duplicated.id;
      selectedCharIdRef.current = null;
    } else if (cid) {
      const ch = p.characters.find((x) => x.id === cid);
      if (!ch) return;
      const maxZ = p.characters.reduce((m, cur) => Math.max(m, cur.zIndex ?? 0), 0);
      const duplicated: CharacterPlacement = {
        ...ch,
        id: generateId(),
        x: ch.x + 24,
        y: ch.y + 24,
        zIndex: maxZ + 1,
      };
      onUpdate({ ...p, characters: [...p.characters, duplicated] });
      onSelectChar(duplicated.id);
      onSelectBubble(null);
      selectedCharIdRef.current = duplicated.id;
      selectedBubbleIdRef.current = null;
    }
  }, [onUpdate, onSelectBubble, onSelectChar]);

  const handleBringToFront = useCallback(() => {
    const p = panelRef.current;
    const sid = selectedBubbleIdRef.current;
    const cid = selectedCharIdRef.current;
    if (sid) {
      const maxZ = p.bubbles.reduce((m, cur) => Math.max(m, cur.zIndex ?? 0), 0);
      updateBubbleInPanel(sid, { zIndex: maxZ + 1 });
    } else if (cid) {
      const maxZ = p.characters.reduce((m, cur) => Math.max(m, cur.zIndex ?? 0), 0);
      updateCharInPanel(cid, { zIndex: maxZ + 1 });
    }
  }, [updateBubbleInPanel, updateCharInPanel]);

  const handleSendToBack = useCallback(() => {
    const p = panelRef.current;
    const sid = selectedBubbleIdRef.current;
    const cid = selectedCharIdRef.current;
    if (sid) {
      const minZ = p.bubbles.reduce((m, cur) => Math.min(m, cur.zIndex ?? 0), 0);
      updateBubbleInPanel(sid, { zIndex: minZ - 1 });
    } else if (cid) {
      const minZ = p.characters.reduce((m, cur) => Math.min(m, cur.zIndex ?? 0), 0);
      updateCharInPanel(cid, { zIndex: minZ - 1 });
    }
  }, [updateBubbleInPanel, updateCharInPanel]);

  const handleBringForward = useCallback(() => {
    const p = panelRef.current;
    const sid = selectedBubbleIdRef.current;
    const cid = selectedCharIdRef.current;
    const selectedId = sid || cid;
    if (!selectedId) return;
    // Build combined sorted list (asc z)
    const list: Array<{ id: string; type: "bubble" | "char"; z: number }> = [
      ...p.bubbles.map((b) => ({ id: b.id, type: "bubble" as const, z: b.zIndex ?? 0 })),
      ...p.characters.map((c) => ({ id: c.id, type: "char" as const, z: c.zIndex ?? 0 })),
    ].sort((a, b) => a.z - b.z);
    const idx = list.findIndex((x) => x.id === selectedId);
    if (idx < 0 || idx >= list.length - 1) return;
    const cur = list[idx];
    const nxt = list[idx + 1];
    // Swap their z values (ensure distinct)
    const zHigh = Math.max(cur.z, nxt.z) + 1;
    const zLow = zHigh - 1;
    const updates: Array<{ id: string; type: "bubble" | "char"; z: number }> = [
      { ...cur, z: zHigh }, { ...nxt, z: zLow }
    ];
    // Apply all in one panel update
    const newPanel = {
      ...p,
      bubbles: p.bubbles.map((b) => {
        const u = updates.find((x) => x.type === "bubble" && x.id === b.id);
        return u ? { ...b, zIndex: u.z } : b;
      }),
      characters: p.characters.map((c) => {
        const u = updates.find((x) => x.type === "char" && x.id === c.id);
        return u ? { ...c, zIndex: u.z } : c;
      }),
    };
    panelRef.current = newPanel;
    onUpdate(newPanel);
  }, [onUpdate]);

  const handleSendBackward = useCallback(() => {
    const p = panelRef.current;
    const sid = selectedBubbleIdRef.current;
    const cid = selectedCharIdRef.current;
    const selectedId = sid || cid;
    if (!selectedId) return;
    const list: Array<{ id: string; type: "bubble" | "char"; z: number }> = [
      ...p.bubbles.map((b) => ({ id: b.id, type: "bubble" as const, z: b.zIndex ?? 0 })),
      ...p.characters.map((c) => ({ id: c.id, type: "char" as const, z: c.zIndex ?? 0 })),
    ].sort((a, b) => a.z - b.z);
    const idx = list.findIndex((x) => x.id === selectedId);
    if (idx <= 0) return;
    const cur = list[idx];
    const prv = list[idx - 1];
    const zHigh = Math.max(cur.z, prv.z) + 1;
    const zLow = zHigh - 1;
    const updates: Array<{ id: string; type: "bubble" | "char"; z: number }> = [
      { ...cur, z: zLow }, { ...prv, z: zHigh }
    ];
    const newPanel = {
      ...p,
      bubbles: p.bubbles.map((b) => {
        const u = updates.find((x) => x.type === "bubble" && x.id === b.id);
        return u ? { ...b, zIndex: u.z } : b;
      }),
      characters: p.characters.map((c) => {
        const u = updates.find((x) => x.type === "char" && x.id === c.id);
        return u ? { ...c, zIndex: u.z } : c;
      }),
    };
    panelRef.current = newPanel;
    onUpdate(newPanel);
  }, [onUpdate]);

  const handleLock = useCallback(() => {
    const sid = selectedBubbleIdRef.current;
    const cid = selectedCharIdRef.current;
    if (sid) {
      const b = panelRef.current.bubbles.find((b) => b.id === sid);
      if (b) updateBubbleInPanel(sid, { locked: !b.locked });
    } else if (cid) {
      const c = panelRef.current.characters.find((c) => c.id === cid);
      if (c) updateCharInPanel(cid, { locked: !c.locked });
    }
  }, [updateBubbleInPanel, updateCharInPanel]);

  const handleRotateSelection = useCallback(() => {
    const cid = selectedCharIdRef.current;
    if (!cid) return;
    const p = panelRef.current;
    const c = p.characters.find((ch) => ch.id === cid);
    if (!c) return;
    const next = (c.rotation || 0) + Math.PI / 12;
    updateCharInPanel(cid, { rotation: next });
  }, [updateCharInPanel]);

  const handleFlipCharX = useCallback(() => {
    const cid = selectedCharIdRef.current;
    if (!cid) return;
    const p = panelRef.current;
    const c = p.characters.find((ch) => ch.id === cid);
    if (!c) return;
    updateCharInPanel(cid, { flipX: !c.flipX });
  }, [updateCharInPanel]);

  const handleCopy = useCallback(() => {
    const sid = selectedBubbleIdRef.current;
    const cid = selectedCharIdRef.current;
    if (sid) {
      const b = panelRef.current.bubbles.find((b) => b.id === sid);
      if (b) {
        localStorage.setItem("olli_clipboard", JSON.stringify({ type: "bubble", data: b }));
        toast({ title: "복사됨", description: "말풍선이 복사되었습니다." });
      }
    } else if (cid) {
      const c = panelRef.current.characters.find((c) => c.id === cid);
      if (c) {
        localStorage.setItem("olli_clipboard", JSON.stringify({ type: "char", data: c }));
        toast({ title: "복사됨", description: "캐릭터가 복사되었습니다." });
      }
    }
  }, [toast]);

  const handlePaste = useCallback(() => {
    try {
      const clip = localStorage.getItem("olli_clipboard");
      if (!clip) return;
      const parsed = JSON.parse(clip);
      if (parsed.type === "bubble") {
        const b = parsed.data as SpeechBubble;
        const newB: SpeechBubble = {
          ...b,
          id: generateId(),
          x: b.x + 20,
          y: b.y + 20,
          zIndex: (panelRef.current.bubbles.length > 0 ? Math.max(...panelRef.current.bubbles.map(x => x.zIndex || 0)) : 10) + 1,
        };
        onUpdate({
          ...panelRef.current,
          bubbles: [...panelRef.current.bubbles, newB],
        });
        onSelectBubble(newB.id);
        onSelectChar(null);
      } else if (parsed.type === "char") {
        const c = parsed.data as CharacterPlacement;
        const newC: CharacterPlacement = {
          ...c,
          id: generateId(),
          x: c.x + 20,
          y: c.y + 20,
          zIndex: (panelRef.current.characters.length > 0 ? Math.max(...panelRef.current.characters.map(x => x.zIndex || 0)) : 0) + 1,
        };
        onUpdate({
          ...panelRef.current,
          characters: [...panelRef.current.characters, newC],
        });
        onSelectChar(newC.id);
        onSelectBubble(null);
      }
      toast({ title: "붙여넣기 완료" });
    } catch (e) {
      console.error(e);
    }
  }, [onUpdate, onSelectBubble, onSelectChar, toast]);

  const onDeletePanelRef = useRef(onDeletePanel);
  onDeletePanelRef.current = onDeletePanel;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (hasSelection) {
          e.preventDefault();
          handleDeleteSelection();
        } else if (onDeletePanelRef.current) {
          e.preventDefault();
          onDeletePanelRef.current();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "]" || e.key === "[")) {
        e.preventDefault();
        if (e.key === "]") {
          handleBringForward();
        } else {
          handleSendBackward();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDeleteSelection, handleBringForward, handleSendBackward]);

  // Auto-enter bubble edit mode on printable key press
  const pendingCharRef = useRef<string | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (editingBubbleIdRef.current) return;
      if (!selectedBubbleIdRef.current) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1) {
        e.preventDefault();
        pendingCharRef.current = e.key;
        setEditingBubbleId(selectedBubbleIdRef.current);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={canvasWrapperRef}
          className="relative inline-block shrink-0"
          style={
            hasZoom
              ? {
                width: CANVAS_W * zoomScale,
                height: CANVAS_H * zoomScale,
                overflow: "visible",
              }
              : { overflow: "visible" }
          }
        >
          <canvas
            ref={(el) => {
              (canvasRef as any).current = el;
              externalCanvasRef?.(el);
            }}
            width={CANVAS_W}
            height={CANVAS_H}
            style={
              hasZoom
                ? {
                  width: "100%",
                  height: "100%",
                  display: "block",
                  touchAction: "none",
                }
                : {
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  touchAction: "none",
                }
            }
            className="rounded-md border border-border"
            data-testid="panel-canvas"
          />

          {/* Inline text editing overlay for bubbles */}
          {editingBubbleId && (() => {
            const b = panel.bubbles.find(bb => bb.id === editingBubbleId);
            if (!b) return null;
            const canvas = canvasRef.current;
            if (!canvas) return null;
            const rect = canvas.getBoundingClientRect();
            const sx = rect.width / CANVAS_W;
            const sy = rect.height / CANVAS_H;
            return (
              <textarea
                autoFocus
                ref={(el) => {
                  if (el && pendingCharRef.current !== null) {
                    const ch = pendingCharRef.current;
                    pendingCharRef.current = null;
                    const newText = b.text + ch;
                    updateBubbleInPanel(b.id, { text: newText });
                    requestAnimationFrame(() => {
                      el.selectionStart = el.selectionEnd = newText.length;
                    });
                  }
                }}
                value={b.text}
                onChange={(e) => {
                  updateBubbleInPanel(b.id, { text: e.target.value });
                }}
                onBlur={() => setEditingBubbleId(null)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") {
                    setEditingBubbleId(null);
                  }
                }}
                style={{
                  position: "absolute",
                  left: b.x * sx,
                  top: b.y * sy,
                  width: b.width * sx,
                  height: b.height * sy,
                  fontSize: b.fontSize * sx,
                  fontFamily: getFontFamily(b.fontKey),
                  textAlign: "center",
                  color: b.strokeColor || "#222222",
                  background: "rgba(255,255,255,0.85)",
                  border: "2px solid hsl(var(--primary))",
                  borderRadius: 6,
                  padding: "4px",
                  resize: "none",
                  outline: "none",
                  zIndex: 30,
                  overflow: "hidden",
                  lineHeight: 1.3,
                  boxSizing: "border-box",
                }}
              />
            );
          })()}
          {/* Script inline editing overlay */}
          {editingScriptPos && (() => {
            const sd = editingScriptPos === "top" ? panel.topScript : panel.bottomScript;
            if (!sd) return null;
            const canvas = canvasRef.current;
            if (!canvas) return null;
            const canvasRect = canvas.getBoundingClientRect();
            const sx = canvasRect.width / CANVAS_W;
            const sy = canvasRect.height / CANVAS_H;
            const ctx = canvas.getContext("2d");
            if (!ctx) return null;
            const sr = getScriptRect(ctx, sd, editingScriptPos, CANVAS_W, CANVAS_H);
            const fs = sd.fontSize || 16;
            return (
              <textarea
                autoFocus
                value={sd.text}
                onChange={(e) => {
                  const key = editingScriptPos === "top" ? "topScript" : "bottomScript";
                  onUpdate({ ...panel, [key]: { ...sd, text: e.target.value } });
                }}
                onBlur={() => setEditingScriptPos(null)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") {
                    setEditingScriptPos(null);
                  }
                }}
                style={{
                  position: "absolute",
                  left: sr.bx * sx,
                  top: sr.by * sy,
                  width: Math.max(sr.bw * sx, 120),
                  minHeight: Math.max(sr.bh * sy, 36),
                  fontSize: fs * sx,
                  fontFamily: getFontFamily(sd.fontKey || "default"),
                  fontWeight: sd.bold !== false ? "bold" : "normal",
                  textAlign: "center",
                  color: sd.textColor || "#1a1a1a",
                  background: "rgba(255,255,255,0.9)",
                  border: "2px solid hsl(var(--primary))",
                  borderRadius: 6,
                  padding: `${sr.padY * sy}px ${sr.padX * sx}px`,
                  resize: "none",
                  outline: "none",
                  zIndex: 30,
                  overflow: "hidden",
                  lineHeight: 1.35,
                  boxSizing: "border-box",
                }}
              />
            );
          })()}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={handleCopy}>복사</ContextMenuItem>
        <ContextMenuItem onSelect={handlePaste}>붙여넣기</ContextMenuItem>
        <ContextMenuItem onSelect={handleDuplicateSelection}>복제</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleBringForward}>레이어 앞으로</ContextMenuItem>
        <ContextMenuItem onSelect={handleSendBackward}>레이어 뒤로</ContextMenuItem>
        <ContextMenuItem onSelect={handleBringToFront}>맨 앞으로 가져오기</ContextMenuItem>
        <ContextMenuItem onSelect={handleSendToBack}>맨 뒤로 보내기</ContextMenuItem>
        <ContextMenuItem onSelect={handleRotateSelection}>회전</ContextMenuItem>
        <ContextMenuItem onSelect={handleFlipCharX} disabled={!selectedCharIdRef.current}>좌우 반전</ContextMenuItem>
        <ContextMenuItem onSelect={handleLock}>
          {selectedBubbleId && panel.bubbles.find(b => b.id === selectedBubbleId)?.locked ? "잠금 해제" :
            selectedCharId && panel.characters.find(c => c.id === selectedCharId)?.locked ? "잠금 해제" : "잠금"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive" onSelect={handleDeleteSelection}>
          삭제
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function EditorPanel({
  panel,
  index,
  total,
  onUpdate,
  onRemove,
  galleryImages,
  galleryLoading,
  galleryHasMore,
  onLoadMoreGallery,
  fetchFullGeneration,
  selectedBubbleId,
  setSelectedBubbleId,
  selectedCharId,
  setSelectedCharId,
  creatorTier,
  isPro,
  mode = "image",
  bubbleTextareaRef,
  forceRerender,
  characterFolders = [],
  activeGalleryFolderId = null,
  setActiveGalleryFolderId,
  markChecklistDone,
}: {
  panel: PanelData;
  index: number;
  total: number;
  onUpdate: (updated: PanelData) => void;
  onRemove: () => void;
  galleryImages: GenerationLight[];
  galleryLoading: boolean;
  galleryHasMore: boolean;
  onLoadMoreGallery: () => void;
  fetchFullGeneration: (id: number) => Promise<Generation | null>;
  selectedBubbleId: string | null;
  setSelectedBubbleId: (id: string | null) => void;
  selectedCharId: string | null;
  setSelectedCharId: (id: string | null) => void;
  creatorTier: number;
  isPro: boolean;
  mode?: "image" | "bubble" | "template";
  bubbleTextareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  forceRerender?: () => void;
  characterFolders?: { id: number; name: string; items: { generationId: number }[] }[];
  activeGalleryFolderId?: number | null;
  setActiveGalleryFolderId?: (id: number | null) => void;
  markChecklistDone?: (id: string) => void;
}) {
  const [showCharPicker, setShowCharPicker] = useState(false);
  const isTemplateMode = mode === "template";
  const [showBubbleTemplatePicker, setShowBubbleTemplatePicker] = useState(isTemplateMode);
  const [templateCatIdx, setTemplateCatIdx] = useState(0);
  const [removingBg, setRemovingBg] = useState(false);
  const [selectedGalleryIds, setSelectedGalleryIds] = useState<Set<number>>(new Set());
  const [addingFromGallery, setAddingFromGallery] = useState(false);
  const { toast } = useToast();

  const canBubbleEdit = true;
  const canAllFonts = isPro || creatorTier >= 3;
  const availableFonts = canAllFonts ? KOREAN_FONTS : KOREAN_FONTS.slice(0, 3);

  const selectedBubble =
    panel.bubbles.find((b) => b.id === selectedBubbleId) || null;
  const selectedChar =
    panel.characters.find((c) => c.id === selectedCharId) || null;

  const getDailyKey = (feature: string) => {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `daily_${feature}_${y}${m}${day}`;
  };
  const getDailyCount = (feature: string) => {
    const key = getDailyKey(feature);
    const raw = localStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  };
  const incDailyCount = (feature: string) => {
    const key = getDailyKey(feature);
    const n = getDailyCount(feature) + 1;
    localStorage.setItem(key, String(n));
  };

  const updateBubble = (id: string, updates: Partial<SpeechBubble>) => {
    onUpdate({
      ...panel,
      bubbles: panel.bubbles.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    });
  };

  const handleFlipTailHorizontally = () => {
    if (!selectedBubble) return;
    const b = selectedBubble;
    if (b.tailStyle === "none") return;

    const cx = b.x + b.width / 2;
    const defaultTip = getDefaultTailTip(b);
    const origTipX = b.tailTipX ?? defaultTip?.x ?? cx;
    const origTipY = b.tailTipY ?? defaultTip?.y ?? (b.y + b.height);

    const updates: Partial<SpeechBubble> = {
      tailTipX: 2 * cx - origTipX,
      tailTipY: origTipY,
    };

    if (typeof b.tailCtrl1X === "number" && typeof b.tailCtrl1Y === "number") {
      updates.tailCtrl1X = 2 * cx - b.tailCtrl1X;
      updates.tailCtrl1Y = b.tailCtrl1Y;
    }
    if (typeof b.tailCtrl2X === "number" && typeof b.tailCtrl2Y === "number") {
      updates.tailCtrl2X = 2 * cx - b.tailCtrl2X;
      updates.tailCtrl2Y = b.tailCtrl2Y;
    }
    if (typeof b.tailCtrl3X === "number" && typeof b.tailCtrl3Y === "number") {
      updates.tailCtrl3X = 2 * cx - b.tailCtrl3X;
      updates.tailCtrl3Y = b.tailCtrl3Y;
    }
    if (typeof b.tailCtrl4X === "number" && typeof b.tailCtrl4Y === "number") {
      updates.tailCtrl4X = 2 * cx - b.tailCtrl4X;
      updates.tailCtrl4Y = b.tailCtrl4Y;
    }

    updateBubble(b.id, updates);
  };

  const addBubble = () => {
    if (!canBubbleEdit) return;
    if (panel.bubbles.length >= 5) return;
    const newB = createBubble(CANVAS_W, CANVAS_H);
    onUpdate({ ...panel, bubbles: [...panel.bubbles, newB] });
    setSelectedBubbleId(newB.id);
    setSelectedCharId(null);
    markChecklistDone?.("add-bubble");
  };

  const deleteBubble = (id: string) => {
    onUpdate({ ...panel, bubbles: panel.bubbles.filter((b) => b.id !== id) });
    if (selectedBubbleId === id) setSelectedBubbleId(null);
  };

  const addBubbleTemplate = (templatePath: string) => {
    if (!canBubbleEdit) return;
    if (panel.bubbles.length >= 5) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxDim = Math.min(CANVAS_W, CANVAS_H) * 0.4;
      const aspect = img.width / img.height;
      let w: number, h: number;
      if (aspect > 1) { w = maxDim; h = maxDim / aspect; }
      else { h = maxDim; w = maxDim * aspect; }
      const newB: SpeechBubble = {
        id: generateId(),
        seed: Math.floor(Math.random() * 100000),
        x: CANVAS_W / 2 - w / 2,
        y: CANVAS_H / 2 - h / 2,
        width: w,
        height: h,
        text: "",
        style: "image",
        tailStyle: "none",
        tailDirection: "bottom",
        strokeWidth: 2,
        wobble: 5,
        fontSize: 15,
        fontKey: "default",
        templateSrc: templatePath,
        templateImg: img,
      };
      onUpdate({ ...panel, bubbles: [...panel.bubbles, newB] });
      setSelectedBubbleId(newB.id);
      setSelectedCharId(null);
      setShowBubbleTemplatePicker(false);
      toast({ title: "말풍선 추가됨" });
      markChecklistDone?.("apply-template");
    };
    img.onerror = () => toast({ title: "템플릿 로드 실패", variant: "destructive" });
    img.src = templatePath;
  };

  const addCharacter = async (gen: GenerationLight) => {
    const full = await fetchFullGeneration(gen.id);
    if (!full) return;
    const url = full.resultImageUrl;
    // 이미지를 먼저 로드한 후 캔버스에 추가 (로딩 중 표시 없이 즉시 표시)
    const loadImg = (src: string, useCors: boolean): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        if (useCors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = src;
      });
    let img: HTMLImageElement;
    try {
      img = await loadImg(url, true);
    } catch {
      try { img = await loadImg(url, false); } catch { return; }
    }
    const maxDim = 150;
    const s = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1);
    const charId = generateId();
    const maxZ = panel.characters.reduce((m, c) => Math.max(m, c.zIndex ?? 0), 0);
    onUpdate({ ...panel, characters: [...panel.characters, {
      id: charId, imageUrl: url, x: CANVAS_W / 2, y: CANVAS_H / 2,
      scale: s, imageEl: img, zIndex: maxZ + 1,
    }] });
    setSelectedCharId(charId);
    setSelectedBubbleId(null);
    markChecklistDone?.("add-image");

    // 백그라운드에서 AI 캐릭터 이름 분석
    apiRequest("POST", "/api/analyze-character", { imageUrl: url })
      .then((res) => res.json())
      .then((data) => {
        if (data.names?.[0]) {
          const p = panelRef.current;
          onUpdate({
            ...p,
            characters: p.characters.map((c) =>
              c.id === charId ? { ...c, name: data.names[0] } : c
            ),
          });
        }
      })
      .catch(() => { /* 분석 실패 시 기본 이름 유지 */ });
  };

  const toggleGallerySelect = (genId: number) => {
    setSelectedGalleryIds((prev) => {
      const next = new Set(prev);
      if (next.has(genId)) next.delete(genId);
      else next.add(genId);
      return next;
    });
  };

  const addSelectedFromGallery = async () => {
    if (selectedGalleryIds.size === 0) return;
    setAddingFromGallery(true);
    const ids = Array.from(selectedGalleryIds);
    for (const genId of ids) {
      const gen = galleryImages.find((g) => g.id === genId);
      if (gen) await addCharacter(gen);
    }
    setSelectedGalleryIds(new Set());
    setAddingFromGallery(false);
  };

  const removeCharacter = (id: string) => {
    onUpdate({
      ...panel,
      characters: panel.characters.filter((c) => c.id !== id),
    });
    if (selectedCharId === id) setSelectedCharId(null);
  };

  const charImages = galleryImages;

  const layerItems = useMemo(() => {
    const items: Array<
      | { type: "char"; id: string; z: number; label: string; thumb?: string }
      | { type: "bubble"; id: string; z: number; label: string; thumb?: string }
    > = [
        ...panel.characters.map((c) => ({
          type: "char" as const,
          id: c.id,
          z: c.zIndex ?? 0,
          label: c.name || "캐릭터",
          thumb: c.imageUrl,
        })),
        ...panel.bubbles.map((b, i) => ({
          type: "bubble" as const,
          id: b.id,
          z: b.zIndex ?? 10,
          label: b.text || STYLE_LABELS[b.style] || `말풍선 ${i + 1}`,
          thumb: b.style === "image" && (b as any).templateSrc ? (b as any).templateSrc : undefined,
        })),
      ];
    return items.sort((a, b) => b.z - a.z);
  }, [panel.characters, panel.bubbles]);

  const [dragLayerIdx, setDragLayerIdx] = useState<number | null>(null);

  // applyLayerOrder MUST be defined before moveLayer (which calls it)
  const applyLayerOrder = useCallback((ordered: Array<{ type: "char" | "bubble"; id: string }>) => {
    // layerItems is displayed high→low (index 0 = topmost layer).
    // zIndex: ordered[0] → highest = ordered.length-1, ordered[n-1] → lowest = 0
    const n = ordered.length;
    onUpdate({
      ...panel,
      characters: panel.characters.map((c) => {
        const idx = ordered.findIndex((it) => it.type === "char" && it.id === c.id);
        return idx >= 0 ? { ...c, zIndex: n - 1 - idx } : c;
      }),
      bubbles: panel.bubbles.map((b) => {
        const idx = ordered.findIndex((it) => it.type === "bubble" && it.id === b.id);
        return idx >= 0 ? { ...b, zIndex: n - 1 - idx } : b;
      }),
    });
  }, [panel, onUpdate]);

  const moveLayer = useCallback((index: number, direction: "up" | "down") => {
    const items = layerItems;
    if (direction === "up" && index <= 0) return;
    if (direction === "down" && index >= items.length - 1) return;
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    // Swap the two items, then reassign ALL zIndexes via applyLayerOrder
    // This avoids duplicate/collision zIndex values
    const newOrder = items.map((li) => ({ type: li.type as "char" | "bubble", id: li.id }));
    const tmp = newOrder[index];
    newOrder[index] = newOrder[swapIdx];
    newOrder[swapIdx] = tmp;
    applyLayerOrder(newOrder);
  }, [layerItems, applyLayerOrder]);

  const isImageMode = mode === "image";
  const isBubbleMode = mode === "bubble";

  const didAutoSelect = useRef(false);
  useEffect(() => {
    if (!isBubbleMode) { didAutoSelect.current = false; return; }
    if (didAutoSelect.current) return;
    if (panel.bubbles.length === 0) {
      const newB = createBubble(CANVAS_W, CANVAS_H);
      onUpdate({ ...panel, bubbles: [newB] });
      setSelectedBubbleId(newB.id);
    } else if (!panel.bubbles.find((b) => b.id === selectedBubbleId)) {
      setSelectedBubbleId(panel.bubbles[0].id);
    }
    didAutoSelect.current = true;
  }, [isBubbleMode, panel.bubbles, selectedBubbleId, setSelectedBubbleId]);

  const handleRemoveBackground = async () => {
    if (!selectedChar) return;
    if (!isPro) {
      toast({
        title: "Pro 전용 기능",
        description: "배경제거는 Pro 멤버십 전용 기능입니다.",
        variant: "destructive",
      });
      return;
    }
    try {
      setRemovingBg(true);
      const res = await apiRequest("POST", "/api/remove-background", {
        sourceImageData: selectedChar.imageUrl,
      });
      const data = await res.json();
      const imageUrl = data.imageUrl as string;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const updatedChars = panel.characters.map((c) =>
          c.id === selectedChar.id ? { ...c, imageUrl, imageEl: img } : c,
        );
        onUpdate({ ...panel, characters: updatedChars });
        toast({ title: "배경 제거 완료" });
      };
      img.src = imageUrl;
    } catch (error: any) {
      toast({
        title: "배경 제거 실패",
        description: error?.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setRemovingBg(false);
    }
  };

  const handleLocalImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result;
        if (typeof src !== "string") return;
        const img = new Image();
        img.onload = () => {
          // Scale to fill canvas (cover scaling)
          const s = Math.max(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
          const newChar: CharacterPlacement = {
            id: generateId(),
            imageUrl: src,
            x: CANVAS_W / 2,
            y: CANVAS_H / 2,
            scale: s,
            imageEl: img,
            zIndex: 0,
          };
          onUpdate({
            ...panel,
            characters: [...panel.characters, newChar],
          });
          setSelectedCharId(newChar.id);
          setSelectedBubbleId(null);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
    setShowCharPicker(false);
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        onUpdate({ ...panel, backgroundImageUrl: src, backgroundImageEl: img });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundFromGallery = async (gen: GenerationLight) => {
    const full = await fetchFullGeneration(gen.id);
    if (!full) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      onUpdate({ ...panel, backgroundImageUrl: full.resultImageUrl, backgroundImageEl: img });
    };
    img.onerror = () => {
      // crossOrigin 제거 후 재시도
      const retry = new Image();
      retry.onload = () => {
        onUpdate({ ...panel, backgroundImageUrl: full.resultImageUrl, backgroundImageEl: retry });
      };
      retry.onerror = () => console.warn("Background gallery image load failed");
      retry.src = full.resultImageUrl;
    };
    img.src = full.resultImageUrl;
  };

  return (
    <div className="space-y-5" data-testid={`panel-editor-${index}`}>
      {
        (isBubbleMode || isTemplateMode) && showBubbleTemplatePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBubbleTemplatePicker(false)} data-testid="modal-story-template-picker">
            <Card className="w-full max-w-lg max-h-[70vh] flex flex-col m-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border flex-wrap">
                <h3 className="text-sm font-semibold">말풍선 템플릿</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowBubbleTemplatePicker(false)} data-testid="button-close-story-templates">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-1.5 px-4 pt-3 pb-1 overflow-x-auto flex-wrap">
                {BUBBLE_TEMPLATE_CATEGORIES.map((cat, ci) => (
                  <Badge
                    key={ci}
                    className={`cursor-pointer shrink-0 toggle-elevate ${ci === templateCatIdx ? "toggle-elevated" : ""}`}
                    variant={ci === templateCatIdx ? "default" : "outline"}
                    onClick={() => setTemplateCatIdx(ci)}
                    data-testid={`badge-story-template-cat-${ci}`}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
              <div className="overflow-y-auto p-4 flex-1">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {BUBBLE_TEMPLATE_CATEGORIES[templateCatIdx]?.ids.map((id) => {
                    const path = bubblePath(id);
                    return (
                      <div
                        key={id}
                        className="aspect-square rounded-md border border-border overflow-hidden cursor-pointer hover-elevate bg-muted/30 p-1.5"
                        onClick={() => addBubbleTemplate(path)}
                        data-testid={`story-template-item-${id}`}
                      >
                        <img src={path} alt={`말풍선 ${id}`} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )
      }

      {isBubbleMode && (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          disabled={panel.bubbles.length >= 5}
          onClick={() => {
            const newB = createBubble(CANVAS_W, CANVAS_H);
            onUpdate({ ...panel, bubbles: [...panel.bubbles, newB] });
            setSelectedBubbleId(newB.id);
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          말풍선 추가 {panel.bubbles.length >= 5 && "(최대 5개)"}
        </Button>
      )}

      {isImageMode && (
        <div className="rounded-md space-y-3">
          {/* 캔버스 배경 섹션 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">캔버스 배경</Label>

            <div className="flex gap-1 flex-wrap items-center">
              <span className="text-[11px] text-muted-foreground mr-0.5">배경색</span>
              {CANVAS_BG_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onUpdate({ ...panel, backgroundColor: c.value })}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    (panel.backgroundColor || "#ffffff") === c.value
                      ? "border-foreground scale-110"
                      : "border-muted-foreground/30"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>

            {panel.backgroundImageUrl && (
              <div className="relative inline-block">
                <img
                  src={panel.backgroundImageUrl}
                  alt="배경 미리보기"
                  className="rounded border border-border max-h-[80px] object-cover"
                />
                <button
                  type="button"
                  className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground p-0.5"
                  onClick={() => onUpdate({ ...panel, backgroundImageUrl: undefined, backgroundImageEl: null })}
                  data-testid={`button-remove-bg-${index}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground hover-elevate"
              onClick={() =>
                document.getElementById(`story-bg-upload-${index}`)?.click()
              }
              data-testid={`button-upload-bg-${index}`}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>배경 이미지 업로드</span>
            </button>
            <input
              id={`story-bg-upload-${index}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBackgroundImageUpload}
            />

            {charImages.length > 0 && (
              <>
                <p className="text-[11px] text-muted-foreground pt-1">내 갤러리에서 선택:</p>
                <div className="grid grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto">
                  {charImages.map((gen) => (
                    <button
                      key={gen.id}
                      className="aspect-square rounded-md overflow-hidden border border-border hover-elevate cursor-pointer"
                      onClick={() => handleBackgroundFromGallery(gen)}
                      data-testid={`button-pick-bg-${gen.id}`}
                    >
                      <img
                        src={gen.thumbnailUrl || gen.resultImageUrl}
                        alt={gen.prompt}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <hr className="border-border" />

          {/* 이미지 업로드 섹션 (기존) */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">이미지 업로드 (여러 장 가능)</Label>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground hover-elevate"
              onClick={() =>
                document.getElementById(`story-image-upload-${index}`)?.click()
              }
              data-testid={`button-upload-characters-${index}`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>이미지 파일을 선택해서 추가</span>
            </button>
            <input
              id={`story-image-upload-${index}`}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleLocalImageFiles(e.target.files)}
            />
          </div>

          {/* 갤러리에서 선택 섹션 */}
          <div className="space-y-2 rounded-lg border border-border p-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">갤러리에서 선택</Label>
              {selectedGalleryIds.size > 0 && (
                <span className="text-[10px] text-primary font-medium">{selectedGalleryIds.size}개 선택됨</span>
              )}
            </div>

            {/* 폴더 필터 탭 */}
            {setActiveGalleryFolderId && (
              <div className="flex flex-wrap gap-1">
                <button
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors font-medium ${activeGalleryFolderId === null ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                  onClick={() => setActiveGalleryFolderId(null)}
                >
                  전체
                </button>
                {characterFolders.map(f => (
                  <button
                    key={f.id}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors font-medium ${activeGalleryFolderId === f.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                    onClick={() => setActiveGalleryFolderId(f.id)}
                  >
                    {f.name} ({f.items.length})
                  </button>
                ))}
              </div>
            )}

            {galleryLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : charImages.length === 0 ? (
              <p
                className="text-xs text-muted-foreground py-3 text-center"
                data-testid="text-no-characters"
              >
                {activeGalleryFolderId ? "이 폴더에 이미지가 없습니다." : "생성된 이미지가 없습니다. 먼저 캐릭터나 배경을 만들어주세요."}
              </p>
            ) : (
              <>
                {selectedGalleryIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      disabled={addingFromGallery}
                      onClick={addSelectedFromGallery}
                    >
                      {addingFromGallery ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      {addingFromGallery ? "추가 중..." : `선택한 ${selectedGalleryIds.size}장 추가`}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs px-2"
                      onClick={() => setSelectedGalleryIds(new Set())}
                    >
                      취소
                    </Button>
                  </div>
                )}
                <div
                  className="grid grid-cols-3 gap-1.5 max-h-[240px] overflow-y-auto"
                  data-testid="character-picker-grid"
                >
                  {charImages.map((gen) => {
                    const isSelected = selectedGalleryIds.has(gen.id);
                    return (
                      <button
                        key={gen.id}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary ring-1 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => toggleGallerySelect(gen.id)}
                        data-testid={`button-pick-character-${gen.id}`}
                      >
                        <img
                          src={gen.thumbnailUrl || gen.resultImageUrl}
                          alt={gen.prompt}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        {gen.characterName && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                            <span className="text-[9px] text-white truncate block">{gen.characterName}</span>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {galleryHasMore && (
                  <button
                    className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={onLoadMoreGallery}
                  >
                    더 보기
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Character placement note - images are added as moveable characters */}
      {isImageMode && panel.characters.length === 0 && (
        <div className="rounded-md bg-muted/40 p-3 text-[11px] text-muted-foreground text-center">
          <ImageIcon className="h-4 w-4 mx-auto mb-1 opacity-50" />
          이미지를 추가하면 캔버스에서<br/>이동·크기·회전 편집이 가능합니다
        </div>
      )}

      {isImageMode && selectedChar && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 mt-3">
            <span className="text-xs font-medium text-muted-foreground">
              이미지 도구
            </span>
            {!isPro && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Pro
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-center gap-1.5"
            onClick={() => {
              onUpdate({
                ...panel,
                characters: panel.characters.map(c =>
                  c.id === selectedChar.id ? { ...c, flipX: !c.flipX } : c
                ),
              });
            }}
          >
            <FlipHorizontal2 className="h-3.5 w-3.5" />
            <span className="text-xs">좌우 반전</span>
          </Button>
          <Button
            size="sm"
            className="w-full justify-center gap-1.5"
            onClick={handleRemoveBackground}
            disabled={removingBg || !isPro}
            data-testid={`button-remove-bg-story-${index}`}
          >
            {removingBg ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">AI 배경제거 (Pro)</span>
          </Button>
        </div>
      )}


      {(isBubbleMode || isTemplateMode) && selectedBubble && (
        <div className="space-y-3 pt-4">
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-[11px] text-muted-foreground">
              선택된 말풍선: <span className="font-medium text-foreground">{selectedBubble.text || "(텍스트 없음)"}</span>
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              우측 속성 패널에서 편집하세요
            </p>
          </div>
        </div>
      )}
      {/* 말풍선 전용 목록은 제거하고, 상단 레이어 목록만 사용 */}
    </div >
  );
}

interface UsageData {
  credits: number;
  tier: string;
  totalGenerations: number;
  creatorTier: number;
  dailyFreeCredits: number;
  maxStoryPanels: number;
}

export default function StoryPage() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { showLoginDialog, setShowLoginDialog, guard } = useLoginGuard();
  const { showDialog: showLeaveDialog, confirmLeave, cancelLeave } = useNavigationGuard();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [topic, setTopic] = useState("");
  const [aiMode, setAiMode] = useState<"subtitle" | "instatoonFull" | "instatoonPrompt" | "autoWebtoon" | null>(null);
  // Art style definitions (matching /api/generate-character styles)
  // These are used to enforce visual consistency when generating backgrounds/items
  const ART_STYLES: Record<string, { label: string; promptKeyword: string; description: string }> = {
    "simple-line":  { label: "심플 라인",      promptKeyword: "simple line art, thick clean outlines, minimal flat color, webtoon style",         description: "깔끔한 두꺼운 선, 미니멀 디테일" },
    "minimal":      { label: "미니멀",          promptKeyword: "minimal cartoon, dot eyes, geometric shapes, ultra-simple line art",                description: "극도로 간결, 점 눈, 기하학적" },
    "doodle":       { label: "낙서풍",          promptKeyword: "doodle sketch style, rough pen lines, hand-drawn scribble, sketch art",            description: "거칠고 자유로운 펜 낙서" },
    "scribble":     { label: "구불구불 손글씨",  promptKeyword: "scribble style, wobbly ballpoint pen lines, messy hand-drawn cartoon",             description: "볼펜으로 끄적끄적" },
    "ink-sketch":   { label: "잉크 스케치",      promptKeyword: "ink brush sketch, bold brushstroke outlines, sumi-e inspired cartoon",            description: "붓펜, 대담한 먹선" },
    "cute-animal":  { label: "귀여운 동물",      promptKeyword: "cute chibi animal style, round shapes, pastel color, kawaii cartoon",             description: "동글동글 동물, 파스텔" },
    "auto":         { label: "자동 감지",        promptKeyword: "",                                                                                  description: "이미지에서 자동 분석" },
  };

  // 인스타툰 자동화 생성용 - 기준 캐릭터 이미지 (복수, 최대 4개)
  const [autoRefImages, setAutoRefImages] = useState<CharacterImage[]>([]);
  // Style detection for visual consistency
  const [detectedStyle, setDetectedStyle] = useState<string>("auto");    // auto | style key
  const [isDetectingStyle, setIsDetectingStyle] = useState(false);
  // 프롬프트 자동작성용 - 기준 캐릭터 이미지
  const [promptRefImages, setPromptRefImages] = useState<CharacterImage[]>([]);
  const [panels, setPanelsRaw] = useState<PanelData[]>([createPanel()]);
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSavedConfirm, setShowSavedConfirm] = useState(false);
  const [showInstagramPublish, setShowInstagramPublish] = useState(false);
  const [posePrompt, setPosePrompt] = useState("");
  const [expressionPrompt, setExpressionPrompt] = useState("");
  const [itemPrompt, setItemPrompt] = useState("");
  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [instatoonScenePrompt, setInstatoonScenePrompt] = useState("");

  const [projectName, setProjectName] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [aiLimitOpen, setAiLimitOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState<CanvasRatio>("3:4");

  // ─── Editor checklist state ──────────────────────────────────────────
  const CHECKLIST_KEY = "olli_editor_checklist_completed";
  const [checklistCompleted, setChecklistCompleted] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(CHECKLIST_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const markChecklistDone = useCallback((id: string) => {
    setChecklistCompleted(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const historyRef = useRef<PanelData[][]>([]);
  const futureRef = useRef<PanelData[][]>([]);
  const skipHistoryRef = useRef(false);
  const MAX_HISTORY = 50;

  // Abort controllers for generation cancellation
  const instatoonAbortRef = useRef<AbortController | null>(null);
  const generateAbortRef = useRef<AbortController | null>(null);
  const promptAbortRef = useRef<AbortController | null>(null);

  // Sync CANVAS_H immediately on every render so canvas uses correct size
  CANVAS_H = canvasRatio === "3:4" ? 675 : 540;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "story-font-css";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = FONT_CSS;
      document.head.appendChild(style);
    }
  }, []);

  // localStorage: restore instatoonScenePrompt on mount
  useEffect(() => {
    const saved = localStorage.getItem("olli_instatoon_scene");
    if (saved) setInstatoonScenePrompt(saved);
  }, []);

  // localStorage: save instatoonScenePrompt on change
  useEffect(() => {
    if (instatoonScenePrompt) {
      localStorage.setItem("olli_instatoon_scene", instatoonScenePrompt);
    }
  }, [instatoonScenePrompt]);

  const clonePanels = useCallback((src: PanelData[]): PanelData[] => {
    return src.map((p) => ({
      ...p,
      bubbles: p.bubbles.map((b) => ({ ...b })),
      characters: p.characters.map((c) => ({ ...c })),
      topScript: p.topScript ? { ...p.topScript } : null,
      bottomScript: p.bottomScript ? { ...p.bottomScript } : null,
      backgroundColor: p.backgroundColor,
      backgroundImageUrl: p.backgroundImageUrl,
      backgroundImageEl: p.backgroundImageEl,
      drawingLayers: (p.drawingLayers || []).map((dl) => ({ ...dl })),
      shapeElements: (p.shapeElements || []).map((s) => ({ ...s })),
      textElements: (p.textElements || []).map((te) => ({ ...te })),
      lineElements: (p.lineElements || []).map((le) => ({
        ...le,
        points: le.points.map((pt) => ({ ...pt })),
      })),
    }));
  }, []);

  const setPanels = useCallback(
    (updater: PanelData[] | ((prev: PanelData[]) => PanelData[])) => {
      setPanelsRaw((prev) => {
        if (!skipHistoryRef.current) {
          historyRef.current = [
            ...historyRef.current.slice(-(MAX_HISTORY - 1)),
            clonePanels(prev),
          ];
          futureRef.current = [];
        }
        skipHistoryRef.current = false;
        return typeof updater === "function" ? updater(prev) : updater;
      });
    },
    [clonePanels],
  );

  // setPanelsNoHistory: use for transient updates (imageEl loading) that shouldn't pollute undo
  const setPanelsNoHistory = useCallback(
    (updater: PanelData[] | ((prev: PanelData[]) => PanelData[])) => {
      skipHistoryRef.current = true;
      setPanels(updater);
    },
    [setPanels],
  );

  const rehydrateImages = useCallback((panels: PanelData[]) => {
    // Load image with CORS retry fallback + immutable state update
    const loadWithRetry = (
      src: string,
      onSuccess: (img: HTMLImageElement) => void,
      label: string,
    ) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => onSuccess(img);
      img.onerror = () => {
        // Retry without crossOrigin (fixes CORS / mixed-content failures)
        const retry = new Image();
        retry.onload = () => onSuccess(retry);
        retry.onerror = () => console.warn(`${label} load failed:`, src.slice(0, 80));
        retry.src = src;
      };
      img.src = src;
    };

    panels.forEach((p) => {
      const panelId = p.id;
      p.characters.forEach((c) => {
        if (!c.imageEl && c.imageUrl) {
          const charId = c.id;
          loadWithRetry(c.imageUrl, (img) => {
            setPanelsRaw((cur) => cur.map(panel => {
              if (panel.id !== panelId) return panel;
              const hasMatch = panel.characters.some(ch => ch.id === charId && !ch.imageEl);
              if (!hasMatch) return panel;
              return {
                ...panel,
                characters: panel.characters.map(ch =>
                  ch.id === charId && !ch.imageEl ? { ...ch, imageEl: img } : ch
                ),
              };
            }));
          }, "Character image");
        }
      });
      p.bubbles.forEach((b) => {
        if (b.style === "image" && b.templateSrc && !b.templateImg) {
          const bubbleId = b.id;
          loadWithRetry(b.templateSrc, (img) => {
            setPanelsRaw((cur) => cur.map(panel => {
              if (panel.id !== panelId) return panel;
              const hasMatch = panel.bubbles.some(bb => bb.id === bubbleId && !bb.templateImg);
              if (!hasMatch) return panel;
              return {
                ...panel,
                bubbles: panel.bubbles.map(bb =>
                  bb.id === bubbleId && !bb.templateImg ? { ...bb, templateImg: img } : bb
                ),
              };
            }));
          }, "Template image");
        }
      });
      // Rehydrate background image
      if (p.backgroundImageUrl && !p.backgroundImageEl) {
        loadWithRetry(p.backgroundImageUrl, (img) => {
          setPanelsRaw((cur) => cur.map(panel => {
            if (panel.id !== panelId || panel.backgroundImageEl) return panel;
            return { ...panel, backgroundImageEl: img };
          }));
        }, "Background image");
      }
      // Rehydrate drawing layer images + backward-compatible opacity
      (p.drawingLayers || []).forEach((dl) => {
        if (dl.opacity === undefined || dl.opacity === null) dl.opacity = 1;
        if (dl.imageData && !dl.imageEl) {
          const dlId = dl.id;
          loadWithRetry(dl.imageData, (img) => {
            setPanelsRaw((cur) => cur.map(panel => {
              if (panel.id !== panelId) return panel;
              const hasMatch = (panel.drawingLayers || []).some(d => d.id === dlId && !d.imageEl);
              if (!hasMatch) return panel;
              return {
                ...panel,
                drawingLayers: (panel.drawingLayers || []).map(d =>
                  d.id === dlId && !d.imageEl ? { ...d, imageEl: img } : d
                ),
              };
            }));
          }, "Drawing layer image");
        }
      });
    });
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    setPanelsRaw((prev) => {
      futureRef.current = [...futureRef.current, clonePanels(prev)];
      const restored = historyRef.current.pop()!;
      rehydrateImages(restored);
      return restored;
    });
  }, [clonePanels, rehydrateImages]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    setPanelsRaw((prev) => {
      historyRef.current = [...historyRef.current, clonePanels(prev)];
      const restored = futureRef.current.pop()!;
      rehydrateImages(restored);
      return restored;
    });
  }, [clonePanels, rehydrateImages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "Z" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const [zoom, setZoom] = useState(100);
  const flowZoomScale = zoom / 100;
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const [panMode, setPanMode] = useState(false);
  const panDraggingRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const panScrollStartRef = useRef<{ left: number; top: number } | null>(null);
  const [captureActive, setCaptureActive] = useState(false);
  const [blockCapture] = useState(true);
  const [activeScriptSection, setActiveScriptSection] = useState<"top" | "bottom">("top");

  const fitToView = useCallback(() => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const areaW = area.clientWidth - 48;
    const areaH = area.clientHeight - 48;
    if (areaW <= 0 || areaH <= 0) return;
    const fitScale = Math.min(areaW / CANVAS_W, areaH / CANVAS_H, 2);
    setZoom(Math.round(fitScale * 100));
  }, []);

  /* 최초 진입 시 기본 100% 유지 */

  useEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom((z) => {
          const dir = e.deltaY < 0 ? 1.1 : 0.9;
          const nz = Math.round(Math.max(20, Math.min(200, z * dir)));
          return nz;
        });
      }
    };
    area.addEventListener("wheel", onWheel, { passive: false });
    return () => area.removeEventListener("wheel", onWheel as any);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPanMode(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setPanMode(false);
        panDraggingRef.current = false;
        panStartRef.current = null;
        panScrollStartRef.current = null;
        const area = canvasAreaRef.current;
        if (area) area.style.cursor = "default";
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setZoom((z) => Math.min(200, z + 10));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(20, z - 10));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoom(100);
      } else if (e.key === "PrintScreen") {
        if (blockCapture) {
          setCaptureActive(true);
          toast({ title: "스크린캡쳐 차단", description: "화면 캡쳐가 감지되어 캔버스를 보호합니다." });
        }
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const area = canvasAreaRef.current;
        if (!area) return;
        const dx = e.key === "ArrowLeft" ? -50 : e.key === "ArrowRight" ? 50 : 0;
        const dy = e.key === "ArrowUp" ? -50 : e.key === "ArrowDown" ? 50 : 0;
        area.scrollBy({ left: dx, top: dy, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fitToView]);

  useEffect(() => {
    const onBlur = () => {
      if (blockCapture) setCaptureActive(true);
    };
    const onFocus = () => setCaptureActive(false);
    const onVisibility = () => {
      if (document.visibilityState !== "visible" && blockCapture) {
        setCaptureActive(true);
      }
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [blockCapture]);

  const { data: usageData } = useQuery<UsageData>({ queryKey: ["/api/usage"] });
  const maxPanels = usageData?.maxStoryPanels ?? 3;

  const { data: projectFolders = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["/api/project-folders"],
    enabled: isAuthenticated,
  });

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadFolderId, setLoadFolderId] = useState<number | null>(null);
  const { data: savedProjects = [] } = useQuery<{ id: number; name: string; folderId: number | null; updatedAt: string; editorType: string; thumbnailUrl: string | null }[]>({
    queryKey: ["/api/bubble-projects"],
    enabled: isAuthenticated && (showSaveModal || showLoadModal),
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/project-folders", { name });
      return res.json();
    },
    onSuccess: (folder: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-folders"] });
      setSelectedFolderId(folder.id);
      setNewFolderName("");
      setShowNewFolderInput(false);
      setCreatingFolder(false);
    },
    onError: (err: any) => {
      toast({ title: "폴더 생성 실패", description: err.message, variant: "destructive" });
      setCreatingFolder(false);
    },
  });
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts || typeof document.fonts.ready?.then !== "function") {
      setFontsReady(true);
      return;
    }
    document.fonts.ready.then(() => {
      setFontsReady(true);
    }).catch(() => {
      setFontsReady(true);
    });
  }, []);

  const [galleryLimit, setGalleryLimit] = useState(30);
  const [activeGalleryFolderId, setActiveGalleryFolderId] = useState<number | null>(null);
  const { data: galleryRaw, isLoading: galleryLoading } = useQuery<
    { items: GenerationLight[]; total: number; hasMore: boolean }
  >({
    queryKey: ["/api/gallery", galleryLimit, activeGalleryFolderId],
    refetchOnMount: "always",
    staleTime: 0,
    queryFn: async () => {
      const authHeaders: Record<string, string> = {};
      const { supabase: sb } = await import("@/lib/supabase");
      const { data: sess } = await sb.auth.getSession();
      if (sess.session?.access_token) authHeaders["Authorization"] = `Bearer ${sess.session.access_token}`;
      const folderParam = activeGalleryFolderId ? `&folderId=${activeGalleryFolderId}` : "";
      const res = await fetch(`/api/gallery?limit=${galleryLimit}&offset=0${folderParam}`, { headers: authHeaders });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });
  const galleryData = galleryRaw?.items ?? [];
  const galleryHasMore = galleryRaw?.hasMore ?? false;

  // Character-only query for quick-select strips (캐릭터 전용)
  const { data: characterStripRaw } = useQuery<{ items: GenerationLight[] }>({
    queryKey: ["/api/gallery", "character-strip"],
    staleTime: 30_000,
    queryFn: async () => {
      const authHeaders: Record<string, string> = {};
      const { supabase: sb } = await import("@/lib/supabase");
      const { data: sess } = await sb.auth.getSession();
      if (sess.session?.access_token) authHeaders["Authorization"] = `Bearer ${sess.session.access_token}`;
      const res = await fetch("/api/gallery?type=character&limit=12", { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load character strip");
      return res.json();
    },
  });
  const characterStripData = characterStripRaw?.items ?? [];

  type CharacterFolderWithItems = CharacterFolder & { items: { generationId: number; thumbnailUrl?: string | null; characterName?: string | null; prompt?: string | null }[] };
  const { data: storyCharacterFolders = [] } = useQuery<CharacterFolderWithItems[]>({
    queryKey: ["/api/character-folders"],
  });

  const fetchFullGeneration = useCallback(async (id: number): Promise<Generation | null> => {
    try {
      const authHeaders: Record<string, string> = {};
      const { supabase: sb } = await import("@/lib/supabase");
      const { data: sess } = await sb.auth.getSession();
      if (sess.session?.access_token) authHeaders["Authorization"] = `Bearer ${sess.session.access_token}`;
      const res = await fetch(`/api/gallery/${id}`, { headers: authHeaders });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }, []);

  const getDailyKey = (feature: string) => {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `daily_${feature}_${y}${m}${day}`;
  };
  const getDailyCount = (feature: string) => {
    const key = getDailyKey(feature);
    const raw = localStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  };
  const incDailyCount = (feature: string) => {
    const key = getDailyKey(feature);
    const n = getDailyCount(feature) + 1;
    localStorage.setItem(key, String(n));
  };

  const generateMutation = useMutation({
    mutationFn: async (variables: { mode: "basic" | "full"; scope: "current" | "all" }) => {
      const ac = new AbortController();
      generateAbortRef.current = ac;
      const isCurrent = variables.scope === "current";
      const body: any = {
        topic,
        panelCount: isCurrent ? 1 : panels.length,
      };
      // 캐릭터 이름이 있으면 스토리 생성에 반영
      const charNames = autoRefImages.map(img => img.name).filter(Boolean);
      if (charNames.length > 0) body.characterNames = charNames;
      if (variables.mode === "full") {
        if (instatoonScenePrompt.trim()) {
          body.backgroundPrompt = instatoonScenePrompt.trim();
        } else {
          if (posePrompt.trim()) body.posePrompt = posePrompt.trim();
          if (expressionPrompt.trim()) body.expressionPrompt = expressionPrompt.trim();
          if (itemPrompt.trim()) body.itemPrompt = itemPrompt.trim();
          if (backgroundPrompt.trim()) body.backgroundPrompt = backgroundPrompt.trim();
        }
        if (autoRefImages.length > 0) body.referenceImageUrl = autoRefImages[0].imageUrl;
      }
      const res = await apiRequest("POST", "/api/story-scripts", body, { signal: ac.signal });
      const result = await res.json() as { panels: StoryPanelScript[] };
      return { ...result, scope: variables.scope, targetIndex: activePanelIndex };
    },
    onSuccess: (data) => {
      // AI position을 캔버스 픽셀 좌표로 변환
      const getBubblePosition = (position?: string, index: number = 0) => {
        const w = CANVAS_W;
        const h = CANVAS_H;
        const pos = position || (index % 2 === 0 ? "top-left" : "bottom-right");
        switch (pos) {
          case "top-left": return { x: w * 0.1, y: h * 0.15 };
          case "top-right": return { x: w * 0.5, y: h * 0.15 };
          case "bottom-left": return { x: w * 0.1, y: h * 0.55 };
          case "bottom-right": return { x: w * 0.5, y: h * 0.55 };
          case "center": return { x: w * 0.3, y: h * 0.35 };
          default: return { x: w * 0.25, y: h * 0.2 };
        }
      };

      const applyAiPanel = (panel: any, aiPanel: StoryPanelScript) => {
        const newBubbles: SpeechBubble[] = (aiPanel.bubbles || [])
          .map((b: any, bi: number) => {
            const baseBubble = createBubble(
              CANVAS_W,
              CANVAS_H,
              b.text,
              (b.style as BubbleStyle) || "linedrawing",
            );
            const coords = getBubblePosition(b.position, bi);
            let tailDirection: "top" | "bottom" | "left" | "right" = "bottom";
            if (b.position?.includes("top")) tailDirection = "bottom";
            if (b.position?.includes("bottom")) tailDirection = "top";
            return {
              ...baseBubble,
              x: coords.x,
              y: coords.y,
              tailDirection,
            };
          });

        return {
          ...panel,
          topScript: aiPanel.top
            ? { text: aiPanel.top, style: "no-border" as const, color: "dark", fontSize: 16, bold: true, y: 20 }
            : null,
          bottomScript: aiPanel.bottom
            ? { text: aiPanel.bottom, style: "no-border" as const, color: "white", textColor: "#1a1a1a", fontSize: 16, bold: true, y: CANVAS_H - 100 }
            : null,
          bubbles: newBubbles.length > 0 ? newBubbles : panel.bubbles,
        };
      };

      if (data.scope === "current") {
        // 선택된 캔버스 1개에만 적용
        const aiPanel = data.panels[0];
        if (aiPanel) {
          setPanels((prev) =>
            prev.map((panel, i) =>
              i === data.targetIndex ? applyAiPanel(panel, aiPanel) : panel
            ),
          );
        }
        const bubbleCount = data.panels[0]?.bubbles?.length || 0;
        toast({
          title: "스크립트 생성 완료",
          description: `선택 패널에 자막${bubbleCount > 0 ? `과 ${bubbleCount}개 말풍선이` : "이"} 생성되었습니다`,
        });
      } else {
        // 전체 캔버스에 적용
        setPanels((prev) =>
          prev.map((panel, i) => {
            if (!data.panels[i]) return panel;
            return applyAiPanel(panel, data.panels[i]);
          }),
        );
        const totalBubbles = data.panels.reduce(
          (sum, p) => sum + (p.bubbles?.length || 0),
          0,
        );
        toast({
          title: "스크립트 생성 완료",
          description: `${data.panels.length}개 패널, ${totalBubbles}개 말풍선이 생성되었습니다`,
        });
      }
      markChecklistDone("ai-generate");
      markChecklistDone("add-subtitle");
    },
    onSettled: () => { generateAbortRef.current = null; },
    onError: (error: any) => {
      if (error?.name === "AbortError" || error?.message === "The user aborted a request.") {
        toast({ title: "스크립트 생성 취소됨" });
        return;
      }
      if (isUnauthorizedError(error)) {
        setShowLoginDialog(true);
        return;
      }
      if (/^403: /.test(error.message) && error.message.includes("크레딧을 전부 사용했어요")) {
        setAiLimitOpen(true);
        toast({
          title: "크레딧 부족",
          description: "크레딧을 전부 사용했어요. 충전해주세요.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "생성 실패",
        description: error.message || "스크립트 생성에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const instatoonImageMutation = useMutation({
    mutationFn: async (variables?: { scope?: "current" | "all" }) => {
      const ac = new AbortController();
      instatoonAbortRef.current = ac;
      const scope = variables?.scope ?? "all";
      const currentPanels = panels;
      const currentRefImages = autoRefImages.map(img => img.imageUrl);
      if (currentRefImages.length === 0) {
        throw new Error("먼저 기준 캐릭터 이미지를 선택해주세요.");
      }

      // scope === "current" 이면 선택된 패널 1개만, "all" 이면 전체
      const targetIndices = scope === "current"
        ? [activePanelIndex]
        : currentPanels.map((_, i) => i);

      // 캐릭터 이름을 장면 프롬프트에 포함
      const charNameCtx = autoRefImages.map(img => img.name).filter(Boolean);
      const charNamePrefix = charNameCtx.length > 0 ? `characters: ${charNameCtx.join(", ")}. ` : "";

      const results: { panelId: string; imageUrl: string }[] = [];
      const errors: string[] = [];
      for (const i of targetIndices) {
        if (ac.signal.aborted) break;

        let scenePrompt: string;
        let finalItems: string | undefined;

        if (instatoonScenePrompt.trim()) {
          const poseStr = [posePrompt.trim(), expressionPrompt.trim()].filter(Boolean).join(", ");
          const sceneParts: string[] = [];
          const styleKey2 = detectedStyle && detectedStyle !== "auto" ? detectedStyle : null;
          if (styleKey2 && ART_STYLES[styleKey2]) sceneParts.push(ART_STYLES[styleKey2].promptKeyword);
          if (charNamePrefix) sceneParts.push(charNamePrefix.trim());
          if (poseStr) sceneParts.push(poseStr);
          sceneParts.push(instatoonScenePrompt.trim());
          if (i > 0) sceneParts.push(`scene ${i + 1}`);
          scenePrompt = sceneParts.join(", ");
        } else {
          const built = buildScenePrompt(
            topic.trim(),
            posePrompt.trim(),
            expressionPrompt.trim(),
            backgroundPrompt.trim(),
            itemPrompt.trim(),
            i,
          );
          scenePrompt = charNamePrefix + built.backgroundPrompt;
          finalItems = built.itemsPrompt;
        }

        try {
          const res = await apiRequest("POST", "/api/generate-background", {
            sourceImageDataList: currentRefImages,
            backgroundPrompt: scenePrompt,
            itemsPrompt: finalItems,
            skipGallery: true,
          }, { signal: ac.signal });
          const data = await res.json() as { imageUrl: string };
          if (!data.imageUrl) throw new Error("이미지 생성 결과가 없습니다.");
          results.push({ panelId: currentPanels[i].id, imageUrl: data.imageUrl });
        } catch (err: any) {
          if (err?.name === "AbortError") throw err;
          console.error(`Panel ${i + 1} image generation failed:`, err?.message || err);
          errors.push(`패널 ${i + 1}: ${err?.message || "실패"}`);
          if (/^403/.test(err?.message)) break;
        }
      }
      if (results.length === 0) {
        throw new Error(errors[0] || "모든 패널의 이미지 생성에 실패했습니다.");
      }
      return results;
    },
    onSuccess: async (results) => {
      // Pre-build stable charId map
      const charIds: Record<string, string> = {};
      results.forEach(({ panelId }) => { charIds[panelId] = generateId(); });

      // Load all images first, then add to panels in one setPanels call
      const loadImage = (url: string, withCors: boolean): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          if (withCors) img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => {
            if (withCors) loadImage(url, false).then(resolve).catch(reject);
            else reject(new Error("Image load failed"));
          };
          img.src = url;
        });

      const loadedImages: Record<string, { img: HTMLImageElement; coverScale: number }> = {};
      await Promise.all(
        results.map(async ({ panelId, imageUrl }) => {
          try {
            const img = await loadImage(imageUrl, true);
            const coverScale = Math.max(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
            loadedImages[panelId] = { img, coverScale };
          } catch {}
        })
      );

      // Add characters with loaded imageEl in one setPanels call
      setPanels((prev) =>
        prev.map((p) => {
          const result = results.find((r) => r.panelId === p.id);
          if (!result) return p;
          const cid = charIds[result.panelId];
          const loaded = loadedImages[result.panelId];
          const char: CharacterPlacement = {
            id: cid,
            imageUrl: result.imageUrl,
            x: CANVAS_W / 2,
            y: CANVAS_H / 2,
            scale: loaded?.coverScale ?? 1,
            imageEl: loaded?.img ?? null,
            zIndex: 0,
          };
          return { ...p, characters: [char, ...p.characters] };
        })
      );

      // Auto-select the first result so user can see edit handles immediately
      const firstResult = results[0];
      if (firstResult && charIds[firstResult.panelId]) {
        setSelectedCharId(charIds[firstResult.panelId]);
        setSelectedBubbleId(null);
      }

      toast({
        title: "인스타툰 이미지 생성 완료",
        description: `${results.length}개 패널에 이미지가 생성됐습니다. 클릭해서 위치·크기를 조정하세요.`,
      });
    },
    onSettled: () => { instatoonAbortRef.current = null; },
    onError: (error: any) => {
      if (error?.name === "AbortError" || error?.message === "The user aborted a request.") {
        toast({ title: "이미지 생성 취소됨" });
        return;
      }
      if (isUnauthorizedError(error)) {
        setShowLoginDialog(true);
        return;
      }
      if (/^403/.test(error.message)) {
        setAiLimitOpen(true);
        toast({
          title: "크레딧 부족",
          description: "크레딧을 전부 사용했어요. 충전해주세요.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "이미지 생성 실패",
        description: error.message || "인스타툰 이미지를 생성하지 못했습니다",
        variant: "destructive",
      });
    },
  });

  const suggestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/story-topic-suggest", {});
      return res.json() as Promise<{ topics: string[] }>;
    },
    onSuccess: (data) => {
      if (data.topics?.length) {
        const t = data.topics[Math.floor(Math.random() * data.topics.length)];
        setTopic(t);
        toast({
          title: "주제 추천",
          description: `"${t}" 주제가 선택되었습니다`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "추천 실패",
        description: error.message || "주제 추천에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const posePromptMutation = useMutation({
    mutationFn: async () => {
      const ac = new AbortController();
      promptAbortRef.current = ac;
      const res = await apiRequest("POST", "/api/ai-prompt", {
        type: "pose",
        context: topic.trim() || instatoonScenePrompt.trim() || undefined,
      }, { signal: ac.signal });
      return res.json() as Promise<{ prompt: string }>;
    },
    onSuccess: (data) => {
      let pose = data.prompt;
      let expr = "";
      try {
        const parsed = JSON.parse(data.prompt);
        if (parsed?.pose) { pose = parsed.pose; }
        if (parsed?.expression) { expr = parsed.expression; }
      } catch {}
      setPosePrompt(pose);
      if (expr) setExpressionPrompt(expr);
      toast({
        title: "포즈/표정 프롬프트 생성 완료",
        description: "AI가 제안한 포즈/표정을 적용했습니다.",
      });
    },
    onSettled: () => { promptAbortRef.current = null; },
    onError: (error: any) => {
      if (error?.name === "AbortError" || error?.message === "The user aborted a request.") {
        toast({ title: "프롬프트 생성 취소됨" });
        return;
      }
      if (isUnauthorizedError(error)) {
        setShowLoginDialog(true);
        return;
      }
      toast({
        title: "생성 실패",
        description: error.message || "프롬프트 생성에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const backgroundPromptMutation = useMutation({
    mutationFn: async () => {
      const ac = new AbortController();
      promptAbortRef.current = ac;
      const res = await apiRequest("POST", "/api/ai-prompt", {
        type: "background",
        context: topic.trim() || instatoonScenePrompt.trim() || undefined,
      }, { signal: ac.signal });
      return res.json() as Promise<{ prompt: string }>;
    },
    onSuccess: (data) => {
      let aiBg = data.prompt;
      let aiItems = "";
      try {
        const parsed = JSON.parse(data.prompt);
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.background === "string" && parsed.background) {
            aiBg = parsed.background;
          }
          if (typeof parsed.items === "string") {
            aiItems = parsed.items;
          }
        }
      } catch {
      }
      // 사용자가 직접 입력한 값 우선, 비어있으면 AI 생성 값으로 채움
      const finalBg = backgroundPrompt.trim() || aiBg;
      const finalItems = itemPrompt.trim() || aiItems;
      if (!backgroundPrompt.trim()) setBackgroundPrompt(aiBg);
      if (!itemPrompt.trim()) setItemPrompt(aiItems);

      // Auto-generate character image if reference image is available
      // backgroundPromptMutation is used in instatoonFull flow (autoRefImages)
      const refImgs = autoRefImages.length > 0 ? autoRefImages.map(i => i.imageUrl) : promptRefImages[0]?.imageUrl ? [promptRefImages[0].imageUrl] : [];
      if (refImgs.length > 0) {
        toast({
          title: "배경/아이템 완성 — 이미지 생성 시작",
          description: "캐릭터 이미지를 생성해 캔버스에 추가합니다...",
        });
        // Use functional access to get current panel IDs to avoid stale closure
        // panels state is always current in onSuccess (TanStack Query uses latest closure)
        const currentPanelIds = panels.map(p => p.id);
        generateAndAddCharacterImages(refImgs, {
          bg: finalBg,
          items: finalItems,
          pose: posePrompt,
          expression: expressionPrompt,
          topic: topic.trim() || undefined,
          characterNames: autoRefImages.map(img => img.name).filter(Boolean),
        }, currentPanelIds).then((count) => {
          toast({
            title: "캐릭터 이미지 추가 완료",
            description: `${count}개 패널에 캐릭터가 추가됐습니다. 캔버스에서 위치·크기를 조정하세요.`,
          });
        }).catch(() => {
          toast({
            title: "이미지 생성 실패",
            description: "캐릭터 이미지 자동 생성에 실패했습니다.",
            variant: "destructive",
          });
        });
      } else {
        toast({
          title: "배경/아이템 프롬프트 생성 완료",
          description: "AI가 제안한 배경과 아이템을 적용했습니다.",
        });
      }
    },
    onSettled: () => { promptAbortRef.current = null; },
    onError: (error: any) => {
      if (error?.name === "AbortError" || error?.message === "The user aborted a request.") {
        toast({ title: "프롬프트 생성 취소됨" });
        return;
      }
      if (isUnauthorizedError(error)) {
        setShowLoginDialog(true);
        return;
      }
      if (/^403/.test(error.message)) {
        setAiLimitOpen(true);
        toast({ title: "크레딧 부족", description: "크레딧을 전부 사용했어요. 충전해주세요.", variant: "destructive" });
        return;
      }
      toast({
        title: "생성 실패",
        description: error.message || "프롬프트 생성에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  const instatoonPromptMutation = useMutation({
    mutationFn: async (variables?: { scope?: "current" | "all" }) => {
      const ac = new AbortController();
      promptAbortRef.current = ac;
      const scope = variables?.scope ?? "all";
      const res = await apiRequest("POST", "/api/ai-prompt", {
        type: "background",
        referenceImageUrl: promptRefImages[0]?.imageUrl ?? undefined,
      }, { signal: ac.signal });
      const data = (await res.json()) as { prompt: string };
      return { prompt: data.prompt, scope };
    },
    onSuccess: ({ prompt: rawPrompt, scope }) => {
      let aiBg = "";
      let aiItems = "";
      try {
        const parsed = JSON.parse(rawPrompt);
        if (parsed && typeof parsed === "object") {
          const bg = (parsed as any).background;
          const items = (parsed as any).items;
          if (typeof bg === "string" && bg) aiBg = bg;
          if (typeof items === "string" && items) aiItems = items;
        }
      } catch {}

      // 사용자가 직접 입력한 값 우선, 비어있으면 AI 생성 값으로 채움
      const finalBg = backgroundPrompt.trim() || aiBg;
      const finalItems = itemPrompt.trim() || aiItems;
      // UI 필드도 업데이트 (사용자가 비운 경우에만)
      if (!backgroundPrompt.trim() && aiBg) setBackgroundPrompt(aiBg);
      if (!itemPrompt.trim() && aiItems) setItemPrompt(aiItems);

      const scene = [finalBg, finalItems].filter(Boolean).join(" / ");
      setInstatoonScenePrompt(scene || rawPrompt);

      // If a reference character image is provided, auto-generate and place on canvas
      const refImgs2 = autoRefImages.length > 0 ? autoRefImages.map(i => i.imageUrl) : promptRefImages.length > 0 ? promptRefImages.map(i => i.imageUrl) : [];
      if (refImgs2.length > 0) {
        const isCurrent = scope === "current";
        const targetPanelIds = isCurrent
          ? [panels[activePanelIndex]?.id].filter(Boolean)
          : panels.map(p => p.id);
        toast({
          title: isCurrent ? "선택 컷 — 이미지 생성 시작" : "전체 — 이미지 생성 시작",
          description: isCurrent
            ? "선택된 패널에 캐릭터 이미지를 생성합니다..."
            : "캐릭터 이미지를 생성해 캔버스에 추가합니다...",
        });
        generateAndAddCharacterImages(refImgs2, {
          bg: finalBg || scene,
          items: finalItems,
          pose: posePrompt,
          expression: expressionPrompt,
          topic: topic.trim() || undefined,
          characterNames: (autoRefImages.length > 0 ? autoRefImages : promptRefImages).map(img => img.name).filter(Boolean),
        }, targetPanelIds).then((count) => {
          toast({
            title: "캐릭터 이미지 추가 완료",
            description: `${count}개 패널에 캐릭터가 추가됐습니다. 캔버스에서 위치·크기를 조정하세요.`,
          });
        }).catch(() => {
          toast({
            title: "이미지 생성 실패",
            description: "캐릭터 이미지 자동 생성에 실패했습니다. 직접 추가해주세요.",
            variant: "destructive",
          });
        });
      } else {
        toast({
          title: "인스타툰 프롬프트 생성 완료",
          description: "인스타툰 전체 프롬프트를 자동으로 채웠습니다.",
        });
      }
    },
    onSettled: () => { promptAbortRef.current = null; },
    onError: (error: any) => {
      if (error?.name === "AbortError" || error?.message === "The user aborted a request.") {
        toast({ title: "프롬프트 생성 취소됨" });
        return;
      }
      if (isUnauthorizedError(error)) {
        setShowLoginDialog(true);
        return;
      }
      if (/^403/.test(error.message)) {
        setAiLimitOpen(true);
        toast({ title: "크레딧 부족", description: "크레딧을 전부 사용했어요. 충전해주세요.", variant: "destructive" });
        return;
      }
      toast({
        title: "생성 실패",
        description: error.message || "프롬프트 생성에 실패했습니다",
        variant: "destructive",
      });
    },
  });

  // Build a scene-first prompt that forces pose/action changes AND enforces art style
  // Structure: [style keyword] [character action] [scene context] [setting]
  const buildScenePrompt = (
    topic?: string,
    pose?: string,
    expression?: string,
    bg?: string,
    items?: string,
    panelIndex?: number
  ): { backgroundPrompt: string; itemsPrompt: string | undefined } => {
    const parts: string[] = [];

    // 0. Art style FIRST — forces the AI to match the reference character's visual style
    //    Without this, generated backgrounds/items use a different default style
    const styleKey = detectedStyle && detectedStyle !== "auto" ? detectedStyle : null;
    if (styleKey && ART_STYLES[styleKey]) {
      parts.push(ART_STYLES[styleKey].promptKeyword);
    }

    // 1. Character action (FIRST after style — highest weight in img2img)
    const poseAndExpr = [pose, expression].filter(Boolean).join(", ");
    if (poseAndExpr) {
      parts.push(poseAndExpr);
    }
    // 2. Topic/story context
    if (topic) {
      const panelSuffix = panelIndex && panelIndex > 0 ? ` scene ${panelIndex + 1}` : "";
      parts.push(topic + panelSuffix);
    }
    // 3. Background/setting
    if (bg) parts.push(bg);

    // Items kept separate
    const itemsPrompt = items?.trim() || undefined;

    // backgroundPrompt는 최소 3자 이상이어야 함 (서버 스키마 요구사항)
    let backgroundPrompt = parts.join(", ");
    if (!backgroundPrompt || backgroundPrompt.length < 3) {
      backgroundPrompt = backgroundPrompt
        ? `${backgroundPrompt}, cute instatoon scene`
        : "cute instatoon scene with character";
    }

    return {
      backgroundPrompt,
      itemsPrompt,
    };
  };

  // Helper: generate character images per panel and add as CharacterPlacements on canvas
  const generateAndAddCharacterImages = async (
    sourceImageUrls: string[],
    promptParts: { bg?: string; items?: string; pose?: string; expression?: string; topic?: string; characterNames?: string[] },
    panelIds?: string[]
  ) => {
    const ids = panelIds ?? panels.map(p => p.id);

    // Pre-build stable charId map for all panels
    const charIdMap: Record<string, string> = {};
    ids.forEach(pid => { charIdMap[pid] = generateId(); });

    const loadImage = (url: string, withCors: boolean): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        if (withCors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => {
          if (withCors) loadImage(url, false).then(resolve).catch(reject);
          else reject(new Error("Image load failed"));
        };
        img.src = url;
      });

    // Generate images in parallel and collect results
    let successCount = 0;
    const generated: { panelId: string; imageUrl: string; img: HTMLImageElement; coverScale: number }[] = [];
    const failedPanelIds: string[] = [];

    const tasks = ids.map(async (panelId, i) => {
      const cid = charIdMap[panelId];
      if (!cid) return;

      const { backgroundPrompt: scenePrompt, itemsPrompt: sceneItems } = buildScenePrompt(
        promptParts.topic,
        promptParts.pose,
        promptParts.expression,
        promptParts.bg,
        promptParts.items,
        i,
      );
      // 캐릭터 이름을 장면 프롬프트에 포함
      const charCtx = promptParts.characterNames?.length ? `characters: ${promptParts.characterNames.join(", ")}. ` : "";

      try {
        const res = await apiRequest("POST", "/api/generate-background", {
          sourceImageDataList: sourceImageUrls,
          backgroundPrompt: charCtx + scenePrompt,
          itemsPrompt: sceneItems,
          characterNames: promptParts.characterNames,
        });
        const data = await res.json() as { imageUrl: string };
        const imageUrl = data.imageUrl;
        if (!imageUrl) return;

        // Load image and compute scale
        const img = await loadImage(imageUrl, true);
        const coverScale = Math.max(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
        generated.push({ panelId, imageUrl, img, coverScale });
        successCount++;
      } catch (err: any) {
        if (/^403/.test(err?.message || '')) {
          setAiLimitOpen(true);
          toast({ title: "크레딧 부족", description: "크레딧을 전부 사용했어요. 충전해주세요.", variant: "destructive" });
        }
        failedPanelIds.push(panelId);
      }
    });

    await Promise.all(tasks);

    // Add all successfully generated characters in one setPanels call
    if (generated.length > 0) {
      setPanels((prev) =>
        prev.map((p) => {
          const gen = generated.find((g) => g.panelId === p.id);
          if (!gen) return p;
          const cid = charIdMap[gen.panelId];
          const genIdx = ids.indexOf(gen.panelId);
          const { backgroundPrompt: genPrompt } = buildScenePrompt(
            promptParts.topic,
            promptParts.pose,
            promptParts.expression,
            promptParts.bg,
            promptParts.items,
            genIdx,
          );
          const charCtxStr = promptParts.characterNames?.length ? `characters: ${promptParts.characterNames.join(", ")}. ` : "";
          const char: CharacterPlacement = {
            id: cid,
            imageUrl: gen.imageUrl,
            x: CANVAS_W / 2,
            y: CANVAS_H / 2,
            scale: gen.coverScale,
            imageEl: gen.img,
            zIndex: 0,
            prompt: charCtxStr + genPrompt,
          };
          return { ...p, characters: [char, ...p.characters] };
        })
      );
    }

    return successCount;
  };

  // Auto-detect art style from uploaded image using AI analysis
  const detectArtStyle = async (imageData: string) => {
    setIsDetectingStyle(true);
    try {
      const res = await apiRequest("POST", "/api/ai-prompt", {
        type: "style-detect",
        referenceImageUrl: imageData,
        context: JSON.stringify(Object.keys(ART_STYLES).filter(k => k !== "auto")),
      });
      if (res.ok) {
        const data = await res.json() as { prompt?: string; style?: string };
        // Try to parse returned style key
        const raw = (data.style || data.prompt || "").toLowerCase().trim();
        const matchedKey = Object.keys(ART_STYLES).find(
          k => k !== "auto" && (raw.includes(k) || raw.includes(ART_STYLES[k].label.toLowerCase()))
        );
        if (matchedKey) {
          setDetectedStyle(matchedKey);
          toast({
            title: `스타일 감지 완료: ${ART_STYLES[matchedKey].label}`,
            description: "생성되는 이미지에 이 스타일이 자동 적용됩니다.",
          });
          return matchedKey;
        }
      }
    } catch {
      // Detection failed — fall back to client-side heuristic below
    }

    // Client-side heuristic fallback: analyze image brightness/contrast distribution
    // (rough approximation — proper style detection needs the API)
    setDetectedStyle("auto");
    setIsDetectingStyle(false);
    return "auto";
  };

  // 이미지 파일 → base64 변환 후 state에 추가 (최대 4개)
  const TIER_NAMES = ["입문 작가", "신인 작가", "인기 작가", "프로 연재러"];
  const TIER_PANEL_LIMITS = [3, 5, 8, 14];

  const addPanel = () => {
    if (panels.length >= maxPanels) {
      const currentTier = usageData?.creatorTier ?? 0;
      if (currentTier < 3) {
        const nextTierName = TIER_NAMES[currentTier + 1];
        const nextLimit = TIER_PANEL_LIMITS[currentTier + 1];
        toast({
          title: `패널 ${maxPanels}개 제한`,
          description: `${nextTierName} 등급이 되면 최대 ${nextLimit}개까지 추가 가능합니다`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "최대 패널 수 도달",
          description: "최대 14개의 패널까지 추가할 수 있습니다",
          variant: "destructive",
        });
      }
      return;
    }
    const newPanels = [...panels, createPanel()];
    setPanels(newPanels);
    setActivePanelIndex(newPanels.length - 1);
    markChecklistDone("add-panel");
  };

  const removePanel = (idx: number) => {
    if (panels.length <= 1) {
      // Last panel: replace with a fresh empty panel
      const fresh: PanelData = {
        id: generateId(),
        topScript: null,
        bottomScript: null,
        bubbles: [],
        characters: [],
        drawingLayers: [],
        textElements: [],
        lineElements: [],
        shapeElements: [],
      };
      setPanels([fresh]);
      setActivePanelIndex(0);
      setSelectedBubbleId(null);
      setSelectedCharId(null);
      return;
    }
    const newPanels = panels.filter((_, i) => i !== idx);
    setPanels(newPanels);
    setActivePanelIndex(Math.min(activePanelIndex, newPanels.length - 1));
    setSelectedBubbleId(null);
    setSelectedCharId(null);
  };

  const duplicatePanel = (idx: number) => {
    if (panels.length >= maxPanels) {
      toast({ title: "최대 패널 수 도달", description: `최대 ${maxPanels}개까지 추가할 수 있습니다`, variant: "destructive" });
      return;
    }
    const source = panels[idx];
    const cloned: PanelData = {
      id: generateId(),
      topScript: source.topScript ? { ...source.topScript } : null,
      bottomScript: source.bottomScript ? { ...source.bottomScript } : null,
      backgroundColor: source.backgroundColor,
      backgroundImageUrl: source.backgroundImageUrl,
      backgroundImageEl: source.backgroundImageEl,
      bubbles: source.bubbles.map((b) => ({ ...b, id: generateId() })),
      characters: source.characters.map((c) => ({ ...c, id: generateId() })),
      drawingLayers: (source.drawingLayers || []).map((dl) => ({ ...dl, id: generateId() })),
      textElements: (source.textElements || []).map((t) => ({ ...t, id: generateId() })),
      lineElements: (source.lineElements || []).map((l) => ({ ...l, id: generateId(), points: l.points.map(p => ({ ...p })) })),
      shapeElements: (source.shapeElements || []).map((s) => ({ ...s, id: generateId() })),
    };
    const newPanels = [...panels];
    newPanels.splice(idx + 1, 0, cloned);
    setPanels(newPanels);
    setActivePanelIndex(idx + 1);
  };

  const updatePanel = (idx: number, updated: PanelData) => {
    setPanels((prev) => prev.map((p, i) => (i === idx ? updated : p)));
  };

  // Update panel without pushing undo history (for continuous drag moves)
  const updatePanelNoHistory = useCallback((idx: number, updated: PanelData) => {
    setPanelsNoHistory((prev) => prev.map((p, i) => (i === idx ? updated : p)));
  }, [setPanelsNoHistory]);

  const resetAll = () => {
    setPanels([createPanel()]);
    setActivePanelIndex(0);
    setTopic("");
  };

  const activePanel = panels[activePanelIndex] ?? panels[0];
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [editingBubbleIdForOverlay, setEditingBubbleIdForOverlay] = useState<string | null>(null);
  const [editingScriptPositionForCanvas, setEditingScriptPositionForCanvas] = useState<"top" | "bottom" | null>(null);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [showCharRegenPanel, setShowCharRegenPanel] = useState(false);
  const [charRegenPrompt, setCharRegenPrompt] = useState("");
  const [charRegenLoading, setCharRegenLoading] = useState(false);
  // ─── Character inpaint (부분 수정) state ──────────────────────────
  const [charInpaintMode, setCharInpaintMode] = useState(false);
  const [charInpaintSelectionMode, setCharInpaintSelectionMode] = useState<SelectionMode>("brush");
  const [charInpaintToolMode, setCharInpaintToolMode] = useState<"brush" | "lasso" | "quick" | "object">("brush");
  const [charInpaintBrushSize, setCharInpaintBrushSize] = useState(30);
  const [charInpaintPrompt, setCharInpaintPrompt] = useState("");
  const [charInpaintLoading, setCharInpaintLoading] = useState(false);
  const charInpaintSelectionRef = useRef<SelectionCanvasHandle | null>(null);
  const [charInpaintImageCanvas, setCharInpaintImageCanvas] = useState<HTMLCanvasElement | null>(null);
  const [charRegenTab, setCharRegenTab] = useState<"full" | "inpaint">("full");
  const [charInpaintAction, setCharInpaintAction] = useState<"fill" | "color">("fill");
  // ─── AI 재생성 모달 드래그 state ─────────────────────────────────
  const [charRegenDragPos, setCharRegenDragPos] = useState<{ x: number; y: number } | null>(null);
  const charRegenDragRef = useRef<{ startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null);
  const [selectedDrawingLayerId, setSelectedDrawingLayerId] = useState<string | null>(null);
  const panelCanvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const bubbleTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  type LeftTab = "image" | "ai" | "elements" | "tools" | "generative" | "guide" | null;
  const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>(null);
  type ElementsSubTab = "script" | "bubble" | "template";
  const [elementsSubTab, setElementsSubTab] = useState<ElementsSubTab>("script");
  const [selectedToolItem, setSelectedToolItem] = useState<string>("select");
  const [selectedScriptPosition, setSelectedScriptPosition] = useState<"top" | "bottom" | null>(null);
  const [showDrawingSettings, setShowDrawingSettings] = useState(false);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const [showStoryTemplatePicker, setShowStoryTemplatePicker] = useState(false);
  const [storyTemplateCatIdx, setStoryTemplateCatIdx] = useState(0);

  // ─── Drawing tool state ─────────────────────────────────────────────
  const [drawingToolState, setDrawingToolState] = useState<DrawingToolState>({
    tool: "brush",
    brushType: "ballpoint",
    color: "#000000",
    size: 4,
    opacity: 1,
  });
  const drawingCanvasRef = useRef<DrawingCanvasHandle | null>(null);

  // ─── Generative tool state ──────────────────────────────────────────────
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("brush");
  const [selectionBrushSize, setSelectionBrushSize] = useState(40);
  const [genPrompt, setGenPrompt] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const selectionCanvasRef = useRef<SelectionCanvasHandle | null>(null);
  type GenTool = "fill" | "expand" | "upscale" | "generate" | "object" | null;
  const [selectedGenTool, setSelectedGenTool] = useState<GenTool>("fill");
  const [expandTop, setExpandTop] = useState(0);
  const [expandRight, setExpandRight] = useState(0);
  const [expandBottom, setExpandBottom] = useState(0);
  const [expandLeft, setExpandLeft] = useState(0);
  const [selectedObjectColor, setSelectedObjectColor] = useState("#ef4444");
  const [floodFillTolerance, setFloodFillTolerance] = useState(32);
  type ObjectAction = "color" | "fill";
  const [objectAction, setObjectAction] = useState<ObjectAction>("fill");
  const isGenerativeMode = activeLeftTab === "generative" && (selectedGenTool === "fill" || selectedGenTool === "object");
  const isExpandMode = activeLeftTab === "generative" && selectedGenTool === "expand";

  // Helper: capture panel canvas at logical 540×675 (clean, no selection artifacts)
  const capturePanelClean = useCallback((panelId: string): string | null => {
    const canvas = panelCanvasRefs.current.get(panelId);
    if (!canvas) return null;
    // Render to an offscreen canvas at logical size to avoid DPR scaling
    const off = document.createElement("canvas");
    off.width = CANVAS_W;
    off.height = CANVAS_H;
    const ctx = off.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(canvas, 0, 0, CANVAS_W, CANVAS_H);
    return off.toDataURL("image/png");
  }, []);

  // Client-side flood fill object selection: click a point → instant mask via BFS
  const handleObjectSelectClick = useCallback((clickX: number, clickY: number) => {
    if (!activePanel) return;
    selectionCanvasRef.current?.floodFillAt(clickX, clickY, floodFillTolerance);
  }, [activePanel, floodFillTolerance]);

  // Helper: composite AI result with original using mask (only apply AI pixels where mask is white)
  const compositeWithMask = useCallback((originalDataUrl: string, aiResultDataUrl: string, maskDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const origImg = new Image();
      const aiImg = new Image();
      const maskImg = new Image();
      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded < 3) return;
        try {
          // Draw AI result onto a canvas
          const aiCanvas = document.createElement("canvas");
          aiCanvas.width = CANVAS_W;
          aiCanvas.height = CANVAS_H;
          const aiCtx = aiCanvas.getContext("2d")!;
          aiCtx.drawImage(aiImg, 0, 0, CANVAS_W, CANVAS_H);
          // Read mask pixels to determine which AI pixels to keep
          const maskCanvas = document.createElement("canvas");
          maskCanvas.width = CANVAS_W;
          maskCanvas.height = CANVAS_H;
          const mCtx = maskCanvas.getContext("2d")!;
          mCtx.drawImage(maskImg, 0, 0, CANVAS_W, CANVAS_H);
          const maskPixels = mCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
          // Set AI result alpha based on mask brightness (white=keep, black=discard)
          const aiPixels = aiCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
          for (let i = 0; i < maskPixels.data.length; i += 4) {
            const brightness = maskPixels.data[i]; // R channel (0=black, 255=white)
            aiPixels.data[i + 3] = brightness > 128 ? 255 : 0;
          }
          aiCtx.putImageData(aiPixels, 0, 0);
          // Composite: original as base + masked AI result on top
          const off = document.createElement("canvas");
          off.width = CANVAS_W;
          off.height = CANVAS_H;
          const ctx = off.getContext("2d")!;
          ctx.drawImage(origImg, 0, 0, CANVAS_W, CANVAS_H);
          ctx.drawImage(aiCanvas, 0, 0);
          resolve(off.toDataURL("image/png"));
        } catch (err) {
          reject(err);
        }
      };
      origImg.onload = onLoad;
      aiImg.onload = onLoad;
      maskImg.onload = onLoad;
      origImg.onerror = reject;
      aiImg.onerror = reject;
      maskImg.onerror = reject;
      origImg.src = originalDataUrl;
      aiImg.src = aiResultDataUrl;
      maskImg.src = maskDataUrl;
    });
  }, []);

  // Helper: load data URL into panel as background image
  const applyImageToPanel = useCallback((panelIdx: number, dataUrl: string) => {
    const panel = panels[panelIdx];
    if (!panel) return;
    const img = new Image();
    img.onload = () => {
      updatePanel(panelIdx, { ...panel, backgroundImageUrl: dataUrl, backgroundImageEl: img });
    };
    img.src = dataUrl;
  }, [panels, updatePanel]);

  const WEBTOON_COLOR_PRESETS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6",
    "#fca5a5", "#fdba74", "#fde047", "#86efac", "#93c5fd", "#c4b5fd",
    "#fde8d4", "#f5d0b0", "#e8b88a", "#d4956b", "#b87449", "#8b5e3c",
    "#1e293b", "#334155", "#6b7280", "#9ca3af", "#d1d5db", "#ffffff",
    "#ec4899", "#f472b6", "#a78bfa", "#67e8f9", "#2dd4bf", "#a3e635",
  ];

  const applyColorToSelection = useCallback(async () => {
    const mask = selectionCanvasRef.current?.exportMask();
    if (!mask) {
      toast({ title: "영역을 먼저 선택해주세요", variant: "destructive" });
      return;
    }
    if (!activePanel) return;
    const imageData = capturePanelClean(activePanel.id);
    if (!imageData) return;

    // Parse target color hex → HSL
    const hexToRgb = (hex: string) => {
      const h = hex.replace("#", "");
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] as [number, number, number];
    };
    const [tR, tG, tB] = hexToRgb(selectedObjectColor);
    const [targetH, targetS] = rgbToHsl(tR, tG, tB);

    // Load image and mask
    const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    try {
      setGenLoading(true);
      const [imgEl, maskEl] = await Promise.all([loadImg(imageData), loadImg(mask)]);

      const off = document.createElement("canvas");
      off.width = CANVAS_W;
      off.height = CANVAS_H;
      const ctx = off.getContext("2d")!;

      // Draw original image
      ctx.drawImage(imgEl, 0, 0, CANVAS_W, CANVAS_H);
      const imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);

      // Draw mask
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = CANVAS_W;
      maskCanvas.height = CANVAS_H;
      const maskCtx = maskCanvas.getContext("2d")!;
      maskCtx.drawImage(maskEl, 0, 0, CANVAS_W, CANVAS_H);
      const maskData = maskCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);

      // Apply color: for white mask pixels, replace H/S while keeping L
      const pixels = imgData.data;
      const maskPx = maskData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const mBright = (maskPx[i] + maskPx[i + 1] + maskPx[i + 2]) / 3;
        if (mBright < 128) continue; // not in mask

        const [, , l] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
        if (l < 0.08 || l > 0.95) continue; // skip outlines and near-white

        const [r, g, b] = hslToRgb(targetH, targetS, l);
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
      }

      ctx.putImageData(imgData, 0, 0);
      const resultUrl = off.toDataURL("image/png");
      // Flatten characters & drawing layers into the background
      // (they are already baked into the captured image, so clearing them
      //  prevents originals from rendering on top and hiding the color change)
      const panel = panels[activePanelIndex];
      if (panel) {
        const img = new Image();
        img.onload = () => {
          updatePanel(activePanelIndex, {
            ...panel,
            backgroundImageUrl: resultUrl,
            backgroundImageEl: img,
            characters: [],
            drawingLayers: [],
          });
        };
        img.src = resultUrl;
      }
      selectionCanvasRef.current?.clearSelection();
      toast({ title: "색상 변경 완료" });
    } catch (err: any) {
      toast({ title: "색상 변경 실패", description: err.message, variant: "destructive" });
    } finally {
      setGenLoading(false);
    }
  }, [activePanel, activePanelIndex, selectedObjectColor, capturePanelClean, panels, updatePanel, toast]);

  const isDrawingMode = activeLeftTab === "tools" && selectedToolItem === "drawing";
  const isTextMode = activeLeftTab === "tools" && selectedToolItem === "text";
  const isLineMode = activeLeftTab === "tools" && selectedToolItem === "line";
  const isShapeMode = activeLeftTab === "tools" && selectedToolItem === "shapes";

  // ─── Context toolbar state ────────────────────────────────────────────
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [showLineSettings, setShowLineSettings] = useState(false);
  const [showDrawingContextSettings, setShowDrawingContextSettings] = useState(false);
  const [showBubbleSettings, setShowBubbleSettings] = useState(false);
  const [drawingLayerSelected, setDrawingLayerSelected] = useState(false);
  const [selectedLineSubType, setSelectedLineSubType] = useState<LineType>("straight");
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [showShapeSettings, setShowShapeSettings] = useState(false);
  const [selectedShapeType, setSelectedShapeType] = useState<ShapeType>("rectangle");

  // ─── Character regeneration ─────────────────────────────────────────
  const regenerateCharImage = useCallback(async (charId: string, panelIdx: number, prompt: string, mode: "prompt" | "variation") => {
    const p = panels[panelIdx];
    if (!p) return;
    const char = p.characters.find(c => c.id === charId);
    if (!char || !char.imageUrl) return;

    setCharRegenLoading(true);
    try {
      const bgPrompt = mode === "prompt"
        ? prompt
        : "same character in a completely different dynamic pose and expression, keeping exact same art style and character features";
      const res = await apiRequest("POST", "/api/generate-background", {
        sourceImageDataList: [char.imageUrl],
        backgroundPrompt: bgPrompt,
        noBackground: true,
        skipGallery: true,
      });
      const data = await res.json();
      if (data.imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setPanels(prev => prev.map((pan, idx) => {
            if (idx !== panelIdx) return pan;
            return {
              ...pan,
              characters: pan.characters.map(c =>
                c.id === charId ? { ...c, imageUrl: data.imageUrl, imageEl: img } : c
              ),
            };
          }));
          setCharRegenLoading(false);
          setShowCharRegenPanel(false);
          setCharRegenPrompt("");
        };
        img.onerror = () => setCharRegenLoading(false);
        img.src = data.imageUrl;
      } else {
        setCharRegenLoading(false);
      }
    } catch {
      setCharRegenLoading(false);
    }
  }, [panels, setPanels]);

  // ─── Character inpaint (부분 수정) generate ─────────────────────────
  const charInpaintGenerate = useCallback(async (charId: string, panelIdx: number, prompt: string) => {
    const p = panels[panelIdx];
    if (!p) return;
    const char = p.characters.find(c => c.id === charId);
    if (!char || !char.imageUrl || !char.imageEl) return;

    const mask = charInpaintSelectionRef.current?.exportMask();
    if (!mask) {
      toast({ title: "수정할 영역을 먼저 선택해주세요", variant: "destructive" });
      return;
    }

    setCharInpaintLoading(true);
    try {
      // Get character image as data URL
      let charImageData: string;
      if (char.imageUrl.startsWith("data:")) {
        charImageData = char.imageUrl;
      } else {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = char.imageEl.naturalWidth;
        tmpCanvas.height = char.imageEl.naturalHeight;
        const tmpCtx = tmpCanvas.getContext("2d")!;
        tmpCtx.drawImage(char.imageEl, 0, 0);
        charImageData = tmpCanvas.toDataURL("image/png");
      }

      // If flipX, flip the mask horizontally
      let finalMask = mask;
      if (char.flipX) {
        const flipCanvas = document.createElement("canvas");
        const maskImg = await loadImage(mask);
        flipCanvas.width = maskImg.naturalWidth;
        flipCanvas.height = maskImg.naturalHeight;
        const flipCtx = flipCanvas.getContext("2d")!;
        flipCtx.translate(flipCanvas.width, 0);
        flipCtx.scale(-1, 1);
        flipCtx.drawImage(maskImg, 0, 0);
        finalMask = flipCanvas.toDataURL("image/png");
      }

      const resp = await apiRequest("POST", "/api/generative-fill", {
        imageData: charImageData,
        maskData: finalMask,
        prompt,
      });
      const data = await resp.json();
      if (data.imageUrl) {
        // Composite: original image as base, AI result only in masked area
        const compositeCharWithMask = (origSrc: string, aiSrc: string, maskSrc: string): Promise<string> => {
          return new Promise((resolve, reject) => {
            const origEl = new Image();
            const aiEl = new Image();
            const maskEl = new Image();
            let loaded = 0;
            const onLoad = () => {
              loaded++;
              if (loaded < 3) return;
              try {
                const w = origEl.naturalWidth;
                const h = origEl.naturalHeight;
                // Draw AI result, apply mask as alpha
                const aiCanvas = document.createElement("canvas");
                aiCanvas.width = w;
                aiCanvas.height = h;
                const aiCtx = aiCanvas.getContext("2d")!;
                aiCtx.drawImage(aiEl, 0, 0, w, h);
                const maskCanvas = document.createElement("canvas");
                maskCanvas.width = w;
                maskCanvas.height = h;
                const mCtx = maskCanvas.getContext("2d")!;
                mCtx.drawImage(maskEl, 0, 0, w, h);
                const maskPixels = mCtx.getImageData(0, 0, w, h);
                const aiPixels = aiCtx.getImageData(0, 0, w, h);
                for (let px = 0; px < maskPixels.data.length; px += 4) {
                  const brightness = maskPixels.data[px]; // R channel
                  aiPixels.data[px + 3] = brightness > 128 ? aiPixels.data[px + 3] : 0;
                }
                aiCtx.putImageData(aiPixels, 0, 0);
                // Composite: original base + masked AI on top
                const off = document.createElement("canvas");
                off.width = w;
                off.height = h;
                const ctx = off.getContext("2d")!;
                ctx.drawImage(origEl, 0, 0, w, h);
                ctx.drawImage(aiCanvas, 0, 0);
                resolve(off.toDataURL("image/png"));
              } catch (err) { reject(err); }
            };
            origEl.onload = onLoad;
            aiEl.onload = onLoad;
            maskEl.onload = onLoad;
            origEl.onerror = reject;
            aiEl.onerror = reject;
            maskEl.onerror = reject;
            origEl.src = origSrc;
            aiEl.src = aiSrc;
            maskEl.src = maskSrc;
          });
        };

        const compositedUrl = await compositeCharWithMask(charImageData, data.imageUrl, finalMask);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setPanels(prev => prev.map((pan, idx) => {
            if (idx !== panelIdx) return pan;
            return {
              ...pan,
              characters: pan.characters.map(c =>
                c.id === charId ? { ...c, imageUrl: compositedUrl, imageEl: img } : c
              ),
            };
          }));
          setCharInpaintLoading(false);
          charInpaintSelectionRef.current?.clearSelection();
          setCharInpaintPrompt("");
          toast({ title: "부분 수정 완료" });
          queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
        };
        img.onerror = () => setCharInpaintLoading(false);
        img.src = compositedUrl;
      } else {
        setCharInpaintLoading(false);
      }
    } catch (err: any) {
      toast({ title: "부분 수정 실패", description: err.message, variant: "destructive" });
      setCharInpaintLoading(false);
    }
  }, [panels, setPanels, toast]);

  // Helper: load image as promise
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  // Character inpaint: 빠른선택/개체선택 (local flood fill on character image)
  const handleCharInpaintQuickSelect = useCallback((clickX: number, clickY: number) => {
    charInpaintSelectionRef.current?.floodFillAt(clickX, clickY, floodFillTolerance);
  }, [floodFillTolerance]);

  // Character inpaint: 색상 변경 (apply color to selected area of character)
  const applyColorToCharSelection = useCallback(async () => {
    const mask = charInpaintSelectionRef.current?.exportMask();
    if (!mask) {
      toast({ title: "영역을 먼저 선택해주세요", variant: "destructive" });
      return;
    }
    const p = panels[activePanelIndex];
    if (!p || !selectedCharId) return;
    const char = p.characters.find(c => c.id === selectedCharId);
    if (!char?.imageEl) return;

    const hexToRgb = (hex: string) => {
      const h = hex.replace("#", "");
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] as [number, number, number];
    };
    const [tR, tG, tB] = hexToRgb(selectedObjectColor);
    const [targetH, targetS] = rgbToHsl(tR, tG, tB);

    const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    try {
      const natW = char.imageEl.naturalWidth;
      const natH = char.imageEl.naturalHeight;

      // Use crossOrigin image to avoid tainted canvas
      let srcImg = char.imageEl;
      if (char.imageUrl && !char.imageUrl.startsWith("data:")) {
        try {
          const tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = 1; tmpCanvas.height = 1;
          const tmpCtx = tmpCanvas.getContext("2d")!;
          tmpCtx.drawImage(char.imageEl, 0, 0);
          tmpCtx.getImageData(0, 0, 1, 1); // test taint
        } catch {
          // Tainted — reload with CORS
          srcImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = char.imageUrl!;
          });
        }
      }

      const charCanvas = document.createElement("canvas");
      charCanvas.width = natW;
      charCanvas.height = natH;
      const charCtx = charCanvas.getContext("2d")!;
      charCtx.drawImage(srcImg, 0, 0);
      const imgData = charCtx.getImageData(0, 0, natW, natH);

      const maskEl = await loadImg(mask);
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = natW;
      maskCanvas.height = natH;
      const maskCtx = maskCanvas.getContext("2d")!;
      maskCtx.drawImage(maskEl, 0, 0, natW, natH);
      const maskImgData = maskCtx.getImageData(0, 0, natW, natH);

      const pixels = imgData.data;
      const maskPx = maskImgData.data;
      for (let idx = 0; idx < pixels.length; idx += 4) {
        const mBright = (maskPx[idx] + maskPx[idx + 1] + maskPx[idx + 2]) / 3;
        if (mBright < 128) continue;
        const [, , l] = rgbToHsl(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
        if (l < 0.08 || l > 0.95) continue;
        const [r, g, b] = hslToRgb(targetH, targetS, l);
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
      }

      charCtx.putImageData(imgData, 0, 0);
      const resultUrl = charCanvas.toDataURL("image/png");
      const newImg = await loadImg(resultUrl);

      updatePanel(activePanelIndex, {
        ...p,
        characters: p.characters.map(c =>
          c.id === selectedCharId ? { ...c, imageUrl: resultUrl, imageEl: newImg } : c
        ),
      });

      charInpaintSelectionRef.current?.clearSelection();
      // Rebuild imageSource canvas with new image
      const newCanvas = document.createElement("canvas");
      newCanvas.width = natW;
      newCanvas.height = natH;
      newCanvas.getContext("2d")!.drawImage(newImg, 0, 0);
      setCharInpaintImageCanvas(newCanvas);

      toast({ title: "색상 변경 완료" });
    } catch (err: any) {
      toast({ title: "색상 변경 실패", description: err.message, variant: "destructive" });
    }
  }, [panels, activePanelIndex, selectedCharId, selectedObjectColor, updatePanel, toast]);

  // Build character image canvas for flood fill imageSource
  useEffect(() => {
    if (!charInpaintMode || !selectedCharId) {
      setCharInpaintImageCanvas(null);
      return;
    }
    const p = panels[activePanelIndex];
    if (!p) return;
    const char = p.characters.find(c => c.id === selectedCharId);
    if (!char?.imageEl) return;

    const buildCanvas = (imgEl: HTMLImageElement) => {
      const canvas = document.createElement("canvas");
      canvas.width = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(imgEl, 0, 0);
      // Test if canvas is tainted
      try {
        ctx.getImageData(0, 0, 1, 1);
        setCharInpaintImageCanvas(canvas);
      } catch {
        // Canvas tainted — reload with crossOrigin
        const src = char.imageUrl || imgEl.src;
        if (!src || src.startsWith("data:")) {
          // data URL should never be tainted, fallback anyway
          setCharInpaintImageCanvas(canvas);
          return;
        }
        const corsImg = new Image();
        corsImg.crossOrigin = "anonymous";
        corsImg.onload = () => {
          const c2 = document.createElement("canvas");
          c2.width = corsImg.naturalWidth;
          c2.height = corsImg.naturalHeight;
          c2.getContext("2d")!.drawImage(corsImg, 0, 0);
          setCharInpaintImageCanvas(c2);
        };
        corsImg.onerror = () => {
          // Last resort: use tainted canvas (flood fill won't work, but brush/lasso will)
          setCharInpaintImageCanvas(canvas);
        };
        corsImg.src = src;
      }
    };

    buildCanvas(char.imageEl);
  }, [charInpaintMode, selectedCharId, panels, activePanelIndex]);

  // ─── Multi-select state ────────────────────────────────────────────
  const [canvasMultiSelected, setCanvasMultiSelected] = useState<Set<string>>(new Set());
  const canvasMultiSelectedRef = useRef<Set<string>>(canvasMultiSelected);
  useEffect(() => { canvasMultiSelectedRef.current = canvasMultiSelected; }, [canvasMultiSelected]);

  const rubberBandRef = useRef<{ active: boolean; startX: number; startY: number; curX: number; curY: number; panelIdx: number } | null>(null);
  const [rubberBandRect, setRubberBandRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const dragRafRef = useRef<number>(0);
  const pendingDragRef = useRef<{ canvasX: number; canvasY: number; panelIdx: number } | null>(null);

  const multiDragRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    panelIdx: number;
    startPositions: Map<string, { x: number; y: number } | { points: { x: number; y: number }[] }>;
  } | null>(null);

  // Canvas overlay context menu state
  const [overlayContextMenu, setOverlayContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Helper: get selected text element
  const selectedTextElement = selectedTextId && panels[activePanelIndex]
    ? panels[activePanelIndex].textElements?.find((t) => t.id === selectedTextId) ?? null
    : null;

  // Helper: get selected line element
  const selectedLineElement = selectedLineId && panels[activePanelIndex]
    ? panels[activePanelIndex].lineElements?.find((l) => l.id === selectedLineId) ?? null
    : null;

  // Helper: get selected shape element
  const selectedShapeElement = selectedShapeId && panels[activePanelIndex]
    ? (panels[activePanelIndex].shapeElements || []).find((s) => s.id === selectedShapeId) ?? null
    : null;

  // ─── Text/Line creation handlers ──────────────────────────────────────
  const handleAddText = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const newText = createTextElement(CANVAS_W, CANVAS_H);
    const updated = { ...p, textElements: [...(p.textElements || []), newText] };
    updatePanel(activePanelIndex, updated);
    setSelectedTextId(newText.id);
    setSelectedLineId(null);
    setSelectedBubbleId(null);
    setSelectedCharId(null);
    // Auto-open editing for the new text element
    setTimeout(() => setEditingTextId(newText.id), 100);
  }, [panels, activePanelIndex, updatePanel]);

  const handleAddLine = useCallback((lineType: LineType) => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const newLine = createLineElement(CANVAS_W, CANVAS_H, lineType);
    const updated = { ...p, lineElements: [...(p.lineElements || []), newLine] };
    updatePanel(activePanelIndex, updated);
    setSelectedLineId(newLine.id);
    setSelectedTextId(null);
    setSelectedBubbleId(null);
    setSelectedCharId(null);
  }, [panels, activePanelIndex, updatePanel]);

  const handleUpdateTextElement = useCallback((updated: CanvasTextElement) => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const newTexts = (p.textElements || []).map((t) => t.id === updated.id ? updated : t);
    updatePanel(activePanelIndex, { ...p, textElements: newTexts });
  }, [panels, activePanelIndex, updatePanel]);

  const handleUpdateLineElement = useCallback((updated: CanvasLineElement) => {
    const p = panels[activePanelIndex];
    if (!p) return;
    // borderStyle 변경 감지 → 포인트 재생성
    const prev = (p.lineElements || []).find((l) => l.id === updated.id);
    if (prev && (prev as any).borderStyle && (updated as any).borderStyle && (prev as any).borderStyle !== (updated as any).borderStyle) {
      const pts = updated.points;
      if (pts.length > 2) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const pt of pts) {
          if (pt.x < minX) minX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y > maxY) maxY = pt.y;
        }
        const newPts = regenerateBorderPoints(minX, minY, maxX - minX, maxY - minY, (updated as any).borderStyle);
        updated = { ...updated, points: newPts };
      }
    }
    const newLines = (p.lineElements || []).map((l) => l.id === updated.id ? updated : l);
    updatePanel(activePanelIndex, { ...p, lineElements: newLines });
  }, [panels, activePanelIndex, updatePanel]);

  const handleAddShape = useCallback((shapeType: ShapeType) => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const newShape = createShapeElement(CANVAS_W, CANVAS_H, shapeType);
    const updated = { ...p, shapeElements: [...(p.shapeElements || []), newShape] };
    updatePanel(activePanelIndex, updated);
    setSelectedShapeId(newShape.id);
    setSelectedTextId(null);
    setSelectedLineId(null);
    setSelectedBubbleId(null);
    setSelectedCharId(null);
    setSelectedDrawingLayerId(null);
  }, [panels, activePanelIndex, updatePanel]);

  const handleUpdateShapeElement = useCallback((updated: CanvasShapeElement) => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const newShapes = (p.shapeElements || []).map((s) => s.id === updated.id ? updated : s);
    updatePanel(activePanelIndex, { ...p, shapeElements: newShapes });
  }, [panels, activePanelIndex, updatePanel]);

  // Clear drawing layer selection on panel switch
  useEffect(() => {
    setSelectedDrawingLayerId(null);
  }, [activePanelIndex]);

  // Hit test drawing layers — returns topmost visible layer at (canvasX, canvasY)
  const hitTestDrawingLayers = useCallback((
    layers: DrawingLayer[], canvasX: number, canvasY: number,
    canvasWidth: number, canvasHeight: number
  ): DrawingLayer | null => {
    const sorted = [...layers].filter(l => l.visible).sort((a, b) => b.zIndex - a.zIndex);
    const testCanvas = document.createElement("canvas");
    testCanvas.width = canvasWidth;
    testCanvas.height = canvasHeight;
    const ctx = testCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    for (const layer of sorted) {
      if (!(layer.imageEl instanceof HTMLImageElement)) continue;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(layer.imageEl, 0, 0);
      const testX = Math.floor(canvasX - (layer.x ?? 0));
      const testY = Math.floor(canvasY - (layer.y ?? 0));
      if (testX < 0 || testY < 0 || testX >= canvasWidth || testY >= canvasHeight) continue;
      const pixel = ctx.getImageData(testX, testY, 1, 1);
      if (pixel.data[3] > 10) return layer;
    }
    return null;
  }, []);

  // Drawing layer undo/redo
  const drawingUndoStackRef = useRef<DrawingLayer[]>([]);

  const handleDrawingUndo = useCallback(() => {
    if (!activePanel || !activePanel.drawingLayers || activePanel.drawingLayers.length === 0) return;
    const layers = [...activePanel.drawingLayers];
    const removed = layers.pop()!;
    drawingUndoStackRef.current = [...drawingUndoStackRef.current, removed];
    updatePanel(activePanelIndex, { ...activePanel, drawingLayers: layers });
  }, [activePanel, activePanelIndex]);

  const handleDrawingRedo = useCallback(() => {
    if (drawingUndoStackRef.current.length === 0 || !activePanel) return;
    const stack = [...drawingUndoStackRef.current];
    const restored = stack.pop()!;
    drawingUndoStackRef.current = stack;
    updatePanel(activePanelIndex, { ...activePanel, drawingLayers: [...(activePanel.drawingLayers || []), restored] });
  }, [activePanel, activePanelIndex]);

  const handleDrawingClear = useCallback(() => {
    if (!activePanel) return;
    drawingUndoStackRef.current = [];
    updatePanel(activePanelIndex, { ...activePanel, drawingLayers: [] });
  }, [activePanel, activePanelIndex]);

  // Text tool input state
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState("");

  // Text element inline editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Drag state for text/line/shape/char/bubble element movement
  const dragElementRef = useRef<{
    type: "text" | "line" | "drawing" | "shape" | "char" | "bubble";
    id: string;
    startMouseX: number;
    startMouseY: number;
    startPositions: { x: number; y: number }[];
    resizeMode?: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r" | "move-tail" | "tail-ctrl1" | "tail-ctrl2" | "tail-ctrl3" | "tail-ctrl4" | "rotate";
    startW?: number;
    startH?: number;
    startScale?: number;
    startRotation?: number;
    rotateAngleStart?: number;
    // For mask group movement: linked layer start positions
    linkedStarts?: Map<string, { x: number; y: number } | { points: { x: number; y: number }[] }>;
  } | null>(null);

  // Drag state for script (top/bottom) movement/resize from overlay
  const dragScriptOverlayRef = useRef<{
    position: "top" | "bottom";
    mode: "move" | "resize";
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    startFontSize: number;
    startW: number;
    startH: number;
    panelIdx: number;
  } | null>(null);

  const handleElementDragStart = useCallback((
    type: "text" | "line" | "drawing" | "shape" | "char" | "bubble",
    id: string,
    mouseX: number,
    mouseY: number,
    panel: PanelData,
    resizeMode?: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r" | "move-tail" | "tail-ctrl1" | "tail-ctrl2" | "tail-ctrl3" | "tail-ctrl4" | "rotate",
  ) => {
    // Push one undo snapshot at drag start
    historyRef.current = [
      ...historyRef.current.slice(-(MAX_HISTORY - 1)),
      clonePanels(panels),
    ];
    futureRef.current = [];

    if (type === "bubble") {
      const b = panel.bubbles.find(bb => bb.id === id);
      if (b) {
        dragElementRef.current = {
          type: "bubble",
          id,
          startMouseX: mouseX,
          startMouseY: mouseY,
          startPositions: [{ x: b.x, y: b.y }],
          resizeMode,
          startW: b.width,
          startH: b.height,
        };
      }
    } else if (type === "char") {
      const ch = panel.characters.find(c => c.id === id);
      if (ch) {
        const cw = ch.imageEl ? ch.imageEl.naturalWidth * ch.scale : 80;
        const chH = ch.imageEl ? ch.imageEl.naturalHeight * ch.scale : 80;
        dragElementRef.current = {
          type: "char",
          id,
          startMouseX: mouseX,
          startMouseY: mouseY,
          startPositions: [{ x: ch.x, y: ch.y }],
          resizeMode,
          startScale: ch.scale,
          startW: cw,
          startH: chH,
          startRotation: ch.rotation || 0,
          rotateAngleStart: resizeMode === "rotate" ? Math.atan2(mouseY - ch.y, mouseX - ch.x) : undefined,
        };
      }
    } else if (type === "text") {
      const te = (panel.textElements || []).find(t => t.id === id);
      if (te) {
        dragElementRef.current = {
          type: "text",
          id,
          startMouseX: mouseX,
          startMouseY: mouseY,
          startPositions: [{ x: te.x, y: te.y }],
          resizeMode,
          startW: te.width,
          startH: te.height,
        };
      }
    } else if (type === "line") {
      const le = (panel.lineElements || []).find(l => l.id === id);
      if (le) {
        dragElementRef.current = {
          type: "line",
          id,
          startMouseX: mouseX,
          startMouseY: mouseY,
          startPositions: le.points.map(p => ({ x: p.x, y: p.y })),
        };
      }
    } else if (type === "drawing") {
      const dl = (panel.drawingLayers || []).find(l => l.id === id);
      if (dl) {
        dragElementRef.current = {
          type: "drawing",
          id,
          startMouseX: mouseX,
          startMouseY: mouseY,
          startPositions: [{ x: dl.x ?? 0, y: dl.y ?? 0 }],
          resizeMode,
          startW: dl.width ?? CANVAS_W,
          startH: dl.height ?? CANVAS_H,
        };
      }
    } else if (type === "shape") {
      const se = (panel.shapeElements || []).find(s => s.id === id);
      if (se) {
        // Capture linked layer start positions for mask group movement
        let linkedStarts: Map<string, { x: number; y: number } | { points: { x: number; y: number }[] }> | undefined;
        if (se.maskEnabled && se.maskedLayerIds && se.maskedLayerIds.length > 0 && !resizeMode) {
          linkedStarts = new Map();
          const maskedSet = new Set(se.maskedLayerIds);
          for (const c of panel.characters) {
            if (maskedSet.has(c.id)) linkedStarts.set(c.id, { x: c.x, y: c.y });
          }
          for (const b of panel.bubbles) {
            if (maskedSet.has(b.id)) linkedStarts.set(b.id, { x: b.x, y: b.y });
          }
          for (const dl of (panel.drawingLayers || [])) {
            if (maskedSet.has(dl.id)) linkedStarts.set(dl.id, { x: dl.x ?? 0, y: dl.y ?? 0 });
          }
          for (const te of (panel.textElements || [])) {
            if (maskedSet.has(te.id)) linkedStarts.set(te.id, { x: te.x, y: te.y });
          }
          for (const le of (panel.lineElements || [])) {
            if (maskedSet.has(le.id)) linkedStarts.set(le.id, { points: le.points.map(pt => ({ x: pt.x, y: pt.y })) });
          }
        }
        dragElementRef.current = {
          type: "shape",
          id,
          startMouseX: mouseX,
          startMouseY: mouseY,
          startPositions: [{ x: se.x, y: se.y }],
          resizeMode,
          startW: se.width,
          startH: se.height,
          linkedStarts,
        };
      }
    }
  }, [panels]);

  const handleElementDragMove = useCallback((mouseX: number, mouseY: number, panelIdx: number) => {
    const drag = dragElementRef.current;
    if (!drag) return;
    const p = panels[panelIdx];
    if (!p) return;
    const dx = mouseX - drag.startMouseX;
    const dy = mouseY - drag.startMouseY;

    if (drag.type === "bubble") {
      // Tail handle modes — directly set tail position to mouse coords
      if (drag.resizeMode === "move-tail" || drag.resizeMode === "tail-ctrl1" || drag.resizeMode === "tail-ctrl2" || drag.resizeMode === "tail-ctrl3" || drag.resizeMode === "tail-ctrl4") {
        const newBubbles = p.bubbles.map(b => {
          if (b.id !== drag.id) return b;
          if (drag.resizeMode === "move-tail") return { ...b, tailTipX: mouseX, tailTipY: mouseY };
          if (drag.resizeMode === "tail-ctrl1") return { ...b, tailCtrl1X: mouseX, tailCtrl1Y: mouseY };
          if (drag.resizeMode === "tail-ctrl2") return { ...b, tailCtrl2X: mouseX, tailCtrl2Y: mouseY };
          if (drag.resizeMode === "tail-ctrl3") return { ...b, tailCtrl3X: mouseX, tailCtrl3Y: mouseY };
          if (drag.resizeMode === "tail-ctrl4") return { ...b, tailCtrl4X: mouseX, tailCtrl4Y: mouseY };
          return b;
        });
        updatePanelNoHistory(panelIdx, { ...p, bubbles: newBubbles });
        return;
      }
      const newBubbles = p.bubbles.map(b => {
        if (b.id !== drag.id) return b;
        if (drag.resizeMode) {
          const startX = drag.startPositions[0].x;
          const startY = drag.startPositions[0].y;
          const startW = drag.startW ?? b.width;
          const startH = drag.startH ?? b.height;
          let newX = startX, newY = startY, newW = startW, newH = startH;
          switch (drag.resizeMode) {
            case "br": newW = Math.max(20, startW + dx); newH = Math.max(20, startH + dy); break;
            case "bl": newX = startX + dx; newW = Math.max(20, startW - dx); newH = Math.max(20, startH + dy); break;
            case "tr": newY = startY + dy; newW = Math.max(20, startW + dx); newH = Math.max(20, startH - dy); break;
            case "tl": newX = startX + dx; newY = startY + dy; newW = Math.max(20, startW - dx); newH = Math.max(20, startH - dy); break;
            case "r": newW = Math.max(20, startW + dx); break;
            case "l": newX = startX + dx; newW = Math.max(20, startW - dx); break;
            case "b": newH = Math.max(20, startH + dy); break;
            case "t": newY = startY + dy; newH = Math.max(20, startH - dy); break;
          }
          return { ...b, x: newX, y: newY, width: newW, height: newH };
        }
        return { ...b, x: drag.startPositions[0].x + dx, y: drag.startPositions[0].y + dy };
      });
      updatePanelNoHistory(panelIdx, { ...p, bubbles: newBubbles });
    } else if (drag.type === "char") {
      const newChars = p.characters.map(ch => {
        if (ch.id !== drag.id) return ch;
        if (drag.resizeMode === "rotate") {
          const cx = drag.startPositions[0].x;
          const cy = drag.startPositions[0].y;
          const currentAngle = Math.atan2(mouseY - cy, mouseX - cx);
          const startAngle = drag.rotateAngleStart ?? 0;
          const baseRotation = drag.startRotation ?? (ch.rotation || 0);
          return { ...ch, rotation: baseRotation + (currentAngle - startAngle) };
        }
        if (drag.resizeMode) {
          // Smooth proportional scaling via distance from element center
          const cx = drag.startPositions[0].x;
          const cy = drag.startPositions[0].y;
          const d0 = Math.max(1, Math.sqrt((drag.startMouseX - cx) ** 2 + (drag.startMouseY - cy) ** 2));
          const d1 = Math.sqrt((mouseX - cx) ** 2 + (mouseY - cy) ** 2);
          const ratio = d1 / d0;
          const newScale = Math.max(0.05, Math.min(5, (drag.startScale ?? ch.scale) * ratio));
          return { ...ch, scale: newScale };
        }
        return { ...ch, x: drag.startPositions[0].x + dx, y: drag.startPositions[0].y + dy };
      });
      updatePanelNoHistory(panelIdx, { ...p, characters: newChars });
    } else if (drag.type === "text") {
      const newTexts = (p.textElements || []).map(te => {
        if (te.id !== drag.id) return te;
        if (drag.resizeMode) {
          const startX = drag.startPositions[0].x;
          const startY = drag.startPositions[0].y;
          const startW = drag.startW ?? te.width;
          const startH = drag.startH ?? te.height;
          let newX = startX, newY = startY, newW = startW, newH = startH;
          switch (drag.resizeMode) {
            case "br": newW = Math.max(40, startW + dx); newH = Math.max(20, startH + dy); break;
            case "bl": newX = startX + dx; newW = Math.max(40, startW - dx); newH = Math.max(20, startH + dy); break;
            case "tr": newY = startY + dy; newW = Math.max(40, startW + dx); newH = Math.max(20, startH - dy); break;
            case "tl": newX = startX + dx; newY = startY + dy; newW = Math.max(40, startW - dx); newH = Math.max(20, startH - dy); break;
            case "r": newW = Math.max(40, startW + dx); break;
            case "l": newX = startX + dx; newW = Math.max(40, startW - dx); break;
            case "b": newH = Math.max(20, startH + dy); break;
            case "t": newY = startY + dy; newH = Math.max(20, startH - dy); break;
          }
          return { ...te, x: newX, y: newY, width: newW, height: newH };
        }
        return { ...te, x: drag.startPositions[0].x + dx, y: drag.startPositions[0].y + dy };
      });
      updatePanelNoHistory(panelIdx, { ...p, textElements: newTexts });
    } else if (drag.type === "line") {
      const newLines = (p.lineElements || []).map(le => {
        if (le.id !== drag.id) return le;
        return {
          ...le,
          points: le.points.map((pt, i) => ({
            x: drag.startPositions[i].x + dx,
            y: drag.startPositions[i].y + dy,
          })),
        };
      });
      updatePanelNoHistory(panelIdx, { ...p, lineElements: newLines });
    } else if (drag.type === "drawing") {
      const newLayers = (p.drawingLayers || []).map(dl => {
        if (dl.id !== drag.id) return dl;
        if (drag.resizeMode) {
          const startX = drag.startPositions[0].x;
          const startY = drag.startPositions[0].y;
          const startW = drag.startW ?? CANVAS_W;
          const startH = drag.startH ?? CANVAS_H;
          let newX = startX, newY = startY, newW = startW, newH = startH;
          switch (drag.resizeMode) {
            case "br":
              newW = Math.max(20, startW + dx);
              newH = Math.max(20, startH + dy);
              break;
            case "bl":
              newX = startX + dx;
              newW = Math.max(20, startW - dx);
              newH = Math.max(20, startH + dy);
              break;
            case "tr":
              newY = startY + dy;
              newW = Math.max(20, startW + dx);
              newH = Math.max(20, startH - dy);
              break;
            case "tl":
              newX = startX + dx;
              newY = startY + dy;
              newW = Math.max(20, startW - dx);
              newH = Math.max(20, startH - dy);
              break;
          }
          return { ...dl, x: newX, y: newY, width: newW, height: newH };
        }
        return { ...dl, x: drag.startPositions[0].x + dx, y: drag.startPositions[0].y + dy };
      });
      updatePanelNoHistory(panelIdx, { ...p, drawingLayers: newLayers });
    } else if (drag.type === "shape") {
      const draggedShape = (p.shapeElements || []).find(se => se.id === drag.id);
      const newShapes = (p.shapeElements || []).map(se => {
        if (se.id !== drag.id) return se;
        if (drag.resizeMode) {
          const startX = drag.startPositions[0].x;
          const startY = drag.startPositions[0].y;
          const startW = drag.startW ?? se.width;
          const startH = drag.startH ?? se.height;
          let newX = startX, newY = startY, newW = startW, newH = startH;
          switch (drag.resizeMode) {
            case "br":
              newW = Math.max(20, startW + dx);
              newH = Math.max(20, startH + dy);
              break;
            case "bl":
              newX = startX + dx;
              newW = Math.max(20, startW - dx);
              newH = Math.max(20, startH + dy);
              break;
            case "tr":
              newY = startY + dy;
              newW = Math.max(20, startW + dx);
              newH = Math.max(20, startH - dy);
              break;
            case "tl":
              newX = startX + dx;
              newY = startY + dy;
              newW = Math.max(20, startW - dx);
              newH = Math.max(20, startH - dy);
              break;
            case "r": newW = Math.max(20, startW + dx); break;
            case "l": newX = startX + dx; newW = Math.max(20, startW - dx); break;
            case "b": newH = Math.max(20, startH + dy); break;
            case "t": newY = startY + dy; newH = Math.max(20, startH - dy); break;
          }
          return { ...se, x: newX, y: newY, width: newW, height: newH };
        }
        return { ...se, x: drag.startPositions[0].x + dx, y: drag.startPositions[0].y + dy };
      });

      // If dragged mask shape, move linked layers together
      const linked = drag.linkedStarts;
      const updated: Record<string, any> = { shapeElements: newShapes };
      if (linked && linked.size > 0 && !drag.resizeMode) {
        updated.characters = p.characters.map(c => {
          const s = linked.get(c.id);
          return s && "x" in s ? { ...c, x: s.x + dx, y: s.y + dy } : c;
        });
        updated.bubbles = p.bubbles.map(b => {
          const s = linked.get(b.id);
          return s && "x" in s ? { ...b, x: s.x + dx, y: s.y + dy } : b;
        });
        updated.drawingLayers = (p.drawingLayers || []).map(dl => {
          const s = linked.get(dl.id);
          return s && "x" in s ? { ...dl, x: s.x + dx, y: s.y + dy } : dl;
        });
        updated.textElements = (p.textElements || []).map((te: any) => {
          const s = linked.get(te.id);
          return s && "x" in s ? { ...te, x: s.x + dx, y: s.y + dy } : te;
        });
        updated.lineElements = (p.lineElements || []).map((le: any) => {
          const s = linked.get(le.id);
          return s && "points" in s ? { ...le, points: s.points.map((pt: any) => ({ x: pt.x + dx, y: pt.y + dy })) } : le;
        });
      }
      updatePanelNoHistory(panelIdx, { ...p, ...updated });
    }
  }, [panels, updatePanelNoHistory]);

  const handleElementDragEnd = useCallback(() => {
    dragElementRef.current = null;
  }, []);

  // ─── Canvas-level copy / paste for all element types ─────────────────
  const handleOverlayCopy = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return;
    // Multi-select copy
    if (canvasMultiSelectedRef.current.size > 0) {
      const items: any[] = [];
      Array.from(canvasMultiSelectedRef.current).forEach(k => {
        const [etype, eid] = k.split(":");
        let el: any = null;
        if (etype === "bubble") el = p.bubbles.find(b => b.id === eid);
        else if (etype === "char") el = p.characters.find(c => c.id === eid);
        else if (etype === "text") el = (p.textElements || []).find(t => t.id === eid);
        else if (etype === "line") el = (p.lineElements || []).find(l => l.id === eid);
        else if (etype === "drawing") el = (p.drawingLayers || []).find(d => d.id === eid);
        else if (etype === "shape") el = (p.shapeElements || []).find(s => s.id === eid);
        if (el) items.push({ type: etype, data: el });
      });
      if (items.length > 0) {
        localStorage.setItem("olli_clipboard", JSON.stringify({ multi: true, items }));
      }
      return;
    }
    // Single selection copy
    if (selectedBubbleId) {
      const b = p.bubbles.find(bb => bb.id === selectedBubbleId);
      if (b) localStorage.setItem("olli_clipboard", JSON.stringify({ type: "bubble", data: b }));
    } else if (selectedCharId) {
      const c = p.characters.find(cc => cc.id === selectedCharId);
      if (c) localStorage.setItem("olli_clipboard", JSON.stringify({ type: "char", data: c }));
    } else if (selectedTextId) {
      const t = (p.textElements || []).find(tt => tt.id === selectedTextId);
      if (t) localStorage.setItem("olli_clipboard", JSON.stringify({ type: "text", data: t }));
    } else if (selectedLineId) {
      const l = (p.lineElements || []).find(ll => ll.id === selectedLineId);
      if (l) localStorage.setItem("olli_clipboard", JSON.stringify({ type: "line", data: l }));
    } else if (selectedDrawingLayerId) {
      const d = (p.drawingLayers || []).find(dd => dd.id === selectedDrawingLayerId);
      if (d) localStorage.setItem("olli_clipboard", JSON.stringify({ type: "drawing", data: d }));
    } else if (selectedShapeId) {
      const s = (p.shapeElements || []).find(ss => ss.id === selectedShapeId);
      if (s) localStorage.setItem("olli_clipboard", JSON.stringify({ type: "shape", data: s }));
    }
  }, [panels, activePanelIndex, selectedBubbleId, selectedCharId, selectedTextId, selectedLineId, selectedDrawingLayerId, selectedShapeId]);

  const handleOverlayPaste = useCallback(() => {
    try {
      const clip = localStorage.getItem("olli_clipboard");
      if (!clip) return;
      const parsed = JSON.parse(clip);
      const p = panels[activePanelIndex];
      if (!p) return;

      const pasteOne = (type: string, data: any) => {
        const id = generateId();
        const offset = 20;
        if (type === "bubble") {
          const maxZ = p.bubbles.reduce((m: number, b: any) => Math.max(m, b.zIndex ?? 0), 0);
          updatePanel(activePanelIndex, { ...p, bubbles: [...p.bubbles, { ...data, id, x: data.x + offset, y: data.y + offset, zIndex: maxZ + 1 }] });
        } else if (type === "char") {
          // Strip imageEl — DOM elements don't survive JSON serialization; the image reload effect will restore it from imageUrl
          const maxZ = p.characters.reduce((m: number, c: any) => Math.max(m, c.zIndex ?? 0), 0);
          updatePanel(activePanelIndex, { ...p, characters: [...p.characters, { ...data, id, x: data.x + offset, y: data.y + offset, zIndex: maxZ + 1, imageEl: null }] });
        } else if (type === "text") {
          const maxZ = (p.textElements || []).reduce((m: number, t: any) => Math.max(m, t.zIndex ?? 0), 0);
          updatePanel(activePanelIndex, { ...p, textElements: [...(p.textElements || []), { ...data, id, x: data.x + offset, y: data.y + offset, zIndex: maxZ + 1 }] });
        } else if (type === "line") {
          const maxZ = (p.lineElements || []).reduce((m: number, l: any) => Math.max(m, l.zIndex ?? 0), 0);
          updatePanel(activePanelIndex, { ...p, lineElements: [...(p.lineElements || []), { ...data, id, points: data.points.map((pt: any) => ({ ...pt, x: pt.x + offset, y: pt.y + offset })), zIndex: maxZ + 1 }] });
        } else if (type === "drawing") {
          // Strip imageEl — will be rebuilt from imageData by the reload effect
          const maxZ = (p.drawingLayers || []).reduce((m: number, d: any) => Math.max(m, d.zIndex ?? 0), 0);
          updatePanel(activePanelIndex, { ...p, drawingLayers: [...(p.drawingLayers || []), { ...data, id, x: (data.x ?? 0) + offset, y: (data.y ?? 0) + offset, zIndex: maxZ + 1, imageEl: null }] });
        } else if (type === "shape") {
          const maxZ = (p.shapeElements || []).reduce((m: number, s: any) => Math.max(m, s.zIndex ?? 0), 0);
          updatePanel(activePanelIndex, { ...p, shapeElements: [...(p.shapeElements || []), { ...data, id, x: data.x + offset, y: data.y + offset, zIndex: maxZ + 1 }] });
        }
      };

      if (parsed.multi && Array.isArray(parsed.items)) {
        for (const item of parsed.items) {
          pasteOne(item.type, item.data);
        }
      } else if (parsed.type && parsed.data) {
        pasteOne(parsed.type, parsed.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [panels, activePanelIndex, updatePanel]);

  const handleOverlayDelete = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return;
    if (canvasMultiSelectedRef.current.size > 0) {
      const ids = canvasMultiSelectedRef.current;
      const delIds = (type: string) => {
        const out = new Set<string>();
        Array.from(ids).forEach(k => { const [t, id] = k.split(":"); if (t === type) out.add(id); });
        return out;
      };
      const bIds = delIds("bubble"), cIds = delIds("char"), tIds = delIds("text"), lIds = delIds("line"), dIds = delIds("drawing"), sIds = delIds("shape");
      updatePanel(activePanelIndex, {
        ...p,
        bubbles: p.bubbles.filter(b => !bIds.has(b.id)),
        characters: p.characters.filter(c => !cIds.has(c.id)),
        textElements: (p.textElements || []).filter(t => !tIds.has(t.id)),
        lineElements: (p.lineElements || []).filter(l => !lIds.has(l.id)),
        drawingLayers: (p.drawingLayers || []).filter(d => !dIds.has(d.id)),
        shapeElements: (p.shapeElements || []).filter(s => !sIds.has(s.id)),
      });
      setCanvasMultiSelected(new Set());
    } else if (selectedBubbleId) {
      updatePanel(activePanelIndex, { ...p, bubbles: p.bubbles.filter(b => b.id !== selectedBubbleId) });
      setSelectedBubbleId(null);
    } else if (selectedCharId) {
      updatePanel(activePanelIndex, { ...p, characters: p.characters.filter(c => c.id !== selectedCharId) });
      setSelectedCharId(null);
    } else if (selectedTextId) {
      updatePanel(activePanelIndex, { ...p, textElements: (p.textElements || []).filter(t => t.id !== selectedTextId) });
      setSelectedTextId(null);
    } else if (selectedLineId) {
      updatePanel(activePanelIndex, { ...p, lineElements: (p.lineElements || []).filter(l => l.id !== selectedLineId) });
      setSelectedLineId(null);
    } else if (selectedDrawingLayerId) {
      updatePanel(activePanelIndex, { ...p, drawingLayers: (p.drawingLayers || []).filter(d => d.id !== selectedDrawingLayerId) });
      setSelectedDrawingLayerId(null);
    } else if (selectedShapeId) {
      updatePanel(activePanelIndex, { ...p, shapeElements: (p.shapeElements || []).filter(s => s.id !== selectedShapeId) });
      setSelectedShapeId(null);
    }
  }, [panels, activePanelIndex, selectedBubbleId, selectedCharId, selectedTextId, selectedLineId, selectedDrawingLayerId, selectedShapeId, updatePanel]);

  // ─── Cut (copy + delete) ───────────────────────────────────────────
  const handleOverlayCut = useCallback(() => {
    handleOverlayCopy();
    handleOverlayDelete();
  }, [handleOverlayCopy, handleOverlayDelete]);

  // ─── Duplicate selected elements ───────────────────────────────────
  const handleOverlayDuplicate = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const offset = 20;

    const dupOne = (type: string, id: string) => {
      const newId = generateId();
      if (type === "char") {
        const ch = p.characters.find(c => c.id === id);
        if (!ch) return;
        const maxZ = p.characters.reduce((m, c) => Math.max(m, c.zIndex ?? 0), 0);
        updatePanel(activePanelIndex, { ...p, characters: [...p.characters, { ...ch, id: newId, x: ch.x + offset, y: ch.y + offset, zIndex: maxZ + 1 }] });
        setSelectedCharId(newId);
      } else if (type === "bubble") {
        const b = p.bubbles.find(bb => bb.id === id);
        if (!b) return;
        const maxZ = p.bubbles.reduce((m, bb) => Math.max(m, bb.zIndex ?? 0), 0);
        updatePanel(activePanelIndex, { ...p, bubbles: [...p.bubbles, { ...b, id: newId, x: b.x + offset, y: b.y + offset, zIndex: maxZ + 1 }] });
        setSelectedBubbleId(newId);
      } else if (type === "text") {
        const te = (p.textElements || []).find(t => t.id === id) as any;
        if (!te) return;
        const maxZ = (p.textElements || []).reduce((m: number, t: any) => Math.max(m, t.zIndex ?? 0), 0);
        updatePanel(activePanelIndex, { ...p, textElements: [...(p.textElements || []), { ...te, id: newId, x: te.x + offset, y: te.y + offset, zIndex: maxZ + 1 }] });
        setSelectedTextId(newId);
      } else if (type === "line") {
        const le = (p.lineElements || []).find(l => l.id === id) as any;
        if (!le) return;
        const maxZ = (p.lineElements || []).reduce((m: number, l: any) => Math.max(m, l.zIndex ?? 0), 0);
        updatePanel(activePanelIndex, { ...p, lineElements: [...(p.lineElements || []), { ...le, id: newId, points: le.points.map((pt: any) => ({ ...pt, x: pt.x + offset, y: pt.y + offset })), zIndex: maxZ + 1 }] });
        setSelectedLineId(newId);
      } else if (type === "drawing") {
        const dl = (p.drawingLayers || []).find(d => d.id === id);
        if (!dl) return;
        const maxZ = (p.drawingLayers || []).reduce((m, d) => Math.max(m, d.zIndex ?? 0), 0);
        updatePanel(activePanelIndex, { ...p, drawingLayers: [...(p.drawingLayers || []), { ...dl, id: newId, x: (dl.x ?? 0) + offset, y: (dl.y ?? 0) + offset, zIndex: maxZ + 1 }] });
        setSelectedDrawingLayerId(newId);
      } else if (type === "shape") {
        const se = (p.shapeElements || []).find(s => s.id === id) as any;
        if (!se) return;
        const maxZ = (p.shapeElements || []).reduce((m: number, s: any) => Math.max(m, s.zIndex ?? 0), 0);
        updatePanel(activePanelIndex, { ...p, shapeElements: [...(p.shapeElements || []), { ...se, id: newId, x: se.x + offset, y: se.y + offset, zIndex: maxZ + 1 }] });
        setSelectedShapeId(newId);
      }
    };

    if (canvasMultiSelectedRef.current.size > 0) {
      Array.from(canvasMultiSelectedRef.current).forEach(k => {
        const [etype, eid] = k.split(":");
        dupOne(etype, eid);
      });
    } else if (selectedCharId) dupOne("char", selectedCharId);
    else if (selectedBubbleId) dupOne("bubble", selectedBubbleId);
    else if (selectedTextId) dupOne("text", selectedTextId);
    else if (selectedLineId) dupOne("line", selectedLineId);
    else if (selectedDrawingLayerId) dupOne("drawing", selectedDrawingLayerId);
    else if (selectedShapeId) dupOne("shape", selectedShapeId);
  }, [panels, activePanelIndex, selectedBubbleId, selectedCharId, selectedTextId, selectedLineId, selectedDrawingLayerId, selectedShapeId, updatePanel]);

  // ─── Helper: get selected element info for context menu ────────────
  const getSelectedElementInfo = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return null;
    if (canvasMultiSelectedRef.current.size > 0) {
      const items: Array<{ type: string; id: string; locked?: boolean; visible?: boolean }> = [];
      Array.from(canvasMultiSelectedRef.current).forEach(k => {
        const [t, id] = k.split(":");
        let el: any = null;
        if (t === "char") el = p.characters.find(c => c.id === id);
        else if (t === "bubble") el = p.bubbles.find(b => b.id === id);
        else if (t === "text") el = (p.textElements || []).find(x => x.id === id);
        else if (t === "line") el = (p.lineElements || []).find(x => x.id === id);
        else if (t === "drawing") el = (p.drawingLayers || []).find(x => x.id === id);
        else if (t === "shape") el = (p.shapeElements || []).find(x => x.id === id);
        if (el) items.push({ type: t, id, locked: el.locked, visible: el.visible });
      });
      return { multi: true, items, anyLocked: items.some(i => i.locked), anyHidden: items.some(i => i.visible === false) };
    }
    let type = "", id = "", el: any = null;
    if (selectedCharId) { type = "char"; id = selectedCharId; el = p.characters.find(c => c.id === id); }
    else if (selectedBubbleId) { type = "bubble"; id = selectedBubbleId; el = p.bubbles.find(b => b.id === id); }
    else if (selectedTextId) { type = "text"; id = selectedTextId; el = (p.textElements || []).find(x => x.id === id); }
    else if (selectedLineId) { type = "line"; id = selectedLineId; el = (p.lineElements || []).find(x => x.id === id); }
    else if (selectedDrawingLayerId) { type = "drawing"; id = selectedDrawingLayerId; el = (p.drawingLayers || []).find(x => x.id === id); }
    else if (selectedShapeId) { type = "shape"; id = selectedShapeId; el = (p.shapeElements || []).find(x => x.id === id); }
    if (!el) return null;
    return { multi: false, type, id, locked: el.locked, visible: el.visible, items: [{ type, id, locked: el.locked, visible: el.visible }] };
  }, [panels, activePanelIndex, selectedCharId, selectedBubbleId, selectedTextId, selectedLineId, selectedDrawingLayerId, selectedShapeId]);

  // ─── Toggle lock for selected element(s) ───────────────────────────
  const handleOverlayToggleLock = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const info = getSelectedElementInfo();
    if (!info) return;
    const shouldLock = info.multi ? !info.anyLocked : !info.locked;
    const ids = new Set(info.items.map(i => i.id));

    updatePanel(activePanelIndex, {
      ...p,
      characters: p.characters.map(c => ids.has(c.id) ? { ...c, locked: shouldLock } : c),
      bubbles: p.bubbles.map(b => ids.has(b.id) ? { ...b, locked: shouldLock } : b),
      drawingLayers: (p.drawingLayers || []).map(d => ids.has(d.id) ? { ...d, locked: shouldLock } : d),
      textElements: (p.textElements || []).map((t: any) => ids.has(t.id) ? { ...t, locked: shouldLock } : t),
      lineElements: (p.lineElements || []).map((l: any) => ids.has(l.id) ? { ...l, locked: shouldLock } : l),
      shapeElements: (p.shapeElements || []).map((s: any) => ids.has(s.id) ? { ...s, locked: shouldLock } : s),
    });
  }, [panels, activePanelIndex, getSelectedElementInfo, updatePanel]);

  // ─── Toggle visibility for selected element(s) ─────────────────────
  const handleOverlayToggleVisibility = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const info = getSelectedElementInfo();
    if (!info) return;
    const shouldHide = info.multi ? !info.anyHidden : info.visible !== false;
    const newVis = shouldHide ? false : undefined;
    const ids = new Set(info.items.map(i => i.id));

    updatePanel(activePanelIndex, {
      ...p,
      characters: p.characters.map(c => ids.has(c.id) ? { ...c, visible: newVis } : c),
      bubbles: p.bubbles.map(b => ids.has(b.id) ? { ...b, visible: newVis } : b),
      drawingLayers: (p.drawingLayers || []).map(d => ids.has(d.id) ? { ...d, visible: newVis as any } : d),
      textElements: (p.textElements || []).map((t: any) => ids.has(t.id) ? { ...t, visible: newVis } : t),
      lineElements: (p.lineElements || []).map((l: any) => ids.has(l.id) ? { ...l, visible: newVis } : l),
      shapeElements: (p.shapeElements || []).map((s: any) => ids.has(s.id) ? { ...s, visible: newVis } : s),
    });
  }, [panels, activePanelIndex, getSelectedElementInfo, updatePanel]);

  // ─── Layer ordering helpers (all element types) ─────────────────────
  const buildSortedLayerList = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return [];
    type LI = { type: string; id: string; z: number };
    const list: LI[] = [
      ...p.characters.map(c => ({ type: "char", id: c.id, z: c.zIndex ?? 0 })),
      ...p.bubbles.map(b => ({ type: "bubble", id: b.id, z: b.zIndex ?? 10 })),
      ...(p.drawingLayers || []).map(d => ({ type: "drawing", id: d.id, z: d.zIndex ?? 15 })),
      ...(p.textElements || []).map((t: any) => ({ type: "text", id: t.id, z: t.zIndex ?? 20 })),
      ...(p.lineElements || []).map((l: any) => ({ type: "line", id: l.id, z: l.zIndex ?? 20 })),
      ...(p.shapeElements || []).map((s: any) => ({ type: "shape", id: s.id, z: s.zIndex ?? 20 })),
    ].sort((a, b) => a.z - b.z);
    return list;
  }, [panels, activePanelIndex]);

  const applyLayerOrder = useCallback((ordered: Array<{ type: string; id: string }>) => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const n = ordered.length;
    updatePanel(activePanelIndex, {
      ...p,
      characters: p.characters.map(c => { const idx = ordered.findIndex(it => it.type === "char" && it.id === c.id); return idx >= 0 ? { ...c, zIndex: n - 1 - idx } : c; }),
      bubbles: p.bubbles.map(b => { const idx = ordered.findIndex(it => it.type === "bubble" && it.id === b.id); return idx >= 0 ? { ...b, zIndex: n - 1 - idx } : b; }),
      drawingLayers: (p.drawingLayers || []).map(d => { const idx = ordered.findIndex(it => it.type === "drawing" && it.id === d.id); return idx >= 0 ? { ...d, zIndex: n - 1 - idx } : d; }),
      textElements: (p.textElements || []).map((t: any) => { const idx = ordered.findIndex(it => it.type === "text" && it.id === t.id); return idx >= 0 ? { ...t, zIndex: n - 1 - idx } : t; }),
      lineElements: (p.lineElements || []).map((l: any) => { const idx = ordered.findIndex(it => it.type === "line" && it.id === l.id); return idx >= 0 ? { ...l, zIndex: n - 1 - idx } : l; }),
      shapeElements: (p.shapeElements || []).map((s: any) => { const idx = ordered.findIndex(it => it.type === "shape" && it.id === s.id); return idx >= 0 ? { ...s, zIndex: n - 1 - idx } : s; }),
    });
  }, [panels, activePanelIndex, updatePanel]);

  const getSelectedId = useCallback(() => {
    if (selectedCharId) return { type: "char", id: selectedCharId };
    if (selectedBubbleId) return { type: "bubble", id: selectedBubbleId };
    if (selectedTextId) return { type: "text", id: selectedTextId };
    if (selectedLineId) return { type: "line", id: selectedLineId };
    if (selectedDrawingLayerId) return { type: "drawing", id: selectedDrawingLayerId };
    if (selectedShapeId) return { type: "shape", id: selectedShapeId };
    return null;
  }, [selectedCharId, selectedBubbleId, selectedTextId, selectedLineId, selectedDrawingLayerId, selectedShapeId]);

  // Bring Forward (Ctrl+])
  const handleOverlayBringForward = useCallback(() => {
    const sel = getSelectedId();
    if (!sel) return;
    const list = buildSortedLayerList();
    const idx = list.findIndex(x => x.type === sel.type && x.id === sel.id);
    if (idx < 0 || idx >= list.length - 1) return;
    const ordered = list.map(l => ({ type: l.type, id: l.id }));
    const tmp = ordered[idx]; ordered[idx] = ordered[idx + 1]; ordered[idx + 1] = tmp;
    applyLayerOrder(ordered);
  }, [getSelectedId, buildSortedLayerList, applyLayerOrder]);

  // Send Backward (Ctrl+[)
  const handleOverlaySendBackward = useCallback(() => {
    const sel = getSelectedId();
    if (!sel) return;
    const list = buildSortedLayerList();
    const idx = list.findIndex(x => x.type === sel.type && x.id === sel.id);
    if (idx <= 0) return;
    const ordered = list.map(l => ({ type: l.type, id: l.id }));
    const tmp = ordered[idx]; ordered[idx] = ordered[idx - 1]; ordered[idx - 1] = tmp;
    applyLayerOrder(ordered);
  }, [getSelectedId, buildSortedLayerList, applyLayerOrder]);

  // Bring to Front (Ctrl+Shift+])
  const handleOverlayBringToFront = useCallback(() => {
    const sel = getSelectedId();
    if (!sel) return;
    const list = buildSortedLayerList();
    const idx = list.findIndex(x => x.type === sel.type && x.id === sel.id);
    if (idx < 0 || idx >= list.length - 1) return;
    const ordered = list.map(l => ({ type: l.type, id: l.id }));
    const [moved] = ordered.splice(idx, 1);
    ordered.push(moved);
    applyLayerOrder(ordered);
  }, [getSelectedId, buildSortedLayerList, applyLayerOrder]);

  // Send to Back (Ctrl+Shift+[)
  const handleOverlaySendToBack = useCallback(() => {
    const sel = getSelectedId();
    if (!sel) return;
    const list = buildSortedLayerList();
    const idx = list.findIndex(x => x.type === sel.type && x.id === sel.id);
    if (idx <= 0) return;
    const ordered = list.map(l => ({ type: l.type, id: l.id }));
    const [moved] = ordered.splice(idx, 1);
    ordered.unshift(moved);
    applyLayerOrder(ordered);
  }, [getSelectedId, buildSortedLayerList, applyLayerOrder]);

  // ─── Select All layers (Ctrl+A) ───────────────────────────────────
  const handleOverlaySelectAll = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const all = new Set<string>();
    p.characters.forEach(c => all.add(`char:${c.id}`));
    p.bubbles.forEach(b => all.add(`bubble:${b.id}`));
    (p.drawingLayers || []).forEach(d => all.add(`drawing:${d.id}`));
    (p.textElements || []).forEach((t: any) => all.add(`text:${t.id}`));
    (p.lineElements || []).forEach((l: any) => all.add(`line:${l.id}`));
    (p.shapeElements || []).forEach((s: any) => { if (!s.maskEnabled) all.add(`shape:${s.id}`); });
    setCanvasMultiSelected(all);
  }, [panels, activePanelIndex]);

  // ─── Toggle mask link for selected element(s) ──────────────────────
  const handleOverlayToggleMask = useCallback(() => {
    const p = panels[activePanelIndex];
    if (!p) return;
    const maskShape = (p.shapeElements || []).find((se: any) => se.maskEnabled);
    if (!maskShape) return;
    const info = getSelectedElementInfo();
    if (!info) return;
    const layerIds = info.items.map(i => i.id).filter(id => id !== maskShape.id);
    if (layerIds.length === 0) return;
    const existingMasked = (maskShape as any).maskedLayerIds || [];
    const allLinked = layerIds.every(id => existingMasked.includes(id));

    const newMaskedIds = allLinked
      ? existingMasked.filter((id: string) => !layerIds.includes(id))
      : Array.from(new Set([...existingMasked, ...layerIds]));

    updatePanel(activePanelIndex, {
      ...p,
      shapeElements: (p.shapeElements || []).map((se: any) =>
        se.id === maskShape.id ? { ...se, maskedLayerIds: newMaskedIds } : se
      ),
    });
  }, [panels, activePanelIndex, getSelectedElementInfo, updatePanel]);

  // ─── Comprehensive keyboard shortcuts (Photoshop-style) ────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+C: Copy
      if (ctrl && e.key === "c" && !e.shiftKey) {
        e.preventDefault();
        handleOverlayCopy();
        return;
      }
      // Ctrl+V: Paste
      if (ctrl && e.key === "v" && !e.shiftKey) {
        e.preventDefault();
        handleOverlayPaste();
        return;
      }
      // Ctrl+X: Cut
      if (ctrl && e.key === "x" && !e.shiftKey) {
        e.preventDefault();
        handleOverlayCut();
        return;
      }
      // Ctrl+D: Duplicate
      if (ctrl && e.key === "d" && !e.shiftKey) {
        e.preventDefault();
        handleOverlayDuplicate();
        return;
      }
      // Ctrl+A: Select All
      if (ctrl && e.key === "a" && !e.shiftKey) {
        e.preventDefault();
        handleOverlaySelectAll();
        return;
      }
      // Escape: Deselect All
      if (e.key === "Escape") {
        setSelectedCharId(null); setSelectedBubbleId(null);
        setSelectedTextId(null); setSelectedLineId(null);
        setSelectedDrawingLayerId(null); setSelectedShapeId(null);
        setCanvasMultiSelected(new Set());
        setOverlayContextMenu(null);
        return;
      }
      // Ctrl+Shift+]: Bring to Front
      if (ctrl && e.shiftKey && e.key === "]") {
        e.preventDefault();
        handleOverlayBringToFront();
        return;
      }
      // Ctrl+Shift+[: Send to Back
      if (ctrl && e.shiftKey && e.key === "[") {
        e.preventDefault();
        handleOverlaySendToBack();
        return;
      }
      // Ctrl+]: Bring Forward
      if (ctrl && !e.shiftKey && e.key === "]") {
        e.preventDefault();
        handleOverlayBringForward();
        return;
      }
      // Ctrl+[: Send Backward
      if (ctrl && !e.shiftKey && e.key === "[") {
        e.preventDefault();
        handleOverlaySendBackward();
        return;
      }
      // Ctrl+L: Toggle Lock
      if (ctrl && e.key === "l" && !e.shiftKey) {
        e.preventDefault();
        handleOverlayToggleLock();
        return;
      }
      // Ctrl+H: Toggle Visibility (Photoshop: Ctrl+, but we use Ctrl+H to avoid conflict)
      // Actually Ctrl+; or Ctrl+H, let's use H alone (without ctrl) for visibility toggle like many editors
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleOverlayCopy, handleOverlayPaste, handleOverlayCut, handleOverlayDuplicate, handleOverlaySelectAll,
    handleOverlayBringToFront, handleOverlaySendToBack, handleOverlayBringForward, handleOverlaySendBackward,
    handleOverlayToggleLock]);

  // Delete selected text/line/drawing elements on Delete/Backspace
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        const p = panels[activePanelIndex];
        if (!p) return;
        // Multi-select bulk delete
        if (canvasMultiSelectedRef.current.size > 0) {
          e.preventDefault();
          const ids = canvasMultiSelectedRef.current;
          const delIds = (type: string) => {
            const out = new Set<string>();
            Array.from(ids).forEach(k => { const [t, id] = k.split(":"); if (t === type) out.add(id); });
            return out;
          };
          const bIds = delIds("bubble"), cIds = delIds("char"), tIds = delIds("text"), lIds = delIds("line"), dIds = delIds("drawing"), sIds = delIds("shape");
          updatePanel(activePanelIndex, {
            ...p,
            bubbles: p.bubbles.filter(b => !bIds.has(b.id)),
            characters: p.characters.filter(c => !cIds.has(c.id)),
            textElements: (p.textElements || []).filter(t => !tIds.has(t.id)),
            lineElements: (p.lineElements || []).filter(l => !lIds.has(l.id)),
            drawingLayers: (p.drawingLayers || []).filter(d => !dIds.has(d.id)),
            shapeElements: (p.shapeElements || []).filter(s => !sIds.has(s.id)),
          });
          setCanvasMultiSelected(new Set());
          return;
        }
        if (selectedShapeId) {
          e.preventDefault();
          const newShapes = (p.shapeElements || []).filter(s => s.id !== selectedShapeId);
          updatePanel(activePanelIndex, { ...p, shapeElements: newShapes });
          setSelectedShapeId(null);
          return;
        }
        if (selectedTextId) {
          e.preventDefault();
          const newTexts = (p.textElements || []).filter(t => t.id !== selectedTextId);
          updatePanel(activePanelIndex, { ...p, textElements: newTexts });
          setSelectedTextId(null);
          return;
        }
        if (selectedLineId) {
          e.preventDefault();
          const newLines = (p.lineElements || []).filter(l => l.id !== selectedLineId);
          updatePanel(activePanelIndex, { ...p, lineElements: newLines });
          setSelectedLineId(null);
          return;
        }
        if (selectedDrawingLayerId) {
          e.preventDefault();
          const newLayers = (p.drawingLayers || []).filter(l => l.id !== selectedDrawingLayerId);
          updatePanel(activePanelIndex, { ...p, drawingLayers: newLayers });
          setSelectedDrawingLayerId(null);
          return;
        }
        if (selectedBubbleId) {
          e.preventDefault();
          updatePanel(activePanelIndex, { ...p, bubbles: p.bubbles.filter(b => b.id !== selectedBubbleId) });
          setSelectedBubbleId(null);
          return;
        }
        if (selectedCharId) {
          e.preventDefault();
          updatePanel(activePanelIndex, { ...p, characters: p.characters.filter(c => c.id !== selectedCharId) });
          setSelectedCharId(null);
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panels, activePanelIndex, selectedTextId, selectedLineId, selectedShapeId, selectedDrawingLayerId, selectedBubbleId, selectedCharId, canvasMultiSelected, updatePanel]);

  // Start inline script editing when typing while script is selected
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedScriptPosition) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" || e.key === "Delete" || e.key === "Backspace" ||
          e.key === "Tab" || e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" ||
          e.key.startsWith("Arrow") || e.key.startsWith("F") || e.key === "Enter") return;
      // Printable character typed → start inline editing on canvas
      if (e.key.length === 1) {
        e.preventDefault();
        setEditingScriptPositionForCanvas(selectedScriptPosition);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedScriptPosition]);

  const toggleLeftTab = (tab: LeftTab) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    startTransition(() => {
      setActiveLeftTab((prev) => {
        const next = prev === tab ? null : tab;
        return next;
      });
    });
  };

  // Helper: clear ALL selections, wait for canvas redraw, run callback, restore selections
  const withCleanCanvas = (fn: () => void) => {
    const prevBubble = selectedBubbleId;
    const prevChar = selectedCharId;
    const prevScript = selectedScriptPosition;
    const prevText = selectedTextId;
    const prevLine = selectedLineId;
    const prevShape = selectedShapeId;
    const prevDrawing = selectedDrawingLayerId;
    const prevMulti = new Set(canvasMultiSelected);
    setSelectedBubbleId(null);
    setSelectedCharId(null);
    setSelectedScriptPosition(null);
    setSelectedTextId(null);
    setSelectedLineId(null);
    setSelectedShapeId(null);
    setSelectedDrawingLayerId(null);
    setCanvasMultiSelected(new Set());
    // Use triple rAF + setTimeout to ensure React re-render, effects, and canvas redraw complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          try { fn(); } finally {
            setSelectedBubbleId(prevBubble);
            setSelectedCharId(prevChar);
            setSelectedScriptPosition(prevScript);
            setSelectedTextId(prevText);
            setSelectedLineId(prevLine);
            setSelectedShapeId(prevShape);
            setSelectedDrawingLayerId(prevDrawing);
            setCanvasMultiSelected(prevMulti);
          }
        }, 50);
      });
    });
  };

  const captureCanvas = (canvas: HTMLCanvasElement, filename: string) => {
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      try {
        const cleanCanvas = document.createElement("canvas");
        cleanCanvas.width = canvas.width;
        cleanCanvas.height = canvas.height;
        const ctx = cleanCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, 0);
          const dataUrl = cleanCanvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = filename;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
      } catch {}
      canvas.toBlob((blob) => {
        if (!blob) {
          toast({ title: "다운로드 실패", description: "이미지를 생성할 수 없습니다.", variant: "destructive" });
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    }
  };
  const downloadPanel = (idx: number) => {
    const p = panels[idx];
    if (!p) {
      toast({ title: "다운로드 실패", description: "패널을 찾을 수 없습니다.", variant: "destructive" });
      return;
    }
    const canvas = panelCanvasRefs.current.get(p.id);
    if (!canvas) {
      toast({ title: "다운로드 실패", description: "캔버스가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.", variant: "destructive" });
      return;
    }
    withCleanCanvas(() => captureCanvas(canvas, `panel_${idx + 1}.png`));
    markChecklistDone("download");
  };

  const downloadAll = () => {
    if (panels.length === 0) return;
    withCleanCanvas(() => {
      panels.forEach((p, i) => {
        const canvas = panelCanvasRefs.current.get(p.id);
        if (canvas) {
          setTimeout(() => captureCanvas(canvas, `panel_${i + 1}.png`), i * 300);
        }
      });
    });
    markChecklistDone("download");
  };

  const DOWNLOAD_SIZES = [
    { label: `Original (${CANVAS_W}×${CANVAS_H})`, w: CANVAS_W, h: CANVAS_H },
    { label: `2x (${CANVAS_W * 2}×${CANVAS_H * 2})`, w: CANVAS_W * 2, h: CANVAS_H * 2 },
  ];

  const downloadPanelSized = (idx: number, targetW: number, targetH: number) => {
    const p = panels[idx];
    if (!p) return;
    const srcCanvas = panelCanvasRefs.current.get(p.id);
    if (!srcCanvas) return;
    withCleanCanvas(() => {
      try {
        const offscreen = document.createElement("canvas");
        offscreen.width = targetW;
        offscreen.height = targetH;
        const ctx = offscreen.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(srcCanvas, 0, 0, targetW, targetH);
        const dataUrl = offscreen.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `panel_${idx + 1}_${targetW}x${targetH}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        toast({ title: "다운로드 실패", description: "이미지를 생성할 수 없습니다.", variant: "destructive" });
      }
    });
  };

  const capturePanelForInstagram = useCallback((idx: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const p = panels[idx];
      if (!p) { reject(new Error("패널을 찾을 수 없습니다.")); return; }
      const srcCanvas = panelCanvasRefs.current.get(p.id);
      if (!srcCanvas) { reject(new Error("캔버스를 찾을 수 없습니다.")); return; }
      // Clear selections before capture
      const prevBubble = selectedBubbleId;
      const prevChar = selectedCharId;
      const prevScript = selectedScriptPosition;
      const prevText = selectedTextId;
      const prevLine = selectedLineId;
      const prevShape = selectedShapeId;
      const prevDrawing = selectedDrawingLayerId;
      setSelectedBubbleId(null);
      setSelectedCharId(null);
      setSelectedScriptPosition(null);
      setSelectedTextId(null);
      setSelectedLineId(null);
      setSelectedShapeId(null);
      setSelectedDrawingLayerId(null);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            try {
              const offscreen = document.createElement("canvas");
              offscreen.width = CANVAS_W * 2;
              offscreen.height = CANVAS_H * 2;
              const ctx = offscreen.getContext("2d");
              if (!ctx) { reject(new Error("Canvas context 생성 실패")); return; }
              ctx.drawImage(srcCanvas, 0, 0, CANVAS_W * 2, CANVAS_H * 2);
              resolve(offscreen.toDataURL("image/png"));
            } catch (err) {
              reject(err);
            } finally {
              setSelectedBubbleId(prevBubble);
              setSelectedCharId(prevChar);
              setSelectedScriptPosition(prevScript);
              setSelectedTextId(prevText);
              setSelectedLineId(prevLine);
              setSelectedShapeId(prevShape);
              setSelectedDrawingLayerId(prevDrawing);
            }
          }, 50);
        });
      });
    });
  }, [panels, selectedBubbleId, selectedCharId, selectedScriptPosition, selectedTextId, selectedLineId, selectedShapeId, selectedDrawingLayerId]);

  const downloadPanelSvg = (idx: number) => {
    const p = panels[idx];
    if (!p) return;
    const srcCanvas = panelCanvasRefs.current.get(p.id);
    if (!srcCanvas) return;
    withCleanCanvas(() => {
      try {
        const dataUrl = srcCanvas.toDataURL("image/png");
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}"><image href="${dataUrl}" width="${CANVAS_W}" height="${CANVAS_H}"/></svg>`;
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `panel_${idx + 1}.svg`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        toast({ title: "다운로드 실패", description: "SVG를 생성할 수 없습니다.", variant: "destructive" });
      }
    });
  };

  const downloadAllSized = (w: number, h: number) => {
    if (panels.length === 0) return;
    withCleanCanvas(() => {
      panels.forEach((p, i) => {
        const srcCanvas = panelCanvasRefs.current.get(p.id);
        if (!srcCanvas) return;
        setTimeout(() => {
          try {
            const offscreen = document.createElement("canvas");
            offscreen.width = w;
            offscreen.height = h;
            const ctx = offscreen.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(srcCanvas, 0, 0, w, h);
            const dataUrl = offscreen.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `panel_${i + 1}_${w}x${h}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch {}
        }, i * 300);
      });
    });
  };

  const downloadAllSvg = () => {
    if (panels.length === 0) return;
    withCleanCanvas(() => {
      panels.forEach((p, i) => {
        const srcCanvas = panelCanvasRefs.current.get(p.id);
        if (!srcCanvas) return;
        setTimeout(() => {
          try {
            const dataUrl = srcCanvas.toDataURL("image/png");
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}"><image href="${dataUrl}" width="${CANVAS_W}" height="${CANVAS_H}"/></svg>`;
            const blob = new Blob([svgContent], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `panel_${i + 1}.svg`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          } catch {}
        }, i * 300);
      });
    });
  };

  const renderLayerToCanvas = (item: LayerItem): HTMLCanvasElement | null => {
    const p = activePanel;
    if (!p) return null;
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    if (item.type === "char") {
      const ch = p.characters.find(c => c.id === item.id);
      if (!ch || !(ch.imageEl instanceof HTMLImageElement)) return null;
      const w = ch.imageEl.naturalWidth * ch.scale;
      const h = ch.imageEl.naturalHeight * ch.scale;
      ctx.save();
      ctx.translate(ch.x, ch.y);
      ctx.rotate(ch.rotation || 0);
      ctx.scale(ch.flipX ? -1 : 1, ch.flipY ? -1 : 1);
      ctx.drawImage(ch.imageEl, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else if (item.type === "bubble") {
      const b = p.bubbles.find(bb => bb.id === item.id);
      if (!b) return null;
      drawBubble(ctx, b, false);
    } else if (item.type === "drawing") {
      const dl = (p.drawingLayers || []).find(d => d.id === item.id);
      if (!dl || !(dl.imageEl instanceof HTMLImageElement)) return null;
      ctx.save();
      ctx.globalAlpha = dl.opacity ?? 1;
      if (dl.type === "eraser") ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(dl.imageEl, dl.x ?? 0, dl.y ?? 0, dl.width ?? CANVAS_W, dl.height ?? CANVAS_H);
      ctx.restore();
    } else if (item.type === "text") {
      const te = (p.textElements || []).find((t: CanvasTextElement) => t.id === item.id);
      if (!te) return null;
      ctx.save();
      ctx.globalAlpha = te.opacity;
      let fontStyle = "";
      if (te.italic) fontStyle += "italic ";
      if (te.bold) fontStyle += "bold ";
      fontStyle += `${te.fontSize}px `;
      fontStyle += te.fontFamily === "default" ? "sans-serif" : `"${te.fontFamily}", sans-serif`;
      ctx.font = fontStyle;
      ctx.fillStyle = te.color;
      ctx.textAlign = te.textAlign as CanvasTextAlign;
      ctx.textBaseline = "top";
      let displayText = te.text;
      if (te.textTransform === "uppercase") displayText = displayText.toUpperCase();
      else if (te.textTransform === "lowercase") displayText = displayText.toLowerCase();
      const textX = te.textAlign === "center" ? te.x + te.width / 2 : te.textAlign === "right" ? te.x + te.width : te.x;
      const textY = te.y + 8;
      const words = displayText.split("");
      let line = "";
      let lineY = textY;
      const lineHeight = te.fontSize * 1.3;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > te.width && line.length > 0) {
          ctx.fillText(line, textX, lineY);
          if (te.underline) { const lw = ctx.measureText(line).width; const lx = te.textAlign === "center" ? textX - lw / 2 : te.textAlign === "right" ? textX - lw : textX; ctx.fillRect(lx, lineY + te.fontSize + 1, lw, 1); }
          if (te.strikethrough) { const lw = ctx.measureText(line).width; const lx = te.textAlign === "center" ? textX - lw / 2 : te.textAlign === "right" ? textX - lw : textX; ctx.fillRect(lx, lineY + te.fontSize / 2, lw, 1); }
          line = words[i];
          lineY += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line) {
        ctx.fillText(line, textX, lineY);
        if (te.underline) { const lw = ctx.measureText(line).width; const lx = te.textAlign === "center" ? textX - lw / 2 : te.textAlign === "right" ? textX - lw : textX; ctx.fillRect(lx, lineY + te.fontSize + 1, lw, 1); }
        if (te.strikethrough) { const lw = ctx.measureText(line).width; const lx = te.textAlign === "center" ? textX - lw / 2 : te.textAlign === "right" ? textX - lw : textX; ctx.fillRect(lx, lineY + te.fontSize / 2, lw, 1); }
      }
      ctx.restore();
    } else if (item.type === "line") {
      const le = (p.lineElements || []).find((l: CanvasLineElement) => l.id === item.id);
      if (!le) return null;
      ctx.save();
      ctx.globalAlpha = le.opacity;
      ctx.strokeStyle = le.color;
      ctx.lineWidth = le.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (le.dashPattern === "dashed") ctx.setLineDash([8, 4]);
      else if (le.dashPattern === "dotted") ctx.setLineDash([2, 4]);
      else ctx.setLineDash([]);
      const pts = le.points;
      if (pts.length >= 2) {
        ctx.beginPath();
        if (le.lineType === "curved" && pts.length >= 3) {
          ctx.moveTo(pts[0].x, pts[0].y);
          if (pts.length === 3) {
            ctx.quadraticCurveTo(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
          } else {
            for (let j = 1; j < pts.length - 1; j++) {
              const midX = (pts[j].x + pts[j + 1].x) / 2;
              const midY = (pts[j].y + pts[j + 1].y) / 2;
              ctx.quadraticCurveTo(pts[j].x, pts[j].y, midX, midY);
            }
            ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          }
        } else {
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let j = 1; j < pts.length; j++) {
            ctx.lineTo(pts[j].x, pts[j].y);
          }
        }
        ctx.stroke();
        const drawArrow = (from: { x: number; y: number }, to: { x: number; y: number }) => {
          const angle = Math.atan2(to.y - from.y, to.x - from.x);
          const headLen = Math.max(le.strokeWidth * 3, 8);
          ctx.beginPath();
          ctx.moveTo(to.x, to.y);
          ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(to.x, to.y);
          ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        };
        ctx.setLineDash([]);
        if (le.startArrow && pts.length >= 2) drawArrow(pts[1], pts[0]);
        if (le.endArrow && pts.length >= 2) drawArrow(pts[pts.length - 2], pts[pts.length - 1]);
      }
      ctx.setLineDash([]);
      ctx.restore();
    } else if (item.type === "shape") {
      const se = (p.shapeElements || []).find((s: CanvasShapeElement) => s.id === item.id);
      if (!se) return null;
      ctx.save();
      ctx.globalAlpha = se.opacity;
      buildShapePath(ctx, se.shapeType, se.x, se.y, se.width, se.height);
      if (se.fillColor !== "transparent") { ctx.fillStyle = se.fillColor; ctx.fill(); }
      if (se.strokeWidth > 0) { ctx.strokeStyle = se.strokeColor; ctx.lineWidth = se.strokeWidth; ctx.stroke(); }
      ctx.restore();
    } else if (item.type === "topScript") {
      if (p.topScript) drawScriptOverlay(ctx, p.topScript, "top", CANVAS_W, CANVAS_H, false);
    } else if (item.type === "bottomScript") {
      if (p.bottomScript) drawScriptOverlay(ctx, p.bottomScript, "bottom", CANVAS_W, CANVAS_H, false);
    }

    return canvas;
  };

  const downloadLayerPng = (item: LayerItem) => {
    const canvas = renderLayerToCanvas(item);
    if (!canvas) {
      toast({ title: "다운로드 실패", description: "레이어를 렌더링할 수 없습니다.", variant: "destructive" });
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `layer_${item.type}_${item.id}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadLayerSvg = (item: LayerItem) => {
    const canvas = renderLayerToCanvas(item);
    if (!canvas) {
      toast({ title: "다운로드 실패", description: "레이어를 렌더링할 수 없습니다.", variant: "destructive" });
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}"><image href="${dataUrl}" width="${CANVAS_W}" height="${CANVAS_H}"/></svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `layer_${item.type}_${item.id}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareInstagram = async (idx: number) => {
    const p = panels[idx];
    const canvas = panelCanvasRefs.current.get(p.id);
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!blob) return;
      const file = new File([blob], `charagen-panel-${idx + 1}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "CharaGen 스토리",
          text: "CharaGen으로 만든 인스타툰 패널",
          files: [file],
        });
        toast({ title: "공유 완료", description: "Instagram에 공유되었습니다." });
      } else {
        downloadPanel(idx);
        window.open("https://www.instagram.com/", "_blank");
        toast({ title: "Instagram 열기", description: "이미지가 다운로드되었습니다. Instagram에서 새 게시물로 업로드하세요." });
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        downloadPanel(idx);
        toast({ title: "다운로드 완료", description: "이미지가 저장되었습니다. Instagram에서 업로드하세요." });
      }
    }
  };

  const serializeStoryData = useCallback(() => {
    // 참조 캐릭터 정보 저장 (인스타툰 기준 캐릭터)
    const refCharacters = autoRefImages.map(img => ({
      url: img.imageUrl,
      name: img.name,
    }));
    return JSON.stringify({
      panels: panels.map((p) => ({
        id: p.id,
        topScript: p.topScript,
        bottomScript: p.bottomScript,
        backgroundColor: p.backgroundColor,
        backgroundImageUrl: p.backgroundImageUrl,
        bubbles: p.bubbles.map((b) => ({
          ...b,
          templateImg: undefined,
        })),
        characters: p.characters.map((c) => ({
          id: c.id,
          imageUrl: c.imageUrl,
          x: c.x,
          y: c.y,
          scale: c.scale,
          rotation: c.rotation ?? 0,
          flipX: c.flipX ?? false,
          flipY: c.flipY ?? false,
          zIndex: c.zIndex ?? 0,
          name: c.name,
          generationId: c.generationId,
        })),
        drawingLayers: (p.drawingLayers || []).map((dl) => ({
          id: dl.id,
          type: dl.type,
          imageData: dl.imageData,
          visible: dl.visible,
          zIndex: dl.zIndex,
          label: dl.label,
          opacity: dl.opacity ?? 1,
        })),
        textElements: p.textElements || [],
        lineElements: p.lineElements || [],
        shapeElements: p.shapeElements || [],
      })),
      topic,
      refCharacters: refCharacters.length > 0 ? refCharacters : undefined,
    });
  }, [panels, topic, autoRefImages]);

  const getStoryThumbnail = useCallback(() => {
    try {
      const firstPanel = panels[0];
      if (!firstPanel) return "";
      const canvas = panelCanvasRefs.current.get(firstPanel.id);
      if (!canvas) return "";
      const thumbCanvas = document.createElement("canvas");
      const thumbW = 300;
      const thumbH = Math.round((CANVAS_H / CANVAS_W) * thumbW);
      thumbCanvas.width = thumbW;
      thumbCanvas.height = thumbH;
      const ctx = thumbCanvas.getContext("2d");
      if (!ctx) return "";
      ctx.drawImage(canvas, 0, 0, thumbW, thumbH);
      return thumbCanvas.toDataURL("image/png", 0.7);
    } catch {
      return "";
    }
  }, [panels]);

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast({ title: "프로젝트 이름을 입력하세요", variant: "destructive" });
      return;
    }
    setSavingProject(true);
    try {
      const canvasData = serializeStoryData();
      const thumbnailUrl = getStoryThumbnail();
      if (currentProjectId) {
        await apiRequest("PATCH", `/api/bubble-projects/${currentProjectId}`, {
          name: projectName.trim(),
          canvasData,
          thumbnailUrl,
          folderId: selectedFolderId,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/bubble-projects"] });
      } else {
        const res = await apiRequest("POST", "/api/bubble-projects", {
          name: projectName.trim(),
          canvasData,
          thumbnailUrl,
          editorType: "story",
          folderId: selectedFolderId,
        });
        const newProject = await res.json();
        setCurrentProjectId(newProject.id);
        queryClient.invalidateQueries({ queryKey: ["/api/bubble-projects"] });
      }
      setShowSaveModal(false);
      setShowSavedConfirm(true);
      setTimeout(() => setShowSavedConfirm(false), 1500);
    } catch (e: any) {
      toast({ title: "저장 실패", description: e.message || "프로젝트를 저장할 수 없습니다.", variant: "destructive" });
    } finally {
      setSavingProject(false);
    }
  };

  const urlParams = new URLSearchParams(searchString);
  const loadProjectId = urlParams.get("projectId");

  const { data: loadedProject, error: loadProjectError, isError: isLoadProjectError } = useQuery<any>({
    queryKey: ["/api/bubble-projects", loadProjectId],
    enabled: isAuthenticated && !!loadProjectId,
  });

  // Show error toast when project fetch fails
  useEffect(() => {
    if (isLoadProjectError && loadProjectError) {
      console.error("Project load API error:", loadProjectError);
      toast({ title: "프로젝트 불러오기 실패", description: String(loadProjectError.message || ""), variant: "destructive" });
    }
  }, [isLoadProjectError, loadProjectError]);

  const restoreProject = useCallback((project: any) => {
    setCurrentProjectId(project.id);
    setProjectName(project.name);
    setSelectedFolderId(project.folderId ?? null);

    // 프로젝트 로딩 시 선택 상태 초기화
    setSelectedBubbleId(null);
    setSelectedCharId(null);
    setSelectedTextId(null);
    setSelectedLineId(null);
    setSelectedShapeId(null);
    setSelectedDrawingLayerId(null);
    setSelectedScriptPosition(null);

    try {
      const data = typeof project.canvasData === "string"
        ? JSON.parse(project.canvasData)
        : project.canvasData;
      if (data.topic) setTopic(data.topic);
      if (data.panels && Array.isArray(data.panels)) {
        const restoredPanels: PanelData[] = data.panels.map((p: any) => ({
          id: p.id || generateId(),
          topScript: p.topScript ?? null,
          bottomScript: p.bottomScript ?? null,
          backgroundColor: p.backgroundColor || "#ffffff",
          backgroundImageUrl: p.backgroundImageUrl || undefined,
          backgroundImageEl: null,
          bubbles: (p.bubbles || []).map((b: any) => ({
            ...b,
            templateImg: undefined,
          })),
          characters: (p.characters || []).map((c: any) => ({
            ...c,
            imageEl: null,
          })),
          drawingLayers: (p.drawingLayers || []).map((dl: any) => ({
            ...dl,
            imageEl: null,
          })),
          textElements: p.textElements || [],
          lineElements: p.lineElements || [],
          shapeElements: p.shapeElements || [],
        }));
        setPanelsRaw(restoredPanels);
        setActivePanelIndex(0);
        requestAnimationFrame(() => {
          rehydrateImages(restoredPanels);
        });
      } else {
        console.warn("Project canvasData has no panels:", Object.keys(data));
      }
      if (data.refCharacters && Array.isArray(data.refCharacters)) {
        setAutoRefImages(data.refCharacters.map((rc: any) => ({
          id: rc.id || rc.url?.slice(-16) || Math.random().toString(36).slice(2, 10),
          imageUrl: rc.url || rc.imageUrl || "",
          name: rc.name || "캐릭터",
        })).filter((rc: any) => rc.imageUrl));
      }
    } catch (e) {
      console.error("Project canvasData parse error:", e);
      toast({ title: "프로젝트 로드 실패", variant: "destructive" });
    }
  }, [rehydrateImages, toast]);

  const projectLoadedRef = useRef<number | null>(null);
  useEffect(() => {
    if (loadedProject && projectLoadedRef.current !== loadedProject.id) {
      projectLoadedRef.current = loadedProject.id;
      restoreProject(loadedProject);
    }
  }, [loadedProject, restoreProject]);

  const handleLoadProject = useCallback(async (projectId: number) => {
    try {
      const res = await apiRequest("GET", `/api/bubble-projects/${projectId}`);
      const project = await res.json();
      projectLoadedRef.current = project.id;
      restoreProject(project);
      toast({ title: "프로젝트 불러오기 완료", description: `"${project.name}" 로드됨` });
    } catch (e: any) {
      toast({ title: "프로젝트 불러오기 실패", description: e.message || "", variant: "destructive" });
    }
  }, [restoreProject, toast]);

  // Flow에서 넘어온 이미지를 첫 패널에 자동 추가
  const flowLoadedRef = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get("flow") !== "1" || flowLoadedRef.current) return;
    const flow = getFlowState();
    if (!flow.lastPoseImageUrl) return;
    flowLoadedRef.current = true;
    const imageUrl = flow.lastPoseImageUrl;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxDim = 300;
      const s = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight, 1);
      const charId = generateId();
      setPanelsRaw((prev) => {
        const first = prev[0];
        if (!first) return prev;
        return [
          {
            ...first,
            characters: [...first.characters, {
              id: charId,
              imageUrl,
              x: CANVAS_W / 2,
              y: CANVAS_H / 2,
              scale: s,
              imageEl: img,
              zIndex: (first.characters.reduce((m, c) => Math.max(m, c.zIndex ?? 0), 0)) + 1,
            }],
          },
          ...prev.slice(1),
        ];
      });
      setActivePanelIndex(0);
      clearFlowState();
    };
    img.onerror = () => {
      // CORS 실패 시 crossOrigin 없이 재시도
      const img2 = new Image();
      img2.onload = () => {
        const maxDim = 300;
        const s2 = Math.min(maxDim / img2.naturalWidth, maxDim / img2.naturalHeight, 1);
        const charId2 = generateId();
        setPanelsRaw((prev) => {
          const first = prev[0];
          if (!first) return prev;
          return [
            {
              ...first,
              characters: [...first.characters, {
                id: charId2,
                imageUrl,
                x: CANVAS_W / 2,
                y: CANVAS_H / 2,
                scale: s2,
                imageEl: img2,
                zIndex: (first.characters.reduce((m, c) => Math.max(m, c.zIndex ?? 0), 0)) + 1,
              }],
            },
            ...prev.slice(1),
          ];
        });
        setActivePanelIndex(0);
        clearFlowState();
      };
      img2.src = imageUrl;
    };
    img.src = imageUrl;
  }, [searchString]);

  const isPro = usageData?.tier === "pro" || usageData?.tier === "premium";
  const canAllFontsStory = isPro || (usageData?.creatorTier ?? 0) >= 3;
  const availableFonts = canAllFontsStory ? KOREAN_FONTS : KOREAN_FONTS.slice(0, 3);

  // ── 우측 패널용 함수들 (메인 Story 레벨) ──
  const [removingBg, setRemovingBg] = useState(false);

  const handleFlipTailHorizontally = useCallback(() => {
    const selBubble = selectedBubbleId ? activePanel?.bubbles.find(b => b.id === selectedBubbleId) : null;
    if (!selBubble || selBubble.tailStyle === "none") return;
    const cx = selBubble.x + selBubble.width / 2;
    const defaultTip = getDefaultTailTip(selBubble);
    const origTipX = selBubble.tailTipX ?? defaultTip?.x ?? cx;
    const origTipY = selBubble.tailTipY ?? defaultTip?.y ?? (selBubble.y + selBubble.height);
    const updates: Partial<SpeechBubble> = {
      tailTipX: 2 * cx - origTipX,
      tailTipY: origTipY,
    };
    if (typeof selBubble.tailCtrl1X === "number" && typeof selBubble.tailCtrl1Y === "number") {
      updates.tailCtrl1X = 2 * cx - selBubble.tailCtrl1X;
      updates.tailCtrl1Y = selBubble.tailCtrl1Y;
    }
    if (typeof selBubble.tailCtrl2X === "number" && typeof selBubble.tailCtrl2Y === "number") {
      updates.tailCtrl2X = 2 * cx - selBubble.tailCtrl2X;
      updates.tailCtrl2Y = selBubble.tailCtrl2Y;
    }
    if (typeof selBubble.tailCtrl3X === "number" && typeof selBubble.tailCtrl3Y === "number") {
      updates.tailCtrl3X = 2 * cx - selBubble.tailCtrl3X;
      updates.tailCtrl3Y = selBubble.tailCtrl3Y;
    }
    if (typeof selBubble.tailCtrl4X === "number" && typeof selBubble.tailCtrl4Y === "number") {
      updates.tailCtrl4X = 2 * cx - selBubble.tailCtrl4X;
      updates.tailCtrl4Y = selBubble.tailCtrl4Y;
    }
    updatePanel(activePanelIndex, {
      ...activePanel,
      bubbles: activePanel.bubbles.map(b => b.id === selBubble.id ? { ...b, ...updates } : b),
    });
  }, [selectedBubbleId, activePanel, activePanelIndex, updatePanel]);

  const handleRemoveBackground = useCallback(async () => {
    const selChar = selectedCharId ? activePanel?.characters.find(c => c.id === selectedCharId) : null;
    if (!selChar) {
      toast({ title: "이미지를 먼저 선택해주세요", variant: "destructive" });
      return;
    }
    if (!isPro) {
      toast({ title: "Pro 전용 기능", description: "배경제거는 Pro 멤버십 전용 기능입니다.", variant: "destructive" });
      return;
    }
    setRemovingBg(true);
    try {
      const res = await apiRequest("POST", "/api/remove-background", { sourceImageData: selChar.imageUrl });
      const data = await res.json();
      if (data.imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = data.imageUrl;
        img.onload = () => {
          updatePanel(activePanelIndex, {
            ...activePanel,
            characters: activePanel.characters.map(c => c.id === selChar.id ? { ...c, imageUrl: data.imageUrl, imageEl: img } : c),
          });
        };
        img.onerror = () => {
          toast({ title: "배경 제거 결과 이미지 로드 실패", variant: "destructive" });
        };
        toast({ title: "배경 제거 완료" });
      } else {
        toast({ title: "배경 제거 실패", description: "결과 이미지가 없습니다.", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "배경 제거 실패", description: e?.message || "잠시 후 다시 시도해주세요.", variant: "destructive" });
    } finally {
      setRemovingBg(false);
    }
  }, [selectedCharId, activePanel, activePanelIndex, updatePanel, isPro, toast]);

  const toggleGuidePanel = useCallback(() => {
    setActiveLeftTab((prev) => (prev === "guide" ? null : "guide"));
  }, []);
  const LEFT_TABS: { id: LeftTab; icon: typeof Wand2; label: string }[] = [
    { id: "image", icon: ImageIcon as any, label: "이미지 선택" },
    { id: "ai", icon: Wand2, label: "AI 프롬프트" },
    { id: "tools", icon: Pen as any, label: "도구" },
    { id: "elements", icon: Boxes as any, label: "요소" },
    { id: "generative", icon: Sparkles as any, label: "생성형" },
  ];

  // ─── Tool items for compact tools panel ─────────────────────────────
  const TOOL_ITEMS: { id: string; icon: typeof Pen; label: string; color?: string }[] = [
    { id: "select", icon: MousePointer2, label: "선택" },
    { id: "drawing", icon: Pen, label: "드로잉", color: "#ef4444" },
    { id: "line", icon: Minus, label: "선", color: "#3b82f6" },
    { id: "text", icon: Type, label: "텍스트", color: "#8b5cf6" },
    { id: "shapes", icon: Square, label: "도형", color: "#10b981" },
  ];

  // ─── Element items for compact elements panel ─────────────────────────
  const ELEMENT_ITEMS: { id: string; icon: typeof Pen; label: string; color?: string }[] = [
    { id: "script", icon: AlignVerticalJustifyStart, label: "자막 설정", color: "#eab308" },
    { id: "bubble", icon: MessageSquare, label: "말풍선", color: "#3b82f6" },
    { id: "template", icon: LayoutGrid, label: "템플릿 가져오기", color: "#8b5cf6" },
  ];

  // ─── AI items for compact AI panel ─────────────────────────────────
  const AI_ITEMS: { id: string; icon: typeof Pen; label: string; color?: string }[] = [
    { id: "subtitle", icon: Wand2, label: "AI 프롬프트 자막", color: "#8b5cf6" },
    { id: "instatoonFull", icon: Sparkles, label: "인스타툰 자동화", color: "#f59e0b" },
    { id: "instatoonPrompt", icon: ImagePlus, label: "인스타툰 이미지", color: "#3b82f6" },
    { id: "autoWebtoon", icon: LayoutGrid, label: "자동화툰 멀티컷", color: "#10b981" },
  ];

  // ─── Drawing brush items for sub-panel ──────────────────────────────
  const DRAWING_BRUSH_ITEMS: { id: string; icon: typeof Pen; label: string; color?: string }[] = [
    { id: "ballpoint", icon: Pen, label: "펜", color: "#3b82f6" },
    { id: "marker", icon: PenLine, label: "마커", color: "#ef4444" },
    { id: "highlighter", icon: Highlighter, label: "형광펜", color: "#eab308" },
  ];

  return (
    <div className="editor-page h-[calc(100vh-3.5rem)] flex overflow-hidden bg-background relative" data-lenis-prevent>
      <EditorChecklistPopover
        completedItems={checklistCompleted}
        onDismiss={() => localStorage.setItem("olli_editor_checklist_dismissed", "1")}
      />
      <div
        className="left-icon-sidebar flex flex-col items-center py-3 px-1.5 gap-1 shrink-0 bg-background/80 border-r"
        style={{ margin: "0.3rem", borderRadius: "0.4rem", width: "50px", zIndex: 20 }}
        data-testid="left-icon-sidebar"
      >
        {LEFT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => toggleLeftTab(tab.id)}
            className={`left-icon-sidebar__btn flex items-center justify-center rounded-full transition-colors w-[40px] h-[40px] pt-[10px] pb-[10px] ${activeLeftTab === tab.id ? "bg-primary/10 text-primary font-semibold left-icon-sidebar__btn--active" : "text-muted-foreground hover-elevate"}`}
            data-testid={`button-left-tab-${tab.id}`}
          >
            <tab.icon className="h-[18px] w-[18px]" />
            <span className="left-icon-sidebar__label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 h-full">
        {activeLeftTab && (
          <div
            className={`h-full bg-background/80 overflow-y-auto border-r ${(activeLeftTab === "tools" || activeLeftTab === "elements" || activeLeftTab === "ai" || activeLeftTab === "generative" || activeLeftTab === "guide") ? "w-auto" : "w-[320px]"}`}
            data-testid="left-panel-content"
          >
            {/* ─── Guide Panel ─────────────────────────── */}
            {activeLeftTab === "guide" && (
              <StoryGuidePanel
                onClose={() => setActiveLeftTab(null)}
                onNavigateToTab={(tab, subTab) => {
                  setActiveLeftTab(tab as LeftTab);
                  if (tab === "ai" && subTab) setAiMode(subTab as any);
                  if (tab === "elements" && subTab) setElementsSubTab(subTab as any);
                }}
              />
            )}
            <div className={(activeLeftTab === "tools" || activeLeftTab === "elements" || activeLeftTab === "ai" || activeLeftTab === "generative") ? "" : (activeLeftTab === "guide" ? "hidden" : "p-3 space-y-5")}>
                  {/* ─── Compact AI Panel ─────────────────────────── */}
                  {activeLeftTab === "ai" && (
                    <div className="tools-compact-panel">
                      <div className="tools-compact-panel__strip">
                        <button
                          onClick={() => setActiveLeftTab(null)}
                          className="tools-compact-panel__close-btn"
                          title="닫기"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {AI_ITEMS.map((item) => {
                          const isLocked = (item.id === "instatoonFull" || item.id === "instatoonPrompt") && !isPro;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (isLocked) {
                                  toast({ title: "Pro 전용 기능", description: `${item.label}은(는) Pro 멤버십 전용입니다.`, variant: "destructive" });
                                  return;
                                }
                                setAiMode(aiMode === item.id as any ? null : item.id as any);
                              }}
                              className={`tools-compact-panel__tool-btn ${aiMode === item.id ? "tools-compact-panel__tool-btn--active" : ""}`}
                              title={item.label}
                            >
                              <item.icon className="h-5 w-5" style={item.color && aiMode !== item.id ? { color: item.color } : undefined} />
                              {isLocked && <Crown className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-yellow-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  )}

                  {/* AI mode forms moved to right panel — see right panel section below */}

                  {activeLeftTab === "image" && activePanel && (
                    <>
                      <div className="flex items-center justify-between gap-2 mb-2 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-1">
                        <h3 className="text-sm font-semibold">이미지선택/업로드</h3>
                        <button
                          onClick={() => setActiveLeftTab(null)}
                          className="text-muted-foreground hover-elevate rounded-md p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <EditorPanel
                        panel={activePanel}
                        index={activePanelIndex}
                        total={panels.length}
                        onUpdate={(updated) => updatePanel(activePanelIndex, updated)}
                        onRemove={() => removePanel(activePanelIndex)}
                        galleryImages={galleryData ?? []}
                        galleryLoading={galleryLoading}
                        galleryHasMore={galleryHasMore}
                        onLoadMoreGallery={() => setGalleryLimit((prev) => prev + 30)}
                        fetchFullGeneration={fetchFullGeneration}
                        selectedBubbleId={selectedBubbleId}
                        setSelectedBubbleId={setSelectedBubbleId}
                        selectedCharId={selectedCharId}
                        setSelectedCharId={setSelectedCharId}
                        creatorTier={usageData?.creatorTier ?? 0}
                        isPro={isPro}
                        mode="image"
                        forceRerender={() => setPanelsRaw((cur) => cur.map(pp => ({ ...pp })))}
                        characterFolders={storyCharacterFolders}
                        activeGalleryFolderId={activeGalleryFolderId}
                        setActiveGalleryFolderId={setActiveGalleryFolderId}
                        markChecklistDone={markChecklistDone}
                      />
                    </>
                  )}

                  {/* ─── Compact Tools Panel ─────────────────────────── */}
                  {activeLeftTab === "tools" && (
                    <div className="tools-compact-panel">
                      {/* Main tool strip */}
                      <div className="tools-compact-panel__strip">
                        <button
                          onClick={() => setActiveLeftTab(null)}
                          className="tools-compact-panel__close-btn"
                          title="닫기"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {TOOL_ITEMS.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSelectedToolItem(item.id);
                              setSelectedDrawingLayerId(null);
                              if (item.id === "drawing") {
                                setDrawingToolState(s => ({ ...s, tool: "brush" }));
                                markChecklistDone("use-drawing");
                              }
                              if (item.id === "text") {
                                handleAddText();
                              }
                              if (item.id === "line") {
                                handleAddLine(selectedLineSubType);
                              }
                              setShowDrawingSettings(false);
                              setShowLineSettings(false);
                              setShowDrawingContextSettings(false);
                            }}
                            className={`tools-compact-panel__tool-btn ${selectedToolItem === item.id ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title={item.label}
                          >
                            <item.icon className="h-5 w-5" style={item.color && selectedToolItem !== item.id ? { color: item.color } : undefined} />
                          </button>
                        ))}
                      </div>

                      {/* Drawing sub-tools strip */}
                      {selectedToolItem === "drawing" && (
                        <div className="tools-compact-panel__strip tools-compact-panel__strip--sub">
                          {DRAWING_BRUSH_ITEMS.map((brush) => (
                            <button
                              key={brush.id}
                              onClick={() => setDrawingToolState(s => ({ ...s, tool: "brush", brushType: brush.id as any }))}
                              className={`tools-compact-panel__tool-btn ${drawingToolState.tool === "brush" && drawingToolState.brushType === brush.id ? "tools-compact-panel__tool-btn--active" : ""}`}
                              title={brush.label}
                            >
                              <brush.icon className="h-5 w-5" style={brush.color && !(drawingToolState.tool === "brush" && drawingToolState.brushType === brush.id) ? { color: brush.color } : undefined} />
                            </button>
                          ))}
                          {/* Eraser */}
                          <button
                            onClick={() => setDrawingToolState(s => ({ ...s, tool: "eraser" }))}
                            className={`tools-compact-panel__tool-btn ${drawingToolState.tool === "eraser" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="지우개"
                          >
                            <Eraser className="h-5 w-5" style={drawingToolState.tool !== "eraser" ? { color: "#f472b6" } : undefined} />
                          </button>
                          {/* Color picker */}
                          <button
                            onClick={() => colorInputRef.current?.click()}
                            className="tools-compact-panel__tool-btn tools-compact-panel__color-btn"
                            title="색상 선택"
                          >
                            <span
                              className="tools-compact-panel__color-circle"
                              style={{ backgroundColor: drawingToolState.color }}
                            />
                            <input
                              ref={colorInputRef}
                              type="color"
                              value={drawingToolState.color}
                              onChange={(e) => setDrawingToolState(s => ({ ...s, color: e.target.value, tool: "brush" }))}
                              className="sr-only"
                            />
                          </button>
                          {/* Settings menu */}
                          <button
                            onClick={() => setShowDrawingSettings(s => !s)}
                            className={`tools-compact-panel__tool-btn ${showDrawingSettings ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="설정"
                          >
                            <Menu className="h-5 w-5" />
                          </button>
                        </div>
                      )}

                      {/* Drawing settings inline panel */}
                      {selectedToolItem === "drawing" && showDrawingSettings && (
                        <div className="tools-compact-panel__settings">
                          <div className="tools-compact-panel__settings-section">
                            <div className="tools-compact-panel__settings-row">
                              <span className="text-[11px] text-muted-foreground font-medium">굵기</span>
                              <span className="text-[11px] text-primary font-medium tabular-nums">{drawingToolState.size}px</span>
                            </div>
                            <Slider
                              min={1}
                              max={100}
                              step={1}
                              value={[drawingToolState.size]}
                              onValueChange={([v]) => setDrawingToolState(s => ({ ...s, size: v }))}
                              className="w-full"
                            />
                          </div>
                          <div className="tools-compact-panel__settings-section">
                            <div className="tools-compact-panel__settings-row">
                              <span className="text-[11px] text-muted-foreground font-medium">불투명도</span>
                              <span className="text-[11px] text-primary font-medium tabular-nums">{Math.round(drawingToolState.opacity * 100)}%</span>
                            </div>
                            <Slider
                              min={5}
                              max={100}
                              step={1}
                              value={[Math.round(drawingToolState.opacity * 100)]}
                              onValueChange={([v]) => setDrawingToolState(s => ({ ...s, opacity: v / 100 }))}
                              className="w-full"
                            />
                          </div>
                          <div className="tools-compact-panel__settings-actions">
                            <button
                              onClick={() => handleDrawingUndo()}
                              className="tools-compact-panel__action-btn"
                              title="실행 취소"
                            >
                              <Undo2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDrawingRedo()}
                              className="tools-compact-panel__action-btn"
                              title="다시 실행"
                            >
                              <Redo2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDrawingClear()}
                              className="tools-compact-panel__action-btn tools-compact-panel__action-btn--danger"
                              title="전체 삭제"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Line sub-tools strip */}
                      {selectedToolItem === "line" && (
                        <div className="tools-compact-panel__strip tools-compact-panel__strip--sub">
                          <button
                            onClick={() => { setSelectedLineSubType("straight"); handleAddLine("straight"); }}
                            className={`tools-compact-panel__tool-btn ${selectedLineSubType === "straight" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="직선"
                          >
                            <Minus className="h-5 w-5" style={selectedLineSubType !== "straight" ? { color: "#3b82f6" } : undefined} />
                          </button>
                          <button
                            onClick={() => { setSelectedLineSubType("curved"); handleAddLine("curved"); }}
                            className={`tools-compact-panel__tool-btn ${selectedLineSubType === "curved" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="곡선"
                          >
                            <Spline className="h-5 w-5" style={selectedLineSubType !== "curved" ? { color: "#8b5cf6" } : undefined} />
                          </button>
                          <button
                            onClick={() => { setSelectedLineSubType("polyline"); handleAddLine("polyline"); }}
                            className={`tools-compact-panel__tool-btn ${selectedLineSubType === "polyline" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="꺾인선"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={selectedLineSubType !== "polyline" ? { color: "#f97316" } : undefined}>
                              <polyline points="4,18 10,8 14,16 20,6" />
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* Shape sub-tools strip */}
                      {selectedToolItem === "shapes" && (
                        <div className="tools-compact-panel__strip tools-compact-panel__strip--sub">
                          <button
                            onClick={() => { setSelectedShapeType("rectangle"); handleAddShape("rectangle"); }}
                            className={`tools-compact-panel__tool-btn ${selectedShapeType === "rectangle" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="사각형"
                          >
                            <Square className="h-5 w-5" style={selectedShapeType !== "rectangle" ? { color: "#10b981" } : undefined} />
                          </button>
                          <button
                            onClick={() => { setSelectedShapeType("circle"); handleAddShape("circle"); }}
                            className={`tools-compact-panel__tool-btn ${selectedShapeType === "circle" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="원"
                          >
                            <Circle className="h-5 w-5" style={selectedShapeType !== "circle" ? { color: "#3b82f6" } : undefined} />
                          </button>
                          <button
                            onClick={() => { setSelectedShapeType("triangle"); handleAddShape("triangle"); }}
                            className={`tools-compact-panel__tool-btn ${selectedShapeType === "triangle" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="삼각형"
                          >
                            <Triangle className="h-5 w-5" style={selectedShapeType !== "triangle" ? { color: "#8b5cf6" } : undefined} />
                          </button>
                          <button
                            onClick={() => { setSelectedShapeType("diamond"); handleAddShape("diamond"); }}
                            className={`tools-compact-panel__tool-btn ${selectedShapeType === "diamond" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="다이아몬드"
                          >
                            <Diamond className="h-5 w-5" style={selectedShapeType !== "diamond" ? { color: "#f97316" } : undefined} />
                          </button>
                          <button
                            onClick={() => { setSelectedShapeType("star"); handleAddShape("star"); }}
                            className={`tools-compact-panel__tool-btn ${selectedShapeType === "star" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="별"
                          >
                            <Star className="h-5 w-5" style={selectedShapeType !== "star" ? { color: "#eab308" } : undefined} />
                          </button>
                          <button
                            onClick={() => { setSelectedShapeType("arrow"); handleAddShape("arrow"); }}
                            className={`tools-compact-panel__tool-btn ${selectedShapeType === "arrow" ? "tools-compact-panel__tool-btn--active" : ""}`}
                            title="화살표"
                          >
                            <ArrowRightIcon className="h-5 w-5" style={selectedShapeType !== "arrow" ? { color: "#ef4444" } : undefined} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                {activeLeftTab === "elements" && activePanel && (
                  <div className="tools-compact-panel">
                    <div className="tools-compact-panel__strip">
                      <button onClick={() => setActiveLeftTab(null)} className="tools-compact-panel__close-btn" title="닫기">
                        <X className="h-4 w-4" />
                      </button>
                      {ELEMENT_ITEMS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === "bubble" || item.id === "template") {
                              guard(() => {
                                if (item.id === "template") {
                                  setShowStoryTemplatePicker(true);
                                } else {
                                  setElementsSubTab(item.id as any);
                                }
                              });
                            } else {
                              setElementsSubTab(item.id as any);
                            }
                          }}
                          className={`tools-compact-panel__tool-btn ${
                            item.id !== "template" && elementsSubTab === item.id
                              ? "tools-compact-panel__tool-btn--active" : ""
                          }`}
                          title={item.label}
                        >
                          <item.icon className="h-5 w-5"
                            style={item.color && elementsSubTab !== item.id ? { color: item.color } : undefined}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Compact Generative Panel ────────────────── */}
                {activeLeftTab === "generative" && activePanel && (
                  <div className="tools-compact-panel">
                    {/* Main tool strip */}
                    <div className="tools-compact-panel__strip">
                      <button onClick={() => setActiveLeftTab(null)} className="tools-compact-panel__close-btn" title="닫기">
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedGenTool("fill")}
                        className={`tools-compact-panel__tool-btn ${selectedGenTool === "fill" ? "tools-compact-panel__tool-btn--active" : ""}`}
                        title="생성형 채우기"
                      >
                        <Paintbrush className="h-5 w-5" style={selectedGenTool !== "fill" ? { color: "#8b5cf6" } : undefined} />
                      </button>
                      <button
                        onClick={() => setSelectedGenTool("expand")}
                        className={`tools-compact-panel__tool-btn ${selectedGenTool === "expand" ? "tools-compact-panel__tool-btn--active" : ""}`}
                        title="생성형 확장"
                      >
                        <Maximize className="h-5 w-5" style={selectedGenTool !== "expand" ? { color: "#3b82f6" } : undefined} />
                      </button>
                      <button
                        onClick={() => setSelectedGenTool("upscale")}
                        className={`tools-compact-panel__tool-btn ${selectedGenTool === "upscale" ? "tools-compact-panel__tool-btn--active" : ""}`}
                        title="생성형 업스케일"
                      >
                        <Scaling className="h-5 w-5" style={selectedGenTool !== "upscale" ? { color: "#10b981" } : undefined} />
                      </button>
                      <button
                        onClick={() => { setSelectedGenTool("object"); setSelectionMode("click"); }}
                        className={`tools-compact-panel__tool-btn ${selectedGenTool === "object" ? "tools-compact-panel__tool-btn--active" : ""}`}
                        title="개체 선택"
                      >
                        <ScanSearch className="h-5 w-5" style={selectedGenTool !== "object" ? { color: "#f59e0b" } : undefined} />
                      </button>
                    </div>

                    {/* Sub-panel for fill: selection mode + prompt */}
                    {selectedGenTool === "fill" && (
                      <div className="tools-compact-panel__strip tools-compact-panel__strip--sub" style={{ minWidth: 160 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", padding: "0 4px", marginBottom: 2 }}>선택 도구</span>
                        <button onClick={() => setSelectionMode("brush")} className={`tools-compact-panel__tool-btn ${selectionMode === "brush" ? "tools-compact-panel__tool-btn--active" : ""}`} title="선택 브러시">
                          <Paintbrush className="h-4 w-4" />
                        </button>
                        <button onClick={() => setSelectionMode("lasso")} className={`tools-compact-panel__tool-btn ${selectionMode === "lasso" ? "tools-compact-panel__tool-btn--active" : ""}`} title="올가미">
                          <Spline className="h-4 w-4" />
                        </button>
                        <button onClick={() => setSelectionMode("rectangle")} className={`tools-compact-panel__tool-btn ${selectionMode === "rectangle" ? "tools-compact-panel__tool-btn--active" : ""}`} title="사각형 선택">
                          <Square className="h-4 w-4" />
                        </button>
                        <button onClick={() => setSelectionMode("ellipse")} className={`tools-compact-panel__tool-btn ${selectionMode === "ellipse" ? "tools-compact-panel__tool-btn--active" : ""}`} title="원형 선택">
                          <Circle className="h-4 w-4" />
                        </button>

                        {selectionMode === "brush" && (
                          <div style={{ padding: "4px 8px", width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>크기</span>
                              <span style={{ fontSize: 10, fontWeight: 500, color: "hsl(var(--primary))" }}>{selectionBrushSize}px</span>
                            </div>
                            <Slider min={5} max={100} step={1} value={[selectionBrushSize]} onValueChange={([v]) => setSelectionBrushSize(v)} />
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 4, padding: "4px 4px 0" }}>
                          <button onClick={() => selectionCanvasRef.current?.expandSelection(3)} className="tools-compact-panel__tool-btn" title="선택 확대" style={{ width: 36, height: 36 }}>
                            <PlusCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => selectionCanvasRef.current?.shrinkSelection(3)} className="tools-compact-panel__tool-btn" title="선택 축소" style={{ width: 36, height: 36 }}>
                            <MinusCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => selectionCanvasRef.current?.clearSelection()} className="tools-compact-panel__tool-btn" title="선택 초기화" style={{ width: 36, height: 36 }}>
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="generative-prompt-area" style={{ padding: "8px 4px", width: "100%" }}>
                          <Textarea
                            placeholder="채울 내용을 입력..."
                            value={genPrompt}
                            onChange={(e) => setGenPrompt(e.target.value)}
                            rows={2}
                            style={{ fontSize: 12, resize: "none", marginBottom: 6 }}
                          />
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={genLoading || !genPrompt.trim()}
                            onClick={async () => {
                              const mask = selectionCanvasRef.current?.exportMask();
                              if (!mask) {
                                toast({ title: "영역을 먼저 선택해주세요", variant: "destructive" });
                                return;
                              }
                              const imageData = capturePanelClean(activePanel.id);
                              if (!imageData) return;
                              setGenLoading(true);
                              try {
                                const resp = await apiRequest("POST", "/api/generative-fill", {
                                  imageData, maskData: mask, prompt: genPrompt,
                                });
                                const data = await resp.json();
                                if (data.imageUrl) {
                                  const composited = await compositeWithMask(imageData, data.imageUrl, mask);
                                  applyImageToPanel(activePanelIndex, composited);
                                  selectionCanvasRef.current?.clearSelection();
                                  setGenPrompt("");
                                  toast({ title: "생성형 채우기 완료" });
                                  queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
                                }
                              } catch (err: any) {
                                toast({ title: "생성형 채우기 실패", description: err.message, variant: "destructive" });
                              } finally {
                                setGenLoading(false);
                              }
                            }}
                          >
                            {genLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                            생성
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sub-panel for expand */}
                    {selectedGenTool === "expand" && (
                      <div className="tools-compact-panel__strip tools-compact-panel__strip--sub" style={{ minWidth: 160 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", padding: "0 4px", marginBottom: 2 }}>생성형 확장</span>
                        <div style={{ padding: "4px 8px", width: "100%", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                          캔버스 가장자리 핸들을 드래그하여 확장 영역을 지정하세요.
                        </div>
                        {(expandTop + expandRight + expandBottom + expandLeft > 0) && (
                          <div style={{ padding: "2px 8px", width: "100%", display: "flex", flexWrap: "wrap", gap: 4, fontSize: 10 }}>
                            {expandTop > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">상 {expandTop}px</Badge>}
                            {expandRight > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">우 {expandRight}px</Badge>}
                            {expandBottom > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">하 {expandBottom}px</Badge>}
                            {expandLeft > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">좌 {expandLeft}px</Badge>}
                          </div>
                        )}
                        <div style={{ padding: "2px 8px", width: "100%" }}>
                          <button
                            onClick={() => { setExpandTop(0); setExpandRight(0); setExpandBottom(0); setExpandLeft(0); }}
                            className="tools-compact-panel__tool-btn"
                            style={{ width: "100%", height: 32, fontSize: 11 }}
                            title="초기화"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" /> 초기화
                          </button>
                        </div>
                        <div className="generative-prompt-area" style={{ padding: "8px 4px", width: "100%" }}>
                          <Textarea
                            placeholder="확장 영역 설명 (선택사항)..."
                            value={genPrompt}
                            onChange={(e) => setGenPrompt(e.target.value)}
                            rows={2}
                            style={{ fontSize: 12, resize: "none", marginBottom: 6 }}
                          />
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={genLoading || (expandTop + expandRight + expandBottom + expandLeft === 0)}
                            onClick={async () => {
                              const imageData = capturePanelClean(activePanel.id);
                              if (!imageData) return;
                              setGenLoading(true);
                              try {
                                const resp = await apiRequest("POST", "/api/generative-expand", {
                                  imageData, top: expandTop, right: expandRight, bottom: expandBottom, left: expandLeft, prompt: genPrompt,
                                });
                                const data = await resp.json();
                                if (data.imageUrl) {
                                  applyImageToPanel(activePanelIndex, data.imageUrl);
                                  setExpandTop(0); setExpandRight(0); setExpandBottom(0); setExpandLeft(0);
                                  toast({ title: "생성형 확장 완료" });
                                  queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
                                }
                              } catch (err: any) {
                                toast({ title: "생성형 확장 실패", description: err.message, variant: "destructive" });
                              } finally {
                                setGenLoading(false);
                              }
                            }}
                          >
                            {genLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Maximize className="h-3.5 w-3.5 mr-1" />}
                            확장
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sub-panel for upscale */}
                    {selectedGenTool === "upscale" && (
                      <div className="tools-compact-panel__strip tools-compact-panel__strip--sub" style={{ minWidth: 160 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", padding: "0 4px", marginBottom: 4 }}>업스케일</span>
                        <div style={{ padding: "4px 8px", width: "100%", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                          현재 패널 이미지를 2배 해상도로 업스케일합니다.
                        </div>
                        <div className="generative-prompt-area" style={{ padding: "8px 4px", width: "100%" }}>
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={genLoading}
                            onClick={async () => {
                              const imageData = capturePanelClean(activePanel.id);
                              if (!imageData) return;
                              setGenLoading(true);
                              try {
                                const resp = await apiRequest("POST", "/api/generative-upscale", {
                                  imageData, scale: 2,
                                });
                                const data = await resp.json();
                                if (data.imageUrl) {
                                  applyImageToPanel(activePanelIndex, data.imageUrl);
                                  toast({ title: "업스케일 완료 (2x)" });
                                  queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
                                }
                              } catch (err: any) {
                                toast({ title: "업스케일 실패", description: err.message, variant: "destructive" });
                              } finally {
                                setGenLoading(false);
                              }
                            }}
                          >
                            {genLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Scaling className="h-3.5 w-3.5 mr-1" />}
                            2x 업스케일
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sub-panel for object selection */}
                    {selectedGenTool === "object" && (
                      <div className="tools-compact-panel__strip tools-compact-panel__strip--sub" style={{ minWidth: 160 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", padding: "0 4px", marginBottom: 2 }}>개체 선택</span>

                        {/* Click-to-select info */}
                        <div style={{ padding: "4px 8px", width: "100%", fontSize: 10, color: "hsl(var(--muted-foreground))", lineHeight: 1.4 }}>
                          클릭하면 같은 색상 영역이 즉시 선택됩니다.
                        </div>
                        {/* Tolerance slider */}
                        <div style={{ padding: "4px 8px", width: "100%" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                            <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>허용 범위</span>
                            <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}>{floodFillTolerance}</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={floodFillTolerance}
                            onChange={(e) => setFloodFillTolerance(Number(e.target.value))}
                            style={{ width: "100%", height: 4, cursor: "pointer" }}
                          />
                        </div>

                        {/* Selection refinement tools */}
                        <div style={{ display: "flex", gap: 4, padding: "4px 4px 0" }}>
                          <button onClick={() => selectionCanvasRef.current?.expandSelection(3)} className="tools-compact-panel__tool-btn" title="선택 확대" style={{ width: 36, height: 36 }}>
                            <PlusCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => selectionCanvasRef.current?.shrinkSelection(3)} className="tools-compact-panel__tool-btn" title="선택 축소" style={{ width: 36, height: 36 }}>
                            <MinusCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => { selectionCanvasRef.current?.clearSelection(); }} className="tools-compact-panel__tool-btn" title="선택 초기화" style={{ width: 36, height: 36 }}>
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Selection tools */}
                        <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", padding: "4px 8px 0", width: "100%" }}>선택 도구</span>
                        <div style={{ display: "flex", gap: 4, padding: "2px 4px", flexWrap: "wrap" }}>
                          <button onClick={() => setSelectionMode("click")} className={`tools-compact-panel__tool-btn ${selectionMode === "click" ? "tools-compact-panel__tool-btn--active" : ""}`} title="클릭 선택 (마법봉)" style={{ width: 32, height: 32 }}>
                            <MousePointerClick className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setSelectionMode("brush")} className={`tools-compact-panel__tool-btn ${selectionMode === "brush" ? "tools-compact-panel__tool-btn--active" : ""}`} title="브러시" style={{ width: 32, height: 32 }}>
                            <Paintbrush className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setSelectionMode("lasso")} className={`tools-compact-panel__tool-btn ${selectionMode === "lasso" ? "tools-compact-panel__tool-btn--active" : ""}`} title="올가미" style={{ width: 32, height: 32 }}>
                            <Spline className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setSelectionMode("rectangle")} className={`tools-compact-panel__tool-btn ${selectionMode === "rectangle" ? "tools-compact-panel__tool-btn--active" : ""}`} title="사각형" style={{ width: 32, height: 32 }}>
                            <Square className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setSelectionMode("ellipse")} className={`tools-compact-panel__tool-btn ${selectionMode === "ellipse" ? "tools-compact-panel__tool-btn--active" : ""}`} title="원형" style={{ width: 32, height: 32 }}>
                            <Circle className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Action toggle: Color vs AI Fill */}
                        <div style={{ display: "flex", gap: 4, padding: "8px 4px 4px", width: "100%" }}>
                          <button
                            onClick={() => setObjectAction("color")}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                              padding: "6px 0",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              border: objectAction === "color" ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                              background: objectAction === "color" ? "hsl(var(--primary) / 0.1)" : "hsl(var(--card))",
                              color: objectAction === "color" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                              cursor: "pointer",
                            }}
                          >
                            <Palette className="h-3.5 w-3.5" /> 색상 변경
                          </button>
                          <button
                            onClick={() => setObjectAction("fill")}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 4,
                              padding: "6px 0",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              border: objectAction === "fill" ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                              background: objectAction === "fill" ? "hsl(var(--primary) / 0.1)" : "hsl(var(--card))",
                              color: objectAction === "fill" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                              cursor: "pointer",
                            }}
                          >
                            <Sparkles className="h-3.5 w-3.5" /> AI 생성
                          </button>
                        </div>

                        {/* Color change mode */}
                        {objectAction === "color" && (
                          <div style={{ padding: "4px 4px 8px", width: "100%" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 3, marginBottom: 8 }}>
                              {WEBTOON_COLOR_PRESETS.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setSelectedObjectColor(color)}
                                  style={{
                                    width: "100%",
                                    aspectRatio: "1",
                                    borderRadius: 4,
                                    background: color,
                                    border: selectedObjectColor === color ? "2px solid hsl(var(--primary))" : color === "#ffffff" ? "1px solid hsl(var(--border))" : "1px solid transparent",
                                    cursor: "pointer",
                                    boxShadow: selectedObjectColor === color ? "0 0 0 1px hsl(var(--primary))" : "none",
                                  }}
                                  title={color}
                                />
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 8 }}>
                              <label style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                <Palette className="h-3.5 w-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
                                <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))" }}>커스텀</span>
                                <input
                                  type="color"
                                  value={selectedObjectColor}
                                  onChange={(e) => setSelectedObjectColor(e.target.value)}
                                  style={{ width: 24, height: 24, border: "none", padding: 0, cursor: "pointer", borderRadius: 4 }}
                                />
                              </label>
                              <span style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}>{selectedObjectColor}</span>
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              disabled={genLoading}
                              onClick={() => applyColorToSelection()}
                            >
                              {genLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Palette className="h-3.5 w-3.5 mr-1" />}
                              색상 적용
                            </Button>
                          </div>
                        )}

                        {/* AI generative fill mode */}
                        {objectAction === "fill" && (
                          <div className="generative-prompt-area" style={{ padding: "8px 4px", width: "100%" }}>
                            <Textarea
                              placeholder="채울 내용을 입력..."
                              value={genPrompt}
                              onChange={(e) => setGenPrompt(e.target.value)}
                              rows={2}
                              style={{ fontSize: 12, resize: "none", marginBottom: 6 }}
                            />
                            <Button
                              size="sm"
                              className="w-full"
                              disabled={genLoading || !genPrompt.trim()}
                              onClick={async () => {
                                const mask = selectionCanvasRef.current?.exportMask();
                                if (!mask) {
                                  toast({ title: "영역을 먼저 선택해주세요", variant: "destructive" });
                                  return;
                                }
                                const imageData = capturePanelClean(activePanel!.id);
                                if (!imageData) return;
                                setGenLoading(true);
                                try {
                                  const resp = await apiRequest("POST", "/api/generative-fill", {
                                    imageData, maskData: mask, prompt: genPrompt,
                                  });
                                  const data = await resp.json();
                                  if (data.imageUrl) {
                                    const composited = await compositeWithMask(imageData, data.imageUrl, mask);
                                    applyImageToPanel(activePanelIndex, composited);
                                    selectionCanvasRef.current?.clearSelection();
                                    setGenPrompt("");
                                    toast({ title: "생성형 채우기 완료" });
                                    queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
                                  }
                                } catch (err: any) {
                                  toast({ title: "생성형 채우기 실패", description: err.message, variant: "destructive" });
                                } finally {
                                  setGenLoading(false);
                                }
                              }}
                            >
                              {genLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                              생성
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                </div>
              </div>
          )}

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div
              className="w-full relative"
              data-testid="canvas-toolbar"
            >
              <div
                className="flex items-center justify-between gap-3 px-5 py-2 w-full flex-wrap bg-background/60 dark:bg-background/40"
                style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 mr-1">
                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                      <BookOpen className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight" data-testid="text-story-title">스토리</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={undo} disabled={historyRef.current.length === 0} title="실행 취소 (Ctrl+Z)" data-testid="button-undo">
                      <Undo2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={redo} disabled={futureRef.current.length === 0} title="다시 실행 (Ctrl+Shift+Z)" data-testid="button-redo">
                      <Redo2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={resetAll} title="초기화" data-testid="button-reset-story">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={startStoryTour} title="도움말" data-testid="button-story-help">
                    <Lightbulb className="h-3.5 w-3.5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="다운로드" data-testid="button-download-panel">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[200px]">
                      <DropdownMenuLabel className="text-[11px]">PNG 다운로드</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => guard(() => downloadPanelSized(activePanelIndex, CANVAS_W, CANVAS_H))}>

                        <span className="text-xs">Original ({CANVAS_W}×{CANVAS_H})</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={!isPro} onClick={() => guard(() => downloadPanelSized(activePanelIndex, CANVAS_W * 2, CANVAS_H * 2))}>

                        <span className="text-xs">Instagram 2x ({CANVAS_W * 2}×{CANVAS_H * 2})</span>
                        {!isPro && <Crown className="h-3 w-3 ml-auto text-yellow-500" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={!isPro} onClick={() => guard(() => downloadPanelSvg(activePanelIndex))}>

                        <span className="text-xs">SVG</span>
                        {!isPro && <Crown className="h-3 w-3 ml-auto text-yellow-500" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 h-7 text-xs px-2"
                        data-testid="button-download-all-panels"
                      >
                        <Download className="h-3 w-3" />
                        전체 다운로드
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[200px]">
                      <DropdownMenuLabel className="text-[11px]">PNG 전체 다운로드</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => guard(() => downloadAllSized(CANVAS_W, CANVAS_H))}>
                        <span className="text-xs">Original ({CANVAS_W}×{CANVAS_H})</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={!isPro} onClick={() => guard(() => downloadAllSized(CANVAS_W * 2, CANVAS_H * 2))}>
                        <span className="text-xs">Instagram 2x ({CANVAS_W * 2}×{CANVAS_H * 2})</span>
                        {!isPro && <Crown className="h-3 w-3 ml-auto text-yellow-500" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={!isPro} onClick={() => guard(() => downloadAllSvg())}>
                        <span className="text-xs">SVG</span>
                        {!isPro && <Crown className="h-3 w-3 ml-auto text-yellow-500" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button size="sm" onClick={() => guard(() => setShowSaveModal(true))} className="gap-1 h-7 text-xs px-2.5 bg-primary text-primary-foreground border-primary" data-testid="button-save-story-project">
                    <Save className="h-3 w-3" />
                    저장
                    {!isPro && <Crown className="h-2.5 w-2.5 ml-0.5 text-yellow-300" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 h-7 text-xs px-2"
                    onClick={() => guard(() => setShowInstagramPublish(true))}
                    title="Instagram에 게시"
                    data-testid="button-instagram-publish"
                  >
                    <Instagram className="h-3 w-3" />
                    게시
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" title="불러오기" data-testid="button-story-load-project" onClick={() => { setLoadFolderId(null); setShowLoadModal(true); }}>
                    <FolderOpen className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
            </div>

            {/* Main Canvas Area - List View */}
            <div
              ref={canvasAreaRef}
              className={`flex-1 overflow-y-auto bg-muted/20 dark:bg-muted/10 ${zoom >= 200 ? "p-0" : "p-8"}`}
              data-testid="story-canvas-area"
              onMouseDown={(e) => {
                const target = e.target as HTMLElement;
                // 버튼, 입력, 캔버스 등 인터랙티브 요소가 아닌 빈 영역 클릭 시 선택 해제
                if (!target.closest('canvas') && !target.closest('button') && !target.closest('input') && !target.closest('textarea') && !target.closest('svg') && !target.closest('[role="menuitem"]') && !target.closest('[data-radix-collection-item]')) {
                  setSelectedBubbleId(null);
                  setSelectedCharId(null);
                  setSelectedTextId(null);
                  setSelectedLineId(null);
                  setSelectedShapeId(null);
                  setSelectedDrawingLayerId(null);
                  setSelectedScriptPosition(null);
                }
              }}
            >
              <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 pt-16 pb-32">
                {panels.map((panel, i) => (
                  <ContextMenu key={panel.id}>
                    <ContextMenuTrigger>
                      <div
                        onMouseDown={(e) => {
                          if (e.target === e.currentTarget) {
                            setSelectedBubbleId(null);
                            setSelectedCharId(null);
                            setSelectedTextId(null);
                            setSelectedLineId(null);
                            setSelectedDrawingLayerId(null);
                          }
                        }}
                        onClick={() => {
                          if (activePanelIndex !== i) {
                            setSelectedScriptPosition(null);
                            setEditingScriptPositionForCanvas(null);
                            setSelectedBubbleId(null);
                            setSelectedCharId(null);
                            setSelectedTextId(null);
                            setSelectedLineId(null);
                            setSelectedShapeId(null);
                            setSelectedDrawingLayerId(null);
                          }
                          setActivePanelIndex(i);
                        }}
                        className={`relative shadow-lg transition-all ${activePanelIndex === i ? "ring-4 ring-primary ring-offset-2" : "opacity-90 hover:opacity-100"}`}
                      >
                        <div className="absolute -left-12 top-0 flex flex-col gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-sm ${activePanelIndex === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {i + 1}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-red-500 shadow hover:bg-white"
                          style={{ zIndex: 25 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removePanel(i);
                          }}
                          title="페이지 삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {/* ─── Context Toolbars ─── absolute above canvas */}
                        {activePanelIndex === i && selectedTextElement && (
                          <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                            <TextContextToolbar
                              element={selectedTextElement}
                              onChange={handleUpdateTextElement}
                            />
                          </div>
                        )}
                        {activePanelIndex === i && selectedLineElement && (
                          <>
                            <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                              <LineContextToolbar
                                element={selectedLineElement}
                                onChange={handleUpdateLineElement}
                                showSettings={showLineSettings}
                                onShowSettings={() => setShowLineSettings(s => !s)}
                              />
                            </div>
                            {showLineSettings && (
                              <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 55 }}>
                                <FloatingSettingsModal
                                  strokeWidth={selectedLineElement.strokeWidth}
                                  opacity={selectedLineElement.opacity}
                                  onStrokeWidthChange={(v) => handleUpdateLineElement({ ...selectedLineElement, strokeWidth: v })}
                                  onOpacityChange={(v) => handleUpdateLineElement({ ...selectedLineElement, opacity: v })}
                                  onClose={() => setShowLineSettings(false)}
                                />
                              </div>
                            )}
                          </>
                        )}
                        {activePanelIndex === i && selectedShapeElement && (
                          <>
                            <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                              <ShapeContextToolbar
                                element={selectedShapeElement}
                                onChange={handleUpdateShapeElement}
                                showSettings={showShapeSettings}
                                onShowSettings={() => setShowShapeSettings(s => !s)}
                              />
                            </div>
                            {showShapeSettings && (
                              <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 55 }}>
                                <FloatingSettingsModal
                                  strokeWidth={selectedShapeElement.strokeWidth}
                                  opacity={selectedShapeElement.opacity}
                                  onStrokeWidthChange={(v) => handleUpdateShapeElement({ ...selectedShapeElement, strokeWidth: v })}
                                  onOpacityChange={(v) => handleUpdateShapeElement({ ...selectedShapeElement, opacity: v })}
                                  onClose={() => setShowShapeSettings(false)}
                                  minStrokeWidth={0}
                                />
                              </div>
                            )}
                          </>
                        )}
                        {activePanelIndex === i && selectedToolItem === "select" && selectedDrawingLayerId && (() => {
                          const selLayer = (panel.drawingLayers || []).find(l => l.id === selectedDrawingLayerId) || null;
                          return (
                          <>
                            <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                              <DrawingContextToolbar
                                color={drawingToolState.color}
                                onColorChange={(c) => setDrawingToolState(s => ({ ...s, color: c }))}
                                showSettings={showDrawingContextSettings}
                                onShowSettings={() => setShowDrawingContextSettings(s => !s)}
                                layer={selLayer}
                                onDelete={() => {
                                  updatePanel(i, {
                                    ...panel,
                                    drawingLayers: (panel.drawingLayers || []).filter(l => l.id !== selectedDrawingLayerId),
                                  });
                                  setSelectedDrawingLayerId(null);
                                }}
                                onDuplicate={() => {
                                  if (!selLayer) return;
                                  const maxZ = (panel.drawingLayers || []).reduce((max, l) => Math.max(max, l.zIndex), 0);
                                  const newLayer: DrawingLayer = {
                                    ...selLayer,
                                    id: generateId(),
                                    zIndex: maxZ + 1,
                                  };
                                  const img = new Image();
                                  img.onload = () => {
                                    newLayer.imageEl = img;
                                    updatePanel(i, {
                                      ...panel,
                                      drawingLayers: [...(panel.drawingLayers || []), newLayer],
                                    });
                                    setSelectedDrawingLayerId(newLayer.id);
                                  };
                                  img.src = selLayer.imageData;
                                }}
                                onToggleVisibility={() => {
                                  updatePanel(i, {
                                    ...panel,
                                    drawingLayers: (panel.drawingLayers || []).map(l =>
                                      l.id === selectedDrawingLayerId ? { ...l, visible: !l.visible } : l
                                    ),
                                  });
                                }}
                                onOpacityChange={(opacity) => {
                                  updatePanel(i, {
                                    ...panel,
                                    drawingLayers: (panel.drawingLayers || []).map(l =>
                                      l.id === selectedDrawingLayerId ? { ...l, opacity } : l
                                    ),
                                  });
                                }}
                                onBringForward={() => {
                                  const layers = [...(panel.drawingLayers || [])].sort((a, b) => a.zIndex - b.zIndex);
                                  const idx = layers.findIndex(l => l.id === selectedDrawingLayerId);
                                  if (idx < 0 || idx >= layers.length - 1) return;
                                  const cur = layers[idx].zIndex;
                                  layers[idx] = { ...layers[idx], zIndex: layers[idx + 1].zIndex };
                                  layers[idx + 1] = { ...layers[idx + 1], zIndex: cur };
                                  updatePanel(i, { ...panel, drawingLayers: layers });
                                }}
                                onSendBackward={() => {
                                  const layers = [...(panel.drawingLayers || [])].sort((a, b) => a.zIndex - b.zIndex);
                                  const idx = layers.findIndex(l => l.id === selectedDrawingLayerId);
                                  if (idx <= 0) return;
                                  const cur = layers[idx].zIndex;
                                  layers[idx] = { ...layers[idx], zIndex: layers[idx - 1].zIndex };
                                  layers[idx - 1] = { ...layers[idx - 1], zIndex: cur };
                                  updatePanel(i, { ...panel, drawingLayers: layers });
                                }}
                                onBringToFront={() => {
                                  const maxZ = (panel.drawingLayers || []).reduce((max, l) => Math.max(max, l.zIndex), 0);
                                  updatePanel(i, {
                                    ...panel,
                                    drawingLayers: (panel.drawingLayers || []).map(l =>
                                      l.id === selectedDrawingLayerId ? { ...l, zIndex: maxZ + 1 } : l
                                    ),
                                  });
                                }}
                                onSendToBack={() => {
                                  const minZ = (panel.drawingLayers || []).reduce((min, l) => Math.min(min, l.zIndex), Infinity);
                                  updatePanel(i, {
                                    ...panel,
                                    drawingLayers: (panel.drawingLayers || []).map(l =>
                                      l.id === selectedDrawingLayerId ? { ...l, zIndex: minZ - 1 } : l
                                    ),
                                  });
                                }}
                              />
                            </div>
                            {showDrawingContextSettings && (
                              <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 55 }}>
                                <FloatingSettingsModal
                                  strokeWidth={drawingToolState.size}
                                  opacity={drawingToolState.opacity}
                                  onStrokeWidthChange={(v) => setDrawingToolState(s => ({ ...s, size: v }))}
                                  onOpacityChange={(v) => setDrawingToolState(s => ({ ...s, opacity: v }))}
                                  onClose={() => setShowDrawingContextSettings(false)}
                                />
                              </div>
                            )}
                          </>
                          );
                        })()}
                        {/* Character context toolbar */}
                        {activePanelIndex === i && selectedCharId && !selectedTextElement && !selectedLineElement && !selectedShapeElement && !selectedDrawingLayerId && (() => {
                          const selChar = panel.characters.find(c => c.id === selectedCharId);
                          if (!selChar) return null;
                          return (
                            <>
                              <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                                <CharContextToolbar
                                  onFlipX={() => {
                                    updatePanel(i, {
                                      ...panel,
                                      characters: panel.characters.map(c =>
                                        c.id === selectedCharId ? { ...c, flipX: !c.flipX } : c
                                      ),
                                    });
                                  }}
                                  onDelete={() => {
                                    updatePanel(i, {
                                      ...panel,
                                      characters: panel.characters.filter(c => c.id !== selectedCharId),
                                    });
                                    setSelectedCharId(null);
                                    setShowCharRegenPanel(false);
                                    setCharInpaintMode(false);
                                  }}
                                  onRegenerate={() => {
                                    setShowCharRegenPanel(v => !v);
                                    setCharRegenTab("full");
                                    setCharRegenDragPos(null);
                                    if (!showCharRegenPanel && selChar.prompt) {
                                      setCharRegenPrompt(selChar.prompt);
                                    }
                                  }}
                                  showRegenPanel={showCharRegenPanel}
                                />
                              </div>
                              {showCharRegenPanel && (
                                <div
                                  style={{
                                    position: "absolute",
                                    ...(charRegenDragPos
                                      ? { left: charRegenDragPos.x, top: charRegenDragPos.y, transform: "none" }
                                      : { top: 8, left: "50%", transform: "translateX(-50%)" }),
                                    zIndex: 55,
                                  }}
                                >
                                  <div className="floating-settings-modal" style={{ minWidth: 300, padding: 12 }}>
                                    <div
                                      className="floating-settings-modal__header"
                                      style={{ cursor: "grab", userSelect: "none" }}
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const modalEl = e.currentTarget.closest(".floating-settings-modal")?.parentElement;
                                        if (!modalEl) return;
                                        const rect = (modalEl as HTMLElement).getBoundingClientRect();
                                        const parentRect = (modalEl as HTMLElement).offsetParent?.getBoundingClientRect() ?? rect;
                                        const currentX = rect.left - parentRect.left;
                                        const currentY = rect.top - parentRect.top;
                                        charRegenDragRef.current = { startMouseX: e.clientX, startMouseY: e.clientY, startX: currentX, startY: currentY };
                                        const onMove = (ev: MouseEvent) => {
                                          if (!charRegenDragRef.current) return;
                                          const dx = ev.clientX - charRegenDragRef.current.startMouseX;
                                          const dy = ev.clientY - charRegenDragRef.current.startMouseY;
                                          setCharRegenDragPos({ x: charRegenDragRef.current.startX + dx, y: charRegenDragRef.current.startY + dy });
                                        };
                                        const onUp = () => {
                                          charRegenDragRef.current = null;
                                          document.removeEventListener("mousemove", onMove);
                                          document.removeEventListener("mouseup", onUp);
                                        };
                                        document.addEventListener("mousemove", onMove);
                                        document.addEventListener("mouseup", onUp);
                                      }}
                                    >
                                      <span className="floating-settings-modal__title">AI 재생성</span>
                                      <button className="floating-settings-modal__close" onClick={() => { setShowCharRegenPanel(false); setCharInpaintMode(false); charInpaintSelectionRef.current?.clearSelection(); setCharRegenDragPos(null); }}>
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                    {/* Tab buttons */}
                                    <div style={{ display: "flex", gap: 0, marginBottom: 10, borderRadius: 6, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
                                      <button
                                        onClick={() => { setCharRegenTab("full"); setCharInpaintMode(false); charInpaintSelectionRef.current?.clearSelection(); }}
                                        style={{
                                          flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                                          background: charRegenTab === "full" ? "hsl(var(--primary))" : "hsl(var(--muted))",
                                          color: charRegenTab === "full" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                                        }}
                                      >
                                        전체 재생성
                                      </button>
                                      <button
                                        onClick={() => { setCharRegenTab("inpaint"); setCharInpaintMode(true); }}
                                        style={{
                                          flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                                          background: charRegenTab === "inpaint" ? "hsl(var(--primary))" : "hsl(var(--muted))",
                                          color: charRegenTab === "inpaint" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                                        }}
                                      >
                                        부분 수정
                                      </button>
                                    </div>

                                    {/* Full regeneration tab (existing) */}
                                    {charRegenTab === "full" && (
                                      <>
                                        <textarea
                                          value={charRegenPrompt}
                                          onChange={(e) => setCharRegenPrompt(e.target.value)}
                                          placeholder="원하는 장면을 설명하세요..."
                                          disabled={charRegenLoading}
                                          style={{
                                            width: "100%", minHeight: 60, resize: "vertical",
                                            padding: 8, borderRadius: 6, border: "1px solid hsl(var(--border))",
                                            fontSize: 13, fontFamily: "inherit", marginBottom: 8,
                                            background: "hsl(var(--background))", color: "hsl(var(--foreground))",
                                          }}
                                        />
                                        <div style={{ display: "flex", gap: 6 }}>
                                          <button
                                            disabled={charRegenLoading || !charRegenPrompt.trim()}
                                            onClick={() => regenerateCharImage(selectedCharId, i, charRegenPrompt.trim(), "prompt")}
                                            style={{
                                              flex: 1, padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                                              background: charRegenLoading || !charRegenPrompt.trim() ? "hsl(var(--muted))" : "hsl(var(--primary))",
                                              color: charRegenLoading || !charRegenPrompt.trim() ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))",
                                              border: "none", cursor: charRegenLoading || !charRegenPrompt.trim() ? "not-allowed" : "pointer",
                                            }}
                                          >
                                            {charRegenLoading ? "생성 중..." : "프롬프트로 재생성"}
                                          </button>
                                          <button
                                            disabled={charRegenLoading}
                                            onClick={() => regenerateCharImage(selectedCharId, i, "", "variation")}
                                            style={{
                                              flex: 1, padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                                              background: charRegenLoading ? "hsl(var(--muted))" : "hsl(var(--secondary))",
                                              color: charRegenLoading ? "hsl(var(--muted-foreground))" : "hsl(var(--secondary-foreground))",
                                              border: "none", cursor: charRegenLoading ? "not-allowed" : "pointer",
                                            }}
                                          >
                                            {charRegenLoading ? "생성 중..." : "다른 포즈/표정"}
                                          </button>
                                        </div>
                                      </>
                                    )}

                                    {/* Inpaint tab (new) */}
                                    {charRegenTab === "inpaint" && (
                                      <>
                                        {/* Selection tool buttons */}
                                        <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                                          {([
                                            { key: "brush" as const, icon: "🖌️", label: "브러시", mode: "brush" as SelectionMode },
                                            { key: "lasso" as const, icon: "🔺", label: "올가미", mode: "lasso" as SelectionMode },
                                            { key: "quick" as const, icon: "✨", label: "빠른선택", mode: "click" as SelectionMode },
                                            { key: "object" as const, icon: "🎯", label: "개체선택", mode: "click" as SelectionMode },
                                          ] as const).map((tool) => (
                                            <button
                                              key={tool.key}
                                              onClick={() => { setCharInpaintToolMode(tool.key); setCharInpaintSelectionMode(tool.mode); }}
                                              style={{
                                                flex: 1, padding: "5px 0", borderRadius: 6, fontSize: 10, fontWeight: 600, border: "none", cursor: "pointer",
                                                background: charInpaintToolMode === tool.key ? "hsl(var(--primary))" : "hsl(var(--muted))",
                                                color: charInpaintToolMode === tool.key ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                                              }}
                                              title={tool.label}
                                            >
                                              {tool.icon} {tool.label}
                                            </button>
                                          ))}
                                        </div>

                                        {/* Brush size slider (only for brush mode) */}
                                        {charInpaintSelectionMode === "brush" && (
                                          <div style={{ marginBottom: 8 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>
                                              <span>브러시 크기</span>
                                              <span>{charInpaintBrushSize}px</span>
                                            </div>
                                            <Slider
                                              min={5}
                                              max={100}
                                              step={1}
                                              value={[charInpaintBrushSize]}
                                              onValueChange={([v]) => setCharInpaintBrushSize(v)}
                                              className="w-full"
                                            />
                                          </div>
                                        )}

                                        {/* Tolerance slider (for click-based modes: quick/object select) */}
                                        {charInpaintSelectionMode === "click" && (
                                          <div style={{ marginBottom: 8 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "hsl(var(--muted-foreground))", marginBottom: 4 }}>
                                              <span>허용 범위</span>
                                              <span>{floodFillTolerance}</span>
                                            </div>
                                            <Slider
                                              min={0}
                                              max={100}
                                              step={1}
                                              value={[floodFillTolerance]}
                                              onValueChange={([v]) => setFloodFillTolerance(v)}
                                              className="w-full"
                                            />
                                          </div>
                                        )}

                                        {/* Selection controls */}
                                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                                          <button onClick={() => charInpaintSelectionRef.current?.expandSelection(3)} title="선택 확대"
                                            style={{ flex: 1, padding: "4px 0", borderRadius: 6, fontSize: 11, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", cursor: "pointer" }}>
                                            <PlusCircle className="h-3.5 w-3.5 inline mr-1" />확대
                                          </button>
                                          <button onClick={() => charInpaintSelectionRef.current?.shrinkSelection(3)} title="선택 축소"
                                            style={{ flex: 1, padding: "4px 0", borderRadius: 6, fontSize: 11, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", cursor: "pointer" }}>
                                            <MinusCircle className="h-3.5 w-3.5 inline mr-1" />축소
                                          </button>
                                          <button onClick={() => charInpaintSelectionRef.current?.clearSelection()} title="선택 초기화"
                                            style={{ flex: 1, padding: "4px 0", borderRadius: 6, fontSize: 11, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))", color: "hsl(var(--foreground))", cursor: "pointer" }}>
                                            <RotateCcw className="h-3.5 w-3.5 inline mr-1" />초기화
                                          </button>
                                        </div>

                                        {/* Action toggle: color change vs AI fill */}
                                        <div style={{ display: "flex", gap: 0, marginBottom: 8, borderRadius: 6, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
                                          <button
                                            onClick={() => setCharInpaintAction("color")}
                                            style={{
                                              flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                                              background: charInpaintAction === "color" ? "hsl(var(--primary))" : "hsl(var(--muted))",
                                              color: charInpaintAction === "color" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                                            }}
                                          >
                                            색상 변경
                                          </button>
                                          <button
                                            onClick={() => setCharInpaintAction("fill")}
                                            style={{
                                              flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
                                              background: charInpaintAction === "fill" ? "hsl(var(--primary))" : "hsl(var(--muted))",
                                              color: charInpaintAction === "fill" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                                            }}
                                          >
                                            AI 수정
                                          </button>
                                        </div>

                                        {/* Color change UI */}
                                        {charInpaintAction === "color" && (
                                          <div>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 8 }}>
                                              {[
                                                "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6",
                                                "#fca5a5", "#fdba74", "#fde047", "#86efac", "#93c5fd", "#c4b5fd",
                                                "#fde8d4", "#f5d0b0", "#e8b88a", "#d4956b", "#b87449", "#8b5e3c",
                                                "#1e293b", "#334155", "#6b7280", "#9ca3af", "#d1d5db", "#ffffff",
                                              ].map((color) => (
                                                <button
                                                  key={color}
                                                  onClick={() => setSelectedObjectColor(color)}
                                                  style={{
                                                    width: "100%", aspectRatio: "1", borderRadius: 6, border: selectedObjectColor === color ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                                                    background: color, cursor: "pointer",
                                                  }}
                                                />
                                              ))}
                                            </div>
                                            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
                                              <input
                                                type="color"
                                                value={selectedObjectColor}
                                                onChange={(e) => setSelectedObjectColor(e.target.value)}
                                                style={{ width: 32, height: 32, border: "none", padding: 0, cursor: "pointer", borderRadius: 4 }}
                                              />
                                              <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{selectedObjectColor}</span>
                                            </div>
                                            <button
                                              onClick={applyColorToCharSelection}
                                              style={{
                                                width: "100%", padding: "7px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))",
                                                border: "none", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                              }}
                                            >
                                              <Paintbrush className="h-3.5 w-3.5" /> 색상 적용
                                            </button>
                                          </div>
                                        )}

                                        {/* AI fill UI */}
                                        {charInpaintAction === "fill" && (
                                          <div>
                                            <textarea
                                              value={charInpaintPrompt}
                                              onChange={(e) => setCharInpaintPrompt(e.target.value)}
                                              placeholder="수정할 내용을 입력하세요..."
                                              disabled={charInpaintLoading}
                                              style={{
                                                width: "100%", minHeight: 50, resize: "vertical",
                                                padding: 8, borderRadius: 6, border: "1px solid hsl(var(--border))",
                                                fontSize: 13, fontFamily: "inherit", marginBottom: 8,
                                                background: "hsl(var(--background))", color: "hsl(var(--foreground))",
                                              }}
                                            />
                                            <button
                                              disabled={charInpaintLoading || !charInpaintPrompt.trim()}
                                              onClick={() => charInpaintGenerate(selectedCharId!, i, charInpaintPrompt.trim())}
                                              style={{
                                                width: "100%", padding: "7px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                                                background: charInpaintLoading || !charInpaintPrompt.trim() ? "hsl(var(--muted))" : "hsl(var(--primary))",
                                                color: charInpaintLoading || !charInpaintPrompt.trim() ? "hsl(var(--muted-foreground))" : "hsl(var(--primary-foreground))",
                                                border: "none", cursor: charInpaintLoading || !charInpaintPrompt.trim() ? "not-allowed" : "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                              }}
                                            >
                                              {charInpaintLoading ? (
                                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> 수정 중...</>
                                              ) : (
                                                <><Sparkles className="h-3.5 w-3.5" /> 선택 영역 AI 수정</>
                                              )}
                                            </button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Bubble context toolbar */}
                        {activePanelIndex === i && selectedBubbleId && !selectedTextElement && !selectedLineElement && !selectedShapeElement && !selectedDrawingLayerId && (() => {
                          const selBubble = panel.bubbles.find(b => b.id === selectedBubbleId);
                          if (!selBubble) return null;
                          return (
                            <>
                              <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                                <BubbleContextToolbar
                                  bubble={selBubble}
                                  onChange={(updates) => {
                                    updatePanel(i, {
                                      ...panel,
                                      bubbles: panel.bubbles.map(b => b.id === selectedBubbleId ? { ...b, ...updates } : b),
                                    });
                                  }}
                                  showSettings={showBubbleSettings}
                                  onShowSettings={() => setShowBubbleSettings(s => !s)}
                                  canAllFonts={canAllFontsStory}
                                />
                              </div>
                              {showBubbleSettings && (
                                <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 55 }}>
                                  <BubbleFloatingSettings
                                    bubble={selBubble}
                                    onChange={(updates) => {
                                      updatePanel(i, {
                                        ...panel,
                                        bubbles: panel.bubbles.map(b => b.id === selectedBubbleId ? { ...b, ...updates } : b),
                                      });
                                    }}
                                    onClose={() => setShowBubbleSettings(false)}
                                  />
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Script context toolbar */}
                        {activePanelIndex === i && selectedScriptPosition && !selectedBubbleId && !selectedTextElement && !selectedLineElement && !selectedShapeElement && !selectedDrawingLayerId && (() => {
                          const sd = selectedScriptPosition === "top" ? panel.topScript : panel.bottomScript;
                          if (!sd) return null;
                          return (
                            <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                              <ScriptContextToolbar
                                script={sd}
                                onChange={(updates) => {
                                  const key = selectedScriptPosition === "top" ? "topScript" : "bottomScript";
                                  updatePanel(i, { ...panel, [key]: { ...sd, ...updates } });
                                }}
                                canAllFonts={canAllFontsStory}
                              />
                            </div>
                          );
                        })()}

                        {/* Canvas background toolbar — shown when nothing is selected */}
                        {activePanelIndex === i && !selectedTextElement && !selectedLineElement && !selectedShapeElement && !selectedBubbleId && !selectedCharId && !selectedDrawingLayerId && !selectedScriptPosition && (
                          <div className="context-toolbar-wrapper" style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
                            <CanvasBgToolbar
                              backgroundColor={panel.backgroundColor || "#ffffff"}
                              onColorChange={(color) => updatePanel(i, { ...panel, backgroundColor: color })}
                            />
                          </div>
                        )}

                        <PanelCanvas
                          key={panel.id + "-main"}
                          panel={panel}
                          onUpdate={(updated) => updatePanel(i, updated)}
                          selectedBubbleId={activePanelIndex === i ? selectedBubbleId : null}
                          selectedShapeId={activePanelIndex === i ? selectedShapeId : null}
                          selectedTextId={activePanelIndex === i ? selectedTextId : null}
                          onSelectBubble={(id) => {
                            setSelectedBubbleId(id);
                            setSelectedCharId(null);
                            setSelectedTextId(null);
                            setSelectedLineId(null);
                            setSelectedShapeId(null);
                            setSelectedDrawingLayerId(null);
                            setSelectedScriptPosition(null);
                            setActivePanelIndex(i);
                            if (id) {
                              // 말풍선 설정 패널로 자동 전환
                              setActiveLeftTab("elements");
                              setElementsSubTab("bubble");
                            } else {
                              setShowBubbleSettings(false);
                            }
                          }}
                          selectedCharId={activePanelIndex === i ? selectedCharId : null}
                          onSelectChar={(id) => {
                            setSelectedCharId(id);
                            setSelectedBubbleId(null);
                            setSelectedTextId(null);
                            setSelectedLineId(null);
                            setSelectedShapeId(null);
                            setSelectedDrawingLayerId(null);
                            setSelectedScriptPosition(null);
                            setActivePanelIndex(i);
                            setShowBubbleSettings(false);
                            if (!id) { setShowCharRegenPanel(false); setCharRegenPrompt(""); }
                            // 캐릭터 선택 시 패널 자동 열림 제거
                          }}
                          canvasRef={(el) => {
                            if (el) panelCanvasRefs.current.set(panel.id, el);
                            else panelCanvasRefs.current.delete(panel.id);
                          }}
                          zoom={zoom}
                          fontsReady={fontsReady}
                          isPro={isPro}
                          onEditBubble={undefined}
                          onDoubleClickBubble={undefined}
                          onDeletePanel={() => removePanel(i)}
                          hideDrawingLayers={isDrawingMode && activePanelIndex === i}
                          externalEditBubbleId={activePanelIndex === i ? editingBubbleIdForOverlay : null}
                          onEditBubbleIdChange={setEditingBubbleIdForOverlay}
                          onSelectScript={(pos) => {
                            setSelectedScriptPosition(pos);
                            if (pos) {
                              setSelectedCharId(null);
                              setSelectedBubbleId(null);
                              setSelectedTextId(null);
                              setSelectedLineId(null);
                              setSelectedShapeId(null);
                              setSelectedDrawingLayerId(null);
                              setActivePanelIndex(i);
                              setActiveScriptSection(pos);
                            }
                          }}
                          externalEditScriptPosition={activePanelIndex === i ? editingScriptPositionForCanvas : null}
                          onEditScriptPositionChange={setEditingScriptPositionForCanvas}
                          externalSelectedScriptPosition={activePanelIndex === i ? selectedScriptPosition : null}
                          isGenerating={
                            instatoonImageMutation.isPending && (
                              instatoonImageMutation.variables?.scope === "all" ||
                              (instatoonImageMutation.variables?.scope === "current" && activePanelIndex === i)
                            )
                          }
                          canvasH={CANVAS_H}
                        />

                        {/* Canva-style drawing editor overlay — only in drawing mode */}
                        {isDrawingMode && activePanelIndex === i && (
                          <div
                            className={`drawing-canvas-wrapper drawing-canvas-wrapper--active`}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              zIndex: 20,
                            }}
                          >
                            <DrawingCanvas
                              ref={drawingCanvasRef}
                              width={CANVAS_W}
                              height={CANVAS_H}
                              toolState={drawingToolState}
                              className="rounded-md"
                              drawingLayers={panel.drawingLayers || []}
                              onLayerCreated={(newLayer) => {
                                drawingUndoStackRef.current = [];
                                setPanels(prev => {
                                  const cur = prev[i];
                                  if (!cur) return prev;
                                  const existing = (cur.drawingLayers || []);
                                  // 중복 방지: 동일 ID 레이어가 이미 있으면 무시
                                  if (existing.some(dl => dl.id === newLayer.id)) return prev;
                                  const next = [...prev];
                                  next[i] = { ...cur, drawingLayers: [...existing, newLayer] };
                                  return next;
                                });
                                setSelectedDrawingLayerId(newLayer.id);
                              }}
                              onRequestTextInput={(x, y) => {
                                setTextInputPos({ x: (x / CANVAS_W) * 100, y: (y / CANVAS_H) * 100 });
                                setTextInputValue("");
                              }}
                              onStrokeEnd={() => setDrawingLayerSelected(true)}
                            />
                            <div className="drawing-mode-indicator">
                              <span className="drawing-mode-indicator__dot" />
                              드로잉 모드
                            </div>
                          </div>
                        )}

                        {/* Generative expand overlay — drag edges to expand */}
                        {isExpandMode && activePanelIndex === i && (
                          <ExpandCanvas
                            width={CANVAS_W}
                            height={CANVAS_H}
                            top={expandTop}
                            right={expandRight}
                            bottom={expandBottom}
                            left={expandLeft}
                            onExpand={(t, r, b, l) => { setExpandTop(t); setExpandRight(r); setExpandBottom(b); setExpandLeft(l); }}
                          />
                        )}

                        {/* Generative selection overlay — zIndex 25 to sit above select-mode overlay (22) */}
                        {isGenerativeMode && activePanelIndex === i && (
                          <div
                            className="selection-canvas-wrapper selection-canvas-wrapper--active"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              zIndex: 25,
                            }}
                          >
                            <SelectionCanvas
                              ref={selectionCanvasRef}
                              width={CANVAS_W}
                              height={CANVAS_H}
                              mode={selectionMode}
                              brushSize={selectionBrushSize}
                              className="rounded-md"
                              onClickPoint={selectionMode === "click" ? handleObjectSelectClick : undefined}
                              imageSource={panelCanvasRefs.current.get(panel.id) ?? null}
                            />
                            <div className="drawing-mode-indicator" style={{ background: "hsl(var(--primary) / 0.9)" }}>
                              <span className="drawing-mode-indicator__dot" />
                              {selectedGenTool === "object" ? "개체 선택" : "생성형 채우기"}
                            </div>
                          </div>
                        )}

                        {/* Character inpaint selection overlay — zIndex 26 to sit above generative fill (25) */}
                        {charInpaintMode && selectedCharId && activePanelIndex === i && (() => {
                          const inpaintChar = panel.characters.find(c => c.id === selectedCharId);
                          if (!inpaintChar || !inpaintChar.imageEl) return null;
                          const natW = inpaintChar.imageEl.naturalWidth;
                          const natH = inpaintChar.imageEl.naturalHeight;
                          const cw = natW * inpaintChar.scale;
                          const chH = natH * inpaintChar.scale;
                          const leftPct = ((inpaintChar.x - cw / 2) / CANVAS_W) * 100;
                          const topPct = ((inpaintChar.y - chH / 2) / CANVAS_H) * 100;
                          const widthPct = (cw / CANVAS_W) * 100;
                          const heightPct = (chH / CANVAS_H) * 100;
                          return (
                            <div
                              className="selection-canvas-wrapper selection-canvas-wrapper--active"
                              style={{
                                position: "absolute",
                                left: `${leftPct}%`,
                                top: `${topPct}%`,
                                width: `${widthPct}%`,
                                height: `${heightPct}%`,
                                zIndex: 26,
                                transform: inpaintChar.flipX ? "scaleX(-1)" : undefined,
                              }}
                            >
                              <SelectionCanvas
                                ref={charInpaintSelectionRef}
                                width={natW}
                                height={natH}
                                mode={charInpaintSelectionMode}
                                brushSize={charInpaintBrushSize}
                                className="rounded-sm"
                                onClickPoint={
                                  charInpaintSelectionMode === "click"
                                    ? handleCharInpaintQuickSelect
                                    : undefined
                                }
                                imageSource={charInpaintImageCanvas}
                              />
                              <div className="drawing-mode-indicator" style={{ background: "hsl(var(--primary) / 0.9)", transform: inpaintChar.flipX ? "scaleX(-1)" : undefined }}>
                                <span className="drawing-mode-indicator__dot" />
                                부분 수정
                              </div>
                            </div>
                          );
                        })()}

                        {/* Select-mode: click/drag/dblclick to interact with drawing/text/line layers */}
                        {(selectedToolItem === "select" || selectedToolItem === "text" || selectedToolItem === "line" || selectedToolItem === "shapes") && activePanelIndex === i && (
                          <div
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 22, pointerEvents: "auto", cursor: rubberBandRef.current?.active ? "crosshair" : multiDragRef.current ? "grabbing" : dragElementRef.current ? "grabbing" : "default" }}
                            onContextMenu={(e) => {
                              // Show context menu only if something is selected
                              const hasSelection = canvasMultiSelectedRef.current.size > 0 || selectedBubbleId || selectedCharId || selectedTextId || selectedLineId || selectedDrawingLayerId || selectedShapeId;
                              if (hasSelection) {
                                e.preventDefault();
                                e.stopPropagation();
                                setOverlayContextMenu({ x: e.clientX, y: e.clientY });
                              }
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              if (overlayContextMenu) setOverlayContextMenu(null);
                              const rect = e.currentTarget.getBoundingClientRect();
                              const canvasX = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
                              const canvasY = ((e.clientY - rect.top) / rect.height) * CANVAS_H;

                              const HANDLE_HIT = 10;

                              // --- 1) Check resize handles of currently selected element first ---
                              if (selectedShapeId) {
                                const selShape = (panel.shapeElements || []).find(s => s.id === selectedShapeId);
                                if (selShape) {
                                  const shapeHandles: { mode: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r"; cx: number; cy: number }[] = [
                                    { mode: "tl", cx: selShape.x, cy: selShape.y },
                                    { mode: "tr", cx: selShape.x + selShape.width, cy: selShape.y },
                                    { mode: "bl", cx: selShape.x, cy: selShape.y + selShape.height },
                                    { mode: "br", cx: selShape.x + selShape.width, cy: selShape.y + selShape.height },
                                    { mode: "t", cx: selShape.x + selShape.width / 2, cy: selShape.y },
                                    { mode: "b", cx: selShape.x + selShape.width / 2, cy: selShape.y + selShape.height },
                                    { mode: "l", cx: selShape.x, cy: selShape.y + selShape.height / 2 },
                                    { mode: "r", cx: selShape.x + selShape.width, cy: selShape.y + selShape.height / 2 },
                                  ];
                                  for (const h of shapeHandles) {
                                    if (Math.abs(canvasX - h.cx) <= HANDLE_HIT && Math.abs(canvasY - h.cy) <= HANDLE_HIT) {
                                      handleElementDragStart("shape", selShape.id, canvasX, canvasY, panel, h.mode);
                                      return;
                                    }
                                  }
                                }
                              }
                              if (selectedTextId) {
                                const selText = (panel.textElements || []).find(t => t.id === selectedTextId);
                                if (selText) {
                                  const textHandles: { mode: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r"; cx: number; cy: number }[] = [
                                    { mode: "tl", cx: selText.x, cy: selText.y },
                                    { mode: "tr", cx: selText.x + selText.width, cy: selText.y },
                                    { mode: "bl", cx: selText.x, cy: selText.y + selText.height },
                                    { mode: "br", cx: selText.x + selText.width, cy: selText.y + selText.height },
                                    { mode: "t", cx: selText.x + selText.width / 2, cy: selText.y },
                                    { mode: "b", cx: selText.x + selText.width / 2, cy: selText.y + selText.height },
                                    { mode: "l", cx: selText.x, cy: selText.y + selText.height / 2 },
                                    { mode: "r", cx: selText.x + selText.width, cy: selText.y + selText.height / 2 },
                                  ];
                                  for (const h of textHandles) {
                                    if (Math.abs(canvasX - h.cx) <= HANDLE_HIT && Math.abs(canvasY - h.cy) <= HANDLE_HIT) {
                                      handleElementDragStart("text", selText.id, canvasX, canvasY, panel, h.mode);
                                      return;
                                    }
                                  }
                                }
                              }
                              if (selectedCharId && !charInpaintMode) {
                                const selCh = panel.characters.find(c => c.id === selectedCharId);
                                if (selCh && selCh.imageEl instanceof HTMLImageElement) {
                                  const cw = selCh.imageEl.naturalWidth * selCh.scale;
                                  const chH = selCh.imageEl.naturalHeight * selCh.scale;
                                  const cx = selCh.x - cw / 2;
                                  const cy = selCh.y - chH / 2;
                                  const charCorners: { mode: "tl" | "tr" | "bl" | "br"; hx: number; hy: number }[] = [
                                    { mode: "tl", hx: cx, hy: cy },
                                    { mode: "tr", hx: cx + cw, hy: cy },
                                    { mode: "bl", hx: cx, hy: chH + cy },
                                    { mode: "br", hx: cx + cw, hy: chH + cy },
                                  ];
                                  for (const corner of charCorners) {
                                    if (Math.abs(canvasX - corner.hx) <= HANDLE_HIT && Math.abs(canvasY - corner.hy) <= HANDLE_HIT) {
                                      handleElementDragStart("char", selCh.id, canvasX, canvasY, panel, corner.mode);
                                      return;
                                    }
                                  }
                                  // Rotate handle: top-center, 18px above character
                                  const rotateHx = selCh.x;
                                  const rotateHy = cy - 18;
                                  if (Math.hypot(canvasX - rotateHx, canvasY - rotateHy) <= HANDLE_HIT) {
                                    handleElementDragStart("char", selCh.id, canvasX, canvasY, panel, "rotate");
                                    return;
                                  }
                                }
                              }
                              if (selectedBubbleId) {
                                const selB = panel.bubbles.find(b => b.id === selectedBubbleId);
                                if (selB && !selB.locked) {
                                  // Tail handles first (tip, ctrl1~4)
                                  if (selB.tailStyle !== "none") {
                                    const geo = getTailGeometry(selB);
                                    const tailHitR = 12;
                                    if (Math.hypot(canvasX - geo.tipX, canvasY - geo.tipY) < tailHitR) {
                                      handleElementDragStart("bubble", selB.id, canvasX, canvasY, panel, "move-tail");
                                      return;
                                    }
                                    const baseMidX = (geo.baseAx + geo.baseBx) / 2;
                                    const baseMidY = (geo.baseAy + geo.baseBy) / 2;
                                    const pull = 0.5 + (selB.tailCurve ?? 0.5) * 0.45;
                                    const tipPull = 0.3;
                                    const cp1x = selB.tailCtrl1X ?? (geo.baseAx + (baseMidX - geo.baseAx) * pull);
                                    const cp1y = selB.tailCtrl1Y ?? (geo.baseAy + (baseMidY - geo.baseAy) * pull);
                                    const cp2x = selB.tailCtrl2X ?? (geo.tipX + (baseMidX - geo.tipX) * tipPull);
                                    const cp2y = selB.tailCtrl2Y ?? (geo.tipY + (baseMidY - geo.tipY) * tipPull);
                                    const cp3x = selB.tailCtrl3X ?? (geo.tipX + (baseMidX - geo.tipX) * tipPull);
                                    const cp3y = selB.tailCtrl3Y ?? (geo.tipY + (baseMidY - geo.tipY) * tipPull);
                                    const cp4x = selB.tailCtrl4X ?? (geo.baseBx + (baseMidX - geo.baseBx) * pull);
                                    const cp4y = selB.tailCtrl4Y ?? (geo.baseBy + (baseMidY - geo.baseBy) * pull);
                                    if (Math.hypot(canvasX - cp1x, canvasY - cp1y) < tailHitR) {
                                      handleElementDragStart("bubble", selB.id, canvasX, canvasY, panel, "tail-ctrl1");
                                      return;
                                    }
                                    if (Math.hypot(canvasX - cp2x, canvasY - cp2y) < tailHitR) {
                                      handleElementDragStart("bubble", selB.id, canvasX, canvasY, panel, "tail-ctrl2");
                                      return;
                                    }
                                    if (Math.hypot(canvasX - cp3x, canvasY - cp3y) < tailHitR) {
                                      handleElementDragStart("bubble", selB.id, canvasX, canvasY, panel, "tail-ctrl3");
                                      return;
                                    }
                                    if (Math.hypot(canvasX - cp4x, canvasY - cp4y) < tailHitR) {
                                      handleElementDragStart("bubble", selB.id, canvasX, canvasY, panel, "tail-ctrl4");
                                      return;
                                    }
                                  }
                                  // Resize handles
                                  const bCorners: { mode: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r"; hx: number; hy: number }[] = [
                                    { mode: "tl", hx: selB.x, hy: selB.y },
                                    { mode: "tr", hx: selB.x + selB.width, hy: selB.y },
                                    { mode: "bl", hx: selB.x, hy: selB.y + selB.height },
                                    { mode: "br", hx: selB.x + selB.width, hy: selB.y + selB.height },
                                    { mode: "t", hx: selB.x + selB.width / 2, hy: selB.y },
                                    { mode: "b", hx: selB.x + selB.width / 2, hy: selB.y + selB.height },
                                    { mode: "l", hx: selB.x, hy: selB.y + selB.height / 2 },
                                    { mode: "r", hx: selB.x + selB.width, hy: selB.y + selB.height / 2 },
                                  ];
                                  for (const corner of bCorners) {
                                    if (Math.abs(canvasX - corner.hx) <= HANDLE_HIT && Math.abs(canvasY - corner.hy) <= HANDLE_HIT) {
                                      handleElementDragStart("bubble", selB.id, canvasX, canvasY, panel, corner.mode);
                                      return;
                                    }
                                  }
                                }
                              }

                              // --- 1.5) Multi-select group drag detection ---
                              if (canvasMultiSelectedRef.current.size > 1) {
                                const p = panels[i];
                                if (p) {
                                  const multiKeys = Array.from(canvasMultiSelectedRef.current);
                                  let clickedOnSelected = false;
                                  for (const key of multiKeys) {
                                    const [etype, eid] = key.split(":");
                                    let el: any = null;
                                    if (etype === "bubble") el = p.bubbles.find(b => b.id === eid);
                                    else if (etype === "char") el = p.characters.find(c => c.id === eid);
                                    else if (etype === "text") el = (p.textElements || []).find(t => t.id === eid);
                                    else if (etype === "line") el = (p.lineElements || []).find(l => l.id === eid);
                                    else if (etype === "drawing") el = (p.drawingLayers || []).find(d => d.id === eid);
                                    else if (etype === "shape") el = (p.shapeElements || []).find(s => s.id === eid);
                                    if (!el) continue;
                                    const bb = getElementBoundingBox(etype, el);
                                    if (bb && canvasX >= bb.x && canvasX <= bb.x + bb.w && canvasY >= bb.y && canvasY <= bb.y + bb.h) {
                                      clickedOnSelected = true;
                                      break;
                                    }
                                  }
                                  if (clickedOnSelected) {
                                    // Start group drag
                                    const starts = new Map<string, { x: number; y: number } | { points: { x: number; y: number }[] }>();
                                    for (const key of multiKeys) {
                                      const [etype, eid] = key.split(":");
                                      if (etype === "bubble") { const b = p.bubbles.find(bb => bb.id === eid); if (b) starts.set(key, { x: b.x, y: b.y }); }
                                      else if (etype === "char") { const c = p.characters.find(cc => cc.id === eid); if (c) starts.set(key, { x: c.x, y: c.y }); }
                                      else if (etype === "text") { const t = (p.textElements || []).find(tt => tt.id === eid); if (t) starts.set(key, { x: t.x, y: t.y }); }
                                      else if (etype === "line") { const l = (p.lineElements || []).find(ll => ll.id === eid); if (l) starts.set(key, { points: l.points.map(pt => ({ x: pt.x, y: pt.y })) }); }
                                      else if (etype === "drawing") { const d = (p.drawingLayers || []).find(dd => dd.id === eid); if (d) starts.set(key, { x: d.x ?? 0, y: d.y ?? 0 }); }
                                      else if (etype === "shape") { const s = (p.shapeElements || []).find(ss => ss.id === eid); if (s) starts.set(key, { x: s.x, y: s.y }); }
                                    }
                                    // Push one undo snapshot before multi-drag
                                    historyRef.current = [
                                      ...historyRef.current.slice(-(MAX_HISTORY - 1)),
                                      clonePanels(panels),
                                    ];
                                    futureRef.current = [];
                                    multiDragRef.current = { startMouseX: canvasX, startMouseY: canvasY, panelIdx: i, startPositions: starts };
                                    return;
                                  }
                                }
                              }

                              // --- 1.8) Script (top/bottom) hit detection — rendered on top of all layers ---
                              {
                                const cvs = panelCanvasRefs.current.get(panel.id);
                                const sCtx = cvs?.getContext("2d");
                                if (sCtx) {
                                  const clearAllSel = () => {
                                    setSelectedShapeId(null); setSelectedTextId(null); setSelectedLineId(null);
                                    setSelectedDrawingLayerId(null); setSelectedCharId(null); setSelectedBubbleId(null);
                                    setSelectedScriptPosition(null); setCanvasMultiSelected(new Set());
                                  };
                                  for (const scriptType of ["top", "bottom"] as const) {
                                    const sd = scriptType === "top" ? panel.topScript : panel.bottomScript;
                                    if (sd && sd.text && sd.visible !== false) {
                                      const sRect = getScriptRect(sCtx, sd, scriptType, CANVAS_W, CANVAS_H);
                                      const hs = 8;
                                      const corners = [
                                        { x: sRect.bx - 2, y: sRect.by - 2 },
                                        { x: sRect.bx + sRect.bw + 2, y: sRect.by - 2 },
                                        { x: sRect.bx - 2, y: sRect.by + sRect.bh + 2 },
                                        { x: sRect.bx + sRect.bw + 2, y: sRect.by + sRect.bh + 2 },
                                      ];
                                      const isSelected = selectedScriptPosition === scriptType;
                                      const nearHandle = isSelected && corners.some(
                                        (c) => Math.abs(canvasX - c.x) <= hs && Math.abs(canvasY - c.y) <= hs
                                      );
                                      if (nearHandle) {
                                        clearAllSel();
                                        setSelectedScriptPosition(scriptType);
                                        setActiveScriptSection(scriptType);
                                        historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), clonePanels(panels)];
                                        futureRef.current = [];
                                        dragScriptOverlayRef.current = {
                                          position: scriptType,
                                          mode: "resize",
                                          startMouseX: canvasX,
                                          startMouseY: canvasY,
                                          startX: sd.x ?? sRect.bx,
                                          startY: sd.y ?? sRect.by,
                                          startFontSize: sd.fontSize || 16,
                                          startW: sRect.bw,
                                          startH: sRect.bh,
                                          panelIdx: i,
                                        };
                                        return;
                                      }
                                      if (
                                        canvasX >= sRect.bx &&
                                        canvasX <= sRect.bx + sRect.bw &&
                                        canvasY >= sRect.by &&
                                        canvasY <= sRect.by + sRect.bh
                                      ) {
                                        clearAllSel();
                                        setSelectedScriptPosition(scriptType);
                                        setActiveScriptSection(scriptType);
                                        historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), clonePanels(panels)];
                                        futureRef.current = [];
                                        dragScriptOverlayRef.current = {
                                          position: scriptType,
                                          mode: "move",
                                          startMouseX: canvasX,
                                          startMouseY: canvasY,
                                          startX: sd.x ?? sRect.bx,
                                          startY: sd.y ?? sRect.by,
                                          startFontSize: sd.fontSize || 16,
                                          startW: sRect.bw,
                                          startH: sRect.bh,
                                          panelIdx: i,
                                        };
                                        return;
                                      }
                                    }
                                  }
                                }
                              }

                              // --- 2) Unified hit-test: ALL elements sorted by z-index (highest first) ---
                              type HitItem =
                                | { type: "shape"; z: number; se: (typeof panel.shapeElements extends (infer U)[] | undefined ? U : never) }
                                | { type: "text"; z: number; te: (typeof panel.textElements extends (infer U)[] | undefined ? U : never) }
                                | { type: "line"; z: number; le: (typeof panel.lineElements extends (infer U)[] | undefined ? U : never) }
                                | { type: "drawing"; z: number; dl: (typeof panel.drawingLayers extends (infer U)[] | undefined ? U : never) }
                                | { type: "bubble"; z: number; b: typeof panel.bubbles[0] }
                                | { type: "char"; z: number; ch: (typeof panel.characters)[0] };

                              const allItems: HitItem[] = [
                                ...(panel.shapeElements || []).map(se => ({ type: "shape" as const, z: se.zIndex ?? 20, se })),
                                ...(panel.textElements || []).map(te => ({ type: "text" as const, z: te.zIndex ?? 20, te })),
                                ...(panel.lineElements || []).map(le => ({ type: "line" as const, z: le.zIndex ?? 20, le })),
                                ...(panel.drawingLayers || []).filter(dl => dl.visible && !dl.locked).map(dl => ({ type: "drawing" as const, z: dl.zIndex ?? 0, dl })),
                                ...panel.bubbles.map(b => ({ type: "bubble" as const, z: b.zIndex ?? 10, b })),
                                ...panel.characters.map(ch => ({ type: "char" as const, z: ch.zIndex ?? 0, ch })),
                              ];
                              allItems.sort((a, b) => b.z - a.z);

                              const clearSelections = () => {
                                setSelectedShapeId(null); setSelectedTextId(null); setSelectedLineId(null);
                                setSelectedDrawingLayerId(null); setSelectedCharId(null); setSelectedBubbleId(null);
                                setSelectedScriptPosition(null);
                                setCanvasMultiSelected(new Set());
                                setCharInpaintMode(false);
                                charInpaintSelectionRef.current?.clearSelection();
                              };

                              for (const item of allItems) {
                                if (item.type === "shape") {
                                  const se = item.se;
                                  if (se.locked || se.visible === false) continue;
                                  // 마스크 도형은 히트테스트에서 제외 — 레이어 패널에서 선택
                                  if (se.maskEnabled) continue;
                                  const insideBBox = canvasX >= se.x && canvasX <= se.x + se.width && canvasY >= se.y && canvasY <= se.y + se.height;
                                  if (!insideBBox) continue;
                                  // 투명 채우기 도형은 테두리(stroke) 영역만 히트테스트
                                  const isFilled = se.fillColor && se.fillColor !== "transparent" && se.fillColor !== "rgba(0,0,0,0)";
                                  if (!isFilled) {
                                    const hitMargin = Math.max(se.strokeWidth || 2, 8);
                                    const insideInner = canvasX >= se.x + hitMargin && canvasX <= se.x + se.width - hitMargin &&
                                                        canvasY >= se.y + hitMargin && canvasY <= se.y + se.height - hitMargin;
                                    if (insideInner) continue; // 투명 내부 클릭은 아래 요소로 통과
                                  }
                                  clearSelections(); setSelectedShapeId(se.id);
                                  handleElementDragStart("shape", se.id, canvasX, canvasY, panel);
                                  return;
                                } else if (item.type === "text") {
                                  const te = item.te;
                                  if (te.locked || te.visible === false) continue;
                                  if (canvasX >= te.x && canvasX <= te.x + te.width && canvasY >= te.y && canvasY <= te.y + te.height) {
                                    clearSelections(); setSelectedTextId(te.id);
                                    handleElementDragStart("text", te.id, canvasX, canvasY, panel);
                                    return;
                                  }
                                } else if (item.type === "line") {
                                  const le = item.le;
                                  if (le.locked || le.visible === false) continue;
                                  if (le.points.length < 2) continue;
                                  const HIT_DIST = 12;
                                  let hitLine = false;
                                  for (let pi = 0; pi < le.points.length - 1; pi++) {
                                    const ax = le.points[pi].x, ay = le.points[pi].y;
                                    const bx = le.points[pi + 1].x, by = le.points[pi + 1].y;
                                    const ldx = bx - ax, ldy = by - ay;
                                    const lenSq = ldx * ldx + ldy * ldy;
                                    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((canvasX - ax) * ldx + (canvasY - ay) * ldy) / lenSq));
                                    const projX = ax + t * ldx, projY = ay + t * ldy;
                                    const dist = Math.sqrt((canvasX - projX) ** 2 + (canvasY - projY) ** 2);
                                    if (dist <= HIT_DIST) { hitLine = true; break; }
                                  }
                                  if (hitLine) {
                                    clearSelections(); setSelectedLineId(le.id);
                                    handleElementDragStart("line", le.id, canvasX, canvasY, panel);
                                    return;
                                  }
                                } else if (item.type === "drawing") {
                                  const dl = item.dl;
                                  const dlHit = hitTestDrawingLayers([dl], canvasX, canvasY, CANVAS_W, CANVAS_H);
                                  if (dlHit) {
                                    clearSelections(); setSelectedDrawingLayerId(dl.id);
                                    handleElementDragStart("drawing", dl.id, canvasX, canvasY, panel);
                                    return;
                                  }
                                } else if (item.type === "bubble") {
                                  const b = item.b;
                                  if (b.locked || b.visible === false) continue;
                                  if (canvasX >= b.x && canvasX <= b.x + b.width && canvasY >= b.y && canvasY <= b.y + b.height) {
                                    clearSelections(); setSelectedBubbleId(b.id);
                                    handleElementDragStart("bubble", b.id, canvasX, canvasY, panel);
                                    return;
                                  }
                                } else if (item.type === "char") {
                                  const ch = item.ch;
                                  if (ch.locked || ch.visible === false) continue;
                                  const cw = ch.imageEl ? ch.imageEl.naturalWidth * ch.scale : 80;
                                  const chH = ch.imageEl ? ch.imageEl.naturalHeight * ch.scale : 80;
                                  if (canvasX >= ch.x - cw / 2 && canvasX <= ch.x + cw / 2 &&
                                      canvasY >= ch.y - chH / 2 && canvasY <= ch.y + chH / 2) {
                                    clearSelections(); setSelectedCharId(ch.id);
                                    if (!charInpaintMode) {
                                      handleElementDragStart("char", ch.id, canvasX, canvasY, panel);
                                    }
                                    return;
                                  }
                                }
                              }

                              // Nothing hit — clear all selections & start rubber band
                              {
                                clearSelections();
                                setEditingTextId(null);
                                rubberBandRef.current = { active: true, startX: canvasX, startY: canvasY, curX: canvasX, curY: canvasY, panelIdx: i };
                              }
                            }}
                            onMouseMove={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const canvasX = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
                              const canvasY = ((e.clientY - rect.top) / rect.height) * CANVAS_H;

                              // Always keep rubber band ref in sync (lightweight, no state)
                              if (rubberBandRef.current?.active) {
                                rubberBandRef.current.curX = canvasX;
                                rubberBandRef.current.curY = canvasY;
                              }

                              // Batch all heavy state updates via requestAnimationFrame
                              pendingDragRef.current = { canvasX, canvasY, panelIdx: i };
                              if (dragRafRef.current) return; // RAF already scheduled
                              dragRafRef.current = requestAnimationFrame(() => {
                                dragRafRef.current = 0;
                                const pending = pendingDragRef.current;
                                if (!pending) return;
                                const { canvasX: cx, canvasY: cy, panelIdx: pi } = pending;

                                // 1) Rubber band drag
                                if (rubberBandRef.current?.active) {
                                  const rb = rubberBandRef.current;
                                  const rx = Math.min(rb.startX, rb.curX);
                                  const ry = Math.min(rb.startY, rb.curY);
                                  const rw = Math.abs(rb.curX - rb.startX);
                                  const rh = Math.abs(rb.curY - rb.startY);
                                  setRubberBandRect({ x: rx, y: ry, w: rw, h: rh });
                                  return;
                                }

                                // 2) Multi-select group drag
                                if (multiDragRef.current) {
                                  const md = multiDragRef.current;
                                  const dx = cx - md.startMouseX;
                                  const dy = cy - md.startMouseY;
                                  const p = panels[md.panelIdx];
                                  if (!p) return;
                                  const updated: Record<string, any> = {};
                                  updated.characters = p.characters.map(c => {
                                    const s = md.startPositions.get(`char:${c.id}`);
                                    return s && "x" in s ? { ...c, x: s.x + dx, y: s.y + dy } : c;
                                  });
                                  updated.bubbles = p.bubbles.map(b => {
                                    const s = md.startPositions.get(`bubble:${b.id}`);
                                    return s && "x" in s ? { ...b, x: s.x + dx, y: s.y + dy } : b;
                                  });
                                  updated.textElements = (p.textElements || []).map((te: any) => {
                                    const s = md.startPositions.get(`text:${te.id}`);
                                    return s && "x" in s ? { ...te, x: s.x + dx, y: s.y + dy } : te;
                                  });
                                  updated.lineElements = (p.lineElements || []).map((le: any) => {
                                    const s = md.startPositions.get(`line:${le.id}`);
                                    return s && "points" in s ? { ...le, points: s.points.map((pt: any) => ({ x: pt.x + dx, y: pt.y + dy })) } : le;
                                  });
                                  updated.drawingLayers = (p.drawingLayers || []).map((dl: any) => {
                                    const s = md.startPositions.get(`drawing:${dl.id}`);
                                    return s && "x" in s ? { ...dl, x: s.x + dx, y: s.y + dy } : dl;
                                  });
                                  updated.shapeElements = (p.shapeElements || []).map((se: any) => {
                                    const s = md.startPositions.get(`shape:${se.id}`);
                                    return s && "x" in s ? { ...se, x: s.x + dx, y: s.y + dy } : se;
                                  });
                                  updatePanelNoHistory(md.panelIdx, { ...p, ...updated });
                                  return;
                                }

                                // 2.5) Script drag from overlay
                                if (dragScriptOverlayRef.current) {
                                  const ds = dragScriptOverlayRef.current;
                                  const dx = cx - ds.startMouseX;
                                  const dy = cy - ds.startMouseY;
                                  const p = panels[ds.panelIdx];
                                  if (!p) return;
                                  const key = ds.position === "top" ? "topScript" : "bottomScript";
                                  const sd = p[key];
                                  if (!sd) return;
                                  if (ds.mode === "move") {
                                    updatePanelNoHistory(ds.panelIdx, {
                                      ...p,
                                      [key]: { ...sd, x: ds.startX + dx, y: ds.startY + dy },
                                    });
                                  } else {
                                    const scaleFactor = Math.max(0.3, (ds.startW + dx) / ds.startW);
                                    const newFontSize = Math.round(Math.max(8, Math.min(80, ds.startFontSize * scaleFactor)));
                                    updatePanelNoHistory(ds.panelIdx, {
                                      ...p,
                                      [key]: { ...sd, fontSize: newFontSize, width: Math.max(40, ds.startW + dx), height: Math.max(20, ds.startH + dy) },
                                    });
                                  }
                                  return;
                                }

                                // 3) Single element drag
                                if (!dragElementRef.current) return;
                                handleElementDragMove(cx, cy, pi);
                              });
                            }}
                            onMouseUp={(e) => {
                              // Cancel pending RAF to avoid stale updates after mouseup
                              if (dragRafRef.current) { cancelAnimationFrame(dragRafRef.current); dragRafRef.current = 0; }
                              pendingDragRef.current = null;

                              // 1) Rubber band end — select intersecting elements
                              if (rubberBandRef.current?.active) {
                                const rb = rubberBandRef.current;
                                const rx = Math.min(rb.startX, rb.curX);
                                const ry = Math.min(rb.startY, rb.curY);
                                const rw = Math.abs(rb.curX - rb.startX);
                                const rh = Math.abs(rb.curY - rb.startY);
                                rubberBandRef.current = null;
                                setRubberBandRect(null);

                                // Only select if rubber band is large enough (avoid accidental clicks)
                                if (rw >= 4 || rh >= 4) {
                                  const selRect: BBox = { x: rx, y: ry, w: rw, h: rh };
                                  const p = panels[rb.panelIdx];
                                  if (p) {
                                    const newSel = new Set<string>();

                                    for (const b of p.bubbles) {
                                      if (b.locked || b.visible === false) continue;
                                      const bb = getElementBoundingBox("bubble", b);
                                      if (bb && rectsIntersect(selRect, bb)) newSel.add(`bubble:${b.id}`);
                                    }
                                    for (const c of p.characters) {
                                      if (c.locked || c.visible === false) continue;
                                      const bb = getElementBoundingBox("char", c);
                                      if (bb && rectsIntersect(selRect, bb)) newSel.add(`char:${c.id}`);
                                    }
                                    for (const te of (p.textElements || [])) {
                                      if (te.locked || te.visible === false) continue;
                                      const bb = getElementBoundingBox("text", te);
                                      if (bb && rectsIntersect(selRect, bb)) newSel.add(`text:${te.id}`);
                                    }
                                    for (const le of (p.lineElements || [])) {
                                      if (le.locked || le.visible === false) continue;
                                      const bb = getElementBoundingBox("line", le);
                                      if (bb && rectsIntersect(selRect, bb)) newSel.add(`line:${le.id}`);
                                    }
                                    for (const dl of (p.drawingLayers || [])) {
                                      if (!dl.visible || dl.locked) continue;
                                      const bb = getElementBoundingBox("drawing", dl);
                                      if (bb && rectsIntersect(selRect, bb)) newSel.add(`drawing:${dl.id}`);
                                    }
                                    for (const se of (p.shapeElements || [])) {
                                      if (se.locked || se.visible === false) continue;
                                      if (se.maskEnabled) continue; // exclude mask shapes
                                      const bb = getElementBoundingBox("shape", se);
                                      if (bb && rectsIntersect(selRect, bb)) newSel.add(`shape:${se.id}`);
                                    }

                                    setCanvasMultiSelected(newSel);
                                  }
                                }
                              }

                              // 2) Multi-select group drag end
                              if (multiDragRef.current) {
                                multiDragRef.current = null;
                              }

                              // 2.5) Script drag end
                              if (dragScriptOverlayRef.current) {
                                dragScriptOverlayRef.current = null;
                              }

                              // Always clear element drag state
                              handleElementDragEnd();
                            }}
                            onMouseLeave={() => {
                              if (dragRafRef.current) { cancelAnimationFrame(dragRafRef.current); dragRafRef.current = 0; }
                              pendingDragRef.current = null;
                              if (rubberBandRef.current?.active) {
                                rubberBandRef.current = null;
                                setRubberBandRect(null);
                              }
                              if (multiDragRef.current) {
                                multiDragRef.current = null;
                              }
                              if (dragScriptOverlayRef.current) {
                                dragScriptOverlayRef.current = null;
                              }
                              if (dragElementRef.current) handleElementDragEnd();
                            }}
                            onDoubleClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const canvasX = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
                              const canvasY = ((e.clientY - rect.top) / rect.height) * CANVAS_H;

                              // Double-click on script to edit
                              {
                                const cvs = panelCanvasRefs.current.get(panel.id);
                                const sCtx = cvs?.getContext("2d");
                                if (sCtx) {
                                  for (const scriptType of ["top", "bottom"] as const) {
                                    const sd = scriptType === "top" ? panel.topScript : panel.bottomScript;
                                    if (sd && sd.text !== undefined && sd.visible !== false) {
                                      const sRect = getScriptRect(sCtx, sd, scriptType, CANVAS_W, CANVAS_H);
                                      if (
                                        canvasX >= sRect.bx && canvasX <= sRect.bx + sRect.bw &&
                                        canvasY >= sRect.by && canvasY <= sRect.by + sRect.bh
                                      ) {
                                        setSelectedScriptPosition(scriptType);
                                        setActiveScriptSection(scriptType);
                                        setEditingScriptPositionForCanvas(scriptType);
                                        return;
                                      }
                                    }
                                  }
                                }
                              }

                              // Double-click on text element to edit
                              const textEls = [...(panel.textElements || [])].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
                              for (const te of textEls) {
                                if (canvasX >= te.x && canvasX <= te.x + te.width && canvasY >= te.y && canvasY <= te.y + te.height) {
                                  setEditingTextId(te.id);
                                  setSelectedTextId(te.id);
                                  return;
                                }
                              }

                              // Double-click on bubble to edit text
                              for (let bi = panel.bubbles.length - 1; bi >= 0; bi--) {
                                const b = panel.bubbles[bi];
                                if (canvasX >= b.x && canvasX <= b.x + b.width && canvasY >= b.y && canvasY <= b.y + b.height) {
                                  setSelectedBubbleId(b.id);
                                  setSelectedCharId(null);
                                  setSelectedTextId(null);
                                  setSelectedLineId(null);
                                  setSelectedShapeId(null);
                                  setSelectedDrawingLayerId(null);
                                  setEditingBubbleIdForOverlay(b.id);
                                  return;
                                }
                              }
                            }}
                          />
                        )}

                        {/* ─── Selection indicator overlay (dashed border + circle handles) ─── */}
                        {activePanelIndex === i && (() => {
                          const selChar = selectedCharId ? panel.characters.find(c => c.id === selectedCharId) : null;
                          const selBubble = selectedBubbleId ? panel.bubbles.find(b => b.id === selectedBubbleId) : null;
                          const selText = selectedTextId ? (panel.textElements || []).find((t: any) => t.id === selectedTextId) : null;
                          const selShape = selectedShapeId ? (panel.shapeElements || []).find((s: any) => s.id === selectedShapeId) : null;
                          const selDrawing = selectedDrawingLayerId ? (panel.drawingLayers || []).find((d: any) => d.id === selectedDrawingLayerId) : null;

                          type SelBox = { x: number; y: number; w: number; h: number };
                          let box: SelBox | null = null;
                          let cornerHandles: { x: number; y: number; mode: string; cursor: string }[] = [];

                          let showRotateHandle = false;
                          let rotateHandlePos = { x: 0, y: 0 };

                          if (selChar) {
                            const cw = selChar.imageEl ? selChar.imageEl.naturalWidth * selChar.scale : 80;
                            const chH = selChar.imageEl ? selChar.imageEl.naturalHeight * selChar.scale : 80;
                            box = { x: selChar.x - cw / 2 - 3, y: selChar.y - chH / 2 - 3, w: cw + 6, h: chH + 6 };
                            cornerHandles = [
                              { x: box.x, y: box.y, mode: "tl", cursor: "nwse-resize" },
                              { x: box.x + box.w, y: box.y, mode: "tr", cursor: "nesw-resize" },
                              { x: box.x, y: box.y + box.h, mode: "bl", cursor: "nesw-resize" },
                              { x: box.x + box.w, y: box.y + box.h, mode: "br", cursor: "nwse-resize" },
                            ];
                            showRotateHandle = true;
                            rotateHandlePos = { x: selChar.x, y: selChar.y - chH / 2 - 18 };
                          } else if (selBubble) {
                            box = { x: selBubble.x - 3, y: selBubble.y - 3, w: selBubble.width + 6, h: selBubble.height + 6 };
                            cornerHandles = [
                              { x: box.x, y: box.y, mode: "tl", cursor: "nwse-resize" },
                              { x: box.x + box.w, y: box.y, mode: "tr", cursor: "nesw-resize" },
                              { x: box.x + box.w / 2, y: box.y, mode: "t", cursor: "ns-resize" },
                              { x: box.x + box.w, y: box.y + box.h / 2, mode: "r", cursor: "ew-resize" },
                              { x: box.x + box.w, y: box.y + box.h, mode: "br", cursor: "nwse-resize" },
                              { x: box.x + box.w / 2, y: box.y + box.h, mode: "b", cursor: "ns-resize" },
                              { x: box.x, y: box.y + box.h, mode: "bl", cursor: "nesw-resize" },
                              { x: box.x, y: box.y + box.h / 2, mode: "l", cursor: "ew-resize" },
                            ];
                          } else if (selText) {
                            const te = selText as any;
                            box = { x: te.x - 3, y: te.y - 3, w: te.width + 6, h: te.height + 6 };
                            cornerHandles = [
                              { x: box.x, y: box.y, mode: "tl", cursor: "nwse-resize" },
                              { x: box.x + box.w, y: box.y, mode: "tr", cursor: "nesw-resize" },
                              { x: box.x + box.w / 2, y: box.y, mode: "t", cursor: "ns-resize" },
                              { x: box.x + box.w, y: box.y + box.h / 2, mode: "r", cursor: "ew-resize" },
                              { x: box.x + box.w, y: box.y + box.h, mode: "br", cursor: "nwse-resize" },
                              { x: box.x + box.w / 2, y: box.y + box.h, mode: "b", cursor: "ns-resize" },
                              { x: box.x, y: box.y + box.h, mode: "bl", cursor: "nesw-resize" },
                              { x: box.x, y: box.y + box.h / 2, mode: "l", cursor: "ew-resize" },
                            ];
                          } else if (selShape && !(selShape as any).maskEnabled) {
                            const se = selShape as any;
                            box = { x: se.x - 3, y: se.y - 3, w: se.width + 6, h: se.height + 6 };
                            cornerHandles = [
                              { x: box.x, y: box.y, mode: "tl", cursor: "nwse-resize" },
                              { x: box.x + box.w, y: box.y, mode: "tr", cursor: "nesw-resize" },
                              { x: box.x + box.w / 2, y: box.y, mode: "t", cursor: "ns-resize" },
                              { x: box.x + box.w, y: box.y + box.h / 2, mode: "r", cursor: "ew-resize" },
                              { x: box.x + box.w, y: box.y + box.h, mode: "br", cursor: "nwse-resize" },
                              { x: box.x + box.w / 2, y: box.y + box.h, mode: "b", cursor: "ns-resize" },
                              { x: box.x, y: box.y + box.h, mode: "bl", cursor: "nesw-resize" },
                              { x: box.x, y: box.y + box.h / 2, mode: "l", cursor: "ew-resize" },
                            ];
                          } else if (selDrawing) {
                            const dl = selDrawing as any;
                            const dlX = dl.x ?? 0, dlY = dl.y ?? 0;
                            const dlW = dl.width ?? CANVAS_W, dlH = dl.height ?? CANVAS_H;
                            box = { x: dlX - 3, y: dlY - 3, w: dlW + 6, h: dlH + 6 };
                            cornerHandles = [
                              { x: box.x, y: box.y, mode: "tl", cursor: "nwse-resize" },
                              { x: box.x + box.w, y: box.y, mode: "tr", cursor: "nesw-resize" },
                              { x: box.x + box.w, y: box.y + box.h, mode: "br", cursor: "nwse-resize" },
                              { x: box.x, y: box.y + box.h, mode: "bl", cursor: "nesw-resize" },
                            ];
                          }

                          if (!box) return null;
                          const HANDLE_R = 5;
                          return (
                            <>
                              {/* Dashed selection border */}
                              <div
                                style={{
                                  position: "absolute",
                                  left: `${(box.x / CANVAS_W) * 100}%`,
                                  top: `${(box.y / CANVAS_H) * 100}%`,
                                  width: `${(box.w / CANVAS_W) * 100}%`,
                                  height: `${(box.h / CANVAS_H) * 100}%`,
                                  border: `1.5px dashed ${HANDLE_COLOR}`,
                                  pointerEvents: "none",
                                  zIndex: 23,
                                  boxSizing: "border-box",
                                }}
                              />
                              {/* Resize circle handles */}
                              {cornerHandles.map((h, idx) => (
                                <div
                                  key={`sel-handle-${idx}`}
                                  style={{
                                    position: "absolute",
                                    left: `${(h.x / CANVAS_W) * 100}%`,
                                    top: `${(h.y / CANVAS_H) * 100}%`,
                                    width: HANDLE_R * 2 + 2,
                                    height: HANDLE_R * 2 + 2,
                                    transform: "translate(-50%, -50%)",
                                    borderRadius: "50%",
                                    background: "white",
                                    border: `1.8px solid ${HANDLE_COLOR}`,
                                    cursor: h.cursor,
                                    pointerEvents: "auto",
                                    zIndex: 24,
                                    boxSizing: "border-box",
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                                    const canvasX = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
                                    const canvasY = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
                                    const elType = selChar ? "char" : selBubble ? "bubble" : selText ? "text" : selShape ? "shape" : "drawing";
                                    const elId = selChar?.id || selectedBubbleId || selectedTextId || selectedShapeId || selectedDrawingLayerId || "";
                                    handleElementDragStart(elType as any, elId, canvasX, canvasY, panel, h.mode as any);
                                  }}
                                  onMouseUp={() => handleElementDragEnd()}
                                />
                              ))}
                              {/* Rotate handle for characters */}
                              {showRotateHandle && (
                                <>
                                  {/* Connector line from top center to rotate handle */}
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: `${(rotateHandlePos.x / CANVAS_W) * 100}%`,
                                      top: `${((rotateHandlePos.y + 18) / CANVAS_H) * 100}%`,
                                      width: 1.5,
                                      height: `${(18 / CANVAS_H) * 100}%`,
                                      background: HANDLE_COLOR,
                                      transform: "translateX(-50%)",
                                      pointerEvents: "none",
                                      zIndex: 23,
                                    }}
                                  />
                                  <div
                                    style={{
                                      position: "absolute",
                                      left: `${(rotateHandlePos.x / CANVAS_W) * 100}%`,
                                      top: `${(rotateHandlePos.y / CANVAS_H) * 100}%`,
                                      width: HANDLE_R * 2 + 2,
                                      height: HANDLE_R * 2 + 2,
                                      transform: "translate(-50%, -50%)",
                                      borderRadius: "50%",
                                      background: "white",
                                      border: `1.8px solid ${HANDLE_COLOR}`,
                                      cursor: "grab",
                                      pointerEvents: "auto",
                                      zIndex: 24,
                                      boxSizing: "border-box",
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                                      const canvasX = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
                                      const canvasY = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
                                      handleElementDragStart("char", selChar!.id, canvasX, canvasY, panel, "rotate");
                                    }}
                                    onMouseUp={() => handleElementDragEnd()}
                                  />
                                </>
                              )}
                            </>
                          );
                        })()}

                        {/* Canvas overlay context menu */}
                        {activePanelIndex === i && overlayContextMenu && (() => {
                          const ctxInfo = getSelectedElementInfo();
                          const hasSelection = !!ctxInfo;
                          const hasMaskShape = (panel.shapeElements || []).some((se: any) => se.maskEnabled);
                          const isMaskLinked = hasSelection && !ctxInfo!.multi && (() => {
                            const maskShape = (panel.shapeElements || []).find((se: any) => se.maskEnabled);
                            if (!maskShape) return false;
                            return ((maskShape as any).maskedLayerIds || []).includes(ctxInfo!.id);
                          })();
                          const ctxBtnClass = "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-[12px] hover:bg-accent hover:text-accent-foreground transition-colors";
                          const ctxShortcut = "text-[10px] text-muted-foreground ml-4";
                          return (
                          <>
                            <div
                              className="fixed inset-0"
                              style={{ zIndex: 49 }}
                              onClick={() => setOverlayContextMenu(null)}
                              onContextMenu={(e) => { e.preventDefault(); setOverlayContextMenu(null); }}
                            />
                            <div
                              className="fixed min-w-[180px] rounded-md border bg-popover p-1 shadow-md"
                              style={{ left: overlayContextMenu.x, top: overlayContextMenu.y, zIndex: 50 }}
                            >
                              {/* Copy / Cut / Paste / Duplicate */}
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection}
                                onClick={() => { handleOverlayCopy(); setOverlayContextMenu(null); }}>
                                <span>복사</span><span className={ctxShortcut}>⌘C</span>
                              </button>
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection}
                                onClick={() => { handleOverlayCut(); setOverlayContextMenu(null); }}>
                                <span>잘라내기</span><span className={ctxShortcut}>⌘X</span>
                              </button>
                              <button type="button" className={ctxBtnClass}
                                onClick={() => { handleOverlayPaste(); setOverlayContextMenu(null); }}>
                                <span>붙여넣기</span><span className={ctxShortcut}>⌘V</span>
                              </button>
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection}
                                onClick={() => { handleOverlayDuplicate(); setOverlayContextMenu(null); }}>
                                <span>복제</span><span className={ctxShortcut}>⌘D</span>
                              </button>

                              <div className="my-1 h-px bg-border" />

                              {/* Layer ordering */}
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection || ctxInfo?.multi}
                                onClick={() => { handleOverlayBringToFront(); setOverlayContextMenu(null); }}>
                                <span>맨 앞으로</span><span className={ctxShortcut}>⌘⇧]</span>
                              </button>
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection || ctxInfo?.multi}
                                onClick={() => { handleOverlayBringForward(); setOverlayContextMenu(null); }}>
                                <span>앞으로</span><span className={ctxShortcut}>⌘]</span>
                              </button>
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection || ctxInfo?.multi}
                                onClick={() => { handleOverlaySendBackward(); setOverlayContextMenu(null); }}>
                                <span>뒤로</span><span className={ctxShortcut}>⌘[</span>
                              </button>
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection || ctxInfo?.multi}
                                onClick={() => { handleOverlaySendToBack(); setOverlayContextMenu(null); }}>
                                <span>맨 뒤로</span><span className={ctxShortcut}>⌘⇧[</span>
                              </button>

                              <div className="my-1 h-px bg-border" />

                              {/* Lock / Visibility */}
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection}
                                onClick={() => { handleOverlayToggleLock(); setOverlayContextMenu(null); }}>
                                <span>{ctxInfo?.anyLocked || ctxInfo?.locked ? "잠금 해제" : "잠금"}</span><span className={ctxShortcut}>⌘L</span>
                              </button>
                              <button type="button" className={ctxBtnClass} disabled={!hasSelection}
                                onClick={() => { handleOverlayToggleVisibility(); setOverlayContextMenu(null); }}>
                                <span>{ctxInfo?.anyHidden || ctxInfo?.visible === false ? "보이기" : "숨기기"}</span>
                              </button>

                              {/* Mask link */}
                              {hasMaskShape && hasSelection && (
                                <button type="button" className={ctxBtnClass}
                                  onClick={() => { handleOverlayToggleMask(); setOverlayContextMenu(null); }}>
                                  <span>{isMaskLinked ? "마스크 해제" : "마스크 연결"}</span>
                                </button>
                              )}

                              <div className="my-1 h-px bg-border" />

                              {/* Select All */}
                              <button type="button" className={ctxBtnClass}
                                onClick={() => { handleOverlaySelectAll(); setOverlayContextMenu(null); }}>
                                <span>전체 선택</span><span className={ctxShortcut}>⌘A</span>
                              </button>

                              <div className="my-1 h-px bg-border" />

                              {/* Delete */}
                              <button type="button"
                                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-[12px] text-red-500 hover:bg-red-500/10 transition-colors"
                                disabled={!hasSelection}
                                onClick={() => { handleOverlayDelete(); setOverlayContextMenu(null); }}>
                                <span>삭제</span><span className={ctxShortcut}>Del</span>
                              </button>
                            </div>
                          </>
                          );
                        })()}

                        {/* Rubber band selection visual */}
                        {activePanelIndex === i && rubberBandRect && (
                          <div
                            style={{
                              position: "absolute",
                              left: `${(rubberBandRect.x / CANVAS_W) * 100}%`,
                              top: `${(rubberBandRect.y / CANVAS_H) * 100}%`,
                              width: `${(rubberBandRect.w / CANVAS_W) * 100}%`,
                              height: `${(rubberBandRect.h / CANVAS_H) * 100}%`,
                              border: `1.5px dashed ${HANDLE_COLOR}`,
                              background: "rgba(59,130,246,0.08)",
                              pointerEvents: "none",
                              zIndex: 24,
                              boxSizing: "border-box",
                            }}
                          />
                        )}

                        {/* Multi-select element highlights */}
                        {activePanelIndex === i && canvasMultiSelected.size > 0 && (() => {
                          const p = panels[i];
                          if (!p) return null;
                          const boxes: { key: string; bb: BBox }[] = [];
                          for (const k of Array.from(canvasMultiSelected)) {
                            const [etype, eid] = k.split(":");
                            let el: any = null;
                            if (etype === "bubble") el = p.bubbles.find(b => b.id === eid);
                            else if (etype === "char") el = p.characters.find(c => c.id === eid);
                            else if (etype === "text") el = (p.textElements || []).find(t => t.id === eid);
                            else if (etype === "line") el = (p.lineElements || []).find(l => l.id === eid);
                            else if (etype === "drawing") el = (p.drawingLayers || []).find(d => d.id === eid);
                            else if (etype === "shape") el = (p.shapeElements || []).find(s => s.id === eid);
                            if (!el) continue;
                            const bb = getElementBoundingBox(etype, el);
                            if (bb) boxes.push({ key: k, bb });
                          }
                          if (boxes.length === 0) return null;
                          // Compute group bounding box
                          let gMinX = Infinity, gMinY = Infinity, gMaxX = -Infinity, gMaxY = -Infinity;
                          for (const { bb } of boxes) {
                            if (bb.x < gMinX) gMinX = bb.x;
                            if (bb.y < gMinY) gMinY = bb.y;
                            if (bb.x + bb.w > gMaxX) gMaxX = bb.x + bb.w;
                            if (bb.y + bb.h > gMaxY) gMaxY = bb.y + bb.h;
                          }
                          return (
                            <>
                              {/* Individual element borders */}
                              {boxes.map(({ key, bb }) => (
                                <div
                                  key={`multi-sel-${key}`}
                                  style={{
                                    position: "absolute",
                                    left: `${(bb.x / CANVAS_W) * 100}%`,
                                    top: `${(bb.y / CANVAS_H) * 100}%`,
                                    width: `${(bb.w / CANVAS_W) * 100}%`,
                                    height: `${(bb.h / CANVAS_H) * 100}%`,
                                    border: `1.5px solid ${HANDLE_COLOR}`,
                                    pointerEvents: "none",
                                    zIndex: 24,
                                    boxSizing: "border-box",
                                  }}
                                />
                              ))}
                              {/* Group bounding box */}
                              {boxes.length > 1 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    left: `${((gMinX - 3) / CANVAS_W) * 100}%`,
                                    top: `${((gMinY - 3) / CANVAS_H) * 100}%`,
                                    width: `${((gMaxX - gMinX + 6) / CANVAS_W) * 100}%`,
                                    height: `${((gMaxY - gMinY + 6) / CANVAS_H) * 100}%`,
                                    border: `1.5px dashed ${HANDLE_COLOR}`,
                                    pointerEvents: "none",
                                    zIndex: 24,
                                    boxSizing: "border-box",
                                  }}
                                />
                              )}
                            </>
                          );
                        })()}

                        {/* Inline text editing overlay */}
                        {activePanelIndex === i && editingTextId && (() => {
                          const te = (panel.textElements || []).find(t => t.id === editingTextId);
                          if (!te) return null;
                          return (
                            <div
                              style={{
                                position: "absolute",
                                left: `${(te.x / CANVAS_W) * 100}%`,
                                top: `${(te.y / CANVAS_H) * 100}%`,
                                width: `${(te.width / CANVAS_W) * 100}%`,
                                minHeight: `${(te.height / CANVAS_H) * 100}%`,
                                zIndex: 30,
                              }}
                            >
                              <textarea
                                autoFocus
                                value={te.text}
                                onChange={(e) => {
                                  const newText = e.target.value;
                                  // Auto-adjust height based on content lines
                                  const lines = newText.split("\n").length;
                                  const minHeight = Math.max(te.height, lines * te.fontSize * 1.3 + 16);
                                  handleUpdateTextElement({ ...te, text: newText, height: minHeight });
                                }}
                                onBlur={() => setEditingTextId(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    setEditingTextId(null);
                                  }
                                }}
                                style={{
                                  width: "100%",
                                  minHeight: "100%",
                                  resize: "both",
                                  overflow: "auto",
                                  background: "rgba(255,255,255,0.95)",
                                  border: `2px solid ${HANDLE_COLOR}`,
                                  borderRadius: "4px",
                                  padding: "4px 6px",
                                  fontSize: `${te.fontSize * 0.7}px`,
                                  fontWeight: te.bold ? "bold" : "normal",
                                  fontStyle: te.italic ? "italic" : "normal",
                                  color: te.color,
                                  textAlign: te.textAlign,
                                  outline: "none",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  fontFamily: te.fontFamily === "default" ? "sans-serif" : te.fontFamily,
                                  lineHeight: "1.3",
                                }}
                              />
                            </div>
                          );
                        })()}

                        {/* Selected drawing layer bounding box with resize handles */}
                        {selectedToolItem === "select" && activePanelIndex === i && selectedDrawingLayerId && (() => {
                          const layer = (panel.drawingLayers || []).find(l => l.id === selectedDrawingLayerId);
                          if (!layer || !layer.visible || !(layer.imageEl instanceof HTMLImageElement)) return null;
                          const dlX = layer.x ?? 0;
                          const dlY = layer.y ?? 0;
                          const dlW = layer.width ?? CANVAS_W;
                          const dlH = layer.height ?? CANVAS_H;
                          // Compute bounding box from image data
                          const testCanvas = document.createElement("canvas");
                          testCanvas.width = 450;
                          testCanvas.height = 600;
                          const tCtx = testCanvas.getContext("2d", { willReadFrequently: true });
                          if (!tCtx) return null;
                          tCtx.drawImage(layer.imageEl, dlX, dlY, dlW, dlH);
                          const imgData = tCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
                          let minX = CANVAS_W, minY = CANVAS_H, maxX = 0, maxY = 0;
                          for (let py = 0; py < CANVAS_H; py++) {
                            for (let px = 0; px < CANVAS_W; px++) {
                              if (imgData.data[(py * CANVAS_W + px) * 4 + 3] > 10) {
                                if (px < minX) minX = px;
                                if (px > maxX) maxX = px;
                                if (py < minY) minY = py;
                                if (py > maxY) maxY = py;
                              }
                            }
                          }
                          if (maxX <= minX || maxY <= minY) return null;
                          const pad = 4;
                          const bLeft = ((minX - pad) / CANVAS_W) * 100;
                          const bTop = ((minY - pad) / CANVAS_H) * 100;
                          const bW = ((maxX - minX + pad * 2) / CANVAS_W) * 100;
                          const bH = ((maxY - minY + pad * 2) / CANVAS_H) * 100;
                          return (
                            <>
                              <div style={{
                                position: "absolute",
                                left: `${bLeft}%`, top: `${bTop}%`,
                                width: `${bW}%`, height: `${bH}%`,
                                border: "2px dashed hsl(var(--primary))",
                                pointerEvents: "none",
                                zIndex: 25,
                                borderRadius: "2px",
                              }} />
                              {/* Corner resize handles */}
                              {(["tl","tr","bl","br"] as const).map(mode => (
                                <div key={mode} style={{
                                  position: "absolute",
                                  left: mode.includes("l") ? `calc(${bLeft}% - 4px)` : `calc(${bLeft + bW}% - 4px)`,
                                  top: mode.includes("t") ? `calc(${bTop}% - 4px)` : `calc(${bTop + bH}% - 4px)`,
                                  width: 8, height: 8,
                                  background: "#fff",
                                  border: "1.5px solid hsl(var(--primary))",
                                  borderRadius: 1,
                                  zIndex: 26,
                                  cursor: mode === "tl" || mode === "br" ? "nwse-resize" : "nesw-resize",
                                  pointerEvents: "auto",
                                }} onMouseDown={(e) => {
                                  e.stopPropagation();
                                  const parentEl = (e.currentTarget.parentElement?.parentElement as HTMLElement);
                                  const canvasEl = parentEl?.querySelector("canvas");
                                  if (!canvasEl) return;
                                  const rect = canvasEl.getBoundingClientRect();
                                  const cx = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
                                  const cy = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
                                  handleElementDragStart("drawing", layer.id, cx, cy, panel, mode);
                                  const onMove = (me: MouseEvent) => {
                                    const mx = ((me.clientX - rect.left) / rect.width) * CANVAS_W;
                                    const my = ((me.clientY - rect.top) / rect.height) * CANVAS_H;
                                    handleElementDragMove(mx, my, i);
                                  };
                                  const onUp = () => {
                                    handleElementDragEnd();
                                    window.removeEventListener("mousemove", onMove);
                                    window.removeEventListener("mouseup", onUp);
                                  };
                                  window.addEventListener("mousemove", onMove);
                                  window.addEventListener("mouseup", onUp);
                                }} />
                              ))}
                            </>
                          );
                        })()}

                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuLabel>Page {i + 1}</ContextMenuLabel>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => {
                          const newPanel = {
                            ...panel,
                            id: generateId(),
                            bubbles: panel.bubbles.map((b) => ({ ...b, id: generateId() })),
                            characters: panel.characters.map((c) => ({ ...c, id: generateId() })),
                            drawingLayers: (panel.drawingLayers || []).map((dl) => ({ ...dl, id: generateId() })),
                          };
                          const newPanels = [...panels];
                          newPanels.splice(i + 1, 0, newPanel);
                          setPanels(newPanels);
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" /> Duplicate Page
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => removePanel(i)}
                        className="text-red-500"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Page
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}

                <Button variant="outline" className="h-24 w-full max-w-[500px] border-dashed" onClick={addPanel} disabled={panels.length >= maxPanels}>
                  <Plus className="mr-2 h-6 w-6 text-muted-foreground/70" />
                  <span className="text-muted-foreground">Add New Page</span>
                </Button>
              </div>
            </div>
            
          </div>


          <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-border bg-background shrink-0" data-testid="story-bottom-toolbar">
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setZoom((z) => Math.max(20, z - 10))}
                disabled={zoom <= 20}
                data-testid="button-story-zoom-out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Slider
                min={20}
                max={200}
                step={5}
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                className="w-28"
                data-testid="slider-story-zoom"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                disabled={zoom >= 200}
                data-testid="button-story-zoom-in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums w-9 text-right" data-testid="text-story-zoom-value">{zoom}%</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <Button
              size="icon"
              variant="ghost"
              onClick={fitToView}
              title="화면에 맞추기"
              data-testid="button-story-fit-to-view"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setZoom(200)}
              title="전체 화면"
              data-testid="button-story-fullscreen"
            >
              <Maximize className="h-3.5 w-3.5" />
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
              <button
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${canvasRatio === "3:4" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setCanvasRatio("3:4")}
              >
                3:4
              </button>
              <button
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${canvasRatio === "1:1" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setCanvasRatio("1:1")}
              >
                1:1
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel — Properties (top) + Layers (bottom) */}
        {activePanel && (() => {
          // Build reverse lookup: layerId → maskShapeId
          const layerToMaskId = new Map<string, string>();
          for (const se of (activePanel.shapeElements || [])) {
            if (se.maskEnabled && se.maskedLayerIds) {
              for (const lid of se.maskedLayerIds) {
                layerToMaskId.set(lid, se.id);
              }
            }
          }

          const rightLayerItems: LayerItem[] = [
            ...(activePanel.topScript ? [{
              type: "topScript" as const,
              id: "topScript",
              z: 9999,
              label: `상단: ${activePanel.topScript.text || "상단 스크립트"}`,
              visible: activePanel.topScript.visible,
            }] : []),
            ...(activePanel.bottomScript ? [{
              type: "bottomScript" as const,
              id: "bottomScript",
              z: 9998,
              label: `하단: ${activePanel.bottomScript.text || "하단 스크립트"}`,
              visible: activePanel.bottomScript.visible,
            }] : []),
            ...activePanel.characters.map((c: CharacterPlacement) => ({
              type: "char" as const,
              id: c.id,
              z: c.zIndex ?? 0,
              label: c.name || "캐릭터",
              thumb: c.imageUrl,
              visible: c.visible,
              locked: c.locked,
              clipMaskId: layerToMaskId.get(c.id),
            })),
            ...activePanel.bubbles.map((b: SpeechBubble, i: number) => ({
              type: "bubble" as const,
              id: b.id,
              z: b.zIndex ?? 10,
              label: b.text || STYLE_LABELS[b.style] || `말풍선 ${i + 1}`,
              thumb: b.style === "image" && (b as any).templateSrc ? (b as any).templateSrc : undefined,
              visible: b.visible,
              locked: b.locked,
              clipMaskId: layerToMaskId.get(b.id),
            })),
            ...(activePanel.drawingLayers || []).map((dl) => ({
              type: "drawing" as const,
              id: dl.id,
              z: dl.zIndex,
              label: dl.label,
              thumb: dl.imageData,
              drawingType: dl.type,
              visible: dl.visible,
              locked: dl.locked,
              clipMaskId: layerToMaskId.get(dl.id),
            })),
            ...(activePanel.textElements || []).map((te: CanvasTextElement, i: number) => ({
              type: "text" as const,
              id: te.id,
              z: te.zIndex ?? 20,
              label: te.text || `텍스트 ${i + 1}`,
              thumb: undefined as string | undefined,
              visible: te.visible,
              locked: te.locked,
              clipMaskId: layerToMaskId.get(te.id),
            })),
            ...(activePanel.lineElements || []).map((le: CanvasLineElement, i: number) => ({
              type: "line" as const,
              id: le.id,
              z: le.zIndex ?? 20,
              label: le.lineType === "straight" ? "직선" : le.lineType === "curved" ? "곡선" : "꺾인선",
              thumb: undefined as string | undefined,
              visible: le.visible,
              locked: le.locked,
              clipMaskId: layerToMaskId.get(le.id),
            })),
            ...(activePanel.shapeElements || []).map((se: CanvasShapeElement, i: number) => ({
              type: "shape" as const,
              id: se.id,
              z: se.zIndex ?? 20,
              label: se.shapeType === "rectangle" ? "사각형" : se.shapeType === "circle" ? "원" : se.shapeType === "triangle" ? "삼각형" : se.shapeType === "diamond" ? "다이아몬드" : se.shapeType === "star" ? "별" : "화살표",
              thumb: undefined as string | undefined,
              visible: se.visible,
              locked: se.locked,
              maskEnabled: se.maskEnabled,
            })),
          ].sort((a, b) => b.z - a.z);

          const applyRightLayerOrder = (ordered: Array<{ type: "char" | "bubble" | "drawing" | "text" | "line" | "shape" | "topScript" | "bottomScript"; id: string }>) => {
            const filtered = ordered.filter(it => it.type !== "topScript" && it.type !== "bottomScript");
            const n = filtered.length;
            updatePanel(activePanelIndex, {
              ...activePanel,
              characters: activePanel.characters.map((c) => {
                const idx = filtered.findIndex((it) => it.type === "char" && it.id === c.id);
                return idx >= 0 ? { ...c, zIndex: n - 1 - idx } : c;
              }),
              bubbles: activePanel.bubbles.map((b) => {
                const idx = filtered.findIndex((it) => it.type === "bubble" && it.id === b.id);
                return idx >= 0 ? { ...b, zIndex: n - 1 - idx } : b;
              }),
              drawingLayers: (activePanel.drawingLayers || []).map((dl) => {
                const idx = filtered.findIndex((it) => it.type === "drawing" && it.id === dl.id);
                return idx >= 0 ? { ...dl, zIndex: n - 1 - idx } : dl;
              }),
              textElements: (activePanel.textElements || []).map((te) => {
                const idx = filtered.findIndex((it) => it.type === "text" && it.id === te.id);
                return idx >= 0 ? { ...te, zIndex: n - 1 - idx } : te;
              }),
              lineElements: (activePanel.lineElements || []).map((le) => {
                const idx = filtered.findIndex((it) => it.type === "line" && it.id === le.id);
                return idx >= 0 ? { ...le, zIndex: n - 1 - idx } : le;
              }),
              shapeElements: (activePanel.shapeElements || []).map((se) => {
                const idx = filtered.findIndex((it) => it.type === "shape" && it.id === se.id);
                return idx >= 0 ? { ...se, zIndex: n - 1 - idx } : se;
              }),
            });
          };

          const moveRightLayer = (index: number, direction: "up" | "down") => {
            if (direction === "up" && index <= 0) return;
            if (direction === "down" && index >= rightLayerItems.length - 1) return;
            const swapIdx = direction === "up" ? index - 1 : index + 1;
            const newOrder = rightLayerItems.map((li) => ({ type: li.type as "char" | "bubble" | "drawing" | "text" | "line" | "shape" | "topScript" | "bottomScript", id: li.id }));
            const tmp = newOrder[index];
            newOrder[index] = newOrder[swapIdx];
            newOrder[swapIdx] = tmp;
            applyRightLayerOrder(newOrder);
          };

          const reorderRightLayer = (fromIndex: number, toIndex: number) => {
            if (fromIndex === toIndex) return;
            if (fromIndex < 0 || fromIndex >= rightLayerItems.length) return;
            if (toIndex < 0 || toIndex >= rightLayerItems.length) return;
            const newOrder = rightLayerItems.map((li) => ({ type: li.type as "char" | "bubble" | "drawing" | "text" | "line" | "shape" | "topScript" | "bottomScript", id: li.id }));
            const [moved] = newOrder.splice(fromIndex, 1);
            newOrder.splice(toIndex, 0, moved);
            applyRightLayerOrder(newOrder);
          };

          const selBubble = selectedBubbleId ? activePanel.bubbles.find(b => b.id === selectedBubbleId) : null;
          const selChar = selectedCharId ? activePanel.characters.find(c => c.id === selectedCharId) : null;
          const selText = selectedTextId ? (activePanel.textElements || []).find((te: CanvasTextElement) => te.id === selectedTextId) : null;
          const selLine = selectedLineId ? (activePanel.lineElements || []).find((le: CanvasLineElement) => le.id === selectedLineId) : null;
          const selShape = selectedShapeId ? (activePanel.shapeElements || []).find((se: CanvasShapeElement) => se.id === selectedShapeId) : null;

          return (
            <div
              className="h-full w-[300px] shrink-0 bg-background/80 border-l"
              data-testid="right-layer-panel"
            >
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={50} minSize={20}>
                  {activeLeftTab === "elements" && elementsSubTab === "script" ? (
                    <div className="h-full overflow-y-auto p-3 space-y-3">
                      <h4 className="text-xs font-semibold">자막 설정</h4>
                      <p className="text-[10px] text-muted-foreground">패널 {activePanelIndex + 1}</p>

                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant={activeScriptSection === "top" ? "secondary" : "outline"}
                          onClick={() => {
                            const p = activePanel;
                            const isNew = !p.topScript;
                            updatePanel(activePanelIndex, {
                              ...p,
                              topScript:
                                p.topScript ?? { text: "", style: "no-bg", color: "yellow", fontSize: 16, bold: true },
                            });
                            setActiveScriptSection("top");
                            if (isNew) {
                              setTimeout(() => setEditingScriptPositionForCanvas("top"), 100);
                            }
                          }}
                          data-testid={`button-toggle-top-script-${activePanelIndex}`}
                        >
                          <AlignVerticalJustifyStart className="h-3.5 w-3.5 mr-1" />
                          상단
                        </Button>
                        <Button
                          size="sm"
                          variant={activeScriptSection === "bottom" ? "secondary" : "outline"}
                          onClick={() => {
                            const p = activePanel;
                            const isNew = !p.bottomScript;
                            updatePanel(activePanelIndex, {
                              ...p,
                              bottomScript:
                                p.bottomScript ?? { text: "", style: "no-bg", color: "sky", fontSize: 16, bold: true },
                            });
                            setActiveScriptSection("bottom");
                            if (isNew) {
                              setTimeout(() => setEditingScriptPositionForCanvas("bottom"), 100);
                            }
                          }}
                          data-testid={`button-toggle-bottom-script-${activePanelIndex}`}
                        >
                          <AlignVerticalJustifyEnd className="h-3.5 w-3.5 mr-1" />
                          하단
                        </Button>
                      </div>

                      {activeScriptSection === "top" && activePanel.topScript && (
                        <div className="space-y-2 rounded-md bg-muted/30 p-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-[11px] shrink-0 bg-yellow-400/20 text-yellow-700 dark:text-yellow-400"
                            >
                              상단
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              title="상단 스크립트 삭제"
                              onClick={() => {
                                const p = activePanel;
                                updatePanel(activePanelIndex, { ...p, topScript: null });
                              }}
                              data-testid={`button-delete-top-script-${activePanelIndex}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Textarea
                            value={activePanel.topScript.text}
                            onChange={(e) => {
                              const p = activePanel;
                              updatePanel(activePanelIndex, {
                                ...p,
                                topScript: {
                                  ...p.topScript!,
                                  text: e.target.value,
                                },
                              });
                            }}
                            placeholder="상단 스크립트..."
                            className="text-sm min-h-[150px] resize-none"
                            data-testid={`input-panel-${activePanelIndex}-top`}
                          />
                          <div className="flex gap-1 flex-wrap">
                            {SCRIPT_STYLE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  const p = activePanel;
                                  updatePanel(activePanelIndex, {
                                    ...p,
                                    topScript: {
                                      ...p.topScript!,
                                      style: opt.value,
                                    },
                                  });
                                }}
                                className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${activePanel.topScript!.style === opt.value ? "bg-primary/12 text-primary font-medium" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                                data-testid={`button-top-script-style-${opt.value}-${activePanelIndex}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1 flex-wrap items-center">
                            <span className="text-[11px] text-muted-foreground mr-0.5">
                              색상
                            </span>
                            {SCRIPT_COLOR_OPTIONS.map((c) => (
                              <button
                                key={c.value}
                                onClick={() => {
                                  const p = activePanel;
                                  updatePanel(activePanelIndex, {
                                    ...p,
                                    topScript: { ...p.topScript!, color: c.value },
                                  });
                                }}
                                className={`w-5 h-5 rounded-full border-2 transition-transform ${activePanel.topScript!.color === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c.bg }}
                                title={c.label}
                                data-testid={`button-top-script-color-${c.value}-${activePanelIndex}`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              글씨 크기
                            </span>
                            <Slider
                              min={8}
                              max={36}
                              step={1}
                              value={[activePanel.topScript.fontSize || 20]}
                              onValueChange={([v]) => {
                                const p = activePanel;
                                updatePanel(activePanelIndex, {
                                  ...p,
                                  topScript: { ...p.topScript!, fontSize: v },
                                });
                              }}
                              className="flex-1"
                              data-testid={`slider-top-script-fontsize-${activePanelIndex}`}
                            />
                            <span className="text-[11px] text-muted-foreground w-6 text-right">
                              {activePanel.topScript.fontSize || 20}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              글꼴
                            </span>
                            <Select
                              value={activePanel.topScript.fontKey || "default"}
                              onValueChange={(v) => {
                                const p = activePanel;
                                updatePanel(activePanelIndex, {
                                  ...p,
                                  topScript: { ...p.topScript!, fontKey: v },
                                });
                              }}
                            >
                              <SelectTrigger className="h-7 text-[11px] flex-1" data-testid={`select-top-script-font-${activePanelIndex}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFonts.map((f) => (
                                  <SelectItem key={f.value} value={f.value} className="text-[11px]">
                                    <span style={{ fontFamily: f.family }}>{f.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-1 flex-wrap items-center">
                            <span className="text-[11px] text-muted-foreground mr-0.5">
                              글자색
                            </span>
                            {SCRIPT_TEXT_COLORS.map((c) => (
                              <button
                                key={c.value || "auto"}
                                onClick={() => {
                                  const p = activePanel;
                                  updatePanel(activePanelIndex, {
                                    ...p,
                                    topScript: { ...p.topScript!, textColor: c.value },
                                  });
                                }}
                                className={`w-5 h-5 rounded-full border-2 transition-transform ${(activePanel.topScript!.textColor || "") === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c.hex || "transparent", backgroundImage: c.hex ? undefined : "linear-gradient(135deg, #ccc 25%, transparent 25%, transparent 50%, #ccc 50%, #ccc 75%, transparent 75%)", backgroundSize: c.hex ? undefined : "6px 6px" }}
                                title={c.label}
                                data-testid={`button-top-script-textcolor-${c.value || "auto"}-${activePanelIndex}`}
                              />
                            ))}
                            <button
                              onClick={() => {
                                const p = activePanel;
                                updatePanel(activePanelIndex, {
                                  ...p,
                                  topScript: { ...p.topScript!, bold: !(p.topScript!.bold !== false) },
                                });
                              }}
                              className={`px-1.5 py-0.5 text-[11px] rounded-lg transition-colors font-bold ${activePanel.topScript!.bold !== false ? "bg-primary/12 text-primary" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                              data-testid={`button-top-script-bold-${activePanelIndex}`}
                            >
                              B
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            캔버스에서 드래그하여 위치를 이동할 수 있습니다
                          </p>
                        </div>
                      )}

                      {activeScriptSection === "bottom" && activePanel.bottomScript && (
                        <div className="space-y-2 rounded-md bg-muted/30 p-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-[11px] shrink-0 bg-sky-400/20 text-sky-700 dark:text-sky-400"
                            >
                              하단
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              title="하단 스크립트 삭제"
                              onClick={() => {
                                const p = activePanel;
                                updatePanel(activePanelIndex, { ...p, bottomScript: null });
                              }}
                              data-testid={`button-delete-bottom-script-${activePanelIndex}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Textarea
                            value={activePanel.bottomScript.text}
                            onChange={(e) => {
                              const p = activePanel;
                              updatePanel(activePanelIndex, {
                                ...p,
                                bottomScript: {
                                  ...p.bottomScript!,
                                  text: e.target.value,
                                },
                              });
                            }}
                            placeholder="하단 스크립트..."
                            className="text-sm min-h-[150px] resize-none"
                            data-testid={`input-panel-${activePanelIndex}-bottom`}
                          />
                          <div className="flex gap-1 flex-wrap">
                            {SCRIPT_STYLE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  const p = activePanel;
                                  updatePanel(activePanelIndex, {
                                    ...p,
                                    bottomScript: {
                                      ...p.bottomScript!,
                                      style: opt.value,
                                    },
                                  });
                                }}
                                className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${activePanel.bottomScript!.style === opt.value ? "bg-primary/12 text-primary font-medium" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                                data-testid={`button-bottom-script-style-${opt.value}-${activePanelIndex}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1 flex-wrap items-center">
                            <span className="text-[11px] text-muted-foreground mr-0.5">
                              색상
                            </span>
                            {SCRIPT_COLOR_OPTIONS.map((c) => (
                              <button
                                key={c.value}
                                onClick={() => {
                                  const p = activePanel;
                                  updatePanel(activePanelIndex, {
                                    ...p,
                                    bottomScript: {
                                      ...p.bottomScript!,
                                      color: c.value,
                                    },
                                  });
                                }}
                                className={`w-5 h-5 rounded-full border-2 transition-transform ${activePanel.bottomScript!.color === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c.bg }}
                                title={c.label}
                                data-testid={`button-bottom-script-color-${c.value}-${activePanelIndex}`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              글씨 크기
                            </span>
                            <Slider
                              min={8}
                              max={36}
                              step={1}
                              value={[activePanel.bottomScript.fontSize || 20]}
                              onValueChange={([v]) => {
                                const p = activePanel;
                                updatePanel(activePanelIndex, {
                                  ...p,
                                  bottomScript: { ...p.bottomScript!, fontSize: v },
                                });
                              }}
                              className="flex-1"
                              data-testid={`slider-bottom-script-fontsize-${activePanelIndex}`}
                            />
                            <span className="text-[11px] text-muted-foreground w-6 text-right">
                              {activePanel.bottomScript.fontSize || 20}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              글꼴
                            </span>
                            <Select
                              value={activePanel.bottomScript.fontKey || "default"}
                              onValueChange={(v) => {
                                const p = activePanel;
                                updatePanel(activePanelIndex, {
                                  ...p,
                                  bottomScript: { ...p.bottomScript!, fontKey: v },
                                });
                              }}
                            >
                              <SelectTrigger className="h-7 text-[11px] flex-1" data-testid={`select-bottom-script-font-${activePanelIndex}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFonts.map((f) => (
                                  <SelectItem key={f.value} value={f.value} className="text-[11px]">
                                    <span style={{ fontFamily: f.family }}>{f.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-1 flex-wrap items-center">
                            <span className="text-[11px] text-muted-foreground mr-0.5">
                              글자색
                            </span>
                            {SCRIPT_TEXT_COLORS.map((c) => (
                              <button
                                key={c.value || "auto"}
                                onClick={() => {
                                  const p = activePanel;
                                  updatePanel(activePanelIndex, {
                                    ...p,
                                    bottomScript: { ...p.bottomScript!, textColor: c.value },
                                  });
                                }}
                                className={`w-5 h-5 rounded-full border-2 transition-transform ${(activePanel.bottomScript!.textColor || "") === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c.hex || "transparent", backgroundImage: c.hex ? undefined : "linear-gradient(135deg, #ccc 25%, transparent 25%, transparent 50%, #ccc 50%, #ccc 75%, transparent 75%)", backgroundSize: c.hex ? undefined : "6px 6px" }}
                                title={c.label}
                                data-testid={`button-bottom-script-textcolor-${c.value || "auto"}-${activePanelIndex}`}
                              />
                            ))}
                            <button
                              onClick={() => {
                                const p = activePanel;
                                updatePanel(activePanelIndex, {
                                  ...p,
                                  bottomScript: { ...p.bottomScript!, bold: !(p.bottomScript!.bold !== false) },
                                });
                              }}
                              className={`px-1.5 py-0.5 text-[11px] rounded-lg transition-colors font-bold ${activePanel.bottomScript!.bold !== false ? "bg-primary/12 text-primary" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                              data-testid={`button-bottom-script-bold-${activePanelIndex}`}
                            >
                              B
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            캔버스에서 드래그하여 위치를 이동할 수 있습니다
                          </p>
                        </div>
                      )}
                    </div>
                  ) : activeLeftTab === "elements" && elementsSubTab === "bubble" ? (
                    <div className="h-full overflow-y-auto flex flex-col">
                      <div className="p-3 border-b border-border space-y-2">
                        <h4 className="text-xs font-semibold">말풍선</h4>
                        <Button size="sm" variant="ghost" className="w-full bg-muted/40 hover:bg-muted/60"
                          onClick={() => {
                            if (activePanel.bubbles.length >= 5) return;
                            const newB = createBubble(CANVAS_W, CANVAS_H);
                            updatePanel(activePanelIndex, { ...activePanel, bubbles: [...activePanel.bubbles, newB] });
                            setSelectedBubbleId(newB.id);
                            setSelectedCharId(null);
                            setSelectedTextId(null);
                            setSelectedLineId(null);
                            setSelectedShapeId(null);
                            setSelectedDrawingLayerId(null);
                            setSelectedScriptPosition(null);
                          }}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> 말풍선 추가
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <ElementPropertiesPanel
                          selectedBubble={selBubble ?? null}
                          selectedChar={selChar ?? null}
                          selectedText={selText ?? null}
                          selectedLine={selLine ?? null}
                          canvasWidth={CANVAS_W}
                          canvasHeight={CANVAS_H}
                          onUpdateBubble={(id, updates) => {
                            updatePanel(activePanelIndex, {
                              ...activePanel,
                              bubbles: activePanel.bubbles.map(b => b.id === id ? { ...b, ...updates } : b),
                            });
                          }}
                          onUpdateChar={(id, updates) => {
                            updatePanel(activePanelIndex, {
                              ...activePanel,
                              characters: activePanel.characters.map(c => c.id === id ? { ...c, ...updates } : c),
                            });
                          }}
                          onDeleteBubble={(id) => {
                            updatePanel(activePanelIndex, { ...activePanel, bubbles: activePanel.bubbles.filter(b => b.id !== id) });
                            if (selectedBubbleId === id) setSelectedBubbleId(null);
                          }}
                          onDeleteChar={(id) => {
                            updatePanel(activePanelIndex, { ...activePanel, characters: activePanel.characters.filter(c => c.id !== id) });
                            if (selectedCharId === id) setSelectedCharId(null);
                          }}
                          onFlipTailHorizontally={handleFlipTailHorizontally}
                          onRemoveBackground={handleRemoveBackground}
                          removingBg={removingBg}
                          isPro={isPro}
                        />
                      </div>
                    </div>
                  ) : activeLeftTab === "ai" && aiMode ? (
                    <div className="h-full overflow-y-auto p-3 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold">
                          {aiMode === "subtitle" && "AI 프롬프트 자막 생성"}
                          {aiMode === "instatoonFull" && "인스타툰 자동화 생성"}
                          {aiMode === "instatoonPrompt" && "인스타툰 이미지 생성"}
                          {aiMode === "autoWebtoon" && "자동화툰 멀티컷 생성"}
                        </h4>
                        <button onClick={() => setAiMode(null)} className="text-muted-foreground hover:text-foreground rounded-md p-1">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        인스타툰 자동화 생성 · 프롬프트 자동 작성: 각 10 크레딧 소모
                      </p>

                      {aiMode === "subtitle" && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              placeholder="주제 입력 (예: 월요일 출근길)"
                              className="text-sm"
                              data-testid="input-story-topic"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => suggestMutation.mutate()}
                              disabled={suggestMutation.isPending}
                              data-testid="button-suggest-topic"
                            >
                              {suggestMutation.isPending ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <Lightbulb className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {generateMutation.isPending ? (
                            <Button className="w-full" size="sm" variant="destructive" onClick={() => generateAbortRef.current?.abort()}>
                              <X className="h-4 w-4 mr-1.5" />생성 취소
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button className="flex-1" size="sm" variant="outline" onClick={() => generateMutation.mutate({ mode: "basic", scope: "current" })} disabled={!topic.trim()}>
                                <Wand2 className="h-4 w-4 mr-1.5" />선택 컷 생성
                              </Button>
                              <Button className="flex-1" size="sm" onClick={() => generateMutation.mutate({ mode: "basic", scope: "all" })} disabled={!topic.trim()} data-testid="button-generate-scripts">
                                <Wand2 className="h-4 w-4 mr-1.5" />전체 생성 ({panels.length}컷)
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {aiMode === "instatoonFull" && (
                        <div className="space-y-4">
                          <CharacterPicker
                            mode="multi"
                            maxImages={4}
                            required
                            label="① 기준 캐릭터 이미지"
                            description="이 캐릭터 이미지를 기반으로 포즈·표정·배경이 자동 변형됩니다."
                            showStyleHint
                            selectedImages={autoRefImages}
                            onSelectedImagesChange={setAutoRefImages}
                            characterStripData={characterStripData}
                            galleryData={galleryData}
                            galleryLoading={galleryLoading}
                            galleryHasMore={galleryHasMore}
                            characterFolders={storyCharacterFolders}
                            activeGalleryFolderId={activeGalleryFolderId}
                            onActiveGalleryFolderIdChange={setActiveGalleryFolderId}
                            onLoadMoreGallery={() => setGalleryLimit(p => p + 30)}
                            fetchFullGeneration={fetchFullGeneration}
                            onFirstImageSelected={(img) => { setDetectedStyle("auto"); detectArtStyle(img.imageUrl).finally(() => setIsDetectingStyle(false)); }}
                          />
                          <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-foreground">② 인스타툰 주제</span>
                            <div className="flex gap-2">
                              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="주제 입력 (예: 월요일 출근길)" className="text-sm" data-testid="input-story-topic" />
                              <Button size="icon" variant="outline" onClick={() => suggestMutation.mutate()} disabled={suggestMutation.isPending} data-testid="button-suggest-topic">
                                {suggestMutation.isPending ? (<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />) : (<Lightbulb className="h-4 w-4" />)}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-xs font-semibold text-foreground">③ 인스타툰 전체 프롬프트 <span className="text-[10px] font-normal text-muted-foreground">(선택 — 포즈·표정·배경·아이템을 한 번에 적어도 돼요)</span></span>
                            <Textarea value={instatoonScenePrompt} onChange={(e) => setInstatoonScenePrompt(e.target.value)} placeholder="예: 비 오는 월요일 출근길, 주인공은 커피를 들고 지하철 안에서 멍한 표정으로 서 있고, 뒤에는 붐비는 사람들과 형광 조명이 보인다" className="text-xs resize-none" rows={3} />
                            <p className="text-[10px] text-muted-foreground">빈칸으로 두면 아래 포즈/표정·배경/아이템 칸을 기준으로 생성돼요.</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground">④ 포즈 / 표정 <span className="text-[10px] font-normal text-muted-foreground">(선택 — 비우면 AI가 자동 결정)</span></span>
                              <Button size="sm" variant={posePromptMutation.isPending ? "destructive" : "outline"} onClick={() => posePromptMutation.isPending ? promptAbortRef.current?.abort() : posePromptMutation.mutate()}>
                                {posePromptMutation.isPending ? (<span className="text-[11px]">취소</span>) : (<span className="text-[11px]">AI 추천</span>)}
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Textarea value={posePrompt} onChange={(e) => setPosePrompt(e.target.value)} placeholder="포즈 (예: 여고생 팬과 나란히 서서 브이포즈로 사진 찍기)" className="text-xs resize-none" rows={2} />
                              <Textarea value={expressionPrompt} onChange={(e) => setExpressionPrompt(e.target.value)} placeholder="표정 (예: 부끄러우면서도 기뻐하는 표정, 볼이 붉어짐)" className="text-xs resize-none" rows={2} />
                            </div>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed bg-amber-50 dark:bg-amber-950/30 rounded px-2 py-1.5">💡 다른 인물이 등장하는 장면은 포즈에 함께 묘사하세요</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-foreground">⑤ 배경 / 아이템 <span className="text-[10px] font-normal text-muted-foreground">(선택)</span></span>
                              <Button size="sm" variant="outline" disabled={backgroundPromptMutation.isPending} onClick={() => backgroundPromptMutation.mutate()}>
                                {backgroundPromptMutation.isPending ? (<span className="text-[11px] flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />생성 중</span>) : (<span className="text-[11px]">AI 추천</span>)}
                              </Button>
                              {backgroundPromptMutation.isPending && (<button type="button" className="text-[10px] text-muted-foreground hover:text-destructive transition-colors" onClick={() => promptAbortRef.current?.abort()}>취소</button>)}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <Textarea value={backgroundPrompt} onChange={(e) => setBackgroundPrompt(e.target.value)} placeholder="배경 (예: 퇴근길 지하철 안, 붐비는 플랫폼)" className="text-xs resize-none" rows={2} />
                              <Textarea value={itemPrompt} onChange={(e) => setItemPrompt(e.target.value)} placeholder="아이템/소품 (예: 커피컵, 스마트폰)" className="text-xs resize-none" rows={2} />
                            </div>
                          </div>
                          {autoRefImages.length === 0 && (<p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-2.5 py-1.5">⚠️ 기준 캐릭터 이미지를 선택해야 포즈·표정이 자동 변형됩니다.</p>)}
                          {(generateMutation.isPending || instatoonImageMutation.isPending) ? (
                            <Button className="w-full" size="sm" variant="destructive" onClick={() => { generateAbortRef.current?.abort(); instatoonAbortRef.current?.abort(); }}><X className="h-4 w-4 mr-1.5" />생성 취소</Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button className="flex-1" size="sm" variant="outline" onClick={() => { if (autoRefImages.length === 0) { toast({ title: "기준 이미지 필요", description: "먼저 기준 캐릭터 이미지를 업로드하거나 갤러리에서 선택해주세요.", variant: "destructive" }); return; } generateMutation.mutate({ mode: "full", scope: "current" }); instatoonImageMutation.mutate({ scope: "current" }); }} disabled={!topic.trim()}><Wand2 className="h-4 w-4 mr-1.5" />선택 컷 생성</Button>
                              <Button className="flex-1" size="sm" onClick={() => { if (autoRefImages.length === 0) { toast({ title: "기준 이미지 필요", description: "먼저 기준 캐릭터 이미지를 업로드하거나 갤러리에서 선택해주세요.", variant: "destructive" }); return; } generateMutation.mutate({ mode: "full", scope: "all" }); instatoonImageMutation.mutate({ scope: "all" }); }} disabled={!topic.trim()}><Wand2 className="h-4 w-4 mr-1.5" />전체 생성 ({panels.length}컷)</Button>
                            </div>
                          )}
                        </div>
                      )}

                      {aiMode === "instatoonPrompt" && (
                        <div className="space-y-4">
                          <CharacterPicker
                            mode="multi"
                            maxImages={4}
                            label="기준 캐릭터 이미지"
                            description="여러 캐릭터를 선택하면 더 정확해요 (최대 4개)"
                            selectedImages={promptRefImages}
                            onSelectedImagesChange={setPromptRefImages}
                            characterStripData={characterStripData}
                            galleryData={galleryData}
                            galleryLoading={galleryLoading}
                            galleryHasMore={galleryHasMore}
                            characterFolders={storyCharacterFolders}
                            activeGalleryFolderId={activeGalleryFolderId}
                            onActiveGalleryFolderIdChange={setActiveGalleryFolderId}
                            onLoadMoreGallery={() => setGalleryLimit(p => p + 30)}
                            fetchFullGeneration={fetchFullGeneration}
                            onFirstImageSelected={(img) => { setDetectedStyle("auto"); detectArtStyle(img.imageUrl).finally(() => setIsDetectingStyle(false)); }}
                          />
                          {(promptRefImages.length > 0 || autoRefImages.length > 0) && (
                            <div className="space-y-1.5 border border-border/60 rounded-lg p-2.5 bg-muted/30">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-foreground">🎨 그림 스타일 통일</span>
                                {isDetectingStyle && (<div className="h-2.5 w-2.5 animate-spin rounded-full border border-primary border-t-transparent" />)}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <button onClick={() => setDetectedStyle("auto")} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${detectedStyle === "auto" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>자동</button>
                                {Object.entries(ART_STYLES).filter(([k]) => k !== "auto").map(([key, s]) => (<button key={key} onClick={() => setDetectedStyle(key)} title={s.description} className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${detectedStyle === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>{s.label}</button>))}
                              </div>
                              <p className="text-[9px] text-muted-foreground">선택한 스타일로 배경·아이템이 캐릭터와 통일됩니다</p>
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center gap-1"><span className="text-xs font-semibold text-foreground">포즈 / 표정</span><span className="text-[10px] text-muted-foreground ml-1">— 입력하면 배경이 자동 완성됩니다</span></div>
                            <div className="grid grid-cols-1 gap-2">
                              <Textarea value={posePrompt} onChange={(e) => setPosePrompt(e.target.value)} placeholder="포즈 (예: 팬과 나란히 카메라 향해 브이포즈 취하기)" className="text-xs resize-none" rows={2} />
                              <Textarea value={expressionPrompt} onChange={(e) => setExpressionPrompt(e.target.value)} placeholder="표정 (예: 수줍어하면서 기뻐하는 표정)" className="text-xs resize-none" rows={2} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-foreground">배경 / 아이템{(posePrompt.trim() || expressionPrompt.trim()) && (<span className="ml-1.5 text-[10px] font-normal text-primary">← 자동 생성 가능</span>)}</span></div>
                            <div className="grid grid-cols-1 gap-2">
                              <Textarea value={backgroundPrompt} onChange={(e) => setBackgroundPrompt(e.target.value)} placeholder="배경 프롬프트 — 비워도 AI가 자동으로 채워줍니다" className="text-xs resize-none" rows={2} />
                              <Textarea value={itemPrompt} onChange={(e) => setItemPrompt(e.target.value)} placeholder="아이템/소품 프롬프트 — 비워도 자동 생성됩니다" className="text-xs resize-none" rows={2} />
                            </div>
                          </div>
                          {instatoonPromptMutation.isPending ? (
                            <div className="space-y-1">
                              <Button className="w-full" size="sm" disabled><Loader2 className="h-4 w-4 mr-2 animate-spin" />{instatoonPromptMutation.variables?.scope === "current" ? "선택 컷 생성 중..." : "전체 생성 중..."}</Button>
                              <button type="button" className="w-full text-center text-xs text-muted-foreground hover:text-destructive transition-colors py-1" onClick={() => promptAbortRef.current?.abort()}>취소</button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button className="flex-1" size="sm" variant="outline" onClick={() => instatoonPromptMutation.mutate({ scope: "current" })}><Wand2 className="h-4 w-4 mr-1.5" />선택 컷 생성</Button>
                              <Button className="flex-1" size="sm" onClick={() => instatoonPromptMutation.mutate({ scope: "all" })}><Wand2 className="h-4 w-4 mr-1.5" />전체 생성 ({panels.length}컷)</Button>
                            </div>
                          )}
                        </div>
                      )}

                      {aiMode === "autoWebtoon" && (
                        <AutoWebtoonPanel
                          isAuthenticated={isAuthenticated}
                          isPro={isPro}
                          maxPanels={maxPanels}
                          currentPanelCount={panels.length}
                          galleryData={galleryData}
                          galleryLoading={galleryLoading}
                          canvasWidth={CANVAS_W}
                          canvasHeight={CANVAS_H}
                          characterStripData={characterStripData}
                          characterFolders={storyCharacterFolders}
                          fetchFullGeneration={fetchFullGeneration}
                          onPanelsGenerated={(newPanels) => {
                            const isDefaultEmpty = panels.length === 1 && panels[0].characters.length === 0 && panels[0].bubbles.length === 0 && !panels[0].backgroundImageUrl && (panels[0].textElements?.length ?? 0) === 0 && (panels[0].lineElements?.length ?? 0) === 0;
                            if (isDefaultEmpty) { const limited = (newPanels as any[]).slice(0, maxPanels); setActivePanelIndex(0); setPanels(limited as any); rehydrateImages(limited as any); } else { const available = maxPanels - panels.length; if (available <= 0) { toast({ title: `패널 ${maxPanels}개 제한`, description: "추가할 수 있는 패널이 없습니다.", variant: "destructive" }); return; } const toAdd = (newPanels as any[]).slice(0, available); const merged = [...panels, ...toAdd] as any; setActivePanelIndex(panels.length); setPanels(merged); rehydrateImages(toAdd as any); if (toAdd.length < newPanels.length) { toast({ title: `${toAdd.length}/${newPanels.length}개 패널만 추가됨`, description: `패널 최대 ${maxPanels}개 제한`, variant: "destructive" }); } }
                            setAiMode(null);
                          }}
                          onClose={() => setAiMode(null)}
                        />
                      )}
                    </div>
                  ) : (
                    <ElementPropertiesPanel
                      selectedBubble={selBubble ?? null}
                      selectedChar={selChar ?? null}
                      selectedText={selText ?? null}
                      selectedLine={selLine ?? null}
                      canvasWidth={CANVAS_W}
                      canvasHeight={CANVAS_H}
                      onUpdateBubble={(id, updates) => {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          bubbles: activePanel.bubbles.map(b => b.id === id ? { ...b, ...updates } : b),
                        });
                      }}
                      onUpdateChar={(id, updates) => {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          characters: activePanel.characters.map(c => c.id === id ? { ...c, ...updates } : c),
                        });
                      }}
                      onDeleteBubble={(id) => {
                        updatePanel(activePanelIndex, { ...activePanel, bubbles: activePanel.bubbles.filter(b => b.id !== id) });
                        if (selectedBubbleId === id) setSelectedBubbleId(null);
                      }}
                      onDeleteChar={(id) => {
                        updatePanel(activePanelIndex, { ...activePanel, characters: activePanel.characters.filter(c => c.id !== id) });
                        if (selectedCharId === id) setSelectedCharId(null);
                      }}
                      onFlipTailHorizontally={handleFlipTailHorizontally}
                      onRemoveBackground={handleRemoveBackground}
                      removingBg={removingBg}
                      isPro={isPro}
                    />
                  )}

                    {/* Compact script editor — shown when script is selected regardless of left tab */}
                    {selectedScriptPosition && !(activeLeftTab === "elements" && elementsSubTab === "script") && (() => {
                      const scriptKey = selectedScriptPosition === "top" ? "topScript" : "bottomScript";
                      const sd = activePanel[scriptKey];
                      if (!sd) return null;
                      const isTop = selectedScriptPosition === "top";
                      return (
                        <div className="p-2 border-t border-border space-y-1.5 overflow-y-auto">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className={`text-[10px] shrink-0 ${isTop ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-400" : "bg-sky-400/20 text-sky-700 dark:text-sky-400"}`}>
                              {isTop ? "상단" : "하단"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">자막 편집</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 ml-auto"
                              title="자막 삭제"
                              onClick={() => {
                                updatePanel(activePanelIndex, { ...activePanel, [scriptKey]: null });
                                setSelectedScriptPosition(null);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Textarea
                            value={sd.text}
                            onChange={(e) => {
                              updatePanel(activePanelIndex, {
                                ...activePanel,
                                [scriptKey]: { ...sd, text: e.target.value },
                              });
                            }}
                            placeholder={isTop ? "상단 스크립트..." : "하단 스크립트..."}
                            className="text-sm min-h-[60px] resize-none"
                          />
                          <div className="flex gap-1 flex-wrap">
                            {SCRIPT_STYLE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => updatePanel(activePanelIndex, { ...activePanel, [scriptKey]: { ...sd, style: opt.value } })}
                                className={`px-2 py-0.5 text-[10px] rounded-lg transition-colors ${sd.style === opt.value ? "bg-primary/12 text-primary font-medium" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1 flex-wrap items-center">
                            <span className="text-[10px] text-muted-foreground mr-0.5">색상</span>
                            {SCRIPT_COLOR_OPTIONS.map((c) => (
                              <button
                                key={c.value}
                                onClick={() => updatePanel(activePanelIndex, { ...activePanel, [scriptKey]: { ...sd, color: c.value } })}
                                className={`w-4 h-4 rounded-full border-2 transition-transform ${sd.color === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c.bg }}
                                title={c.label}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground shrink-0">크기</span>
                            <Slider
                              min={8} max={36} step={1}
                              value={[sd.fontSize || 16]}
                              onValueChange={([v]) => updatePanel(activePanelIndex, { ...activePanel, [scriptKey]: { ...sd, fontSize: v } })}
                              className="flex-1"
                            />
                            <span className="text-[10px] text-muted-foreground w-5 text-right">{sd.fontSize || 16}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground shrink-0">글꼴</span>
                            <Select
                              value={sd.fontKey || "default"}
                              onValueChange={(v) => updatePanel(activePanelIndex, { ...activePanel, [scriptKey]: { ...sd, fontKey: v } })}
                            >
                              <SelectTrigger className="h-6 text-[10px] flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableFonts.map((f) => (
                                  <SelectItem key={f.value} value={f.value} className="text-[10px]">
                                    <span style={{ fontFamily: f.family }}>{f.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-1 flex-wrap items-center">
                            <span className="text-[10px] text-muted-foreground mr-0.5">글자색</span>
                            {SCRIPT_TEXT_COLORS.map((c) => (
                              <button
                                key={c.value || "auto"}
                                onClick={() => updatePanel(activePanelIndex, { ...activePanel, [scriptKey]: { ...sd, textColor: c.value } })}
                                className={`w-4 h-4 rounded-full border-2 transition-transform ${(sd.textColor || "") === c.value ? "border-foreground scale-110" : "border-transparent"}`}
                                style={{ backgroundColor: c.hex || "transparent", backgroundImage: c.hex ? undefined : "linear-gradient(135deg, #ccc 25%, transparent 25%, transparent 50%, #ccc 50%, #ccc 75%, transparent 75%)", backgroundSize: c.hex ? undefined : "6px 6px" }}
                                title={c.label}
                              />
                            ))}
                            <button
                              onClick={() => updatePanel(activePanelIndex, { ...activePanel, [scriptKey]: { ...sd, bold: !(sd.bold !== false) } })}
                              className={`px-1.5 py-0.5 text-[10px] rounded-lg transition-colors font-bold ${sd.bold !== false ? "bg-primary/12 text-primary" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                            >
                              B
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={20}>
                  <div className="h-full flex flex-col">
                    {/* Add buttons - Bubble 화면과 동일 */}
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 justify-center gap-1 h-7 text-[11px] bg-muted/40 hover:bg-muted/60"
                          onClick={() => guard(() => {
                            setElementsSubTab("bubble");
                            setActiveLeftTab("elements");
                          })}
                        >
                          <MessageSquare className="h-3 w-3" />
                          말풍선
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 justify-center gap-1 h-7 text-[11px] bg-muted/40 hover:bg-muted/60"
                          onClick={() => guard(() => {
                            setActiveLeftTab("image");
                          })}
                        >
                          <ImagePlus className="h-3 w-3" />
                          캐릭터
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 justify-center gap-1 h-7 text-[11px] bg-muted/40 hover:bg-muted/60"
                          onClick={() => guard(() => {
                            setElementsSubTab("template");
                            setActiveLeftTab("elements");
                          })}
                        >
                          <Type className="h-3 w-3" />
                          템플릿
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                  <LayerListPanel
                    items={rightLayerItems}
                    externalMultiSelected={canvasMultiSelected}
                    selectedCharId={selectedCharId}
                    selectedBubbleId={selectedBubbleId}
                    selectedDrawingLayerId={selectedDrawingLayerId}
                    selectedTextId={selectedTextId}
                    selectedLineId={selectedLineId}
                    selectedShapeId={selectedShapeId}
                    onSelectChar={setSelectedCharId}
                    onSelectBubble={setSelectedBubbleId}
                    onSelectDrawingLayer={setSelectedDrawingLayerId}
                    onSelectText={setSelectedTextId}
                    onSelectLine={setSelectedLineId}
                    onSelectShape={setSelectedShapeId}
                    onSetToolItem={setSelectedToolItem}
                    onSelectScript={(position) => {
                      setSelectedScriptPosition(position);
                      if (position) {
                        setActiveScriptSection(position);
                      }
                    }}
                    selectedScriptPosition={
                      !selectedCharId && !selectedBubbleId && !selectedDrawingLayerId && !selectedTextId && !selectedLineId && !selectedShapeId
                        ? selectedScriptPosition
                        : null
                    }
                    onMoveLayer={moveRightLayer}
                    onReorderLayer={reorderRightLayer}
                    onDeleteLayer={(item) => {
                      if (item.type === "char") {
                        updatePanel(activePanelIndex, { ...activePanel, characters: activePanel.characters.filter(c => c.id !== item.id) });
                        if (selectedCharId === item.id) setSelectedCharId(null);
                      } else if (item.type === "bubble") {
                        updatePanel(activePanelIndex, { ...activePanel, bubbles: activePanel.bubbles.filter(b => b.id !== item.id) });
                        if (selectedBubbleId === item.id) setSelectedBubbleId(null);
                      } else if (item.type === "drawing") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          drawingLayers: (activePanel.drawingLayers || []).filter(dl => dl.id !== item.id),
                        });
                        if (selectedDrawingLayerId === item.id) setSelectedDrawingLayerId(null);
                      } else if (item.type === "text") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          textElements: (activePanel.textElements || []).filter((te: CanvasTextElement) => te.id !== item.id),
                        });
                        if (selectedTextId === item.id) setSelectedTextId(null);
                      } else if (item.type === "line") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          lineElements: (activePanel.lineElements || []).filter((le: CanvasLineElement) => le.id !== item.id),
                        });
                        if (selectedLineId === item.id) setSelectedLineId(null);
                      } else if (item.type === "shape") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          shapeElements: (activePanel.shapeElements || []).filter((se: CanvasShapeElement) => se.id !== item.id),
                        });
                        if (selectedShapeId === item.id) setSelectedShapeId(null);
                      } else if (item.type === "topScript") {
                        updatePanel(activePanelIndex, { ...activePanel, topScript: null });
                      } else if (item.type === "bottomScript") {
                        updatePanel(activePanelIndex, { ...activePanel, bottomScript: null });
                      }
                    }}
                    onDuplicateLayer={(item) => {
                      const id = generateId();
                      if (item.type === "char") {
                        const ch = activePanel.characters.find(c => c.id === item.id);
                        if (!ch) return;
                        const maxZ = activePanel.characters.reduce((m, c) => Math.max(m, c.zIndex ?? 0), 0);
                        const dup = { ...ch, id, x: ch.x + 24, y: ch.y + 24, zIndex: maxZ + 1 };
                        updatePanel(activePanelIndex, { ...activePanel, characters: [...activePanel.characters, dup] });
                        setSelectedCharId(id);
                      } else if (item.type === "bubble") {
                        const b = activePanel.bubbles.find(bb => bb.id === item.id);
                        if (!b) return;
                        const maxZ = activePanel.bubbles.reduce((m, bb) => Math.max(m, bb.zIndex ?? 0), 0);
                        const dup = { ...b, id, x: b.x + 24, y: b.y + 24, zIndex: maxZ + 1 };
                        updatePanel(activePanelIndex, { ...activePanel, bubbles: [...activePanel.bubbles, dup] });
                        setSelectedBubbleId(id);
                      } else if (item.type === "drawing") {
                        const dl = (activePanel.drawingLayers || []).find(d => d.id === item.id);
                        if (!dl) return;
                        const maxZ = (activePanel.drawingLayers || []).reduce((m, d) => Math.max(m, d.zIndex ?? 0), 0);
                        const dup = { ...dl, id, x: (dl.x ?? 0) + 24, y: (dl.y ?? 0) + 24, zIndex: maxZ + 1 };
                        updatePanel(activePanelIndex, { ...activePanel, drawingLayers: [...(activePanel.drawingLayers || []), dup] });
                        setSelectedDrawingLayerId(id);
                      } else if (item.type === "text") {
                        const te = (activePanel.textElements || []).find((t: any) => t.id === item.id);
                        if (!te) return;
                        const maxZ = (activePanel.textElements || []).reduce((m: number, t: any) => Math.max(m, t.zIndex ?? 0), 0);
                        const dup = { ...te, id, x: te.x + 24, y: te.y + 24, zIndex: maxZ + 1 };
                        updatePanel(activePanelIndex, { ...activePanel, textElements: [...(activePanel.textElements || []), dup] });
                        setSelectedTextId(id);
                      } else if (item.type === "line") {
                        const le = (activePanel.lineElements || []).find((l: any) => l.id === item.id);
                        if (!le) return;
                        const maxZ = (activePanel.lineElements || []).reduce((m: number, l: any) => Math.max(m, l.zIndex ?? 0), 0);
                        const dup = { ...le, id, points: le.points.map((pt: any) => ({ ...pt, x: pt.x + 24, y: pt.y + 24 })), zIndex: maxZ + 1 };
                        updatePanel(activePanelIndex, { ...activePanel, lineElements: [...(activePanel.lineElements || []), dup] });
                        setSelectedLineId(id);
                      } else if (item.type === "shape") {
                        const se = (activePanel.shapeElements || []).find((s: any) => s.id === item.id);
                        if (!se) return;
                        const maxZ = (activePanel.shapeElements || []).reduce((m: number, s: any) => Math.max(m, s.zIndex ?? 0), 0);
                        const dup = { ...se, id, x: se.x + 24, y: se.y + 24, zIndex: maxZ + 1 };
                        updatePanel(activePanelIndex, { ...activePanel, shapeElements: [...(activePanel.shapeElements || []), dup] });
                        setSelectedShapeId(id);
                      }
                    }}
                    onToggleVisibility={(item) => {
                      if (item.type === "drawing") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          drawingLayers: (activePanel.drawingLayers || []).map(dl =>
                            dl.id === item.id ? { ...dl, visible: !dl.visible } : dl
                          ),
                        });
                      } else if (item.type === "char") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          characters: activePanel.characters.map(c =>
                            c.id === item.id ? { ...c, visible: c.visible === false ? undefined : false } : c
                          ),
                        });
                      } else if (item.type === "bubble") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          bubbles: activePanel.bubbles.map(b =>
                            b.id === item.id ? { ...b, visible: b.visible === false ? undefined : false } : b
                          ),
                        });
                      } else if (item.type === "text") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          textElements: (activePanel.textElements || []).map((te: CanvasTextElement) =>
                            te.id === item.id ? { ...te, visible: te.visible === false ? undefined : false } : te
                          ),
                        });
                      } else if (item.type === "line") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          lineElements: (activePanel.lineElements || []).map((le: CanvasLineElement) =>
                            le.id === item.id ? { ...le, visible: le.visible === false ? undefined : false } : le
                          ),
                        });
                      } else if (item.type === "shape") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          shapeElements: (activePanel.shapeElements || []).map((se: CanvasShapeElement) =>
                            se.id === item.id ? { ...se, visible: se.visible === false ? undefined : false } : se
                          ),
                        });
                      } else if (item.type === "topScript" && activePanel.topScript) {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          topScript: { ...activePanel.topScript, visible: activePanel.topScript.visible === false ? undefined : false },
                        });
                      } else if (item.type === "bottomScript" && activePanel.bottomScript) {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          bottomScript: { ...activePanel.bottomScript, visible: activePanel.bottomScript.visible === false ? undefined : false },
                        });
                      }
                    }}
                    onToggleLock={(item) => {
                      if (item.type === "char") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          characters: activePanel.characters.map(c =>
                            c.id === item.id ? { ...c, locked: !c.locked } : c
                          ),
                        });
                      } else if (item.type === "bubble") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          bubbles: activePanel.bubbles.map(b =>
                            b.id === item.id ? { ...b, locked: !b.locked } : b
                          ),
                        });
                      } else if (item.type === "drawing") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          drawingLayers: (activePanel.drawingLayers || []).map(dl =>
                            dl.id === item.id ? { ...dl, locked: !dl.locked } : dl
                          ),
                        });
                      } else if (item.type === "text") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          textElements: (activePanel.textElements || []).map((te: CanvasTextElement) =>
                            te.id === item.id ? { ...te, locked: !te.locked } : te
                          ),
                        });
                      } else if (item.type === "line") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          lineElements: (activePanel.lineElements || []).map((le: CanvasLineElement) =>
                            le.id === item.id ? { ...le, locked: !le.locked } : le
                          ),
                        });
                      } else if (item.type === "shape") {
                        updatePanel(activePanelIndex, {
                          ...activePanel,
                          shapeElements: (activePanel.shapeElements || []).map((se: CanvasShapeElement) =>
                            se.id === item.id ? { ...se, locked: !se.locked } : se
                          ),
                        });
                      }
                    }}
                    onFlipChar={(id) => {
                      updatePanel(activePanelIndex, {
                        ...activePanel,
                        characters: activePanel.characters.map(c =>
                          c.id === id ? { ...c, flipX: !c.flipX } : c
                        ),
                      });
                    }}
                    onToggleMaskLink={(layerId, _layerType, maskId) => {
                      // Toggle: if already linked to this mask, unlink; otherwise link
                      const newShapes = (activePanel.shapeElements || []).map((se: CanvasShapeElement) => {
                        if (se.id !== maskId) return se;
                        const existing = se.maskedLayerIds || [];
                        const isLinked = existing.includes(layerId);
                        return {
                          ...se,
                          maskedLayerIds: isLinked
                            ? existing.filter(id => id !== layerId)
                            : [...existing, layerId],
                        };
                      });
                      updatePanel(activePanelIndex, {
                        ...activePanel,
                        shapeElements: newShapes,
                      });
                    }}
                    isPro={isPro}
                    onDownloadLayerPng={(item) => guard(() => withCleanCanvas(() => downloadLayerPng(item)))}
                    onDownloadLayerSvg={(item) => guard(() => withCleanCanvas(() => downloadLayerSvg(item)))}
                  />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          );
        })()}
      </div>

            <Dialog open={aiLimitOpen} onOpenChange={setAiLimitOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-base">크레딧 부족</DialogTitle>
                  <DialogDescription>크레딧을 전부 사용했어요. 충전해주세요.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full gap-1.5" data-testid="button-upgrade-pro-ai">
                    <a href="/pricing">크레딧 충전 / Pro 업그레이드</a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setAiLimitOpen(false)}
                    data-testid="button-close-ai-limit"
                  >
                    닫기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
              <DialogContent className="max-w-sm" data-testid="modal-save-story">
                <DialogHeader>
                  <DialogTitle className="text-base">스토리 프로젝트 저장</DialogTitle>
                </DialogHeader>
                {isPro ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="프로젝트 이름"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      data-testid="input-story-project-name"
                    />
                    <Select
                      value={selectedFolderId ? String(selectedFolderId) : "none"}
                      onValueChange={(v) => setSelectedFolderId(v === "none" ? null : Number(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="폴더 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">폴더 없음</SelectItem>
                        {projectFolders.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showNewFolderInput ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="새 폴더 이름"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newFolderName.trim()) {
                              setCreatingFolder(true);
                              createFolderMutation.mutate(newFolderName.trim());
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          className="h-[3.125rem] px-3 text-xs shrink-0"
                          disabled={creatingFolder || !newFolderName.trim()}
                          onClick={() => {
                            setCreatingFolder(true);
                            createFolderMutation.mutate(newFolderName.trim());
                          }}
                        >
                          {creatingFolder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "추가"}
                        </Button>
                        <Button variant="ghost" className="h-9 w-9 p-0 shrink-0" onClick={() => { setShowNewFolderInput(false); setNewFolderName(""); }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => setShowNewFolderInput(true)}
                      >
                        <FolderPlus className="h-3.5 w-3.5" />
                        새 폴더 만들기
                      </Button>
                    )}
                    <div className="space-y-2">
                      <Button
                        className="w-full gap-1.5"
                        onClick={handleSaveProject}
                        disabled={savingProject || !projectName.trim()}
                        data-testid="button-save-story-confirm"
                      >
                        {savingProject ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        {currentProjectId ? "업데이트" : "저장하기"}
                      </Button>

                    </div>
                    {currentProjectId && (
                      <p className="text-[11px] text-muted-foreground text-center">
                        기존 프로젝트를 덮어씁니다
                      </p>
                    )}
                    {/* 현재 폴더에 저장된 프로젝트 목록 */}
                    {(() => {
                      const folderProjects = savedProjects
                        .filter((p) => p.editorType === "story" && (selectedFolderId ? p.folderId === selectedFolderId : !p.folderId))
                        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                      if (folderProjects.length === 0) return null;
                      return (
                        <div className="pt-2 border-t">
                          <p className="text-[11px] text-muted-foreground mb-1.5">
                            {selectedFolderId ? projectFolders.find(f => f.id === selectedFolderId)?.name : "폴더 없음"} ({folderProjects.length})
                          </p>
                          <div className="max-h-28 overflow-y-auto space-y-0.5">
                            {folderProjects.map((p) => (
                              <div
                                key={p.id}
                                className={`flex items-center justify-between gap-2 px-2 py-1 rounded text-[11px] cursor-pointer hover:bg-muted/50 transition-colors ${currentProjectId === p.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                                onClick={() => {
                                  setCurrentProjectId(p.id);
                                  setProjectName(p.name);
                                }}
                              >
                                <span className="truncate">{p.name}</span>
                                <span className="shrink-0 text-[10px] opacity-60">
                                  {new Date(p.updatedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Crown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Pro 전용 기능</p>
                      <p className="text-xs text-muted-foreground">프로젝트 저장/관리는 Pro 멤버십 전용 기능입니다.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button asChild className="w-full gap-1.5" data-testid="button-upgrade-pro-story">
                        <a href="/pricing">
                          <Crown className="h-3.5 w-3.5" />
                          Pro 업그레이드
                        </a>
                      </Button>

                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            {/* ── 불러오기 팝업 ── */}
            <Dialog open={showLoadModal} onOpenChange={(open) => { setShowLoadModal(open); if (!open) setLoadFolderId(null); }}>
              <DialogContent className="max-w-[820px] w-[95vw] p-0 gap-0 overflow-hidden rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl" data-testid="modal-load-story">
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-border/40">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold tracking-tight">프로젝트 불러오기</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {savedProjects.filter(p => p.editorType === "story").length}개의 스토리
                    </p>
                  </DialogHeader>
                  {/* 폴더 가로 스크롤 칩 */}
                  {projectFolders.filter(f => savedProjects.some(p => p.editorType === "story" && p.folderId === f.id)).length > 0 && (
                    <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                      <button
                        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${loadFolderId === null ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}
                        onClick={() => setLoadFolderId(null)}
                      >
                        전체
                      </button>
                      {projectFolders.filter(f => savedProjects.some(p => p.editorType === "story" && p.folderId === f.id)).map((folder) => (
                        <button
                          key={folder.id}
                          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${loadFolderId === folder.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted"}`}
                          onClick={() => setLoadFolderId(folder.id)}
                        >
                          <FolderOpen className="h-3 w-3" />
                          {folder.name}
                          <span className="opacity-60">
                            {savedProjects.filter(p => p.editorType === "story" && p.folderId === folder.id).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* 프로젝트 그리드 */}
                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
                  {(() => {
                    const filtered = savedProjects.filter(p => p.editorType === "story" && (loadFolderId === null ? true : p.folderId === loadFolderId));
                    if (filtered.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                          <FolderOpen className="h-12 w-12 mb-3 opacity-40" />
                          <p className="text-sm font-medium">{loadFolderId !== null ? "이 폴더에 스토리가 없습니다" : "저장된 스토리가 없습니다"}</p>
                          <p className="text-xs mt-1 opacity-60">새 스토리를 만들어보세요</p>
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {filtered.map((p) => (
                          <button
                            key={p.id}
                            className={`group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-primary/40 hover:shadow-lg hover:-translate-y-0.5 ${currentProjectId === p.id ? "ring-2 ring-primary shadow-md" : "ring-1 ring-border/30"}`}
                            onClick={() => { setShowLoadModal(false); handleLoadProject(p.id); }}
                          >
                            {/* 썸네일 */}
                            <div className="relative aspect-[3/4] bg-muted/40 overflow-hidden">
                              {p.thumbnailUrl ? (
                                <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/60 to-muted">
                                  <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                              )}
                              {currentProjectId === p.id && (
                                <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                              )}
                              {/* 호버 오버레이 */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                            </div>
                            {/* 정보 */}
                            <div className="px-2 py-2 bg-background">
                              <p className="text-[11px] font-medium truncate leading-tight">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(p.updatedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </DialogContent>
            </Dialog>

            {showSavedConfirm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 animate-in fade-in duration-200">
                <div className="bg-background rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-2 animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                  <p className="text-sm font-medium">저장되었습니다</p>
                </div>
              </div>
            )}
          <InstagramPublishDialog
            open={showInstagramPublish}
            onOpenChange={setShowInstagramPublish}
            panels={panels.map((p, i) => {
              const canvas = panelCanvasRefs.current.get(p.id);
              let thumbnail = "";
              if (canvas) {
                try {
                  const thumb = document.createElement("canvas");
                  thumb.width = 120;
                  thumb.height = 150;
                  const tCtx = thumb.getContext("2d");
                  if (tCtx) {
                    tCtx.drawImage(canvas, 0, 0, 120, 150);
                    thumbnail = thumb.toDataURL("image/png", 0.6);
                  }
                } catch {}
              }
              return { id: p.id, index: i, thumbnail };
            })}
            onCapturePanel={capturePanelForInstagram}
          />
          {/* ── Story-level Template Picker Popup ── */}
          {showStoryTemplatePicker && activePanel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowStoryTemplatePicker(false)} data-testid="modal-story-template-picker-elements">
              <Card className="w-full max-w-lg max-h-[70vh] flex flex-col m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border flex-wrap">
                  <h3 className="text-sm font-semibold">말풍선 템플릿</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowStoryTemplatePicker(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1.5 px-4 pt-3 pb-1 overflow-x-auto flex-wrap">
                  {BUBBLE_TEMPLATE_CATEGORIES.map((cat, ci) => (
                    <Badge
                      key={ci}
                      className={`cursor-pointer shrink-0 toggle-elevate ${ci === storyTemplateCatIdx ? "toggle-elevated" : ""}`}
                      variant={ci === storyTemplateCatIdx ? "default" : "outline"}
                      onClick={() => setStoryTemplateCatIdx(ci)}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
                <div className="overflow-y-auto p-4 flex-1">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {BUBBLE_TEMPLATE_CATEGORIES[storyTemplateCatIdx]?.ids.map((id) => {
                      const path = bubblePath(id);
                      return (
                        <div
                          key={id}
                          className="aspect-square rounded-md border border-border overflow-hidden cursor-pointer hover-elevate bg-muted/30 p-1.5"
                          onClick={() => {
                            if (activePanel.bubbles.length >= 5) return;
                            const img = new Image();
                            img.crossOrigin = "anonymous";
                            img.onload = () => {
                              const maxDim = Math.min(CANVAS_W, CANVAS_H) * 0.4;
                              const aspect = img.width / img.height;
                              let w: number, h: number;
                              if (aspect > 1) { w = maxDim; h = maxDim / aspect; }
                              else { h = maxDim; w = maxDim * aspect; }
                              const newB: SpeechBubble = {
                                id: generateId(),
                                seed: Math.floor(Math.random() * 100000),
                                x: CANVAS_W / 2 - w / 2,
                                y: CANVAS_H / 2 - h / 2,
                                width: w,
                                height: h,
                                text: "",
                                style: "image",
                                tailStyle: "none",
                                tailDirection: "bottom",
                                strokeWidth: 2,
                                wobble: 5,
                                fontSize: 15,
                                fontKey: "default",
                                templateSrc: path,
                                templateImg: img,
                              };
                              updatePanel(activePanelIndex, { ...activePanel, bubbles: [...activePanel.bubbles, newB] });
                              setSelectedBubbleId(newB.id);
                              setSelectedCharId(null);
                              setSelectedTextId(null);
                              setSelectedLineId(null);
                              setSelectedShapeId(null);
                              setSelectedDrawingLayerId(null);
                              setSelectedScriptPosition(null);
                            };
                            img.src = path;
                            setShowStoryTemplatePicker(false);
                          }}
                        >
                          <img src={path} alt={`말풍선 ${id}`} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          )}
          <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
          <LeaveEditorDialog open={showLeaveDialog} onConfirm={confirmLeave} onCancel={cancelLeave} />
          </div >
          );
}
