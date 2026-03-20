import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Users,
  Calendar,
  DollarSign,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Eye,
  Heart,
  TrendingUp,
  MessageSquare,
  Award,
  FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

export function CampaignDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState("applicants");

  const campaign = {
    id: 1,
    title: "2024 봄 축제 홍보 캠페인",
    type: "지역행사",
    status: "recruiting",
    description: "지역 봄 축제를 알리고 가족 단위 방문객을 유도하기 위한 인스타툰 제작 프로젝트입니다. 따뜻하고 친근한 톤으로 축제의 다양한 프로그램과 볼거리를 소개합니다.",
    budget: "5,000,000",
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    deadline: "2024-03-25",
    targetAudience: "20-40대 지역 주민 및 가족",
    deliverables: "인스타툰 10편 (각 10컷)",
    requirements: "- 가족 친화적 콘텐츠\n- 지역 특색 반영\n- 주요 프로그램 강조\n- 교통 및 편의시설 안내 포함",
    mascot: "브랜디",
    progress: 35,
    approvalStatus: "approved",
  };

  const applicants = [
    {
      id: 1,
      name: "작가 김민지",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      genre: "정보툰",
      followers: "125K",
      avgViews: "45K",
      rating: 4.9,
      completedProjects: 24,
      appliedDate: "2024-03-06",
      proposedBudget: "4,500,000",
      proposedTimeline: "3주",
      coverLetter: "관공서 정책 홍보 경험이 풍부하며, 지역 행사 홍보 프로젝트를 5건 이상 진행했습니다. 주민들이 쉽게 이해하고 공감할 수 있는 콘텐츠를 만들겠습니다.",
      portfolio: ["봄꽃축제 홍보툰", "지역문화재 안내툰", "관광명소 소개"],
      status: "pending",
    },
    {
      id: 2,
      name: "작가 이서준",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      genre: "일상툰",
      followers: "89K",
      avgViews: "32K",
      rating: 4.8,
      completedProjects: 18,
      appliedDate: "2024-03-07",
      proposedBudget: "4,200,000",
      proposedTimeline: "4주",
      coverLetter: "따뜻하고 공감 가는 스토리텔링으로 가족들이 함께 즐길 수 있는 콘텐츠를 제작합니다. 지역 축제 경험이 많아 현장감 있는 작품을 만들 자신 있습니다.",
      portfolio: ["가을축제 인스타툰", "가족나들이 에세이툰", "지역맛집 소개"],
      status: "pending",
    },
    {
      id: 3,
      name: "작가 박지현",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      genre: "캠페인툰",
      followers: "156K",
      avgViews: "58K",
      rating: 5.0,
      completedProjects: 32,
      appliedDate: "2024-03-05",
      proposedBudget: "6,000,000",
      proposedTimeline: "2주",
      coverLetter: "대규모 공공 캠페인 전문 작가입니다. 관공서 협업 20개 이상 경험으로 빠르고 퀄리티 높은 작업을 보장합니다. 내부 검토 프로세스도 잘 이해하고 있습니다.",
      portfolio: ["문화축제 대형캠페인", "관광홍보 인스타툰", "정책홍보 시리즈"],
      status: "selected",
    },
    {
      id: 4,
      name: "작가 최유진",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
      genre: "교육툰",
      followers: "67K",
      avgViews: "28K",
      rating: 4.7,
      completedProjects: 15,
      appliedDate: "2024-03-08",
      proposedBudget: "3,800,000",
      proposedTimeline: "4주",
      coverLetter: "교육적이면서도 재미있는 콘텐츠 제작에 강점이 있습니다. 시민 대상 안내 콘텐츠 경험이 많아 정보 전달력이 뛰어납니다.",
      portfolio: ["시민안내 인포그래픽툰", "안전교육 콘텐츠", "생활정보 시리즈"],
      status: "rejected",
    },
  ];

  const selectedCreators = [
    {
      id: 3,
      name: "작가 박지현",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      role: "메인 작가",
      budget: "6,000,000",
      deliverables: "인스타툰 10편",
      status: "작업중",
      progress: 40,
    },
  ];

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: "검토중", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300", icon: Clock },
      selected: { label: "선정됨", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: CheckCircle },
      rejected: { label: "미선정", color: "bg-muted text-foreground", icon: XCircle },
    };
    return configs[status] || configs.pending;
  };

  return (
    <DashboardLayout userType="business">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/business/campaigns")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            캠페인 목록으로
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-foreground">
                  {campaign.title}
                </h1>
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300">
                  <Users className="w-3 h-3 mr-1" />
                  작가모집중
                </Badge>
                <Badge className="bg-green-600 text-white">승인완료</Badge>
              </div>
              <p className="text-muted-foreground mb-4">{campaign.description}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {campaign.type}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {campaign.startDate} ~ {campaign.endDate}
                </span>
                <span className="inline-flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  예산: {campaign.budget}원
                </span>
              </div>
            </div>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              캠페인 수정
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{applicants.length}</p>
            <p className="text-sm text-muted-foreground">총 지원자</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">
              {applicants.filter(a => a.status === "selected").length}
            </p>
            <p className="text-sm text-muted-foreground">선정됨</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">
              {applicants.filter(a => a.status === "pending").length}
            </p>
            <p className="text-sm text-muted-foreground">검토중</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">
              {campaign.deliverables}
            </p>
            <p className="text-sm text-muted-foreground">결과물</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <TrendingUp className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-black text-foreground">{campaign.progress}%</p>
            <p className="text-sm text-muted-foreground">진행률</p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="applicants">
              지원자 관리 ({applicants.length})
            </TabsTrigger>
            <TabsTrigger value="selected">
              선정된 작가 ({selectedCreators.length})
            </TabsTrigger>
            <TabsTrigger value="info">캠페인 정보</TabsTrigger>
          </TabsList>

          {/* Applicants Tab */}
          <TabsContent value="applicants" className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">지원자 검토 안내</p>
                  <p>
                    지원자의 포트폴리오와 제안서를 검토하여 선정해주세요. 
                    선정된 작가에게는 자동으로 알림이 전송됩니다.
                  </p>
                </div>
              </div>
            </div>

            {applicants.map((applicant) => {
              const statusConfig = getStatusBadge(applicant.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={applicant.id}
                  className="bg-card rounded-2xl border-2 border-border overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-6 mb-6">
                      {/* Profile */}
                      <img
                        src={applicant.image}
                        alt={applicant.name}
                        className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-black text-foreground">
                                {applicant.name}
                              </h3>
                              <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                {applicant.genre}
                              </Badge>
                              {applicant.rating >= 4.9 && (
                                <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                  <Award className="w-3 h-3 mr-1" />
                                  Top Rated
                                </Badge>
                              )}
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="inline-flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                {applicant.rating}
                              </span>
                              <span>팔로워 {applicant.followers}</span>
                              <span>완료 {applicant.completedProjects}건</span>
                              <span className="text-purple-600 font-semibold">
                                지원일: {applicant.appliedDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Proposal Details */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">제안 예산</div>
                            <div className="font-black text-foreground">
                              {applicant.proposedBudget}원
                            </div>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">예상 기간</div>
                            <div className="font-black text-foreground">
                              {applicant.proposedTimeline}
                            </div>
                          </div>
                          <div className="bg-muted rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">평균 조회수</div>
                            <div className="font-black text-foreground">
                              {applicant.avgViews}
                            </div>
                          </div>
                        </div>

                        {/* Cover Letter */}
                        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-bold text-purple-900 mb-2">
                            📝 지원 메시지
                          </h4>
                          <p className="text-sm text-purple-800 leading-relaxed">
                            {applicant.coverLetter}
                          </p>
                        </div>

                        {/* Portfolio */}
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-foreground mb-2">
                            포트폴리오
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {applicant.portfolio.map((item, idx) => (
                              <span
                                key={idx}
                                className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/business/creators/${applicant.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            프로필 상세보기
                          </Button>
                          {applicant.status === "pending" && (
                            <>
                              <Button className="bg-green-600 text-white hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                선정하기
                              </Button>
                              <Button variant="ghost" className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                불합격
                              </Button>
                            </>
                          )}
                          {applicant.status === "selected" && (
                            <Button className="bg-blue-600 text-white hover:bg-blue-700">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              협업 시작
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Selected Creators Tab */}
          <TabsContent value="selected" className="space-y-4">
            {selectedCreators.length > 0 ? (
              selectedCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <div className="flex items-start gap-6">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-black text-foreground mb-1">
                            {creator.name}
                          </h3>
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            {creator.role}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">작업 진행률</div>
                          <div className="text-2xl font-black text-green-600">
                            {creator.progress}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">계약 금액</div>
                          <div className="font-bold text-foreground">
                            {creator.budget}원
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">결과물</div>
                          <div className="font-bold text-foreground">
                            {creator.deliverables}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">상태</div>
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {creator.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">작업 진행률</span>
                          <span className="font-bold text-foreground">
                            {creator.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${creator.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          메시지 보내기
                        </Button>
                        <Button variant="outline">진행 상황 보기</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  아직 선정된 작가가 없습니다
                </h3>
                <p className="text-muted-foreground">
                  지원자를 검토하고 작가를 선정해주세요
                </p>
              </div>
            )}
          </TabsContent>

          {/* Campaign Info Tab */}
          <TabsContent value="info">
            <div className="bg-card rounded-2xl p-8 border border-border">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-foreground mb-2">캠페인 설명</h3>
                  <p className="text-foreground leading-relaxed">
                    {campaign.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-foreground mb-2">프로젝트 기간</h3>
                    <p className="text-foreground">
                      {campaign.startDate} ~ {campaign.endDate}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">지원 마감일</h3>
                    <p className="text-foreground">{campaign.deadline}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-foreground mb-2">예산</h3>
                  <p className="text-foreground">{campaign.budget}원</p>
                </div>

                <div>
                  <h3 className="font-bold text-foreground mb-2">타겟 대상</h3>
                  <p className="text-foreground">{campaign.targetAudience}</p>
                </div>

                <div>
                  <h3 className="font-bold text-foreground mb-2">결과물</h3>
                  <p className="text-foreground">{campaign.deliverables}</p>
                </div>

                <div>
                  <h3 className="font-bold text-foreground mb-2">요구사항</h3>
                  <pre className="text-foreground whitespace-pre-wrap font-sans">
                    {campaign.requirements}
                  </pre>
                </div>

                <div>
                  <h3 className="font-bold text-foreground mb-2">사용 마스코트</h3>
                  <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                    {campaign.mascot}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
