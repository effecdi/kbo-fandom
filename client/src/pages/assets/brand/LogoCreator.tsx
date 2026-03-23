import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import {
  ArrowLeft,
  Upload,
  Image,
  Check,
  Sun,
  Moon,
  Pen,
  Undo2,
  Trash2,
  Sparkles,
  Loader2,
  RefreshCw,
  Minus,
  Plus,
  Eraser,
  Circle,
  Type,
} from "lucide-react";
import { addItem, generateId, STORE_KEYS } from "@/lib/local-store";
import type { BrandAsset } from "./shared";
import { today } from "./shared";

// ─── Types ──────────────────────────────────────────────────────────────────

type InputMode = "upload" | "draw";
type DrawTool = "pen" | "eraser" | "text";

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: "pen" | "eraser";
}

interface TextItem {
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const PURPOSE_TAGS = ["웹", "인쇄", "SNS", "프레젠테이션", "명함", "굿즈"];

const PEN_COLORS = [
  "#ffffff",
  "#000000",
  "#00e5cc",
  "#0ea5e9",
  "#a855f7",
  "#ef4444",
  "#f59e0b",
  "#22c55e",
];

const BRUSH_SIZES = [2, 4, 6, 10, 16];
const TEXT_SIZES = [16, 24, 32, 48, 64];

const LOGO_STYLES = [
  { id: "minimal", label: "미니멀" },
  { id: "geometric", label: "기하학적" },
  { id: "mascot", label: "마스코트형" },
  { id: "wordmark", label: "워드마크" },
  { id: "emblem", label: "엠블럼" },
  { id: "abstract", label: "추상적" },
  { id: "symbol_simple", label: "심볼형(단순)" },
  { id: "symbol_refined", label: "심볼형(세련된)" },
  { id: "line_art", label: "라인형" },
  { id: "colorful", label: "컬러형" },
  { id: "cute_character", label: "귀여운 캐릭터형" },
  { id: "flat", label: "플랫 디자인" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function LogoCreatorPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Common state
  const [mode, setMode] = useState<InputMode>("draw");
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [darkPreview, setDarkPreview] = useState(true);

  // Draw state
  const [tool, setTool] = useState<DrawTool>("pen");
  const [penColor, setPenColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Text state
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [textFontSize, setTextFontSize] = useState(32);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // AI generation state — 4 parallel results
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiResults, setAiResults] = useState<(string | null)[]>([null, null, null, null]);
  const [aiLoading, setAiLoading] = useState<boolean[]>([false, false, false, false]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [usedStyles, setUsedStyles] = useState<typeof LOGO_STYLES>([]);

  // ─── Canvas setup ───────────────────────────────────────────────────────
  const getCanvasSize = useCallback(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth;
      return { w, h: Math.round(w * 0.75) };
    }
    return { w: 600, h: 450 };
  }, []);

  const redrawCanvas = useCallback(
    (strokesToDraw: Stroke[], active?: Stroke | null, texts?: TextItem[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;

      // Clear with dark bg
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, w, canvas.height / dpr);

      const draw = (s: Stroke) => {
        if (s.points.length < 2) return;
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (s.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0,0,0,1)";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = s.color;
        }
        ctx.lineWidth = s.width;

        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (let i = 1; i < s.points.length; i++) {
          const prev = s.points[i - 1];
          const curr = s.points[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      };

      strokesToDraw.forEach(draw);
      if (active) draw(active);

      // Draw text items
      const allTexts = texts || textItems;
      allTexts.forEach((t) => {
        ctx.globalCompositeOperation = "source-over";
        ctx.font = `bold ${t.fontSize}px "Pretendard", "Inter", sans-serif`;
        ctx.fillStyle = t.color;
        ctx.textBaseline = "top";
        ctx.fillText(t.text, t.x, t.y);
      });
    },
    [textItems]
  );

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = getCanvasSize();

    // HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    redrawCanvas(strokes);
  }, [mode, getCanvasSize, redrawCanvas, strokes]);

  // ─── Drawing handlers ──────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);

    // Text tool: place text input at click position
    if (tool === "text") {
      setTextPos(pos);
      setTextInput("");
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    const newStroke: Stroke = {
      points: [pos],
      color: tool === "eraser" ? "#000" : penColor,
      width: tool === "eraser" ? brushSize * 3 : brushSize,
      tool,
    };
    setCurrentStroke(newStroke);
    setIsDrawing(true);
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();
    const pos = getPos(e);
    const updated = {
      ...currentStroke,
      points: [...currentStroke.points, pos],
    };
    setCurrentStroke(updated);
    redrawCanvas(strokes, updated);
  };

  const resetAiResults = () => {
    setAiResults([null, null, null, null]);
    setAiLoading([false, false, false, false]);
    setSelectedIdx(null);
    setUsedStyles([]);
  };

  const confirmText = () => {
    if (!textPos || !textInput.trim()) {
      setTextPos(null);
      setTextInput("");
      return;
    }
    const newText: TextItem = {
      text: textInput.trim(),
      x: textPos.x,
      y: textPos.y,
      color: penColor,
      fontSize: textFontSize,
    };
    setTextItems((prev) => [...prev, newText]);
    setTextPos(null);
    setTextInput("");
    resetAiResults();
  };

  const endDraw = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    if (currentStroke.points.length >= 2) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    resetAiResults();
  };

  const undo = () => {
    // Undo text first, then strokes
    if (textItems.length > 0) {
      setTextItems((prev) => prev.slice(0, -1));
    } else {
      setStrokes((prev) => prev.slice(0, -1));
    }
    resetAiResults();
  };

  const clearCanvas = () => {
    setStrokes([]);
    setTextItems([]);
    setTextPos(null);
    resetAiResults();
    redrawCanvas([], null, []);
  };

  // Redraw when strokes or text change
  useEffect(() => {
    redrawCanvas(strokes, null, textItems);
  }, [strokes, textItems, redrawCanvas]);

  // ─── AI Generation ─────────────────────────────────────────────────────
  const getCanvasDataUrl = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  };

  const pick4Styles = () => {
    // Shuffle and pick 4 styles
    const shuffled = [...LOGO_STYLES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  const generateFromSketch = async () => {
    if (strokes.length === 0 && textItems.length === 0) return;
    const sketchData = getCanvasDataUrl();
    if (!sketchData) return;

    const styles = pick4Styles();
    setUsedStyles(styles);
    setGenerating(true);
    setAiResults([null, null, null, null]);
    setAiLoading([true, true, true, true]);
    setSelectedIdx(null);
    setPreview(null);

    // Fire 4 parallel requests
    const promises = styles.map(async (style, idx) => {
      const promptText = [
        `${style.label} 스타일의 프로페셔널한 브랜드 로고를 만들어주세요.`,
        aiPrompt || "",
        name ? `브랜드명: ${name}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      try {
        const res = await fetch("/api/generate-logo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: promptText,
            style: style.id,
            sourceImageData: sketchData,
            source: "business",
          }),
        });

        if (!res.ok) throw new Error("Generation failed");
        const data = await res.json();
        const url = data.imageUrl || null;

        setAiResults((prev) => {
          const next = [...prev];
          next[idx] = url;
          return next;
        });
      } catch {
        // Leave as null
      } finally {
        setAiLoading((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });
      }
    });

    await Promise.allSettled(promises);
    setGenerating(false);
  };

  const selectResult = (idx: number) => {
    if (!aiResults[idx]) return;
    setSelectedIdx(idx);
    setPreview(aiResults[idx]);
  };

  // ─── File upload ───────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // ─── Save ──────────────────────────────────────────────────────────────
  const save = () => {
    const n = name.trim() || "새 로고";
    addItem<BrandAsset>(STORE_KEYS.BRAND_ASSETS, {
      id: generateId("ba"),
      name: n,
      type: "logo",
      status: "draft",
      version: "1.0",
      downloads: 0,
      updatedAt: today(),
      imageUrl: preview || undefined,
      description: memo,
      tags: selectedTags,
    });
    navigate("/assets/brand");
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link
          to="/assets/brand"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          브랜드 자산
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
              <Image className="w-5 h-5 text-amber-400" />
            </div>
            로고 만들기
          </h1>
          <p className="text-sm text-white/40 mt-2">
            스케치를 그리면 AI가 프로 로고로 변환하거나, 파일을 직접 업로드하세요
          </p>
        </div>

        {/* ═══ Mode Switch ═══ */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-8 w-fit">
          <button
            onClick={() => setMode("draw")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === "draw"
                ? "bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black shadow-lg"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Pen className="w-4 h-4" />
            스케치 → AI 로고
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === "upload"
                ? "bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black shadow-lg"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Upload className="w-4 h-4" />
            파일 업로드
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            DRAW MODE
        ═══════════════════════════════════════════════════════════════════ */}
        {mode === "draw" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            {/* Canvas area — 3col */}
            <div className="lg:col-span-3 space-y-4">
              {/* Toolbar */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Tool selection */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <button
                    onClick={() => { setTool("pen"); setTextPos(null); }}
                    className={`p-2 rounded-md transition-all ${
                      tool === "pen"
                        ? "bg-[#00e5cc]/15 text-[#00e5cc]"
                        : "text-white/30 hover:text-white/60"
                    }`}
                    title="펜"
                  >
                    <Pen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setTool("eraser"); setTextPos(null); }}
                    className={`p-2 rounded-md transition-all ${
                      tool === "eraser"
                        ? "bg-[#00e5cc]/15 text-[#00e5cc]"
                        : "text-white/30 hover:text-white/60"
                    }`}
                    title="지우개"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setTool("text"); }}
                    className={`p-2 rounded-md transition-all ${
                      tool === "text"
                        ? "bg-[#00e5cc]/15 text-[#00e5cc]"
                        : "text-white/30 hover:text-white/60"
                    }`}
                    title="텍스트"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                </div>

                {/* Colors */}
                {(tool === "pen" || tool === "text") && (
                  <div className="flex items-center gap-1.5">
                    {PEN_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setPenColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          penColor === c
                            ? "border-[#00e5cc] scale-110"
                            : "border-white/[0.08] hover:border-white/[0.2]"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}

                {/* Brush size / Text size */}
                {tool === "text" ? (
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    {TEXT_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setTextFontSize(s)}
                        className={`px-2 py-1 rounded-md text-xs font-mono transition-all ${
                          textFontSize === s
                            ? "bg-[#00e5cc]/15 text-[#00e5cc]"
                            : "text-white/30 hover:text-white/60"
                        }`}
                        title={`${s}px`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : tool !== "text" && (
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    {BRUSH_SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setBrushSize(s)}
                        className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                          brushSize === s
                            ? "bg-[#00e5cc]/15 text-[#00e5cc]"
                            : "text-white/30 hover:text-white/60"
                        }`}
                        title={`${s}px`}
                      >
                        <Circle
                          className="fill-current"
                          style={{
                            width: Math.max(6, s + 4),
                            height: Math.max(6, s + 4),
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1" />

                {/* Undo / Clear */}
                <button
                  onClick={undo}
                  disabled={strokes.length === 0 && textItems.length === 0}
                  className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  title="되돌리기"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={clearCanvas}
                  disabled={strokes.length === 0 && textItems.length === 0}
                  className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  title="전체 지우기"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Canvas */}
              <div
                ref={containerRef}
                className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#111111] relative"
              >
                <canvas
                  ref={canvasRef}
                  className={`w-full touch-none ${tool === "text" ? "cursor-text" : "cursor-crosshair"}`}
                  onMouseDown={startDraw}
                  onMouseMove={moveDraw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={moveDraw}
                  onTouchEnd={endDraw}
                />
                {strokes.length === 0 && textItems.length === 0 && !isDrawing && !textPos && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center space-y-2">
                      <Pen className="w-8 h-8 text-white/[0.08] mx-auto" />
                      <p className="text-sm text-white/15">여기에 로고를 그리거나 텍스트를 입력하세요</p>
                      <p className="text-xs text-white/10">AI가 프로 로고로 변환해줍니다</p>
                    </div>
                  </div>
                )}

                {/* Text input overlay */}
                {textPos && (
                  <div
                    className="absolute"
                    style={{ left: textPos.x, top: textPos.y }}
                  >
                    <input
                      ref={textInputRef}
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmText();
                        if (e.key === "Escape") { setTextPos(null); setTextInput(""); }
                      }}
                      onBlur={confirmText}
                      placeholder="텍스트 입력..."
                      className="bg-transparent border-b-2 border-[#00e5cc] outline-none text-white px-1 min-w-[120px]"
                      style={{
                        fontSize: textFontSize,
                        fontWeight: "bold",
                        color: penColor,
                        fontFamily: '"Pretendard", "Inter", sans-serif',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* AI options below canvas */}
              <div className="space-y-4">
                {/* Additional prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">
                    추가 설명 <span className="text-white/30 font-normal">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="예: 파란색 톤, 둥근 느낌, 테크 브랜드"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors"
                  />
                </div>

                {/* Generate CTA */}
                <button
                  onClick={generateFromSketch}
                  disabled={generating || (strokes.length === 0 && textItems.length === 0)}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      4가지 스타일로 생성 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI로 4가지 스타일 생성
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results — 2col */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white/70">AI 결과</label>
                  {aiResults.some(Boolean) && (
                    <button
                      onClick={generateFromSketch}
                      disabled={generating}
                      className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors disabled:opacity-30"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
                      재생성
                    </button>
                  )}
                </div>

                {/* 2×2 Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => selectResult(idx)}
                      disabled={!aiResults[idx]}
                      className={`relative rounded-2xl border overflow-hidden aspect-square flex items-center justify-center transition-all duration-300 ${
                        selectedIdx === idx
                          ? "border-[#00e5cc] shadow-[0_0_20px_rgba(0,229,204,0.2)] ring-2 ring-[#00e5cc]/30"
                          : aiResults[idx]
                            ? "border-white/[0.08] hover:border-[#00e5cc]/30 hover:shadow-[0_0_15px_rgba(0,229,204,0.08)] cursor-pointer"
                            : "border-white/[0.06] bg-white/[0.02]"
                      }`}
                    >
                      {aiLoading[idx] ? (
                        <div className="text-center space-y-2">
                          <Loader2 className="w-6 h-6 text-[#00e5cc] animate-spin mx-auto" />
                          <p className="text-[10px] text-white/25">
                            {usedStyles[idx]?.label || "생성 중"}
                          </p>
                        </div>
                      ) : aiResults[idx] ? (
                        <>
                          <img
                            src={aiResults[idx]!}
                            alt={`Logo ${idx + 1}`}
                            className="w-full h-full object-contain p-3"
                          />
                          {/* Style label */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-[10px] font-semibold text-white/70 text-center">
                              {usedStyles[idx]?.label}
                            </p>
                          </div>
                          {/* Selected check */}
                          {selectedIdx === idx && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#00e5cc] flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-black" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center space-y-1.5">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto">
                            <Sparkles className="w-5 h-5 text-white/[0.06]" />
                          </div>
                          <p className="text-[10px] text-white/15">
                            {LOGO_STYLES[idx]?.label || "스타일"}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Selected preview with dark/light toggle */}
                {selectedIdx !== null && aiResults[selectedIdx] && (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                    <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/50">
                        선택: {usedStyles[selectedIdx]?.label}
                      </span>
                      <button
                        onClick={() => setDarkPreview(!darkPreview)}
                        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                      >
                        {darkPreview ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                        {darkPreview ? "밝은" : "어두운"}
                      </button>
                    </div>
                    <div
                      className={`p-6 flex items-center justify-center h-28 transition-colors ${
                        darkPreview ? "bg-[#0a0a0a]" : "bg-white"
                      }`}
                    >
                      <img
                        src={aiResults[selectedIdx]!}
                        alt="Selected logo"
                        className="max-h-20 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Hint */}
                {!aiResults.some(Boolean) && !generating && (
                  <div className="text-center py-4">
                    <p className="text-xs text-white/20">
                      왼쪽에서 스케치를 그린 후<br />"AI로 4가지 스타일 생성"을 누르세요
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            UPLOAD MODE
        ═══════════════════════════════════════════════════════════════════ */}
        {mode === "upload" && (
          <>
            {/* Upload area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="group rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#00e5cc]/30 bg-white/[0.02] p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center group-hover:bg-[#00e5cc]/10 transition-colors">
                <Upload className="w-7 h-7 text-white/20 group-hover:text-[#00e5cc] transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/60">
                  드래그 앤 드롭 또는 클릭하여 업로드
                </p>
                <p className="text-xs text-white/30 mt-1">PNG, SVG, JPG 지원</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* Upload preview */}
            {preview && mode === "upload" && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white/70">프리뷰</label>
                  <button
                    onClick={() => setDarkPreview(!darkPreview)}
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06]"
                  >
                    {darkPreview ? (
                      <Sun className="w-3.5 h-3.5" />
                    ) : (
                      <Moon className="w-3.5 h-3.5" />
                    )}
                    {darkPreview ? "밝은 배경" : "어두운 배경"}
                  </button>
                </div>
                <div
                  className={`rounded-2xl border border-white/[0.06] p-8 flex items-center justify-center min-h-[200px] transition-colors ${
                    darkPreview ? "bg-[#0a0a0a]" : "bg-white"
                  }`}
                >
                  <img
                    src={preview}
                    alt="Logo preview"
                    className="max-h-40 object-contain"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ Common form fields ═══ */}
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70">로고 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 메인 로고 (가로형)"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70">
              버전 메모 <span className="text-white/30 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 2026년 리뉴얼 버전"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/70">용도 태그</label>
            <div className="flex flex-wrap gap-2">
              {PURPOSE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-lg px-3 py-1.5 text-sm border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-[#00e5cc]/10 border-[#00e5cc]/30 text-[#00e5cc]"
                      : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/[0.12]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Save CTA ═══ */}
        <button
          onClick={save}
          disabled={!name.trim() || !preview}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          로고 저장
        </button>
      </div>
    </StudioLayout>
  );
}
