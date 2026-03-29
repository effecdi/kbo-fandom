import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import { StudioLayout } from "@/components/StudioLayout";
import { FandomFilterBar } from "@/components/fandom/fandom-filter-bar";
import { PhotocardItemCard } from "@/components/fandom/photocard-item";
import { Camera, Image, ArrowRightLeft, Heart } from "lucide-react";
import {
  listItems,
  updateItem,
  STORE_KEYS,
  getFandomProfile,
  setFandomProfile,
  type PhotocardItem,
  type KboTeam,
} from "@/lib/local-store";
import { useToast } from "@/hooks/use-toast";

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
  const [profileCardId, setProfileCardId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCards(listItems<PhotocardItem>(STORE_KEYS.PHOTOCARD_COLLECTION));
    setTeams(listItems<KboTeam>(STORE_KEYS.KBO_TEAMS));
    // Check which card is currently set as profile card
    const profile = getFandomProfile();
    if (profile?.lanyardCardUrl) {
      const allCards = listItems<PhotocardItem>(STORE_KEYS.PHOTOCARD_COLLECTION);
      const match = allCards.find((c) => c.imageUrl === profile.lanyardCardUrl);
      if (match) setProfileCardId(match.id);
    }
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

  // Set photocard as profile lanyard card
  const handleSetProfile = useCallback(
    (card: PhotocardItem) => {
      const profile = getFandomProfile();
      if (!profile) return;
      if (!card.imageUrl) {
        toast({
          title: "설정 불가",
          description: "직접 만든 포토카드만 프로필카드로 설정할 수 있습니다.",
        });
        return;
      }
      setFandomProfile({
        ...profile,
        lanyardCardUrl: card.imageUrl,
        favoritePlayer: card.playerName || profile.favoritePlayer,
      });
      setProfileCardId(card.id);
      toast({
        title: "프로필카드 설정 완료",
        description: `${card.title}이(가) 목걸이 카드로 설정되었습니다. 홈에서 확인하세요!`,
      });
    },
    [toast],
  );

  // Download photocard image
  const handleDownload = useCallback(
    (card: PhotocardItem) => {
      if (!card.imageUrl) return;
      const a = document.createElement("a");
      a.href = card.imageUrl;
      a.download = `${card.title || "photocard"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast({ title: "다운로드 완료", description: `${card.title} 이미지를 저장했습니다.` });
    },
    [toast],
  );

  // Share photocard
  const handleShare = useCallback(
    async (card: PhotocardItem) => {
      if (!card.imageUrl) return;
      try {
        // Try Web Share API with image
        if (navigator.share) {
          const blob = await fetch(card.imageUrl).then((r) => r.blob());
          const file = new File([blob], `${card.title || "photocard"}.png`, { type: blob.type });
          await navigator.share({ title: card.title, files: [file] });
          return;
        }
      } catch {
        // fallback
      }
      // Fallback: copy image URL to clipboard
      try {
        await navigator.clipboard.writeText(card.imageUrl);
        toast({ title: "링크 복사됨", description: "클립보드에 이미지 링크가 복사되었습니다." });
      } catch {
        toast({ title: "공유 실패", description: "이 브라우저에서는 공유를 지원하지 않습니다." });
      }
    },
    [toast],
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
      <div className="space-y-6 max-w-full">
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 bg-muted/30 rounded-xl border border-border">
          <div className="flex items-center gap-1.5 text-[13px]">
            <Image className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">전체</span>
            <span className="font-bold text-foreground">{stats.total}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-[13px]">
            <Heart className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">내 카드</span>
            <span className="font-bold text-foreground">{stats.mine}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-[13px]">
            <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">거래중</span>
            <span className="font-bold text-foreground">{stats.trading}</span>
          </div>
        </div>

        {/* Main Tab Pills */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-1 scrollbar-hide">
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
        <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-1 scrollbar-hide">
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
          <PhotocardGrid>
            {filtered.map((card) => (
              <PhotocardItemCard
                key={card.id}
                card={card}
                teamColor={teamColorMap.get(card.teamId) || "#666"}
                onLike={handleLike}
                onSetProfile={handleSetProfile}
                onShare={handleShare}
                onDownload={handleDownload}
                isProfileCard={profileCardId === card.id}
              />
            ))}
          </PhotocardGrid>
        )}
      </div>
    </StudioLayout>
  );
}

/** Animated grid — stagger-reveals cards on scroll */
function PhotocardGrid({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(":scope > *");
    if (cards.length === 0) return;

    gsap.set(cards, { opacity: 0, y: 24, scale: 0.96 });
    const tween = gsap.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.06,
      ease: "power3.out",
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top 90%",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [children]);

  return (
    <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {children}
    </div>
  );
}
