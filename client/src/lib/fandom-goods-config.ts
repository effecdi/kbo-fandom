// ─── K-POP Goods Physical Size & Print Config ─────────────────────────────────

export const PHYSICAL_SIZES = {
  photocard:      { widthMm: 55,  heightMm: 85,  label: "포토카드 (55×85mm)" },
  photocardMini:  { widthMm: 50,  heightMm: 70,  label: "미니 포카 (50×70mm)" },
  cupsleeve:      { widthMm: 210, heightMm: 297, label: "컵슬리브 (A4 전개도)" },
  slogan20x60:    { widthMm: 200, heightMm: 600, label: "슬로건 (20×60cm)" },
  slogan30x80:    { widthMm: 300, heightMm: 800, label: "슬로건 (30×80cm)" },
  stickerA5:      { widthMm: 148, heightMm: 210, label: "스티커시트 (A5)" },
  stickerA6:      { widthMm: 105, heightMm: 148, label: "스티커시트 (A6)" },
  acrylicStandS:  { widthMm: 60,  heightMm: 80,  label: "아크릴 스탠드 S" },
  acrylicStandM:  { widthMm: 80,  heightMm: 120, label: "아크릴 스탠드 M" },
  acrylicKeyring: { widthMm: 50,  heightMm: 50,  label: "아크릴 키링" },
  phonecase:      { widthMm: 75,  heightMm: 150, label: "폰케이스" },
  posterA3:       { widthMm: 297, heightMm: 420, label: "포스터 A3" },
  posterA4:       { widthMm: 210, heightMm: 297, label: "포스터 A4" },
  bookmark:       { widthMm: 50,  heightMm: 150, label: "북마크 (50×150mm)" },
  ticketSmall:    { widthMm: 55,  heightMm: 85,  label: "티켓 S (55×85mm)" },
  ticketLarge:    { widthMm: 80,  heightMm: 180, label: "티켓 L (80×180mm)" },
} as const;

export type PhysicalSizeKey = keyof typeof PHYSICAL_SIZES;

// ─── DPI → pixel conversion ────────────────────────────────────────────────────

export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export function getCanvasPixelsForPrint(sizeKey: PhysicalSizeKey, dpi: number) {
  const size = PHYSICAL_SIZES[sizeKey];
  return {
    width: mmToPx(size.widthMm, dpi),
    height: mmToPx(size.heightMm, dpi),
  };
}

// ─── Cup Sleeve Specs ──────────────────────────────────────────────────────────

export const CUP_SLEEVE_SPECS = {
  "12oz": { topCircumferenceMm: 250, bottomCircumferenceMm: 200, heightMm: 120, label: "12oz (톨)" },
  "16oz": { topCircumferenceMm: 270, bottomCircumferenceMm: 220, heightMm: 130, label: "16oz (그란데)" },
  "20oz": { topCircumferenceMm: 290, bottomCircumferenceMm: 240, heightMm: 140, label: "20oz (벤티)" },
} as const;

export type CupSleeveSize = keyof typeof CUP_SLEEVE_SPECS;

// ─── Default Print Settings ────────────────────────────────────────────────────

export const DEFAULT_PRINT_DPI = 300;
export const DEFAULT_BLEED_MM = 3;

// ─── Sticker Grid Presets ──────────────────────────────────────────────────────

export const STICKER_GRID_PRESETS = [
  { id: "3x4", cols: 3, rows: 4, label: "3×4 (12개)" },
  { id: "4x5", cols: 4, rows: 5, label: "4×5 (20개)" },
  { id: "free", cols: 0, rows: 0, label: "자유 배치" },
] as const;

export const STICKER_SIZE_PRESETS = [
  { id: "3cm", sizeMm: 30, label: "3cm" },
  { id: "5cm", sizeMm: 50, label: "5cm" },
  { id: "7cm", sizeMm: 70, label: "7cm" },
] as const;

// ─── Goods Template → Physical Size mapping ────────────────────────────────────

export const GOODS_PHYSICAL_SIZE_MAP: Record<string, PhysicalSizeKey[]> = {
  photocard: ["photocard", "photocardMini"],
  cupsleeve: ["cupsleeve"],
  slogan: ["slogan20x60", "slogan30x80"],
  stickersheet: ["stickerA5", "stickerA6"],
  acrylicstand: ["acrylicStandS", "acrylicStandM", "acrylicKeyring"],
  phonecase: ["phonecase"],
  "birthday-set": ["posterA4", "cupsleeve", "photocard", "stickerA5"],
  "ticket-bookmark": ["ticketSmall", "ticketLarge", "bookmark"],
};

// ─── Slogan Text Templates ────────────────────────────────────────────────────

export const SLOGAN_TEXT_TEMPLATES = [
  { id: "love", template: "{name}아 사랑해", label: "사랑해" },
  { id: "forever", template: "Forever with {name}", label: "Forever" },
  { id: "best", template: "{group} 최고!", label: "최고" },
  { id: "fighting", template: "{name} 화이팅!", label: "화이팅" },
  { id: "hbd", template: "HBD {name}", label: "HBD" },
  { id: "anniversary", template: "{group} {years}주년 축하해", label: "기념일" },
  { id: "mystar", template: "나의 별 {name}", label: "나의 별" },
  { id: "shine", template: "{name} Shine On!", label: "Shine On" },
] as const;

// ─── Birthday Cafe Package Types ───────────────────────────────────────────────

export const BIRTHDAY_GOODS_OPTIONS = [
  { id: "cupsleeve", label: "컵슬리브", icon: "coffee" },
  { id: "banner", label: "배너", icon: "flag" },
  { id: "poster", label: "포스터", icon: "image" },
  { id: "standee", label: "스탠디", icon: "user" },
  { id: "photocard", label: "포카세트", icon: "camera" },
  { id: "sticker", label: "스티커", icon: "sticker" },
] as const;

export type BirthdayGoodsType = (typeof BIRTHDAY_GOODS_OPTIONS)[number]["id"];

// ─── Goods Type Check Helper ───────────────────────────────────────────────────

const GOODS_TEMPLATE_TYPES = ["cupsleeve", "slogan", "stickersheet", "birthday-set", "acrylicstand", "phonecase", "ticket-bookmark"] as const;

export function isGoodsTemplate(type: string): boolean {
  return (GOODS_TEMPLATE_TYPES as readonly string[]).includes(type);
}

// ─── Kitsch Template Check Helper ─────────────────────────────────────────────

const KITSCH_TEMPLATE_TYPES = [
  "deco-photocard", "retro-magazine", "diary-page",
  "kitsch-collage", "ticket-bookmark", "profile-deco",
] as const;

export function isKitschTemplate(type: string): boolean {
  return (KITSCH_TEMPLATE_TYPES as readonly string[]).includes(type);
}
