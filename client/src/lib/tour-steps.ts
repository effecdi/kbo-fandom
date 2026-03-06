export interface TourStep {
  id: string;
  page: string;
  targetSelector: string;
  title: string;
  description: string;
  videoUrl?: string;
  position: "top" | "bottom" | "left" | "right";
  spotlightPadding?: number;
}

export const TOUR_STEPS: TourStep[] = [
  // === /create ===
  {
    id: "create-prompt",
    page: "/create",
    targetSelector: '[data-testid="input-prompt"]',
    title: "1. 캐릭터 설명 입력",
    description:
      "원하는 캐릭터를 텍스트로 설명하세요. 예: '검은 머리 긴 생머리 여자, 하얀 원피스' 처럼 구체적으로 적을수록 좋아요.",
    videoUrl: "",
    position: "bottom",
    spotlightPadding: 8,
  },
  {
    id: "create-style",
    page: "/create",
    targetSelector: '[data-testid="button-open-style-dialog"]',
    title: "2. 그림 스타일 선택",
    description:
      "원하는 그림 스타일을 선택하세요. 심플 라인, 수채화, 만화 등 다양한 스타일이 준비되어 있어요.",
    videoUrl: "",
    position: "bottom",
    spotlightPadding: 6,
  },
  {
    id: "create-generate",
    page: "/create",
    targetSelector: '[data-testid="button-generate"]',
    title: "3. 캐릭터 생성",
    description:
      "모든 설정이 끝나면 생성 버튼을 눌러주세요. AI가 캐릭터를 만들어드려요. (1 크레딧 차감)",
    videoUrl: "",
    position: "top",
    spotlightPadding: 6,
  },

  // === /pose ===
  {
    id: "pose-select-char",
    page: "/pose",
    targetSelector: '[data-testid^="button-select-pose-char-"]',
    title: "4. 기준 캐릭터 선택",
    description:
      "갤러리에서 포즈/표정을 변경할 캐릭터를 선택하세요. 생성한 캐릭터가 여기에 표시돼요.",
    videoUrl: "",
    position: "right",
    spotlightPadding: 8,
  },
  {
    id: "pose-prompt",
    page: "/pose",
    targetSelector: '[data-testid="input-pose-prompt"]',
    title: "5. 포즈/표정 설명",
    description:
      "원하는 포즈나 표정을 설명하세요. 예: '활짝 웃으면서 브이하는 포즈', '슬픈 표정으로 턱을 괴는 모습'",
    videoUrl: "",
    position: "bottom",
    spotlightPadding: 8,
  },
  {
    id: "pose-generate",
    page: "/pose",
    targetSelector: '[data-testid="button-generate-pose"]',
    title: "6. 포즈 생성",
    description:
      "생성 버튼을 클릭하면 선택한 캐릭터의 새로운 포즈/표정이 만들어져요.",
    videoUrl: "",
    position: "top",
    spotlightPadding: 6,
  },

  // === /background ===
  {
    id: "bg-prompt",
    page: "/background",
    targetSelector: '[data-testid="input-bg-prompt"]',
    title: "7. 배경/아이템 설명",
    description:
      "원하는 배경이나 아이템을 설명하세요. 예: '벚꽃이 흩날리는 공원', '아늑한 카페 내부'",
    videoUrl: "",
    position: "bottom",
    spotlightPadding: 8,
  },
  {
    id: "bg-generate",
    page: "/background",
    targetSelector: '[data-testid="button-generate-bg"]',
    title: "8. 배경 생성",
    description:
      "생성 버튼을 눌러 AI가 배경/아이템 이미지를 만들어줍니다.",
    videoUrl: "",
    position: "top",
    spotlightPadding: 6,
  },

  // === /effects ===
  {
    id: "effects-blur-type",
    page: "/effects",
    targetSelector: '[data-testid="button-blur-gaussian"]',
    title: "9. 블러 타입 선택",
    description:
      "가우시안, 모션, 방사형 등 다양한 블러 효과 중 원하는 타입을 선택하세요.",
    videoUrl: "",
    position: "bottom",
    spotlightPadding: 6,
  },
  {
    id: "effects-strength",
    page: "/effects",
    targetSelector: '[data-testid="slider-strength"]',
    title: "10. 블러 강도 조절",
    description:
      "슬라이더를 움직여 블러 강도를 조절하세요. 미리보기에서 실시간으로 확인할 수 있어요.",
    videoUrl: "",
    position: "bottom",
    spotlightPadding: 8,
  },

  // === /story ===
  {
    id: "story-sidebar",
    page: "/story",
    targetSelector: '[data-testid="left-icon-sidebar"]',
    title: "11. 좌측 도구 탭",
    description:
      "패널 추가, 텍스트, 이미지 삽입 등 다양한 편집 도구가 모여 있는 사이드바예요.",
    videoUrl: "",
    position: "right",
    spotlightPadding: 6,
  },
  {
    id: "story-save",
    page: "/story",
    targetSelector: '[data-testid="button-save-story-project"]',
    title: "12. 프로젝트 저장",
    description:
      "작업한 스토리를 저장하세요. 나중에 다시 불러와 편집할 수 있어요. 자주 저장하는 습관을 추천해요!",
    videoUrl: "",
    position: "bottom",
    spotlightPadding: 6,
  },
];
