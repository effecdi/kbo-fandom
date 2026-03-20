import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  MapPin,
  FileText,
  Users,
  Clock,
  Award,
  TrendingUp,
  PartyPopper,
  Heart,
  Lightbulb,
  Send,
  Search,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

// 매칭 상태 타입
type MatchStatus = "not_applied" | "pending" | "matched" | "rejected";

export function CreatorCampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // 예시: 실제로는 API에서 가져올 데이터
  const [matchStatus, setMatchStatus] = useState<MatchStatus>("matched"); // "not_applied" | "pending" | "matched" | "rejected"

  const campaign = {
    id: 1,
    title: "2024 봄 축제 홍보 캠페인",
    company: "서울시청",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
    type: "지역행사",
    budget: "4,500,000 - 6,000,000원",
    deadline: "2024-03-25",
    applicants: 12,
    deliverables: "인스타툰 10편 (각 10컷)",
    description: "지역 봄 축제를 알리고 가족 단위 방문객을 유도하기 위한 인스타툰 제작 프로젝트입니다. 따뜻하고 친근한 톤으로 축제의 다양한 프로그램과 볼거리를 소개합니다.",
    requirements: [
      "가족 친화적 콘텐츠",
      "지역 특색 반영",
      "주요 프로그램 강조",
      "교통 및 편의시설 안내 포함",
    ],
    targetAudience: "20-40대 지역 주민 및 가족",
    location: "서울",
    postedDate: "2024-03-01",
    startDate: "2024-03-15",
    endDate: "2024-03-31",
    companyInfo: {
      name: "서울시청",
      category: "관공서",
      description: "서울특별시 문화관광국에서 진행하는 공식 프로젝트입니다.",
      completedCampaigns: 45,
      rating: 4.8,
    },
  };

  // 매칭 성공 화면
  if (matchStatus === "matched") {
    return (
      <DashboardLayout userType="creator">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/creator/campaigns")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            캠페인 목록으로
          </Button>

          {/* Success Card */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl border-2 border-green-300 p-12 text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-black text-foreground mb-4">
              🎉 축하합니다!
            </h1>
            <p className="text-xl font-semibold text-foreground mb-2">
              <span className="text-green-600">{campaign.company}</span>와의 협업이 확정되었습니다
            </p>
            <p className="text-muted-foreground mb-8">
              "{campaign.title}" 캠페인 작가로 선정되셨습니다
            </p>

            {/* Campaign Info Summary */}
            <div className="bg-card rounded-2xl p-6 mb-8 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={campaign.companyLogo}
                  alt={campaign.company}
                  className="w-16 h-16 rounded-xl object-cover border border-border"
                />
                <div className="text-left flex-1">
                  <h3 className="font-black text-lg text-foreground mb-1">
                    {campaign.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{campaign.company}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="font-semibold">예산</span>
                  </div>
                  <div className="text-sm font-bold text-purple-900">
                    {campaign.budget.split("-")[0].trim()}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-semibold">시작일</span>
                  </div>
                  <div className="text-sm font-bold text-blue-900">
                    {campaign.startDate}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                    <FileText className="w-3 h-3" />
                    <span className="font-semibold">결과물</span>
                  </div>
                  <div className="text-sm font-bold text-green-900">
                    10편
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-card rounded-2xl p-6 border border-green-200 dark:border-green-800 text-left mb-8">
              <h3 className="font-black text-lg text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                다음 단계
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">담당자 연락 대기</p>
                    <p className="text-sm text-muted-foreground">기업 담당자가 곧 연락드릴 예정입니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">계약 조건 협의</p>
                    <p className="text-sm text-muted-foreground">예산, 일정, 결과물 세부 사항을 확정합니다</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">프로젝트 시작</p>
                    <p className="text-sm text-muted-foreground">계약 완료 후 콘텐츠 제작을 시작합니다</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                onClick={() => navigate("/creator/proposals")}
              >
                광고 제안함으로 이동
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/creator/campaigns")}
              >
                다른 캠페인 보기
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 매칭 실패 화면
  if (matchStatus === "rejected") {
    return (
      <DashboardLayout userType="creator">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/creator/campaigns")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            캠페인 목록으로
          </Button>

          {/* Rejection Card */}
          <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-3xl border-2 border-border p-12 text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-black text-foreground mb-4">
              아쉽게도...
            </h1>
            <p className="text-xl font-semibold text-foreground mb-2">
              "{campaign.title}" 캠페인과의 협업은 이번에 진행되지 않게 되었습니다
            </p>
            <p className="text-muted-foreground mb-8">
              다른 멋진 작가가 선정되었습니다. 다음 기회에 꼭 함께하길 바랍니다! 💪
            </p>

            {/* Campaign Info Summary */}
            <div className="bg-card rounded-2xl p-6 mb-8 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={campaign.companyLogo}
                  alt={campaign.company}
                  className="w-16 h-16 rounded-xl object-cover border border-border opacity-50"
                />
                <div className="text-left flex-1">
                  <h3 className="font-black text-lg text-foreground mb-1">
                    {campaign.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{campaign.company}</span>
                  </div>
                </div>
                <Badge className="bg-muted text-foreground border-border">
                  선정 완료
                </Badge>
              </div>
            </div>

            {/* Encouragement */}
            <div className="rounded-2xl p-6 border border-purple-200 dark:border-purple-800 text-left mb-8">
              <h3 className="font-black text-lg text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                포기하지 마세요!
              </h3>
              <div className="space-y-3 text-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">💡</span>
                  <span>이번 경험을 바탕으로 다음 지원서를 더 잘 준비할 수 있습니다</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">🎯</span>
                  <span>매일 새로운 캠페인이 올라옵니다 - 기회는 계속됩니다</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">⭐</span>
                  <span>포트폴리오를 강화하고 더 많은 기업의 관심을 받으세요</span>
                </p>
              </div>
            </div>

            {/* Recommended Campaigns */}
            <div className="bg-card rounded-2xl p-6 border border-border text-left mb-8">
              <h3 className="font-black text-lg text-foreground mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                추천 캠페인
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                작가님의 스타일과 잘 맞는 다른 캠페인들을 확인해보세요
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=50&h=50&fit=crop"
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">에너지 절약 정책 홍보</p>
                    <p className="text-xs text-muted-foreground">환경부 · 8,000,000원</p>
                  </div>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">모집중</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=50&h=50&fit=crop"
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">청년 창업 지원 안내</p>
                    <p className="text-xs text-muted-foreground">중소벤처기업부 · 6,000,000원</p>
                  </div>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">모집중</Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                onClick={() => navigate("/creator/campaigns")}
              >
                <Search className="w-5 h-5 mr-2" />
                다른 캠페인 찾기
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/creator/media-kit")}
              >
                미디어키트 업데이트
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 지원 대기 중 화면
  if (matchStatus === "pending") {
    return (
      <DashboardLayout userType="creator">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/creator/campaigns")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            캠페인 목록으로
          </Button>

          {/* Pending Card */}
          <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl border-2 border-yellow-300 p-12 text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-black text-foreground mb-4">
              ⏳ 검토 중입니다
            </h1>
            <p className="text-xl font-semibold text-foreground mb-2">
              지원서를 제출하셨습니다
            </p>
            <p className="text-muted-foreground mb-8">
              {campaign.company}에서 지원자를 검토하고 있습니다. 결과를 기다려주세요!
            </p>

            {/* Campaign Info */}
            <div className="bg-card rounded-2xl p-6 mb-8 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={campaign.companyLogo}
                  alt={campaign.company}
                  className="w-16 h-16 rounded-xl object-cover border border-border"
                />
                <div className="text-left flex-1">
                  <h3 className="font-black text-lg text-foreground mb-1">
                    {campaign.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{campaign.company}</span>
                  </div>
                </div>
                <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300">
                  검토중
                </Badge>
              </div>
            </div>

            {/* Status Info */}
            <div className="bg-card rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800 text-left mb-8">
              <h3 className="font-black text-lg text-foreground mb-4">현재 상태</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-foreground">지원서 제출 완료</span>
                  </div>
                  <span className="text-sm text-muted-foreground">2024-03-08</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
                    <span className="font-semibold text-foreground">선정 심사 중</span>
                  </div>
                  <span className="text-sm text-muted-foreground">진행중</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border opacity-50">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">최종 선정 결과</span>
                  </div>
                  <span className="text-sm text-muted-foreground">대기중</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 text-left mb-8">
              <h3 className="font-black text-lg text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                기다리는 동안...
              </h3>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>포트폴리오를 업데이트하여 경쟁력을 높여보세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>다른 캠페인에도 지원하여 기회를 넓혀보세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>알림을 켜두면 선정 결과를 빠르게 확인할 수 있습니다</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                onClick={() => navigate("/creator/proposals")}
              >
                제안함에서 확인하기
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/creator/campaigns")}
              >
                다른 캠페인 보기
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // 기본 상세 보기 (아직 지원 안 함)
  return (
    <DashboardLayout userType="creator">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/creator/campaigns")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          캠페인 목록으로
        </Button>

        {/* Campaign Header */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <img
              src={campaign.companyLogo}
              alt={campaign.company}
              className="w-20 h-20 rounded-xl object-cover border border-border flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-black text-foreground mb-2">
                    {campaign.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {campaign.company}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {campaign.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      게시일: {campaign.postedDate}
                    </span>
                  </div>
                </div>
                <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {campaign.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-semibold">예산</span>
              </div>
              <p className="text-sm font-bold text-purple-900">{campaign.budget}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-semibold">마감일</span>
              </div>
              <p className="text-sm font-bold text-blue-900">{campaign.deadline}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold">지원자</span>
              </div>
              <p className="text-sm font-bold text-green-900">{campaign.applicants}명</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-semibold">결과물</span>
              </div>
              <p className="text-sm font-bold text-yellow-900">10편</p>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-black text-foreground mb-4">캠페인 소개</h2>
              <p className="text-foreground leading-relaxed">{campaign.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-black text-foreground mb-4">요구사항</h2>
              <div className="space-y-2">
                {campaign.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-black text-foreground mb-4">제공 결과물</h2>
              <div className="rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="font-semibold text-foreground">{campaign.deliverables}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-black text-foreground mb-4">기업 정보</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">기관명</p>
                  <p className="font-semibold text-foreground">{campaign.companyInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">분류</p>
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {campaign.companyInfo.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">완료 캠페인</p>
                  <p className="font-semibold text-foreground">{campaign.companyInfo.completedCampaigns}건</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">평점</p>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{campaign.companyInfo.rating}</span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-black text-foreground mb-4">일정</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">시작 예정</p>
                  <p className="font-semibold text-foreground">{campaign.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">종료 예정</p>
                  <p className="font-semibold text-foreground">{campaign.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">지원 마감</p>
                  <p className="font-semibold text-red-600">{campaign.deadline}</p>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Send className="w-5 h-5 mr-2" />
              지원하기
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
