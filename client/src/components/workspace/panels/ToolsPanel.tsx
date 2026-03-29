import { useState } from "react";
import {
  MousePointer2,
  Pen,
  Minus,
  Type,
  Square,
  Circle,
  Triangle,
  Diamond,
  Star,
  ArrowRight,
  Eraser,
  Highlighter,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_PRESETS } from "@/components/canva-editor/types";
import type { ToolMode, DrawSubTool, LineSubTool } from "@/components/canva-editor/types";

// ─── Tool definitions ───────────────────────────────────────────────────────

interface ToolDef {
  id: ToolMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TOOLS: ToolDef[] = [
  { id: "select", label: "선택", icon: MousePointer2, description: "요소를 선택하고 이동/크기 조절" },
  { id: "draw", label: "그리기", icon: Pen, description: "자유 드로잉 (볼펜/마커/형광펜)" },
  { id: "line", label: "선", icon: Minus, description: "직선, 곡선, 폴리라인" },
  { id: "text", label: "텍스트", icon: Type, description: "텍스트 추가" },
  { id: "eraser", label: "지우개", icon: Eraser, description: "캔버스 드로잉 지우기" },
];

const DRAW_SUB_TOOLS: { id: DrawSubTool; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "pencil", label: "볼펜", icon: PenLine },
  { id: "marker", label: "마커", icon: Pen },
  { id: "highlighter", label: "형광펜", icon: Highlighter },
];

const LINE_SUB_TOOLS: { id: LineSubTool; label: string }[] = [
  { id: "straight", label: "직선" },
  { id: "curve", label: "곡선" },
  { id: "polyline", label: "폴리라인" },
];

const SHAPE_TOOLS = [
  { id: "rect", label: "사각형", icon: Square },
  { id: "circle", label: "원", icon: Circle },
  { id: "triangle", label: "삼각형", icon: Triangle },
  { id: "diamond", label: "다이아몬드", icon: Diamond },
  { id: "star", label: "별", icon: Star },
  { id: "arrow", label: "화살표", icon: ArrowRight },
];

const SIZE_PRESETS = [1, 2, 4, 8, 12, 20];

// ─── Props (controlled by CanvasArea) ───────────────────────────────────────

interface ToolsPanelProps {
  toolMode?: ToolMode;
  onToolModeChange?: (mode: ToolMode) => void;
  drawColor?: string;
  onDrawColorChange?: (color: string) => void;
  drawSize?: number;
  onDrawSizeChange?: (size: number) => void;
  drawSubTool?: DrawSubTool;
  onDrawSubToolChange?: (tool: DrawSubTool) => void;
  lineSubTool?: LineSubTool;
  onLineSubToolChange?: (tool: LineSubTool) => void;
  drawOpacity?: number;
  onDrawOpacityChange?: (opacity: number) => void;
}

export function ToolsPanel({
  toolMode: externalToolMode,
  onToolModeChange,
  drawColor: externalColor,
  onDrawColorChange,
  drawSize: externalSize,
  onDrawSizeChange,
  drawSubTool: externalDrawSub,
  onDrawSubToolChange,
  lineSubTool: externalLineSub,
  onLineSubToolChange,
  drawOpacity: externalOpacity,
  onDrawOpacityChange,
}: ToolsPanelProps = {}) {
  // Internal state as fallback
  const [_toolMode, _setToolMode] = useState<ToolMode>("select");
  const [_color, _setColor] = useState("#000000");
  const [_size, _setSize] = useState(4);
  const [_drawSub, _setDrawSub] = useState<DrawSubTool>("pencil");
  const [_lineSub, _setLineSub] = useState<LineSubTool>("straight");
  const [_opacity, _setOpacity] = useState(1);

  const toolMode = externalToolMode ?? _toolMode;
  const color = externalColor ?? _color;
  const size = externalSize ?? _size;
  const drawSub = externalDrawSub ?? _drawSub;
  const lineSub = externalLineSub ?? _lineSub;
  const opacity = externalOpacity ?? _opacity;

  const setToolMode = onToolModeChange ?? _setToolMode;
  const setColor = onDrawColorChange ?? _setColor;
  const setSize = onDrawSizeChange ?? _setSize;
  const setDrawSub = onDrawSubToolChange ?? _setDrawSub;
  const setLineSub = onLineSubToolChange ?? _setLineSub;
  const setOpacity = onDrawOpacityChange ?? _setOpacity;

  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
        <Pen className="w-5 h-5 text-primary" />
        도구
      </h3>

      {/* Tool selector */}
      <div className="grid grid-cols-5 gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setToolMode(tool.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all",
              toolMode === tool.id
                ? "border-primary/40 bg-primary/[0.06] text-primary"
                : "border-white/[0.04] text-white/30 hover:text-white/50 hover:border-white/10"
            )}
            title={tool.description}
          >
            <tool.icon className="w-5 h-5" />
            <span className="text-[13px] font-medium">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* ── Drawing sub-tools ─────────────────────────────── */}
      {toolMode === "draw" && (
        <div className="space-y-3 pt-1">
          <div>
            <span className="text-[13px] text-white/30 font-medium block mb-1.5">브러시</span>
            <div className="flex gap-1.5">
              {DRAW_SUB_TOOLS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setDrawSub(sub.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl border transition-all",
                    drawSub === sub.id
                      ? "border-primary/40 bg-primary/[0.06] text-primary"
                      : "border-white/[0.04] text-white/30 hover:text-white/50"
                  )}
                >
                  <sub.icon className="w-5 h-5" />
                  <span className="text-[13px]">{sub.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Line sub-tools ────────────────────────────────── */}
      {toolMode === "line" && (
        <div className="space-y-3 pt-1">
          <div>
            <span className="text-[13px] text-white/30 font-medium block mb-1.5">선 종류</span>
            <div className="flex gap-1.5">
              {LINE_SUB_TOOLS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setLineSub(sub.id)}
                  className={cn(
                    "flex-1 px-2 py-2 rounded-xl border text-center transition-all",
                    lineSub === sub.id
                      ? "border-primary/40 bg-primary/[0.06] text-primary"
                      : "border-white/[0.04] text-white/30 hover:text-white/50"
                  )}
                >
                  <span className="text-[13px]">{sub.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Common: Color, Size, Opacity ──────────────────── */}
      {(toolMode === "draw" || toolMode === "line" || toolMode === "eraser") && (
        <div className="space-y-3">
          {/* Color */}
          {toolMode !== "eraser" && (
            <div>
              <span className="text-[13px] text-white/30 font-medium block mb-1.5">색상</span>
              <div className="flex gap-1 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-6 h-6 rounded-md border-2 transition-all",
                      color === c
                        ? "border-primary ring-1 ring-primary/30 scale-110"
                        : "border-white/10 hover:border-white/20"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-6 rounded cursor-pointer border border-white/10"
                />
                <span className="text-[13px] text-white/30 font-mono">{color}</span>
              </div>
            </div>
          )}

          {/* Size */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px] text-white/30 font-medium">굵기</span>
              <span className="text-[13px] text-white/20">{size}px</span>
            </div>
            <div className="flex gap-1.5 mb-2">
              {SIZE_PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center transition-all",
                    size === s
                      ? "border-primary/40 bg-primary/[0.06]"
                      : "border-white/[0.04] hover:border-white/10"
                  )}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: Math.min(s + 2, 16),
                      height: Math.min(s + 2, 16),
                      backgroundColor: toolMode === "eraser" ? "white" : color,
                    }}
                  />
                </button>
              ))}
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary h-1"
            />
          </div>

          {/* Opacity */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px] text-white/30 font-medium">투명도</span>
              <span className="text-[13px] text-white/20">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              className="w-full accent-primary h-1"
            />
          </div>
        </div>
      )}

      {/* ── Shape grid (accessible from any mode) ─────────── */}
      <div className="pt-1 border-t border-white/[0.04]">
        <span className="text-[13px] text-white/30 font-medium block mb-1.5">도형 추가</span>
        <div className="grid grid-cols-3 gap-1.5">
          {SHAPE_TOOLS.map((shape) => (
            <button
              key={shape.id}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-white/[0.04] text-white/30 hover:text-white/60 hover:border-white/10 hover:bg-white/[0.02] transition-all"
              title={shape.label}
            >
              <shape.icon className="w-5 h-5" />
              <span className="text-[13px]">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
