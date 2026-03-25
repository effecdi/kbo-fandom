import { useState, useEffect } from "react";
import {
  Image,
  Sparkles,
  Shapes,
  Pen,
  Wand2,
  BookOpen,
  Heart,
  Sticker,
  Wrench,
  Users,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/hooks/use-workspace";
import { ImagePanel } from "./panels/ImagePanel";
import { AIPanel } from "./panels/AIPanel";
import { ElementsPanel } from "./panels/ElementsPanel";
import { ToolsPanel } from "./panels/ToolsPanel";
import { GenerativePanel } from "./panels/GenerativePanel";
import { GuidePanel } from "./panels/GuidePanel";
import { MemberPanel } from "./panels/MemberPanel";
import { StickerPanel } from "./panels/StickerPanel";
import { FandomToolsPanel } from "./panels/FandomToolsPanel";
import { CommunityPanel } from "./panels/CommunityPanel";

// ─── Tab definitions ────────────────────────────────────────────────────────

export type LeftTab = "members" | "fandom-tools" | "stickers" | "community" | "image" | "ai" | "elements" | "tools" | "generative" | "guide";

const baseTabs: { id: LeftTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "image", label: "이미지", icon: Image },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "elements", label: "요소", icon: Shapes },
  { id: "tools", label: "도구", icon: Pen },
  { id: "generative", label: "생성", icon: Wand2 },
  { id: "guide", label: "가이드", icon: BookOpen },
];

const fandomTabs: typeof baseTabs = [
  { id: "members", label: "멤버", icon: Heart },
  { id: "fandom-tools", label: "팬덤도구", icon: Wrench },
  { id: "stickers", label: "스티커", icon: Sticker },
  { id: "community", label: "커뮤니티", icon: Users },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function ContextPanel() {
  const { state } = useWorkspace();
  const isFandom = !!state.fandomMeta;
  const tabs = isFandom ? [...fandomTabs, ...baseTabs] : baseTabs;

  const [activeTab, setActiveTab] = useState<LeftTab | null>(null);

  // Auto-open members tab when entering fandom mode
  useEffect(() => {
    if (isFandom && activeTab === null) {
      setActiveTab("members");
    }
  }, [isFandom]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTab = (id: LeftTab) => {
    setActiveTab((prev) => (prev === id ? null : id));
  };

  return (
    <div className="h-full flex shrink-0">
      {/* Icon rail — always visible */}
      <div className="w-[52px] shrink-0 border-r border-white/[0.04] bg-[#0e0e12] flex flex-col items-center py-2 gap-0.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => toggleTab(id)}
            className={cn(
              "w-11 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group relative",
              activeTab === id
                ? "bg-primary/10 text-primary"
                : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
            )}
            title={label}
          >
            <Icon className="w-5 h-5" />
            <span className={`left-icon-sidebar__label transition-opacity ${activeTab === id ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}>{label}</span>
            {activeTab === id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Panel content — only when a tab is active */}
      {activeTab && (
        <div className="w-[260px] shrink-0 border-r border-white/[0.04] bg-[#0c0c10]">
          <ScrollArea className="h-full">
            <div className="p-3">
              {activeTab === "members" && <MemberPanel />}
              {activeTab === "fandom-tools" && <FandomToolsPanel />}
              {activeTab === "stickers" && <StickerPanel />}
              {activeTab === "community" && <CommunityPanel />}
              {activeTab === "image" && <ImagePanel />}
              {activeTab === "ai" && <AIPanel />}
              {activeTab === "elements" && <ElementsPanel />}
              {activeTab === "tools" && <ToolsPanel />}
              {activeTab === "generative" && <GenerativePanel />}
              {activeTab === "guide" && <GuidePanel />}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
