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
    <div className="relative border-t border-border">
      {/* Slash command menu */}
      {showSlash && (
        <div className="absolute bottom-full left-0 right-0 bg-card border border-border rounded-t-lg shadow-lg overflow-hidden">
          {SLASH_COMMANDS.map(({ cmd, label }) => (
            <button
              key={cmd}
              onClick={() => {
                if (onSlashCommand) onSlashCommand(cmd);
                setValue("");
                setShowSlash(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-muted text-left transition-colors"
            >
              <code className="text-[#00e5cc] font-mono">{cmd}</code>
              <span className="text-muted-foreground">{label}</span>
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
          className="flex-1 resize-none bg-muted rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[#00e5cc] disabled:opacity-50 max-h-20"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="p-2 rounded-lg bg-[#00e5cc] text-black hover:bg-[#00f0ff] disabled:opacity-30 disabled:hover:bg-[#00e5cc] transition-colors shrink-0"
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
