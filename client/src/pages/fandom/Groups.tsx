import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Search, Users } from "lucide-react";
import { IdolGroupCard } from "@/components/fandom/idol-group-card";
import { listItems, seedIfEmpty, STORE_KEYS, type IdolGroup } from "@/lib/local-store";

const themeColor = "var(--fandom-primary, #7B2FF7)";

const CITIES = ["전체", "서울", "수원", "인천", "창원", "광주", "부산", "대구", "대전"];

export function FandomGroups() {
  const [groups, setGroups] = useState<IdolGroup[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("전체");

  useEffect(() => {
    seedIfEmpty();
    setGroups(listItems<IdolGroup>(STORE_KEYS.IDOL_GROUPS));
  }, []);

  const filtered = groups.filter((g) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !g.name.toLowerCase().includes(q) &&
        !g.nameKo.includes(q) &&
        !g.fandomName.toLowerCase().includes(q)
      )
        return false;
    }
    if (cityFilter !== "전체" && g.city !== cityFilter) return false;
    return true;
  });

  return (
    <StudioLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">KBO 구단</h1>
          <p className="text-sm text-muted-foreground mt-1">좋아하는 구단을 찾아 팬아트를 만들어보세요</p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="그룹명, 팬덤명 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              onFocus={(e) => (e.currentTarget.style.borderColor = themeColor)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "")}
            />
          </div>

          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCityFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  cityFilter === c
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={cityFilter === c ? { background: themeColor } : undefined}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((group) => (
            <IdolGroupCard key={group.id} group={group} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
