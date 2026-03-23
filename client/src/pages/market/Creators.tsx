import { useState } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  Search,
  Users,
  Star,
  TrendingUp,
  Zap,
  BadgeCheck,
  Flame,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const genreFilters = ["전체", "웹툰", "일러스트", "캐릭터 디자인", "만화", "애니메이션", "모션그래픽"];
const followerRanges = [
  { label: "전체", value: "all" },
  { label: "1K ~ 5K", value: "1k-5k" },
  { label: "5K ~ 10K", value: "5k-10k" },
  { label: "10K ~ 50K", value: "10k-50k" },
  { label: "50K+", value: "50k+" },
];

const mockCreators = [
  {
    id: "creator-1",
    name: "김작가",
    bio: "감성적인 웹툰 작가, 로맨스/일상 장르 전문",
    genres: ["웹툰", "로맨스"],
    followers: "15.2K",
    engagement: 8.5,
    avgPrice: "200만원",
    matchScore: 95,
    tags: ["검증된 작가", "빠른 응답"],
    rating: 4.8,
  },
  {
    id: "creator-2",
    name: "이드로우",
    bio: "디지털 일러스트레이터, 상업 일러스트 다수 진행",
    genres: ["일러스트", "캐릭터 디자인"],
    followers: "8.7K",
    engagement: 12.3,
    avgPrice: "150만원",
    matchScore: 88,
    tags: ["빠른 응답"],
    rating: 4.5,
  },
  {
    id: "creator-3",
    name: "박크리에이터",
    bio: "웹툰 연재 경력 5년, 다양한 브랜드 콜라보 경험",
    genres: ["웹툰", "만화"],
    followers: "22.1K",
    engagement: 6.8,
    avgPrice: "350만원",
    matchScore: 92,
    tags: ["인기 크리에이터", "검증된 작가"],
    rating: 4.9,
  },
  {
    id: "creator-4",
    name: "최아트",
    bio: "캐릭터 디자인 전문, 귀여운 스타일",
    genres: ["캐릭터 디자인", "일러스트"],
    followers: "11.3K",
    engagement: 9.1,
    avgPrice: "180만원",
    matchScore: 85,
    tags: ["빠른 응답", "인기 크리에이터"],
    rating: 4.6,
  },
  {
    id: "creator-5",
    name: "정일러스트",
    bio: "자연과 풍경을 주제로 한 감성 일러스트",
    genres: ["일러스트"],
    followers: "5.8K",
    engagement: 15.2,
    avgPrice: "120만원",
    matchScore: 78,
    tags: ["빠른 응답"],
    rating: 4.3,
  },
  {
    id: "creator-6",
    name: "한모션",
    bio: "모션그래픽 & GIF 전문 크리에이터",
    genres: ["애니메이션", "모션그래픽"],
    followers: "9.4K",
    engagement: 7.6,
    avgPrice: "250만원",
    matchScore: 82,
    tags: ["검증된 작가"],
    rating: 4.7,
  },
];

const tagConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  "빠른 응답": { color: "text-green-500 bg-green-500/10", icon: Zap },
  "검증된 작가": { color: "text-blue-500 bg-blue-500/10", icon: BadgeCheck },
  "인기 크리에이터": { color: "text-orange-500 bg-orange-500/10", icon: Flame },
};

function parseFollowers(str: string): number {
  const num = parseFloat(str.replace(/K/i, ""));
  if (str.toUpperCase().includes("K")) return num * 1000;
  return num;
}

export function CreatorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("전체");
  const [followerRange, setFollowerRange] = useState("all");
  const [engagementFilter, setEngagementFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(true);

  const filteredCreators = mockCreators.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre =
      selectedGenre === "전체" || creator.genres.includes(selectedGenre);

    const followers = parseFollowers(creator.followers);
    let matchesFollowers = true;
    if (followerRange === "1k-5k") matchesFollowers = followers >= 1000 && followers < 5000;
    else if (followerRange === "5k-10k") matchesFollowers = followers >= 5000 && followers < 10000;
    else if (followerRange === "10k-50k") matchesFollowers = followers >= 10000 && followers < 50000;
    else if (followerRange === "50k+") matchesFollowers = followers >= 50000;

    let matchesEngagement = true;
    if (engagementFilter === "5+") matchesEngagement = creator.engagement >= 5;
    else if (engagementFilter === "10+") matchesEngagement = creator.engagement >= 10;
    else if (engagementFilter === "15+") matchesEngagement = creator.engagement >= 15;

    return matchesSearch && matchesGenre && matchesFollowers && matchesEngagement;
  });

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">크리에이터 찾기</h1>
          <p className="text-muted-foreground mt-1">프로젝트에 맞는 크리에이터를 검색하고 연결하세요</p>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          {showFilters && (
            <div className="w-64 shrink-0">
              <div className="rounded-2xl border bg-card border-border p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground">필터</h3>
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Genre Filter */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    장르
                  </h4>
                  <div className="space-y-1">
                    {genreFilters.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedGenre === genre
                            ? "bg-[#00e5cc]/10 text-[#00e5cc] font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Followers Filter */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    팔로워 수
                  </h4>
                  <div className="space-y-1">
                    {followerRanges.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setFollowerRange(range.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          followerRange === range.value
                            ? "bg-[#00e5cc]/10 text-[#00e5cc] font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engagement Rate */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    참여율
                  </h4>
                  <div className="space-y-1">
                    {[
                      { label: "전체", value: "all" },
                      { label: "5% 이상", value: "5+" },
                      { label: "10% 이상", value: "10+" },
                      { label: "15% 이상", value: "15+" },
                    ].map((rate) => (
                      <button
                        key={rate.value}
                        onClick={() => setEngagementFilter(rate.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          engagementFilter === rate.value
                            ? "bg-[#00e5cc]/10 text-[#00e5cc] font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {rate.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Search */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="크리에이터 이름 또는 키워드 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent bg-muted border-border text-foreground placeholder-muted-foreground text-sm"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                필터
              </Button>
            </div>

            {/* Creator Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCreators.map((creator) => (
                <Link
                  key={creator.id}
                  to={`/market/creators/${creator.id}`}
                  className="rounded-2xl border bg-card border-border p-5 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center shrink-0">
                      <span className="text-xl font-bold text-white">
                        {creator.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground group-hover:text-[#00e5cc] transition-colors">
                          {creator.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium text-foreground">{creator.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{creator.bio}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {creator.genres.map((genre) => (
                          <span
                            key={genre}
                            className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">팔로워</p>
                      <p className="text-sm font-bold text-foreground">{creator.followers}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">참여율</p>
                      <p className="text-sm font-bold text-foreground">{creator.engagement}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">단가</p>
                      <p className="text-sm font-bold text-foreground">{creator.avgPrice}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">매칭</p>
                      <p className="text-sm font-bold text-[#00e5cc]">{creator.matchScore}%</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {creator.tags.map((tag) => {
                      const config = tagConfig[tag];
                      return (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${config.color}`}
                        >
                          <config.icon className="w-3 h-3" />
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </Link>
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <div className="rounded-2xl border bg-card border-border p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-1">검색 결과가 없습니다</p>
                <p className="text-sm text-muted-foreground">다른 조건으로 검색해 보세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
