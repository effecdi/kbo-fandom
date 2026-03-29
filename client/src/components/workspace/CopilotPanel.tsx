import { useRef, useEffect } from "react";
import { Sparkles, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCopilot } from "@/hooks/use-copilot";
import { CopilotInput } from "./CopilotInput";
import { CopilotChips } from "./CopilotChips";
import { CopilotPreview } from "./CopilotPreview";

export function CopilotPanel() {
  const {
    messages,
    isGenerating,
    suggestedChips,
    sendMessage,
    handleSlashCommand,
  } = useCopilot();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-col h-full border-t border-white/[0.04]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-[13px] font-bold text-white">AI Copilot</span>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-[13px] text-white/50">
                AI에게 요청하세요
              </p>
              <p className="text-[13px] text-white/40 mt-1">
                "배경 생성해줘", "말풍선 추가" 등
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div
                className={`flex gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-white/[0.06] text-white"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-5 h-5 text-white/50" />
                  </div>
                )}
              </div>
              {msg.preview && <CopilotPreview message={msg} />}
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="bg-white/[0.06] rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Chips */}
      <CopilotChips
        chips={suggestedChips}
        onChipClick={sendMessage}
        disabled={isGenerating}
      />

      {/* Input */}
      <CopilotInput
        onSend={sendMessage}
        onSlashCommand={handleSlashCommand}
        disabled={isGenerating}
      />
    </div>
  );
}
