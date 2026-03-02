import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Layers,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  FlipHorizontal2,
  Pen,
  Minus,
  Type,
  Eraser,
  Square,
  Scan,
  Link,
  Unlink,
  Lock,
  LockOpen,
} from "lucide-react";
import { Spline, GitCommitHorizontal } from "lucide-react";
import { STYLE_LABELS } from "@/lib/bubble-utils";

export interface LayerItem {
  type: "char" | "bubble" | "drawing" | "text" | "line" | "shape";
  id: string;
  z: number;
  label: string;
  thumb?: string;
  drawingType?: string;
  visible?: boolean;
  locked?: boolean;
  maskEnabled?: boolean;
  clipMaskId?: string;
}

const DRAWING_TYPE_ICONS: Record<string, typeof Pen> = {
  drawing: Pen,
  straight: Minus,
  curve: Spline,
  polyline: GitCommitHorizontal,
  text: Type,
  eraser: Eraser,
};

function layerKey(item: LayerItem) {
  return `${item.type}:${item.id}`;
}

interface LayerListPanelProps {
  items: LayerItem[];
  selectedCharId: string | null;
  selectedBubbleId: string | null;
  selectedDrawingLayerId?: string | null;
  selectedTextId?: string | null;
  selectedLineId?: string | null;
  selectedShapeId?: string | null;
  onSelectChar: (id: string | null) => void;
  onSelectBubble: (id: string | null) => void;
  onSelectDrawingLayer?: (id: string | null) => void;
  onSelectText?: (id: string | null) => void;
  onSelectLine?: (id: string | null) => void;
  onSelectShape?: (id: string | null) => void;
  onMoveLayer: (index: number, direction: "up" | "down") => void;
  onDeleteLayer: (item: LayerItem) => void;
  onToggleVisibility?: (item: LayerItem) => void;
  onToggleLock?: (item: LayerItem) => void;
  onFlipChar?: (id: string) => void;
  onSetToolItem?: (tool: string) => void;
  onToggleMaskLink?: (layerId: string, layerType: string, maskId: string) => void;
}

export function LayerListPanel({
  items,
  selectedCharId,
  selectedBubbleId,
  selectedDrawingLayerId,
  selectedTextId,
  selectedLineId,
  selectedShapeId,
  onSelectChar,
  onSelectBubble,
  onSelectDrawingLayer,
  onSelectText,
  onSelectLine,
  onSelectShape,
  onMoveLayer,
  onDeleteLayer,
  onToggleVisibility,
  onToggleLock,
  onFlipChar,
  onSetToolItem,
  onToggleMaskLink,
}: LayerListPanelProps) {
  const maskShapes = items.filter(it => it.type === "shape" && it.maskEnabled);

  // Multi-selection state
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const lastClickIndexRef = useRef<number>(-1);

  const selectSingle = useCallback((item: LayerItem, index: number) => {
    setMultiSelected(new Set());
    lastClickIndexRef.current = index;

    onSelectChar(null);
    onSelectBubble(null);
    onSelectDrawingLayer?.(null);
    onSelectText?.(null);
    onSelectLine?.(null);
    onSelectShape?.(null);

    if (item.type === "char") {
      onSelectChar(item.id);
    } else if (item.type === "bubble") {
      onSelectBubble(item.id);
    } else if (item.type === "drawing") {
      onSelectDrawingLayer?.(item.id);
      onSetToolItem?.("select");
    } else if (item.type === "text") {
      onSelectText?.(item.id);
      onSetToolItem?.("select");
    } else if (item.type === "line") {
      onSelectLine?.(item.id);
      onSetToolItem?.("select");
    } else if (item.type === "shape") {
      onSelectShape?.(item.id);
      onSetToolItem?.("select");
    }
  }, [onSelectChar, onSelectBubble, onSelectDrawingLayer, onSelectText, onSelectLine, onSelectShape, onSetToolItem]);

  const selectRange = useCallback((toIndex: number) => {
    const fromIndex = lastClickIndexRef.current;
    if (fromIndex < 0) return;
    const lo = Math.min(fromIndex, toIndex);
    const hi = Math.max(fromIndex, toIndex);
    const newSet = new Set<string>();
    for (let j = lo; j <= hi; j++) {
      if (items[j]) newSet.add(layerKey(items[j]));
    }
    setMultiSelected(newSet);
  }, [items]);

  const handleClick = useCallback((item: LayerItem, index: number, e: React.MouseEvent) => {
    if (e.shiftKey && lastClickIndexRef.current >= 0) {
      e.preventDefault();
      selectRange(index);
    } else {
      selectSingle(item, index);
    }
  }, [selectSingle, selectRange]);

  const multiSelectedItems = items.filter(it => multiSelected.has(layerKey(it)));
  const hasMulti = multiSelectedItems.length > 1;

  const deleteMultiSelected = useCallback(() => {
    for (const it of multiSelectedItems) {
      onDeleteLayer(it);
    }
    setMultiSelected(new Set());
  }, [multiSelectedItems, onDeleteLayer]);

  const linkMultiToMask = useCallback((maskId: string) => {
    if (!onToggleMaskLink) return;
    for (const it of multiSelectedItems) {
      if (it.type === "shape" && it.maskEnabled) continue; // skip mask shapes
      onToggleMaskLink(it.id, it.type, maskId);
    }
  }, [multiSelectedItems, onToggleMaskLink]);

  return (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          레이어 ({items.length})
        </span>
      </div>

      {items.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-4">레이어가 없습니다</p>
      )}

      {/* Bulk action bar */}
      {hasMulti && (
        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md">
          <span className="text-[11px] text-primary font-medium flex-1">
            {multiSelectedItems.length}개 선택
          </span>
          {maskShapes.length > 0 && onToggleMaskLink && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-primary"
              onClick={() => linkMultiToMask(maskShapes[0].id)}
              title="선택 항목 마스크 연결/해제"
            >
              <Link className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-red-500"
            onClick={deleteMultiSelected}
            title="선택 항목 삭제"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="space-y-0.5">
        {items.map((item, i) => {
          const key = layerKey(item);
          const isSingleSelected =
            item.type === "char" ? selectedCharId === item.id
            : item.type === "bubble" ? selectedBubbleId === item.id
            : item.type === "drawing" ? selectedDrawingLayerId === item.id
            : item.type === "text" ? selectedTextId === item.id
            : item.type === "line" ? selectedLineId === item.id
            : item.type === "shape" ? selectedShapeId === item.id
            : false;

          const isMultiSelected = multiSelected.has(key);
          const isSelected = hasMulti ? isMultiSelected : isSingleSelected;

          const DrawingIcon = item.drawingType ? (DRAWING_TYPE_ICONS[item.drawingType] || Pen) : Pen;

          const isMask = item.type === "shape" && item.maskEnabled;
          const isLinkedToMask = !!item.clipMaskId;

          return (
            <div
              key={key}
              className={`flex items-center justify-between gap-1.5 rounded-md cursor-pointer transition-colors ${
                isLinkedToMask ? "pl-5 pr-2" : "px-2"
              } py-1 ${
                isSelected
                  ? isMultiSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-primary/15 border border-primary/30"
                  : "hover:bg-muted/40"
              } ${item.visible === false ? "opacity-40" : ""} ${item.locked ? "opacity-70" : ""}`}
              onClick={(e) => handleClick(item, i, e)}
            >
              <div className="flex items-center gap-1 min-w-0">
                {/* 눈/잠금 — 맨 앞 */}
                {onToggleVisibility && (
                  <button
                    type="button"
                    className={`p-0.5 rounded hover:bg-muted/60 transition-colors shrink-0 ${item.visible === false ? "text-red-400" : "text-muted-foreground"}`}
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(item); }}
                    title={item.visible !== false ? "숨기기" : "보이기"}
                  >
                    {item.visible !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                )}
                {onToggleLock && (
                  <button
                    type="button"
                    className={`p-0.5 rounded hover:bg-muted/60 transition-colors shrink-0 ${item.locked ? "text-yellow-500" : "text-muted-foreground"}`}
                    onClick={(e) => { e.stopPropagation(); onToggleLock(item); }}
                    title={item.locked ? "잠금 해제" : "잠금"}
                  >
                    {item.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                  </button>
                )}
                {isLinkedToMask && (
                  <div className="w-0.5 h-4 bg-primary/40 rounded-full shrink-0" />
                )}
                <div className={`w-6 h-6 rounded overflow-hidden shrink-0 border border-border/50 bg-card flex items-center justify-center`}>
                  {item.type === "drawing" ? (
                    <DrawingIcon className="h-3 w-3 text-muted-foreground" />
                  ) : item.type === "text" ? (
                    <span className="text-[9px] font-semibold text-muted-foreground">T</span>
                  ) : item.type === "line" ? (
                    <span className="text-[9px] font-semibold text-muted-foreground">L</span>
                  ) : item.type === "shape" ? (
                    <Square className="h-3 w-3 text-muted-foreground" />
                  ) : item.thumb ? (
                    <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {item.type === "bubble" ? "B" : "C"}
                    </span>
                  )}
                </div>
                {isMask && <Scan className="h-3 w-3 text-primary shrink-0" />}
                <span className="text-[11px] truncate">
                  {isMask ? `[마스크] ${item.label}` : item.label}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* 마스크 연결 */}
                {!isMask && maskShapes.length > 0 && onToggleMaskLink && !hasMulti && (
                  <button
                    type="button"
                    className={`p-1 rounded hover:bg-muted/60 transition-colors ${isLinkedToMask ? "text-primary" : "text-foreground/50"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const targetMaskId = item.clipMaskId || maskShapes[0].id;
                      onToggleMaskLink(item.id, item.type, targetMaskId);
                    }}
                    title={isLinkedToMask ? "마스크 연결 해제" : "마스크에 연결"}
                  >
                    {isLinkedToMask ? <Link className="h-3.5 w-3.5" /> : <Unlink className="h-3.5 w-3.5" />}
                  </button>
                )}
                {/* 선택된 항목만: 반전/이동/삭제 */}
                {isSelected && !hasMulti && (
                  <>
                    {item.type === "char" && onFlipChar && (
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-muted/60 text-foreground/60 transition-colors"
                        onClick={(e) => { e.stopPropagation(); onFlipChar(item.id); }}
                        title="좌우 반전"
                      >
                        <FlipHorizontal2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-muted/60 text-foreground/60 disabled:opacity-30 transition-colors"
                      disabled={i === 0}
                      onClick={(e) => { e.stopPropagation(); onMoveLayer(i, "up"); }}
                      title="앞으로"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-muted/60 text-foreground/60 disabled:opacity-30 transition-colors"
                      disabled={i === items.length - 1}
                      onClick={(e) => { e.stopPropagation(); onMoveLayer(i, "down"); }}
                      title="뒤로"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-red-500/10 text-foreground/60 hover:text-red-500 transition-colors"
                      onClick={(e) => { e.stopPropagation(); onDeleteLayer(item); }}
                      title="삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
