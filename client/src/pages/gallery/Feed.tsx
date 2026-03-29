import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Clock,
  Users,
  Sparkles,
  Image,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudioLayout } from "@/components/StudioLayout";

type FeedTab = "recent" | "popular" | "following";

interface FeedPost {
  id: string;
  author: string;
  authorAvatar: string;
  authorBio: string;
  title: string;
  content: string;
  imageUrl: string | null;
  type: "instatoon" | "character" | "illustration";
  panels: number;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
}

// API generation shape
interface ApiGeneration {
  id: number;
  type: string;
  prompt: string;
  resultImageUrl: string;
  thumbnailUrl?: string | null;
  characterName?: string | null;
  createdAt: string;
}

const MOCK_POSTS: FeedPost[] = [
  {
    id: "f1",
    author: "올리작가",
    authorAvatar: "OA",
    authorBio: "캐릭터 디자이너 | 인스타툰 크리에이터",
    title: "월요일 출근길",
    content: "월요일 아침의 감정을 4컷으로 표현해봤어요. 모두 공감하실 거예요 ㅋㅋ",
    imageUrl: null,
    type: "instatoon",
    panels: 4,
    likes: 234,
    comments: 18,
    shares: 12,
    liked: false,
    saved: false,
    createdAt: "2시간 전",
  },
  {
    id: "f2",
    author: "모카디자인",
    authorAvatar: "MD",
    authorBio: "일러스트레이터 | 브랜드 마스코트 전문",
    title: "새 캐릭터 공개!",
    content: "카페 컨셉의 귀여운 곰 캐릭터를 만들어봤습니다. 이름은 '모카베어'",
    imageUrl: null,
    type: "character",
    panels: 1,
    likes: 567,
    comments: 45,
    shares: 28,
    liked: true,
    saved: true,
    createdAt: "4시간 전",
  },
  {
    id: "f3",
    author: "봄날작가",
    authorAvatar: "BN",
    authorBio: "배경 일러스트 | 감성 작화",
    title: "벚꽃 시리즈 완성",
    content: "봄 시즌 배경 일러스트 시리즈를 완성했어요! 총 6장의 배경을 그렸습니다",
    imageUrl: null,
    type: "illustration",
    panels: 6,
    likes: 891,
    comments: 67,
    shares: 45,
    liked: false,
    saved: true,
    createdAt: "6시간 전",
  },
  {
    id: "f4",
    author: "펀아트",
    authorAvatar: "FA",
    authorBio: "코믹 아티스트 | 유머 인스타툰",
    title: "개발자 일상 시리즈 #12",
    content: "코딩하다 버그 만났을 때의 심정... 개발자분들 공감 100%",
    imageUrl: null,
    type: "instatoon",
    panels: 4,
    likes: 1243,
    comments: 89,
    shares: 156,
    liked: true,
    saved: false,
    createdAt: "8시간 전",
  },
  {
    id: "f5",
    author: "레인드롭",
    authorAvatar: "RD",
    authorBio: "감성 일러스트 | 힐링 콘텐츠",
    title: "비 오는 날의 고양이",
    content: "비 오는 창가에 앉아 있는 고양이를 그려봤어요. 빗소리가 들리는 것 같은 느낌으로",
    imageUrl: null,
    type: "illustration",
    panels: 1,
    likes: 423,
    comments: 32,
    shares: 19,
    liked: false,
    saved: false,
    createdAt: "12시간 전",
  },
  {
    id: "f6",
    author: "워크코믹",
    authorAvatar: "WC",
    authorBio: "직장인 공감 인스타툰",
    title: "점심시간의 고민",
    content: "매일 반복되는 점심 메뉴 고민... 여러분은 오늘 뭐 드셨나요?",
    imageUrl: null,
    type: "instatoon",
    panels: 3,
    likes: 612,
    comments: 54,
    shares: 31,
    liked: false,
    saved: false,
    createdAt: "1일 전",
  },
];

function mapApiType(type: string): FeedPost["type"] {
  if (type === "instatoon" || type === "story" || type === "bubble") return "instatoon";
  if (type === "character" || type === "create") return "character";
  return "illustration";
}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return "방금 전";
    if (diffH < 24) return `${diffH}시간 전`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `${diffD}일 전`;
    return `${Math.floor(diffD / 30)}달 전`;
  } catch {
    return dateStr;
  }
}

function apiToFeedPost(gen: ApiGeneration): FeedPost {
  return {
    id: `api-${gen.id}`,
    author: "나",
    authorAvatar: "ME",
    authorBio: "AI 크리에이터",
    title: gen.characterName || gen.prompt.slice(0, 30) || "무제",
    content: gen.prompt.length > 30 ? gen.prompt : `AI로 생성한 ${mapApiType(gen.type) === "instatoon" ? "인스타툰" : mapApiType(gen.type) === "character" ? "캐릭터" : "일러스트"} 작품입니다.`,
    imageUrl: gen.thumbnailUrl || gen.resultImageUrl || null,
    type: mapApiType(gen.type),
    panels: gen.type === "instatoon" || gen.type === "story" ? 4 : 1,
    likes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 50) + 1,
    shares: Math.floor(Math.random() * 30),
    liked: false,
    saved: false,
    createdAt: formatRelativeDate(gen.createdAt),
  };
}

const TABS: { id: FeedTab; label: string; icon: typeof TrendingUp }[] = [
  { id: "recent", label: "최신", icon: Clock },
  { id: "popular", label: "인기", icon: TrendingUp },
  { id: "following", label: "팔로잉", icon: Users },
];

const TYPE_LABELS: Record<string, string> = {
  instatoon: "인스타툰",
  character: "캐릭터",
  illustration: "일러스트",
};

export function FeedPage() {
  const [tab, setTab] = useState<FeedTab>("recent");
  const [posts, setPosts] = useState<FeedPost[]>(MOCK_POSTS);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock");

  // Fetch from API, fallback to mock
  useEffect(() => {
    let cancelled = false;

    async function fetchFeed() {
      setLoading(true);
      try {
        const res = await fetch("/api/gallery?limit=30&offset=0");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        if (cancelled) return;

        const apiItems: ApiGeneration[] = data.items || data;
        if (Array.isArray(apiItems) && apiItems.length > 0) {
          const mapped = apiItems.map(apiToFeedPost);
          setPosts(mapped);
          setDataSource("api");
        } else {
          setPosts(MOCK_POSTS);
          setDataSource("mock");
        }
      } catch {
        if (!cancelled) {
          setPosts(MOCK_POSTS);
          setDataSource("mock");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFeed();
    return () => { cancelled = true; };
  }, []);

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  }

  function toggleSave(id: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)),
    );
  }

  const sorted = [...posts].sort((a, b) =>
    tab === "popular" ? b.likes - a.likes : 0,
  );

  return (
    <StudioLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">피드</h1>
            <p className="text-sm text-muted-foreground mt-1">
              크리에이터들의 최신 소식
              {dataSource === "api" && (
                <span className="ml-2 text-[#00e5cc] text-[13px]">(내 갤러리)</span>
              )}
            </p>
          </div>
          <Link to="/studio/new">
            <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
              <Plus className="w-5 h-5" />
              발행하기
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-[#00e5cc] text-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <t.icon className="w-5 h-5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#00e5cc] animate-spin" />
          </div>
        ) : (
          /* Posts */
          <div className="space-y-4">
            {sorted.map((post) => (
              <div
                key={post.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-border/80 transition-all"
              >
                {/* Author header */}
                <div className="flex items-center gap-3 p-4 pb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b4d8] flex items-center justify-center shrink-0">
                    <span className="text-[13px] text-white font-bold">{post.authorAvatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{post.author}</span>
                      <span className="px-2 py-0.5 rounded-full text-[13px] font-medium bg-[#00e5cc]/10 text-[#00e5cc]">
                        {TYPE_LABELS[post.type]}
                      </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground truncate">{post.authorBio}</p>
                  </div>
                  <span className="text-[13px] text-muted-foreground shrink-0">{post.createdAt}</span>
                  <button className="p-1 rounded-lg hover:bg-muted transition-colors shrink-0">
                    <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Image area */}
                <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="w-12 h-12 text-muted-foreground/15" />
                    </div>
                  )}
                  {post.panels > 1 && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[13px] text-white font-bold">
                      {post.panels}컷
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="text-base font-bold text-foreground">{post.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          post.liked
                            ? "text-rose-500 bg-rose-500/10"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.liked ? "fill-current" : ""}`} />
                        {post.likes.toLocaleString()}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-all">
                        <MessageCircle className="w-5 h-5" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-all">
                        <Share2 className="w-5 h-5" />
                        {post.shares}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleSave(post.id)}
                      className={`p-2 rounded-lg transition-all ${
                        post.saved
                          ? "text-[#00e5cc] bg-[#00e5cc]/10"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.saved ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sorted.length === 0 && (
              <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">피드가 비어있습니다</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
