import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { FandomFeedPostCard } from "@/components/fandom/fandom-feed-post-card";
import { FandomFilterBar } from "@/components/fandom/fandom-filter-bar";
import { CommentSection } from "@/components/fandom/comment-section";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TrendingUp, Clock, Heart, Sparkles, Users } from "lucide-react";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  getFandomProfile,
  type FandomFeedPost,
  type FanFollow,
  type FanCreator,
} from "@/lib/local-store";

type FeedTab = "all" | "mygroup" | "following";

export function FandomFeed() {
  const [posts, setPosts] = useState<FandomFeedPost[]>([]);
  const [tab, setTab] = useState<FeedTab>("mygroup");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FandomFeedPost | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");

  const fandomProfile = getFandomProfile();
  const [followedCreatorNames, setFollowedCreatorNames] = useState<string[]>([]);

  useEffect(() => {
    seedIfEmpty();
    setPosts(listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED));
    // Default to my group filter
    if (fandomProfile?.groupId) {
      setGroupFilter(fandomProfile.groupId);
    }
    // Build followed creator names for "following" tab
    const follows = listItems<FanFollow>(STORE_KEYS.FAN_FOLLOWS);
    const creators = listItems<FanCreator>(STORE_KEYS.FAN_CREATORS);
    const myFollowIds = follows.filter((f) => f.followerId === "me").map((f) => f.followingId);
    const names = creators.filter((c) => myFollowIds.includes(c.id)).map((c) => c.nickname);
    setFollowedCreatorNames(names);
  }, []);

  const TABS: { id: FeedTab; label: string; icon: typeof TrendingUp }[] = [
    { id: "all", label: "전체", icon: Sparkles },
    { id: "mygroup", label: fandomProfile?.groupName || "내 그룹", icon: Heart },
    { id: "following", label: "팔로잉", icon: Users },
  ];

  const handleTabChange = (newTab: FeedTab) => {
    setTab(newTab);
    if (newTab === "mygroup" && fandomProfile?.groupId) {
      setGroupFilter(fandomProfile.groupId);
    } else if (newTab === "all") {
      setGroupFilter(null);
    }
  };

  const filtered = posts
    .filter((p) => {
      if (tab === "mygroup" && fandomProfile?.groupId) {
        return p.groupId === fandomProfile.groupId;
      }
      if (tab === "following") {
        return followedCreatorNames.includes(p.authorName);
      }
      if (groupFilter && tab === "all") {
        return p.groupId === groupFilter;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.likes - a.likes;
      return b.createdAt.localeCompare(a.createdAt);
    });

  const themeColor = "var(--fandom-primary, #7B2FF7)";

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">팬덤 피드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fandomProfile
              ? `${fandomProfile.groupName} 팬덤 커뮤니티의 최신 팬아트와 인스타툰`
              : "팬덤 커뮤니티의 최신 팬아트와 인스타툰을 확인하세요"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t.id
                  ? "border-current"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={tab === t.id ? { color: themeColor, borderColor: themeColor } : {}}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}

          {/* Sort within tab */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSortBy("latest")}
              className={`flex items-center gap-1 px-3 py-1.5 text-[13px] rounded-full transition-all ${
                sortBy === "latest" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <Clock className="w-3 h-3" /> 최신
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`flex items-center gap-1 px-3 py-1.5 text-[13px] rounded-full transition-all ${
                sortBy === "popular" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              <TrendingUp className="w-3 h-3" /> 인기
            </button>
          </div>
        </div>

        {/* Group Filter (only when "all" tab) */}
        {tab === "all" && (
          <FandomFilterBar selected={groupFilter} onChange={setGroupFilter} />
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((post) => (
            <FandomFeedPostCard key={post.id} post={post} onClick={setSelectedPost} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {tab === "mygroup"
                ? `${fandomProfile?.groupName || "내 그룹"}의 포스트가 없습니다`
                : "포스트가 없습니다"}
            </p>
          </div>
        )}

        {/* Post Detail Modal */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            {selectedPost && (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px]">
                <div className="bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
                  {selectedPost.imageUrl ? (
                    <img src={selectedPost.imageUrl} alt={selectedPost.title} className="max-h-[70vh] w-full object-contain" />
                  ) : (
                    <Sparkles className="w-16 h-16 text-muted-foreground/20" />
                  )}
                </div>
                <div className="p-5 space-y-4 flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                      <span className="text-[13px] text-white font-bold">{selectedPost.authorAvatar}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">{selectedPost.authorName}</span>
                      <p className="text-[13px] text-muted-foreground">{selectedPost.groupName} · {selectedPost.memberTags.join(", ")}</p>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{selectedPost.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedPost.description}</p>

                  <div className="flex-1" />

                  <CommentSection postId={selectedPost.id} />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StudioLayout>
  );
}
