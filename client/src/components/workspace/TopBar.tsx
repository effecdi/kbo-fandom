import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  Eye,
  Rocket,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ChevronUp,
  Check,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useWorkspace, useActiveCut, useAllCuts } from "@/hooks/use-workspace";
import { useProgressiveUI } from "@/hooks/use-progressive-ui";
import { PublishDialog } from "./PublishDialog";

export function TopBar() {
  const navigate = useNavigate();
  const { state, dispatch, canvasRef } = useWorkspace();
  const activeCut = useActiveCut();
  const allCuts = useAllCuts();
  const { uiLevel, showTopBarExtras, showSidePanels, forceLevel } =
    useProgressiveUI();
  const [saved, setSaved] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  // ── Quick save ──────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    try {
      if (canvasRef.current) {
        const json = canvasRef.current.toJSON();
        dispatch({ type: "UPDATE_CUT_CANVAS", cutId: state.activeCutId, canvasJSON: json });
        const thumb = canvasRef.current.exportImage("jpeg");
        if (thumb) {
          dispatch({ type: "UPDATE_CUT_THUMBNAIL", cutId: state.activeCutId, thumbnailUrl: thumb });
        }
      }

      const data = {
        project: state.project,
        scenes: state.scenes,
        activeSceneId: state.activeSceneId,
        activeCutId: state.activeCutId,
        canvasAspectRatio: state.canvasAspectRatio,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`olli-project-${state.project.id}`, JSON.stringify(data));

      // Update saved projects index
      const KEY = "olli-saved-instatoons";
      let list: any[] = [];
      try { list = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
      const entry = {
        id: state.project.id,
        title: state.project.title,
        savedAt: data.savedAt,
        cutCount: allCuts.length,
        thumbnail: allCuts[0]?.thumbnailUrl || null,
      };
      const idx = list.findIndex((p: any) => p.id === state.project.id);
      if (idx >= 0) list[idx] = entry; else list.unshift(entry);
      localStorage.setItem(KEY, JSON.stringify(list));

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* storage full */ }
  }, [canvasRef, state, dispatch, allCuts]);

  // ── Preview in new window ─────────────────────────────────────────────
  const handlePreview = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.exportImage("png");
    if (!dataUrl) return;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>${state.project.title}</title><style>*{margin:0}body{display:flex;justify-content:center;align-items:center;min-height:100vh;background:#0a0a0a}</style></head><body><img src="${dataUrl}" style="max-width:100%;max-height:100vh;object-fit:contain"/></body></html>`);
    }
  }, [canvasRef, state.project.title]);

  // ── Quick download current cut ─────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.exportImage("png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.project.title}_컷${activeCut?.order || 1}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [canvasRef, state.project.title, activeCut]);

  return (
    <>
      <header className="h-12 border-b border-white/[0.06] bg-[#0c0c0f] flex items-center px-3 justify-between shrink-0">
        {/* ── Left ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate("/studio")}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white/40" />
          </button>

          <input
            type="text"
            value={state.project.title}
            onChange={(e) =>
              dispatch({ type: "SET_PROJECT_TITLE", title: e.target.value })
            }
            className="text-sm font-semibold bg-transparent border-none outline-none text-white/90 w-40 hover:bg-white/[0.04] focus:bg-white/[0.06] px-2 py-1 rounded-lg transition-colors"
          />

          <button
            onClick={() => {
              if (uiLevel === "beginner") forceLevel("intermediate");
              else if (uiLevel === "intermediate") forceLevel("pro");
              else forceLevel("beginner");
            }}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/35 transition-colors"
            title="클릭하여 UI 모드 전환"
          >
            <ChevronUp className="w-3 h-3" />
            {uiLevel === "beginner" ? "간편" : uiLevel === "intermediate" ? "일반" : "프로"}
          </button>
        </div>

        {/* ── Center ───────────────────────────────────────────────────── */}
        {showTopBarExtras && (
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
              disabled={!canUndo}
              onClick={() => dispatch({ type: "HISTORY_UNDO" })}
              title="실행취소 (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
              disabled={!canRedo}
              onClick={() => dispatch({ type: "HISTORY_REDO" })}
              title="다시실행 (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ── Right ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5">
          {showSidePanels && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
                onClick={() => dispatch({ type: "TOGGLE_LEFT_PANEL" })}
                title="왼쪽 패널"
              >
                {state.ui.leftCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
                onClick={() => dispatch({ type: "TOGGLE_RIGHT_PANEL" })}
                title="오른쪽 패널"
              >
                {state.ui.rightCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
              </Button>
              <div className="w-px h-4 bg-white/[0.06] mx-1" />
            </>
          )}

          {showTopBarExtras && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
                onClick={handleDownload}
                title="현재 컷 다운로드"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                onClick={handleSave}
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{saved ? "저장됨" : "저장"}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                onClick={handlePreview}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">미리보기</span>
              </Button>
            </>
          )}

          <button
            onClick={() => setPublishOpen(true)}
            className="h-8 px-3 ml-1 rounded-lg bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-xs flex items-center gap-1.5 hover:shadow-[0_0_16px_rgba(0,229,204,0.3)] transition-shadow active:scale-95"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>발행</span>
          </button>
        </div>
      </header>

      <PublishDialog open={publishOpen} onClose={() => setPublishOpen(false)} />
    </>
  );
}
