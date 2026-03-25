import { useState, useRef, type KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface CopilotInputProps {
  onSend: (message: string) => void;
  onSlashCommand?: (command: string) => void;
  disabled?: boolean;
}

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
];

export function CopilotInput({ onSend, onSlashCommand, disabled }: CopilotInputProps) {
  const [value, setValue] = useState("");
  const [showSlash, setShowSlash] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    if (trimmed.startsWith("/") && onSlashCommand) {
      onSlashCommand(trimmed);
      setValue("");
      setShowSlash(false);
      return;
    }

    onSend(trimmed);
    setValue("");
    setShowSlash(false);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(val: string) {
    setValue(val);
    setShowSlash(val === "/");
  }

  return (
    <div className="relative border-t border-white/[0.04]">
      {/* Slash command menu */}
      {showSlash && (
        <div className="absolute bottom-full left-0 right-0 bg-[#0c0c10] border border-white/[0.06] rounded-t-lg shadow-lg overflow-hidden">
          {SLASH_COMMANDS.map(({ cmd, label }) => (
            <button
              key={cmd}
              onClick={() => {
                if (onSlashCommand) onSlashCommand(cmd);
                setValue("");
                setShowSlash(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-white/[0.06] text-left transition-colors"
            >
              <code className="text-primary font-mono">{cmd}</code>
              <span className="text-white/50">{label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 p-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="AI에게 요청하세요... (/ 로 명령어)"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 max-h-20"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary transition-colors shrink-0"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
