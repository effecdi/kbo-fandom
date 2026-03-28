import { useState, useCallback, useMemo, ReactNode } from "react";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import type { Layout, Layouts } from "react-grid-layout";
import { GripVertical, X, Plus, RotateCcw, Settings2 } from "lucide-react";
import "react-grid-layout/css/styles.css";

const LAYOUT_STORAGE_KEY = "kbo-dashboard-layout-v2";
const HIDDEN_WIDGETS_KEY = "kbo-dashboard-hidden-v2";

export interface DashboardWidget {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  defaultLayout: { lg: Layout; md: Layout; sm: Layout };
  content: ReactNode;
  required?: boolean;
  noPadding?: boolean;
  moreLink?: string;
}

interface DashboardGridProps {
  widgets: DashboardWidget[];
  themeColor: string;
}

export function DashboardGrid({ widgets, themeColor }: DashboardGridProps) {
  const [editMode, setEditMode] = useState(false);
  const { width, containerRef } = useContainerWidth({ initialWidth: 1280 });

  const [hiddenWidgetIds, setHiddenWidgetIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(HIDDEN_WIDGETS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedLayouts, setSavedLayouts] = useState<Layouts | null>(() => {
    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const visibleWidgets = useMemo(
    () => widgets.filter((w) => !hiddenWidgetIds.includes(w.id)),
    [widgets, hiddenWidgetIds],
  );

  const hiddenWidgets = useMemo(
    () => widgets.filter((w) => hiddenWidgetIds.includes(w.id) && !w.required),
    [widgets, hiddenWidgetIds],
  );

  const defaultLayouts = useMemo(() => {
    const lg: Layout[] = [];
    const md: Layout[] = [];
    const sm: Layout[] = [];
    for (const w of visibleWidgets) {
      lg.push({ ...w.defaultLayout.lg, i: w.id });
      md.push({ ...w.defaultLayout.md, i: w.id });
      sm.push({ ...w.defaultLayout.sm, i: w.id });
    }
    return { lg, md, sm };
  }, [visibleWidgets]);

  const layouts = useMemo(() => {
    if (!savedLayouts) return defaultLayouts;
    const visibleIds = new Set(visibleWidgets.map((w) => w.id));
    const merged: Layouts = {};
    for (const bp of ["lg", "md", "sm"] as const) {
      const saved = (savedLayouts[bp] || []).filter((l: Layout) => visibleIds.has(l.i));
      const savedIds = new Set(saved.map((l: Layout) => l.i));
      const defaults = defaultLayouts[bp].filter((l) => !savedIds.has(l.i));
      merged[bp] = [...saved, ...defaults];
    }
    return merged;
  }, [savedLayouts, defaultLayouts, visibleWidgets]);

  const handleLayoutChange = useCallback((_layout: Layout[], allLayouts: Layouts) => {
    setSavedLayouts(allLayouts);
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
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
    setSavedLayouts(null);
    setHiddenWidgetIds([]);
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    localStorage.removeItem(HIDDEN_WIDGETS_KEY);
  }, []);

  const widgetMap = useMemo(() => {
    const map = new Map<string, DashboardWidget>();
    for (const w of widgets) map.set(w.id, w);
    return map;
  }, [widgets]);

  return (
    <div ref={containerRef}>
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
          {editMode ? "편집 완료" : "대시보드 편집"}
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

      {/* Hidden Widgets Picker */}
      {editMode && hiddenWidgets.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl border-2 border-dashed bg-muted/30" style={{ borderColor: `${themeColor}40` }}>
          <p className="text-sm font-medium text-muted-foreground mb-3">숨겨진 위젯 (클릭하여 추가)</p>
          <div className="flex flex-wrap gap-2">
            {hiddenWidgets.map((w) => (
              <button
                key={w.id}
                onClick={() => showWidget(w.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" style={{ color: themeColor }} />
                <w.icon className="w-4 h-4" />
                {w.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <ResponsiveGridLayout
        width={width}
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 0 }}
        cols={{ lg: 4, md: 2, sm: 1 }}
        rowHeight={90}
        isDraggable={editMode}
        isResizable={false}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={handleLayoutChange}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        useCSSTransforms
      >
        {visibleWidgets.map((widget) => (
          <div key={widget.id}>
            <div
              className={`h-full rounded-2xl border overflow-hidden flex flex-col transition-shadow ${
                editMode ? "ring-2 ring-offset-2 ring-offset-background" : ""
              } bg-card border-border`}
              style={editMode ? { "--tw-ring-color": `${themeColor}40` } as any : {}}
            >
              {/* Widget Header */}
              <div
                className={`flex items-center gap-2 px-4 py-2.5 border-b border-border shrink-0 ${
                  editMode ? "widget-drag-handle cursor-grab active:cursor-grabbing bg-muted/50" : ""
                }`}
              >
                {editMode && (
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <widget.icon className="w-4 h-4 shrink-0" style={{ color: themeColor }} />
                <span className="text-sm font-bold text-foreground truncate flex-1">{widget.title}</span>
                {widget.moreLink && !editMode && (
                  <a href={widget.moreLink} className="text-xs font-medium shrink-0 hover:underline" style={{ color: themeColor }}>
                    전체 보기
                  </a>
                )}
                {editMode && !widget.required && (
                  <button
                    onClick={() => hideWidget(widget.id)}
                    className="p-1 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                    title="위젯 숨기기"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>

              {/* Widget Content */}
              <div className={`flex-1 overflow-y-auto overflow-x-hidden ${widget.noPadding ? "" : "p-4"}`}>
                {widget.content}
              </div>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
