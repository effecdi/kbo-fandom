import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import {
  Heart, Users, Star, MessageCircle, Send, Image,
  ArrowLeft, Crown, Sparkles, Calendar, TrendingUp, ThumbsUp,
} from "lucide-react";
import {
  listItems, addItem, seedIfEmpty, STORE_KEYS, getFandomProfile, generateId,
  type FanCreator, type FandomFeedPost, type FanFollow, type IdolGroup,
} from "@/lib/local-store";

const BADGE_CONFIG: Record<string, { label: string; color: string; icon: typeof Crown }> = {
  top: { label: "TOP 크리에이터", color: "#F59E0B", icon: Crown },
  popular: { label: "인기 크리에이터", color: "#EC4899", icon: Star },
  rising: { label: "성장 크리에이터", color: "#10B981", icon: TrendingUp },
  rookie: { label: "신규 크리에이터", color: "#3B82F6", icon: Sparkles },
};

export function FanProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<FanCreator | null>(null);
  const [posts, setPosts] = useState<FandomFeedPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  useEffect(() => {
    seedIfEmpty();
    const creators = listItems<FanCreator>(STORE_KEYS.FAN_CREATORS);
    const found = creators.find((c) => c.id === id);
    if (found) {
      setCreator(found);
      setFollowerCount(found.followerCount);
    }

    // Load their posts
    const allPosts = listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED);
    const authorPosts = allPosts.filter((p) => p.authorName === found?.nickname);
    setPosts(authorPosts);

    // Check follow status
    const follows = listItems<FanFollow>(STORE_KEYS.FAN_FOLLOWS);
    setIsFollowing(follows.some((f) => f.followerId === "me" && f.followingId === id));
  }, [id]);

  const handleFollow = () => {
    if (!id) return;
    if (isFollowing) {
      // Unfollow
      const follows = listItems<FanFollow>(STORE_KEYS.FAN_FOLLOWS);
      const updated = follows.filter((f) => !(f.followerId === "me" && f.followingId === id));
      localStorage.setItem(STORE_KEYS.FAN_FOLLOWS, JSON.stringify(updated));
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      // Follow
      const follow: FanFollow = {
        id: generateId("follow"),
        followerId: "me",
        followingId: id,
        createdAt: new Date().toISOString(),
      };
      addItem(STORE_KEYS.FAN_FOLLOWS, follow);
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  };

  const handleDM = () => {
    navigate(`/fandom/messages?to=${id}`);
  };

  if (!creator) {
    return (
      <StudioLayout>
        <div className="text-center py-20 text-muted-foreground">
          <p>크리에이터를 찾을 수 없습니다.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm underline">돌아가기</button>
        </div>
      </StudioLayout>
    );
  }

  const group = listItems<IdolGroup>(STORE_KEYS.IDOL_GROUPS).find((g) => g.id === creator.groupId);
  const badgeInfo = creator.badge ? BADGE_CONFIG[creator.badge] : null;

  return (
    <StudioLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          {/* Banner */}
          <div
            className="h-28 relative"
            style={{ background: `linear-gradient(135deg, ${group?.coverColor || "#7B2FF7"}, ${group?.coverColor || "#7B2FF7"}88)` }}
          >
            {badgeInfo && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <badgeInfo.icon className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-white">{badgeInfo.label}</span>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end gap-4 -mt-10">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black border-4 border-card"
                style={{ background: group?.coverColor || themeColor }}
              >
                {creator.avatar}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-foreground">{creator.nickname}</h1>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full text-white font-semibold"
                    style={{ background: group?.coverColor }}
                  >
                    {creator.groupName}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">최애: {creator.favoritePlayer}</p>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-foreground mt-4 leading-relaxed">{creator.bio}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-lg font-black text-foreground">{creator.fanartCount}</p>
                <p className="text-[11px] text-muted-foreground">팬아트</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-foreground">{followerCount.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">팔로워</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-foreground">{creator.followingCount}</p>
                <p className="text-[11px] text-muted-foreground">팔로잉</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-foreground">{creator.totalLikes.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">총 좋아요</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={handleFollow}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isFollowing ? "bg-muted text-foreground" : "text-white"
                }`}
                style={!isFollowing ? { background: group?.coverColor || themeColor } : {}}
              >
                {isFollowing ? (
                  <>
                    <Users className="w-4 h-4" />
                    팔로잉
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    팔로우
                  </>
                )}
              </button>
              <button
                onClick={handleDM}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-muted text-foreground hover:bg-muted/80 transition-all"
              >
                <Send className="w-4 h-4" />
                DM 보내기
              </button>
            </div>

            {/* Joined date */}
            <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(creator.joinedAt).getFullYear()}년 {new Date(creator.joinedAt).getMonth() + 1}월 가입
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Image className="w-5 h-5" style={{ color: group?.coverColor || themeColor }} />
            팬아트 ({posts.length})
          </h2>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-card border border-border rounded-2xl p-4 hover:border-foreground/10 transition-all"
                >
                  {/* Placeholder image */}
                  <div
                    className="w-full aspect-square rounded-xl mb-3 flex items-center justify-center"
                    style={{ background: `${group?.coverColor || "#7B2FF7"}15` }}
                  >
                    <Sparkles className="w-8 h-8 opacity-30" style={{ color: group?.coverColor }} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.commentCount}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: group?.coverColor }}
                    >
                      {post.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">아직 팬아트가 없어요</p>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
