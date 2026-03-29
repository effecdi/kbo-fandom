import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import {
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Plus,
  Smile,
  Palette,
  X,
  UserCircle,
  Grid2x2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCopilot } from "@/hooks/use-copilot";
import { useWorkspace } from "@/hooks/use-workspace";
import { CopilotPreview } from "./CopilotPreview";
import { apiRequest } from "@/lib/queryClient";
import type { PinnedCharacter } from "@/lib/workspace-types";
import {
  getQuickActions,
  getTemplatePlaceholder,
  getOnboardingPrompts,
  isSingleImageTemplate,
  TEMPLATE_LABELS,
  STYLE_PRESETS,
  POSE_CHIPS,
  OUTFIT_CHIPS,
  MOOD_CHIPS,
  POSE_OUTFIT_TEMPLATES,
  BASEBALL_AESTHETIC_FILTERS,
  buildAutoPrompt,
  type FandomEditorMeta,
} from "@/lib/fandom-templates";

// ─── Quick Actions (always visible in dock bar) ─────────────────────────────

const QUICK_ACTIONS = [
  { id: "regen", icon: RefreshCw, label: "다시 생성", prompt: "전체 다시 생성해줘" },
  { id: "addcut", icon: Plus, label: "컷 추가", prompt: "새 컷 추가해줘" },
  { id: "expression", icon: Smile, label: "표정 변경", prompt: "캐릭터 표정을 변경해줘" },
  { id: "style", icon: Palette, label: "스타일", prompt: "스타일을 변경해줘" },
];

const FANDOM_QUICK_ACTIONS_FALLBACK = [
  { id: "regen", icon: RefreshCw, label: "팬아트 다시 생성", prompt: "팬아트를 다시 생성해줘" },
  { id: "addcut", icon: Plus, label: "컷 추가", prompt: "새 컷 추가해줘" },
  { id: "addmember", icon: UserCircle, label: "멤버 추가", prompt: "다른 멤버도 추가해줘" },
  { id: "style", icon: Palette, label: "팬아트 스타일", prompt: "팬아트 스타일을 변경해줘" },
];

const ICON_MAP: Record<string, typeof RefreshCw> = {
  regen: RefreshCw,
  pose: Smile,
  outfit: UserCircle,
  expression: Smile,
  style: Palette,
  mood: Palette,
  text: Plus,
  more: Plus,
  addcut: Plus,
  addmember: UserCircle,
  bg: Plus,
  filter: Palette,
  layout: Grid2x2,
};

const SLASH_COMMANDS = [
  { cmd: "/bubble", label: "말풍선 에디터" },
  { cmd: "/effects", label: "효과 에디터" },
  { cmd: "/auto", label: "AI 자동 생성" },
  { cmd: "/story", label: "스토리 에디터" },
  { cmd: "/chat", label: "채팅 메이커" },
  { cmd: "/pose", label: "포즈/표정" },
  { cmd: "/background", label: "배경 생성" },
  { cmd: "/photocard", label: "포토카드 모드" },
  { cmd: "/sticker", label: "스티커 추가" },
  { cmd: "/pro", label: "프로 모드 전환" },
];

const CUTS_OPTIONS = [2, 3, 4] as const;

// ─── Gallery character type ─────────────────────────────────────────────────

interface GalleryCharacter {
  id: number;
  name: string;
  imageUrl: string;
}

export function CopilotDock() {
  const {
    messages,
    isGenerating,
    suggestedChips,
    context,
    dockExpanded,
    input,
    pinnedCharacters,
    cutsCount,
    sendMessage,
    handleSlashCommand,
    setInput,
    toggleDock,
    pinCharacter,
    unpinCharacter,
    setCutsCount,
  } = useCopilot();

  const { state, dispatch } = useWorkspace();
  const fandomMeta = state.fandomMeta;
  const accentColor = "var(--fandom-accent, var(--fandom-primary, #7B2FF7))";

  // Build template-specific quick actions
  const activeQuickActions = (() => {
    if (!fandomMeta) return QUICK_ACTIONS;
    const templateActions = getQuickActions(fandomMeta.templateType);
    return templateActions.slice(0, 4).map((a) => ({
      id: a.id,
      icon: ICON_MAP[a.id] || RefreshCw,
      label: a.label,
      prompt: a.prompt,
    }));
  })();

  // Show cuts count selector only for multi-cut templates
  const showCutsSelector = !fandomMeta || !isSingleImageTemplate(fandomMeta.templateType);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showSlash, setShowSlash] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [galleryChars, setGalleryChars] = useState<GalleryCharacter[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showRegenPanel, setShowRegenPanel] = useState(false);
  const [regenStyle, setRegenStyle] = useState<string | null>(fandomMeta?.stylePreset || null);
  const [regenPose, setRegenPose] = useState<string | null>(fandomMeta?.poseHint || null);
  const [regenOutfit, setRegenOutfit] = useState<string | null>(fandomMeta?.outfitHint || null);
  const [regenMood, setRegenMood] = useState<string | null>(fandomMeta?.moodHint || null);
  const [regenAesthetic, setRegenAesthetic] = useState<string | null>(null);

  useEffect(() => {
    if (dockExpanded) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, dockExpanded]);

  // Fetch gallery characters when picker opens
  useEffect(() => {
    if (!showCharPicker || galleryChars.length > 0) return;
    setLoadingGallery(true);
    const source = (localStorage.getItem("olli_user_role") as string) || "creator";
    apiRequest("GET", `/api/gallery?type=character&source=${source}&limit=50&offset=0`)
      .then((res) => res.json())
      .then((data: any) => {
        const items = data.items || data;
        if (!Array.isArray(items)) return;
        setGalleryChars(
          items
            .filter((item: any) => {
              const prompt = item.prompt || "";
              if (prompt.startsWith("[LOGO]")) return false;
              if (prompt.startsWith("[MASCOT]")) return false;
              if (item.type && item.type !== "character") return false;
              return true;
            })
            .map((item: any) => ({
              id: item.id,
              name: item.characterName || item.prompt || item.name || `캐릭터 ${item.id}`,
              imageUrl: item.resultImageUrl || item.thumbnailUrl || item.imageUrl || item.image_url,
            }))
            .filter((c: any) => !!c.imageUrl)
        );
      })
      .catch(() => {})
      .finally(() => setLoadingGallery(false));
  }, [showCharPicker, galleryChars.length]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;

    if (trimmed.startsWith("/")) {
      handleSlashCommand(trimmed);
      setInput("");
      setShowSlash(false);
      return;
    }

    sendMessage(trimmed);
    setShowSlash(false);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInputChange(val: string) {
    setInput(val);
    setShowSlash(val === "/");
  }

  function handleRegenerate() {
    if (!fandomMeta) return;
    const updatedMeta: FandomEditorMeta = {
      ...fandomMeta,
      stylePreset: (regenStyle as FandomEditorMeta["stylePreset"]) || undefined,
      poseHint: regenPose || undefined,
      outfitHint: regenOutfit || undefined,
      moodHint: regenMood || undefined,
    };
    const prompt = buildAutoPrompt(updatedMeta);
    // Update fandom meta in workspace state
    dispatch({ type: "SET_FANDOM_META", meta: updatedMeta });
    // Also update aesthetic filter if changed
    if (regenAesthetic) {
      dispatch({ type: "SET_AESTHETIC_FILTER", filterId: regenAesthetic as any });
    }
    sendMessage(prompt);
    setShowRegenPanel(false);
  }

  function handlePinFromGallery(char: GalleryCharacter) {
    const pinned: PinnedCharacter = {
      id: String(char.id),
      name: char.name,
      imageUrl: char.imageUrl,
    };
    pinCharacter(pinned);
  }

  function isPinned(charId: number) {
    return pinnedCharacters.some((c) => c.id === String(charId));
  }

  // Context indicator text
  const contextLabel = context.selectedElementId
    ? `선택: ${context.type === "character" ? "캐릭터" : context.type === "bubble" ? "말풍선" : "요소"}`
    : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
      <div className="w-full max-w-3xl pointer-events-auto">
        {/* ── Character picker popup ──────────────────────────────── */}
        {showCharPicker && (
          <div className="bg-[#0c0c10]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl mb-2 mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
              <span className="text-[13px] font-bold text-white">내 캐릭터 선택</span>
              <button
                onClick={() => setShowCharPicker(false)}
                className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>
            <div className="p-3 max-h-48 overflow-y-auto">
              {loadingGallery ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                </div>
              ) : galleryChars.length === 0 ? (
                <p className="text-[13px] text-white/50 text-center py-4">
                  생성된 캐릭터가 없어요. 먼저 캐릭터를 만들어주세요.
                </p>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {galleryChars.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => {
                        if (isPinned(char.id)) {
                          unpinCharacter(String(char.id));
                        } else {
                          handlePinFromGallery(char);
                        }
                      }}
                      className={`relative group rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                        isPinned(char.id)
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-white/[0.06]"
                      }`}
                    >
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isPinned(char.id) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-[13px] text-black font-bold">✓</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
                        <p className="text-[13px] text-white truncate">{char.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Expanded conversation panel ──────────────────────────────── */}
        {dockExpanded && (
          <div className="bg-[#0c0c10]/95 backdrop-blur-xl border border-white/[0.06] border-b-0 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
                <span className="text-[13px] font-bold text-white">AI Copilot</span>
                {contextLabel && (
                  <span className="text-[13px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {contextLabel}
                  </span>
                )}
              </div>
              <button
                onClick={toggleDock}
                className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-3">
                {messages.length === 0 && (
                  fandomMeta ? (
                    <div className="space-y-3">
                      {/* Fandom context header */}
                      <div
                        className="rounded-xl p-3 flex items-center gap-3"
                        style={{ backgroundColor: fandomMeta.coverColor + "15" }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0"
                          style={{ backgroundColor: fandomMeta.coverColor }}
                        >
                          {fandomMeta.groupName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">
                            {fandomMeta.groupName} {TEMPLATE_LABELS[fandomMeta.templateType]}
                          </p>
                          <p className="text-[13px] text-white/50 truncate">
                            {fandomMeta.memberTags.length > 0
                              ? `멤버: ${fandomMeta.memberTags.join(", ")}`
                              : "전체 멤버"}
                            {" · "}{TEMPLATE_LABELS[fandomMeta.templateType]}
                            {fandomMeta.stylePreset && ` · ${fandomMeta.stylePreset}`}
                          </p>
                        </div>
                      </div>

                      {/* Template-specific prompt suggestions */}
                      <div className="space-y-1.5">
                        <p className="text-[13px] text-white/40 font-medium px-1">
                          {getTemplatePlaceholder(fandomMeta.templateType)}
                        </p>
                        {getOnboardingPrompts(fandomMeta).map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => sendMessage(prompt)}
                            disabled={isGenerating}
                            className="w-full text-left px-3 py-2 rounded-lg text-[13px] text-white/50 hover:bg-white/[0.06] hover:text-white transition-colors disabled:opacity-40"
                          >
                            "{prompt}"
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Bot className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-sm text-white/50 font-medium">
                        무엇을 만들어볼까요?
                      </p>
                      <p className="text-[13px] text-white/40 mt-1">
                        자연어로 요청하면 AI가 만들어드려요
                      </p>
                    </div>
                  )
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-1.5">
                    <div
                      className={`flex gap-2.5 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor})` }}>
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "text-white rounded-br-md"
                            : "bg-white/[0.06] text-white rounded-bl-md"
                        }`}
                        style={msg.role === "user" ? { background: accentColor } : undefined}
                      >
                        {msg.content.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < msg.content.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-5 h-5 text-white/50" />
                        </div>
                      )}
                    </div>
                    {msg.preview && <CopilotPreview message={msg} />}
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor})` }}>
                      <Bot className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div className="bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.3s]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ── Regen Options Panel ───────────────────────────────────── */}
        {showRegenPanel && fandomMeta && (
          <div className="bg-[#0c0c10]/95 backdrop-blur-xl border border-white/[0.06] border-b-0 rounded-t-2xl shadow-2xl p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">스타일 & 옵션 변경</span>
              <button onClick={() => setShowRegenPanel(false)} className="p-1 rounded-md hover:bg-white/[0.06]">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {/* Art Style */}
            <div>
              <p className="text-[13px] font-bold text-white/70 mb-2">아트 스타일</p>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setRegenStyle(regenStyle === s.id ? null : s.id)}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                      regenStyle === s.id
                        ? "text-white border-transparent"
                        : "text-white/60 border-white/10 hover:border-white/30"
                    }`}
                    style={regenStyle === s.id ? { background: accentColor } : undefined}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pose (only for pose-outfit templates) */}
            {POSE_OUTFIT_TEMPLATES.includes(fandomMeta.templateType as any) && (
              <div>
                <p className="text-[13px] font-bold text-white/70 mb-2">포즈</p>
                <div className="flex flex-wrap gap-1.5">
                  {POSE_CHIPS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setRegenPose(regenPose === p ? null : p)}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                        regenPose === p
                          ? "text-white border-transparent"
                          : "text-white/60 border-white/10 hover:border-white/30"
                      }`}
                      style={regenPose === p ? { background: accentColor } : undefined}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Outfit */}
            {POSE_OUTFIT_TEMPLATES.includes(fandomMeta.templateType as any) && (
              <div>
                <p className="text-[13px] font-bold text-white/70 mb-2">의상</p>
                <div className="flex flex-wrap gap-1.5">
                  {OUTFIT_CHIPS.map((o) => (
                    <button
                      key={o}
                      onClick={() => setRegenOutfit(regenOutfit === o ? null : o)}
                      className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                        regenOutfit === o
                          ? "text-white border-transparent"
                          : "text-white/60 border-white/10 hover:border-white/30"
                      }`}
                      style={regenOutfit === o ? { background: accentColor } : undefined}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mood */}
            <div>
              <p className="text-[13px] font-bold text-white/70 mb-2">분위기</p>
              <div className="flex flex-wrap gap-1.5">
                {MOOD_CHIPS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setRegenMood(regenMood === m ? null : m)}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                      regenMood === m
                        ? "text-white border-transparent"
                        : "text-white/60 border-white/10 hover:border-white/30"
                    }`}
                    style={regenMood === m ? { background: accentColor } : undefined}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetic Filter */}
            <div>
              <p className="text-[13px] font-bold text-white/70 mb-2">야구 미학 필터</p>
              <div className="flex flex-wrap gap-1.5">
                {BASEBALL_AESTHETIC_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRegenAesthetic(regenAesthetic === f.id ? null : f.id)}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                      regenAesthetic === f.id
                        ? "text-white border-transparent"
                        : "text-white/60 border-white/10 hover:border-white/30"
                    }`}
                    style={regenAesthetic === f.id ? { background: accentColor } : undefined}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Regenerate button */}
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: accentColor }}
            >
              {isGenerating ? "생성 중..." : "이 옵션으로 재생성"}
            </button>
          </div>
        )}

        {/* ── Dock bar (always visible) ─────────────────────────────── */}
        <div className="bg-[#0c0c10]/95 backdrop-blur-xl border border-white/[0.06] rounded-t-2xl shadow-2xl">
          {/* Fandom context bar */}
          {fandomMeta && !dockExpanded && (
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[13px] font-black shrink-0"
                style={{ backgroundColor: fandomMeta.coverColor }}
              >
                {fandomMeta.groupName.charAt(0)}
              </div>
              <span className="text-[13px] font-bold text-white/70">{fandomMeta.groupName}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[13px] font-bold text-white"
                style={{ backgroundColor: fandomMeta.coverColor }}
              >
                {TEMPLATE_LABELS[fandomMeta.templateType]}
              </span>
              {fandomMeta.memberTags.slice(0, 3).map((m) => (
                <button
                  key={m}
                  onClick={() => sendMessage(`${m}을(를) 그려줘`)}
                  disabled={isGenerating}
                  className="px-1.5 py-0.5 rounded-full text-[13px] font-medium shrink-0 transition-colors disabled:opacity-40"
                  style={{ color: fandomMeta.coverColor, background: fandomMeta.coverColor + "15", borderColor: fandomMeta.coverColor + "30", borderWidth: 1 }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Pinned characters bar */}
          {pinnedCharacters.length > 0 && (
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
              <span className="text-[13px] text-white/50 font-medium shrink-0 mr-1">캐릭터</span>
              {pinnedCharacters.map((char) => (
                <div key={char.id} className="relative group shrink-0">
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary ring-1 ring-primary/30"
                  />
                  <button
                    onClick={() => unpinCharacter(char.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowCharPicker(!showCharPicker)}
                className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center shrink-0 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                title="캐릭터 추가"
              >
                <Plus className="w-5 h-5 text-white/50" />
              </button>

              {/* Cuts count selector (only for multi-cut templates) */}
              {showCutsSelector && (
                <>
                  <div className="w-px h-6 bg-white/[0.06] mx-1" />
                  <span className="text-[13px] text-white/50 font-medium shrink-0 mr-1">컷</span>
                  <div className="flex items-center bg-white/[0.06] rounded-lg p-0.5 gap-0.5">
                    {CUTS_OPTIONS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setCutsCount(n)}
                        className={`px-2 py-1 rounded-md text-[13px] font-bold transition-all ${
                          cutsCount === n
                            ? "text-white shadow-sm"
                            : "text-white/50 hover:text-white"
                        }`}
                        style={cutsCount === n ? { background: accentColor } : undefined}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Context chips */}
          {suggestedChips.length > 0 && (
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 overflow-x-auto">
              {suggestedChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  disabled={isGenerating}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-all border border-primary/20 hover:border-primary/40"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="relative">
            {/* Slash command menu */}
            {showSlash && (
              <div className="absolute bottom-full left-4 right-4 bg-[#0c0c10] border border-white/[0.06] rounded-xl shadow-xl overflow-hidden mb-1">
                {SLASH_COMMANDS.map(({ cmd, label }) => (
                  <button
                    key={cmd}
                    onClick={() => {
                      handleSlashCommand(cmd);
                      setInput("");
                      setShowSlash(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.06] text-left transition-colors"
                  >
                    <code className="text-primary font-mono text-[13px]">{cmd}</code>
                    <span className="text-white/50">{label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 px-4 py-3">
              {/* Expand/collapse toggle */}
              {messages.length > 0 && (
                <button
                  onClick={toggleDock}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors shrink-0"
                  title={dockExpanded ? "접기" : "대화 보기"}
                >
                  {dockExpanded ? (
                    <ChevronDown className="w-5 h-5 text-white/50" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-white/50" />
                  )}
                </button>
              )}

              {/* Character pin button */}
              <button
                onClick={() => setShowCharPicker(!showCharPicker)}
                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  showCharPicker
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-white/[0.06] text-white/50 hover:text-white"
                }`}
                title="캐릭터 고정"
              >
                <UserCircle className="w-5 h-5" />
              </button>

              {/* Cuts count toggle (when no pinned chars show inline, only for multi-cut) */}
              {pinnedCharacters.length === 0 && showCutsSelector && (
                <button
                  onClick={() => {
                    const next = cutsCount === 4 ? 2 : cutsCount === 2 ? 3 : 4;
                    setCutsCount(next as 2 | 3 | 4);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors shrink-0 group relative"
                  title={`${cutsCount}컷 (클릭하여 변경)`}
                >
                  <Grid2x2 className="w-5 h-5 text-white/50 group-hover:text-white" />
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[13px] font-bold text-white flex items-center justify-center" style={{ background: accentColor }}>
                    {cutsCount}
                  </span>
                </button>
              )}

              {/* AI icon */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor})` }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              {/* Input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  pinnedCharacters.length > 0
                    ? `${pinnedCharacters.map((c) => c.name).join(", ")}로 ${showCutsSelector ? `${cutsCount}컷 ` : ""}생성 (/ 로 명령어)`
                    : context.selectedElementId
                    ? "선택한 요소를 어떻게 수정할까요?"
                    : fandomMeta
                    ? getTemplatePlaceholder(fandomMeta.templateType)
                    : `무엇을 만들고 싶으세요? (${cutsCount}컷 / 로 명령어)`
                }
                disabled={isGenerating}
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50 max-h-20"
              />

              {/* Quick actions (visible when input is empty) */}
              {!input.trim() && !isGenerating && (
                <div className="flex items-center gap-1 shrink-0">
                  {activeQuickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (action.id === "style" && fandomMeta) {
                          setShowRegenPanel(!showRegenPanel);
                        } else {
                          sendMessage(action.prompt);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors group ${
                        action.id === "style" && showRegenPanel ? "bg-primary/20" : "hover:bg-white/[0.06]"
                      }`}
                      title={action.label}
                    >
                      <action.icon className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                  {/* Fandom member quick chips */}
                  {fandomMeta && fandomMeta.memberTags.length > 0 && (
                    <>
                      <div className="w-px h-4 bg-white/[0.06] mx-0.5" />
                      {fandomMeta.memberTags.slice(0, 3).map((member) => (
                        <button
                          key={member}
                          onClick={() => sendMessage(`${member}을(를) 그려줘`)}
                          className="px-2 py-1 rounded-full text-[13px] font-bold hover:bg-white/[0.08] transition-colors shrink-0"
                          style={{ color: fandomMeta.coverColor, borderColor: fandomMeta.coverColor + "40", borderWidth: 1 }}
                        >
                          {member}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="p-2 rounded-xl text-white disabled:opacity-30 transition-colors shrink-0"
                style={{ background: accentColor }}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
