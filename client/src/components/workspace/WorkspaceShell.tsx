import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
// ScrollArea removed – PropertiesPanel manages its own scroll
import { useWorkspace } from "@/hooks/use-workspace";
import { useProgressiveUI } from "@/hooks/use-progressive-ui";
import { useWorkspaceShortcuts } from "@/hooks/use-workspace-shortcuts";
import { useEffect } from "react";
import { TopBar } from "./TopBar";
import { ContextPanel } from "./ContextPanel";
import { CanvasArea } from "./CanvasArea";
import { PropertiesPanel } from "./PropertiesPanel";
import { StoryboardStrip } from "./StoryboardStrip";
import { CopilotDock } from "./CopilotDock";
import { OnboardingOverlay } from "./OnboardingOverlay";
import { ModuleDialog } from "./ModuleDialog";
import { EditorAutoStart } from "./EditorAutoStart";

export function WorkspaceShell() {
  const { state } = useWorkspace();
  const { showToolbar, showSidePanels, showStoryboard } = useProgressiveUI();
  useWorkspaceShortcuts();

  // ── Fandom theme CSS variables ────────────────────────────────────────
  useEffect(() => {
    const meta = state.fandomMeta;
    if (meta) {
      document.documentElement.style.setProperty("--fandom-accent", meta.coverColor);
      document.documentElement.style.setProperty("--fandom-accent-20", meta.coverColor + "33");
      document.documentElement.style.setProperty("--fandom-accent-10", meta.coverColor + "1a");
    } else {
      document.documentElement.style.removeProperty("--fandom-accent");
      document.documentElement.style.removeProperty("--fandom-accent-20");
      document.documentElement.style.removeProperty("--fandom-accent-10");
    }
    return () => {
      document.documentElement.style.removeProperty("--fandom-accent");
      document.documentElement.style.removeProperty("--fandom-accent-20");
      document.documentElement.style.removeProperty("--fandom-accent-10");
    };
  }, [state.fandomMeta]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0e]">
      {/* TopBar - always visible but adapts */}
      <TopBar />

      {/* Main workspace area */}
      <div className="flex-1 flex flex-col min-h-0">
        {showStoryboard ? (
          <ResizablePanelGroup direction="vertical" className="flex-1">
            {/* Main horizontal area */}
            <ResizablePanel defaultSize={85} minSize={60}>
              <div className="h-full flex">
                {/* Left: Context Panel — icon rail always, content on tab click */}
                {showSidePanels && <ContextPanel />}

                {/* Center: Canvas — fills remaining space */}
                <div className="flex-1 min-w-0 h-full">
                  <CanvasArea />
                </div>

                {/* Right: Properties — icon rail always, content on tab click */}
                {showSidePanels && <PropertiesPanel />}
              </div>
            </ResizablePanel>

            <ResizableHandle className="h-px bg-white/[0.04] hover:bg-primary/30 transition-colors" />

            {/* Bottom: Storyboard Strip */}
            <ResizablePanel
              defaultSize={15}
              minSize={8}
              maxSize={25}
              className="bg-[#0c0c10] border-t border-white/[0.04]"
            >
              <StoryboardStrip />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* Beginner mode: full-screen canvas, no storyboard, no side panels */
          <div className="flex-1">
            <CanvasArea />
          </div>
        )}
      </div>

      {/* Copilot Dock - always present at bottom */}
      <div className="h-20 shrink-0" />
      <CopilotDock />

      {/* Onboarding overlay - first-time experience */}
      <OnboardingOverlay />

      {/* Module dialog for legacy editors */}
      <ModuleDialog />

      {/* Auto-start: project load, fandom mode, auto-prompt */}
      <EditorAutoStart />
    </div>
  );
}
