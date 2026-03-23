import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspace } from "@/hooks/use-workspace";
import { useProgressiveUI } from "@/hooks/use-progressive-ui";
import { useWorkspaceShortcuts } from "@/hooks/use-workspace-shortcuts";
import { TopBar } from "./TopBar";
import { ContextPanel } from "./ContextPanel";
import { CanvasArea } from "./CanvasArea";
import { PropertiesPanel } from "./PropertiesPanel";
import { StoryboardStrip } from "./StoryboardStrip";
import { CopilotDock } from "./CopilotDock";
import { OnboardingOverlay } from "./OnboardingOverlay";
import { ModuleDialog } from "./ModuleDialog";

export function WorkspaceShell() {
  const { state } = useWorkspace();
  const { showToolbar, showSidePanels, showStoryboard } = useProgressiveUI();
  useWorkspaceShortcuts();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* TopBar - always visible but adapts */}
      <TopBar />

      {/* Main workspace area */}
      <div className="flex-1 flex flex-col min-h-0">
        {showStoryboard ? (
          <ResizablePanelGroup direction="vertical" className="flex-1">
            {/* Main horizontal area */}
            <ResizablePanel defaultSize={85} minSize={60}>
              <ResizablePanelGroup direction="horizontal">
                {/* Left: Context Panel - only in pro mode or when toggled */}
                {showSidePanels && !state.ui.leftCollapsed && (
                  <>
                    <ResizablePanel
                      defaultSize={18}
                      minSize={12}
                      maxSize={30}
                      className="bg-card border-r border-border"
                    >
                      <ContextPanel />
                    </ResizablePanel>
                    <ResizableHandle />
                  </>
                )}

                {/* Center: Canvas */}
                <ResizablePanel defaultSize={showSidePanels ? 58 : 70} minSize={30}>
                  <CanvasArea />
                </ResizablePanel>

                {/* Right: Properties - only in pro mode or when toggled */}
                {showSidePanels && !state.ui.rightCollapsed && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel
                      defaultSize={24}
                      minSize={16}
                      maxSize={35}
                      className="bg-card border-l border-border"
                    >
                      <ScrollArea className="h-full">
                        <PropertiesPanel />
                      </ScrollArea>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle />

            {/* Bottom: Storyboard Strip */}
            <ResizablePanel
              defaultSize={15}
              minSize={8}
              maxSize={25}
              className="bg-card border-t border-border"
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
      {/* Add padding to main content so dock doesn't overlap */}
      <div className="h-20 shrink-0" />
      <CopilotDock />

      {/* Onboarding overlay - first-time experience */}
      <OnboardingOverlay />

      {/* Module dialog for legacy editors */}
      <ModuleDialog />
    </div>
  );
}
