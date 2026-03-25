import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { FandomEventCard } from "@/components/fandom/fandom-event-card";
import { FandomFilterBar } from "@/components/fandom/fandom-filter-bar";
import { Sparkles, Clock, Trophy } from "lucide-react";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type FandomEvent,
} from "@/lib/local-store";

const themeColor = "var(--fandom-primary, #7B2FF7)";

type EventTab = "all" | "active" | "upcoming" | "ended";

const TABS: { id: EventTab; label: string; icon: typeof Sparkles }[] = [
  { id: "all", label: "전체", icon: Trophy },
  { id: "active", label: "진행중", icon: Sparkles },
  { id: "upcoming", label: "예정", icon: Clock },
  { id: "ended", label: "종료", icon: Trophy },
];

export function FandomEvents() {
  const [events, setEvents] = useState<FandomEvent[]>([]);
  const [tab, setTab] = useState<EventTab>("all");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  useEffect(() => {
    seedIfEmpty();
    setEvents(listItems<FandomEvent>(STORE_KEYS.FANDOM_EVENTS));
  }, []);

  const filtered = events.filter((e) => {
    if (tab !== "all" && e.status !== tab) return false;
    if (groupFilter && e.groupId !== groupFilter) return false;
    return true;
  });

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">이벤트 / 챌린지</h1>
          <p className="text-sm text-muted-foreground mt-1">
            팬아트 챌린지, 콘테스트에 참여하고 상품을 받아가세요
          </p>
        </div>

        {/* Group Filter */}
        <FandomFilterBar selected={groupFilter} onChange={setGroupFilter} />

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t.id
                  ? ""
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={tab === t.id ? { borderColor: themeColor, color: themeColor } : undefined}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">이벤트가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event) => (
              <FandomEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
