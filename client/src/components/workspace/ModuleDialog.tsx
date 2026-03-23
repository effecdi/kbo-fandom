import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { MessageSquare, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const MODULE_CONFIG: Record<string, { title: string; icon: any; description: string; actions: { label: string; prompt: string }[] }> = {
  bubble: {
    title: "말풍선",
    icon: MessageSquare,
    description: "말풍선은 AI 인스타툰 생성 시 자동으로 추가됩니다. 캔버스에서 직접 클릭하여 텍스트를 수정하거나, 아래 명령을 사용하세요.",
    actions: [
      { label: "말풍선 추가", prompt: "현재 컷에 말풍선 추가해줘" },
      { label: "모든 말풍선 변경", prompt: "말풍선 스타일을 변경해줘" },
    ],
  },
  effects: {
    title: "효과 에디터",
    icon: Wand2,
    description: "컷에 다양한 효과를 적용할 수 있습니다. 아래 효과 중 하나를 선택하세요.",
    actions: [
      { label: "집중선 효과", prompt: "현재 컷에 집중선 효과 추가해줘" },
      { label: "감정 효과", prompt: "캐릭터에 감정 이모티콘 효과 추가해줘" },
      { label: "배경 블러", prompt: "배경에 블러 효과 추가해줘" },
    ],
  },
  autogen: {
    title: "AI 자동 생성",
    icon: Sparkles,
    description: "프롬프트를 입력하면 AI가 멀티컷 인스타툰을 자동 생성합니다.",
    actions: [
      { label: "일상 인스타툰", prompt: "카페에서 공부하는 일상 인스타툰 만들어줘" },
      { label: "감성 인스타툰", prompt: "비오는 날 감성 인스타툰 만들어줘" },
      { label: "코미디 인스타툰", prompt: "웃긴 사무실 일상 인스타툰 만들어줘" },
    ],
  },
};

export function ModuleDialog() {
  const { state, dispatch } = useWorkspace();
  const { sendMessage } = useCopilot();
  const [customPrompt, setCustomPrompt] = useState("");

  const isOpen = state.activeModule !== null;
  const config = state.activeModule ? MODULE_CONFIG[state.activeModule] : null;

  function onClose() {
    dispatch({ type: "SET_ACTIVE_MODULE", module: null });
  }

  function handleAction(prompt: string) {
    sendMessage(prompt);
    onClose();
  }

  function handleCustomSubmit() {
    if (customPrompt.trim()) {
      sendMessage(customPrompt.trim());
      setCustomPrompt("");
      onClose();
    }
  }

  if (!config) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{state.activeModule}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">이 모듈은 준비 중입니다.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-[#00e5cc]" />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{config.description}</p>

        <div className="space-y-2">
          {config.actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="w-full justify-start gap-2 text-sm"
              onClick={() => handleAction(action.prompt)}
            >
              <Sparkles className="w-4 h-4 text-[#00e5cc]" />
              {action.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder="직접 입력..."
            className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:border-[#00e5cc]"
          />
          <Button
            size="sm"
            className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black"
            onClick={handleCustomSubmit}
            disabled={!customPrompt.trim()}
          >
            실행
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
