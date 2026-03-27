import type {
  FandomTemplateType,
  FandomStylePreset,
  FandomEditorMeta,
  CanvasAspectRatio,
  FandomStickerCategory,
  FandomSticker,
  PhotocardFrame,
  ConcertEffect,
  KpopAestheticFilterId,
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
  { id: "photocard", type: "photocard", label: "포토카드", desc: "K-pop 포토카드 사이즈", panels: 1, aspect: "2:3", category: "popular" },
  { id: "portrait", type: "portrait", label: "아이돌 포트레이트", desc: "솔로 또는 그룹 초상화", panels: 1, aspect: "3:4", category: "popular" },
  { id: "wallpaper", type: "wallpaper", label: "폰 배경화면", desc: "핸드폰 배경화면", panels: 1, aspect: "9:16", category: "popular" },
  // 포토
  { id: "concept", type: "concept", label: "컨셉 포토", desc: "앨범 컨셉 포토 스타일", panels: 1, aspect: "3:4", category: "photo" },
  { id: "edit", type: "edit", label: "에디트/콜라주", desc: "사진 에디트 & 콜라주", panels: 1, aspect: "1:1", category: "photo" },
  // 아트
  { id: "fanart", type: "fanart", label: "팬아트 일러스트", desc: "자유 형식 팬아트", panels: 1, aspect: "3:4", category: "art" },
  { id: "sticker", type: "sticker", label: "스티커/이모지", desc: "귀여운 스티커 세트", panels: 1, aspect: "1:1", category: "art" },
  // 코믹
  { id: "instatoon", type: "instatoon", label: "4컷 인스타툰", desc: "클래식 4컷 인스타툰", panels: 4, aspect: "3:4", category: "comic" },
  { id: "meme", type: "meme", label: "밈/코믹", desc: "밈이나 코믹", panels: 2, aspect: "1:1", category: "comic" },
  // 굿즈
  { id: "cupsleeve", type: "cupsleeve", label: "컵슬리브", desc: "생일카페 컵슬리브", panels: 1, aspect: "3:4", category: "goods" },
  { id: "slogan", type: "slogan", label: "슬로건 배너", desc: "콘서트 슬로건/배너", panels: 1, aspect: "16:9", category: "goods" },
  { id: "stickersheet", type: "stickersheet", label: "스티커시트", desc: "키스컷 스티커 시트", panels: 1, aspect: "3:4", category: "goods" },
  { id: "birthday-set", type: "birthday-set", label: "생카 패키지", desc: "생일카페 일괄 패키지", panels: 4, aspect: "3:4", category: "goods" },
  { id: "acrylicstand", type: "acrylicstand", label: "아크릴 스탠드", desc: "아크릴 스탠드/키링", panels: 1, aspect: "2:3", category: "goods" },
  { id: "phonecase", type: "phonecase", label: "폰케이스", desc: "스마트폰 케이스 디자인", panels: 1, aspect: "9:16", category: "goods" },
  // 키치
  { id: "deco-photocard", type: "deco-photocard", label: "꾸미기 포카", desc: "Y2K 스티커, 젬, 리본으로 꾸민 포토카드", panels: 1, aspect: "2:3", category: "kitsch" },
  { id: "retro-magazine", type: "retro-magazine", label: "키치 매거진", desc: "레트로 Y2K 매거진 커버", panels: 1, aspect: "3:4", category: "kitsch" },
  { id: "diary-page", type: "diary-page", label: "아이돌 다꾸", desc: "다이어리 꾸미기 페이지", panels: 1, aspect: "1:1", category: "kitsch" },
  { id: "kitsch-collage", type: "kitsch-collage", label: "키치 콜라주", desc: "네온, 크롬, 반짝이 맥시멀리스트 콜라주", panels: 1, aspect: "1:1", category: "kitsch" },
  { id: "ticket-bookmark", type: "ticket-bookmark", label: "키치 티켓", desc: "레트로 콘서트 티켓 & 북마크", panels: 1, aspect: "2:3", category: "kitsch" },
  { id: "profile-deco", type: "profile-deco", label: "프로필 꾸미기", desc: "Y2K 키치 SNS 프로필 세트", panels: 1, aspect: "1:1", category: "kitsch" },
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

export const POSE_CHIPS = ["셀카", "상반신", "전신", "그룹샷", "프로필"];
export const OUTFIT_CHIPS = ["무대의상", "교복", "캐주얼", "한복", "연습복"];
export const MOOD_CHIPS = ["밝은", "다크", "몽환적", "레트로", "청순한", "시크한", "귀여운"];

/** Templates where pose/outfit chips are relevant */
export const POSE_OUTFIT_TEMPLATES: FandomTemplateType[] = [
  "portrait", "photocard", "concept",
];

// ─── Template → Canvas Aspect Ratios ─────────────────────────────────────────

export const TEMPLATE_RATIOS: Record<FandomTemplateType, CanvasAspectRatio[]> = {
  portrait: ["3:4", "2:3", "4:5"],
  photocard: ["2:3"],
  wallpaper: ["9:16"],
  fanart: ["3:4", "1:1", "4:5"],
  sticker: ["1:1"],
  concept: ["3:4", "4:5", "16:9"],
  edit: ["1:1", "4:5", "3:4"],
  instatoon: ["3:4", "1:1"],
  meme: ["1:1", "3:4"],
  cupsleeve: ["3:4"],
  slogan: ["16:9"],
  stickersheet: ["3:4", "4:5"],
  "birthday-set": ["3:4"],
  acrylicstand: ["2:3", "3:4"],
  phonecase: ["9:16"],
  "deco-photocard": ["2:3"],
  "retro-magazine": ["3:4", "4:5"],
  "diary-page": ["1:1"],
  "kitsch-collage": ["1:1", "4:5"],
  "ticket-bookmark": ["2:3"],
  "profile-deco": ["1:1"],
};

// ─── Single Image Templates (skip breakdown, go straight to generate) ────────

const SINGLE_IMAGE_TYPES: FandomTemplateType[] = [
  "portrait", "photocard", "wallpaper", "fanart", "sticker", "concept", "edit",
  "meme",
  "cupsleeve", "slogan", "stickersheet", "acrylicstand", "phonecase",
  "deco-photocard", "retro-magazine", "diary-page", "kitsch-collage", "ticket-bookmark", "profile-deco",
];

export function isSingleImageTemplate(type: FandomTemplateType): boolean {
  return SINGLE_IMAGE_TYPES.includes(type);
}

// ─── Template Label Map ──────────────────────────────────────────────────────

export const TEMPLATE_LABELS: Record<FandomTemplateType, string> = {
  portrait: "포트레이트",
  photocard: "포토카드",
  wallpaper: "배경화면",
  fanart: "팬아트",
  sticker: "스티커",
  concept: "컨셉 포토",
  edit: "에디트",
  instatoon: "인스타툰",
  meme: "밈",
  cupsleeve: "컵슬리브",
  slogan: "슬로건",
  stickersheet: "스티커시트",
  "birthday-set": "생카 패키지",
  acrylicstand: "아크릴 스탠드",
  phonecase: "폰케이스",
  "deco-photocard": "꾸미기 포카",
  "retro-magazine": "키치 매거진",
  "diary-page": "아이돌 다꾸",
  "kitsch-collage": "키치 콜라주",
  "ticket-bookmark": "키치 티켓",
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

  switch (meta.templateType) {
    case "portrait":
      parts.push(`${memberPart} 아이돌 포트레이트`);
      if (meta.poseHint) parts.push(`${meta.poseHint} 포즈`);
      break;
    case "photocard":
      parts.push(`${memberPart} 포토카드`);
      break;
    case "wallpaper":
      parts.push(`${memberPart} 폰 배경화면`);
      break;
    case "sticker":
      parts.push(`${memberPart} 귀여운 스티커 세트, 다양한 표정`);
      break;
    case "concept":
      parts.push(`${memberPart} 앨범 컨셉 포토`);
      break;
    case "fanart":
      parts.push(`${memberPart} 팬아트 일러스트`);
      break;
    case "edit":
      parts.push(`${memberPart} 에디트/콜라주`);
      break;
    case "instatoon":
      parts.push(`${meta.groupName}의 ${memberPart} 4컷 인스타툰을 만들어줘`);
      break;
    case "meme":
      parts.push(`${memberPart} 2컷 밈 코믹, 재미있는 상황, 위아래 2패널 레이아웃`);
      break;
    case "cupsleeve":
      parts.push(`${memberPart} 생일카페 컵슬리브 디자인`);
      break;
    case "slogan":
      parts.push(`${memberPart} 콘서트 슬로건 배너`);
      break;
    case "stickersheet":
      parts.push(`${memberPart} 귀여운 스티커 시트, 다양한 포즈와 표정`);
      break;
    case "birthday-set":
      parts.push(`${memberPart} 생일카페 패키지 디자인`);
      break;
    case "acrylicstand":
      parts.push(`${memberPart} 아크릴 스탠드 디자인`);
      break;
    case "phonecase":
      parts.push(`${memberPart} 폰케이스 디자인`);
      break;
    case "deco-photocard":
      parts.push(`${memberPart} Y2K 꾸미기 포토카드, 스티커와 젬 장식`);
      break;
    case "retro-magazine":
      parts.push(`${memberPart} 레트로 Y2K 매거진 커버`);
      break;
    case "diary-page":
      parts.push(`${memberPart} 아이돌 다이어리 꾸미기 페이지`);
      break;
    case "kitsch-collage":
      parts.push(`${memberPart} 네온 크롬 맥시멀리스트 키치 콜라주`);
      break;
    case "ticket-bookmark":
      parts.push(`${memberPart} 레트로 콘서트 티켓 & 북마크`);
      break;
    case "profile-deco":
      parts.push(`${memberPart} Y2K 키치 SNS 프로필 데코 세트`);
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
      `${m} 셀카 포즈로 그려줘`,
      `${m} 무대의상 상반신`,
      `${m} 꽃과 함께 몽환적 포트레이트`,
    ],
    photocard: [
      `${m} 셀카 포토카드`,
      `시크한 포토카드`,
      `반짝이 효과 포토카드`,
    ],
    wallpaper: [
      `${m} 몽환적 배경화면`,
      `다크 무드 배경화면`,
      `꽃밭 배경화면`,
    ],
    fanart: [
      `${m} 카페에서 팬아트`,
      `${m} 수채화 스타일 팬아트`,
      `${m} 치비 스타일 팬아트`,
    ],
    sticker: [
      `${m} 다양한 표정 스티커`,
      `귀여운 치비 스티커 세트`,
      `${m} 이모지 세트`,
    ],
    concept: [
      `${m} 앨범 컨셉 포토`,
      `시크한 다크 컨셉`,
      `청순한 화이트 컨셉`,
    ],
    edit: [
      `${m} 에디트/콜라주`,
      `무대 사진 에디트`,
      `레트로 필터 콜라주`,
    ],
    instatoon: [
      `${meta.groupName} 연습실 일상 4컷`,
      `${m} 카페 일상 인스타툰`,
      `${meta.groupName} 무대 비하인드 4컷`,
    ],
    meme: [
      `${m} 밈 만들어줘`,
      `${meta.groupName} 코믹`,
      `${m} 리액션 밈`,
    ],
    cupsleeve: [
      `${m} 생일카페 컵슬리브`,
      `꽃 테마 컵슬리브`,
      `${m} 컬러 컵슬리브`,
    ],
    slogan: [
      `${m} 콘서트 슬로건`,
      `${m}아 사랑해 배너`,
      `${meta.groupName} 화이팅 슬로건`,
    ],
    stickersheet: [
      `${m} 귀여운 스티커 시트`,
      `${m} 다양한 표정 스티커`,
      `치비 스타일 스티커`,
    ],
    "birthday-set": [
      `${m} 생일카페 풀세트`,
      `핑크 테마 생카 패키지`,
      `${m} 생일 축하 패키지`,
    ],
    acrylicstand: [
      `${m} 아크릴 스탠드`,
      `${m} 전신 아크릴`,
      `${m} 치비 아크릴`,
    ],
    phonecase: [
      `${m} 폰케이스`,
      `${meta.groupName} 로고 폰케이스`,
      `${m} 몽환적 폰케이스`,
    ],
    "deco-photocard": [
      `${m} Y2K 꾸미기 포카`,
      `반짝이 젬 스티커 포카`,
      `${m} 리본 데코 포토카드`,
    ],
    "retro-magazine": [
      `${m} 틴 매거진 커버`,
      `Y2K 매거진 표지`,
      `${m} 레트로 잡지 커버`,
    ],
    "diary-page": [
      `${m} 다꾸 페이지`,
      `${m} 다이어리 꾸미기`,
      `마스킹테이프 다꾸`,
    ],
    "kitsch-collage": [
      `${m} 네온 키치 콜라주`,
      `크롬 반짝이 콜라주`,
      `${m} 맥시멀리스트 콜라주`,
    ],
    "ticket-bookmark": [
      `${m} 레트로 콘서트 티켓`,
      `${m} 키치 북마크`,
      `빈티지 티켓 디자인`,
    ],
    "profile-deco": [
      `${m} Y2K 프로필 꾸미기`,
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
    case "photocard":
    case "concept":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "pose", label: "포즈 변경", prompt: "다른 포즈로 변경해줘" },
        { id: "outfit", label: "의상 변경", prompt: "의상을 변경해줘" },
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
    case "cupsleeve":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "theme", label: "테마 변경", prompt: "테마를 변경해줘" },
        { id: "text", label: "텍스트 편집", prompt: "카페명과 날짜를 변경해줘" },
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
    case "birthday-set":
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
    case "deco-photocard":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "sticker", label: "스티커 추가", prompt: "Y2K 스티커를 더 추가해줘" },
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
    case "diary-page":
      return [
        { id: "regen", label: "다시 생성", prompt: "다시 생성해줘" },
        { id: "tape", label: "테이프 추가", prompt: "마스킹테이프를 추가해줘" },
        { id: "deco", label: "데코 추가", prompt: "다꾸 데코 요소를 추가해줘" },
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
    case "photocard":
      return ["포토카드 생성", "반짝이 효과", "프레임 추가"];
    case "wallpaper":
      return ["배경화면 생성", "어두운 분위기", "밝은 분위기"];
    case "sticker":
      return ["스티커 생성", "다른 표정으로", "치비 스타일"];
    case "concept":
      return ["컨셉 포토 생성", "다크 컨셉", "밝은 컨셉", "스타일 변경"];
    case "fanart":
      return ["팬아트 생성", "수채화 스타일", "스타일 변경"];
    case "edit":
      return ["에디트 생성", "필터 변경", "레이아웃 변경"];
    case "instatoon":
      return ["4컷 자동 생성", "컷 추가", "배경 생성"];
    case "meme":
      return ["밈 생성", "텍스트 변경", "스타일 변경"];
    case "cupsleeve":
      return ["컵슬리브 생성", "테마 변경", "텍스트 편집"];
    case "slogan":
      return ["슬로건 생성", "문구 변경", "컬러 변경"];
    case "stickersheet":
      return ["스티커 생성", "더 추가", "배열 변경"];
    case "birthday-set":
      return ["패키지 생성", "테마 변경", "굿즈 추가"];
    case "acrylicstand":
      return ["아크릴 생성", "포즈 변경", "스타일 변경"];
    case "phonecase":
      return ["폰케이스 생성", "레이아웃 변경", "컬러 변경"];
    case "deco-photocard":
      return ["꾸미기 포카 생성", "스티커 추가", "젬 장식"];
    case "retro-magazine":
      return ["매거진 커버 생성", "헤드라인 변경", "레이아웃 변경"];
    case "diary-page":
      return ["다꾸 페이지 생성", "테이프 추가", "데코 추가"];
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
    case "photocard": return "어떤 포토카드를 만들까요?";
    case "wallpaper": return "어떤 분위기의 배경화면?";
    case "sticker": return "어떤 스티커를 만들까요?";
    case "concept": return "어떤 컨셉 포토를 찍을까요?";
    case "fanart": return "어떤 팬아트를 그릴까요?";
    case "edit": return "어떤 에디트를 만들까요?";
    case "instatoon": return "어떤 인스타툰을 만들까요?";
    case "meme": return "어떤 밈을 만들까요?";
    case "cupsleeve": return "어떤 컵슬리브를 만들까요?";
    case "slogan": return "어떤 슬로건을 만들까요?";
    case "stickersheet": return "어떤 스티커를 만들까요?";
    case "birthday-set": return "생카 패키지 테마를 정해주세요";
    case "acrylicstand": return "어떤 아크릴 스탠드를 만들까요?";
    case "phonecase": return "어떤 폰케이스를 만들까요?";
    case "deco-photocard": return "어떤 꾸미기 포카를 만들까요?";
    case "retro-magazine": return "어떤 매거진 커버를 만들까요?";
    case "diary-page": return "어떤 다꾸 페이지를 만들까요?";
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
  // Lightstick
  { id: "s-ls-1", category: "lightstick", imageUrl: "🔦", label: "응원봉" },
  { id: "s-ls-2", category: "lightstick", imageUrl: "✨", label: "반짝이" },
  { id: "s-ls-3", category: "lightstick", imageUrl: "🌟", label: "별" },
  { id: "s-ls-4", category: "lightstick", imageUrl: "💫", label: "슈팅스타" },
  { id: "s-ls-5", category: "lightstick", imageUrl: "🪄", label: "마법봉" },
  { id: "s-ls-6", category: "lightstick", imageUrl: "⭐", label: "노란 별" },
  // Emoji
  { id: "s-emo-1", category: "emoji", imageUrl: "🥰", label: "사랑 눈" },
  { id: "s-emo-2", category: "emoji", imageUrl: "😍", label: "하트 눈" },
  { id: "s-emo-3", category: "emoji", imageUrl: "🤩", label: "반짝 눈" },
  { id: "s-emo-4", category: "emoji", imageUrl: "😭", label: "감동 울음" },
  { id: "s-emo-5", category: "emoji", imageUrl: "🫶", label: "하트 손" },
  { id: "s-emo-6", category: "emoji", imageUrl: "🙌", label: "만세" },
  // Logo
  { id: "s-logo-1", category: "logo", imageUrl: "🎵", label: "음표" },
  { id: "s-logo-2", category: "logo", imageUrl: "🎶", label: "음표들" },
  { id: "s-logo-3", category: "logo", imageUrl: "🎤", label: "마이크" },
  { id: "s-logo-4", category: "logo", imageUrl: "🎧", label: "헤드폰" },
  { id: "s-logo-5", category: "logo", imageUrl: "🎸", label: "기타" },
  { id: "s-logo-6", category: "logo", imageUrl: "🥁", label: "드럼" },
  // Text
  { id: "s-txt-1", category: "text", imageUrl: "💬", label: "말풍선" },
  { id: "s-txt-2", category: "text", imageUrl: "🗯️", label: "외침" },
  { id: "s-txt-3", category: "text", imageUrl: "💭", label: "생각" },
  { id: "s-txt-4", category: "text", imageUrl: "📢", label: "확성기" },
  { id: "s-txt-5", category: "text", imageUrl: "🏷️", label: "태그" },
  { id: "s-txt-6", category: "text", imageUrl: "📝", label: "메모" },
  // Concert
  { id: "s-con-1", category: "concert", imageUrl: "🎉", label: "파티" },
  { id: "s-con-2", category: "concert", imageUrl: "🎊", label: "컨페티" },
  { id: "s-con-3", category: "concert", imageUrl: "🪩", label: "미러볼" },
  { id: "s-con-4", category: "concert", imageUrl: "🔥", label: "불꽃" },
  { id: "s-con-5", category: "concert", imageUrl: "💥", label: "폭발" },
  { id: "s-con-6", category: "concert", imageUrl: "🌈", label: "무지개" },
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
  { id: "idol-card", label: "아이돌 카드", desc: "공식 포토카드 스타일" },
  { id: "holographic", label: "홀로그래픽", desc: "반짝이는 홀로 효과" },
  { id: "vintage", label: "빈티지", desc: "레트로 빈티지 느낌" },
  { id: "neon", label: "네온", desc: "화려한 네온 테두리" },
];

// ─── Lightstick Colors ─────────────────────────────────────────────────────

export interface LightstickColor {
  groupName: string;
  color: string;
}

export const LIGHTSTICK_COLORS: LightstickColor[] = [
  { groupName: "BTS", color: "#A855F7" },
  { groupName: "BLACKPINK", color: "#EC4899" },
  { groupName: "TWICE", color: "#F97316" },
  { groupName: "aespa", color: "#6366F1" },
  { groupName: "NewJeans", color: "#3B82F6" },
  { groupName: "IVE", color: "#EF4444" },
  { groupName: "LE SSERAFIM", color: "#14B8A6" },
  { groupName: "Stray Kids", color: "#EAB308" },
  { groupName: "(G)I-DLE", color: "#8B5CF6" },
  { groupName: "SEVENTEEN", color: "#F472B6" },
];

// ─── Concert Effects ───────────────────────────────────────────────────────

export interface ConcertEffectDef {
  id: ConcertEffect;
  label: string;
  desc: string;
  prompt: string;
}

export const CONCERT_EFFECTS: ConcertEffectDef[] = [
  { id: "lightstick-glow", label: "응원봉 빛", desc: "응원봉 글로우 효과", prompt: "응원봉 빛 효과를 추가해줘" },
  { id: "spotlight", label: "무대 조명", desc: "스포트라이트 효과", prompt: "무대 스포트라이트 조명 효과를 추가해줘" },
  { id: "confetti", label: "컨페티", desc: "축하 컨페티 효과", prompt: "컨페티 효과를 추가해줘" },
  { id: "stage-smoke", label: "스모그", desc: "무대 연기 효과", prompt: "무대 스모그 효과를 추가해줘" },
  { id: "laser", label: "레이저", desc: "레이저 빔 효과", prompt: "레이저 빔 효과를 추가해줘" },
];

// ─── K-POP Aesthetic Filters ─────────────────────────────────────────────────

export interface KpopAestheticFilter {
  id: KpopAestheticFilterId;
  label: string;
  prompt: string;
  color: string;
}

export const KPOP_AESTHETIC_FILTERS: KpopAestheticFilter[] = [
  { id: "dreamy",      label: "몽환적",     prompt: "dreamy soft focus ethereal glow pastel tones", color: "#E8B4F8" },
  { id: "y2k",         label: "Y2K",        prompt: "Y2K aesthetic, chrome, bubble, sparkle, neon pink", color: "#FF69B4" },
  { id: "holographic", label: "홀로그래픽",  prompt: "holographic iridescent rainbow shimmer", color: "#87CEEB" },
  { id: "retro-film",  label: "필름 레트로", prompt: "vintage film grain, warm tones, light leak", color: "#D4A574" },
  { id: "fairy",       label: "요정 코어",   prompt: "fairy core, sparkles, butterfly, pastel bloom", color: "#FFB6C1" },
  { id: "dark-royal",  label: "다크 로열",   prompt: "dark royal, velvet, gold accents, dramatic", color: "#4A0E5C" },
  { id: "concert",     label: "콘서트",      prompt: "concert stage, dramatic lighting, lens flare", color: "#1E3A5F" },
  { id: "magazine",    label: "매거진",      prompt: "fashion magazine editorial, clean typography", color: "#2C2C2C" },
  { id: "summer-pop",  label: "썸머 팝",     prompt: "bright summer pop, vivid, tropical, cheerful", color: "#FF6347" },
  { id: "winter-soft", label: "겨울 소프트", prompt: "soft winter, snow, white tones, cozy warm", color: "#B0C4DE" },
  { id: "kitsch-y2k",     label: "키치 Y2K",     prompt: "Y2K kitsch, bubblegum pink, chrome hearts, butterfly clips, sparkle gems", color: "#FF69B4" },
  { id: "kitsch-retro",   label: "키치 레트로",   prompt: "retro kitsch, checkerboard, neon signs, vintage stickers, maximalist", color: "#FF6F61" },
  { id: "kitsch-dreampop", label: "키치 드림팝",  prompt: "dreampop kitsch, pastel rainbow, glitter, soft glow, kawaii deco", color: "#DDA0DD" },
];

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
  { groupName: "BTS",         primary: "#A855F7", secondary: "#7C3AED", accent: "#C084FC", gradient: ["#A855F7", "#7C3AED"], lightstick: "#A855F7" },
  { groupName: "BLACKPINK",   primary: "#EC4899", secondary: "#DB2777", accent: "#F472B6", gradient: ["#EC4899", "#DB2777"], lightstick: "#EC4899" },
  { groupName: "TWICE",       primary: "#F97316", secondary: "#EA580C", accent: "#FB923C", gradient: ["#F97316", "#FBBF24"], lightstick: "#F97316" },
  { groupName: "aespa",       primary: "#6366F1", secondary: "#4F46E5", accent: "#818CF8", gradient: ["#6366F1", "#A855F7"], lightstick: "#6366F1" },
  { groupName: "NewJeans",    primary: "#3B82F6", secondary: "#2563EB", accent: "#60A5FA", gradient: ["#3B82F6", "#06B6D4"], lightstick: "#3B82F6" },
  { groupName: "IVE",         primary: "#EF4444", secondary: "#DC2626", accent: "#F87171", gradient: ["#EF4444", "#F97316"], lightstick: "#EF4444" },
  { groupName: "LE SSERAFIM", primary: "#14B8A6", secondary: "#0D9488", accent: "#2DD4BF", gradient: ["#14B8A6", "#06B6D4"], lightstick: "#14B8A6" },
  { groupName: "Stray Kids",  primary: "#EAB308", secondary: "#CA8A04", accent: "#FACC15", gradient: ["#EAB308", "#F97316"], lightstick: "#EAB308" },
  { groupName: "(G)I-DLE",    primary: "#8B5CF6", secondary: "#7C3AED", accent: "#A78BFA", gradient: ["#8B5CF6", "#EC4899"], lightstick: "#8B5CF6" },
  { groupName: "SEVENTEEN",   primary: "#F472B6", secondary: "#EC4899", accent: "#F9A8D4", gradient: ["#F472B6", "#A855F7"], lightstick: "#F472B6" },
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
  { id: "lightstick-sea", label: "응원봉 바다", category: "overlay", prompt: "sea of concert lightsticks glowing background" },
  { id: "confetti-overlay", label: "컨페티", category: "overlay", prompt: "colorful confetti falling overlay" },
  { id: "lens-flare", label: "렌즈 플레어", category: "overlay", prompt: "anamorphic lens flare light" },
  // Patterns
  { id: "heart-pattern", label: "하트 패턴", category: "pattern", prompt: "repeating heart pattern background" },
  { id: "star-pattern", label: "별 패턴", category: "pattern", prompt: "repeating star pattern background" },
  { id: "lightstick-pattern", label: "응원봉 패턴", category: "pattern", prompt: "repeating lightstick icon pattern" },
  // Deco
  { id: "butterfly", label: "나비", category: "deco", prompt: "decorative butterflies scattered" },
  { id: "flower-frame", label: "꽃 프레임", category: "deco", prompt: "floral frame border decoration" },
  { id: "ribbon", label: "리본 장식", category: "deco", prompt: "cute ribbon bow decoration" },
  // Kitsch deco
  { id: "y2k-sticker", label: "Y2K 스티커", category: "deco", prompt: "Y2K style decorative stickers, chrome hearts, stars, butterflies" },
  { id: "chrome-text", label: "크롬 텍스트", category: "deco", prompt: "chrome metallic 3D text effect" },
  { id: "masking-tape", label: "마스킹테이프", category: "deco", prompt: "colorful washi masking tape strips decoration" },
  { id: "checkerboard", label: "체커보드", category: "pattern", prompt: "retro checkerboard pattern, pink and white" },
  { id: "gem-sticker", label: "젬 스티커", category: "deco", prompt: "sparkly gem rhinestone sticker decorations" },
  { id: "neon-frame", label: "네온 프레임", category: "overlay", prompt: "glowing neon frame border, pink and blue" },
];

// ─── K-POP Text Presets ──────────────────────────────────────────────────────

export interface KpopTextPreset {
  id: string;
  text: string;
  category: "cheer" | "birthday" | "love" | "general";
  lang: "ko" | "en";
}

export const KPOP_TEXT_PRESETS: KpopTextPreset[] = [
  { id: "t1",  text: "사랑해요",          category: "love",     lang: "ko" },
  { id: "t2",  text: "영원히 함께",        category: "love",     lang: "ko" },
  { id: "t3",  text: "최고의 아이돌",      category: "cheer",    lang: "ko" },
  { id: "t4",  text: "화이팅!",           category: "cheer",    lang: "ko" },
  { id: "t5",  text: "생일 축하해!",       category: "birthday", lang: "ko" },
  { id: "t6",  text: "태어나줘서 고마워",   category: "birthday", lang: "ko" },
  { id: "t7",  text: "오늘도 빛나는 너",    category: "general",  lang: "ko" },
  { id: "t8",  text: "Forever Young",     category: "general",  lang: "en" },
  { id: "t9",  text: "My Universe",       category: "love",     lang: "en" },
  { id: "t10", text: "Happy Birthday!",   category: "birthday", lang: "en" },
  { id: "t11", text: "You Are My Star",   category: "love",     lang: "en" },
  { id: "t12", text: "Shine On!",         category: "cheer",    lang: "en" },
  // Kitsch text presets
  { id: "t13", text: "My Star",           category: "love",     lang: "en" },
  { id: "t14", text: "XOXO",              category: "love",     lang: "en" },
  { id: "t15", text: "Dream On",          category: "general",  lang: "en" },
  { id: "t16", text: "너만 볼 거야",       category: "love",     lang: "ko" },
  { id: "t17", text: "덕질은 나의 힘",     category: "cheer",    lang: "ko" },
];
