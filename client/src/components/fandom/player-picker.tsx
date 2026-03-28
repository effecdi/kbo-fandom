import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { listItems, STORE_KEYS, type KboTeam, type KboPlayer } from "@/lib/local-store";

const themeColor = "var(--fandom-primary, #7B2FF7)";

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

  return (
    <div className="space-y-4">
      {/* Group selection */}
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">구단 선택</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

      {/* Member selection */}
      {selectedGroupId && filteredMembers.length > 0 && (
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            선수 태그 (선택)
          </label>
          <div className="flex flex-wrap gap-2">
            {filteredMembers.map((member) => {
              const isSelected = selectedMembers.includes(member.id);
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
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: member.color }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-medium">{member.name}</span>
                  <span className="text-[13px] text-muted-foreground">{member.position}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
