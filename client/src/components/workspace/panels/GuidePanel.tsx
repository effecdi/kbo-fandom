import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Image,
  Sparkles,
  MessageSquare,
  Pen,
  Wand2,
  Download,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { label: string; description: string }[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "image",
    title: "이미지",
    icon: Image,
    items: [
      { label: "갤러리", description: "생성한 이미지를 찾아보고 캔버스 배경으로 적용" },
      { label: "캐릭터", description: "캐릭터를 고정하면 AI가 일관된 스타일로 생성" },
      { label: "업로드", description: "내 이미지를 직접 업로드하여 배경으로 사용" },
      { label: "배경 제거", description: "이미지의 배경을 자동으로 제거 (Pro)" },
    ],
  },
  {
    id: "ai",
    title: "AI 생성",
    icon: Sparkles,
    items: [
      { label: "AI 대사", description: "주제를 입력하면 대사와 자막을 자동 생성" },
      { label: "인스타툰 자동", description: "캐릭터+주제만 입력하면 전체 자동 생성" },
      { label: "이미지 생성", description: "포즈/배경 프롬프트로 이미지 개별 생성" },
      { label: "멀티컷 자동", description: "스토리를 입력하면 여러 컷을 한번에 생성" },
    ],
  },
  {
    id: "elements",
    title: "요소",
    icon: MessageSquare,
    items: [
      { label: "말풍선", description: "24가지 스타일의 말풍선을 추가하고 편집" },
      { label: "자막", description: "상단/하단 나레이션 자막 추가 (5가지 스타일)" },
      { label: "템플릿", description: "미리 만들어진 말풍선 세트를 한번에 적용" },
    ],
  },
  {
    id: "tools",
    title: "도구",
    icon: Pen,
    items: [
      { label: "선택", description: "요소를 선택하고 이동, 크기 조절, 회전" },
      { label: "그리기", description: "볼펜/마커/형광펜으로 자유 드로잉" },
      { label: "선", description: "직선, 곡선, 폴리라인, 화살표" },
      { label: "텍스트", description: "자유 위치에 텍스트 추가" },
      { label: "도형", description: "사각형, 원, 삼각형, 별 등" },
    ],
  },
  {
    id: "generative",
    title: "생성 AI",
    icon: Wand2,
    items: [
      { label: "생성 채우기", description: "선택 영역을 AI가 프롬프트에 맞게 채움" },
      { label: "캔버스 확장", description: "캔버스 가장자리를 AI로 자연스럽게 확장" },
      { label: "업스케일", description: "2배 해상도로 선명하게 확대" },
      { label: "오브젝트 감지", description: "클릭으로 오브젝트를 자동 감지하여 편집" },
    ],
  },
  {
    id: "export",
    title: "발행/저장",
    icon: Download,
    items: [
      { label: "다운로드", description: "개별 컷 또는 전체 컷을 PNG로 저장" },
      { label: "프로젝트 저장", description: "진행 상황을 프로젝트로 저장" },
      { label: "발행", description: "완성된 작품을 발행하고 공유" },
    ],
  },
  {
    id: "shortcuts",
    title: "단축키",
    icon: Keyboard,
    items: [
      { label: "Ctrl+Z", description: "실행 취소" },
      { label: "Ctrl+Shift+Z", description: "다시 실행" },
      { label: "Ctrl+S", description: "저장" },
      { label: "Delete", description: "선택 요소 삭제" },
      { label: "Ctrl+D", description: "복제" },
      { label: "V", description: "선택 도구" },
      { label: "B", description: "브러시 도구" },
      { label: "T", description: "텍스트 도구" },
    ],
  },
];

export function GuidePanel() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["image"]));

  function toggle(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <BookOpen className="w-5 h-5 text-primary" />
        에디터 가이드
      </h3>

      <p className="text-[12px] text-white/25 leading-relaxed">
        각 기능을 클릭하여 사용법을 확인하세요.
      </p>

      <div className="space-y-1">
        {GUIDE_SECTIONS.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <div key={section.id} className="rounded-xl border border-white/[0.04] overflow-hidden">
              <button
                onClick={() => toggle(section.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all",
                  isOpen
                    ? "bg-primary/[0.04] text-white/70"
                    : "hover:bg-white/[0.02] text-white/40"
                )}
              >
                <section.icon className={cn(
                  "w-5 h-5 shrink-0",
                  isOpen ? "text-primary" : "text-white/25"
                )} />
                <span className="text-[12px] font-medium flex-1">{section.title}</span>
                {isOpen
                  ? <ChevronDown className="w-5 h-5 text-white/20" />
                  : <ChevronRight className="w-5 h-5 text-white/20" />
                }
              </button>

              {isOpen && (
                <div className="px-3 pb-2.5 space-y-1.5">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[12px] text-white/50 font-medium">{item.label}</p>
                        <p className="text-[12px] text-white/20 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
