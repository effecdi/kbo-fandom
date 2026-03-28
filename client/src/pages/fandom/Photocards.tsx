import { useState, useEffect, useMemo, useCallback } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { FandomFilterBar } from "@/components/fandom/fandom-filter-bar";
import { PhotocardItemCard } from "@/components/fandom/photocard-item";
import { Camera, Image, ArrowRightLeft, Heart } from "lucide-react";
import {
  listItems,
  updateItem,
  STORE_KEYS,
  getFandomProfile,
  type PhotocardItem,
  type KboTeam,
} from "@/lib/local-store";

type MainTab = "gallery" | "mine" | "trading";
type RarityFilter = "all" | "common" | "rare" | "epic" | "legendary";

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: "gallery", label: "전체 갤러리" },
  { id: "mine", label: "내 컬렉션" },
  { id: "trading", label: "트레이딩" },
];

const RARITY_TABS: { id: RarityFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "common", label: "Common" },
  { id: "rare", label: "Rare" },
  { id: "epic", label: "Epic" },
  { id: "legendary", label: "Legendary" },
];

export function FandomPhotocards() {
  const [cards, setCards] = useState<PhotocardItem[]>([]);
  const [teams, setTeams] = useState<KboTeam[]>([]);
  const [tab, setTab] = useState<MainTab>("gallery");
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");

  useEffect(() => {
    setCards(listItems<PhotocardItem>(STORE_KEYS.PHOTOCARD_COLLECTION));
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

  // Stats
  const stats = useMemo(() => {
    const total = cards.length;
    const mine = cards.filter((c) => c.ownerId === "me").length;
    const trading = cards.filter((c) => c.isForTrade).length;
    return { total, mine, trading };
  }, [cards]);

  // Filtered cards
  const filtered = useMemo(() => {
    return cards
      .filter((c) => {
        // Main tab filter
        if (tab === "mine" && c.ownerId !== "me") return false;
        if (tab === "trading" && !c.isForTrade) return false;
        // Team filter
        if (teamFilter && c.teamId !== teamFilter) return false;
        // Rarity filter
        if (rarityFilter !== "all" && c.rarity !== rarityFilter) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [cards, tab, teamFilter, rarityFilter]);

  // Like toggle handler
  const handleLike = useCallback(
    (id: string) => {
      setCards((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const newLiked = !c.liked;
          const newLikes = newLiked ? c.likes + 1 : Math.max(0, c.likes - 1);
          // Persist to localStorage
          updateItem<PhotocardItem>(STORE_KEYS.PHOTOCARD_COLLECTION, id, {
            liked: newLiked,
            likes: newLikes,
          });
          return { ...c, liked: newLiked, likes: newLikes };
        }),
      );
    },
    [],
  );

  // Empty state message per tab
  const emptyMessage = useMemo(() => {
    switch (tab) {
      case "gallery":
        return "아직 등록된 포토카드가 없습니다";
      case "mine":
        return "내 컬렉션이 비어있습니다. 포토카드를 모아보세요!";
      case "trading":
        return "현재 거래 가능한 포토카드가 없습니다";
    }
  }, [tab]);

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-6 h-6" />
            포토카드 컬렉션
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            선수 포토카드를 수집하고 트레이딩하세요
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl border border-border">
          <div className="flex items-center gap-1.5 text-[13px]">
            <Image className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">전체</span>
            <span className="font-bold text-foreground">{stats.total}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-[13px]">
            <Heart className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">내 카드</span>
            <span className="font-bold text-foreground">{stats.mine}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-[13px]">
            <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">거래중</span>
            <span className="font-bold text-foreground">{stats.trading}</span>
          </div>
        </div>

        {/* Main Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {MAIN_TABS.map((t) => (
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

        {/* Team Filter */}
        <FandomFilterBar selected={teamFilter} onChange={setTeamFilter} />

        {/* Rarity Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {RARITY_TABS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRarityFilter(r.id)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                rarityFilter === r.id
                  ? "bg-foreground text-background"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((card) => (
              <PhotocardItemCard
                key={card.id}
                card={card}
                teamColor={teamColorMap.get(card.teamId) || "#666"}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
