import { useState, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import type { SpeechBubble, BubbleStyle, TailStyle } from "@/lib/bubble-types";
import {
  KOREAN_FONTS,
  STYLE_LABELS,
  FLASH_STYLE_LABELS,
  TAIL_LABELS,
  BUBBLE_CATEGORIES,
  ALL_STYLE_LABELS,
} from "@/lib/bubble-utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CaseSensitive,
  List,
  Pilcrow,
  Sparkles,
  Play,
  Move,
  Paintbrush,
  Menu,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Spline,
  Minus,
  MoreHorizontal,
  Circle,
  Palette,
  X,
  ChevronDown,
  Square,
  Triangle,
  Diamond,
  Star,
  Scan,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

export type TextAlign = "left" | "center" | "right";
export type TextTransform = "none" | "uppercase" | "lowercase";
export type LineType = "straight" | "curved" | "polyline";
export type DashPattern = "solid" | "dashed" | "dotted";

export interface CanvasTextElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  textAlign: TextAlign;
  textTransform: TextTransform;
  opacity: number;
  zIndex: number;
  visible?: boolean;
  locked?: boolean;
}

export interface CanvasLineElement {
  id: string;
  lineType: LineType;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  opacity: number;
  startArrow: boolean;
  endArrow: boolean;
  dashPattern: DashPattern;
  zIndex: number;
  visible?: boolean;
  locked?: boolean;
}

export type ShapeType = "rectangle" | "circle" | "triangle" | "diamond" | "star" | "arrow";

export interface CanvasShapeElement {
  id: string;
  shapeType: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  zIndex: number;
  maskEnabled?: boolean;
  maskedLayerIds?: string[];
  visible?: boolean;
  locked?: boolean;
}

export function createTextElement(canvasW: number, canvasH: number): CanvasTextElement {
  return {
    id: Math.random().toString(36).slice(2, 10),
    x: canvasW / 2 - 80,
    y: canvasH / 2 - 20,
    width: 160,
    height: 40,
    text: "텍스트 입력",
    fontFamily: "default",
    fontSize: 18,
    color: "#000000",
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textAlign: "center",
    textTransform: "none",
    opacity: 1,
    zIndex: 20,
  };
}

export function createLineElement(
  canvasW: number,
  canvasH: number,
  lineType: LineType = "straight",
): CanvasLineElement {
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  let points: { x: number; y: number }[];

  switch (lineType) {
    case "curved":
      points = [
        { x: cx - 80, y: cy },
        { x: cx, y: cy - 50 },
        { x: cx + 80, y: cy },
      ];
      break;
    case "polyline":
      points = [
        { x: cx - 80, y: cy + 30 },
        { x: cx - 20, y: cy - 30 },
        { x: cx + 20, y: cy + 30 },
        { x: cx + 80, y: cy - 30 },
      ];
      break;
    default:
      points = [
        { x: cx - 80, y: cy },
        { x: cx + 80, y: cy },
      ];
  }

  return {
    id: Math.random().toString(36).slice(2, 10),
    lineType,
    points,
    color: "#000000",
    strokeWidth: 2,
    opacity: 1,
    startArrow: false,
    endArrow: false,
    dashPattern: "solid",
    zIndex: 20,
  };
}

export function createShapeElement(
  canvasW: number,
  canvasH: number,
  shapeType: ShapeType = "rectangle",
): CanvasShapeElement {
  return {
    id: Math.random().toString(36).slice(2, 10),
    shapeType,
    x: canvasW / 2 - 50,
    y: canvasH / 2 - 40,
    width: 100,
    height: 80,
    fillColor: "transparent",
    strokeColor: "#000000",
    strokeWidth: 2,
    opacity: 1,
    zIndex: 20,
  };
}

// ─── Font options ──────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { value: "default", label: "기본" },
  { value: "noto-sans", label: "Noto Sans" },
  { value: "noto-serif", label: "Noto Serif" },
  { value: "poor-story", label: "푸어스토리" },
  { value: "gaegu", label: "개구" },
  { value: "jua", label: "주아" },
  { value: "single-day", label: "싱글데이" },
  { value: "hi-melody", label: "하이멜로디" },
];

const FONT_SIZE_OPTIONS = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

const COLOR_PRESETS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

export const CANVAS_BG_COLORS = [
  { label: "흰색", value: "#ffffff" },
  { label: "검정", value: "#1a1a1a" },
  { label: "노랑", value: "#fef08a" },
  { label: "하늘", value: "#bae6fd" },
  { label: "분홍", value: "#fecdd3" },
  { label: "연두", value: "#bbf7d0" },
  { label: "보라", value: "#e9d5ff" },
  { label: "주황", value: "#fed7aa" },
  { label: "회색", value: "#e5e7eb" },
];

// ─── Text Context Toolbar ──────────────────────────────────────────────────

interface TextToolbarProps {
  element: CanvasTextElement;
  onChange: (updated: CanvasTextElement) => void;
}

export function TextContextToolbar({ element, onChange }: TextToolbarProps) {
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (partial: Partial<CanvasTextElement>) => {
      onChange({ ...element, ...partial });
    },
    [element, onChange],
  );

  return (
    <div className="context-toolbar context-toolbar--text">
      {/* Font family */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn context-toolbar__btn--wide"
          onClick={() => setShowFontDropdown((v) => !v)}
        >
          <span className="context-toolbar__btn-label">
            {FONT_OPTIONS.find((f) => f.value === element.fontFamily)?.label || "기본"}
          </span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {showFontDropdown && (
          <div className="context-toolbar__dropdown">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.value}
                className={`context-toolbar__dropdown-item ${element.fontFamily === f.value ? "context-toolbar__dropdown-item--active" : ""}`}
                onClick={() => {
                  update({ fontFamily: f.value });
                  setShowFontDropdown(false);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Font size */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn context-toolbar__btn--narrow"
          onClick={() => setShowSizeDropdown((v) => !v)}
        >
          <span className="context-toolbar__btn-label">{element.fontSize}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {showSizeDropdown && (
          <div className="context-toolbar__dropdown">
            {FONT_SIZE_OPTIONS.map((s) => (
              <button
                key={s}
                className={`context-toolbar__dropdown-item ${element.fontSize === s ? "context-toolbar__dropdown-item--active" : ""}`}
                onClick={() => {
                  update({ fontSize: s });
                  setShowSizeDropdown(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Color */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn"
          onClick={() => setShowColorPicker((v) => !v)}
        >
          <span
            className="context-toolbar__color-dot"
            style={{ backgroundColor: element.color }}
          />
        </button>
        {showColorPicker && (
          <div className="context-toolbar__dropdown context-toolbar__dropdown--colors">
            <div className="context-toolbar__color-grid">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`context-toolbar__color-swatch ${element.color === c ? "context-toolbar__color-swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    update({ color: c });
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div className="context-toolbar__custom-color-row">
              <input
                ref={colorInputRef}
                type="color"
                value={element.color}
                onChange={(e) => update({ color: e.target.value })}
                className="context-toolbar__color-input"
              />
              <span className="context-toolbar__color-hex">{element.color}</span>
            </div>
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Bold */}
      <button
        className={`context-toolbar__btn ${element.bold ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ bold: !element.bold })}
        title="굵게"
      >
        <Bold className="h-4 w-4" />
      </button>

      {/* Italic */}
      <button
        className={`context-toolbar__btn ${element.italic ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ italic: !element.italic })}
        title="기울임"
      >
        <Italic className="h-4 w-4" />
      </button>

      {/* Underline */}
      <button
        className={`context-toolbar__btn ${element.underline ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ underline: !element.underline })}
        title="밑줄"
      >
        <Underline className="h-4 w-4" />
      </button>

      {/* Strikethrough */}
      <button
        className={`context-toolbar__btn ${element.strikethrough ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ strikethrough: !element.strikethrough })}
        title="취소선"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <div className="context-toolbar__divider" />

      {/* Text transform */}
      <button
        className={`context-toolbar__btn ${element.textTransform !== "none" ? "context-toolbar__btn--active" : ""}`}
        onClick={() => {
          const next: TextTransform =
            element.textTransform === "none"
              ? "uppercase"
              : element.textTransform === "uppercase"
                ? "lowercase"
                : "none";
          update({ textTransform: next });
        }}
        title="대소문자"
      >
        <CaseSensitive className="h-4 w-4" />
      </button>

      {/* Alignment */}
      <button
        className={`context-toolbar__btn`}
        onClick={() => {
          const next: TextAlign =
            element.textAlign === "left"
              ? "center"
              : element.textAlign === "center"
                ? "right"
                : "left";
          update({ textAlign: next });
        }}
        title="정렬"
      >
        {element.textAlign === "left" && <AlignLeft className="h-4 w-4" />}
        {element.textAlign === "center" && <AlignCenter className="h-4 w-4" />}
        {element.textAlign === "right" && <AlignRight className="h-4 w-4" />}
      </button>

      {/* List */}
      <button className="context-toolbar__btn" title="목록">
        <List className="h-4 w-4" />
      </button>

      {/* Text direction */}
      <button className="context-toolbar__btn" title="텍스트 방향">
        <Pilcrow className="h-4 w-4" />
      </button>

      <div className="context-toolbar__divider" />

      {/* Effects */}
      <button className="context-toolbar__btn" title="효과">
        <Sparkles className="h-4 w-4" />
      </button>

      {/* Animation */}
      <button className="context-toolbar__btn" title="애니메이션">
        <Play className="h-4 w-4" />
      </button>

      {/* Position */}
      <button className="context-toolbar__btn" title="위치">
        <Move className="h-4 w-4" />
      </button>

      {/* Paint */}
      <button className="context-toolbar__btn" title="채우기">
        <Paintbrush className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Line Context Toolbar ──────────────────────────────────────────────────

interface LineToolbarProps {
  element: CanvasLineElement;
  onChange: (updated: CanvasLineElement) => void;
  onShowSettings: () => void;
  showSettings: boolean;
}

export function LineContextToolbar({ element, onChange, onShowSettings, showSettings }: LineToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (partial: Partial<CanvasLineElement>) => {
      onChange({ ...element, ...partial });
    },
    [element, onChange],
  );

  return (
    <div className="context-toolbar context-toolbar--line">
      {/* Color */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn"
          onClick={() => setShowColorPicker((v) => !v)}
          title="색상"
        >
          <span
            className="context-toolbar__color-dot"
            style={{ backgroundColor: element.color }}
          />
        </button>
        {showColorPicker && (
          <div className="context-toolbar__dropdown context-toolbar__dropdown--colors">
            <div className="context-toolbar__color-grid">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`context-toolbar__color-swatch ${element.color === c ? "context-toolbar__color-swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    update({ color: c });
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div className="context-toolbar__custom-color-row">
              <input
                ref={colorInputRef}
                type="color"
                value={element.color}
                onChange={(e) => update({ color: e.target.value })}
                className="context-toolbar__color-input"
              />
              <span className="context-toolbar__color-hex">{element.color}</span>
            </div>
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Settings menu (hamburger) */}
      <button
        className={`context-toolbar__btn ${showSettings ? "context-toolbar__btn--active" : ""}`}
        onClick={onShowSettings}
        title="설정"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="context-toolbar__divider" />

      {/* Start arrow */}
      <button
        className={`context-toolbar__btn ${element.startArrow ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ startArrow: !element.startArrow })}
        title="시작 화살표"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      {/* End arrow */}
      <button
        className={`context-toolbar__btn ${element.endArrow ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ endArrow: !element.endArrow })}
        title="끝 화살표"
      >
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="context-toolbar__divider" />

      {/* Line type: straight */}
      <button
        className={`context-toolbar__btn ${element.lineType === "straight" ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ lineType: "straight" })}
        title="직선"
      >
        <Minus className="h-4 w-4" />
      </button>

      {/* Line type: curved */}
      <button
        className={`context-toolbar__btn ${element.lineType === "curved" ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ lineType: "curved" })}
        title="곡선"
      >
        <Spline className="h-4 w-4" />
      </button>

      {/* Line type: polyline */}
      <button
        className={`context-toolbar__btn ${element.lineType === "polyline" ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ lineType: "polyline" })}
        title="꺾인선"
      >
        <ArrowUpRight className="h-4 w-4" />
      </button>

      <div className="context-toolbar__divider" />

      {/* Dash pattern */}
      <button
        className={`context-toolbar__btn ${element.dashPattern !== "solid" ? "context-toolbar__btn--active" : ""}`}
        onClick={() => {
          const next: DashPattern =
            element.dashPattern === "solid"
              ? "dashed"
              : element.dashPattern === "dashed"
                ? "dotted"
                : "solid";
          update({ dashPattern: next });
        }}
        title="선 패턴"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Animation */}
      <button className="context-toolbar__btn" title="애니메이션">
        <Play className="h-4 w-4" />
      </button>

      {/* Position */}
      <button className="context-toolbar__btn" title="위치">
        <Move className="h-4 w-4" />
      </button>

      {/* Paint */}
      <button className="context-toolbar__btn" title="채우기">
        <Paintbrush className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Drawing Context Toolbar (when selecting a drawn stroke) ───────────────

interface DrawingToolbarProps {
  color: string;
  onColorChange: (color: string) => void;
  onShowSettings: () => void;
  showSettings: boolean;
}

export function DrawingContextToolbar({
  color,
  onColorChange,
  onShowSettings,
  showSettings,
}: DrawingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="context-toolbar context-toolbar--drawing">
      {/* Color */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn"
          onClick={() => setShowColorPicker((v) => !v)}
          title="색상"
        >
          <span
            className="context-toolbar__color-dot"
            style={{ backgroundColor: color }}
          />
        </button>
        {showColorPicker && (
          <div className="context-toolbar__dropdown context-toolbar__dropdown--colors">
            <div className="context-toolbar__color-grid">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`context-toolbar__color-swatch ${color === c ? "context-toolbar__color-swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    onColorChange(c);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div className="context-toolbar__custom-color-row">
              <input
                ref={colorInputRef}
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="context-toolbar__color-input"
              />
              <span className="context-toolbar__color-hex">{color}</span>
            </div>
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Settings menu (hamburger) */}
      <button
        className={`context-toolbar__btn ${showSettings ? "context-toolbar__btn--active" : ""}`}
        onClick={onShowSettings}
        title="설정"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="context-toolbar__divider" />

      {/* Pattern */}
      <button className="context-toolbar__btn" title="패턴">
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Animation */}
      <button className="context-toolbar__btn" title="애니메이션">
        <Play className="h-4 w-4" />
      </button>

      {/* Position */}
      <button className="context-toolbar__btn" title="위치">
        <Move className="h-4 w-4" />
      </button>

      {/* Paint */}
      <button className="context-toolbar__btn" title="채우기">
        <Paintbrush className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Line/Drawing Settings Floating Modal ──────────────────────────────────

interface SettingsModalProps {
  strokeWidth: number;
  opacity: number;
  onStrokeWidthChange: (v: number) => void;
  onOpacityChange: (v: number) => void;
  onClose: () => void;
  minStrokeWidth?: number;
}

export function FloatingSettingsModal({
  strokeWidth,
  opacity,
  onStrokeWidthChange,
  onOpacityChange,
  onClose,
  minStrokeWidth,
}: SettingsModalProps) {
  const effectiveMin = minStrokeWidth ?? 1;
  return (
    <div className="floating-settings-modal">
      <div className="floating-settings-modal__header">
        <span className="floating-settings-modal__title">설정</span>
        <button className="floating-settings-modal__close" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="floating-settings-modal__section">
        <div className="floating-settings-modal__row">
          <span className="floating-settings-modal__label">두께</span>
          <span className="floating-settings-modal__value">{strokeWidth === 0 ? "없음" : `${strokeWidth}px`}</span>
        </div>
        <Slider
          min={effectiveMin}
          max={50}
          step={1}
          value={[strokeWidth]}
          onValueChange={([v]) => onStrokeWidthChange(v)}
          className="w-full"
        />
      </div>

      <div className="floating-settings-modal__section">
        <div className="floating-settings-modal__row">
          <span className="floating-settings-modal__label">투명도</span>
          <span className="floating-settings-modal__value">{Math.round(opacity * 100)}%</span>
        </div>
        <Slider
          min={5}
          max={100}
          step={1}
          value={[Math.round(opacity * 100)]}
          onValueChange={([v]) => onOpacityChange(v / 100)}
          className="w-full"
        />
      </div>
    </div>
  );
}

// ─── Bubble Context Toolbar ─────────────────────────────────────────────────

const BUBBLE_FONT_SIZE_OPTIONS = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];

interface BubbleToolbarProps {
  bubble: SpeechBubble;
  onChange: (updates: Partial<SpeechBubble>) => void;
  onShowSettings: () => void;
  showSettings: boolean;
  canAllFonts?: boolean;
}

export function BubbleContextToolbar({ bubble, onChange, onShowSettings, showSettings, canAllFonts = true }: BubbleToolbarProps) {
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const fillColorInputRef = useRef<HTMLInputElement>(null);
  const strokeColorInputRef = useRef<HTMLInputElement>(null);

  const fontLabel = KOREAN_FONTS.find((f) => f.value === bubble.fontKey)?.label || "기본 고딕";

  return (
    <div className="context-toolbar context-toolbar--bubble">
      {/* Font family */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn context-toolbar__btn--wide"
          onClick={() => { setShowFontDropdown((v) => !v); setShowSizeDropdown(false); setShowFillColorPicker(false); setShowStrokeColorPicker(false); }}
        >
          <span className="context-toolbar__btn-label">{fontLabel}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {showFontDropdown && (
          <div className="context-toolbar__dropdown">
            {KOREAN_FONTS.map((f, idx) => {
              const locked = !canAllFonts && idx >= 3;
              return (
                <button
                  key={f.value}
                  className={`context-toolbar__dropdown-item ${bubble.fontKey === f.value ? "context-toolbar__dropdown-item--active" : ""} ${locked ? "context-toolbar__dropdown-item--locked" : ""}`}
                  onClick={() => {
                    if (locked) return;
                    onChange({ fontKey: f.value });
                    setShowFontDropdown(false);
                  }}
                  disabled={locked}
                >
                  <span style={{ fontFamily: f.family }}>{f.label}</span>
                  {locked && <span className="context-toolbar__lock-badge">Pro</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Font size */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn context-toolbar__btn--narrow"
          onClick={() => { setShowSizeDropdown((v) => !v); setShowFontDropdown(false); setShowFillColorPicker(false); setShowStrokeColorPicker(false); }}
        >
          <span className="context-toolbar__btn-label">{bubble.fontSize}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {showSizeDropdown && (
          <div className="context-toolbar__dropdown">
            {BUBBLE_FONT_SIZE_OPTIONS.map((s) => (
              <button
                key={s}
                className={`context-toolbar__dropdown-item ${bubble.fontSize === s ? "context-toolbar__dropdown-item--active" : ""}`}
                onClick={() => {
                  onChange({ fontSize: s });
                  setShowSizeDropdown(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Fill color */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn"
          onClick={() => { setShowFillColorPicker((v) => !v); setShowStrokeColorPicker(false); setShowFontDropdown(false); setShowSizeDropdown(false); }}
          title="채움색"
        >
          <span
            className="context-toolbar__color-dot"
            style={{ backgroundColor: bubble.fillColor || "#ffffff" }}
          />
        </button>
        {showFillColorPicker && (
          <div className="context-toolbar__dropdown context-toolbar__dropdown--colors">
            <div className="context-toolbar__color-grid">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`context-toolbar__color-swatch ${(bubble.fillColor || "#ffffff") === c ? "context-toolbar__color-swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    onChange({ fillColor: c });
                    setShowFillColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div className="context-toolbar__custom-color-row">
              <input
                ref={fillColorInputRef}
                type="color"
                value={bubble.fillColor && bubble.fillColor !== "transparent" ? bubble.fillColor : "#ffffff"}
                onChange={(e) => onChange({ fillColor: e.target.value })}
                className="context-toolbar__color-input"
              />
              <span className="context-toolbar__color-hex">{bubble.fillColor || "#ffffff"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stroke color */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn"
          onClick={() => { setShowStrokeColorPicker((v) => !v); setShowFillColorPicker(false); setShowFontDropdown(false); setShowSizeDropdown(false); }}
          title="테두리색"
        >
          <span
            className="context-toolbar__color-dot context-toolbar__color-dot--stroke"
            style={{ backgroundColor: bubble.strokeColor || "#222222" }}
          />
        </button>
        {showStrokeColorPicker && (
          <div className="context-toolbar__dropdown context-toolbar__dropdown--colors">
            <div className="context-toolbar__color-grid">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`context-toolbar__color-swatch ${(bubble.strokeColor || "#222222") === c ? "context-toolbar__color-swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    onChange({ strokeColor: c });
                    setShowStrokeColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div className="context-toolbar__custom-color-row">
              <input
                ref={strokeColorInputRef}
                type="color"
                value={bubble.strokeColor || "#222222"}
                onChange={(e) => onChange({ strokeColor: e.target.value })}
                className="context-toolbar__color-input"
              />
              <span className="context-toolbar__color-hex">{bubble.strokeColor || "#222222"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Settings menu (hamburger) */}
      <button
        className={`context-toolbar__btn ${showSettings ? "context-toolbar__btn--active" : ""}`}
        onClick={onShowSettings}
        title="설정"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Bubble Floating Settings ───────────────────────────────────────────────

interface BubbleSettingsProps {
  bubble: SpeechBubble;
  onChange: (updates: Partial<SpeechBubble>) => void;
  onClose: () => void;
}

export function BubbleFloatingSettings({ bubble, onChange, onClose }: BubbleSettingsProps) {
  return (
    <div className="floating-settings-modal bubble-floating-settings">
      <div className="floating-settings-modal__header">
        <span className="floating-settings-modal__title">말풍선 설정</span>
        <button className="floating-settings-modal__close" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stroke width */}
      <div className="floating-settings-modal__section">
        <div className="floating-settings-modal__row">
          <span className="floating-settings-modal__label">테두리 두께</span>
          <span className="floating-settings-modal__value">{bubble.strokeWidth}px</span>
        </div>
        <Slider
          min={1}
          max={8}
          step={0.5}
          value={[bubble.strokeWidth]}
          onValueChange={([v]) => onChange({ strokeWidth: v })}
          className="w-full"
        />
      </div>

      {/* Fill opacity */}
      <div className="floating-settings-modal__section">
        <div className="floating-settings-modal__row">
          <span className="floating-settings-modal__label">채움 투명도</span>
          <span className="floating-settings-modal__value">{Math.round((bubble.fillOpacity ?? 1) * 100)}%</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[Math.round((bubble.fillOpacity ?? 1) * 100)]}
          onValueChange={([v]) => onChange({ fillOpacity: v / 100 })}
          className="w-full"
        />
      </div>
    </div>
  );
}

// ─── Shape Context Toolbar ─────────────────────────────────────────────────

const SHAPE_TYPES: { type: ShapeType; icon: typeof Square; label: string }[] = [
  { type: "rectangle", icon: Square, label: "사각형" },
  { type: "circle", icon: Circle, label: "원" },
  { type: "triangle", icon: Triangle, label: "삼각형" },
  { type: "diamond", icon: Diamond, label: "다이아몬드" },
  { type: "star", icon: Star, label: "별" },
  { type: "arrow", icon: ArrowRight, label: "화살표" },
];

interface ShapeToolbarProps {
  element: CanvasShapeElement;
  onChange: (updated: CanvasShapeElement) => void;
  onShowSettings: () => void;
  showSettings: boolean;
}

export function ShapeContextToolbar({ element, onChange, onShowSettings, showSettings }: ShapeToolbarProps) {
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const fillColorInputRef = useRef<HTMLInputElement>(null);
  const strokeColorInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (partial: Partial<CanvasShapeElement>) => {
      onChange({ ...element, ...partial });
    },
    [element, onChange],
  );

  return (
    <div className="context-toolbar context-toolbar--line">
      {/* Fill color */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn"
          onClick={() => { setShowFillColorPicker((v) => !v); setShowStrokeColorPicker(false); }}
          title="채움색"
        >
          <span
            className="context-toolbar__color-dot"
            style={{
              backgroundColor: element.fillColor === "transparent" ? "#ffffff" : element.fillColor,
              backgroundImage: element.fillColor === "transparent"
                ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)"
                : undefined,
              backgroundSize: element.fillColor === "transparent" ? "6px 6px" : undefined,
              backgroundPosition: element.fillColor === "transparent" ? "0 0, 3px 3px" : undefined,
            }}
          />
        </button>
        {showFillColorPicker && (
          <div className="context-toolbar__dropdown context-toolbar__dropdown--colors">
            <div className="context-toolbar__color-grid">
              <button
                className={`context-toolbar__color-swatch ${element.fillColor === "transparent" ? "context-toolbar__color-swatch--active" : ""}`}
                style={{
                  backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)",
                  backgroundSize: "6px 6px",
                  backgroundPosition: "0 0, 3px 3px",
                }}
                onClick={() => {
                  update({ fillColor: "transparent" });
                  setShowFillColorPicker(false);
                }}
                title="투명"
              />
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`context-toolbar__color-swatch ${element.fillColor === c ? "context-toolbar__color-swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    update({ fillColor: c });
                    setShowFillColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div className="context-toolbar__custom-color-row">
              <input
                ref={fillColorInputRef}
                type="color"
                value={element.fillColor !== "transparent" ? element.fillColor : "#ffffff"}
                onChange={(e) => update({ fillColor: e.target.value })}
                className="context-toolbar__color-input"
              />
              <span className="context-toolbar__color-hex">{element.fillColor}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stroke color */}
      <div className="context-toolbar__dropdown-wrapper">
        <button
          className="context-toolbar__btn"
          onClick={() => { setShowStrokeColorPicker((v) => !v); setShowFillColorPicker(false); }}
          title="선색"
        >
          <span
            className="context-toolbar__color-dot context-toolbar__color-dot--stroke"
            style={{ backgroundColor: element.strokeColor }}
          />
        </button>
        {showStrokeColorPicker && (
          <div className="context-toolbar__dropdown context-toolbar__dropdown--colors">
            <div className="context-toolbar__color-grid">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  className={`context-toolbar__color-swatch ${element.strokeColor === c ? "context-toolbar__color-swatch--active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    update({ strokeColor: c });
                    setShowStrokeColorPicker(false);
                  }}
                />
              ))}
            </div>
            <div className="context-toolbar__custom-color-row">
              <input
                ref={strokeColorInputRef}
                type="color"
                value={element.strokeColor}
                onChange={(e) => update({ strokeColor: e.target.value })}
                className="context-toolbar__color-input"
              />
              <span className="context-toolbar__color-hex">{element.strokeColor}</span>
            </div>
          </div>
        )}
      </div>

      <div className="context-toolbar__divider" />

      {/* Shape type buttons */}
      {SHAPE_TYPES.map((st) => (
        <button
          key={st.type}
          className={`context-toolbar__btn ${element.shapeType === st.type ? "context-toolbar__btn--active" : ""}`}
          onClick={() => update({ shapeType: st.type })}
          title={st.label}
        >
          <st.icon className="h-4 w-4" />
        </button>
      ))}

      <div className="context-toolbar__divider" />

      {/* Settings menu (hamburger) */}
      <button
        className={`context-toolbar__btn ${showSettings ? "context-toolbar__btn--active" : ""}`}
        onClick={onShowSettings}
        title="설정"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="context-toolbar__divider" />

      {/* Mask toggle */}
      <button
        className={`context-toolbar__btn ${element.maskEnabled ? "context-toolbar__btn--active" : ""}`}
        onClick={() => update({ maskEnabled: !element.maskEnabled })}
        title="클리핑 마스크"
      >
        <Scan className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Canvas Background Toolbar ────────────────────────────────────────────

interface CanvasBgToolbarProps {
  backgroundColor: string;
  onColorChange: (color: string) => void;
}

export function CanvasBgToolbar({ backgroundColor, onColorChange }: CanvasBgToolbarProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="context-toolbar context-toolbar--canvas-bg">
      <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", padding: "0 4px", whiteSpace: "nowrap" }}>배경색</span>
      <span className="context-toolbar__divider" />
      {CANVAS_BG_COLORS.map((c) => (
        <button
          key={c.value}
          className="context-toolbar__btn"
          style={{ minWidth: 28, padding: 0 }}
          onClick={() => onColorChange(c.value)}
          title={c.label}
        >
          <span
            className={`context-toolbar__color-dot ${backgroundColor === c.value ? "context-toolbar__color-dot--selected" : ""}`}
            style={{ backgroundColor: c.value, width: 20, height: 20 }}
          />
        </button>
      ))}
      <span className="context-toolbar__divider" />
      <button
        className="context-toolbar__btn"
        onClick={() => colorInputRef.current?.click()}
        title="직접 선택"
      >
        <Palette className="h-4 w-4" />
      </button>
      <input
        ref={colorInputRef}
        type="color"
        value={backgroundColor}
        onChange={(e) => onColorChange(e.target.value)}
        style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
