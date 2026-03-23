import { Sparkles, Image, Palette, FileText } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BrandAsset {
  id: string;
  name: string;
  type: "mascot" | "logo" | "color" | "document";
  status: "approved" | "review" | "draft";
  version: string;
  downloads: number;
  updatedAt: string;
  imageUrl?: string;
  colors?: string[];
  fileSize?: string;
  description?: string;
  tags?: string[];
}

export type AssetTab = "all" | "mascot" | "logo" | "color" | "document";

// ─── Config ──────────────────────────────────────────────────────────────────

export const ASSET_TYPE_CONFIG = {
  mascot: {
    label: "마스코트",
    icon: Sparkles,
    gradient: "from-purple-500/10 to-violet-500/5",
    accent: "purple",
    accentColor: "#a855f7",
  },
  logo: {
    label: "로고",
    icon: Image,
    gradient: "from-amber-500/10 to-orange-500/5",
    accent: "amber",
    accentColor: "#f59e0b",
  },
  color: {
    label: "컬러",
    icon: Palette,
    gradient: "from-pink-500/10 to-rose-500/5",
    accent: "pink",
    accentColor: "#ec4899",
  },
  document: {
    label: "문서",
    icon: FileText,
    gradient: "from-blue-500/10 to-cyan-500/5",
    accent: "blue",
    accentColor: "#3b82f6",
  },
} as const;

export const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  approved: { label: "승인", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  review: { label: "검토중", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  draft: { label: "초안", cls: "bg-white/[0.06] text-white/40 border-white/[0.06]" },
};

export const PRESET_PALETTES = [
  { name: "코럴 & 네이비", colors: ["#FF6B6B", "#EE5A24", "#2C3E50", "#34495E", "#ECF0F1"] },
  { name: "민트 & 골드", colors: ["#00e5cc", "#00b4d8", "#FFD700", "#1a1a2e", "#F5F5F5"] },
  { name: "파스텔 드림", colors: ["#FFB5E8", "#B5DEFF", "#E8FFB5", "#FFE5B5", "#E8B5FF"] },
  { name: "다크 모던", colors: ["#0D0D0D", "#1A1A2E", "#16213E", "#E94560", "#FFFFFF"] },
  { name: "자연 그린", colors: ["#2D5016", "#4A7C23", "#8BC34A", "#F1F8E9", "#33691E"] },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const today = () => new Date().toISOString().split("T")[0];
