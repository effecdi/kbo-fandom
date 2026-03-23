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
import { CopilotPreview } from "./CopilotPreview";
import { apiRequest } from "@/lib/queryClient";
import type { PinnedCharacter } from "@/lib/workspace-types";

// ─── Quick Actions (always visible in dock bar) ─────────────────────────────

const QUICK_ACTIONS = [
  { id: "regen", icon: RefreshCw, label: "다시 생성", prompt: "전체 다시 생성해줘" },
  { id: "addcut", icon: Plus, label: "컷 추가", prompt: "새 컷 추가해줘" },
  { id: "expression", icon: Smile, label: "표정 변경", prompt: "캐릭터 표정을 변경해줘" },
  { id: "style", icon: Palette, label: "스타일", prompt: "스타일을 변경해줘" },
];

const SLASH_COMMANDS = [
  { cmd: "/bubble", label: "말풍선 에디터" },
  { cmd: "/effects", label: "효과 에디터" },
  { cmd: "/auto", label: "AI 자동 생성" },
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

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showSlash, setShowSlash] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [galleryChars, setGalleryChars] = useState<GalleryCharacter[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

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
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl mb-2 mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
              <span className="text-xs font-bold text-foreground">내 캐릭터 선택</span>
              <button
                onClick={() => setShowCharPicker(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-3 max-h-48 overflow-y-auto">
              {loadingGallery ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : galleryChars.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
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
                          ? "border-[#00e5cc] ring-2 ring-[#00e5cc]/30"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isPinned(char.id) && (
                        <div className="absolute inset-0 bg-[#00e5cc]/20 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-[#00e5cc] flex items-center justify-center">
                            <span className="text-[10px] text-black font-bold">✓</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
                        <p className="text-[9px] text-white truncate">{char.name}</p>
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
          <div className="bg-card/95 backdrop-blur-xl border border-border border-b-0 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00e5cc]" />
                <span className="text-xs font-bold text-foreground">AI Copilot</span>
                {contextLabel && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e5cc]/10 text-[#00e5cc] font-medium">
                    {contextLabel}
                  </span>
                )}
              </div>
              <button
                onClick={toggleDock}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <Bot className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">
                      무엇을 만들어볼까요?
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      자연어로 요청하면 AI가 인스타툰을 만들어드려요
                    </p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-1.5">
                    <div
                      className={`flex gap-2.5 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b4d8] flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#00e5cc] text-black rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        {msg.content.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < msg.content.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {msg.preview && <CopilotPreview message={msg} />}
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b4d8] flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00e5cc]/60 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-[#00e5cc]/60 animate-bounce [animation-delay:0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-[#00e5cc]/60 animate-bounce [animation-delay:0.3s]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ── Dock bar (always visible) ─────────────────────────────── */}
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-t-2xl shadow-2xl">
          {/* Pinned characters bar */}
          {pinnedCharacters.length > 0 && (
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
              <span className="text-[10px] text-muted-foreground font-medium shrink-0 mr-1">캐릭터</span>
              {pinnedCharacters.map((char) => (
                <div key={char.id} className="relative group shrink-0">
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#00e5cc] ring-1 ring-[#00e5cc]/30"
                  />
                  <button
                    onClick={() => unpinCharacter(char.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowCharPicker(!showCharPicker)}
                className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0 hover:border-[#00e5cc]/50 hover:bg-[#00e5cc]/5 transition-colors"
                title="캐릭터 추가"
              >
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-border mx-1" />

              {/* Cuts count selector */}
              <span className="text-[10px] text-muted-foreground font-medium shrink-0 mr-1">컷</span>
              <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
                {CUTS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCutsCount(n)}
                    className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${
                      cutsCount === n
                        ? "bg-[#00e5cc] text-black shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
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
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-[#00e5cc]/10 text-[#00e5cc] hover:bg-[#00e5cc]/20 disabled:opacity-40 transition-all border border-[#00e5cc]/20 hover:border-[#00e5cc]/40"
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
              <div className="absolute bottom-full left-4 right-4 bg-card border border-border rounded-xl shadow-xl overflow-hidden mb-1">
                {SLASH_COMMANDS.map(({ cmd, label }) => (
                  <button
                    key={cmd}
                    onClick={() => {
                      handleSlashCommand(cmd);
                      setInput("");
                      setShowSlash(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted text-left transition-colors"
                  >
                    <code className="text-[#00e5cc] font-mono text-xs">{cmd}</code>
                    <span className="text-muted-foreground">{label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 px-4 py-3">
              {/* Expand/collapse toggle */}
              {messages.length > 0 && (
                <button
                  onClick={toggleDock}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                  title={dockExpanded ? "접기" : "대화 보기"}
                >
                  {dockExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              )}

              {/* Character pin button */}
              <button
                onClick={() => setShowCharPicker(!showCharPicker)}
                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  showCharPicker
                    ? "bg-[#00e5cc]/20 text-[#00e5cc]"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title="캐릭터 고정"
              >
                <UserCircle className="w-4 h-4" />
              </button>

              {/* Cuts count toggle (when no pinned chars show inline) */}
              {pinnedCharacters.length === 0 && (
                <button
                  onClick={() => {
                    const next = cutsCount === 4 ? 2 : cutsCount === 2 ? 3 : 4;
                    setCutsCount(next as 2 | 3 | 4);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 group relative"
                  title={`${cutsCount}컷 (클릭하여 변경)`}
                >
                  <Grid2x2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00e5cc] text-[8px] font-bold text-black flex items-center justify-center">
                    {cutsCount}
                  </span>
                </button>
              )}

              {/* AI icon */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b4d8] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  pinnedCharacters.length > 0
                    ? `${pinnedCharacters.map((c) => c.name).join(", ")}로 ${cutsCount}컷 생성 (/ 로 명령어)`
                    : context.selectedElementId
                    ? "선택한 요소를 어떻게 수정할까요?"
                    : `무엇을 만들고 싶으세요? (${cutsCount}컷 / 로 명령어)`
                }
                disabled={isGenerating}
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 max-h-20"
              />

              {/* Quick actions (visible when input is empty) */}
              {!input.trim() && !isGenerating && (
                <div className="flex items-center gap-1 shrink-0">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => sendMessage(action.prompt)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors group"
                      title={action.label}
                    >
                      <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="p-2 rounded-xl bg-[#00e5cc] text-black hover:bg-[#00f0ff] disabled:opacity-30 transition-colors shrink-0"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
