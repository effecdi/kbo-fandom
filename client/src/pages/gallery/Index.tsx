import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Search,
  Heart,
  Eye,
  Download,
  Sparkles,
  TrendingUp,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudioLayout } from "@/components/StudioLayout";

type GalleryTab = "popular" | "recent" | "following";

interface GalleryItem {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  imageUrl: string | null;
  likes: number;
  views: number;
  liked: boolean;
  type: "character" | "instatoon" | "background" | "mascot";
  createdAt: string;
}

// API generation shape (from /api/gallery)
interface ApiGeneration {
  id: number;
  type: string;
  prompt: string;
  resultImageUrl: string;
  thumbnailUrl?: string | null;
  characterName?: string | null;
  createdAt: string;
}

const MOCK_ITEMS: GalleryItem[] = [
  { id: "g1", title: "귀여운 고양이 캐릭터", author: "올리작가", authorAvatar: "OA", imageUrl: null, likes: 342, views: 1820, liked: false, type: "character", createdAt: "2시간 전" },
  { id: "g2", title: "카페 일상 인스타툰", author: "모카디자인", authorAvatar: "MD", imageUrl: null, likes: 218, views: 1450, liked: false, type: "instatoon", createdAt: "3시간 전" },
  { id: "g3", title: "벚꽃 배경 일러스트", author: "봄날작가", authorAvatar: "BN", imageUrl: null, likes: 567, views: 3200, liked: false, type: "background", createdAt: "5시간 전" },
  { id: "g4", title: "KBO 야구 팬아트", author: "스타라이트", authorAvatar: "SL", imageUrl: null, likes: 891, views: 5100, liked: false, type: "character", createdAt: "6시간 전" },
  { id: "g5", title: "코믹 스타일 캐릭터", author: "펀아트", authorAvatar: "FA", imageUrl: null, likes: 156, views: 890, liked: false, type: "character", createdAt: "8시간 전" },
  { id: "g6", title: "감성 비오는날 인스타툰", author: "레인드롭", authorAvatar: "RD", imageUrl: null, likes: 423, views: 2300, liked: false, type: "instatoon", createdAt: "10시간 전" },
  { id: "g7", title: "네온 시티 배경", author: "사이버아트", authorAvatar: "CA", imageUrl: null, likes: 298, views: 1700, liked: false, type: "background", createdAt: "12시간 전" },
  { id: "g8", title: "친환경 브랜드 마스코트", author: "그린스튜디오", authorAvatar: "GS", imageUrl: null, likes: 734, views: 4200, liked: false, type: "mascot", createdAt: "1일 전" },
  { id: "g9", title: "미니멀 라인 캐릭터", author: "심플드로우", authorAvatar: "SD", imageUrl: null, likes: 189, views: 1100, liked: false, type: "character", createdAt: "1일 전" },
  { id: "g10", title: "사무실 일상 4컷", author: "워크코믹", authorAvatar: "WC", imageUrl: null, likes: 612, views: 3800, liked: false, type: "instatoon", createdAt: "1일 전" },
  { id: "g11", title: "판타지 숲 배경", author: "드림스케이프", authorAvatar: "DS", imageUrl: null, likes: 445, views: 2600, liked: false, type: "background", createdAt: "2일 전" },
  { id: "g12", title: "테크 스타트업 마스코트", author: "디지털크루", authorAvatar: "DC", imageUrl: null, likes: 523, views: 3100, liked: false, type: "mascot", createdAt: "2일 전" },
];

function mapApiTypeToLocal(type: string): GalleryItem["type"] {
  if (type === "character" || type === "create") return "character";
  if (type === "instatoon" || type === "story" || type === "bubble") return "instatoon";
  if (type === "background" || type === "background-gen") return "background";
  return "character";
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

function apiToGalleryItem(gen: ApiGeneration): GalleryItem {
  return {
    id: `api-${gen.id}`,
    title: gen.characterName || gen.prompt.slice(0, 30) || "무제",
    author: "나",
    authorAvatar: "ME",
    imageUrl: gen.thumbnailUrl || gen.resultImageUrl || null,
    likes: Math.floor(Math.random() * 500) + 10,
    views: Math.floor(Math.random() * 3000) + 100,
    liked: false,
    type: mapApiTypeToLocal(gen.type),
    createdAt: formatRelativeDate(gen.createdAt),
  };
}

const TABS: { id: GalleryTab; label: string; icon: typeof TrendingUp }[] = [
  { id: "popular", label: "인기작품", icon: TrendingUp },
  { id: "recent", label: "최신", icon: Clock },
  { id: "following", label: "팔로잉", icon: Heart },
];

const TYPE_LABELS: Record<string, string> = {
  character: "캐릭터",
  instatoon: "인스타툰",
  background: "배경",
  mascot: "마스코트",
};

const TYPE_COLORS: Record<string, string> = {
  character: "bg-violet-500/20 text-violet-400",
  instatoon: "bg-[#00e5cc]/20 text-[#00e5cc]",
  background: "bg-blue-500/20 text-blue-400",
  mascot: "bg-amber-500/20 text-amber-400",
};

export function GalleryIndex() {
  const [tab, setTab] = useState<GalleryTab>("popular");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [items, setItems] = useState<GalleryItem[]>(MOCK_ITEMS);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock");

  // 인기작품은 커뮤니티 작품 (mock 데이터)
  useEffect(() => {
    setLoading(true);
    // Simulate loading
    const timer = setTimeout(() => {
      setItems(MOCK_ITEMS);
      setDataSource("mock");
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  function toggleLike(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 }
          : item,
      ),
    );
  }

  const filtered = items
    .filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.author.toLowerCase().includes(q)) return false;
      }
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => (tab === "popular" ? b.likes - a.likes : 0));

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">인기작품</h1>
            <p className="text-sm text-muted-foreground mt-1">
              크리에이터들의 인기 작품을 둘러보세요
            </p>
          </div>
          <Link to="/studio/new">
            <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
              <Sparkles className="w-5 h-5" />
              새 작품 만들기
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="작품, 작가 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#00e5cc]"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            {[
              { id: "all", label: "전체" },
              { id: "character", label: "캐릭터" },
              { id: "instatoon", label: "인스타툰" },
              { id: "background", label: "배경" },
              { id: "mascot", label: "마스코트" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  typeFilter === f.id
                    ? "bg-[#00e5cc] text-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t.id
                  ? "border-[#00e5cc] text-[#00e5cc]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
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
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-[#00e5cc]/50 transition-all hover:shadow-lg hover:shadow-[#00e5cc]/5"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-[13px] font-bold ${TYPE_COLORS[item.type]}`}>
                        {TYPE_LABELS[item.type]}
                      </span>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => toggleLike(item.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                          item.liked
                            ? "bg-rose-500/30 text-rose-400"
                            : "bg-white/20 hover:bg-white/30 text-white"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${item.liked ? "fill-current" : ""}`} />
                      </button>
                      <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                        <Download className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b4d8] flex items-center justify-center">
                        <span className="text-[13px] text-white font-bold">{item.authorAvatar}</span>
                      </div>
                      <span className="text-[13px] text-muted-foreground">{item.author}</span>
                      <span className="text-[13px] text-muted-foreground/50 ml-auto">{item.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                      <button
                        onClick={() => toggleLike(item.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          item.liked ? "text-rose-400" : ""
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${item.liked ? "fill-current" : ""}`} />
                        {item.likes.toLocaleString()}
                      </button>
                      <span className="flex items-center gap-1">
                        <Eye className="w-5 h-5" />
                        {item.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
              </div>
            )}
          </>
        )}
      </div>
    </StudioLayout>
  );
}
