import { useState, useEffect } from "react";
import { Heart, Star, ChevronDown, ChevronRight, Palette } from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { listItems, STORE_KEYS, getPlayerPhotoUrl, type KboPlayer } from "@/lib/local-store";
import {
  STYLE_PRESETS,
  POSE_CHIPS,
  OUTFIT_CHIPS,
  POSE_OUTFIT_TEMPLATES,
} from "@/lib/fandom-templates";
import type { FandomStylePreset } from "@/lib/workspace-types";

export function MemberPanel() {
  const { state, dispatch } = useWorkspace();
  const { sendMessage } = useCopilot();
  const [members, setMembers] = useState<KboPlayer[]>([]);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const meta = state.fandomMeta;

  useEffect(() => {
    if (!meta) return;
    const all = listItems<KboPlayer>(STORE_KEYS.KBO_PLAYERS);
    setMembers(all.filter((m) => m.groupId === meta.groupId));
  }, [meta]);

  if (!meta) return null;

  const isTagged = (name: string) => meta.memberTags.includes(name);
  const showPoseOutfit = POSE_OUTFIT_TEMPLATES.includes(meta.templateType);
  const currentStyle = meta.stylePreset;

  function handleStylePreset(preset: FandomStylePreset) {
    dispatch({ type: "SET_FANDOM_STYLE_PRESET", preset });
    const styleDef = STYLE_PRESETS.find((s) => s.id === preset);
    if (styleDef) {
      sendMessage(`${styleDef.label} 스타일로 변경해줘`);
    }
  }

  function toggleMember(memberId: string) {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div
        className="rounded-xl px-3 py-2.5 flex items-center gap-2"
        style={{ backgroundColor: meta.coverColor + "20" }}
      >
        <Heart className="w-4 h-4" style={{ color: meta.coverColor }} />
        <span className="text-[13px] font-bold text-white/90">{meta.groupName} 선수</span>
        <span className="text-[13px] text-white/40 ml-auto">{members.length}명</span>
      </div>

      {/* Style Presets Section */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <Palette className="w-3 h-3 text-white/40" />
          <span className="text-[13px] text-white/40 font-medium">아트 스타일</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {STYLE_PRESETS.slice(0, 6).map((style) => (
            <button
              key={style.id}
              onClick={() => handleStylePreset(style.id)}
              className={`px-2 py-1 rounded-md text-[13px] font-medium transition-all ${
                currentStyle === style.id
                  ? "text-white"
                  : "text-white/40 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.08]"
              }`}
              style={currentStyle === style.id ? { backgroundColor: meta.coverColor } : {}}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Member list */}
      <div className="space-y-0.5">
        {members.map((member) => {
          const tagged = isTagged(member.name);
          const isExpanded = expandedMember === member.id;
          return (
            <div key={member.id}>
              {/* Member row */}
              <button
                onClick={() => toggleMember(member.id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.06] transition-all group text-left"
              >
                {/* Player photo avatar */}
                {member.pcode ? (
                  <div className="w-5 h-5 rounded-full shrink-0 overflow-hidden ring-1 ring-white/10">
                    <img
                      src={getPlayerPhotoUrl(member.pcode)}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "block";
                      }}
                    />
                    <div
                      className="w-full h-full rounded-full hidden"
                      style={{ backgroundColor: member.color }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/10"
                    style={{ backgroundColor: member.color }}
                  />
                )}

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                      {member.name}
                    </span>
                    {tagged && (
                      <Star className="w-3 h-3 shrink-0" style={{ color: meta.coverColor, fill: meta.coverColor }} />
                    )}
                  </div>
                  <span className="text-[13px] text-white/30 block truncate">
                    {member.nameKo} · {member.position}
                  </span>
                </div>

                {/* Expand indicator */}
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/0 group-hover:text-white/30 transition-colors shrink-0" />
                )}
              </button>

              {/* Expanded member menu */}
              {isExpanded && (
                <div className="ml-6 mb-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {/* Quick draw button */}
                  <button
                    onClick={() => sendMessage(`${member.name}을(를) 그려줘`)}
                    className="w-full px-3 py-2 rounded-lg text-[13px] font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: meta.coverColor }}
                  >
                    바로 그리기
                  </button>

                  {/* Pose options (for portrait/photocard/concept) */}
                  {showPoseOutfit && (
                    <div>
                      <p className="text-[13px] text-white/30 font-medium mb-1 px-1">포즈</p>
                      <div className="flex flex-wrap gap-1">
                        {POSE_CHIPS.slice(0, 4).map((pose) => (
                          <button
                            key={pose}
                            onClick={() => sendMessage(`${member.name} ${pose} 포즈로 그려줘`)}
                            className="px-2 py-1 rounded-md text-[13px] font-medium text-white/50 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/80 transition-all"
                          >
                            {pose}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style options */}
                  <div>
                    <p className="text-[13px] text-white/30 font-medium mb-1 px-1">스타일</p>
                    <div className="flex flex-wrap gap-1">
                      {STYLE_PRESETS.slice(0, 4).map((style) => (
                        <button
                          key={style.id}
                          onClick={() => sendMessage(`${member.name} ${style.label} 스타일로 그려줘`)}
                          className="px-2 py-1 rounded-md text-[13px] font-medium text-white/50 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/80 transition-all"
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outfit options (for portrait/photocard/concept) */}
                  {showPoseOutfit && (
                    <div>
                      <p className="text-[13px] text-white/30 font-medium mb-1 px-1">의상</p>
                      <div className="flex flex-wrap gap-1">
                        {OUTFIT_CHIPS.slice(0, 4).map((outfit) => (
                          <button
                            key={outfit}
                            onClick={() => sendMessage(`${member.name} ${outfit} 입고 그려줘`)}
                            className="px-2 py-1 rounded-md text-[13px] font-medium text-white/50 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/80 transition-all"
                          >
                            {outfit}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
