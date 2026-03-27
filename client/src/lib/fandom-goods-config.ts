// ─── KBO Goods Physical Size & Print Config ─────────────────────────────────

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
  playercard: ["photocard", "photocardMini"],
  cheerbanner: ["posterA4", "slogan20x60"],
  slogan: ["slogan20x60", "slogan30x80"],
  stickersheet: ["stickerA5", "stickerA6"],
  acrylicstand: ["acrylicStandS", "acrylicStandM", "acrylicKeyring"],
  phonecase: ["phonecase"],
  "stadium-set": ["posterA4", "slogan20x60", "photocard", "stickerA5"],
  "ticket-bookmark": ["ticketSmall", "ticketLarge", "bookmark"],
  // backward compat
  photocard: ["photocard", "photocardMini"],
  cupsleeve: ["cupsleeve"],
  "birthday-set": ["posterA4", "cupsleeve", "photocard", "stickerA5"],
};

// ─── Slogan Text Templates ────────────────────────────────────────────────────

export const SLOGAN_TEXT_TEMPLATES = [
  { id: "fighting", template: "{name} 화이팅!", label: "화이팅" },
  { id: "homerun", template: "{name} 홈런 치자!", label: "홈런" },
  { id: "best", template: "{group} 최고!", label: "최고" },
  { id: "victory", template: "{group} 우승하자!", label: "우승" },
  { id: "mvp", template: "{name} MVP!", label: "MVP" },
  { id: "cheer", template: "{name} 잘한다!", label: "잘한다" },
  { id: "playball", template: "Play Ball! {group}", label: "Play Ball" },
  { id: "go", template: "Go! {name}!", label: "Go!" },
] as const;

// ─── Stadium Goods Package Types ──────────────────────────────────────────────

export const STADIUM_GOODS_OPTIONS = [
  { id: "cheerbanner", label: "응원 배너", icon: "flag" },
  { id: "banner", label: "배너", icon: "flag" },
  { id: "poster", label: "포스터", icon: "image" },
  { id: "standee", label: "스탠디", icon: "user" },
  { id: "playercard", label: "선수카드", icon: "camera" },
  { id: "sticker", label: "스티커", icon: "sticker" },
] as const;

// backward compat alias
export const BIRTHDAY_GOODS_OPTIONS = STADIUM_GOODS_OPTIONS;

export type StadiumGoodsType = (typeof STADIUM_GOODS_OPTIONS)[number]["id"];
export type BirthdayGoodsType = StadiumGoodsType;

// ─── Goods Type Check Helper ───────────────────────────────────────────────────

const GOODS_TEMPLATE_TYPES = ["cheerbanner", "slogan", "stickersheet", "stadium-set", "acrylicstand", "phonecase", "ticket-bookmark", "cupsleeve", "birthday-set"] as const;

export function isGoodsTemplate(type: string): boolean {
  return (GOODS_TEMPLATE_TYPES as readonly string[]).includes(type);
}

// ─── Kitsch Template Check Helper ─────────────────────────────────────────────

const KITSCH_TEMPLATE_TYPES = [
  "deco-playercard", "retro-magazine", "scorebook-page",
  "kitsch-collage", "ticket-bookmark", "profile-deco",
  "deco-photocard", "diary-page",
] as const;

export function isKitschTemplate(type: string): boolean {
  return (KITSCH_TEMPLATE_TYPES as readonly string[]).includes(type);
}
