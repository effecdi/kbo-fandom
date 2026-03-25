import { useEffect } from "react";
import { Group, ActiveSelection } from "fabric";
import { useWorkspace, useCanvasRef } from "./use-workspace";

export function useWorkspaceShortcuts() {
  const { state, dispatch, canvasRef } = useWorkspace();

  useEffect(() => {
    function isInput(e: KeyboardEvent) {
      return (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      const fc = canvasRef.current?.getCanvas();

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

      // ── Group: Cmd/Ctrl+G ──
      if (isMod && e.key === "g" && !e.shiftKey) {
        e.preventDefault();
        if (!fc) return;
        const active = fc.getActiveObject();
        if (!active || active.type !== "activeselection") return;
        const sel = active as ActiveSelection;
        const objects = sel.getObjects();
        if (objects.length < 2) return;
        fc.discardActiveObject();
        const group = new Group(objects, {
          subTargetCheck: true,
          interactive: true,
        });
        objects.forEach((o: any) => fc.remove(o));
        fc.add(group);
        fc.setActiveObject(group);
        fc.requestRenderAll();
        return;
      }

      // ── Ungroup: Cmd/Ctrl+Shift+G ──
      if (isMod && e.key === "G" && e.shiftKey) {
        e.preventDefault();
        if (!fc) return;
        const active = fc.getActiveObject();
        if (!active || active.type !== "group") return;
        const group = active as Group;
        const items = group.getObjects();
        const groupLeft = group.left || 0;
        const groupTop = group.top || 0;
        fc.remove(group);
        items.forEach((item: any) => {
          item.set({
            left: (item.left || 0) + groupLeft + (group.width || 0) / 2,
            top: (item.top || 0) + groupTop + (group.height || 0) / 2,
          });
          fc.add(item);
        });
        fc.discardActiveObject();
        fc.requestRenderAll();
        return;
      }

      // ── Copy: Cmd/Ctrl+C ──
      if (isMod && e.key === "c" && !isInput(e)) {
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (!obj) return;
        e.preventDefault();
        obj.clone().then((cloned: any) => {
          (window as any).__olli_clipboard = cloned;
        });
        return;
      }

      // ── Cut: Cmd/Ctrl+X ──
      if (isMod && e.key === "x" && !isInput(e)) {
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (!obj) return;
        e.preventDefault();
        obj.clone().then((cloned: any) => {
          (window as any).__olli_clipboard = cloned;
          fc.getActiveObjects().forEach((o: any) => fc.remove(o));
          fc.discardActiveObject();
          fc.requestRenderAll();
        });
        dispatch({ type: "SELECT_OBJECTS", objectIds: [] });
        return;
      }

      // ── Paste: Cmd/Ctrl+V ──
      if (isMod && e.key === "v" && !isInput(e)) {
        if (!fc) return;
        const cloned = (window as any).__olli_clipboard;
        if (!cloned) return;
        e.preventDefault();
        cloned.clone().then((pasted: any) => {
          pasted.set({ left: (pasted.left || 0) + 20, top: (pasted.top || 0) + 20 });
          fc.add(pasted);
          (window as any).__olli_clipboard = pasted;
          fc.setActiveObject(pasted);
          fc.requestRenderAll();
        });
        return;
      }

      // ── Duplicate: Cmd/Ctrl+D ──
      if (isMod && e.key === "d") {
        e.preventDefault();
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (!obj) return;
        obj.clone().then((cloned: any) => {
          cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
          fc.add(cloned);
          fc.setActiveObject(cloned);
          fc.requestRenderAll();
        });
        return;
      }

      // ── Lock toggle: Cmd/Ctrl+L ──
      if (isMod && e.key === "l") {
        e.preventDefault();
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (!obj) return;
        const locked = !obj.lockMovementX;
        obj.set({
          lockMovementX: locked, lockMovementY: locked,
          lockRotation: locked, lockScalingX: locked, lockScalingY: locked,
          hasControls: !locked,
        });
        fc.requestRenderAll();
        return;
      }

      // ── Bring Forward: Cmd/Ctrl+] ──
      if (isMod && e.key === "]" && !e.shiftKey) {
        e.preventDefault();
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (obj) { fc.bringObjectForward(obj); fc.requestRenderAll(); }
        return;
      }

      // ── Send Backward: Cmd/Ctrl+[ ──
      if (isMod && e.key === "[" && !e.shiftKey) {
        e.preventDefault();
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (obj) { fc.sendObjectBackwards(obj); fc.requestRenderAll(); }
        return;
      }

      // ── Bring to Front: Cmd/Ctrl+Shift+] ──
      if (isMod && e.key === "}" && e.shiftKey) {
        e.preventDefault();
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (obj) { fc.bringObjectToFront(obj); fc.requestRenderAll(); }
        return;
      }

      // ── Send to Back: Cmd/Ctrl+Shift+[ ──
      if (isMod && e.key === "{" && e.shiftKey) {
        e.preventDefault();
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (obj) { fc.sendObjectToBack(obj); fc.requestRenderAll(); }
        return;
      }

      // ── Select All: Cmd/Ctrl+A ──
      if (isMod && e.key === "a" && !isInput(e)) {
        e.preventDefault();
        if (!fc) return;
        const objs = fc.getObjects();
        if (objs.length === 0) return;
        fc.discardActiveObject();
        const sel = new ActiveSelection(objs, { canvas: fc });
        fc.setActiveObject(sel);
        fc.requestRenderAll();
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
          if (fc) { fc.discardActiveObject(); fc.requestRenderAll(); }
        }
        return;
      }

      // Delete selected canvas objects
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          state.selectedObjectIds.length > 0 &&
          !isInput(e)
        ) {
          if (fc) {
            fc.getActiveObjects().forEach((o: any) => fc.remove(o));
            fc.discardActiveObject();
            fc.requestRenderAll();
          }
          dispatch({ type: "SELECT_OBJECTS", objectIds: [] });
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, canvasRef, state.ui.zoom, state.activeModule, state.selectedObjectIds, state.project, state.scenes, state.activeSceneId, state.activeCutId, state.canvasAspectRatio]);
}
