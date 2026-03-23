import { useCallback } from "react";
import { useWorkspace } from "./use-workspace";

/**
 * Progressive Disclosure hook.
 * Tracks user interactions and auto-escalates UI level.
 *
 * beginner (0-2 interactions): minimal UI, copilot focused
 * intermediate (3-7): toolbar visible, side panels toggle-able
 * pro (8+): full workspace, all tools visible
 */
export function useProgressiveUI() {
  const { state, dispatch } = useWorkspace();

  const recordInteraction = useCallback(() => {
    dispatch({ type: "INCREMENT_INTERACTION" });
  }, [dispatch]);

  const forceLevel = useCallback(
    (level: "beginner" | "intermediate" | "pro") => {
      dispatch({ type: "SET_UI_LEVEL", level });
    },
    [dispatch]
  );

  const showToolbar = state.uiLevel !== "beginner";
  const showSidePanels = state.uiLevel === "pro";
  const showStoryboard = state.uiLevel !== "beginner";
  const showTopBarExtras = state.uiLevel !== "beginner";

  return {
    uiLevel: state.uiLevel,
    interactionCount: state.interactionCount,
    recordInteraction,
    forceLevel,
    showToolbar,
    showSidePanels,
    showStoryboard,
    showTopBarExtras,
  };
}
