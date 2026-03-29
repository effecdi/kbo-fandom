import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import { Image, Palette, Plus, User, Loader2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface GalleryItem {
  id: number;
  imageUrl: string;
  prompt?: string;
  style?: string;
  type?: string;
  createdAt?: string;
}

export function AssetsIndex() {
  type AssetTab = "characters" | "backgrounds";
  const [activeTab, setActiveTab] = useState<AssetTab>("characters");
  const [characters, setCharacters] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch characters from API with fallback
  useEffect(() => {
    let cancelled = false;
    async function fetchCharacters() {
      setLoading(true);
      try {
        const res = await apiRequest("GET", "/api/gallery?type=character&limit=12&offset=0");
        const data = await res.json();
        if (!cancelled) {
          const items = data.items || data;
          setCharacters(Array.isArray(items) ? items : []);
        }
      } catch {
        if (!cancelled) setCharacters([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCharacters();
    return () => { cancelled = true; };
  }, []);

  const tabs = [
    { id: "characters" as const, label: "캐릭터", icon: User, count: characters.length },
    { id: "backgrounds" as const, label: "배경", icon: Image, count: 0 },
  ];

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">에셋</h1>
            <p className="text-muted-foreground mt-1">캐릭터와 배경을 관리하세요</p>
          </div>
          <Link to="/assets/characters/new">
            <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
              <Plus className="w-5 h-5" />
              새 에셋
            </Button>
          </Link>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/assets/characters/new"
            className="group rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:border-[#00e5cc]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00e5cc]/10 flex items-center justify-center">
                <User className="w-5 h-5 text-[#00e5cc]" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-[#00e5cc] transition-colors">
              새 캐릭터 생성
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1">AI로 캐릭터를 만들어보세요</p>
          </Link>

          <Link
            to="/assets/characters"
            className="group rounded-2xl border border-border bg-card p-5 hover:shadow-lg hover:border-[#00e5cc]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-lg font-black text-[#00e5cc]">{characters.length}</span>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-[#00e5cc] transition-colors">
              내 캐릭터
            </h3>
            <p className="text-[13px] text-muted-foreground mt-1">생성한 캐릭터 관리</p>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#00e5cc] text-[#00e5cc]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count > 0 && (
                <span className="text-[13px] bg-muted px-2 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "characters" && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#00e5cc] animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">캐릭터 불러오는 중...</p>
              </div>
            ) : characters.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {characters.map((char) => (
                  <Link
                    key={char.id}
                    to={`/assets/characters/${char.id}`}
                    className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.prompt || "캐릭터"} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground/20" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-[#00e5cc] truncate">
                        {char.prompt || `캐릭터 ${char.id}`}
                      </h3>
                      <p className="text-[13px] text-muted-foreground mt-1">
                        {char.style || "AI 생성"}
                        {char.createdAt && ` | ${new Date(char.createdAt).toLocaleDateString("ko-KR")}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <User className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">아직 캐릭터가 없습니다</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">AI로 첫 번째 캐릭터를 만들어보세요</p>
                <Link to="/assets/characters/new">
                  <Button className="bg-[#00e5cc] hover:bg-[#00f0ff] text-black font-bold gap-2">
                    <Plus className="w-5 h-5" />
                    캐릭터 만들기
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {activeTab === "backgrounds" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Palette className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">배경 에셋</p>
            <p className="text-sm text-muted-foreground mt-1">곧 지원될 예정입니다</p>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
