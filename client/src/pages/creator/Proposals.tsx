import { DashboardLayout } from "@/components/DashboardLayout";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Building2,
  Eye,
  Filter,
  Search,
  AlertCircle,
  Target,
  FileText,
  Send,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router";

export function CreatorProposals() {
  const navigate = useNavigate();

  // 기업이 작가에게 보낸 제안
  const receivedProposals = [
    {
      id: 1,
      type: "direct_offer",
      campaignTitle: "브랜드 마스코트 콘텐츠 제작",
      companyName: "ABC 기업",
      companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
      status: "pending",
      receivedDate: "2024-03-11",
      budget: "3,000,000 - 4,000,000원",
      deadline: "2024-03-20",
      deliverables: "인스타툰 8편",
      message: "작가님의 따뜻한 그림체가 저희 브랜드 마스코트와 잘 어울릴 것 같아 제안드립니다. 협업하고 싶습니다!",
      projectType: "브랜드홍보",
    },
    {
      id: 2,
      type: "direct_offer",
      campaignTitle: "건강한 아침 루틴",
      companyName: "헬시라이프",
      companyLogo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop",
      status: "accepted",
      receivedDate: "2024-02-28",
      responseDate: "2024-03-01",
      budget: "5,000,000원",
      deadline: "2024-03-30",
      deliverables: "인스타툰 10편",
      message: "건강한 생활 습관을 주제로 공감 가는 콘텐츠를 만들어주세요. 작가님의 감성적인 스토리텔링이 마음에 들었습니다.",
      projectType: "브랜드협업",
      progress: 65,
    },
    {
      id: 3,
      type: "direct_offer",
      campaignTitle: "여행 준비 체크리스트",
      companyName: "트래블코리아",
      companyLogo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop",
      status: "rejected",
      receivedDate: "2024-03-05",
      responseDate: "2024-03-06",
      budget: "2,500,000 - 3,000,000원",
      deadline: "2024-03-15",
      deliverables: "인스타툰 6편",
      message: "여행 관련 인스타툰을 함께 만들어보고 싶습니다.",
      projectType: "브랜드협업",
      rejectionReason: "일정이 맞지 않아 진행하기 어려울 것 같습니다.",
    },
  ];

  // 작가가 캠페인에 지원한 것
  const appliedCampaigns = [
    {
      id: 1,
      type: "application",
      campaignTitle: "2024 봄 축제 홍보 캠페인",
      companyName: "서울시청",
      companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      status: "pending",
      appliedDate: "2024-03-06",
      budget: "4,500,000 - 6,000,000원",
      deadline: "2024-03-25",
      deliverables: "인스타툰 10편",
      myProposal: {
        budget: "4,500,000원",
        timeline: "3주",
        message: "관공서 정책 홍보 경험이 풍부하며, 지역 행사 홍보 프로젝트를 5건 이상 진행했습니다. 주민들이 쉽게 이해하고 공감할 수 있는 콘텐츠를 만들겠습니다.",
      },
      projectType: "지역행사",
      applicants: 12,
    },
    {
      id: 2,
      type: "application",
      campaignTitle: "에너지 절약 정책 홍보",
      companyName: "환경부",
      companyLogo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
      status: "selected",
      appliedDate: "2024-03-08",
      selectedDate: "2024-03-10",
      responseDate: "2024-03-10",
      budget: "8,000,000 - 10,000,000원",
      deadline: "2024-04-15",
      deliverables: "인스타툰 15편 + 카드뉴스 5개",
      myProposal: {
        budget: "8,000,000원",
        timeline: "4주",
        message: "공공 캠페인 경험이 풍부하고 평점도 높습니다. 관공서 협업에 익숙하며 검토·승인 프로세스를 잘 이해하고 있습니다.",
      },
      projectType: "정책홍보",
      applicants: 8,
      progress: 20,
    },
    {
      id: 3,
      type: "application",
      campaignTitle: "청년 창업 지원 안내",
      companyName: "중소벤처기업부",
      companyLogo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop",
      status: "rejected",
      appliedDate: "2024-03-11",
      rejectedDate: "2024-03-12",
      responseDate: "2024-03-12",
      budget: "6,000,000 - 8,000,000원",
      deadline: "2024-04-30",
      deliverables: "정보툰 12편",
      myProposal: {
        budget: "6,500,000원",
        timeline: "5주",
        message: "청년 대상 콘텐츠 제작 경험이 있으며 정보 전달력이 뛰어납니다.",
      },
      projectType: "공공캠페인",
      applicants: 15,
      rejectionReason: "다른 작가가 선정되었습니다.",
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: "응답 대기", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
      accepted: { label: "수락함", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle },
      rejected: { label: "거절함", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
      in_progress: { label: "진행중", color: "bg-blue-100 text-blue-700 border-blue-300", icon: FileText },
      selected: { label: "선정됨", color: "bg-purple-100 text-purple-700 border-purple-300", icon: Send },
    };
    return configs[status] || configs.pending;
  };

  const stats = {
    total: receivedProposals.length + appliedCampaigns.length,
    pending: receivedProposals.filter(p => p.status === "pending").length + appliedCampaigns.filter(p => p.status === "pending").length,
    accepted: receivedProposals.filter(p => p.status === "accepted").length + appliedCampaigns.filter(p => p.status === "selected").length,
    inProgress: receivedProposals.filter(p => p.status === "in_progress").length + appliedCampaigns.filter(p => p.status === "in_progress").length,
  };

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            광고 제안함 📬
          </h1>
          <p className="text-muted-foreground">
            기업과 관공서에서 받은 협업 제안을 확인하고 관리하세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{stats.total}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">전체 제안</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{stats.pending}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">응답 대기</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{stats.accepted}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">수락함</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{stats.inProgress}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">진행중</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border border-border mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="제안 검색..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        {/* Proposals List */}
        <Tabs defaultValue="received">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="received">받은 제안</TabsTrigger>
            <TabsTrigger value="applied">지원한 캠페인</TabsTrigger>
          </TabsList>
          <TabsContent value="received">
            <div className="space-y-4">
              {receivedProposals.map((proposal) => {
                const statusConfig = getStatusConfig(proposal.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={proposal.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Company Logo */}
                        <img
                          src={proposal.companyLogo}
                          alt={proposal.companyName}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border"
                        />

                        {/* Proposal Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-black text-foreground">
                                  {proposal.campaignTitle}
                                </h3>
                                <Badge className={`${statusConfig.color} border`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                                <Badge className="bg-indigo-100 text-indigo-700">
                                  {proposal.projectType}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span className="inline-flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {proposal.companyName}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  제안일: {proposal.receivedDate}
                                </span>
                                {proposal.responseDate && (
                                  <span className="inline-flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    응답일: {proposal.responseDate}
                                  </span>
                                )}
                              </div>

                              {/* Project Details */}
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span>예산</span>
                                  </div>
                                  <div className="font-semibold text-foreground text-sm">
                                    {proposal.budget}
                                  </div>
                                </div>
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>마감일</span>
                                  </div>
                                  <div className="font-semibold text-foreground text-sm">
                                    {proposal.deadline}
                                  </div>
                                </div>
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <FileText className="w-4 h-4" />
                                    <span>결과물</span>
                                  </div>
                                  <div className="font-semibold text-foreground text-sm">
                                    {proposal.deliverables}
                                  </div>
                                </div>
                              </div>

                              {/* Message */}
                              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">
                                      {proposal.companyName}의 메시지
                                    </p>
                                    <p className="text-sm text-blue-800">
                                      {proposal.message}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Rejection Reason */}
                              {proposal.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-semibold text-red-900 mb-1">
                                        거절 사유
                                      </p>
                                      <p className="text-sm text-red-800">
                                        {proposal.rejectionReason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Progress */}
                              {proposal.status === "in_progress" && proposal.progress && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="font-semibold text-foreground">
                                      작업 진행률
                                    </span>
                                    <span className="font-black text-foreground">
                                      {proposal.progress}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                      style={{ width: `${proposal.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/creator/proposals/${proposal.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              상세 보기
                            </Button>
                            {proposal.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  수락하기
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  거절하기
                                </Button>
                              </>
                            )}
                            {proposal.status === "accepted" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                협업 시작
                              </Button>
                            )}
                            {proposal.status === "in_progress" && (
                              <Button
                                size="sm"
                                className="bg-purple-600 text-white hover:bg-purple-700"
                              >
                                진행 상황 업데이트
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {receivedProposals.length === 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    제안이 없습니다
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    미디어키트를 완성하면 제안을 받을 수 있습니다
                  </p>
                  <Button onClick={() => navigate("/creator/media-kit")}>
                    미디어키트 완성하기
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="applied">
            <div className="space-y-4">
              {appliedCampaigns.map((proposal) => {
                const statusConfig = getStatusConfig(proposal.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={proposal.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Company Logo */}
                        <img
                          src={proposal.companyLogo}
                          alt={proposal.companyName}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-border"
                        />

                        {/* Proposal Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-black text-foreground">
                                  {proposal.campaignTitle}
                                </h3>
                                <Badge className={`${statusConfig.color} border`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                                <Badge className="bg-indigo-100 text-indigo-700">
                                  {proposal.projectType}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span className="inline-flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {proposal.companyName}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  지원일: {proposal.appliedDate}
                                </span>
                                {proposal.responseDate && (
                                  <span className="inline-flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    응답일: {proposal.responseDate}
                                  </span>
                                )}
                              </div>

                              {/* Project Details */}
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span>예산</span>
                                  </div>
                                  <div className="font-semibold text-foreground text-sm">
                                    {proposal.budget}
                                  </div>
                                </div>
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>마감일</span>
                                  </div>
                                  <div className="font-semibold text-foreground text-sm">
                                    {proposal.deadline}
                                  </div>
                                </div>
                                <div className="bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <FileText className="w-4 h-4" />
                                    <span>결과물</span>
                                  </div>
                                  <div className="font-semibold text-foreground text-sm">
                                    {proposal.deliverables}
                                  </div>
                                </div>
                              </div>

                              {/* Message */}
                              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">
                                      제안 메시지
                                    </p>
                                    <p className="text-sm text-blue-800">
                                      {proposal.myProposal.message}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Rejection Reason */}
                              {proposal.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                  <div className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-semibold text-red-900 mb-1">
                                        거절 사유
                                      </p>
                                      <p className="text-sm text-red-800">
                                        {proposal.rejectionReason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Progress */}
                              {proposal.status === "in_progress" && proposal.progress && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="font-semibold text-foreground">
                                      작업 진행률
                                    </span>
                                    <span className="font-black text-foreground">
                                      {proposal.progress}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                      style={{ width: `${proposal.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/creator/proposals/${proposal.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              상세 보기
                            </Button>
                            {proposal.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  수락하기
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  거절하기
                                </Button>
                              </>
                            )}
                            {proposal.status === "accepted" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                협업 시작
                              </Button>
                            )}
                            {proposal.status === "in_progress" && (
                              <Button
                                size="sm"
                                className="bg-purple-600 text-white hover:bg-purple-700"
                              >
                                진행 상황 업데이트
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {appliedCampaigns.length === 0 && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="text-center py-12">
                  <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    지원한 캠페인이 없습니다
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    새로운 캠페인에 지원해보세요
                  </p>
                  <Button onClick={() => navigate("/creator/campaigns")}>
                    캠페인 목록 보기
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}