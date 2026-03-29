import { useEffect, useState, useMemo } from "react";
import { Check } from "lucide-react";
import { listItems, STORE_KEYS, getPlayerPhotoUrl, type KboTeam, type KboPlayer } from "@/lib/local-store";

const themeColor = "var(--fandom-primary, #7B2FF7)";

const PITCHER_POSITIONS = ["투수"];
const ROLE_ORDER: Record<string, number> = {
  "에이스": 0, "선발": 1, "마감": 2, "셋업": 3, "중계": 4,
  "4번타자": 0, "3번타자": 1, "리드오프": 2, "핵심": 3, "주전": 4, "유망주": 5,
};

const ROLE_COLORS: Record<string, string> = {
  "에이스": "text-red-400 bg-red-500/15",
  "선발": "text-blue-400 bg-blue-500/15",
  "마감": "text-orange-400 bg-orange-500/15",
  "셋업": "text-amber-400 bg-amber-500/15",
  "중계": "text-slate-400 bg-slate-500/15",
  "4번타자": "text-red-400 bg-red-500/15",
  "3번타자": "text-orange-400 bg-orange-500/15",
  "리드오프": "text-emerald-400 bg-emerald-500/15",
  "핵심": "text-purple-400 bg-purple-500/15",
  "주전": "text-blue-400 bg-blue-500/15",
  "유망주": "text-cyan-400 bg-cyan-500/15",
};

interface PlayerPickerProps {
  selectedGroupId: string | null;
  selectedMembers: string[];
  onGroupChange: (groupId: string) => void;
  onMemberToggle: (memberId: string) => void;
}

export function PlayerPicker({
  selectedGroupId,
  selectedMembers,
  onGroupChange,
  onMemberToggle,
}: PlayerPickerProps) {
  const [groups, setGroups] = useState<KboTeam[]>([]);
  const [members, setMembers] = useState<KboPlayer[]>([]);

  useEffect(() => {
    setGroups(listItems<KboTeam>(STORE_KEYS.KBO_TEAMS));
    setMembers(listItems<KboPlayer>(STORE_KEYS.KBO_PLAYERS));
  }, []);

  const filteredMembers = selectedGroupId
    ? members.filter((m) => m.groupId === selectedGroupId)
    : [];

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  // 투수진 / 타선 분류
  const { pitchers, batters } = useMemo(() => {
    const p = filteredMembers.filter((m) => PITCHER_POSITIONS.includes(m.position));
    const b = filteredMembers.filter((m) => !PITCHER_POSITIONS.includes(m.position));
    const sortByRole = (a: KboPlayer, b: KboPlayer) =>
      (ROLE_ORDER[a.role || "주전"] ?? 99) - (ROLE_ORDER[b.role || "주전"] ?? 99);
    return { pitchers: p.sort(sortByRole), batters: b.sort(sortByRole) };
  }, [filteredMembers]);

  function renderPlayerChip(member: KboPlayer) {
    const isSelected = selectedMembers.includes(member.id);
    const roleColor = ROLE_COLORS[member.role || "주전"] || "text-muted-foreground bg-muted";
    return (
      <button
        key={member.id}
        onClick={() => onMemberToggle(member.id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
          isSelected
            ? "text-foreground"
            : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
        }`}
        style={isSelected ? { borderColor: themeColor, background: `color-mix(in srgb, ${themeColor} 10%, transparent)` } : undefined}
      >
        {member.pcode ? (
          <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/20">
            <img
              src={getPlayerPhotoUrl(member.pcode)}
              alt={member.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
            style={{ backgroundColor: member.color }}
          >
            {isSelected ? <Check className="w-3 h-3 text-white" /> : member.jerseyNumber}
          </div>
        )}
        <span className="font-medium">{member.name}</span>
        {member.role && (
          <span className={`px-1.5 py-0.5 rounded-md text-[13px] font-bold ${roleColor}`}>
            {member.role}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Group selection */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">구단 선택</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onGroupChange(group.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedGroupId === group.id
                  ? ""
                  : "border-border bg-card hover:border-muted-foreground"
              }`}
              style={selectedGroupId === group.id ? { borderColor: themeColor, background: `color-mix(in srgb, ${themeColor} 10%, transparent)` } : undefined}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold mb-2"
                style={{ backgroundColor: group.coverColor }}
              >
                {group.name.slice(0, 2)}
              </div>
              <p className="text-sm font-semibold text-foreground">{group.name}</p>
              <p className="text-[13px] text-muted-foreground">{group.fandomName}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Player selection - 투수진 / 타선 분류 */}
      {selectedGroupId && filteredMembers.length > 0 && (
        <div className="space-y-4">
          {/* 투수진 */}
          {pitchers.length > 0 && (
            <div>
              <label className="text-[15px] font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-[13px] font-bold text-orange-400 bg-orange-500/15">투수진</span>
                <span className="text-[13px] text-muted-foreground font-normal">{pitchers.length}명</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {pitchers.map(renderPlayerChip)}
              </div>
            </div>
          )}

          {/* 타선 */}
          {batters.length > 0 && (
            <div>
              <label className="text-[15px] font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-[13px] font-bold text-blue-400 bg-blue-500/15">타선</span>
                <span className="text-[13px] text-muted-foreground font-normal">{batters.length}명</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {batters.map(renderPlayerChip)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
