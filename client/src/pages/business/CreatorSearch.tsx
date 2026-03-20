import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Search,
  Filter,
  Star,
  Users,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Instagram,
  ChevronDown,
  Grid3x3,
  List as ListIcon,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

type ViewMode = "grid" | "list";

export function CreatorSearch() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const creators = [
    {
      id: 1,
      name: "작가A",
      genre: ["일상툰", "유머툰"],
      targetAudience: "20-30대 여성",
      followers: "12.5K",
      engagementRate: "8.2%",
      responseRate: "95%",
      avgPrice: "₩500,000",
      matchScore: 95,
      portfolio: 48,
      activeProjects: 3,
      tags: ["빠른 응답", "검증된 작가", "협업 경험 풍부"],
    },
    {
      id: 2,
      name: "작가B",
      genre: ["정보툰", "리뷰툰"],
      targetAudience: "30-40대 남녀",
      followers: "25.3K",
      engagementRate: "6.5%",
      responseRate: "88%",
      avgPrice: "₩800,000",
      matchScore: 92,
      portfolio: 62,
      activeProjects: 2,
      tags: ["검증된 작가", "협업 경험 풍부"],
    },
    {
      id: 3,
      name: "작가C",
      genre: ["개그툰", "패러디툰"],
      targetAudience: "20대 남녀",
      followers: "8.9K",
      engagementRate: "9.1%",
      responseRate: "92%",
      avgPrice: "₩400,000",
      matchScore: 88,
      portfolio: 35,
      activeProjects: 1,
      tags: ["빠른 응답", "신선한 스타일"],
    },
  ];

  const toggleCompare = (id: number) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(item => item !== id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, id]);
    }
  };

  return (
    <DashboardLayout userType="business">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              작가 탐색
            </h1>
            <p className="text-muted-foreground">
              {creators.length}명의 작가가 매칭되었습니다
            </p>
          </div>
          <Button
            onClick={() => navigate("/business/compare")}
            variant="outline"
            disabled={compareList.length === 0}
          >
            <Users className="w-4 h-4 mr-2" />
            비교함 ({compareList.length})
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="장르, 스타일, 타겟층으로 검색..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl hover:bg-muted transition-all">
                <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">정렬</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  showFilters
                    ? "bg-indigo-600 text-white"
                    : "bg-muted text-foreground hover:bg-muted"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="text-sm font-semibold">필터</span>
              </button>

              <div className="border-l border-border pl-3 flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left - Filters Panel */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                <h3 className="font-bold text-foreground mb-4">필터</h3>

                {/* Genre Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-foreground mb-2">
                    장르
                  </label>
                  <div className="space-y-2">
                    {["일상툰", "유머툰", "정보툰", "리뷰툰"].map((genre) => (
                      <label key={genre} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 border-border rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-foreground">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-foreground mb-2">
                    타겟층
                  </label>
                  <div className="space-y-2">
                    {["10대", "20대", "30대", "40대+"].map((age) => (
                      <label key={age} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 border-border rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-foreground">{age}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Followers Range */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-foreground mb-2">
                    팔로워 수
                  </label>
                  <select className="w-full px-3 py-2 bg-transparent border border-border rounded-lg text-sm">
                    <option>전체</option>
                    <option>1K - 5K</option>
                    <option>5K - 10K</option>
                    <option>10K - 50K</option>
                    <option>50K+</option>
                  </select>
                </div>

                {/* Budget Range */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-foreground mb-2">
                    예산 범위
                  </label>
                  <select className="w-full px-3 py-2 bg-transparent border border-border rounded-lg text-sm">
                    <option>전체</option>
                    <option>~₩500,000</option>
                    <option>₩500,000 - ₩1,000,000</option>
                    <option>₩1,000,000+</option>
                  </select>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  필터 초기화
                </Button>
              </div>
            </div>
          )}

          {/* Right - Creator List */}
          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creators.map((creator) => (
                  <div
                    key={creator.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Match Score Badge */}
                    <div className="relative bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 p-6">
                      <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />
                        {creator.matchScore}%
                      </div>
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground text-center mb-1">
                        {creator.name}
                      </h3>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {creator.genre.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-1 bg-white text-indigo-700 rounded-full text-xs font-semibold"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">타겟층</p>
                          <p className="text-sm font-bold text-foreground">
                            {creator.targetAudience}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">평균 단가</p>
                          <p className="text-sm font-bold text-foreground">
                            {creator.avgPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">팔로워</p>
                          <p className="text-sm font-bold text-foreground flex items-center gap-1">
                            <Instagram className="w-3 h-3" />
                            {creator.followers}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">참여율</p>
                          <p className="text-sm font-bold text-foreground">
                            {creator.engagementRate}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {creator.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/business/creators/${creator.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          상세보기
                        </Button>
                        <button
                          onClick={() => toggleCompare(creator.id)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            compareList.includes(creator.id)
                              ? "border-pink-600 bg-pink-50"
                              : "border-border hover:border-pink-300"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              compareList.includes(creator.id)
                                ? "text-pink-600 fill-pink-600"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "list" && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                        작가
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                        장르
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                        매칭점수
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                        팔로워
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                        평균단가
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-foreground">
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {creators.map((creator) => (
                      <tr
                        key={creator.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{creator.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {creator.targetAudience}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {creator.genre.map((g) => (
                              <span
                                key={g}
                                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-foreground">
                              {creator.matchScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground">
                            {creator.followers}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-foreground">
                            {creator.avgPrice}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/business/creators/${creator.id}`)}
                            >
                              상세보기
                            </Button>
                            <button
                              onClick={() => toggleCompare(creator.id)}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                compareList.includes(creator.id)
                                  ? "border-pink-600 bg-pink-50"
                                  : "border-border hover:border-pink-300"
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  compareList.includes(creator.id)
                                    ? "text-pink-600 fill-pink-600"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Compare Bar */}
        {compareList.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-card rounded-2xl shadow-2xl border border-border p-4 flex items-center gap-4 z-50">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-foreground">
                {compareList.length}명 선택됨
              </span>
            </div>
            <Button
              onClick={() => navigate("/business/compare")}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
            >
              비교하기
            </Button>
            <button
              onClick={() => setCompareList([])}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              초기화
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
