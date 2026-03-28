import { useState, useCallback, useMemo, useRef, ReactNode } from "react";
import { GripVertical, X, Plus, RotateCcw, Settings2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";

const ORDER_STORAGE_KEY = "kbo-dashboard-order-v3";
const HIDDEN_WIDGETS_KEY = "kbo-dashboard-hidden-v3";

export interface DashboardWidget {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  content: ReactNode;
  /** If true, cannot be hidden */
  required?: boolean;
  /** If true, no padding on content area */
  noPadding?: boolean;
  /** Link for "전체 보기" */
  moreLink?: string;
}

interface DashboardGridProps {
  widgets: DashboardWidget[];
  themeColor: string;
}

export function DashboardGrid({ widgets, themeColor }: DashboardGridProps) {
  const [editMode, setEditMode] = useState(false);
  const dragItemRef = useRef<string | null>(null);
  const dragOverItemRef = useRef<string | null>(null);

  // Saved order (widget IDs)
  const [savedOrder, setSavedOrder] = useState<string[] | null>(() => {
    try {
      const stored = localStorage.getItem(ORDER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [hiddenWidgetIds, setHiddenWidgetIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(HIDDEN_WIDGETS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Build ordered, visible widget list
  const orderedWidgets = useMemo(() => {
    const visible = widgets.filter((w) => !hiddenWidgetIds.includes(w.id));
    if (!savedOrder) return visible;

    const widgetMap = new Map(visible.map((w) => [w.id, w]));
    const ordered: DashboardWidget[] = [];

    // Add widgets in saved order
    for (const id of savedOrder) {
      const w = widgetMap.get(id);
      if (w) {
        ordered.push(w);
        widgetMap.delete(id);
      }
    }
    // Append any new widgets not in saved order
    for (const w of widgetMap.values()) {
      ordered.push(w);
    }
    return ordered;
  }, [widgets, savedOrder, hiddenWidgetIds]);

  const hiddenWidgets = useMemo(
    () => widgets.filter((w) => hiddenWidgetIds.includes(w.id) && !w.required),
    [widgets, hiddenWidgetIds],
  );

  const saveOrder = useCallback((ids: string[]) => {
    setSavedOrder(ids);
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(ids));
    } catch { /* quota */ }
  }, []);

  const hideWidget = useCallback((widgetId: string) => {
    setHiddenWidgetIds((prev) => {
      const next = [...prev, widgetId];
      localStorage.setItem(HIDDEN_WIDGETS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const showWidget = useCallback((widgetId: string) => {
    setHiddenWidgetIds((prev) => {
      const next = prev.filter((id) => id !== widgetId);
      localStorage.setItem(HIDDEN_WIDGETS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetLayout = useCallback(() => {
    setSavedOrder(null);
    setHiddenWidgetIds([]);
    localStorage.removeItem(ORDER_STORAGE_KEY);
    localStorage.removeItem(HIDDEN_WIDGETS_KEY);
  }, []);

  // Drag handlers
  const handleDragStart = useCallback((widgetId: string) => {
    dragItemRef.current = widgetId;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, widgetId: string) => {
    e.preventDefault();
    dragOverItemRef.current = widgetId;
  }, []);

  const handleDrop = useCallback(() => {
    const from = dragItemRef.current;
    const to = dragOverItemRef.current;
    if (!from || !to || from === to) return;

    const ids = orderedWidgets.map((w) => w.id);
    const fromIdx = ids.indexOf(from);
    const toIdx = ids.indexOf(to);
    if (fromIdx === -1 || toIdx === -1) return;

    ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, from);
    saveOrder(ids);

    dragItemRef.current = null;
    dragOverItemRef.current = null;
  }, [orderedWidgets, saveOrder]);

  // Move widget up/down in order
  const moveWidget = useCallback((widgetId: string, direction: "up" | "down") => {
    const ids = orderedWidgets.map((w) => w.id);
    const idx = ids.indexOf(widgetId);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    ids.splice(idx, 1);
    ids.splice(targetIdx, 0, widgetId);
    saveOrder(ids);
  }, [orderedWidgets, saveOrder]);

  // All widgets for the management panel (ordered: visible first, then hidden)
  const allWidgetsForPanel = useMemo(() => {
    const visible = orderedWidgets.map((w) => ({ ...w, visible: true }));
    const hidden = hiddenWidgets.map((w) => ({ ...w, visible: false }));
    return [...visible, ...hidden];
  }, [orderedWidgets, hiddenWidgets]);

  return (
    <div>
      {/* Edit Mode Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            editMode
              ? "text-white shadow-lg"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          style={editMode ? { background: themeColor } : {}}
        >
          <Settings2 className="w-4 h-4" />
          {editMode ? "편집 완료" : "위젯 관리"}
        </button>

        {editMode && (
          <button
            onClick={resetLayout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </button>
        )}
      </div>

      {/* Widget Management Panel */}
      {editMode && (
        <div className="mb-6 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 bg-muted/50 border-b border-border">
            <p className="text-sm font-bold text-foreground">위젯 관리</p>
            <p className="text-xs text-muted-foreground mt-0.5">토글로 위젯을 켜고 끄세요. 드래그 또는 화살표로 순서를 변경하세요.</p>
          </div>
          <div className="divide-y divide-border">
            {allWidgetsForPanel.map((w, idx) => {
              const isVisible = w.visible;
              const isRequired = w.required;
              const visibleIdx = orderedWidgets.findIndex((ow) => ow.id === w.id);

              return (
                <div
                  key={w.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    !isVisible ? "opacity-50 bg-muted/20" : "bg-card"
                  }`}
                >
                  {/* Drag handle */}
                  {isVisible ? (
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 flex-shrink-0" />
                  )}

                  {/* Icon + Title */}
                  <w.icon className="w-4 h-4 flex-shrink-0" style={{ color: isVisible ? themeColor : "#999" }} />
                  <span className={`text-sm flex-1 min-w-0 truncate ${isVisible ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                    {w.title}
                    {isRequired && <span className="text-[10px] text-muted-foreground ml-1.5">(필수)</span>}
                  </span>

                  {/* Move up/down */}
                  {isVisible && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => moveWidget(w.id, "up")}
                        disabled={visibleIdx === 0}
                        className="p-1 rounded-lg hover:bg-muted disabled:opacity-20 transition-colors"
                        title="위로 이동"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => moveWidget(w.id, "down")}
                        disabled={visibleIdx === orderedWidgets.length - 1}
                        className="p-1 rounded-lg hover:bg-muted disabled:opacity-20 transition-colors"
                        title="아래로 이동"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  {/* Toggle switch */}
                  {!isRequired && (
                    <button
                      onClick={() => isVisible ? hideWidget(w.id) : showWidget(w.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full flex-shrink-0 transition-colors ${
                        isVisible ? "" : "bg-muted"
                      }`}
                      style={isVisible ? { backgroundColor: themeColor } : {}}
                      title={isVisible ? "위젯 끄기" : "위젯 켜기"}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          isVisible ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections (natural flow, no fixed height) */}
      <div className="space-y-6">
        {orderedWidgets.map((widget) => (
          <div
            key={widget.id}
            draggable={editMode}
            onDragStart={() => handleDragStart(widget.id)}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            onDrop={handleDrop}
            className={`transition-all ${editMode ? "cursor-move" : ""}`}
          >
            {/* Section header */}
            {(editMode || widget.moreLink) && (
              <div className="flex items-center gap-2 mb-2">
                {editMode && (
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                )}
                <widget.icon className="w-4 h-4" style={{ color: themeColor }} />
                <span className="text-sm font-bold text-foreground flex-1">{widget.title}</span>
                {widget.moreLink && !editMode && (
                  <a href={widget.moreLink} className="text-xs font-medium hover:underline" style={{ color: themeColor }}>
                    전체 보기
                  </a>
                )}
                {editMode && !widget.required && (
                  <button
                    onClick={() => hideWidget(widget.id)}
                    className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                    title="위젯 숨기기"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
            )}

            {/* Section content - natural height, no scroll */}
            <div className={editMode ? "ring-1 ring-border rounded-2xl p-3" : ""}>
              {widget.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
