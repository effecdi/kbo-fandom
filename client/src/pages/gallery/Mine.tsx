import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  Plus,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudioLayout } from "@/components/StudioLayout";
import { apiRequest } from "@/lib/queryClient";

type TypeFilter = "all" | "character" | "background" | "pose" | "logo" | "mascot";

interface MyItem {
  id: number;
  type: string;
  prompt: string;
  imageUrl: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  character: "캐릭터",
  background: "배경",
  pose: "포즈",
  logo: "로고",
  mascot: "마스코트",
  "style-detect": "스타일",
};

const TYPE_COLORS: Record<string, string> = {
  character: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  background: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  pose: "bg-green-500/15 text-green-400 border-green-500/20",
  logo: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  mascot: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "style-detect": "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return "방금 전";
    if (diffH < 24) return `${diffH}시간 전`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `${diffD}일 전`;
    return date.toLocaleDateString("ko-KR");
  } catch {
    return dateStr;
  }
}

export function MyGalleryPage() {
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      try {
        const source = (localStorage.getItem("olli_user_role") as string) || "creator";
        const res = await apiRequest("GET", `/api/gallery?source=${source}&limit=100&offset=0`);
        const data = await res.json();
        if (cancelled) return;
        const raw = data.items || data;
        if (Array.isArray(raw)) {
          setItems(
            raw.map((item: any) => {
              // Determine correct type based on prompt prefix + stored type
              let type = item.type || "character";
              const prompt = item.prompt || "";
              if (prompt.startsWith("[LOGO]") && type === "character") type = "logo";
              if (prompt.startsWith("[MASCOT]") && type === "character") type = "mascot";

              // Clean display name (remove prefix tags)
              let displayName = item.characterName || prompt;
              displayName = displayName.replace(/^\[LOGO\]\s*/, "").replace(/^\[MASCOT\]\s*/, "");
              if (!displayName) displayName = "무제";

              return {
                id: item.id,
                type,
                prompt: displayName,
                imageUrl: item.resultImageUrl || item.thumbnailUrl || null,
                createdAt: item.createdAt,
              };
            })
          );
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const filtered = items.filter((item) => {
    if (typeFilter === "all") return true;
    return item.type === typeFilter;
  });

  const typeCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">내 갤러리</h1>
            <p className="text-sm text-muted-foreground mt-1">
              내가 생성한 모든 작품을 관리하세요
              {items.length > 0 && (
                <span className="ml-2 text-[#00e5cc]">({items.length}개)</span>
              )}
            </p>
          </div>
          <Link to="/assets/characters/new">
            <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
              <Plus className="w-5 h-5" />
              새 작품 만들기
            </Button>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { type: "character", label: "캐릭터", icon: ImageIcon },
            { type: "mascot", label: "마스코트", icon: ImageIcon },
            { type: "background", label: "배경", icon: ImageIcon },
            { type: "pose", label: "포즈", icon: ImageIcon },
            { type: "logo", label: "로고", icon: ImageIcon },
          ].map((stat) => (
            <button
              key={stat.type}
              onClick={() => setTypeFilter(typeFilter === stat.type ? "all" : stat.type as TypeFilter)}
              className={`rounded-2xl border p-4 transition-all text-left ${
                typeFilter === stat.type
                  ? "border-[#00e5cc]/30 bg-[#00e5cc]/5"
                  : "border-border bg-card hover:border-[#00e5cc]/20"
              }`}
            >
              <p className="text-2xl font-black text-foreground">{typeCounts[stat.type] || 0}</p>
              <p className="text-[13px] text-muted-foreground mt-1">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Type filter tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {[
            { id: "all" as TypeFilter, label: "전체" },
            { id: "character" as TypeFilter, label: "캐릭터" },
            { id: "mascot" as TypeFilter, label: "마스코트" },
            { id: "background" as TypeFilter, label: "배경" },
            { id: "pose" as TypeFilter, label: "포즈" },
            { id: "logo" as TypeFilter, label: "로고" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                typeFilter === tab.id
                  ? "border-[#00e5cc] text-[#00e5cc]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id !== "all" && typeCounts[tab.id] ? (
                <span className="ml-1.5 text-[13px] bg-muted px-1.5 py-0.5 rounded-full">
                  {typeCounts[tab.id]}
                </span>
              ) : tab.id === "all" && items.length > 0 ? (
                <span className="ml-1.5 text-[13px] bg-muted px-1.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00e5cc] animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-[#00e5cc]/50 transition-all hover:shadow-lg hover:shadow-[#00e5cc]/5"
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
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
                    <span className={`px-2 py-1 rounded-full text-[13px] font-bold border ${TYPE_COLORS[item.type] || "bg-muted text-muted-foreground border-border"}`}>
                      {TYPE_LABELS[item.type] || item.type}
                    </span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={item.imageUrl || "#"}
                      download={`olli_${item.id}.png`}
                      onClick={(e) => { if (!item.imageUrl) e.preventDefault(); }}
                      className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </a>
                    <Link
                      to={`/assets/characters/${item.id}`}
                      className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </Link>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {item.prompt.replace("[LOGO] ", "")}
                  </h3>
                  <p className="text-[13px] text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">
              {typeFilter === "all" ? "아직 작품이 없습니다" : `${TYPE_LABELS[typeFilter] || typeFilter} 작품이 없습니다`}
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">AI로 첫 작품을 만들어보세요</p>
            <Link to="/assets/characters/new">
              <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
                <Plus className="w-5 h-5" />
                만들기
              </Button>
            </Link>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
