import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link, useNavigate } from "react-router";
import { Search, Plus, User, Calendar, Filter, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

type FilterTab = "all" | "character" | "mascot";

interface CharacterItem {
  id: number | string;
  name?: string;
  prompt?: string;
  style?: string;
  imageUrl: string | null;
  createdAt: string;
  type?: string;
}

const styleBadgeColors: Record<string, string> = {
  "simple-line": "bg-cyan-500/20 text-cyan-400",
  "minimal": "bg-purple-500/20 text-purple-400",
  "doodle": "bg-amber-500/20 text-amber-400",
  "cute-animal": "bg-pink-500/20 text-pink-400",
  "scribble": "bg-orange-500/20 text-orange-400",
  "ink-sketch": "bg-emerald-500/20 text-emerald-400",
};

const styleLabels: Record<string, string> = {
  "simple-line": "심플라인",
  "minimal": "미니멀",
  "doodle": "낙서",
  "cute-animal": "귀여운동물",
  "scribble": "스크리블",
  "ink-sketch": "잉크스케치",
};

const mockCharacters: CharacterItem[] = [
  { id: "char-1", name: "미니", style: "simple-line", imageUrl: null, createdAt: "2024-03-15" },
  { id: "char-2", name: "루비", style: "cute-animal", imageUrl: null, createdAt: "2024-03-14" },
  { id: "char-3", name: "하루", style: "minimal", imageUrl: null, createdAt: "2024-03-13" },
  { id: "char-4", name: "뽀로", style: "doodle", imageUrl: null, createdAt: "2024-03-12" },
  { id: "char-5", name: "솔이", style: "ink-sketch", imageUrl: null, createdAt: "2024-03-11" },
  { id: "char-6", name: "코코", style: "scribble", imageUrl: null, createdAt: "2024-03-10" },
];

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "character", label: "캐릭터" },
  { id: "mascot", label: "마스코트" },
];

export function CharactersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchCharacters = async () => {
    setLoading(true);
    setError(null);
    try {
      const source = (localStorage.getItem("olli_user_role") as string) || "creator";
      const res = await apiRequest("GET", `/api/gallery?type=character&source=${source}&limit=50&offset=0`);
      const data = await res.json();
      const items = data.items || data;
      if (Array.isArray(items) && items.length > 0) {
        const filtered = items
          .filter((item: any) => {
            const prompt = item.prompt || "";
            // Exclude logos and mascots from character list
            if (prompt.startsWith("[LOGO]")) return false;
            if (prompt.startsWith("[MASCOT]")) return false;
            if (item.type && item.type !== "character") return false;
            return true;
          });
        setCharacters(filtered.map((item: any) => ({
          id: item.id,
          name: item.characterName || item.prompt?.split(",")[0]?.trim()?.substring(0, 20) || `캐릭터 ${item.id}`,
          prompt: item.prompt,
          style: item.style || "simple-line",
          imageUrl: item.resultImageUrl || item.thumbnailUrl || item.imageUrl || null,
          createdAt: item.createdAt || new Date().toISOString(),
          type: item.type,
        })));
        setUsingMock(false);
      } else {
        setCharacters(mockCharacters);
        setUsingMock(true);
      }
    } catch {
      // Fallback to mock data
      setCharacters(mockCharacters);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const filteredCharacters = characters.filter((char) => {
    const displayName = char.name || char.prompt || "";
    const styleLabel = styleLabels[char.style || ""] || char.style || "";
    const matchesSearch =
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      styleLabel.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "mascot") {
      return matchesSearch && ["cute-animal", "simple-line"].includes(char.style || "");
    }
    return matchesSearch && !["cute-animal", "simple-line"].includes(char.style || "");
  });

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">캐릭터</h1>
            <p className="text-muted-foreground mt-1">
              생성한 캐릭터를 관리하고 새 캐릭터를 만드세요
              {usingMock && (
                <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  데모 데이터
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCharacters}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              새로고침
            </Button>
            <Link to="/assets/characters/new">
              <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
                <Plus className="w-4 h-4" />
                새 캐릭터 만들기
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="캐릭터 이름 또는 스타일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeFilter === tab.id
                  ? "border-[#00e5cc] text-[#00e5cc]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00e5cc] animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">캐릭터 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* Character Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCharacters.map((char) => {
                const styleKey = char.style || "simple-line";
                const badgeColor = styleBadgeColors[styleKey] || "bg-gray-500/20 text-gray-400";
                const label = styleLabels[styleKey] || styleKey;

                return (
                  <Link
                    key={char.id}
                    to={`/assets/characters/${char.id}`}
                    className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-[#00e5cc]/30 transition-all"
                  >
                    {/* Character Image */}
                    <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                      {char.imageUrl ? (
                        <img
                          src={char.imageUrl}
                          alt={char.name || "캐릭터"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground/20" />
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-[#00e5cc] transition-colors truncate">
                        {char.name || `캐릭터 ${char.id}`}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
                          {label}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(char.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredCharacters.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Filter className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">검색 결과가 없습니다</p>
                <p className="text-sm text-muted-foreground mt-1">다른 키워드로 검색해보세요</p>
              </div>
            )}
          </>
        )}
      </div>
    </StudioLayout>
  );
}
