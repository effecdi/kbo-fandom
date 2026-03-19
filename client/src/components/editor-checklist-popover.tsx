import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ImagePlus,
  Wand2,
  MessageCircle,
  Minus,
  Pen,
  Layers,
  Square,
  Download,
  Check,
  HelpCircle,
  MinusIcon,
} from "lucide-react";

const CHECKLIST_ITEMS = [
  { id: "add-image", label: "이미지 추가하기", icon: ImagePlus },
  { id: "ai-generate", label: "AI 자동 생성 사용하기", icon: Wand2 },
  { id: "add-bubble", label: "말풍선 추가하기", icon: MessageCircle },
  { id: "add-subtitle", label: "자막 추가하기", icon: Minus },
  { id: "use-drawing", label: "드로잉 도구 사용하기", icon: Pen },
  { id: "add-panel", label: "패널 추가하기", icon: Layers },
  { id: "apply-template", label: "템플릿 적용하기", icon: Square },
  { id: "download", label: "저장 및 다운로드하기", icon: Download },
] as const;

const DISMISSED_KEY = "olli_editor_checklist_dismissed";

export function EditorChecklistPopover({
  completedItems,
  onDismiss,
}: {
  completedItems: Set<string>;
  onDismiss: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === "1",
  );

  const completedCount = CHECKLIST_ITEMS.filter((item) =>
    completedItems.has(item.id),
  ).length;
  const total = CHECKLIST_ITEMS.length;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  // Auto-dismiss when all items completed
  useEffect(() => {
    if (completedCount === total && total > 0) {
      const timer = setTimeout(() => {
        setDismissed(true);
        localStorage.setItem(DISMISSED_KEY, "1");
        onDismiss();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [completedCount, total, onDismiss]);

  if (dismissed) return null;

  return createPortal(
    <>
      {/* Expanded checklist panel */}
      {expanded && (
        <div
          style={{
            position: "fixed",
            top: "4.5rem",
            right: "1rem",
            width: 340,
            zIndex: 10001,
          }}
        >
          <div className="bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  시작하세요
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {completedCount}/{total} 완료됨
                </span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
                title="최소화"
              >
                <MinusIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-4 pb-3">
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="px-2 pb-3 max-h-[340px] overflow-y-auto">
              {CHECKLIST_ITEMS.map((item) => {
                const done = completedItems.has(item.id);
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors ${
                      done ? "opacity-60" : "hover:bg-muted/50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`h-5 w-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                        done
                          ? "bg-green-500 border-green-500"
                          : "border-border bg-background"
                      }`}
                    >
                      {done && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Icon */}
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        done ? "text-muted-foreground" : "text-foreground/70"
                      }`}
                    />

                    {/* Label */}
                    <span
                      className={`text-sm ${
                        done
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dismiss link */}
            <div className="px-4 pb-3 pt-1 border-t border-border">
              <button
                onClick={() => {
                  setExpanded(false);
                  setDismissed(true);
                  localStorage.setItem(DISMISSED_KEY, "1");
                  onDismiss();
                }}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                가이드 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed bar + help button */}
      <div
        className="fixed top-16 right-4 flex items-center gap-2"
        style={{ zIndex: 10000 }}
      >
        {/* Progress pill */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2.5 bg-background border border-border rounded-full pl-4 pr-3 py-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        >
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            시작하세요
          </span>
          <span className="text-[13px] text-muted-foreground">
            {completedCount}/{total}
          </span>
          {/* Mini progress bar */}
          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </button>

        {/* Help button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="h-10 w-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow cursor-pointer"
          title="에디터 가이드"
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </>,
    document.body,
  );
}
