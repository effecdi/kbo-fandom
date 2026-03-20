import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Star,
  Users,
  TrendingUp,
  Instagram,
  MessageSquare,
  Heart,
  Send,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Eye,
  ThumbsUp,
  Sparkles,
  FileText,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router";

export function CreatorDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const creator = {
    name: "작가A",
    genre: ["일상툰", "유머툰"],
    description: "소소한 일상을 재미있게 풀어내는 작가입니다. 공감 가는 스토리로 많은 팔로워들의 사랑을 받고 있으며, 브랜드 협업 경험이 풍부합니다.",
    targetAudience: "20-30대 여성",
    style: ["따뜻한", "유머러스", "일상적"],
    followers: "12.5K",
    engagementRate: "8.2%",
    responseRate: "95%",
    avgResponseTime: "2시간",
    avgPrice: "₩500,000",
    matchScore: 95,
    portfolio: 48,
    activeProjects: 3,
    completedProjects: 25,
    tags: ["빠른 응답", "검증된 작가", "협업 경험 풍부"],
    instagram: "@creator_a",
    collabCategories: ["식품", "뷰티", "라이프스타일", "IT"],
    achievements: [
      "월간 조회수 100만+ 달성",
      "브랜드 협업 25건 이상",
      "평균 만족도 4.8/5.0",
    ],
  };

  const portfolioItems = [
    { title: "일상툰 #12", views: "15K", likes: "2.3K", date: "2024.03.01" },
    { title: "브랜드 협업 - ABC", views: "22K", likes: "3.1K", date: "2024.02.28" },
    { title: "공감툰 시리즈", views: "18K", likes: "2.8K", date: "2024.02.25" },
    { title: "리뷰툰 - 제품A", views: "12K", likes: "1.9K", date: "2024.02.20" },
  ];

  return (
    <DashboardLayout userType="business">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/business/creators")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">작가 목록으로</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="relative bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 p-8">
                <div className="absolute top-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 fill-white" />
                  매칭 {creator.matchScore}%
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-black text-foreground mb-3">
                      {creator.name}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {creator.genre.map((g) => (
                        <span
                          key={g}
                          className="px-3 py-1 bg-white text-indigo-700 rounded-full text-sm font-semibold"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-foreground">
                        <Instagram className="w-4 h-4" />
                        {creator.instagram}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">
                        타겟: {creator.targetAudience}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 p-6 bg-muted">
                <div className="text-center">
                  <p className="text-2xl font-black text-foreground mb-1">
                    {creator.followers}
                  </p>
                  <p className="text-xs text-muted-foreground">팔로워</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-foreground mb-1">
                    {creator.engagementRate}
                  </p>
                  <p className="text-xs text-muted-foreground">참여율</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-foreground mb-1">
                    {creator.completedProjects}
                  </p>
                  <p className="text-xs text-muted-foreground">완료 협업</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-foreground mb-1">
                    {creator.responseRate}
                  </p>
                  <p className="text-xs text-muted-foreground">응답률</p>
                </div>
              </div>
            </div>

            {/* Matching Reason */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-6 border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-black text-foreground">
                  추천 이유
                </h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-foreground">
                    귀하의 타겟층(20-30대 여성)과 정확히 일치합니다
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-foreground">
                    유사 카테고리 협업 경험 15건 이상 보유
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-foreground">
                    평균 응답 시간 2시간으로 빠른 커뮤니케이션 가능
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-foreground">
                    높은 참여율(8.2%)로 효과적인 도달 예상
                  </span>
                </li>
              </ul>
            </div>

            {/* About */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-black text-foreground mb-4">
                작가 소개
              </h2>
              <p className="text-foreground leading-relaxed mb-6">
                {creator.description}
              </p>

              {/* Style Tags */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-foreground mb-3">
                  콘텐츠 스타일
                </h3>
                <div className="flex flex-wrap gap-2">
                  {creator.style.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Collab Categories */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">
                  협업 가능 분야
                </h3>
                <div className="flex flex-wrap gap-2">
                  {creator.collabCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-foreground">
                  대표 포트폴리오
                </h2>
                <span className="text-sm text-muted-foreground">
                  전체 {creator.portfolio}개
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {portfolioItems.map((item, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-purple-300" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <p className="text-white font-bold">{item.title}</p>
                      <div className="flex items-center gap-4 text-white text-sm">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {item.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-xl font-black text-foreground mb-4">
                주요 성과
              </h2>
              <div className="space-y-3">
                {creator.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-yellow-700 fill-yellow-700" />
                    </div>
                    <span className="text-foreground font-semibold">
                      {achievement}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Action Panel */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    평균 단가
                  </span>
                  <span className="text-2xl font-black text-foreground">
                    {creator.avgPrice}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  프로젝트 규모에 따라 협의 가능
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                  onClick={() => navigate("/business/proposal/new")}
                >
                  <Send className="w-5 h-5 mr-2" />
                  제안 보내기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  비교함에 추가
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  문의하기
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-bold text-foreground mb-4">빠른 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">응답률</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {creator.responseRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">평균 응답 시간</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      {creator.avgResponseTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">진행 중 프로젝트</span>
                    <span className="text-sm font-bold text-foreground">
                      {creator.activeProjects}건
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">완료 프로젝트</span>
                    <span className="text-sm font-bold text-foreground">
                      {creator.completedProjects}건
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-bold text-foreground mb-4">검증 정보</h3>
              <div className="space-y-2">
                {creator.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-xl"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800">
              <h3 className="font-bold text-foreground mb-4">활동 지표</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">참여율</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {creator.engagementRate}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full"
                      style={{ width: "82%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">응답률</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {creator.responseRate}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full"
                      style={{ width: "95%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">매칭 점수</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {creator.matchScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full"
                      style={{ width: "95%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
