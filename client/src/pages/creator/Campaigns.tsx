import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Search,
  Filter,
  DollarSign,
  Calendar,
  Building2,
  Users,
  Target,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Eye,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";

export function CreatorCampaigns() {
  const navigate = useNavigate();

  const campaigns = [
    {
      id: 1,
      title: "2024 봄 축제 홍보 캠페인",
      company: "서울시청",
      companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      type: "지역행사",
      budget: "4,500,000 - 6,000,000원",
      deadline: "2024-03-25",
      applicants: 12,
      deliverables: "인스타툰 10편",
      description: "지역 봄 축제를 알리고 가족 단위 방문객을 유도하기 위한 인스타툰 제작 프로젝트입니다.",
      requirements: ["가족 친화적 콘텐츠", "지역 특색 반영", "주요 프로그램 강조"],
      location: "서울",
      postedDate: "2024-03-01",
      isNew: true,
    },
    {
      id: 2,
      title: "에너지 절약 정책 홍보",
      company: "환경부",
      companyLogo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
      type: "정책홍보",
      budget: "8,000,000 - 10,000,000원",
      deadline: "2024-04-15",
      applicants: 8,
      deliverables: "인스타툰 15편 + 카드뉴스 5개",
      description: "국민의 에너지 절약 실천을 유도하기 위한 공익 캠페인입니다.",
      requirements: ["공공 캠페인 경험", "정책 이해도", "명확한 정보 전달"],
      location: "전국",
      postedDate: "2024-03-03",
      isNew: true,
    },
    {
      id: 3,
      title: "청년 창업 지원 안내",
      company: "중소벤처기업부",
      companyLogo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop",
      type: "공공캠페인",
      budget: "6,000,000 - 8,000,000원",
      deadline: "2024-04-30",
      applicants: 15,
      deliverables: "정보툰 12편",
      description: "청년 창업 지원 정책을 쉽고 재미있게 설명하는 콘텐츠입니다.",
      requirements: ["청년 타겟 콘텐츠 경험", "정보 전달력", "공감 스토리텔링"],
      location: "전국",
      postedDate: "2024-03-05",
      isNew: false,
    },
    {
      id: 4,
      title: "관광명소 소개 시리즈",
      company: "관광공사",
      companyLogo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop",
      type: "관광홍보",
      budget: "7,000,000 - 9,000,000원",
      deadline: "2024-05-15",
      applicants: 10,
      deliverables: "인스타툰 20편",
      description: "숨은 관광명소를 소개하여 지역 관광 활성화를 도모합니다.",
      requirements: ["여행 콘텐츠 경험", "감성적 스토리텔링", "지역 이해도"],
      location: "전국",
      postedDate: "2024-03-07",
      isNew: false,
    },
    {
      id: 5,
      title: "건강한 식습관 캠페인",
      company: "식품의약품안전처",
      companyLogo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop",
      type: "공익캠페인",
      budget: "5,000,000 - 7,000,000원",
      deadline: "2024-04-20",
      applicants: 6,
      deliverables: "인스타툰 10편",
      description: "올바른 식습관과 영양 정보를 전달하는 교육 콘텐츠입니다.",
      requirements: ["건강 콘텐츠 경험", "교육적 접근", "공감 스토리텔링"],
      location: "전국",
      postedDate: "2024-03-09",
      isNew: true,
    },
    {
      id: 6,
      title: "교통 안전 수칙 홍보",
      company: "경찰청",
      companyLogo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
      type: "안전캠페인",
      budget: "4,000,000 - 6,000,000원",
      deadline: "2024-04-10",
      applicants: 9,
      deliverables: "인스타툰 8편",
      description: "교통 안전 의식을 높이고 사고를 예방하기 위한 캠페인입니다.",
      requirements: ["안전 콘텐츠 경험", "명확한 정보 전달", "공감 유도"],
      location: "전국",
      postedDate: "2024-03-02",
      isNew: false,
    },
  ];

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            캠페인 찾기 🔍
          </h1>
          <p className="text-muted-foreground">
            관심있는 캠페인에 지원하고 협업 기회를 얻으세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-foreground">
                {campaigns.length}
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">모집중인 캠페인</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-black text-foreground">
                {campaigns.filter(c => c.isNew).length}
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">신규 캠페인</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-foreground">
                {new Set(campaigns.map(c => c.company)).size}
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">참여 기관</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-black text-foreground">HOT</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">인기 캠페인</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border border-border mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="캠페인 검색..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={campaign.companyLogo}
                    alt={campaign.company}
                    className="w-16 h-16 rounded-xl object-cover border border-border flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-foreground mb-1 group-hover:text-purple-600 transition-colors">
                          {campaign.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 className="w-3 h-3" />
                            {campaign.company}
                          </span>
                        </div>
                      </div>
                      {campaign.isNew && (
                        <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        {campaign.type}
                      </Badge>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {campaign.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {campaign.postedDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-foreground mb-4 line-clamp-2">
                  {campaign.description}
                </p>

                {/* Requirements */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">요구사항</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-muted text-foreground px-2 py-1 rounded-full"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="font-semibold">예산</span>
                    </div>
                    <div className="text-xs font-bold text-purple-900">
                      {campaign.budget.split("-")[0].trim()}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span className="font-semibold">마감일</span>
                    </div>
                    <div className="text-xs font-bold text-blue-900">
                      {campaign.deadline}
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                      <Users className="w-3 h-3" />
                      <span className="font-semibold">지원자</span>
                    </div>
                    <div className="text-xs font-bold text-green-900">
                      {campaign.applicants}명
                    </div>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="text-muted-foreground">📦 결과물:</span>
                  <span className="font-semibold text-foreground">
                    {campaign.deliverables}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/creator/campaigns/${campaign.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    상세 보기
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    onClick={() => navigate(`/creator/campaigns/${campaign.id}`)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    지원하기
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            더 많은 캠페인 보기
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}