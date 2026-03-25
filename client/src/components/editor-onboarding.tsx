import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Wand2,
  Layers,
  Type,
  MessageCircle,
  Upload,
  Plus,
  Save,
  MousePointer2,
  Sparkles,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
  Pen,
  Square,
  Minus,
  Download,
} from "lucide-react";

interface OnboardingStep {
  icon: typeof Wand2;
  title: string;
  description: string;
  tip?: string;
}

const STORY_STEPS: OnboardingStep[] = [
  {
    icon: Sparkles,
    title: "OLLI Story Editor에 오신 걸 환영합니다!",
    description: "인스타툰, 웹툰, 만화를 손쉽게 만들 수 있는 에디터예요. AI가 스크립트부터 이미지까지 자동으로 생성해줍니다.",
    tip: "좌측 아이콘 탭으로 이미지/AI/도구/요소 기능을 전환하세요",
  },
  {
    icon: ImagePlus,
    title: "이미지 선택/업로드",
    description: "좌측 첫 번째 탭에서 갤러리의 캐릭터 이미지를 캔버스에 배치하거나, 직접 이미지를 업로드할 수 있어요. 캔버스에서 드래그로 위치를 조절하고, 모서리를 잡아 크기를 변경하세요.",
    tip: "배경 제거 기능으로 캐릭터만 깔끔하게 추출할 수 있어요 (Pro)",
  },
  {
    icon: Wand2,
    title: "AI 자동 생성",
    description: "AI 탭에서 주제만 입력하면 패널별 상단/하단 자막, 말풍선 대사를 자동으로 생성합니다. 3가지 모드를 지원해요:\n\n• 인스타툰 자동화 생성: 기준 캐릭터 이미지 + 주제로 이미지까지 한번에 생성\n• 인스타툰 프롬프트 자동 작성: AI가 프롬프트를 자동으로 작성\n• 자동화툰 멀티컷 생성: 여러 컷을 한번에 자동 생성",
    tip: "포즈, 표정, 배경, 아이템 프롬프트를 세밀하게 지정할 수 있어요",
  },
  {
    icon: Pen,
    title: "드로잉 & 선 도구",
    description: "도구 탭에서 펜, 마커, 형광펜으로 자유롭게 그림을 그릴 수 있어요. 선 도구로 직선/곡선을 추가하고, 화살표 시작/끝점도 설정 가능합니다. 점선, 파선 스타일도 지원해요.",
    tip: "Ctrl+Z로 실행 취소, 지우개 모드로 부분 삭제 가능",
  },
  {
    icon: Type,
    title: "텍스트 & 도형",
    description: "텍스트 도구로 캔버스 어디에나 자유롭게 텍스트를 추가하세요. 폰트, 크기, 색상, 굵기, 기울임, 밑줄, 정렬을 세밀하게 설정할 수 있어요. 도형 도구로 사각형, 원, 삼각형, 다이아몬드, 별, 화살표를 추가하세요.",
    tip: "도형에 마스크 기능을 적용하면 이미지를 도형 모양으로 잘라낼 수 있어요",
  },
  {
    icon: MessageCircle,
    title: "말풍선 추가 & 편집",
    description: "요소 탭 > 말풍선에서 다양한 스타일의 말풍선을 추가하세요. 손글씨, 채움, 박스, 테두리 없음, 배경 없음 스타일을 지원합니다. 꼬리 방향, 길이, 곡률도 자유롭게 조절할 수 있어요.",
    tip: "캔버스에서 말풍선을 클릭하면 바로 수정, 더블클릭하면 텍스트 편집이 가능해요",
  },
  {
    icon: Minus,
    title: "상단/하단 자막 (스크립트)",
    description: "요소 탭 > 자막 설정에서 패널 상단/하단에 나레이션이나 자막을 추가하세요. 폰트, 색상, 배경 스타일(채움, 박스, 손글씨 박스, 테두리만, 배경 없음)을 선택할 수 있어요.",
    tip: "캔버스에서 자막을 클릭하면 바로 텍스트를 수정할 수 있어요",
  },
  {
    icon: Layers,
    title: "패널 관리 & 레이어",
    description: "상단 툴바에서 패널 추가(+), 복제, 삭제가 가능합니다. 좌우 화살표로 패널 간 이동하세요. 요소들은 레이어 순서가 있어서, 우클릭 메뉴에서 맨 앞/맨 뒤로 보내기가 가능해요.",
    tip: "Pro 등급에 따라 최대 14개 패널까지 추가할 수 있어요",
  },
  {
    icon: Square,
    title: "템플릿 가져오기",
    description: "요소 탭 > 템플릿에서 미리 디자인된 말풍선 템플릿을 불러올 수 있어요. 한 번의 클릭으로 완성도 높은 말풍선을 바로 적용하세요.",
  },
  {
    icon: Download,
    title: "저장, 다운로드 & 공유",
    description: "상단 바에서 현재 패널 또는 전체 패널을 이미지로 다운로드할 수 있어요. Pro 멤버십이면 프로젝트를 저장/불러오기할 수 있고, Instagram 공유도 지원합니다.",
    tip: "전체 다운로드 시 모든 패널이 하나의 세로 이미지로 합쳐져요",
  },
];

const BUBBLE_STEPS: OnboardingStep[] = [
  {
    icon: Sparkles,
    title: "OLLI Bubble Editor에 오신 걸 환영합니다!",
    description: "기존 이미지에 말풍선, 캐릭터, 텍스트를 손쉽게 추가할 수 있는 에디터예요. 웹툰 장면이나 사진에 대화를 넣어보세요.",
    tip: "상단 메뉴에서 업로드, 캐릭터 추가, 말풍선 추가를 이용하세요",
  },
  {
    icon: Upload,
    title: "이미지 업로드",
    description: "상단 '업로드' 버튼으로 배경 이미지를 불러오세요. 캐릭터 만들기에서 AI로 생성한 이미지도 사용할 수 있어요. JPG, PNG, WebP 등 다양한 포맷을 지원합니다.",
    tip: "'캐릭터' 버튼으로 갤러리에서 바로 가져올 수도 있어요",
  },
  {
    icon: Plus,
    title: "말풍선 추가 & 스타일",
    description: "'추가' 버튼을 누르면 말풍선이 생성돼요. 손글씨, 채움, 박스, 이미지 템플릿 등 다양한 스타일을 선택하세요. 꼬리 방향과 길이, 워블 강도도 세밀하게 조절 가능합니다.",
    tip: "템플릿 버튼으로 미리 디자인된 말풍선을 바로 적용할 수 있어요",
  },
  {
    icon: MousePointer2,
    title: "캔버스에서 편집",
    description: "캔버스에서 말풍선을 클릭해 선택하고, 드래그로 이동하세요. 모서리를 잡아 크기를 조절할 수 있어요. 더블클릭하면 텍스트를 직접 편집할 수 있습니다.",
    tip: "오른쪽 패널에서 폰트, 크기, 색상, 스트로크, 정렬 등 세부 설정 가능",
  },
  {
    icon: ImagePlus,
    title: "캐릭터 오버레이",
    description: "'캐릭터' 버튼으로 갤러리에서 캐릭터를 불러와 이미지 위에 배치할 수 있어요. 위치와 크기를 자유롭게 조절하세요.",
    tip: "캐릭터도 드래그로 이동, 모서리 드래그로 크기 조절 가능",
  },
  {
    icon: Save,
    title: "저장, 다운로드 & 공유",
    description: "상단 바에서 완성된 이미지를 다운로드하거나 프로젝트로 저장(Pro)할 수 있어요. Instagram 공유도 지원합니다. '내 편집'에서 저장된 프로젝트를 언제든 불러오세요.",
    tip: "Pro 멤버십이면 프로젝트를 저장/불러오기할 수 있어요",
  },
];

const ONBOARDING_KEY_STORY = "charagen_story_onboarding_seen_v2";
const ONBOARDING_KEY_BUBBLE = "charagen_bubble_onboarding_seen_v2";

export function EditorOnboarding({ editor, onComplete }: { editor: "story" | "bubble"; onComplete?: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const steps = editor === "story" ? STORY_STEPS : BUBBLE_STEPS;
  const storageKey = editor === "story" ? ONBOARDING_KEY_STORY : ONBOARDING_KEY_BUBBLE;

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(storageKey, "1");
    onComplete?.();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const current = steps[step];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden gap-0" data-testid="modal-editor-onboarding">
        <VisuallyHidden.Root><DialogTitle>에디터 가이드</DialogTitle></VisuallyHidden.Root>
        <div className="relative">
          <div className="bg-gradient-to-br from-[hsl(173_100%_35%)] to-[hsl(262_83%_45%)] px-6 pt-8 pb-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 opacity-80" />
              <span className="text-[13px] font-medium opacity-80 uppercase tracking-wider">
                {editor === "story" ? "Story Editor" : "Bubble Editor"} Guide
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <current.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight" data-testid="text-onboarding-title">{current.title}</h3>
                <span className="text-[13px] opacity-70">Step {step + 1} / {steps.length}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-0.5 px-6 -mt-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-colors ${i <= step ? "bg-[hsl(173_100%_35%)]" : "bg-border"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 pt-5 pb-2">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line" data-testid="text-onboarding-desc">
            {current.description}
          </p>
          {current.tip && (
            <div className="mt-3 flex items-start gap-2 bg-muted/50 dark:bg-muted/30 rounded-lg px-3 py-2.5">
              <Sparkles className="h-5 w-5 text-[hsl(173_100%_35%)] shrink-0 mt-0.5" />
              <p className="text-[13px] text-muted-foreground leading-relaxed" data-testid="text-onboarding-tip">{current.tip}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-6 pb-5 pt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePrev}
            disabled={step === 0}
            className="gap-1"
            data-testid="button-onboarding-prev"
          >
            <ChevronLeft className="h-5 w-5" />
            이전
          </Button>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="text-muted-foreground"
              data-testid="button-onboarding-skip"
            >
              건너뛰기
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1 bg-[hsl(173_100%_35%)] text-white border-[hsl(173_100%_35%)]"
              data-testid="button-onboarding-next"
            >
              {step === steps.length - 1 ? "시작하기" : "다음"}
              {step < steps.length - 1 && <ChevronRight className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
