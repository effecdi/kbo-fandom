import { useState, useRef, useCallback, useEffect } from "react";
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
  Copy,
  Subtitles,
  Download,
  Crown,
} from "lucide-react";
import { Spline, GitCommitHorizontal, GripVertical } from "lucide-react";
import { STYLE_LABELS } from "@/lib/bubble-utils";

export interface LayerItem {
  type: "char" | "bubble" | "drawing" | "text" | "line" | "shape" | "topScript" | "bottomScript";
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
  onReorderLayer?: (fromIndex: number, toIndex: number) => void;
  onDeleteLayer: (item: LayerItem) => void;
  onDuplicateLayer?: (item: LayerItem) => void;
  onToggleVisibility?: (item: LayerItem) => void;
  onToggleLock?: (item: LayerItem) => void;
  onFlipChar?: (id: string) => void;
  onSetToolItem?: (tool: string) => void;
  onToggleMaskLink?: (layerId: string, layerType: string, maskId: string) => void;
  onSelectScript?: (position: "top" | "bottom" | null) => void;
  selectedScriptPosition?: "top" | "bottom" | null;
  externalMultiSelected?: Set<string>;
  onDownloadLayerPng?: (item: LayerItem) => void;
  onDownloadLayerSvg?: (item: LayerItem) => void;
  isPro?: boolean;
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
  onReorderLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onToggleVisibility,
  onToggleLock,
  onFlipChar,
  onSetToolItem,
  onToggleMaskLink,
  onSelectScript,
  selectedScriptPosition,
  externalMultiSelected,
  onDownloadLayerPng,
  onDownloadLayerSvg,
  isPro,
}: LayerListPanelProps) {
  const maskShapes = items.filter(it => it.type === "shape" && it.maskEnabled);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: LayerItem } | null>(null);

  // Multi-selection state
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());

  // Sync external multi-selection (from canvas rubber band) into internal state
  useEffect(() => {
    if (externalMultiSelected && externalMultiSelected.size > 0) {
      setMultiSelected(externalMultiSelected);
    } else if (externalMultiSelected && externalMultiSelected.size === 0) {
      // Only clear if we were syncing from external — don't clear user's own multi-selection
    }
  }, [externalMultiSelected]);
  const lastClickIndexRef = useRef<number>(-1);

  // Drag-and-drop reorder state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const selectSingle = useCallback((item: LayerItem, index: number) => {
    setMultiSelected(new Set());
    lastClickIndexRef.current = index;

    onSelectChar(null);
    onSelectBubble(null);
    onSelectDrawingLayer?.(null);
    onSelectText?.(null);
    onSelectLine?.(null);
    onSelectShape?.(null);
    onSelectScript?.(null);

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
    } else if (item.type === "topScript") {
      onSelectScript?.("top");
    } else if (item.type === "bottomScript") {
      onSelectScript?.("bottom");
    }
  }, [onSelectChar, onSelectBubble, onSelectDrawingLayer, onSelectText, onSelectLine, onSelectShape, onSetToolItem, onSelectScript]);

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
        <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
          레이어 ({items.length})
        </span>
      </div>

      {items.length === 0 && (
        <p className="text-[13px] text-muted-foreground text-center py-4">레이어가 없습니다</p>
      )}

      {/* Bulk action bar */}
      {hasMulti && (
        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-md">
          <span className="text-[13px] text-primary font-medium flex-1">
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
            : item.type === "topScript" ? selectedScriptPosition === "top"
            : item.type === "bottomScript" ? selectedScriptPosition === "bottom"
            : false;

          const isMultiSelected = multiSelected.has(key);
          const isSelected = hasMulti ? isMultiSelected : isSingleSelected;

          const DrawingIcon = item.drawingType ? (DRAWING_TYPE_ICONS[item.drawingType] || Pen) : Pen;

          const isMask = item.type === "shape" && item.maskEnabled;
          const isLinkedToMask = !!item.clipMaskId;

          return (
            <div
              key={key}
              draggable
              onDragStart={(e) => {
                setDragIdx(i);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(i));
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragIdx !== null && i !== dragIdx) {
                  setDropIdx(i);
                }
              }}
              onDragLeave={() => {
                setDropIdx((prev) => (prev === i ? null : prev));
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIdx !== null && dragIdx !== i && onReorderLayer) {
                  onReorderLayer(dragIdx, i);
                }
                setDragIdx(null);
                setDropIdx(null);
              }}
              onDragEnd={() => {
                setDragIdx(null);
                setDropIdx(null);
              }}
              className={`flex items-center justify-between gap-1.5 rounded-md cursor-pointer transition-colors ${
                isLinkedToMask ? "pl-5 pr-2" : "px-2"
              } py-1 ${
                isSelected
                  ? isMultiSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-primary/15 border border-primary/30"
                  : "hover:bg-muted/40"
              } ${item.visible === false ? "opacity-40" : ""} ${item.locked ? "opacity-70" : ""} ${
                dragIdx === i ? "opacity-30" : ""
              } ${
                dropIdx === i && dragIdx !== null && dragIdx !== i
                  ? dropIdx < dragIdx
                    ? "border-t-2 !border-t-primary"
                    : "border-b-2 !border-b-primary"
                  : ""
              }`}
              onClick={(e) => handleClick(item, i, e)}
              onContextMenu={(e) => {
                e.preventDefault();
                selectSingle(item, i);
                setContextMenu({ x: e.clientX, y: e.clientY, item });
              }}
            >
              <div className="flex items-center gap-1 min-w-0">
                {/* 드래그 핸들 */}
                <GripVertical className="h-3 w-3 text-muted-foreground/50 shrink-0 cursor-grab active:cursor-grabbing" />
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
                {onToggleLock && item.type !== "topScript" && item.type !== "bottomScript" && (
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
                  {item.type === "topScript" || item.type === "bottomScript" ? (
                    <Subtitles className="h-3 w-3 text-yellow-500" />
                  ) : item.type === "drawing" ? (
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
                <span className="text-[13px] truncate">
                  {isMask ? `[마스크] ${item.label}` : item.label}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* 마스크 연결 (스크립트 레이어 제외) */}
                {!isMask && item.type !== "topScript" && item.type !== "bottomScript" && maskShapes.length > 0 && onToggleMaskLink && !hasMulti && (
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

      {/* Right-click context menu */}
      {contextMenu && (() => {
        const ci = contextMenu.item;
        const ciIdx = items.findIndex(it => layerKey(it) === layerKey(ci));
        const isMask = ci.type === "shape" && ci.maskEnabled;
        const isLinked = !!ci.clipMaskId;
        const isScript = ci.type === "topScript" || ci.type === "bottomScript";
        const ctxBtnClass = "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-[13px] hover:bg-accent hover:text-accent-foreground transition-colors";
        const ctxShortcut = "text-[13px] text-muted-foreground ml-4";
        return (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
          />
          <div
            className="fixed z-50 min-w-[170px] rounded-md border bg-popover p-1 shadow-md"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {/* Duplicate (스크립트 제외) */}
            {onDuplicateLayer && !isScript && (
              <button type="button" className={ctxBtnClass}
                onClick={() => { onDuplicateLayer(ci); setContextMenu(null); }}>
                <span>레이어 복제</span><span className={ctxShortcut}>⌘D</span>
              </button>
            )}

            {!isScript && <div className="my-1 h-px bg-border" />}

            {/* Layer ordering */}
            <button type="button" className={ctxBtnClass} disabled={ciIdx <= 0}
              onClick={() => { onMoveLayer(ciIdx, "up"); setContextMenu(null); }}>
              <span>앞으로</span><span className={ctxShortcut}>⌘]</span>
            </button>
            <button type="button" className={ctxBtnClass} disabled={ciIdx >= items.length - 1}
              onClick={() => { onMoveLayer(ciIdx, "down"); setContextMenu(null); }}>
              <span>뒤로</span><span className={ctxShortcut}>⌘[</span>
            </button>

            <div className="my-1 h-px bg-border" />

            {/* Lock / Visibility (잠금은 스크립트 제외) */}
            {onToggleLock && !isScript && (
              <button type="button" className={ctxBtnClass}
                onClick={() => { onToggleLock(ci); setContextMenu(null); }}>
                <span>{ci.locked ? "잠금 해제" : "잠금"}</span><span className={ctxShortcut}>⌘L</span>
              </button>
            )}
            {onToggleVisibility && (
              <button type="button" className={ctxBtnClass}
                onClick={() => { onToggleVisibility(ci); setContextMenu(null); }}>
                <span>{ci.visible === false ? "보이기" : "숨기기"}</span>
              </button>
            )}

            {/* Mask link (스크립트 제외) */}
            {!isMask && !isScript && maskShapes.length > 0 && onToggleMaskLink && (
              <>
                <div className="my-1 h-px bg-border" />
                <button type="button" className={ctxBtnClass}
                  onClick={() => {
                    const targetMaskId = ci.clipMaskId || maskShapes[0].id;
                    onToggleMaskLink(ci.id, ci.type, targetMaskId);
                    setContextMenu(null);
                  }}>
                  <span>{isLinked ? "마스크 해제" : "마스크 연결"}</span>
                </button>
              </>
            )}

            {(onDownloadLayerPng || onDownloadLayerSvg) && (
              <>
                <div className="my-1 h-px bg-border" />
                {onDownloadLayerPng && (
                  <button type="button" className={ctxBtnClass}
                    onClick={() => { onDownloadLayerPng(ci); setContextMenu(null); }}>
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> PNG 다운로드</span>
                  </button>
                )}
                {onDownloadLayerSvg && (
                  <button type="button" className={`${ctxBtnClass} ${!isPro ? "opacity-50" : ""}`}
                    disabled={!isPro}
                    onClick={() => { if (isPro) { onDownloadLayerSvg(ci); setContextMenu(null); } }}>
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" /> SVG 다운로드</span>
                    {!isPro && <Crown className="h-3 w-3 text-yellow-500" />}
                  </button>
                )}
              </>
            )}

            <div className="my-1 h-px bg-border" />

            {/* Delete */}
            <button type="button"
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-[13px] text-red-500 hover:bg-red-500/10 transition-colors"
              onClick={() => { onDeleteLayer(ci); setContextMenu(null); }}>
              <span>레이어 삭제</span><span className={ctxShortcut}>Del</span>
            </button>
          </div>
        </>
        );
      })()}
    </div>
  );
}
