import type {
  FandomTemplateType,
  FandomStylePreset,
  FandomEditorMeta,
  CanvasAspectRatio,
  FandomStickerCategory,
  FandomSticker,
  PhotocardFrame,
  ConcertEffect,
  AestheticFilterId,
} from "./workspace-types";

// ─── Template Definitions ────────────────────────────────────────────────────

export interface FandomTemplate {
  id: string;
  type: FandomTemplateType;
  label: string;
  desc: string;
  panels: number;
  aspect: CanvasAspectRatio;
  category: "popular" | "photo" | "art" | "comic" | "goods" | "kitsch";
}

export const FANDOM_TEMPLATES: FandomTemplate[] = [
  // 인기
  { id: "playercard", type: "playercard", label: "선수 카드", desc: "야구 선수 카드 사이즈", panels: 1, aspect: "2:3", category: "popular" },
  { id: "portrait", type: "portrait", label: "선수 포트레이트", desc: "솔로 또는 팀 초상화", panels: 1, aspect: "3:4", category: "popular" },
  { id: "wallpaper", type: "wallpaper", label: "폰 배경화면", desc: "핸드폰 배경화면", panels: 1, aspect: "9:16", category: "popular" },
  // 포토
  { id: "matchday", type: "matchday", label: "경기날 포토", desc: "경기장 컨셉 포토 스타일", panels: 1, aspect: "3:4", category: "photo" },
  { id: "edit", type: "edit", label: "에디트/콜라주", desc: "사진 에디트 & 콜라주", panels: 1, aspect: "1:1", category: "photo" },
  // 아트
  { id: "fanart", type: "fanart", label: "팬아트 일러스트", desc: "자유 형식 팬아트", panels: 1, aspect: "3:4", category: "art" },
  { id: "sticker", type: "sticker", label: "스티커/이모지", desc: "귀여운 스티커 세트", panels: 1, aspect: "1:1", category: "art" },
  // 코믹
  { id: "instatoon", type: "instatoon", label: "4컷 인스타툰", desc: "야구 일상 4컷 인스타툰", panels: 4, aspect: "3:4", category: "comic" },
  { id: "meme", type: "meme", label: "밈/코믹", desc: "야구 밈이나 코믹", panels: 2, aspect: "1:1", category: "comic" },
  // 굿즈
  { id: "cheerbanner", type: "cheerbanner", label: "응원 배너", desc: "경기장 응원 배너", panels: 1, aspect: "3:4", category: "goods" },
  { id: "slogan", type: "slogan", label: "슬로건 배너", desc: "야구장 응원 슬로건", panels: 1, aspect: "16:9", category: "goods" },
  { id: "stickersheet", type: "stickersheet", label: "스티커시트", desc: "키스컷 스티커 시트", panels: 1, aspect: "3:4", category: "goods" },
  { id: "stadium-set", type: "stadium-set", label: "경기장 패키지", desc: "관람 굿즈 일괄 패키지", panels: 4, aspect: "3:4", category: "goods" },
  { id: "acrylicstand", type: "acrylicstand", label: "아크릴 스탠드", desc: "아크릴 스탠드/키링", panels: 1, aspect: "2:3", category: "goods" },
  { id: "phonecase", type: "phonecase", label: "폰케이스", desc: "스마트폰 케이스 디자인", panels: 1, aspect: "9:16", category: "goods" },
  // 키치
  { id: "deco-playercard", type: "deco-playercard", label: "꾸미기 선수카드", desc: "스티커와 장식으로 꾸민 선수카드", panels: 1, aspect: "2:3", category: "kitsch" },
  { id: "retro-magazine", type: "retro-magazine", label: "레트로 매거진", desc: "레트로 야구 매거진 커버", panels: 1, aspect: "3:4", category: "kitsch" },
  { id: "scorebook-page", type: "scorebook-page", label: "스코어북 꾸미기", desc: "스코어북/다이어리 꾸미기", panels: 1, aspect: "1:1", category: "kitsch" },
  { id: "kitsch-collage", type: "kitsch-collage", label: "키치 콜라주", desc: "네온, 크롬, 반짝이 맥시멀리스트 콜라주", panels: 1, aspect: "1:1", category: "kitsch" },
  { id: "ticket-bookmark", type: "ticket-bookmark", label: "관람 티켓", desc: "레트로 관람 티켓 & 북마크", panels: 1, aspect: "2:3", category: "kitsch" },
  { id: "profile-deco", type: "profile-deco", label: "프로필 꾸미기", desc: "SNS 프로필 세트", panels: 1, aspect: "1:1", category: "kitsch" },
];

export const TEMPLATE_CATEGORIES = [
  { id: "popular", label: "인기" },
  { id: "photo", label: "포토" },
  { id: "art", label: "아트" },
  { id: "comic", label: "코믹" },
  { id: "goods", label: "굿즈" },
  { id: "kitsch", label: "키치" },
] as const;

// ─── Style Presets ───────────────────────────────────────────────────────────

export interface StylePreset {
  id: FandomStylePreset;
  label: string;
  prompt: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: "anime", label: "애니메이션", prompt: "clean anime illustration style" },
  { id: "watercolor", label: "수채화", prompt: "soft watercolor painting style" },
  { id: "realistic", label: "리얼리스틱", prompt: "photorealistic digital painting" },
  { id: "chibi", label: "치비/SD", prompt: "cute chibi SD character style" },
  { id: "pop-art", label: "팝아트", prompt: "bold pop art style" },
  { id: "sketch", label: "스케치", prompt: "pencil sketch drawing style" },
  { id: "flat", label: "플랫", prompt: "flat minimal illustration style" },
  { id: "pixel", label: "픽셀아트", prompt: "pixel art retro style" },
  { id: "manhwa", label: "만화체", prompt: "Korean manhwa webtoon style" },
  { id: "dreamy", label: "몽환적", prompt: "dreamy pastel ethereal atmosphere" },
];

// ─── Pose / Outfit / Mood Chips ──────────────────────────────────────────────

export const POSE_CHIPS = ["타격", "투구", "수비", "응원", "단체"];
export const OUTFIT_CHIPS = ["홈유니폼", "원정유니폼", "연습복", "시상식", "캐주얼"];
export const MOOD_CHIPS = ["역동적", "승리", "열정적", "레트로", "감성적", "파워풀", "귀여운"];

/** Templates where pose/outfit chips are relevant */
export const POSE_OUTFIT_TEMPLATES: FandomTemplateType[] = [
  "portrait", "playercard", "matchday",
];

// ─── Template → Canvas Aspect Ratios ─────────────────────────────────────────

export const TEMPLATE_RATIOS: Record<FandomTemplateType, CanvasAspectRatio[]> = {
  portrait: ["3:4", "2:3", "4:5"],
  playercard: ["2:3"],
  wallpaper: ["9:16"],
  fanart: ["3:4", "1:1", "4:5"],
  sticker: ["1:1"],
  matchday: ["3:4", "4:5", "16:9"],
  edit: ["1:1", "4:5", "3:4"],
  instatoon: ["3:4", "1:1"],
  meme: ["1:1", "3:4"],
  cheerbanner: ["3:4"],
  slogan: ["16:9"],
  stickersheet: ["3:4", "4:5"],
  "stadium-set": ["3:4"],
  acrylicstand: ["2:3", "3:4"],
  phonecase: ["9:16"],
  "deco-playercard": ["2:3"],
  "retro-magazine": ["3:4", "4:5"],
  "scorebook-page": ["1:1"],
  "kitsch-collage": ["1:1", "4:5"],
  "ticket-bookmark": ["2:3"],
  "profile-deco": ["1:1"],
};

// ─── Single Image Templates (skip breakdown, go straight to generate) ────────

const SINGLE_IMAGE_TYPES: FandomTemplateType[] = [
  "portrait", "playercard", "wallpaper", "fanart", "sticker", "matchday", "edit",
  "meme",
  "cheerbanner", "slogan", "stickersheet", "acrylicstand", "phonecase",
  "deco-playercard", "retro-magazine", "scorebook-page", "kitsch-collage", "ticket-bookmark", "profile-deco",
];

export function isSingleImageTemplate(type: FandomTemplateType): boolean {
  return SINGLE_IMAGE_TYPES.includes(type);
}

// ─── Template Label Map ──────────────────────────────────────────────────────

export const TEMPLATE_LABELS: Record<FandomTemplateType, string> = {
  portrait: "포트레이트",
  playercard: "선수 카드",
  wallpaper: "배경화면",
  fanart: "팬아트",
  sticker: "스티커",
  matchday: "경기날 포토",
  edit: "에디트",
  instatoon: "인스타툰",
  meme: "밈",
  cheerbanner: "응원 배너",
  slogan: "슬로건",
  stickersheet: "스티커시트",
  "stadium-set": "경기장 패키지",
  acrylicstand: "아크릴 스탠드",
  phonecase: "폰케이스",
  "deco-playercard": "꾸미기 선수카드",
  "retro-magazine": "레트로 매거진",
  "scorebook-page": "스코어북 꾸미기",
  "kitsch-collage": "키치 콜라주",
  "ticket-bookmark": "관람 티켓",
  "profile-deco": "프로필 꾸미기",
};

// ─── Auto-Prompt Builder ─────────────────────────────────────────────────────

export function buildAutoPrompt(meta: FandomEditorMeta): string {
  const memberPart = meta.memberTags.length > 0
    ? meta.memberTags.join(", ")
    : meta.groupName;

  const stylePreset = meta.stylePreset
    ? STYLE_PRESETS.find((s) => s.id === meta.stylePreset)
    : null;

  const parts: string[] = [];

  // 표정/방향 랜덤 힌트 (매번 다른 결과를 유도)
  const expressionHints = ["밝게 웃는", "환하게 미소짓는", "신나는 표정의", "자신감 넘치는", "활기찬", "쾌활한", "익살스러운"];
  const angleHints = ["3/4 뷰", "살짝 고개 기울인", "역동적인 각도", "어깨너머 돌아보는", "대각선 구도"];
  const randExpr = expressionHints[Math.floor(Math.random() * expressionHints.length)];
  const randAngle = angleHints[Math.floor(Math.random() * angleHints.length)];

  switch (meta.templateType) {
    case "portrait":
      parts.push(`${randExpr} ${memberPart} 야구선수 포트레이트, ${randAngle}`);
      if (meta.poseHint) parts.push(`${meta.poseHint} 포즈`);
      break;
    case "playercard":
      parts.push(`${randExpr} ${memberPart} 선수 카드, ${randAngle}`);
      if (meta.poseHint) parts.push(`${meta.poseHint} 포즈`);
      break;
    case "wallpaper":
      parts.push(`${randExpr} ${memberPart} 폰 배경화면, ${randAngle}`);
      break;
    case "sticker":
      parts.push(`${memberPart} 귀여운 스티커 세트, 다양한 표정`);
      break;
    case "matchday":
      parts.push(`${randExpr} ${memberPart} 경기날 컨셉 포토, ${randAngle}`);
      if (meta.poseHint) parts.push(`${meta.poseHint} 포즈`);
      break;
    case "fanart":
      parts.push(`${randExpr} ${memberPart} 팬아트 일러스트, ${randAngle}`);
      break;
    case "edit":
      parts.push(`${randExpr} ${memberPart} 에디트/콜라주`);
      break;
    case "instatoon":
      parts.push(`${meta.groupName}의 ${memberPart} 4컷 인스타툰을 만들어줘`);
      break;
    case "meme":
      parts.push(`${memberPart} 2컷 밈 코믹, 재미있는 상황, 위아래 2패널 레이아웃`);
      break;
    case "cheerbanner":
      parts.push(`${memberPart} 야구장 응원 배너 디자인`);
      break;
    case "slogan":
      parts.push(`${memberPart} 야구장 응원 슬로건 배너`);
      break;
    case "stickersheet":
      parts.push(`${memberPart} 귀여운 스티커 시트, 다양한 포즈와 표정`);
      break;
    case "stadium-set":
      parts.push(`${memberPart} 경기장 관람 패키지 디자인`);
      break;
    case "acrylicstand":
      parts.push(`${memberPart} 아크릴 스탠드 디자인`);
      break;
    case "phonecase":
      parts.push(`${memberPart} 폰케이스 디자인`);
      break;
    case "deco-playercard":
      parts.push(`${memberPart} 꾸미기 선수카드, 스티커와 장식`);
      break;
    case "retro-magazine":
      parts.push(`${memberPart} 레트로 야구 매거진 커버`);
      break;
    case "scorebook-page":
      parts.push(`${memberPart} 스코어북 다이어리 꾸미기 페이지`);
      break;
    case "kitsch-collage":
      parts.push(`${memberPart} 네온 크롬 맥시멀리스트 키치 콜라주`);
      break;
    case "ticket-bookmark":
      parts.push(`${memberPart} 레트로 관람 티켓 & 북마크`);
      break;
    case "profile-deco":
      parts.push(`${memberPart} SNS 프로필 데코 세트`);
      break;
  }

  if (stylePreset) parts.push(`${stylePreset.label} 스타일`);
  if (meta.outfitHint) parts.push(`${meta.outfitHint} 입고`);
  if (meta.moodHint) parts.push(`${meta.moodHint} 분위기`);

  return parts.join(", ");
}

// ─── Onboarding Prompts ──────────────────────────────────────────────────────

export function getOnboardingPrompts(meta: FandomEditorMeta): string[] {
  const m = meta.memberTags[0] || meta.groupName;
  const label = TEMPLATE_LABELS[meta.templateType];

  const basePrompts: Record<FandomTemplateType, string[]> = {
    portrait: [
      `${m} 타격 포즈 포트레이트`,
      `${m} 홈유니폼 상반신`,
      `${m} 승리 세레머니 포트레이트`,
    ],
    playercard: [
      `${m} 선수 카드`,
      `역동적인 선수 카드`,
      `홀로그래픽 선수 카드`,
    ],
    wallpaper: [
      `${m} 역동적 배경화면`,
      `${meta.groupName} 야간경기 배경화면`,
      `${m} 경기장 배경화면`,
    ],
    fanart: [
      `${m} 홈런 장면 팬아트`,
      `${m} 수채화 스타일 팬아트`,
      `${m} 치비 스타일 팬아트`,
    ],
    sticker: [
      `${m} 다양한 표정 스티커`,
      `귀여운 치비 스티커 세트`,
      `${m} 이모지 세트`,
    ],
    matchday: [
      `${m} 경기날 컨셉 포토`,
      `${meta.groupName} 홈경기 포토`,
      `${m} 승리 포토`,
    ],
    edit: [
      `${m} 에디트/콜라주`,
      `경기 사진 에디트`,
      `레트로 필터 콜라주`,
    ],
    instatoon: [
      `${meta.groupName} 훈련장 일상 4컷`,
      `${m} 야구장 일상 인스타툰`,
      `${meta.groupName} 경기 비하인드 4컷`,
    ],
    meme: [
      `${m} 밈 만들어줘`,
      `${meta.groupName} 코믹`,
      `${m} 리액션 밈`,
    ],
    cheerbanner: [
      `${m} 응원 배너 디자인`,
      `${meta.groupName} 팀컬러 배너`,
      `${m} 화이팅 배너`,
    ],
    slogan: [
      `${m} 야구장 슬로건`,
      `${m} 화이팅 배너`,
      `${meta.groupName} 승리 슬로건`,
    ],
    stickersheet: [
      `${m} 귀여운 스티커 시트`,
      `${m} 다양한 표정 스티커`,
      `치비 스타일 스티커`,
    ],
    "stadium-set": [
      `${m} 경기장 관람 풀세트`,
      `${meta.groupName} 테마 패키지`,
      `${m} 직관 응원 패키지`,
    ],
    acrylicstand: [
      `${m} 아크릴 스탠드`,
      `${m} 전신 아크릴`,
      `${m} 치비 아크릴`,
    ],
    phonecase: [
      `${m} 폰케이스`,
      `${meta.groupName} 로고 폰케이스`,
      `${m} 역동적 폰케이스`,
    ],
    "deco-playercard": [
      `${m} 꾸미기 선수카드`,
      `반짝이 젬 스티커 선수카드`,
      `${m} 리본 데코 선수카드`,
    ],
    "retro-magazine": [
      `${m} 레트로 야구 매거진 커버`,
      `${meta.groupName} 스포츠 매거진 표지`,
      `${m} 레트로 잡지 커버`,
    ],
    "scorebook-page": [
      `${m} 스코어북 꾸미기`,
      `${m} 직관 기록 페이지`,
      `마스킹테이프 스코어북`,
    ],
    "kitsch-collage": [
      `${m} 네온 키치 콜라주`,
      `크롬 반짝이 콜라주`,
      `${m} 맥시멀리스트 콜라주`,
    ],
    "ticket-bookmark": [
      `${m} 레트로 관람 티켓`,
      `${m} 키치 북마크`,
      `빈티지 티켓 디자인`,
    ],
    "profile-deco": [
      `${m} 야구 프로필 꾸미기`,
      `키치 SNS 프로필 세트`,
      `${m} 프로필 데코`,
    ],
  };

  return basePrompts[meta.templateType] || [`${m} ${label} 만들어줘`];
}

// ─── Quick Actions per Template ──────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

export function getQuickActions(type: FandomTemplateType): QuickAction[] {
  switch (type) {
    case "portrait":
    case "playercard":
    case "matchday":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "pose", label: "포즈 변경", prompt: "다른 포즈로 변경해줘" },
        { id: "outfit", label: "유니폼 변경", prompt: "유니폼을 변경해줘" },
        { id: "expression", label: "표정 변경", prompt: "표정을 변경해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "wallpaper":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "mood", label: "분위기 변경", prompt: "분위기를 변경해줘" },
        { id: "text", label: "텍스트 추가", prompt: "텍스트를 추가해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "sticker":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "expression", label: "표정 추가", prompt: "다른 표정으로 추가해줘" },
        { id: "more", label: "더 만들기", prompt: "스티커를 더 만들어줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "fanart":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "style", label: "스타일 변경", prompt: "스타일을 변경해줘" },
        { id: "bg", label: "배경 변경", prompt: "배경을 변경해줘" },
        { id: "pose", label: "포즈 변경", prompt: "다른 포즈로 변경해줘" },
      ];
    case "edit":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "filter", label: "필터 변경", prompt: "필터를 변경해줘" },
        { id: "layout", label: "레이아웃", prompt: "레이아웃을 변경해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "instatoon":
      return [
        { id: "regen", label: "다시 생성", prompt: "전체 다시 생성해줘" },
        { id: "addcut", label: "컷 추가", prompt: "새 컷 추가해줘" },
        { id: "addmember", label: "멤버 추가", prompt: "다른 멤버도 추가해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "meme":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "addcut", label: "컷 추가", prompt: "새 컷 추가해줘" },
        { id: "text", label: "텍스트 변경", prompt: "텍스트를 변경해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "cheerbanner":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "theme", label: "테마 변경", prompt: "테마를 변경해줘" },
        { id: "text", label: "텍스트 편집", prompt: "응원 문구를 변경해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "slogan":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "text", label: "문구 변경", prompt: "응원 문구를 변경해줘" },
        { id: "color", label: "컬러 변경", prompt: "컬러를 변경해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "stickersheet":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "more", label: "더 만들기", prompt: "스티커를 더 추가해줘" },
        { id: "style", label: "스타일 변경", prompt: "스타일을 변경해줘" },
        { id: "layout", label: "배열 변경", prompt: "스티커 배열을 변경해줘" },
      ];
    case "stadium-set":
      return [
        { id: "regen", label: "전체 재생성", prompt: "전체 패키지를 다시 생성해줘" },
        { id: "theme", label: "테마 변경", prompt: "테마를 변경해줘" },
        { id: "add", label: "굿즈 추가", prompt: "굿즈를 추가해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "acrylicstand":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "pose", label: "포즈 변경", prompt: "포즈를 변경해줘" },
        { id: "outline", label: "외곽선", prompt: "키스컷 외곽선을 추가해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "phonecase":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "layout", label: "레이아웃", prompt: "레이아웃을 변경해줘" },
        { id: "color", label: "컬러 변경", prompt: "컬러를 변경해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "deco-playercard":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "sticker", label: "스티커 추가", prompt: "스티커를 더 추가해줘" },
        { id: "gem", label: "젬 장식", prompt: "반짝이 젬을 추가해줘" },
        { id: "frame", label: "프레임 변경", prompt: "프레임을 변경해줘" },
      ];
    case "retro-magazine":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "headline", label: "헤드라인", prompt: "매거진 헤드라인을 변경해줘" },
        { id: "layout", label: "레이아웃", prompt: "레이아웃을 변경해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "scorebook-page":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "tape", label: "테이프 추가", prompt: "마스킹테이프를 추가해줘" },
        { id: "deco", label: "데코 추가", prompt: "꾸미기 데코 요소를 추가해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "kitsch-collage":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "neon", label: "네온 효과", prompt: "네온 효과를 추가해줘" },
        { id: "chrome", label: "크롬 텍스트", prompt: "크롬 텍스트를 추가해줘" },
        { id: "more", label: "요소 추가", prompt: "콜라주 요소를 더 추가해줘" },
      ];
    case "ticket-bookmark":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "text", label: "텍스트 편집", prompt: "티켓 정보를 변경해줘" },
        { id: "vintage", label: "빈티지 효과", prompt: "빈티지 효과를 추가해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    case "profile-deco":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "frame", label: "프레임 변경", prompt: "프로필 프레임을 변경해줘" },
        { id: "deco", label: "데코 추가", prompt: "Y2K 데코를 추가해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
    default:
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "style", label: "스타일", prompt: "스타일을 변경해줘" },
      ];
  }
}

// ─── Template-specific suggested chips ───────────────────────────────────────

export function getTemplateChips(type: FandomTemplateType): string[] {
  switch (type) {
    case "portrait":
      return ["포트레이트 생성", "다른 포즈로", "의상 변경", "스타일 변경"];
    case "playercard":
      return ["선수카드 생성", "홀로그래픽 효과", "프레임 추가"];
    case "wallpaper":
      return ["배경화면 생성", "어두운 분위기", "밝은 분위기"];
    case "sticker":
      return ["스티커 생성", "다른 표정으로", "치비 스타일"];
    case "matchday":
      return ["경기날 포토 생성", "홈경기 컨셉", "원정 컨셉", "스타일 변경"];
    case "fanart":
      return ["팬아트 생성", "수채화 스타일", "스타일 변경"];
    case "edit":
      return ["에디트 생성", "필터 변경", "레이아웃 변경"];
    case "instatoon":
      return ["4컷 자동 생성", "컷 추가", "배경 생성"];
    case "meme":
      return ["밈 생성", "텍스트 변경", "스타일 변경"];
    case "cheerbanner":
      return ["응원배너 생성", "테마 변경", "텍스트 편집"];
    case "slogan":
      return ["슬로건 생성", "문구 변경", "컬러 변경"];
    case "stickersheet":
      return ["스티커 생성", "더 추가", "배열 변경"];
    case "stadium-set":
      return ["패키지 생성", "테마 변경", "굿즈 추가"];
    case "acrylicstand":
      return ["아크릴 생성", "포즈 변경", "스타일 변경"];
    case "phonecase":
      return ["폰케이스 생성", "레이아웃 변경", "컬러 변경"];
    case "deco-playercard":
      return ["꾸미기 선수카드 생성", "스티커 추가", "젬 장식"];
    case "retro-magazine":
      return ["매거진 커버 생성", "헤드라인 변경", "레이아웃 변경"];
    case "scorebook-page":
      return ["스코어북 꾸미기 생성", "테이프 추가", "데코 추가"];
    case "kitsch-collage":
      return ["키치 콜라주 생성", "네온 효과", "크롬 텍스트"];
    case "ticket-bookmark":
      return ["티켓 생성", "텍스트 편집", "빈티지 효과"];
    case "profile-deco":
      return ["프로필 데코 생성", "프레임 변경", "Y2K 데코"];
    default:
      return ["생성", "스타일 변경"];
  }
}

// ─── Template-specific placeholder text ──────────────────────────────────────

export function getTemplatePlaceholder(type: FandomTemplateType): string {
  switch (type) {
    case "portrait": return "어떤 포즈로 그릴까요?";
    case "playercard": return "어떤 선수카드를 만들까요?";
    case "wallpaper": return "어떤 분위기의 배경화면?";
    case "sticker": return "어떤 스티커를 만들까요?";
    case "matchday": return "어떤 경기날 포토를 만들까요?";
    case "fanart": return "어떤 팬아트를 그릴까요?";
    case "edit": return "어떤 에디트를 만들까요?";
    case "instatoon": return "어떤 인스타툰을 만들까요?";
    case "meme": return "어떤 밈을 만들까요?";
    case "cheerbanner": return "어떤 응원 배너를 만들까요?";
    case "slogan": return "어떤 슬로건을 만들까요?";
    case "stickersheet": return "어떤 스티커를 만들까요?";
    case "stadium-set": return "경기장 패키지 테마를 정해주세요";
    case "acrylicstand": return "어떤 아크릴 스탠드를 만들까요?";
    case "phonecase": return "어떤 폰케이스를 만들까요?";
    case "deco-playercard": return "어떤 꾸미기 선수카드를 만들까요?";
    case "retro-magazine": return "어떤 매거진 커버를 만들까요?";
    case "scorebook-page": return "어떤 스코어북 페이지를 만들까요?";
    case "kitsch-collage": return "어떤 키치 콜라주를 만들까요?";
    case "ticket-bookmark": return "어떤 티켓/북마크를 만들까요?";
    case "profile-deco": return "어떤 프로필 데코를 만들까요?";
    default: return "무엇을 만들고 싶으세요?";
  }
}

// ─── Fandom Sticker Packs ──────────────────────────────────────────────────

export { type FandomStickerCategory, type FandomSticker, type PhotocardFrame, type ConcertEffect };

export const FANDOM_STICKER_PACKS: FandomSticker[] = [
  // Hearts
  { id: "s-heart-1", category: "heart", imageUrl: "❤️", label: "빨간 하트" },
  { id: "s-heart-2", category: "heart", imageUrl: "💜", label: "보라 하트" },
  { id: "s-heart-3", category: "heart", imageUrl: "💖", label: "반짝 하트" },
  { id: "s-heart-4", category: "heart", imageUrl: "💗", label: "두근 하트" },
  { id: "s-heart-5", category: "heart", imageUrl: "🩷", label: "핑크 하트" },
  { id: "s-heart-6", category: "heart", imageUrl: "🤍", label: "흰 하트" },
  // Cheer
  { id: "s-ch-1", category: "cheer", imageUrl: "📣", label: "응원" },
  { id: "s-ch-2", category: "cheer", imageUrl: "✨", label: "반짝이" },
  { id: "s-ch-3", category: "cheer", imageUrl: "🌟", label: "별" },
  { id: "s-ch-4", category: "cheer", imageUrl: "🎺", label: "응원나팔" },
  { id: "s-ch-5", category: "cheer", imageUrl: "👏", label: "박수" },
  { id: "s-ch-6", category: "cheer", imageUrl: "⭐", label: "노란 별" },
  // Emoji
  { id: "s-emo-1", category: "emoji", imageUrl: "🥰", label: "사랑 눈" },
  { id: "s-emo-2", category: "emoji", imageUrl: "😍", label: "하트 눈" },
  { id: "s-emo-3", category: "emoji", imageUrl: "🤩", label: "반짝 눈" },
  { id: "s-emo-4", category: "emoji", imageUrl: "😭", label: "감동 울음" },
  { id: "s-emo-5", category: "emoji", imageUrl: "🫶", label: "하트 손" },
  { id: "s-emo-6", category: "emoji", imageUrl: "🙌", label: "만세" },
  // Logo
  { id: "s-logo-1", category: "logo", imageUrl: "⚾", label: "야구공" },
  { id: "s-logo-2", category: "logo", imageUrl: "🏟️", label: "경기장" },
  { id: "s-logo-3", category: "logo", imageUrl: "🧢", label: "야구모자" },
  { id: "s-logo-4", category: "logo", imageUrl: "🏆", label: "트로피" },
  { id: "s-logo-5", category: "logo", imageUrl: "🥇", label: "금메달" },
  { id: "s-logo-6", category: "logo", imageUrl: "🎖️", label: "훈장" },
  // Text
  { id: "s-txt-1", category: "text", imageUrl: "💬", label: "말풍선" },
  { id: "s-txt-2", category: "text", imageUrl: "🗯️", label: "외침" },
  { id: "s-txt-3", category: "text", imageUrl: "💭", label: "생각" },
  { id: "s-txt-4", category: "text", imageUrl: "📢", label: "확성기" },
  { id: "s-txt-5", category: "text", imageUrl: "🏷️", label: "태그" },
  { id: "s-txt-6", category: "text", imageUrl: "📝", label: "메모" },
  // Stadium
  { id: "s-std-1", category: "stadium", imageUrl: "🎉", label: "축하" },
  { id: "s-std-2", category: "stadium", imageUrl: "🎊", label: "컨페티" },
  { id: "s-std-3", category: "stadium", imageUrl: "🎆", label: "불꽃놀이" },
  { id: "s-std-4", category: "stadium", imageUrl: "🔥", label: "불꽃" },
  { id: "s-std-5", category: "stadium", imageUrl: "💥", label: "폭발" },
  { id: "s-std-6", category: "stadium", imageUrl: "🌈", label: "무지개" },
];

// ─── Photocard Frames ──────────────────────────────────────────────────────

export interface PhotocardFrameDef {
  id: PhotocardFrame;
  label: string;
  desc: string;
}

export const PHOTOCARD_FRAMES: PhotocardFrameDef[] = [
  { id: "basic", label: "기본", desc: "깔끔한 기본 프레임" },
  { id: "polaroid", label: "폴라로이드", desc: "하단 여백 폴라로이드 스타일" },
  { id: "player-card", label: "선수 카드", desc: "공식 선수카드 스타일" },
  { id: "holographic", label: "홀로그래픽", desc: "반짝이는 홀로 효과" },
  { id: "vintage", label: "빈티지", desc: "레트로 빈티지 느낌" },
  { id: "neon", label: "네온", desc: "화려한 네온 테두리" },
];

// ─── Team Colors ──────────────────────────────────────────────────────────

export interface TeamColor {
  groupName: string;
  color: string;
}

// backward compat alias
export type LightstickColor = TeamColor;

export const TEAM_COLORS: TeamColor[] = [
  { groupName: "LG 트윈스", color: "#C60C30" },
  { groupName: "KT 위즈", color: "#000000" },
  { groupName: "SSG 랜더스", color: "#CE0E2D" },
  { groupName: "NC 다이노스", color: "#315288" },
  { groupName: "두산 베어스", color: "#131230" },
  { groupName: "KIA 타이거즈", color: "#EA0029" },
  { groupName: "롯데 자이언츠", color: "#041E42" },
  { groupName: "삼성 라이온즈", color: "#074CA1" },
  { groupName: "한화 이글스", color: "#FF6600" },
  { groupName: "키움 히어로즈", color: "#820024" },
];

// backward compat alias
export const LIGHTSTICK_COLORS = TEAM_COLORS;

// ─── Stadium Effects ──────────────────────────────────────────────────────

export interface StadiumEffectDef {
  id: ConcertEffect;
  label: string;
  desc: string;
  prompt: string;
}

// backward compat alias
export type ConcertEffectDef = StadiumEffectDef;

export const STADIUM_EFFECTS: StadiumEffectDef[] = [
  { id: "cheer-glow", label: "응원 빛", desc: "응원 글로우 효과", prompt: "응원 빛 효과를 추가해줘" },
  { id: "spotlight", label: "조명", desc: "경기장 스포트라이트", prompt: "경기장 스포트라이트 조명을 추가해줘" },
  { id: "confetti", label: "컨페티", desc: "승리 축하 컨페티", prompt: "승리 컨페티 효과를 추가해줘" },
  { id: "firework", label: "불꽃놀이", desc: "경기장 불꽃놀이", prompt: "불꽃놀이 효과를 추가해줘" },
  { id: "laser", label: "레이저", desc: "레이저 빔 효과", prompt: "레이저 빔 효과를 추가해줘" },
];

// backward compat alias
export const CONCERT_EFFECTS = STADIUM_EFFECTS;

// ─── Baseball Aesthetic Filters ──────────────────────────────────────────────

export interface BaseballAestheticFilter {
  id: AestheticFilterId;
  label: string;
  prompt: string;
  color: string;
}

export const BASEBALL_AESTHETIC_FILTERS: BaseballAestheticFilter[] = [
  { id: "classic",        label: "클래식",       prompt: "classic baseball, timeless, clean white uniform, blue sky", color: "#1E3A5F" },
  { id: "retro",          label: "레트로",       prompt: "retro vintage baseball, sepia tones, old stadium, film grain", color: "#D4A574" },
  { id: "dynamic",        label: "역동적",       prompt: "dynamic action shot, motion blur, powerful swing, dramatic angle", color: "#EF4444" },
  { id: "night-game",     label: "야간경기",     prompt: "night game atmosphere, stadium lights, dramatic shadows, neon glow", color: "#1A1A2E" },
  { id: "victory",        label: "승리",         prompt: "victory celebration, confetti, golden light, triumphant mood", color: "#FFD700" },
  { id: "daytime",        label: "주간경기",     prompt: "bright daytime game, sunny, blue sky, vivid green field", color: "#4CAF50" },
  { id: "stadium",        label: "경기장",       prompt: "stadium atmosphere, crowd, wide angle, grand scale", color: "#37474F" },
  { id: "magazine",       label: "매거진",       prompt: "sports magazine editorial, clean typography, professional photography", color: "#2C2C2C" },
  { id: "summer-day",     label: "여름 야구",    prompt: "bright summer baseball, vivid, tropical, cheerful, sunny day", color: "#FF6347" },
  { id: "autumn-series",  label: "가을 야구",    prompt: "autumn baseball, golden leaves, warm tones, playoff atmosphere", color: "#D4763A" },
  { id: "kitsch-retro",   label: "키치 레트로",   prompt: "retro kitsch baseball, checkerboard, neon signs, vintage stickers, maximalist", color: "#FF6F61" },
  { id: "kitsch-pop",     label: "키치 팝",       prompt: "pop art baseball, bold colors, comic style, halftone dots", color: "#FF69B4" },
  { id: "kitsch-heritage", label: "키치 헤리티지", prompt: "heritage kitsch, old school baseball, pennant flags, classic typography", color: "#8B4513" },
];


// ─── KBO Team Identity for AI Image Generation ─────────────────────────────

export interface KboTeamIdentity {
  nameEn: string;
  primaryHex: string;
  secondaryHex: string;
  uniformDesc: string;
  logoDesc: string;
}

export const KBO_TEAM_IDENTITY: Record<string, KboTeamIdentity> = {
  "LG 트윈스": {
    nameEn: "LG Twins",
    primaryHex: "#C60C30",
    secondaryHex: "#000000",
    uniformDesc: "White home jersey with cherry red 'LG' text logo on chest, thin red pinstripes, red baseball cap with white 'L' letter, black belt. Away jersey: gray with red 'TWINS' lettering. Colors: cherry red and black.",
    logoDesc: "Red circular emblem with interlocking 'LG' letters, twin star symbol, clean red and white design",
  },
  "KT 위즈": {
    nameEn: "KT Wiz",
    primaryHex: "#000000",
    secondaryHex: "#ED1C24",
    uniformDesc: "White home jersey with black angular gothic 'wiz' wordmark, red burst/star-burst mark below wordmark (wizard magic motif), black cap with image symbol. Away jersey: gray/charcoal with similar design. Adidas-like side panels. 2024 JUMOTUBE collaboration redesign. Colors: black and red.",
    logoDesc: "Angular gothic 'KT wiz' wordmark with star-burst magic motif, black and red, wizard/magic themed identity",
  },
  "SSG 랜더스": {
    nameEn: "SSG Landers",
    primaryHex: "#CE0E2D",
    secondaryHex: "#000000",
    uniformDesc: "Black home jersey with 'LANDERS' wordmark in Empera font (anchor-inspired design), red 'L' cap logo with red UFO orbit ring. Away jersey: crimson red with white 'LANDERS' text. Anchor-motif number font. Colors: black (home), crimson red (away), with yellow accent from parent company.",
    logoDesc: "Red 'L' letter symbol with red UFO orbit circling it, 'SSG LANDERS' anchor-inspired Empera font wordmark, modern space-themed rebranding by Todd Radom (2024)",
  },
  "NC 다이노스": {
    nameEn: "NC Dinos",
    primaryHex: "#315288",
    secondaryHex: "#C0A882",
    uniformDesc: "White home jersey with navy blue 'NC' script logo, metallic gold accent trim on sleeves and collar, navy cap with gold 'N' letter. Away jersey: navy blue with gold 'DINOS' lettering. Colors: navy blue and metallic gold.",
    logoDesc: "Navy blue T-rex dinosaur silhouette with 'NC DINOS' text, gold accent details, powerful prehistoric theme",
  },
  "두산 베어스": {
    nameEn: "Doosan Bears",
    primaryHex: "#131230",
    secondaryHex: "#ED1C24",
    uniformDesc: "White home jersey with dark navy 'BEARS' in custom Hustle Block font (classic utilitarian baseball with modern touch), Adidas three-stripe side panels, red accent piping. Away jersey: gray with dark navy and red. Dark navy cap with new diamond-shaped emblem. 2025 complete rebrand by RARE Design (US agency). Colors: very dark navy and red.",
    logoDesc: "Diamond (infield) shaped emblem with 'DOOSAN' top and 'SEOUL' bottom in red banners wrapping a baseball, Hustle Block custom typeface, steel bear mascot 'Cheol-woong', 2025 15-year rebrand by RARE Design with Adidas partnership",
  },
  "KIA 타이거즈": {
    nameEn: "KIA Tigers",
    primaryHex: "#EA0029",
    secondaryHex: "#000000",
    uniformDesc: "White home jersey with red 'KIA' text on chest, black and red trim on sleeves, red cap with black tiger stripe logo. Away jersey: bright red with white 'TIGERS' text and black accents. Colors: bold red and black.",
    logoDesc: "Fierce red and black tiger face logo with snarling expression, 'KIA TIGERS' text, tiger stripe pattern elements",
  },
  "롯데 자이언츠": {
    nameEn: "Lotte Giants",
    primaryHex: "#041E42",
    secondaryHex: "#E30613",
    uniformDesc: "White home jersey with navy 'GIANTS' arched text, seagull emblem on right sleeve (asymmetric design), navy cap with overlapping 'LG' letters in red. Away jersey: navy blue with white/red 'LOTTE' text. Dream uniform: ivory base with sky blue accents. 2023 CI overhaul (flat/modern design). Colors: deep navy, red, orange accent.",
    logoDesc: "Flat-design seagull flying over blue ocean emblem (Busan sea motif), 'GIANTS' text in black with deep orange accent, modern minimal style, 2023 41st anniversary CI rebrand",
  },
  "삼성 라이온즈": {
    nameEn: "Samsung Lions",
    primaryHex: "#074CA1",
    secondaryHex: "#FFFFFF",
    uniformDesc: "White home jersey with royal blue 'SAMSUNG' text across chest, blue cap with white 'S' letter, clean blue trim. Away jersey: blue with white 'LIONS' text. Colors: royal blue and white, clean and bold.",
    logoDesc: "Royal blue circular emblem with roaring lion face, 'SAMSUNG LIONS' text, strong blue and white contrast",
  },
  "한화 이글스": {
    nameEn: "Hanwha Eagles",
    primaryHex: "#FF6600",
    secondaryHex: "#1B2A4A",
    uniformDesc: "White home jersey with eagle beak/talon-inspired sharp serif wordmark (based on 1999 championship logo), clean design without neck/sleeve color lines, orange cap. Away jersey: navy blue (not gray) with uppercase arch-style 'EAGLES' wordmark featuring perched eagle motif. Custom 한화이글스체 font with eagle-beak straight serifs. Colors: orange (home), navy (away), black accent. Slogan: RIDE THE STORM.",
    logoDesc: "Eagle beak and talon-inspired sharp serif wordmark, hunting eagle motif, lightning/feather/wing design elements throughout branding, modern 40th anniversary rebrand by Matthew Wolff (2025)",
  },
  "키움 히어로즈": {
    nameEn: "Kiwoom Heroes",
    primaryHex: "#820024",
    secondaryHex: "#000000",
    uniformDesc: "White home jersey with deep maroon 'HEROES' text across chest, maroon cap with gold 'H' letter, burgundy trim. Away jersey: deep maroon/burgundy with white text. Seoul special uniform: burgundy + Danhong (단홍색, Seoul symbolic color) with Seoul landmarks. 2025 Heroes Green uniform: gold cap + green jersey. Nike partnership. Colors: deep maroon/burgundy and black, with green accent (2025).",
    logoDesc: "Deep maroon circular emblem with heroic figure silhouette, 'KIWOOM HEROES' text, burgundy and gold accents, Gocheok Sky Dome motif",
  },
};

// ─── English→Korean team name mapping (KboTeam.name → KBO_TEAM_IDENTITY key) ─
const TEAM_NAME_TO_KOREAN: Record<string, string> = {
  "LG Twins": "LG 트윈스",
  "KT Wiz": "KT 위즈",
  "SSG Landers": "SSG 랜더스",
  "NC Dinos": "NC 다이노스",
  "Doosan Bears": "두산 베어스",
  "KIA Tigers": "KIA 타이거즈",
  "Lotte Giants": "롯데 자이언츠",
  "Samsung Lions": "삼성 라이온즈",
  "Hanwha Eagles": "한화 이글스",
  "Kiwoom Heroes": "키움 히어로즈",
};

/** Resolve English or Korean team name to KBO_TEAM_IDENTITY key */
function resolveTeamKey(groupName: string): string {
  return TEAM_NAME_TO_KOREAN[groupName] || groupName;
}

/**
 * Returns an English prompt segment describing the team's visual identity
 * for accurate AI image generation (colors, uniforms, logos).
 * Accepts both English ("LG Twins") and Korean ("LG 트윈스") team names.
 */
export function getTeamIdentityPrompt(groupName: string): string | null {
  const team = KBO_TEAM_IDENTITY[resolveTeamKey(groupName)];
  if (!team) return null;

  return `[TEAM VISUAL IDENTITY - ${team.nameEn} (2025-2026 SEASON)]
Primary color: ${team.primaryHex}, Secondary color: ${team.secondaryHex}.
CURRENT Uniform (2025-2026): ${team.uniformDesc}
CURRENT Logo (2025-2026): ${team.logoDesc}
WARNING: This team may have rebranded recently. The description above is the ONLY correct current design. Ignore any older versions from your training data.`;
}

/** Find fandom color palette by English or Korean team name */
export function findFandomPalette(groupName: string): FandomColorPalette | undefined {
  const key = resolveTeamKey(groupName);
  return FANDOM_COLOR_PALETTES.find(p => p.groupName === key);
}

// ─── Fandom Color Palettes (expanded from LIGHTSTICK_COLORS) ────────────────

export interface FandomColorPalette {
  groupName: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: [string, string];
  lightstick: string;
}

export const FANDOM_COLOR_PALETTES: FandomColorPalette[] = [
  { groupName: "LG 트윈스",     primary: "#C60C30", secondary: "#1D1D1D", accent: "#E8384F", gradient: ["#C60C30", "#8B0000"], lightstick: "#C60C30" },
  { groupName: "KT 위즈",       primary: "#000000", secondary: "#E30613", accent: "#333333", gradient: ["#000000", "#E30613"], lightstick: "#000000" },
  { groupName: "SSG 랜더스",    primary: "#CE0E2D", secondary: "#FFD700", accent: "#E8384F", gradient: ["#CE0E2D", "#8B0000"], lightstick: "#CE0E2D" },
  { groupName: "NC 다이노스",   primary: "#315288", secondary: "#C1A57B", accent: "#4A7AB5", gradient: ["#315288", "#1A365D"], lightstick: "#315288" },
  { groupName: "두산 베어스",   primary: "#131230", secondary: "#ED1C24", accent: "#2D2B5F", gradient: ["#131230", "#ED1C24"], lightstick: "#131230" },
  { groupName: "KIA 타이거즈",  primary: "#EA0029", secondary: "#000000", accent: "#FF3355", gradient: ["#EA0029", "#8B0000"], lightstick: "#EA0029" },
  { groupName: "롯데 자이언츠", primary: "#041E42", secondary: "#D00F31", accent: "#1B3A6B", gradient: ["#041E42", "#D00F31"], lightstick: "#041E42" },
  { groupName: "삼성 라이온즈", primary: "#074CA1", secondary: "#FFFFFF", accent: "#2A6FC9", gradient: ["#074CA1", "#03306B"], lightstick: "#074CA1" },
  { groupName: "한화 이글스",   primary: "#FF6600", secondary: "#1D1D1D", accent: "#FF8833", gradient: ["#FF6600", "#CC5200"], lightstick: "#FF6600" },
  { groupName: "키움 히어로즈", primary: "#820024", secondary: "#000000", accent: "#A3003A", gradient: ["#820024", "#4A0015"], lightstick: "#820024" },
];

// ─── Wallpaper Widget Layouts ────────────────────────────────────────────────

export interface WallpaperSafeZone {
  x: number; y: number; width: number; height: number; label: string;
}

export interface WallpaperLayout {
  id: string;
  label: string;
  safeZones: WallpaperSafeZone[];
}

export const WALLPAPER_LAYOUTS: WallpaperLayout[] = [
  {
    id: "ios-clock",
    label: "iOS 시계 레이아웃",
    safeZones: [
      { x: 30, y: 60, width: 390, height: 120, label: "시계/날짜 영역" },
    ],
  },
  {
    id: "android-top",
    label: "Android 상단 위젯",
    safeZones: [
      { x: 20, y: 40, width: 410, height: 180, label: "위젯 영역" },
    ],
  },
  {
    id: "lockscreen",
    label: "잠금화면 (시간+날짜)",
    safeZones: [
      { x: 30, y: 50, width: 390, height: 100, label: "시간" },
      { x: 30, y: 160, width: 200, height: 40, label: "날짜" },
    ],
  },
  {
    id: "full",
    label: "전체 화면",
    safeZones: [],
  },
];

// ─── Fandom Design Elements ─────────────────────────────────────────────────

export interface FandomDesignElement {
  id: string;
  label: string;
  category: "texture" | "overlay" | "pattern" | "deco";
  prompt: string;
}

export const FANDOM_DESIGN_ELEMENTS: FandomDesignElement[] = [
  // Textures
  { id: "holo-texture", label: "홀로 텍스처", category: "texture", prompt: "holographic foil texture overlay" },
  { id: "glitter", label: "글리터", category: "texture", prompt: "sparkle glitter dust particles" },
  { id: "film-grain", label: "필름 그레인", category: "texture", prompt: "vintage film grain texture" },
  // Overlays
  { id: "bokeh", label: "보케 오버레이", category: "overlay", prompt: "soft bokeh light circles overlay" },
  { id: "cheer-lights", label: "응원 조명", category: "overlay", prompt: "stadium cheer lights glowing background" },
  { id: "confetti-overlay", label: "컨페티", category: "overlay", prompt: "victory confetti falling overlay" },
  { id: "lens-flare", label: "렌즈 플레어", category: "overlay", prompt: "anamorphic lens flare light" },
  // Patterns
  { id: "baseball-pattern", label: "야구공 패턴", category: "pattern", prompt: "repeating baseball stitching pattern background" },
  { id: "diamond-pattern", label: "다이아몬드 패턴", category: "pattern", prompt: "repeating baseball diamond field pattern" },
  { id: "grass-texture", label: "잔디 텍스처", category: "pattern", prompt: "green grass field texture background" },
  // Deco
  { id: "pennant", label: "페넌트", category: "deco", prompt: "decorative baseball pennant flags" },
  { id: "flower-frame", label: "꽃 프레임", category: "deco", prompt: "floral frame border decoration" },
  { id: "ribbon", label: "리본 장식", category: "deco", prompt: "cute ribbon bow decoration" },
  // Kitsch deco
  { id: "retro-sticker", label: "레트로 스티커", category: "deco", prompt: "retro vintage baseball stickers, stars, badges" },
  { id: "chrome-text", label: "크롬 텍스트", category: "deco", prompt: "chrome metallic 3D text effect" },
  { id: "masking-tape", label: "마스킹테이프", category: "deco", prompt: "colorful washi masking tape strips decoration" },
  { id: "checkerboard", label: "체커보드", category: "pattern", prompt: "retro checkerboard pattern, team colors" },
  { id: "gem-sticker", label: "젬 스티커", category: "deco", prompt: "sparkly gem rhinestone sticker decorations" },
  { id: "neon-frame", label: "네온 프레임", category: "overlay", prompt: "glowing neon frame border, team colors" },
];

// ─── Baseball Text Presets ───────────────────────────────────────────────────

export interface BaseballTextPreset {
  id: string;
  text: string;
  category: "cheer" | "victory" | "love" | "general";
  lang: "ko" | "en";
}

export const BASEBALL_TEXT_PRESETS: BaseballTextPreset[] = [
  { id: "t1",  text: "화이팅!",            category: "cheer",    lang: "ko" },
  { id: "t2",  text: "홈런 치자!",         category: "cheer",    lang: "ko" },
  { id: "t3",  text: "승리의 함성",         category: "victory",  lang: "ko" },
  { id: "t4",  text: "우승하자!",           category: "victory",  lang: "ko" },
  { id: "t5",  text: "오늘도 직관!",        category: "general",  lang: "ko" },
  { id: "t6",  text: "영원한 팬",           category: "love",     lang: "ko" },
  { id: "t7",  text: "최고의 선수",         category: "cheer",    lang: "ko" },
  { id: "t8",  text: "Play Ball!",         category: "general",  lang: "en" },
  { id: "t9",  text: "Home Run!",          category: "cheer",    lang: "en" },
  { id: "t10", text: "MVP!",               category: "victory",  lang: "en" },
  { id: "t11", text: "We Are Champions",   category: "victory",  lang: "en" },
  { id: "t12", text: "Go! Go! Go!",        category: "cheer",    lang: "en" },
  // Kitsch text presets
  { id: "t13", text: "My Player",          category: "love",     lang: "en" },
  { id: "t14", text: "Strike Out!",        category: "cheer",    lang: "en" },
  { id: "t15", text: "Grand Slam",         category: "victory",  lang: "en" },
  { id: "t16", text: "직관은 나의 힘",      category: "cheer",    lang: "ko" },
  { id: "t17", text: "야구장 가자!",        category: "general",  lang: "ko" },
];

