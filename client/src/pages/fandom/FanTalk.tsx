import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import {
  MessageCircle, Heart, Send, TrendingUp, Clock, Users, Star,
  Sparkles, Filter, ChevronDown, Crown, ThumbsUp, MessageSquare,
  Search, Plus, Flame,
} from "lucide-react";
import {
  listItems, addItem, seedIfEmpty, STORE_KEYS, getFandomProfile, generateId,
  type FanTalkPost, type FanTalkReply, type FanCreator, type IdolGroup,
} from "@/lib/local-store";

type TopicFilter = "전체" | "잡담" | "질문" | "추천" | "소식" | "인증";

const TOPICS: { label: TopicFilter; icon: typeof MessageCircle; color: string }[] = [
  { label: "전체", icon: Sparkles, color: "#7B2FF7" },
  { label: "잡담", icon: MessageCircle, color: "#3B82F6" },
  { label: "질문", icon: MessageSquare, color: "#F59E0B" },
  { label: "추천", icon: Star, color: "#10B981" },
  { label: "소식", icon: TrendingUp, color: "#EF4444" },
  { label: "인증", icon: Flame, color: "#EC4899" },
];

const BADGE_LABELS: Record<string, { label: string; color: string }> = {
  top: { label: "TOP", color: "#F59E0B" },
  popular: { label: "인기", color: "#EC4899" },
  rising: { label: "성장중", color: "#10B981" },
  rookie: { label: "신규", color: "#3B82F6" },
};

function seedTalkReplies() {
  if (listItems("olli-fandom-talk-replies").length > 0) return;
  const seed: FanTalkReply[] = [
    { id: "tr-1", postId: "talk-1", authorId: "fan-12", authorName: "정국맘", authorAvatar: "JM", content: "봤어요!! 대박이었어요 바로 팬아트 그리러 갑니다 🎨", likes: 12, liked: false, createdAt: "2026-03-24T09:45:00" },
    { id: "tr-2", postId: "talk-1", authorId: "fan-9", authorName: "올리작가", authorAvatar: "OL", content: "저도요!! 레퍼런스 바로 저장했어요 ㅎㅎ", likes: 8, liked: false, createdAt: "2026-03-24T10:00:00" },
    { id: "tr-3", postId: "talk-2", authorId: "fan-10", authorName: "뉴진러버", authorAvatar: "NL", content: "저는 Super Shy 컨셉이 반응 좋았어요! 귀여운 스타일로 그렸더니", likes: 15, liked: false, createdAt: "2026-03-24T08:30:00" },
    { id: "tr-4", postId: "talk-2", authorId: "fan-1", authorName: "아미드로잉", authorAvatar: "AD", content: "인스타툰은 역시 공감 포인트가 중요한 것 같아요!", likes: 9, liked: false, createdAt: "2026-03-24T08:45:00" },
    { id: "tr-5", postId: "talk-3", authorId: "fan-11", authorName: "호시호랑이", authorAvatar: "HH", content: "밈 챌린지 참여했어요! 호시 밈은 진짜 만들수록 재밌음 ㅋㅋ", likes: 22, liked: false, createdAt: "2026-03-24T07:30:00" },
    { id: "tr-6", postId: "talk-4", authorId: "fan-5", authorName: "스테이아트", authorAvatar: "SA", content: "QuickPoses 진짜 좋아요! 추천 감사합니다 🙏", likes: 18, liked: false, createdAt: "2026-03-23T22:30:00" },
    { id: "tr-7", postId: "talk-4", authorId: "fan-4", authorName: "마이드로우", authorAvatar: "MD", content: "저도 Line of Action 자주 써요! 포즈 연습에 최고", likes: 14, liked: false, createdAt: "2026-03-23T23:00:00" },
    { id: "tr-8", postId: "talk-8", authorId: "fan-1", authorName: "아미드로잉", authorAvatar: "AD", content: "정국이 시리즈 진짜 대박이에요!! 퀄리티 미쳤다 ㅠㅠ", likes: 34, liked: false, createdAt: "2026-03-23T14:30:00" },
    { id: "tr-9", postId: "talk-10", authorId: "fan-3", authorName: "버니작가", authorAvatar: "BJ", content: "OLLI AI 진짜 좋죠?! 저도 처음 써보고 감동받았어요 ㅎㅎ", likes: 11, liked: false, createdAt: "2026-03-23T10:45:00" },
    { id: "tr-10", postId: "talk-12", authorId: "fan-6", authorName: "캐럿크리에이터", authorAvatar: "CC", content: "ㅋㅋㅋㅋ 호시 그리면 자동으로 호랑이 나오는 건 진짜 공감", likes: 28, liked: false, createdAt: "2026-03-22T20:00:00" },
  ];
  seed.forEach((r) => addItem("olli-fandom-talk-replies", r));
}

export function FanTalk() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FanTalkPost[]>([]);
  const [creators, setCreators] = useState<FanCreator[]>([]);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("전체");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");
  const [newPostTopic, setNewPostTopic] = useState<FanTalkPost["topic"]>("잡담");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [showCompose, setShowCompose] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replies, setReplies] = useState<FanTalkReply[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  useEffect(() => {
    seedIfEmpty();
    seedTalkReplies();
    setPosts(listItems<FanTalkPost>(STORE_KEYS.FAN_TALK_POSTS));
    setCreators(listItems<FanCreator>(STORE_KEYS.FAN_CREATORS));
    setReplies(listItems<FanTalkReply>("olli-fandom-talk-replies"));
  }, []);

  const filteredPosts = posts
    .filter((p) => topicFilter === "전체" || p.topic === topicFilter)
    .filter((p) => !groupFilter || p.groupId === groupFilter)
    .sort((a, b) => {
      if (sortBy === "popular") return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const topCreators = [...creators]
    .sort((a, b) => b.followerCount - a.followerCount)
    .slice(0, 5);

  const groups = listItems<IdolGroup>(STORE_KEYS.IDOL_GROUPS);

  const handlePost = () => {
    if (!newPost.trim() || !profile) return;
    const post: FanTalkPost = {
      id: generateId("talk"),
      authorId: "me",
      authorName: profile.nickname,
      authorAvatar: profile.nickname.charAt(0).toUpperCase(),
      groupId: profile.groupId,
      groupName: profile.groupName,
      content: newPost,
      topic: newPostTopic,
      likes: 0,
      liked: false,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    };
    addItem(STORE_KEYS.FAN_TALK_POSTS, post);
    setPosts([post, ...posts]);
    setNewPost("");
    setShowCompose(false);
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleReply = (postId: string) => {
    const text = replyText[postId];
    if (!text?.trim() || !profile) return;
    const reply: FanTalkReply = {
      id: generateId("reply"),
      postId,
      authorId: "me",
      authorName: profile.nickname,
      authorAvatar: profile.nickname.charAt(0).toUpperCase(),
      content: text,
      likes: 0,
      liked: false,
      createdAt: new Date().toISOString(),
    };
    addItem("olli-fandom-talk-replies", reply);
    setReplies((prev) => [...prev, reply]);
    setReplyText((prev) => ({ ...prev, [postId]: "" }));
    // Increment reply count
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, replyCount: p.replyCount + 1 } : p))
    );
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <MessageCircle className="w-7 h-7" style={{ color: themeColor }} />
              팬 토크
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              팬들과 자유롭게 소통하고 팬아트 이야기를 나눠보세요
            </p>
          </div>
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: themeColor }}
          >
            <Plus className="w-4 h-4" />
            글쓰기
          </button>
        </div>

        <div className="flex gap-6">
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {/* Compose */}
            {showCompose && (
              <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                <div className="flex gap-2 mb-3">
                  {(["잡담", "질문", "추천", "소식", "인증"] as FanTalkPost["topic"][]).map((t) => {
                    const topicInfo = TOPICS.find((tp) => tp.label === t);
                    return (
                      <button
                        key={t}
                        onClick={() => setNewPostTopic(t)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          newPostTopic === t
                            ? "text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                        style={newPostTopic === t ? { background: topicInfo?.color } : {}}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="팬들에게 공유하고 싶은 이야기를 적어주세요..."
                  className="w-full bg-muted rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 border-0 text-foreground placeholder-muted-foreground"
                  style={{ "--tw-ring-color": themeColor } as any}
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    style={{ background: themeColor }}
                  >
                    <Send className="w-4 h-4" />
                    게시하기
                  </button>
                </div>
              </div>
            )}

            {/* Topic Filter */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              {TOPICS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setTopicFilter(t.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    topicFilter === t.label
                      ? "text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  style={topicFilter === t.label ? { background: t.color } : {}}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}

              <div className="flex-1" />

              {/* Sort */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setSortBy("latest")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    sortBy === "latest" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Clock className="w-3 h-3 inline mr-1" />최신
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    sortBy === "popular" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <TrendingUp className="w-3 h-3 inline mr-1" />인기
                </button>
              </div>
            </div>

            {/* Group Filter Chips */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              <button
                onClick={() => setGroupFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  !groupFilter ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                전체 그룹
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

            {/* Posts */}
            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const topicInfo = TOPICS.find((t) => t.label === post.topic);
                const group = groups.find((g) => g.id === post.groupId);
                return (
                  <div
                    key={post.id}
                    className="bg-card border border-border rounded-2xl p-4 hover:border-foreground/10 transition-all"
                  >
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => post.authorId !== "me" && navigate(`/fandom/fans/${post.authorId}`)}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: group?.coverColor || themeColor }}
                      >
                        {post.authorAvatar}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => post.authorId !== "me" && navigate(`/fandom/fans/${post.authorId}`)}
                            className="text-sm font-semibold text-foreground hover:underline"
                          >
                            {post.authorName}
                          </button>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold text-white"
                            style={{ background: group?.coverColor || "#888" }}
                          >
                            {post.groupName}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatTime(post.createdAt)}</p>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white"
                        style={{ background: topicInfo?.color }}
                      >
                        {post.topic}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-foreground whitespace-pre-wrap mb-3 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs transition-all ${
                          post.liked ? "font-semibold" : "text-muted-foreground hover:text-foreground"
                        }`}
                        style={post.liked ? { color: topicInfo?.color } : {}}
                      >
                        <ThumbsUp className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
                        {post.likes}
                      </button>
                      <button
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className={`flex items-center gap-1.5 text-xs transition-all ${
                          expandedPost === post.id ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        답글 {post.replyCount}
                      </button>
                    </div>

                    {/* Replies */}
                    {expandedPost === post.id && (
                      <div className="mt-3 pt-3 border-t border-border space-y-3">
                        {replies
                          .filter((r) => r.postId === post.id)
                          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                          .map((reply) => (
                            <div key={reply.id} className="flex gap-2.5 ml-2">
                              <button
                                onClick={() => reply.authorId !== "me" && navigate(`/fandom/fans/${reply.authorId}`)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                style={{ background: group?.coverColor || themeColor }}
                              >
                                {reply.authorAvatar}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">{reply.authorName}</span>
                                  <span className="text-[10px] text-muted-foreground">{formatTime(reply.createdAt)}</span>
                                </div>
                                <p className="text-xs text-foreground mt-0.5">{reply.content}</p>
                                <button className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 hover:text-foreground">
                                  <ThumbsUp className="w-3 h-3" />
                                  {reply.likes}
                                </button>
                              </div>
                            </div>
                          ))}

                        {/* Reply input */}
                        <div className="flex gap-2 ml-2">
                          <input
                            type="text"
                            placeholder="답글을 입력하세요..."
                            value={replyText[post.id] || ""}
                            onChange={(e) => setReplyText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && handleReply(post.id)}
                            className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 border-0 text-foreground placeholder-muted-foreground"
                            style={{ "--tw-ring-color": themeColor } as any}
                          />
                          <button
                            onClick={() => handleReply(post.id)}
                            disabled={!replyText[post.id]?.trim()}
                            className="px-3 py-2 rounded-lg text-white text-xs font-semibold disabled:opacity-50 transition-all"
                            style={{ background: group?.coverColor || themeColor }}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredPosts.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">아직 글이 없어요. 첫 번째 글을 작성해보세요!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-72 shrink-0 hidden lg:block space-y-4">
            {/* Popular Creators */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4" style={{ color: themeColor }} />
                인기 크리에이터
              </h3>
              <div className="space-y-3">
                {topCreators.map((creator, i) => {
                  const badgeInfo = creator.badge ? BADGE_LABELS[creator.badge] : null;
                  const group = groups.find((g) => g.id === creator.groupId);
                  return (
                    <button
                      key={creator.id}
                      onClick={() => navigate(`/fandom/fans/${creator.id}`)}
                      className="flex items-center gap-3 w-full text-left hover:bg-muted rounded-lg p-1.5 transition-all"
                    >
                      <div className="relative">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: group?.coverColor || themeColor }}
                        >
                          {creator.avatar}
                        </div>
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-card text-[10px] font-bold flex items-center justify-center border border-border">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground truncate">{creator.nickname}</span>
                          {badgeInfo && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full text-white font-semibold"
                              style={{ background: badgeInfo.color }}
                            >
                              {badgeInfo.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          팔로워 {creator.followerCount.toLocaleString()} · {creator.groupName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => navigate("/fandom/fans")}
                className="w-full text-center text-xs font-semibold mt-3 py-2 rounded-lg transition-all hover:bg-muted"
                style={{ color: themeColor }}
              >
                크리에이터 더보기 →
              </button>
            </div>

            {/* Trending Topics */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: themeColor }} />
                실시간 인기 토픽
              </h3>
              <div className="space-y-2">
                {[
                  { tag: "#BTS_데뷔13주년", count: 234 },
                  { tag: "#뉴진스_인스타툰", count: 156 },
                  { tag: "#팬아트_챌린지", count: 189 },
                  { tag: "#호시_밈", count: 312 },
                  { tag: "#제니_솔로", count: 112 },
                ].map((topic, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                      <span className="text-sm font-medium" style={{ color: themeColor }}>
                        {topic.tag}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{topic.count}개</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick DM CTA */}
            <button
              onClick={() => navigate("/fandom/messages")}
              className="w-full bg-card border border-border rounded-2xl p-4 text-left hover:border-foreground/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: themeColor }}
                >
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">다이렉트 메시지</p>
                  <p className="text-xs text-muted-foreground">팬 크리에이터에게 DM 보내기</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
