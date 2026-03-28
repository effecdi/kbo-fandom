import { useEffect, useState } from "react";
import { listItems, STORE_KEYS, type KboTeam } from "@/lib/local-store";
import { TeamLogo } from "./team-logo";

const themeColor = "var(--fandom-primary, #7B2FF7)";

interface FandomFilterBarProps {
  selected: string | null;
  onChange: (groupId: string | null) => void;
}

export function FandomFilterBar({ selected, onChange }: FandomFilterBarProps) {
  const [groups, setGroups] = useState<KboTeam[]>([]);

  useEffect(() => {
    setGroups(listItems<KboTeam>(STORE_KEYS.KBO_TEAMS));
  }, []);

  return (
    <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
          selected === null
            ? "text-white"
            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        style={selected === null ? { background: themeColor } : undefined}
      >
        전체
      </button>
      {groups.map((group) => (
        <button
          key={group.id}
          onClick={() => onChange(group.id === selected ? null : group.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
            selected === group.id
              ? "text-white"
              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          style={selected === group.id ? { backgroundColor: group.coverColor } : undefined}
        >
          <TeamLogo team={group} size="xs" />
          {group.name}
        </button>
      ))}
    </div>
  );
}
