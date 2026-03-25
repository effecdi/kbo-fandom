import type {
  FandomTemplateType,
  FandomStylePreset,
  FandomEditorMeta,
  CanvasAspectRatio,
  FandomStickerCategory,
  FandomSticker,
  PhotocardFrame,
  ConcertEffect,
} from "./workspace-types";

// ─── Template Definitions ────────────────────────────────────────────────────

export interface FandomTemplate {
  id: string;
  type: FandomTemplateType;
  label: string;
  desc: string;
  panels: number;
  aspect: CanvasAspectRatio;
  category: "popular" | "photo" | "art" | "comic";
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
];

export const TEMPLATE_CATEGORIES = [
  { id: "popular", label: "인기" },
  { id: "photo", label: "포토" },
  { id: "art", label: "아트" },
  { id: "comic", label: "코믹" },
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
};

// ─── Single Image Templates (skip breakdown, go straight to generate) ────────

const SINGLE_IMAGE_TYPES: FandomTemplateType[] = [
  "portrait", "photocard", "wallpaper", "fanart", "sticker", "concept", "edit",
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
      parts.push(`${memberPart} 밈/코믹`);
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
