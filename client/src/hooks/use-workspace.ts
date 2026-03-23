import { useContext, useMemo } from "react";
import { WorkspaceContext } from "@/contexts/workspace-context";

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function useCanvasRef() {
  const { canvasRef } = useWorkspace();
  return canvasRef;
}

export function useActiveScene() {
  const { state } = useWorkspace();
  return useMemo(
    () => state.scenes.find((s) => s.id === state.activeSceneId) ?? state.scenes[0],
    [state.scenes, state.activeSceneId]
  );
}

export function useActiveCut() {
  const { state } = useWorkspace();
  return useMemo(() => {
    for (const scene of state.scenes) {
      const cut = scene.cuts.find((c) => c.id === state.activeCutId);
      if (cut) return cut;
    }
    return state.scenes[0]?.cuts[0] ?? null;
  }, [state.scenes, state.activeCutId]);
}

export function useAllCuts() {
  const { state } = useWorkspace();
  return useMemo(() => state.scenes.flatMap((s) => s.cuts), [state.scenes]);
}
