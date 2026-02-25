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
} from "lucide-react";
import { Spline, GitCommitHorizontal } from "lucide-react";
import { STYLE_LABELS } from "@/lib/bubble-utils";

export interface LayerItem {
  type: "char" | "bubble" | "drawing" | "text" | "line";
  id: string;
  z: number;
  label: string;
  thumb?: string;
  drawingType?: string;
  visible?: boolean;
}

const DRAWING_TYPE_ICONS: Record<string, typeof Pen> = {
  drawing: Pen,
  straight: Minus,
  curve: Spline,
  polyline: GitCommitHorizontal,
  text: Type,
  eraser: Eraser,
};

interface LayerListPanelProps {
  items: LayerItem[];
  selectedCharId: string | null;
  selectedBubbleId: string | null;
  selectedDrawingLayerId?: string | null;
  selectedTextId?: string | null;
  selectedLineId?: string | null;
  onSelectChar: (id: string | null) => void;
  onSelectBubble: (id: string | null) => void;
  onSelectDrawingLayer?: (id: string | null) => void;
  onSelectText?: (id: string | null) => void;
  onSelectLine?: (id: string | null) => void;
  onMoveLayer: (index: number, direction: "up" | "down") => void;
  onDeleteLayer: (item: LayerItem) => void;
  onToggleVisibility?: (item: LayerItem) => void;
  onFlipChar?: (id: string) => void;
  onSetToolItem?: (tool: string) => void;
}

export function LayerListPanel({
  items,
  selectedCharId,
  selectedBubbleId,
  selectedDrawingLayerId,
  selectedTextId,
  selectedLineId,
  onSelectChar,
  onSelectBubble,
  onSelectDrawingLayer,
  onSelectText,
  onSelectLine,
  onMoveLayer,
  onDeleteLayer,
  onToggleVisibility,
  onFlipChar,
  onSetToolItem,
}: LayerListPanelProps) {
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

      <div className="space-y-0.5">
        {items.map((item, i) => {
          const isSelected =
            item.type === "char" ? selectedCharId === item.id
            : item.type === "bubble" ? selectedBubbleId === item.id
            : item.type === "drawing" ? selectedDrawingLayerId === item.id
            : item.type === "text" ? selectedTextId === item.id
            : item.type === "line" ? selectedLineId === item.id
            : false;

          const DrawingIcon = item.drawingType ? (DRAWING_TYPE_ICONS[item.drawingType] || Pen) : Pen;

          return (
            <div
              key={`${item.type}:${item.id}`}
              className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                isSelected
                  ? "bg-primary/15 border border-primary/30"
                  : "hover:bg-muted/40"
              } ${item.type === "drawing" && item.visible === false ? "opacity-40" : ""}`}
              onClick={() => {
                onSelectChar(null);
                onSelectBubble(null);
                onSelectDrawingLayer?.(null);
                onSelectText?.(null);
                onSelectLine?.(null);

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
                }
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={`w-6 h-6 rounded overflow-hidden shrink-0 border border-border/50 bg-card flex items-center justify-center`}>
                  {item.type === "drawing" ? (
                    <DrawingIcon className="h-3 w-3 text-muted-foreground" />
                  ) : item.type === "text" ? (
                    <span className="text-[9px] font-semibold text-muted-foreground">T</span>
                  ) : item.type === "line" ? (
                    <span className="text-[9px] font-semibold text-muted-foreground">L</span>
                  ) : item.thumb ? (
                    <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {item.type === "bubble" ? "B" : "C"}
                    </span>
                  )}
                </div>
                <span className="text-[11px] truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-0 shrink-0">
                {item.type === "drawing" && onToggleVisibility && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(item); }}
                    title={item.visible !== false ? "숨기기" : "보이기"}
                  >
                    {item.visible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                )}
                {item.type === "char" && onFlipChar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => { e.stopPropagation(); onFlipChar(item.id); }}
                    title="좌우 반전"
                  >
                    <FlipHorizontal2 className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  disabled={i === 0}
                  onClick={(e) => { e.stopPropagation(); onMoveLayer(i, "up"); }}
                  title="앞으로"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  disabled={i === items.length - 1}
                  onClick={(e) => { e.stopPropagation(); onMoveLayer(i, "down"); }}
                  title="뒤로"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => { e.stopPropagation(); onDeleteLayer(item); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
