import { Link } from "react-router";
import {
  Sparkles,
  Target,
  Users,
  ArrowRight,
  Eye,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Palette,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function BusinessDashboardPage() {
  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">
          안녕하세요, 담당자님! 👋
        </h1>
        <p className="text-muted-foreground">
          브랜드/공공 마스코트 관리와 작가 협업을 시작하세요
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-2xl font-black text-foreground">5</span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">보유 마스코트</p>
          <p className="text-xs text-muted-foreground/70 mt-1">승인됨 3 · 검토중 2</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-2xl font-black text-foreground">2</span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">승인 대기 중</p>
          <p className="text-xs text-muted-foreground/70 mt-1">내부 검토 필요</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-black text-foreground">3</span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">진행 중 캠페인</p>
          <p className="text-xs text-muted-foreground/70 mt-1">활발히 진행 중</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-black text-foreground">12</span>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">비교 중 작가</p>
          <p className="text-xs text-muted-foreground/70 mt-1">협업 검토 중</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-black text-foreground mb-6">빠른 시작</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/create">
                <button className="w-full p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-indigo-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">새 마스코트 만들기</h3>
                  <p className="text-sm text-muted-foreground">AI로 1분만에 생성</p>
                </button>
              </Link>

              <Link to="/story">
                <button className="w-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-purple-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">콘텐츠 제작하기</h3>
                  <p className="text-sm text-muted-foreground">스토리 에디터로 제작</p>
                </button>
              </Link>

              <Link to="/ad-match">
                <button className="w-full p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-blue-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">새 캠페인 만들기</h3>
                  <p className="text-sm text-muted-foreground">작가 협업 시작</p>
                </button>
              </Link>

              <Link to="/feed">
                <button className="w-full p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-xl hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-green-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">작가 탐색하기</h3>
                  <p className="text-sm text-muted-foreground">최적의 작가 찾기</p>
                </button>
              </Link>
            </div>
          </div>

          {/* Brand Assets */}
          <div className="bg-card rounded-2xl p-6 border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground">브랜드 자산</h2>
              <Button variant="ghost" size="sm">
                전체 보기 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "메인 마스코트", bg: "from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50", iconColor: "text-purple-600 dark:text-purple-400" },
                { name: "서브 캐릭터", bg: "from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50", iconColor: "text-blue-600 dark:text-blue-400" },
                { name: "이벤트용", bg: "from-pink-100 to-pink-200 dark:from-pink-900/50 dark:to-pink-800/50", iconColor: "text-pink-600 dark:text-pink-400" },
              ].map((asset, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <div className={`aspect-square bg-gradient-to-br ${asset.bg} rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all`}>
                    <Sparkles className={`w-12 h-12 ${asset.iconColor}`} />
                  </div>
                  <p className="text-sm font-semibold text-foreground mt-2 text-center">{asset.name}</p>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-background rounded-lg shadow-lg">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="bg-card rounded-2xl p-6 border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground">진행 중인 캠페인</h2>
              <Button variant="ghost" size="sm">
                전체 보기 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { title: "신제품 런칭 캠페인", status: "진행 중", creators: 3, date: "2025.03.31", color: "blue" },
                { title: "브랜드 인지도 향상", status: "제안 중", creators: 5, date: "2025.03.15", color: "yellow" },
                { title: "시즌 프로모션", status: "완료", creators: 2, date: "2025.02.28", color: "green" },
              ].map((campaign, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 rounded-lg flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground">작가 {campaign.creators}명 · 마감 {campaign.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    campaign.color === "green" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                    campaign.color === "yellow" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                  }`}>
                    {campaign.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Recommended Creators */}
          <div className="bg-card rounded-2xl p-6 border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground">추천 작가</h2>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">TODAY</span>
            </div>
            <div className="space-y-4">
              {[
                { name: "작가A", genre: "일상툰", match: 95 },
                { name: "작가B", genre: "정보툰", match: 92 },
                { name: "작가C", genre: "개그툰", match: 88 },
              ].map((creator, index) => (
                <div key={index} className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-sm mb-1">{creator.name}</h3>
                      <p className="text-xs text-muted-foreground">{creator.genre} 전문</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-foreground">{creator.match}%</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                    미디어키트 보기
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              더 많은 작가 보기 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Proposal Status */}
          <div className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-black text-foreground mb-6">제안 현황</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">답변 대기</p>
                    <p className="text-xs text-muted-foreground">7건</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">수락됨</p>
                    <p className="text-xs text-muted-foreground">4건</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-200 dark:bg-yellow-800 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">협의 중</p>
                    <p className="text-xs text-muted-foreground">2건</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Brand Profile */}
          <div className="bg-card rounded-2xl p-6 border">
            <h2 className="text-xl font-black text-foreground mb-6">브랜드 프로필</h2>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-muted-foreground">완성도</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">90%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-foreground">기본 정보 등록</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-foreground">브랜드 가이드 등록</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-foreground">담당자 정보 보완</span>
              </div>
            </div>
            <Button className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              프로필 수정
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
