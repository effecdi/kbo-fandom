import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import {
  Users, Search, Crown, Star, TrendingUp, Sparkles, Heart,
  Image, ThumbsUp, MessageCircle, Send, Filter,
} from "lucide-react";
import {
  listItems, seedIfEmpty, STORE_KEYS, getFandomProfile, generateId, addItem,
  type FanCreator, type FanFollow, type IdolGroup,
} from "@/lib/local-store";

type SortKey = "followers" | "fanart" | "likes" | "recent";

const BADGE_LABELS: Record<string, { label: string; color: string; icon: typeof Crown }> = {
  top: { label: "TOP", color: "#F59E0B", icon: Crown },
  popular: { label: "인기", color: "#EC4899", icon: Star },
  rising: { label: "성장중", color: "#10B981", icon: TrendingUp },
  rookie: { label: "신규", color: "#3B82F6", icon: Sparkles },
};

export function FanCreators() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<FanCreator[]>([]);
  const [follows, setFollows] = useState<FanFollow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("followers");

  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  useEffect(() => {
    seedIfEmpty();
    setCreators(listItems<FanCreator>(STORE_KEYS.FAN_CREATORS));
    setFollows(listItems<FanFollow>(STORE_KEYS.FAN_FOLLOWS));
  }, []);

  const groups = listItems<IdolGroup>(STORE_KEYS.IDOL_GROUPS);

  const isFollowing = (creatorId: string) =>
    follows.some((f) => f.followerId === "me" && f.followingId === creatorId);

  const handleFollow = (creatorId: string) => {
    if (isFollowing(creatorId)) {
      const updated = follows.filter((f) => !(f.followerId === "me" && f.followingId === creatorId));
      localStorage.setItem(STORE_KEYS.FAN_FOLLOWS, JSON.stringify(updated));
      setFollows(updated);
    } else {
      const follow: FanFollow = {
        id: generateId("follow"),
        followerId: "me",
        followingId: creatorId,
        createdAt: new Date().toISOString(),
      };
      addItem(STORE_KEYS.FAN_FOLLOWS, follow);
      setFollows([...follows, follow]);
    }
  };

  const filteredCreators = creators
    .filter((c) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.nickname.toLowerCase().includes(q) || c.groupName.toLowerCase().includes(q) || c.favoritePlayer.toLowerCase().includes(q);
      }
      return true;
    })
    .filter((c) => !groupFilter || c.groupId === groupFilter)
    .filter((c) => !badgeFilter || c.badge === badgeFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "followers": return b.followerCount - a.followerCount;
        case "fanart": return b.fanartCount - a.fanartCount;
        case "likes": return b.totalLikes - a.totalLikes;
        case "recent": return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        default: return 0;
      }
    });

  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Users className="w-7 h-7" style={{ color: themeColor }} />
            팬 크리에이터
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            팬아트를 만드는 크리에이터를 팔로우하고 소통하세요
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="크리에이터, 그룹, 최애 멤버 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground"
            style={{ "--tw-ring-color": themeColor } as any}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Group filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setGroupFilter(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                !groupFilter ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              전체
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setGroupFilter(g.id === groupFilter ? null : g.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  groupFilter === g.id ? "text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                style={groupFilter === g.id ? { background: g.coverColor } : {}}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Badge filter + Sort */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            {Object.entries(BADGE_LABELS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => setBadgeFilter(badgeFilter === key ? null : key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  badgeFilter === key ? "text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                style={badgeFilter === key ? { background: info.color } : {}}
              >
                <info.icon className="w-3 h-3" />
                {info.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-xs bg-muted border-0 rounded-lg px-3 py-1.5 text-foreground focus:outline-none"
          >
            <option value="followers">팔로워순</option>
            <option value="fanart">팬아트순</option>
            <option value="likes">좋아요순</option>
            <option value="recent">최근 가입순</option>
          </select>
        </div>

        {/* Creator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCreators.map((creator, i) => {
            const group = groups.find((g) => g.id === creator.groupId);
            const badge = creator.badge ? BADGE_LABELS[creator.badge] : null;
            const following = isFollowing(creator.id);

            return (
              <div
                key={creator.id}
                className="bg-card border border-border rounded-2xl p-4 hover:border-foreground/10 transition-all"
              >
                {/* Header row */}
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => navigate(`/fandom/fans/${creator.id}`)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                    style={{ background: group?.coverColor || themeColor }}
                  >
                    {creator.avatar}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/fandom/fans/${creator.id}`)}
                        className="text-sm font-bold text-foreground hover:underline truncate"
                      >
                        {creator.nickname}
                      </button>
                      {badge && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold shrink-0"
                          style={{ background: badge.color }}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-semibold"
                        style={{ background: group?.coverColor }}
                      >
                        {creator.groupName}
                      </span>
                      <span className="text-[11px] text-muted-foreground">최애 {creator.favoritePlayer}</span>
                    </div>
                  </div>
                  {sortBy === "followers" && (
                    <span className="text-lg font-black text-muted-foreground/30 shrink-0">
                      #{i + 1}
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {creator.bio}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3 pb-3 border-b border-border">
                  <span className="flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    {creator.fanartCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {creator.followerCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {creator.totalLikes.toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFollow(creator.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      following ? "bg-muted text-foreground" : "text-white"
                    }`}
                    style={!following ? { background: group?.coverColor || themeColor } : {}}
                  >
                    {following ? (
                      <><Users className="w-3.5 h-3.5" />팔로잉</>
                    ) : (
                      <><Heart className="w-3.5 h-3.5" />팔로우</>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/fandom/messages?to=${creator.id}`)}
                    className="px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCreators.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
