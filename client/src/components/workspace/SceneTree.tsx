import { ChevronRight, Plus, Trash2, Layers } from "lucide-react";
import { useWorkspace, useActiveScene } from "@/hooks/use-workspace";
import { genId } from "@/contexts/workspace-context";
import type { Scene, Cut } from "@/lib/workspace-types";

export function SceneTree() {
  const { state, dispatch } = useWorkspace();
  const activeScene = useActiveScene();

  function addScene() {
    dispatch({ type: "HISTORY_PUSH" });
    const sceneId = genId("scene");
    const cutId = genId("cut");
    const scene: Scene = {
      id: sceneId,
      title: `씬 ${state.scenes.length + 1}`,
      order: state.scenes.length + 1,
      cuts: [
        {
          id: cutId,
          sceneId,
          order: 1,
          canvasJSON: null,
          thumbnailUrl: null,
          backgroundImageUrl: null,
        },
      ],
    };
    dispatch({ type: "ADD_SCENE", scene });
    dispatch({ type: "SET_ACTIVE_SCENE", sceneId });
    dispatch({ type: "SET_ACTIVE_CUT", cutId });
  }

  function addCut(sceneId: string) {
    dispatch({ type: "HISTORY_PUSH" });
    const scene = state.scenes.find((s) => s.id === sceneId);
    const cut: Cut = {
      id: genId("cut"),
      sceneId,
      order: (scene?.cuts.length ?? 0) + 1,
      canvasJSON: null,
      thumbnailUrl: null,
      backgroundImageUrl: null,
    };
    dispatch({ type: "ADD_CUT", sceneId, cut });
    dispatch({ type: "SET_ACTIVE_CUT", cutId: cut.id });
  }

  return (
    <div className="space-y-1">
      {state.scenes.map((scene) => (
        <div key={scene.id}>
          <button
            onClick={() => {
              dispatch({ type: "SET_ACTIVE_SCENE", sceneId: scene.id });
              if (scene.cuts[0]) {
                dispatch({ type: "SET_ACTIVE_CUT", cutId: scene.cuts[0].id });
              }
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
              scene.id === state.activeSceneId
                ? "bg-[#00e5cc]/10 text-[#00e5cc]"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <ChevronRight
              className={`w-3 h-3 transition-transform ${
                scene.id === state.activeSceneId ? "rotate-90" : ""
              }`}
            />
            <span className="font-medium">{scene.title}</span>
            {state.scenes.length > 1 && (
              <Trash2
                className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "HISTORY_PUSH" });
                  dispatch({ type: "REMOVE_SCENE", sceneId: scene.id });
                }}
              />
            )}
          </button>

          {scene.id === activeScene?.id && (
            <div className="ml-5 space-y-0.5 mt-0.5">
              {scene.cuts.map((cut) => (
                <button
                  key={cut.id}
                  onClick={() =>
                    dispatch({ type: "SET_ACTIVE_CUT", cutId: cut.id })
                  }
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors ${
                    cut.id === state.activeCutId
                      ? "bg-[#00e5cc]/5 text-[#00e5cc]"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>컷 {cut.order}</span>
                  {scene.cuts.length > 1 && (
                    <Trash2
                      className="w-3 h-3 ml-auto opacity-0 hover:opacity-100 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "HISTORY_PUSH" });
                        dispatch({ type: "REMOVE_CUT", cutId: cut.id });
                      }}
                    />
                  )}
                </button>
              ))}
              <button
                onClick={() => addCut(scene.id)}
                className="w-full flex items-center gap-2 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>컷 추가</span>
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addScene}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-muted transition-colors mt-2"
      >
        <Plus className="w-3 h-3" />
        <span>씬 추가</span>
      </button>
    </div>
  );
}
