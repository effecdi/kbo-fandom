import { useCallback, useRef } from "react";
import type { CanvaEditorHandle } from "@/components/canva-editor/types";
import { useWorkspace, useActiveCut } from "./use-workspace";

export function useCanvasSync(canvasRef: React.RefObject<CanvaEditorHandle | null>) {
  const { dispatch } = useWorkspace();
  const activeCut = useActiveCut();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const saveCanvas = useCallback(() => {
    if (!activeCut || !canvasRef.current) return;
    const json = canvasRef.current.toJSON();
    dispatch({
      type: "UPDATE_CUT_CANVAS",
      cutId: activeCut.id,
      canvasJSON: json,
    });
  }, [activeCut, canvasRef, dispatch]);

  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveCanvas, 500);
  }, [saveCanvas]);

  const loadCanvas = useCallback(() => {
    if (!activeCut || !canvasRef.current) return;
    if (activeCut.canvasJSON) {
      canvasRef.current.loadJSON(activeCut.canvasJSON);
    } else {
      canvasRef.current.clear();
    }
  }, [activeCut, canvasRef]);

  return { saveCanvas, debouncedSave, loadCanvas };
}
