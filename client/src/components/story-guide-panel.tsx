import {
  Wand2,
  Sparkles,
  ImagePlus,
  LayoutGrid,
  Pen,
  Boxes,
  X,
  ArrowRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface StoryGuidePanelProps {
  onClose: () => void;
  onNavigateToTab?: (tab: string, subTab?: string) => void;
}

interface GuideSection {
  id: string;
  icon: typeof Wand2;
  title: string;
  description: string;
  tip?: string;
  navigateTo?: { tab: string; subTab?: string; label: string };
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "ai-subtitle",
    icon: Wand2,
    title: "AI 프롬프트 자막",
    description:
      "주제를 입력하면 AI가 패널별 상단/하단 자막과 말풍선 대사를 자동으로 생성합니다. 에피소드 단위로 관리할 수 있어 연재 형태의 콘텐츠 제작에 최적화되어 있어요.",
    tip: "에피소드 번호를 지정하면 이전 에피소드 맥락을 이어서 생성할 수 있어요",
    navigateTo: { tab: "ai", subTab: "subtitle", label: "AI 프롬프트 자막" },
  },
  {
    id: "instatoon-full",
    icon: Sparkles,
    title: "인스타툰 자동화 생성",
    description:
      "기준 캐릭터 이미지와 주제만 입력하면 스크립트부터 이미지까지 한번에 자동으로 생성합니다. 캐릭터의 스타일을 자동으로 감지하여 일관된 화풍을 유지해요.",
    tip: "기준 이미지의 스타일이 명확할수록 더 일관된 결과물이 나와요",
    navigateTo: { tab: "ai", subTab: "instatoonFull", label: "인스타툰 자동화" },
  },
  {
    id: "instatoon-prompt",
    icon: ImagePlus,
    title: "인스타툰 이미지 생성",
    description:
      "포즈, 표정, 배경, 아이템 등 세밀한 프롬프트를 지정하여 원하는 이미지를 생성할 수 있어요. 기준 이미지를 선택하면 캐릭터 스타일을 유지하면서 다양한 장면을 만들 수 있습니다.",
    tip: "프롬프트를 구체적으로 작성할수록 원하는 결과에 가까운 이미지가 생성돼요",
    navigateTo: { tab: "ai", subTab: "instatoonPrompt", label: "인스타툰 이미지" },
  },
  {
    id: "auto-webtoon",
    icon: LayoutGrid,
    title: "자동화툰 멀티컷 생성",
    description:
      "여러 컷을 한번에 자동으로 생성합니다. 컷 수, 레이아웃 방식, 보더 스타일을 설정할 수 있어 다양한 형태의 만화를 쉽게 제작할 수 있어요.",
    tip: "2~4컷 형태의 인스타툰이나 짧은 스토리에 적합해요",
    navigateTo: { tab: "ai", subTab: "autoWebtoon", label: "자동화툰 멀티컷" },
  },
  {
    id: "tools",
    icon: Pen,
    title: "도구",
    description:
      "다양한 편집 도구를 활용할 수 있어요:\n\n• 선택: 요소 선택, 이동, 크기 조절\n• 드로잉: 펜, 마커, 형광펜으로 자유롭게 그림 그리기\n• 선: 직선, 곡선, 화살표 추가 (점선/파선 지원)\n• 텍스트: 자유 위치에 텍스트 추가\n• 도형: 사각형, 원, 삼각형, 별 등 + 마스크 기능",
    tip: "Ctrl+Z로 실행 취소, 도형에 마스크를 적용하면 이미지를 도형 모양으로 잘라낼 수 있어요",
    navigateTo: { tab: "tools", label: "도구" },
  },
  {
    id: "elements",
    icon: Boxes,
    title: "요소",
    description:
      "자막, 말풍선, 템플릿을 관리해요:\n\n• 자막: 상단/하단 자막 텍스트, 폰트, 색상, 배경 스타일 설정\n• 말풍선: 손글씨, 채움, 박스, 테두리 없음 등 다양한 스타일, 꼬리 방향/길이/곡률 조절\n• 템플릿: 미리 디자인된 말풍선 템플릿 가져오기",
    tip: "캔버스에서 자막이나 말풍선을 클릭하면 바로 편집할 수 있어요",
    navigateTo: { tab: "elements", label: "요소" },
  },
  {
    id: "generative",
    icon: Sparkles,
    title: "생성형",
    description:
      "AI 기반 이미지 편집 도구를 제공합니다:\n\n• 생성형 채우기: 선택 영역을 AI가 자연스럽게 채워줘요\n• 생성형 확장: 이미지 바깥 영역을 AI가 확장해요\n• 업스케일: 저해상도 이미지를 고해상도로 변환\n• 개체 선택: 특정 개체를 선택하여 색상 변경 가능",
    tip: "생성형 채우기는 불필요한 요소를 제거하거나 새 요소를 추가할 때 유용해요",
    navigateTo: { tab: "generative", label: "생성형" },
  },
];

export function StoryGuidePanel({ onClose, onNavigateToTab }: StoryGuidePanelProps) {
  return (
    <div className="w-[320px] h-full flex flex-col bg-background">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[hsl(173_100%_35%)] to-[hsl(262_83%_45%)] px-4 pt-5 pb-4 text-white shrink-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/20 transition-colors"
          title="닫기"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 opacity-80" />
          <span className="text-[13px] font-medium opacity-80 uppercase tracking-wider">
            Story Editor Guide
          </span>
        </div>
        <h3 className="text-base font-bold mt-2">에디터 기능 가이드</h3>
        <p className="text-[13px] opacity-70 mt-1">
          각 섹션을 펼쳐 기능 설명을 확인하고 바로가기로 이동하세요
        </p>
      </div>

      {/* Accordion sections */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible className="px-3">
          {GUIDE_SECTIONS.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-[13px] py-3 hover:no-underline gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="font-medium">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-[38px] pr-1">
                <p className="text-[12px] leading-relaxed text-muted-foreground whitespace-pre-line">
                  {section.description}
                </p>
                {section.tip && (
                  <div className="mt-2.5 flex items-start gap-2 bg-muted/50 dark:bg-muted/30 rounded-lg px-2.5 py-2">
                    <Sparkles className="h-3 w-3 text-[hsl(173_100%_35%)] shrink-0 mt-0.5" />
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {section.tip}
                    </p>
                  </div>
                )}
                {section.navigateTo && onNavigateToTab && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2.5 h-7 text-[13px] gap-1.5"
                    onClick={() =>
                      onNavigateToTab(section.navigateTo!.tab, section.navigateTo!.subTab)
                    }
                  >
                    {section.navigateTo.label} 바로가기
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
