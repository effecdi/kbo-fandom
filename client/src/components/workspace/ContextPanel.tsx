import { useState } from "react";
import {
  Layers,
  User,
  Image,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SceneTree } from "./SceneTree";
import { CharacterLibrary } from "./CharacterLibrary";
import { AssetBrowser } from "./AssetBrowser";

type Section = "scenes" | "characters" | "assets";

const sections: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "scenes", label: "씬 트리", icon: Layers },
  { id: "characters", label: "캐릭터", icon: User },
  { id: "assets", label: "에셋", icon: Image },
];

export function ContextPanel() {
  const [openSections, setOpenSections] = useState<Set<Section>>(
    new Set(["scenes", "characters"])
  );

  function toggle(section: Section) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-1">
        {sections.map(({ id, label, icon: Icon }) => (
          <div key={id}>
            <button
              onClick={() => toggle(id)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              {openSections.has(id) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
            {openSections.has(id) && (
              <div className="pl-2 pb-2">
                {id === "scenes" && <SceneTree />}
                {id === "characters" && <CharacterLibrary />}
                {id === "assets" && <AssetBrowser />}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
