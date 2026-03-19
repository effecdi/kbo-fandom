import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Sparkles,
  Target,
  Users,
  TrendingUp,
  FileText,
  MessageSquare,
  ArrowRight,
  Plus,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Palette,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function BusinessDashboard() {
  const { theme } = useTheme();

  return (
    <DashboardLayout userType="business">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-black mb-2 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          안녕하세요, 담당자님! 👋
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          브랜드/공공 마스코트 관리와 작가 협업을 시작하세요
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-2xl p-6 border hover:shadow-lg transition-shadow ${
          theme === "dark" 
            ? "bg-[#1a1a1a] border-gray-800" 
            : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <span className={`text-2xl font-black ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>5</span>
          </div>
          <p className={`text-sm font-semibold ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>보유 마스코트</p>
          <p className={`text-xs mt-1 ${
            theme === "dark" ? "text-gray-500" : "text-gray-500"
          }`}>승인됨 3 · 검토중 2</p>
        </div>

        <div className={`rounded-2xl p-6 border hover:shadow-lg transition-shadow ${
          theme === "dark" 
            ? "bg-[#1a1a1a] border-gray-800" 
            : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className={`text-2xl font-black ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>2</span>
          </div>
          <p className={`text-sm font-semibold ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>승인 대기 중</p>
          <p className={`text-xs mt-1 ${
            theme === "dark" ? "text-gray-500" : "text-gray-500"
          }`}>내부 검토 필요</p>
        </div>

        <div className={`rounded-2xl p-6 border hover:shadow-lg transition-shadow ${
          theme === "dark" 
            ? "bg-[#1a1a1a] border-gray-800" 
            : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-2xl font-black ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>3</span>
          </div>
          <p className={`text-sm font-semibold ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>진행 중 캠페인</p>
          <p className={`text-xs mt-1 ${
            theme === "dark" ? "text-gray-500" : "text-gray-500"
          }`}>활발히 진행 중</p>
        </div>

        <div className={`rounded-2xl p-6 border hover:shadow-lg transition-shadow ${
          theme === "dark" 
            ? "bg-[#1a1a1a] border-gray-800" 
            : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className={`text-2xl font-black ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>12</span>
          </div>
          <p className={`text-sm font-semibold ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>비교 중 작가</p>
          <p className={`text-xs mt-1 ${
            theme === "dark" ? "text-gray-500" : "text-gray-500"
          }`}>협업 검토 중</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className={`rounded-2xl p-6 border ${
            theme === "dark" 
              ? "bg-[#1a1a1a] border-gray-800" 
              : "bg-white border-gray-200"
          }`}>
            <h2 className={`text-xl font-black mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              빠른 시작
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button className={`p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent ${
                theme === "dark"
                  ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 hover:border-blue-600"
                  : "bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-300"
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  새 마스코트 만들기
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  AI로 1분만에 생성
                </p>
              </button>

              <button className={`p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent ${
                theme === "dark"
                  ? "bg-gradient-to-br from-teal-900/30 to-cyan-900/30 hover:border-teal-600"
                  : "bg-gradient-to-br from-teal-50 to-cyan-50 hover:border-teal-300"
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] rounded-xl flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  콘텐츠 제작하기
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  직접 만들어보기
                </p>
              </button>

              <button className={`p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent ${
                theme === "dark"
                  ? "bg-gradient-to-br from-purple-900/30 to-pink-900/30 hover:border-purple-600"
                  : "bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300"
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  새 캠페인 만들기
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  작가 협업 시작
                </p>
              </button>

              <button className={`p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent ${
                theme === "dark"
                  ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 hover:border-green-600"
                  : "bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300"
              }`}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  작가 탐색하기
                </h3>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  최적의 작가 찾기
                </p>
              </button>
            </div>
          </div>

          {/* Brand Assets */}
          <div className={`rounded-2xl p-6 border ${
            theme === "dark" 
              ? "bg-[#1a1a1a] border-gray-800" 
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-black ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                브랜드 자산
              </h2>
              <Button variant="ghost" size="sm">
                전체 보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "메인 마스코트", color: "purple" },
                { name: "서브 캐릭터", color: "blue" },
                { name: "이벤트용", color: "pink" },
              ].map((asset, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                >
                  <div className={`aspect-square bg-gradient-to-br from-${asset.color}-100 to-${asset.color}-200 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all`}>
                    <Sparkles className={`w-12 h-12 text-${asset.color}-600`} />
                  </div>
                  <p className={`text-sm font-semibold mt-2 text-center ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    {asset.name}
                  </p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className={`p-2 rounded-lg shadow-lg ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    }`}>
                      <Eye className={`w-4 h-4 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className={`rounded-2xl p-6 border ${
            theme === "dark" 
              ? "bg-[#1a1a1a] border-gray-800" 
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-black ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                진행 중인 캠페인
              </h2>
              <Button variant="ghost" size="sm">
                전체 보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "신제품 런칭 캠페인",
                  status: "진행 중",
                  creators: 3,
                  date: "2024.12.31",
                  color: "blue",
                },
                {
                  title: "브랜드 인지도 향상",
                  status: "제안 중",
                  creators: 5,
                  date: "2024.12.15",
                  color: "yellow",
                },
                {
                  title: "시즌 프로모션",
                  status: "완료",
                  creators: 2,
                  date: "2024.11.30",
                  color: "green",
                },
              ].map((campaign, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                    theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    theme === "dark" 
                      ? "bg-gradient-to-br from-blue-900/50 to-indigo-900/50" 
                      : "bg-gradient-to-br from-blue-100 to-indigo-100"
                  }`}>
                    <Target className={`w-6 h-6 ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      작가 {campaign.creators}명 · 마감 {campaign.date}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      campaign.color === "green"
                        ? "bg-green-100 text-green-700"
                        : campaign.color === "yellow"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-8">
          {/* Recommended Creators */}
          <div className={`rounded-2xl p-6 border ${
            theme === "dark" 
              ? "bg-[#1a1a1a] border-gray-800" 
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-black ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                추천 작가
              </h2>
              <span className="text-xs font-semibold text-indigo-600">
                TODAY
              </span>
            </div>
            <div className="space-y-4">
              {[
                {
                  name: "작가A",
                  genre: "일상툰",
                  match: 95,
                },
                {
                  name: "작가B",
                  genre: "정보툰",
                  match: 92,
                },
                {
                  name: "작가C",
                  genre: "개그툰",
                  match: 88,
                },
              ].map((creator, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl transition-all cursor-pointer ${
                    theme === "dark"
                      ? "bg-indigo-900/20 hover:bg-indigo-900/30"
                      : "bg-indigo-50 hover:bg-indigo-100"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-sm mb-1 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {creator.name}
                      </h3>
                      <p className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {creator.genre} 전문
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className={`text-xs font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {creator.match}%
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                    미디어키트 보기
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              더 많은 작가 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Proposal Status */}
          <div className={`rounded-2xl p-6 border ${
            theme === "dark" 
              ? "bg-[#1a1a1a] border-gray-800" 
              : "bg-white border-gray-200"
          }`}>
            <h2 className={`text-xl font-black mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              제안 현황
            </h2>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-xl ${
                theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    theme === "dark" ? "bg-blue-800/50" : "bg-blue-200"
                  }`}>
                    <MessageSquare className={`w-5 h-5 ${
                      theme === "dark" ? "text-blue-300" : "text-blue-700"
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>답변 대기</p>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>7건</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className={`flex items-center justify-between p-4 rounded-xl ${
                theme === "dark" ? "bg-green-900/20" : "bg-green-50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    theme === "dark" ? "bg-green-800/50" : "bg-green-200"
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 ${
                      theme === "dark" ? "text-green-300" : "text-green-700"
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>수락됨</p>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>4건</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>

              <div className={`flex items-center justify-between p-4 rounded-xl ${
                theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    theme === "dark" ? "bg-yellow-800/50" : "bg-yellow-200"
                  }`}>
                    <Clock className={`w-5 h-5 ${
                      theme === "dark" ? "text-yellow-300" : "text-yellow-700"
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}>협의 중</p>
                    <p className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>2건</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Brand Profile */}
          <div className={`rounded-2xl p-6 border ${
            theme === "dark" 
              ? "bg-[#1a1a1a] border-gray-800" 
              : "bg-white border-gray-200"
          }`}>
            <h2 className={`text-xl font-black mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              브랜드 프로필
            </h2>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  완성도
                </span>
                <span className={`text-sm font-black ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}>90%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}>
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>기본 정보 등록</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>브랜드 가이드 등록</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>담당자 정보 보완</span>
              </div>
            </div>
            <Button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              프로필 수정
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}