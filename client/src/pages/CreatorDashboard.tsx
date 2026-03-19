import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Wand2,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function CreatorDashboard() {
  const { theme } = useTheme();

  return (
    <DashboardLayout userType="creator">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-black mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          안녕하세요, 작가님! 👋
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          오늘도 멋진 작품을 만들어볼까요?
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-2xl p-6 border hover:shadow-lg transition-shadow ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>12</span>
          </div>
          <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>작업물</p>
        </div>

        <div className={`rounded-2xl p-6 border hover:shadow-lg transition-shadow ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
            <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>3</span>
          </div>
          <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>신규 제안</p>
        </div>

        <div className={`rounded-2xl p-6 border hover:shadow-lg transition-shadow ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>2</span>
          </div>
          <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>진행 중 협업</p>
        </div>

        <div className={`rounded-2xl p-6 border hover:shadow-lg transition-shadow ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>₩1.2M</span>
          </div>
          <p className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>이번 달 수익</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className={`rounded-2xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-black mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              빠른 시작
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button className={`p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent ${theme === "dark" ? "bg-gradient-to-br from-teal-900/30 to-cyan-900/30 hover:border-teal-600" : "bg-gradient-to-br from-teal-50 to-cyan-50 hover:border-teal-300"}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] rounded-xl flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  새 캐릭터 만들기
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  AI로 1분만에 생성
                </p>
              </button>

              <button className={`p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent ${theme === "dark" ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 hover:border-blue-600" : "bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-300"}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  툰 작업 시작
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  스토리 에디터 열기
                </p>
              </button>

              <button className={`p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent ${theme === "dark" ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 hover:border-green-600" : "bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-300"}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  미디어키트 점검
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  완성도 85%
                </p>
              </button>

              <button className={`p-6 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent ${theme === "dark" ? "bg-gradient-to-br from-orange-900/30 to-amber-900/30 hover:border-orange-600" : "bg-gradient-to-br from-orange-50 to-amber-50 hover:border-orange-300"}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  배경 생성하기
                </h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  다양한 배경 만들기
                </p>
              </button>
            </div>
          </div>

          {/* Recent Projects */}
          <div className={`rounded-2xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                최근 작업물
              </h2>
              <Button variant="ghost" size="sm">
                전체 보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "일상툰 시리즈 #12",
                  status: "완료",
                  date: "2시간 전",
                  color: "green",
                },
                {
                  title: "캐릭터 '민지' 생성",
                  status: "초안",
                  date: "어제",
                  color: "yellow",
                },
                {
                  title: "광고 협업 - ABC 브랜드",
                  status: "진행 중",
                  date: "3일 전",
                  color: "blue",
                },
              ].map((project, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
                >
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-gradient-to-br from-teal-900/50 to-cyan-900/50" : "bg-gradient-to-br from-teal-100 to-cyan-100"}`}>
                    <FileText className={`w-6 h-6 ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500">{project.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.color === "green"
                        ? "bg-green-100 text-green-700"
                        : project.color === "yellow"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {project.status}
                  </span>
                  <button className={`p-2 rounded-lg ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                    <Edit className={`w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-8">
          {/* Proposal Summary */}
          <div className={`rounded-2xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                광고 제안
              </h2>
              <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                3
              </span>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${theme === "dark" ? "bg-pink-900/20 border-pink-800/50" : "bg-pink-50 border-pink-200"}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-pink-800/50" : "bg-pink-200"}`}>
                    <Users className={`w-5 h-5 ${theme === "dark" ? "text-pink-300" : "text-pink-700"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      XYZ 브랜드
                    </h3>
                    <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      신제품 런칭 캠페인
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${theme === "dark" ? "text-pink-300" : "text-pink-700"}`}>
                    예산: ₩500,000
                  </span>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white text-xs">
                    확인하기
                  </Button>
                </div>
              </div>

              <div className="text-center py-4">
                <Button variant="outline" className="w-full">
                  모든 제안 보기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Media Kit Health */}
          <div className={`rounded-2xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-black mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              미디어키트 상태
            </h2>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  완성도
                </span>
                <span className={`text-sm font-black ${theme === "dark" ? "text-teal-400" : "text-teal-600"}`}>85%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                <div className="h-full bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>프로필 사진 등록</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>대표 작품 등록</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>인스타 연동 필요</span>
              </div>
            </div>
            <Button className="w-full mt-6 bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white">
              미디어키트 수정
            </Button>
          </div>

          {/* Revenue Summary */}
          <div className={`rounded-2xl p-6 border ${theme === "dark" ? "bg-[#1a1a1a] border-gray-800" : "bg-white border-gray-200"}`}>
            <h2 className={`text-xl font-black mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              수익 요약
            </h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-green-900/20" : "bg-green-50"}`}>
                <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>이번 달 예상 수익</p>
                <p className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>₩1,200,000</p>
              </div>
              <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"}`}>
                <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>정산 예정 금액</p>
                <p className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>₩850,000</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6">
              상세 내역 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
