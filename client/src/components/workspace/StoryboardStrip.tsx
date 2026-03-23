import { Plus, Layers } from "lucide-react";
import { useWorkspace, useActiveScene } from "@/hooks/use-workspace";
import { genId } from "@/contexts/workspace-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Cut } from "@/lib/workspace-types";

export function StoryboardStrip() {
  const { state, dispatch } = useWorkspace();
  const activeScene = useActiveScene();

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

  return (
    <div className="h-full flex items-center px-4 gap-3 overflow-x-auto">
      <span className="text-[10px] text-muted-foreground font-medium shrink-0 mr-1">
        {activeScene.title}
      </span>
      {activeScene.cuts.map((cut) => (
        <button
          key={cut.id}
          onClick={() => dispatch({ type: "SET_ACTIVE_CUT", cutId: cut.id })}
          className={`shrink-0 w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all overflow-hidden ${
            cut.id === state.activeCutId
              ? "border-[#00e5cc] bg-[#00e5cc]/5"
              : "border-border bg-muted hover:border-muted-foreground/30"
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
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                컷 {cut.order}
              </span>
            </>
          )}
        </button>
      ))}
      <button
        onClick={addCut}
        className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-[#00e5cc]/50 transition-colors"
      >
        <Plus className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
