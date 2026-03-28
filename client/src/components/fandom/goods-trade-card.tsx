import { Heart, Tag, ArrowRightLeft, Gift } from "lucide-react";
import type { GoodsTrade } from "@/lib/local-store";

// ─── Category emoji map ────────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<GoodsTrade["category"], string> = {
  uniform: "\uD83D\uDC55",
  cap: "\uD83E\uDDE2",
  towel: "\uD83E\uDDE3",
  keyring: "\uD83D\uDD11",
  photocard: "\uD83C\uDCCF",
  other: "\uD83D\uDCE6",
};

const CATEGORY_LABELS: Record<GoodsTrade["category"], string> = {
  uniform: "\uC720\uB2C8\uD3FC",
  cap: "\uBAA8\uC790",
  towel: "\uD0C0\uC62C",
  keyring: "\uD0A4\uB9C1",
  photocard: "\uD3EC\uD1A0\uCE74\uB4DC",
  other: "\uAE30\uD0C0",
};

// ─── Condition labels ──────────────────────────────────────────────────────
const CONDITION_CONFIG: Record<GoodsTrade["condition"], { label: string; color: string }> = {
  new: { label: "\uC0C8\uC0C1\uD488", color: "bg-emerald-500/15 text-emerald-400" },
  likeNew: { label: "\uAC70\uC758\uC0C8\uAC83", color: "bg-teal-500/15 text-teal-400" },
  good: { label: "\uC591\uD638", color: "bg-blue-500/15 text-blue-400" },
  fair: { label: "\uC0AC\uC6A9\uAC10\uC788\uC74C", color: "bg-amber-500/15 text-amber-400" },
};

// ─── Trade type config ─────────────────────────────────────────────────────
const TRADE_TYPE_CONFIG: Record<GoodsTrade["tradeType"], { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  sell: { label: "\uD310\uB9E4", color: "bg-green-500/15 text-green-400", icon: Tag },
  trade: { label: "\uAD50\uD658", color: "bg-blue-500/15 text-blue-400", icon: ArrowRightLeft },
  giveaway: { label: "\uB098\uB214", color: "bg-rose-500/15 text-rose-400", icon: Gift },
};

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  reserved: { label: "\uC608\uC57D\uC911", color: "bg-amber-500/15 text-amber-400" },
  completed: { label: "\uAC70\uB798\uC644\uB8CC", color: "bg-gray-500/15 text-gray-400" },
};

interface GoodsTradeCardProps {
  trade: GoodsTrade;
  teamColor?: string;
}

export function GoodsTradeCard({ trade, teamColor }: GoodsTradeCardProps) {
  const tradeType = TRADE_TYPE_CONFIG[trade.tradeType];
  const condition = CONDITION_CONFIG[trade.condition];
  const TradeIcon = tradeType.icon;

  return (
    <div
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/15 transition-all hover:shadow-lg"
      style={{ borderTopWidth: "2px", borderTopColor: teamColor || "var(--border)" }}
    >
      {/* Image placeholder area */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">{CATEGORY_EMOJI[trade.category]}</span>
          <span className="text-[13px] text-muted-foreground/60 font-medium">
            {CATEGORY_LABELS[trade.category]}
          </span>
        </div>

        {/* Status overlay if reserved/completed */}
        {trade.status !== "active" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${STATUS_CONFIG[trade.status].color}`}>
              {STATUS_CONFIG[trade.status].label}
            </span>
          </div>
        )}

        {/* Trade type badge (top-left) */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[13px] font-bold ${tradeType.color}`}>
            <TradeIcon className="w-3 h-3" />
            {tradeType.label}
          </span>
        </div>

        {/* Condition badge (top-right) */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-[13px] font-bold ${condition.color}`}>
            {condition.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        {/* Item name */}
        <h3 className="text-sm font-bold text-foreground group-hover:text-[var(--fandom-primary)] transition-colors truncate">
          {trade.itemName}
        </h3>

        {/* Price / Wanted / Giveaway info */}
        <div className="text-[13px]">
          {trade.tradeType === "sell" && trade.price != null && (
            <span className="text-green-400 font-bold text-sm">
              {trade.price.toLocaleString()}\uC6D0
            </span>
          )}
          {trade.tradeType === "trade" && trade.wantedItem && (
            <div className="flex items-center gap-1 text-blue-400">
              <ArrowRightLeft className="w-3 h-3" />
              <span className="font-medium truncate">\uD76C\uB9DD: {trade.wantedItem}</span>
            </div>
          )}
          {trade.tradeType === "giveaway" && (
            <div className="flex items-center gap-1 text-rose-400">
              <Gift className="w-3 h-3" />
              <span className="font-medium">\uBB34\uB8CC \uB098\uB214</span>
            </div>
          )}
        </div>

        {/* Description (2-line clamp) */}
        <p className="text-[13px] text-muted-foreground line-clamp-2">
          {trade.description}
        </p>

        {/* Seller info */}
        <div className="flex items-center gap-2 pt-1">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[13px]"
            style={{ backgroundColor: teamColor || "#666" }}
          >
            {trade.sellerAvatar}
          </div>
          <span className="text-[13px] text-muted-foreground">{trade.sellerName}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[13px] font-medium bg-muted text-muted-foreground">
            {trade.teamName}
          </span>
        </div>

        {/* Bottom: Likes + Date */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <Heart className="w-3.5 h-3.5" />
            <span>{trade.likes}</span>
          </div>
          <span className="text-[13px] text-muted-foreground/50">
            {trade.createdAt}
          </span>
        </div>
      </div>
    </div>
  );
}
