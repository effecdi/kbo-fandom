import { WorkspaceProvider } from "@/contexts/workspace-context";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { EditorAutoStart } from "@/components/workspace/EditorAutoStart";

export function StudioEditor() {
  return (
    <WorkspaceProvider>
      <EditorAutoStart />
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}
