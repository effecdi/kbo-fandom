import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Clock,
  Star,
  Users,
  Edit,
  Trash2,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

type ViewMode = "grid" | "list";
type FilterType = "all" | "recent" | "frequent" | "collab" | "draft";

export function CharacterList() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const characters = [
    {
      id: 1,
      name: "민지",
      description: "20대 직장인 여성",
      mood: ["밝은", "귀여운"],
      usageCount: 45,
      lastUsed: "2시간 전",
      isCollab: true,
      status: "완성",
    },
    {
      id: 2,
      name: "토리",
      description: "파란색 곰돌이",
      mood: ["유머러스", "따뜻한"],
      usageCount: 32,
      lastUsed: "어제",
      isCollab: false,
      status: "완성",
    },
    {
      id: 3,
      name: "준호",
      description: "30대 직장인 남성",
      mood: ["진지한", "쿨한"],
      usageCount: 28,
      lastUsed: "3일 전",
      isCollab: true,
      status: "완성",
    },
    {
      id: 4,
      name: "미완성 캐릭터",
      description: "작업 중인 캐릭터",
      mood: ["밝은"],
      usageCount: 0,
      lastUsed: "5일 전",
      isCollab: false,
      status: "초안",
    },
  ];

  const filteredCharacters = characters.filter((char) => {
    if (searchQuery && !char.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter === "recent") return true;
    if (filter === "frequent") return char.usageCount > 30;
    if (filter === "collab") return char.isCollab;
    if (filter === "draft") return char.status === "초안";
    return true;
  });

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              내 캐릭터
            </h1>
            <p className="text-gray-600">
              총 {characters.length}개의 캐릭터
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/creator/character/new")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 캐릭터 만들기
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="캐릭터 이름 검색..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilter("recent")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === "recent"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                최근 생성
              </button>
              <button
                onClick={() => setFilter("frequent")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === "frequent"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Star className="w-4 h-4 inline mr-1" />
                자주 사용
              </button>
              <button
                onClick={() => setFilter("collab")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === "collab"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                협업 연결됨
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Characters Grid */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((char) => (
              <div
                key={char.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Character Image */}
                <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-purple-300" />
                  {char.isCollab && (
                    <div className="absolute top-3 right-3 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      협업중
                    </div>
                  )}
                  {char.status === "초안" && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      초안
                    </div>
                  )}
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-3 bg-white rounded-full hover:scale-110 transition-transform">
                      <Eye className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="p-3 bg-white rounded-full hover:scale-110 transition-transform">
                      <Edit className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="p-3 bg-white rounded-full hover:scale-110 transition-transform">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Character Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {char.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {char.description}
                  </p>
                  
                  {/* Mood Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {char.mood.map((m) => (
                      <span
                        key={m}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {char.usageCount}회 사용
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {char.lastUsed}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Characters List */}
        {viewMode === "list" && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    캐릭터
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    무드
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    사용 횟수
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    마지막 사용
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    상태
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCharacters.map((char) => (
                  <tr key={char.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{char.name}</p>
                          <p className="text-sm text-gray-600">{char.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {char.mood.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{char.usageCount}회</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{char.lastUsed}</span>
                    </td>
                    <td className="px-6 py-4">
                      {char.isCollab ? (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                          협업중
                        </span>
                      ) : char.status === "초안" ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                          초안
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          완성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredCharacters.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              다른 검색어나 필터를 시도해보세요
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
              }}
              variant="outline"
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
