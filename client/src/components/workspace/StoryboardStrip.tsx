import { Plus, Layers, Trash2, Copy, GripVertical } from "lucide-react";
import { useWorkspace, useActiveScene, useActiveCut } from "@/hooks/use-workspace";
import { genId } from "@/contexts/workspace-context";
import type { Cut } from "@/lib/workspace-types";

export function StoryboardStrip() {
  const { state, dispatch } = useWorkspace();
  const activeScene = useActiveScene();
  const activeCut = useActiveCut();

  if (!activeScene) return null;

  function addCut() {
    dispatch({ type: "HISTORY_PUSH" });
    const cut: Cut = {
      id: genId("cut"),
      sceneId: activeScene.id,
      order: activeScene.cuts.length + 1,
      canvasJSON: null,
      thumbnailUrl: null,
      backgroundImageUrl: null,
    };
    dispatch({ type: "ADD_CUT", sceneId: activeScene.id, cut });
    dispatch({ type: "SET_ACTIVE_CUT", cutId: cut.id });
  }

  function duplicateCut(cut: Cut) {
    dispatch({ type: "HISTORY_PUSH" });
    const newCut: Cut = {
      id: genId("cut"),
      sceneId: activeScene.id,
      order: activeScene.cuts.length + 1,
      canvasJSON: cut.canvasJSON ? JSON.parse(JSON.stringify(cut.canvasJSON)) : null,
      thumbnailUrl: cut.thumbnailUrl,
      backgroundImageUrl: cut.backgroundImageUrl,
      scriptTop: cut.scriptTop ? { ...cut.scriptTop } : null,
      scriptBottom: cut.scriptBottom ? { ...cut.scriptBottom } : null,
    };
    dispatch({ type: "ADD_CUT", sceneId: activeScene.id, cut: newCut });
    dispatch({ type: "SET_ACTIVE_CUT", cutId: newCut.id });
  }

  function removeCut(cutId: string) {
    if (activeScene.cuts.length <= 1) return;
    dispatch({ type: "HISTORY_PUSH" });
    dispatch({ type: "REMOVE_CUT", cutId });
  }

  return (
    <div className="h-full flex items-center px-4 gap-2">
      {/* Scene label */}
      <div className="flex items-center gap-1.5 shrink-0 mr-1">
        <Layers className="w-5 h-5 text-primary/40" />
        <span className="text-[12px] text-white/30 font-medium">{activeScene.title}</span>
        <span className="text-[12px] text-white/15">({activeScene.cuts.length}컷)</span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-white/[0.04] shrink-0" />

      {/* Cut thumbnails */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
        {activeScene.cuts.map((cut, idx) => {
          const isActive = cut.id === state.activeCutId;
          return (
            <div
              key={cut.id}
              className={`shrink-0 relative group transition-all ${
                isActive ? "scale-105" : "hover:scale-[1.02]"
              }`}
            >
              <button
                onClick={() => dispatch({ type: "SET_ACTIVE_CUT", cutId: cut.id })}
                className={`w-[60px] h-[80px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 overflow-hidden transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-[0_0_16px_rgba(0,229,204,0.15)]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                }`}
              >
                {cut.thumbnailUrl ? (
                  <img
                    src={cut.thumbnailUrl}
                    alt={`컷 ${cut.order}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center">
                      <Layers className="w-5 h-5 text-white/15" />
                    </div>
                    <span className="text-[12px] text-white/20 font-medium">
                      컷 {cut.order}
                    </span>
                  </>
                )}
              </button>

              {/* Order badge */}
              <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-md flex items-center justify-center text-[12px] font-bold ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/[0.06] text-white/30"
              }`}>
                {idx + 1}
              </div>

              {/* Hover actions */}
              <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateCut(cut); }}
                  className="w-5 h-5 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary/30 transition-colors"
                  title="복제"
                >
                  <Copy className="w-2.5 h-2.5 text-white/60" />
                </button>
                {activeScene.cuts.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCut(cut.id); }}
                    className="w-5 h-5 rounded-md bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/30 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-2.5 h-2.5 text-white/60" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add cut button */}
        <button
          onClick={addCut}
          className="shrink-0 w-[60px] h-[80px] rounded-xl border-2 border-dashed border-white/[0.06] flex flex-col items-center justify-center gap-1 hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
        >
          <Plus className="w-5 h-5 text-white/20" />
          <span className="text-[12px] text-white/15">추가</span>
        </button>
      </div>
    </div>
  );
}
