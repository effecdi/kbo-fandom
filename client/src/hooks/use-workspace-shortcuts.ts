import { useEffect } from "react";
import { useWorkspace, useCanvasRef } from "./use-workspace";

export function useWorkspaceShortcuts() {
  const { state, dispatch, canvasRef } = useWorkspace();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      // Undo: Cmd/Ctrl+Z
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "HISTORY_UNDO" });
        return;
      }

      // Redo: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
      if (isMod && ((e.key === "z" && e.shiftKey) || e.key === "y")) {
        e.preventDefault();
        dispatch({ type: "HISTORY_REDO" });
        return;
      }

      // Save: Cmd/Ctrl+S
      if (isMod && e.key === "s") {
        e.preventDefault();
        try {
          const data = {
            project: state.project,
            scenes: state.scenes,
            activeSceneId: state.activeSceneId,
            activeCutId: state.activeCutId,
            canvasAspectRatio: state.canvasAspectRatio,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(
            `olli-project-${state.project.id}`,
            JSON.stringify(data)
          );
        } catch {
          // storage full
        }
        return;
      }

      // Toggle left panel: Cmd/Ctrl+[
      if (isMod && e.key === "[") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_LEFT_PANEL" });
        return;
      }

      // Toggle right panel: Cmd/Ctrl+]
      if (isMod && e.key === "]") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_RIGHT_PANEL" });
        return;
      }

      // Zoom: Cmd/Ctrl + +/-
      if (isMod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        dispatch({
          type: "SET_ZOOM",
          zoom: Math.min(200, state.ui.zoom + 10),
        });
        return;
      }
      if (isMod && e.key === "-") {
        e.preventDefault();
        dispatch({
          type: "SET_ZOOM",
          zoom: Math.max(25, state.ui.zoom - 10),
        });
        return;
      }

      // Escape: close module dialog or deselect
      if (e.key === "Escape") {
        if (state.activeModule) {
          dispatch({ type: "SET_ACTIVE_MODULE", module: null });
        } else if (state.selectedObjectIds.length > 0) {
          dispatch({ type: "SELECT_OBJECTS", objectIds: [] });
        }
        return;
      }

      // Delete selected canvas objects
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          state.selectedObjectIds.length > 0 &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          const fc = canvasRef.current?.getCanvas();
          if (fc) {
            const active = fc.getActiveObject();
            if (active) {
              fc.remove(active);
              fc.requestRenderAll();
            }
          }
          dispatch({ type: "SELECT_OBJECTS", objectIds: [] });
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, canvasRef, state.ui.zoom, state.activeModule, state.selectedObjectIds, state.project, state.scenes, state.activeSceneId, state.activeCutId, state.canvasAspectRatio]);
}
