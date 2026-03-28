import { useState, useEffect, useMemo } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { FandomFilterBar } from "@/components/fandom/fandom-filter-bar";
import { GoodsTradeCard } from "@/components/fandom/goods-trade-card";
import { ShoppingBag, Tag, ArrowRightLeft, Gift } from "lucide-react";
import {
  listItems,
  STORE_KEYS,
  type GoodsTrade,
  type KboTeam,
} from "@/lib/local-store";

// ─── Trade type tabs ────────────────────────────────────────────────────────
type TradeTab = "all" | "sell" | "trade" | "giveaway";

const TRADE_TABS: { id: TradeTab; label: string }[] = [
  { id: "all", label: "\uC804\uCCB4" },
  { id: "sell", label: "\uD310\uB9E4" },
  { id: "trade", label: "\uAD50\uD658" },
  { id: "giveaway", label: "\uB098\uB214" },
];

// ─── Category filter pills ──────────────────────────────────────────────────
type CategoryFilter = "all" | GoodsTrade["category"];

const CATEGORY_PILLS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "\uC804\uCCB4" },
  { id: "uniform", label: "\uC720\uB2C8\uD3FC" },
  { id: "cap", label: "\uBAA8\uC790" },
  { id: "towel", label: "\uD0C0\uC62C" },
  { id: "keyring", label: "\uD0A4\uB9C1" },
  { id: "photocard", label: "\uD3EC\uD1A0\uCE74\uB4DC" },
  { id: "other", label: "\uAE30\uD0C0" },
];

export function FandomGoodsTrades() {
  const [trades, setTrades] = useState<GoodsTrade[]>([]);
  const [teams, setTeams] = useState<KboTeam[]>([]);
  const [tab, setTab] = useState<TradeTab>("all");
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  useEffect(() => {
    setTrades(listItems<GoodsTrade>(STORE_KEYS.GOODS_TRADES));
    setTeams(listItems<KboTeam>(STORE_KEYS.KBO_TEAMS));
  }, []);

  // Build team color lookup
  const teamColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of teams) {
      map.set(t.id, t.coverColor);
    }
    return map;
  }, [teams]);

  // Filtered + sorted trades
  const filtered = useMemo(() => {
    return trades
      .filter((t) => {
        if (tab !== "all" && t.tradeType !== tab) return false;
        if (teamFilter && t.teamId !== teamFilter) return false;
        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [trades, tab, teamFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const active = trades.filter((t) => t.status === "active");
    return {
      total: trades.length,
      sells: active.filter((t) => t.tradeType === "sell").length,
      tradeCount: active.filter((t) => t.tradeType === "trade").length,
      giveaways: active.filter((t) => t.tradeType === "giveaway").length,
    };
  }, [trades]);

  return (
    <StudioLayout>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            굿즈 교환
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            팬 굿즈를 사고팔고 교환하세요. 나눔도 환영!
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground bg-muted/30 rounded-xl px-4 py-3 border border-border">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>전체 <span className="text-foreground font-bold">{stats.total}</span>건</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-green-400" />
            <span>판매 <span className="text-foreground font-bold">{stats.sells}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>교환 <span className="text-foreground font-bold">{stats.tradeCount}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-rose-400" />
            <span>나눔 <span className="text-foreground font-bold">{stats.giveaways}</span></span>
          </div>
        </div>

        {/* Team Filter */}
        <FandomFilterBar selected={teamFilter} onChange={setTeamFilter} />

        {/* Trade type tab pills */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-1 scrollbar-hide">
          {TRADE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 max-w-full overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_PILLS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                categoryFilter === c.id
                  ? "bg-foreground/10 text-foreground border border-foreground/20"
                  : "bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              등록된 굿즈가 없습니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((trade) => (
              <GoodsTradeCard
                key={trade.id}
                trade={trade}
                teamColor={teamColorMap.get(trade.teamId)}
              />
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
