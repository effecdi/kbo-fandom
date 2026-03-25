import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { MessageSquare, Sparkles, Wand2, BookOpen, MessageCircle, User, Image } from "lucide-react";
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
  story: {
    title: "스토리 에디터",
    icon: BookOpen,
    description: "AI가 스토리를 자동 생성합니다. 장르와 분위기를 선택하세요.",
    actions: [
      { label: "일상 스토리", prompt: "따뜻한 일상 스토리를 만들어줘" },
      { label: "판타지 스토리", prompt: "판타지 세계관 스토리를 만들어줘" },
      { label: "로맨스 스토리", prompt: "설레는 로맨스 스토리를 만들어줘" },
    ],
  },
  chat: {
    title: "채팅 메이커",
    icon: MessageCircle,
    description: "카카오톡/아이메시지 스타일의 채팅 화면을 만듭니다.",
    actions: [
      { label: "카카오톡 스타일", prompt: "카카오톡 채팅 스타일로 대화를 만들어줘" },
      { label: "아이메시지 스타일", prompt: "아이메시지 스타일로 대화를 만들어줘" },
      { label: "SNS DM 스타일", prompt: "인스타그램 DM 스타일로 대화를 만들어줘" },
    ],
  },
  pose: {
    title: "포즈/표정",
    icon: User,
    description: "캐릭터의 포즈와 표정을 변경합니다.",
    actions: [
      { label: "셀카 포즈", prompt: "셀카 포즈로 변경해줘" },
      { label: "전신 포즈", prompt: "전신이 보이는 포즈로 변경해줘" },
      { label: "표정 변경", prompt: "밝게 웃는 표정으로 변경해줘" },
    ],
  },
  background: {
    title: "배경 생성",
    icon: Image,
    description: "다양한 배경을 AI로 생성합니다.",
    actions: [
      { label: "무대 배경", prompt: "콘서트 무대 배경을 생성해줘" },
      { label: "카페 배경", prompt: "예쁜 카페 배경을 생성해줘" },
      { label: "판타지 배경", prompt: "판타지 세계 배경을 생성해줘" },
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
            <Icon className="w-5 h-5 text-primary" />
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
              <Sparkles className="w-5 h-5 text-primary" />
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
            className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:border-primary"
          />
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-black"
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
