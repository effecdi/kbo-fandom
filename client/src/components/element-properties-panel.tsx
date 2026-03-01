import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  FlipHorizontal2,
  Wand2,
  Loader2,
  Crown,
  MousePointer2,
} from "lucide-react";
import type { SpeechBubble, BubbleStyle, TailStyle } from "@/lib/bubble-types";
import type { CanvasTextElement, CanvasLineElement, LineType } from "@/components/canvas-context-toolbar";
import {
  TAIL_LABELS,
  BUBBLE_CATEGORIES,
  ALL_STYLE_LABELS,
} from "@/lib/bubble-utils";

interface CharacterPlacement {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  scale?: number;
  width?: number;
  height?: number;
  rotation?: number;
  flipX?: boolean;
  imageEl?: HTMLImageElement | null;
  imgElement?: HTMLImageElement | null;
  zIndex?: number;
  locked?: boolean;
}

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

interface ElementPropertiesPanelProps {
  selectedBubble: SpeechBubble | null;
  selectedChar: CharacterPlacement | null;
  selectedText: CanvasTextElement | null;
  selectedLine: CanvasLineElement | null;
  onUpdateBubble: (id: string, updates: Partial<SpeechBubble>) => void;
  onUpdateChar?: (id: string, updates: Partial<CharacterPlacement>) => void;
  onUpdateText?: (id: string, updates: Partial<CanvasTextElement>) => void;
  onUpdateLine?: (id: string, updates: Partial<CanvasLineElement>) => void;
  onDeleteChar?: (id: string) => void;
  onDeleteBubble?: (id: string) => void;
  onFlipTailHorizontally?: () => void;
  onRemoveBackground?: () => void;
  removingBg?: boolean;
  isPro?: boolean;
}

export function ElementPropertiesPanel({
  selectedBubble,
  selectedChar,
  selectedText,
  selectedLine,
  onUpdateBubble,
  onUpdateChar,
  onUpdateText,
  onUpdateLine,
  onDeleteChar,
  onDeleteBubble,
  onFlipTailHorizontally,
  onRemoveBackground,
  removingBg = false,
  isPro = false,
}: ElementPropertiesPanelProps) {
  // No selection
  if (!selectedBubble && !selectedChar && !selectedText && !selectedLine) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <MousePointer2 className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-xs text-muted-foreground">
          요소를 선택하세요
        </p>
      </div>
    );
  }

  // ─── Character selected ────────────────────────────────
  if (selectedChar && !selectedBubble) {
    const charScale = selectedChar.scale ?? 1;
    const naturalW = selectedChar.imageEl?.naturalWidth ?? selectedChar.imgElement?.naturalWidth ?? 200;
    const naturalH = selectedChar.imageEl?.naturalHeight ?? selectedChar.imgElement?.naturalHeight ?? 200;
    const currentW = Math.round(naturalW * charScale);
    const currentH = Math.round(naturalH * charScale);
    const scalePercent = Math.round(charScale * 100);

    return (
      <div className="p-3 space-y-3 overflow-y-auto h-full">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">캐릭터</p>

        {/* Position */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "X", value: Math.round(selectedChar.x), key: "x" },
            { label: "Y", value: Math.round(selectedChar.y), key: "y" },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground w-4 shrink-0">{label}</span>
              <Input
                type="number"
                value={value}
                onChange={(e) => onUpdateChar?.(selectedChar.id, { [key]: Number(e.target.value) })}
                className="h-7 text-[11px] bg-card border-border"
              />
            </div>
          ))}
        </div>

        {/* Size via scale */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground w-4 shrink-0">W</span>
            <Input
              type="number"
              value={currentW}
              onChange={(e) => {
                const newW = Number(e.target.value);
                if (newW > 0 && naturalW > 0) {
                  onUpdateChar?.(selectedChar.id, { scale: newW / naturalW });
                }
              }}
              className="h-7 text-[11px] bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground w-4 shrink-0">H</span>
            <Input
              type="number"
              value={currentH}
              onChange={(e) => {
                const newH = Number(e.target.value);
                if (newH > 0 && naturalH > 0) {
                  onUpdateChar?.(selectedChar.id, { scale: newH / naturalH });
                }
              }}
              className="h-7 text-[11px] bg-card border-border"
            />
          </div>
        </div>

        {/* Scale slider */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] text-muted-foreground">크기</span>
            <span className="text-[11px] text-muted-foreground tabular-nums">{scalePercent}%</span>
          </div>
          <Slider
            value={[charScale * 100]}
            onValueChange={([v]) => onUpdateChar?.(selectedChar.id, { scale: v / 100 })}
            min={5} max={500} step={5}
          />
        </div>

        {/* Fixed-size buttons */}
        <div className="flex gap-1">
          {[50, 75, 100, 150, 200].map(pct => (
            <Button
              key={pct}
              variant={scalePercent === pct ? "default" : "outline"}
              size="sm"
              className="flex-1 h-7 text-[11px] px-0"
              onClick={() => onUpdateChar?.(selectedChar.id, { scale: pct / 100 })}
            >
              {pct}%
            </Button>
          ))}
        </div>

        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 h-7 text-[11px]"
            onClick={() => onUpdateChar?.(selectedChar.id, { flipX: !selectedChar.flipX })}
          >
            <FlipHorizontal2 className="h-3 w-3" />
            좌우 반전
          </Button>
        </div>

        {onRemoveBackground && (
          <Button
            variant={isPro ? "default" : "outline"}
            size="sm"
            className="w-full gap-1 h-7 text-[11px]"
            onClick={onRemoveBackground}
            disabled={removingBg || !isPro}
          >
            {removingBg ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="h-3 w-3" />
            )}
            AI 배경제거
            {!isPro && <Crown className="h-2.5 w-2.5 text-yellow-500" />}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-500 h-7 text-[11px]"
          onClick={() => onDeleteChar?.(selectedChar.id)}
        >
          <Trash2 className="mr-1.5 h-3 w-3" /> 삭제
        </Button>
      </div>
    );
  }

  // ─── Text element selected ─────────────────────────────
  if (selectedText) {
    return (
      <div className="p-3 space-y-3 overflow-y-auto h-full">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">텍스트</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "X", value: Math.round(selectedText.x), key: "x" },
            { label: "Y", value: Math.round(selectedText.y), key: "y" },
            { label: "W", value: Math.round(selectedText.width), key: "width" },
            { label: "H", value: Math.round(selectedText.height), key: "height" },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground w-4 shrink-0">{label}</span>
              <Input
                type="number"
                value={value}
                onChange={(e) => onUpdateText?.(selectedText.id, { [key]: Number(e.target.value) })}
                className="h-7 text-[11px] bg-card border-border"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Line element selected ─────────────────────────────
  if (selectedLine) {
    return (
      <div className="p-3 space-y-3 overflow-y-auto h-full">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">선</p>
        <p className="text-xs text-muted-foreground">
          {selectedLine.lineType === "straight" ? "직선" : selectedLine.lineType === "curved" ? "곡선" : "꺾인선"}
        </p>
      </div>
    );
  }

  // ─── Bubble selected ───────────────────────────────────
  if (!selectedBubble) return null;

  const updateBubble = (updates: Partial<SpeechBubble>) => {
    onUpdateBubble(selectedBubble.id, updates);
  };

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full">
      {/* Transform */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">변환</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "X", value: Math.round(selectedBubble.x), key: "x" },
            { label: "Y", value: Math.round(selectedBubble.y), key: "y" },
            { label: "W", value: Math.round(selectedBubble.width), key: "width" },
            { label: "H", value: Math.round(selectedBubble.height), key: "height" },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground w-4 shrink-0">{label}</span>
              <Input
                type="number"
                value={value}
                onChange={(e) => updateBubble({ [key]: Number(e.target.value) })}
                className="h-7 text-[11px] bg-card border-border"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Text hint */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">텍스트</p>
        <p className="text-[11px] text-muted-foreground/70 italic">
          캔버스에서 더블클릭하여 텍스트 편집
        </p>
      </div>

      {/* Style */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">말풍선 형태</p>
        {BUBBLE_CATEGORIES.map((cat) => (
          <div key={cat.label} className="mb-1.5">
            <span className="text-[10px] text-muted-foreground/70 font-medium">{cat.label}</span>
            <div className="flex gap-1 mt-0.5 overflow-x-auto scrollbar-hide pb-0.5">
              {cat.styles.map((k) => (
                <button
                  key={k}
                  onClick={() => updateBubble({ style: k as BubbleStyle, seed: Math.floor(Math.random() * 1000000) })}
                  className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedBubble.style === k
                      ? "bg-primary/12 text-primary font-medium"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                  }`}
                >{ALL_STYLE_LABELS[k] || k}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Wobble slider for applicable styles */}
      {(["handwritten", "wobbly", "wavy"] as BubbleStyle[]).includes(selectedBubble.style) && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-14 shrink-0">흔들림 {selectedBubble.wobble ?? 5}</span>
          <Slider value={[selectedBubble.wobble ?? 5]} onValueChange={([v]) => updateBubble({ wobble: v })} min={0} max={20} step={0.5} className="flex-1" />
        </div>
      )}

      {/* Style-specific settings */}
      {selectedBubble.style === "polygon" && (
        <StyleSettings
          title="다각형 설정"
          items={[
            { label: "변 수", key: "shapeSides", min: 3, max: 12, step: 1, def: 6 },
            { label: "모서리", key: "shapeCornerRadius", min: 0, max: 40, step: 1, def: 8 },
            { label: "흔들림", key: "shapeWobble", min: 0, max: 20, step: 0.5, def: 0 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style === "spiky" && (
        <StyleSettings
          title="뾰족한 설정"
          items={[
            { label: "가시 수", key: "shapeSpikeCount", min: 4, max: 30, step: 1, def: 12 },
            { label: "가시 길이", key: "shapeSpikeHeight", min: 5, max: 60, step: 1, def: 20 },
            { label: "날카로움", key: "shapeSpikeSharpness", min: 0.1, max: 1, step: 0.05, def: 0.7 },
            { label: "흔들림", key: "shapeWobble", min: 0, max: 20, step: 0.5, def: 0 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style === "cloud" && (
        <StyleSettings
          title="구름 설정"
          items={[
            { label: "구름 수", key: "shapeBumpCount", min: 4, max: 16, step: 1, def: 8 },
            { label: "크기", key: "shapeBumpSize", min: 5, max: 40, step: 1, def: 15 },
            { label: "둥글기", key: "shapeBumpRoundness", min: 0.1, max: 1.5, step: 0.05, def: 0.8 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style === "shout" && (
        <StyleSettings
          title="외침 설정"
          items={[
            { label: "가시 수", key: "shapeSpikeCount", min: 4, max: 32, step: 1, def: 12 },
            { label: "가시 높이", key: "shapeWobble", min: 0.02, max: 0.8, step: 0.01, def: 0.25 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style.startsWith("flash_") && (
        <StyleSettings
          title="효과 설정"
          items={[
            { label: "선 간격", key: "flashLineSpacing", min: 0.05, max: 1, step: 0.05, def: 0.3 },
            { label: "선 두께", key: "flashLineThickness", min: 0.1, max: 4, step: 0.1, def: 0.8 },
            { label: "선 길이", key: "flashLineLength", min: 5, max: 100, step: 1, def: 30 },
            { label: "선 개수", key: "flashLineCount", min: 8, max: 60, step: 1, def: 24 },
            { label: "내부크기", key: "flashInnerRadius", min: 0.2, max: 0.9, step: 0.05, def: 0.65 },
            ...(selectedBubble.style === "flash_black"
              ? [
                  { label: "돌기 수", key: "flashBumpCount", min: 6, max: 60, step: 1, def: 24 },
                  { label: "돌기 높이", key: "flashBumpHeight", min: 1, max: 30, step: 1, def: 10 },
                ]
              : []),
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        >
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-muted-foreground flex-1">내부 채우기</span>
            <button
              onClick={() => updateBubble({ flashFilled: !(selectedBubble.flashFilled ?? true) })}
              className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${
                (selectedBubble.flashFilled ?? true)
                  ? "bg-primary/12 text-primary font-medium"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {(selectedBubble.flashFilled ?? true) ? "채움" : "비움"}
            </button>
          </div>
        </StyleSettings>
      )}

      {selectedBubble.style === "dashed" && (
        <StyleSettings
          title="귓속말 설정"
          items={[
            { label: "점선 길이", key: "flashLineLength", min: 2, max: 30, step: 1, def: 12 },
            { label: "점선 간격", key: "flashLineSpacing", min: 0.1, max: 3, step: 0.1, def: 1.0 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style === "brush" && (
        <StyleSettings
          title="위엄 먹선 설정"
          items={[
            { label: "굵기 배율", key: "flashLineThickness", min: 0.5, max: 6, step: 0.1, def: 2.5 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style === "drip" && (
        <StyleSettings
          title="흐물 설정"
          items={[
            { label: "흐물 길이", key: "wobble", min: 0, max: 20, step: 0.5, def: 5 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style === "sparkle_ring" && (
        <StyleSettings
          title="신비 설정"
          items={[
            { label: "바늘 수", key: "flashLineCount", min: 12, max: 120, step: 1, def: 48 },
            { label: "바늘 길이", key: "flashLineLength", min: 2, max: 40, step: 1, def: 12 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style === "embarrassed" && (
        <StyleSettings
          title="난처 설정"
          items={[
            { label: "흔들림", key: "wobble", min: 0, max: 12, step: 0.5, def: 4 },
            { label: "선 갯수", key: "flashLineCount", min: 1, max: 12, step: 1, def: 5 },
            { label: "선 길이", key: "flashLineLength", min: 5, max: 50, step: 1, def: 18 },
            { label: "선 굵기", key: "flashLineThickness", min: 0.5, max: 6, step: 0.5, def: 2 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {selectedBubble.style === "tall_rough" && (
        <StyleSettings
          title="거친 직사각형 설정"
          items={[
            { label: "뾰족 수", key: "shapeSpikeCount", min: 0, max: 16, step: 1, def: 0 },
            { label: "뾰족 높이", key: "shapeSpikeHeight", min: 0, max: 60, step: 2, def: 0 },
            { label: "흔들림", key: "shapeWobble", min: 0.1, max: 5, step: 0.1, def: 1 },
          ]}
          bubble={selectedBubble}
          onUpdate={updateBubble}
        />
      )}

      {/* Tail */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">말꼬리</p>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {(Object.entries(TAIL_LABELS) as [string, string][]).map(([k, l]) => (
            <button
              key={k}
              onClick={() => updateBubble({
                tailStyle: k as TailStyle,
                tailTipX: undefined, tailTipY: undefined,
                tailCtrl1X: undefined, tailCtrl1Y: undefined,
                tailCtrl2X: undefined, tailCtrl2Y: undefined,
              })}
              className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedBubble.tailStyle === k
                  ? "bg-primary/12 text-primary font-medium"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >{l}</button>
          ))}
        </div>
      </div>

      {selectedBubble.tailStyle !== "none" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">방향</span>
              <Select
                value={selectedBubble.tailDirection}
                onValueChange={(v: any) => updateBubble({
                  tailDirection: v,
                  tailTipX: undefined, tailTipY: undefined,
                  tailCtrl1X: undefined, tailCtrl1Y: undefined,
                  tailCtrl2X: undefined, tailCtrl2Y: undefined,
                })}
              >
                <SelectTrigger className="h-7 text-[11px] bg-card border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom">아래</SelectItem>
                  <SelectItem value="top">위</SelectItem>
                  <SelectItem value="left">왼쪽</SelectItem>
                  <SelectItem value="right">오른쪽</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onFlipTailHorizontally}
                className="w-full h-7 text-[11px]"
              >
                좌우 반전
              </Button>
            </div>
          </div>

          {(selectedBubble.tailStyle === "long" || selectedBubble.tailStyle === "short") && (
            <StyleSettings
              title="꼬리 세부 조정"
              items={[
                { label: "밑넓이", key: "tailBaseSpread", min: 1, max: 60, step: 1, def: 8 },
                { label: "곡선", key: "tailCurve", min: 0, max: 1, step: 0.05, def: 0.5 },
                { label: "흔들림", key: "tailJitter", min: 0, max: 5, step: 0.1, def: 1 },
                { label: "끝 타원", key: "tailRoundness", min: 0, max: 25, step: 1, def: 0 },
              ]}
              bubble={selectedBubble}
              onUpdate={updateBubble}
            />
          )}

          {selectedBubble.tailStyle.startsWith("dots_") && (
            <StyleSettings
              title="점점점 꼬리 조정"
              items={[
                { label: "점 크기", key: "dotsScale", min: 0.3, max: 2.5, step: 0.1, def: 1 },
                { label: "점 간격", key: "dotsSpacing", min: 0.5, max: 3.0, step: 0.1, def: 1 },
                { label: "흔들림", key: "tailJitter", min: 0, max: 5, step: 0.1, def: 1 },
              ]}
              bubble={selectedBubble}
              onUpdate={updateBubble}
            />
          )}
        </div>
      )}

      {/* Stroke width */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] text-muted-foreground">테두리 두께</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{selectedBubble.strokeWidth}px</span>
        </div>
        <Slider value={[selectedBubble.strokeWidth]} onValueChange={([v]) => updateBubble({ strokeWidth: v })} min={1} max={8} step={0.5} />
      </div>

      {/* Colors */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">색상</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {BUBBLE_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.label}
              title={preset.label}
              onClick={() => updateBubble({ fillColor: preset.fill, strokeColor: preset.stroke })}
              className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                selectedBubble.fillColor === preset.fill ? "border-foreground scale-110" : "border-border"
              }`}
              style={{
                background: preset.fill === "transparent"
                  ? "linear-gradient(135deg, #ccc 25%, transparent 25%, transparent 50%, #ccc 50%, #ccc 75%, transparent 75%)"
                  : preset.fill,
                backgroundSize: preset.fill === "transparent" ? "6px 6px" : undefined,
              }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <span className="text-[11px] text-muted-foreground block mb-1">채우기</span>
            <input
              type="color"
              value={selectedBubble.fillColor && selectedBubble.fillColor !== "transparent" ? selectedBubble.fillColor : "#ffffff"}
              onChange={(e) => updateBubble({ fillColor: e.target.value })}
              className="w-full h-7 rounded cursor-pointer border border-border"
            />
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block mb-1">테두리</span>
            <input
              type="color"
              value={selectedBubble.strokeColor || "#222222"}
              onChange={(e) => updateBubble({ strokeColor: e.target.value })}
              className="w-full h-7 rounded cursor-pointer border border-border"
            />
          </div>
        </div>
      </div>

      {/* Draw mode */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">그리기 모드</p>
        <div className="flex gap-1 flex-wrap">
          {(["both", "fill_only", "stroke_only"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => updateBubble({ drawMode: mode })}
              className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${
                (selectedBubble.drawMode ?? "both") === mode
                  ? "bg-primary/12 text-primary font-medium"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {mode === "both" ? "채움+테두리" : mode === "fill_only" ? "채움만" : "테두리만"}
            </button>
          ))}
        </div>
      </div>

      {/* Fill opacity */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] text-muted-foreground">채우기 투명도</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {Math.round((selectedBubble.fillOpacity ?? 1) * 100)}%
          </span>
        </div>
        <Slider
          value={[(selectedBubble.fillOpacity ?? 1) * 100]}
          onValueChange={([v]) => updateBubble({ fillOpacity: v / 100 })}
          min={0} max={100} step={5}
        />
      </div>

      {/* Delete button */}
      {onDeleteBubble && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-500 h-7 text-[11px]"
          onClick={() => onDeleteBubble(selectedBubble.id)}
        >
          <Trash2 className="mr-1.5 h-3 w-3" /> 삭제
        </Button>
      )}
    </div>
  );
}

// ─── Reusable style settings sub-component ─────────────
interface StyleSettingsItem {
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  def: number;
}

function StyleSettings({
  title,
  items,
  bubble,
  onUpdate,
  children,
}: {
  title: string;
  items: StyleSettingsItem[];
  bubble: SpeechBubble;
  onUpdate: (updates: Partial<SpeechBubble>) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 rounded-md bg-muted/30 p-2">
      <p className="text-[11px] font-semibold text-muted-foreground">{title}</p>
      {items.map(({ label, key, min, max, step, def }) => {
        const val = (bubble as any)[key] ?? def;
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground w-14 shrink-0">
              {label} {step < 1 ? val.toFixed(step < 0.1 ? 2 : 1) : val}
            </span>
            <Slider
              value={[val]}
              onValueChange={([v]) => onUpdate({ [key]: v } as any)}
              min={min} max={max} step={step}
              className="flex-1"
            />
          </div>
        );
      })}
      {children}
    </div>
  );
}
