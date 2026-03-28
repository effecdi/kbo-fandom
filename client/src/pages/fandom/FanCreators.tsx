import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import {
  Users, Search, Crown, Star, TrendingUp, Sparkles, Heart,
  Image, ThumbsUp, MessageCircle, Send, Filter, Bookmark, Share2, Plus,
} from "lucide-react";
import {
  listItems, seedIfEmpty, STORE_KEYS, getFandomProfile, generateId, addItem,
  registerAsCreator, recalcCreatorStats,
  type FanCreator, type FanFollow, type KboTeam,
} from "@/lib/local-store";

type SortKey = "engagement" | "followers" | "fanart" | "likes" | "saves" | "shares" | "recent";

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
  const [sortBy, setSortBy] = useState<SortKey>("engagement");

  // Creator registration
  const [showRegister, setShowRegister] = useState(false);
  const [bio, setBio] = useState("");

  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";
  const isCreator = !!profile?.creatorId;

  useEffect(() => {
    seedIfEmpty();
    setCreators(listItems<FanCreator>(STORE_KEYS.FAN_CREATORS));
    setFollows(listItems<FanFollow>(STORE_KEYS.FAN_FOLLOWS));
  }, []);

  const groups = listItems<KboTeam>(STORE_KEYS.KBO_TEAMS);

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

  const handleRegister = () => {
    if (!profile || !bio.trim()) return;
    const creator = registerAsCreator(bio.trim());
    if (creator) {
      setCreators((prev) => [...prev, creator]);
      setShowRegister(false);
      setBio("");
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
        case "engagement": return (b.engagementScore || 0) - (a.engagementScore || 0);
        case "followers": return b.followerCount - a.followerCount;
        case "fanart": return b.fanartCount - a.fanartCount;
        case "likes": return b.totalLikes - a.totalLikes;
        case "saves": return (b.totalSaves || 0) - (a.totalSaves || 0);
        case "shares": return (b.totalShares || 0) - (a.totalShares || 0);
        case "recent": return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        default: return 0;
      }
    });

  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Users className="w-7 h-7" style={{ color: themeColor }} />
              팬 크리에이터
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              팬아트를 만드는 크리에이터를 팔로우하고 소통하세요
            </p>
          </div>

          {/* Register as creator button */}
          {profile && !isCreator && (
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shrink-0"
              style={{ background: themeColor }}
            >
              <Plus className="w-4 h-4" />
              크리에이터 등록
            </button>
          )}
          {isCreator && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
              <Crown className="w-4 h-4" />
              크리에이터 활동중
            </div>
          )}
        </div>

        {/* Registration Modal */}
        {showRegister && (
          <div className="mb-6 p-5 rounded-2xl border-2 bg-card" style={{ borderColor: themeColor }}>
            <h3 className="text-lg font-black text-foreground mb-2">크리에이터 등록</h3>
            <p className="text-sm text-muted-foreground mb-4">
              크리에이터로 등록하면 팬아트를 게시하고, 팔로워를 모으고, 랭킹에 참여할 수 있어요!
            </p>

            <div className="mb-4">
              <label className="text-[15px] font-bold text-foreground block mb-1.5">
                자기소개 (Bio)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="어떤 팬아트를 만드는지 소개해주세요! (예: LG 트윈스 팬아트 전문, 잠실 직관러)"
                className="w-full px-4 py-3 bg-muted rounded-xl text-sm resize-none focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground"
                style={{ "--tw-ring-color": themeColor } as any}
                rows={3}
                maxLength={100}
              />
              <p className="text-[13px] text-muted-foreground mt-1">{bio.length}/100자</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 mb-4">
              <p className="text-[15px] font-bold text-foreground mb-2">등록 후 이런 혜택이!</p>
              <ul className="space-y-1.5 text-[13px] text-muted-foreground">
                <li>- 팬아트 게시 시 크리에이터 뱃지 표시</li>
                <li>- 좋아요, 저장, 공유 수에 따라 engagement 점수 누적</li>
                <li>- 점수 기반 자동 뱃지 부여 (신규 → 성장 → 인기 → TOP)</li>
                <li>- 크리에이터 랭킹 참여</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRegister}
                disabled={!bio.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: themeColor }}
              >
                등록하기
              </button>
              <button
                onClick={() => { setShowRegister(false); setBio(""); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* Ranking formula info */}
        <div className="mb-4 p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-[13px] font-bold text-foreground mb-1">랭킹 점수 계산 방식</p>
          <p className="text-[13px] text-muted-foreground">
            <span className="text-rose-400 font-bold">좋아요 ×1</span> + <span className="text-amber-400 font-bold">저장 ×2</span> + <span className="text-blue-400 font-bold">공유 ×3</span> + <span className="text-violet-400 font-bold">팔로워 ×5</span> = engagement 점수
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
          <div className="flex items-center gap-1.5 max-w-full overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setGroupFilter(null)}
              className={`px-3 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                !groupFilter ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              전체
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setGroupFilter(g.id === groupFilter ? null : g.id)}
                className={`px-3 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[13px] font-semibold transition-all ${
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
            className="text-[13px] bg-muted border-0 rounded-lg px-3 py-1.5 text-foreground focus:outline-none"
          >
            <option value="engagement">종합 점수순</option>
            <option value="followers">팔로워순</option>
            <option value="fanart">팬아트순</option>
            <option value="likes">좋아요순</option>
            <option value="saves">저장순</option>
            <option value="shares">공유순</option>
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
                        className="text-[15px] font-bold text-foreground hover:underline truncate"
                      >
                        {creator.nickname}
                      </button>
                      {badge && (
                        <span
                          className="text-[13px] px-1.5 py-0.5 rounded-full text-white font-bold shrink-0"
                          style={{ background: badge.color }}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[13px] px-1.5 py-0.5 rounded-full text-white font-semibold"
                        style={{ background: group?.coverColor }}
                      >
                        {creator.groupName}
                      </span>
                      <span className="text-[13px] text-muted-foreground">최애 {creator.favoritePlayer}</span>
                    </div>
                  </div>
                  {/* Rank badge */}
                  <span className="text-lg font-black text-muted-foreground/30 shrink-0">
                    #{i + 1}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {creator.bio}
                </p>

                {/* Stats - enhanced with saves/shares */}
                <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Image className="w-3 h-3" />
                    <span className="font-bold text-foreground">{creator.fanartCount}</span>
                    <span>작품</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span className="font-bold text-foreground">{creator.followerCount.toLocaleString()}</span>
                    <span>팔로워</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span className="font-bold text-foreground">{creator.totalLikes.toLocaleString()}</span>
                    <span>좋아요</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <Bookmark className="w-3 h-3 text-amber-400" />
                    <span className="font-bold text-foreground">{(creator.totalSaves || 0).toLocaleString()}</span>
                    <span>저장</span>
                  </div>
                </div>

                {/* Engagement score bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <span className="text-muted-foreground font-medium">engagement 점수</span>
                    <span className="font-black text-foreground">{(creator.engagementScore || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(((creator.engagementScore || 0) / 80000) * 100, 100)}%`,
                        background: group?.coverColor || themeColor,
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFollow(creator.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
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
