import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  Upload,
  FileText,
  Send,
  Inbox,
  Target,
  PartyPopper,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router";

type TabType = "received" | "applied" | "ongoing" | "completed";

export function Projects() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("received");

  // 받은 제안 (기업 → 작가)
  const receivedProposals = [
    {
      id: 1,
      campaignTitle: "브랜드 마스코트 콘텐츠 제작",
      companyName: "ABC 기업",
      companyLogo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
      status: "pending",
      receivedDate: "2024-03-11",
      budget: "3,000,000 - 4,000,000원",
      deadline: "2024-03-20",
      deliverables: "인스타툰 8편",
      message: "작가님의 따뜻한 그림체가 저희 브랜드 마스코트와 잘 어울릴 것 같아 제안드립니다.",
      projectType: "브랜드홍보",
    },
    {
      id: 2,
      campaignTitle: "건강한 아침 루틴 시리즈",
      companyName: "헬시라이프",
      companyLogo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop",
      status: "accepted",
      receivedDate: "2024-03-08",
      budget: "2,500,000원",
      deadline: "2024-03-18",
      deliverables: "인스타툰 5편",
      message: "건강 콘텐츠 제작 경험이 풍부하신 작가님과 협업하고 싶습니다.",
      projectType: "건강",
    },
    {
      id: 3,
      campaignTitle: "환경 보호 캠페인",
      companyName: "그린월드",
      companyLogo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop",
      status: "rejected",
      receivedDate: "2024-03-05",
      budget: "1,800,000원",
      deadline: "2024-03-15",
      deliverables: "인스타툰 4편",
      message: "환경 메시지를 재미있게 전달해주실 작가님을 찾고 있습니다.",
      projectType: "공익",
    },
  ];

  // 지원한 캠페인
  const appliedCampaigns = [
    {
      id: 1,
      title: "2024 봄 축제 홍보 캠페인",
      company: "서울시청",
      companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      status: "pending",
      appliedDate: "2024-03-08",
      budget: "4,500,000원",
      type: "지역행사",
    },
    {
      id: 2,
      title: "에너지 절약 정책 홍보",
      company: "환경부",
      companyLogo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
      status: "interviewing",
      appliedDate: "2024-03-07",
      budget: "8,000,000원",
      type: "정책홍보",
    },
    {
      id: 3,
      title: "청년 창업 지원 안내",
      company: "중소벤처기업부",
      companyLogo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop",
      status: "rejected",
      appliedDate: "2024-03-05",
      budget: "6,000,000원",
      type: "공공캠페인",
    },
  ];

  // 진행 중 프로젝트
  const ongoingProjects = [
    {
      id: 1,
      brand: "XYZ 브랜드",
      campaign: "신제품 런칭 캠페인",
      status: "제작 중",
      progress: 60,
      deadline: "2024-04-15",
      stage: "콘텐츠 제작",
      totalStages: 4,
      lastUpdate: "2일 전",
      nextMilestone: "초안 제출",
      budget: "5,000,000원",
    },
    {
      id: 2,
      brand: "ABC 코스메틱",
      campaign: "봄 시즌 프로모션",
      status: "검수 중",
      progress: 85,
      deadline: "2024-03-30",
      stage: "검수 및 수정",
      totalStages: 4,
      lastUpdate: "5시간 전",
      nextMilestone: "최종 승인 대기",
      budget: "3,500,000원",
    },
    {
      id: 3,
      brand: "헬시라이프",
      campaign: "건강한 아침 루틴",
      status: "기획 중",
      progress: 30,
      deadline: "2024-03-25",
      stage: "콘티 작성",
      totalStages: 4,
      lastUpdate: "1일 전",
      nextMilestone: "콘티 검토",
      budget: "2,500,000원",
    },
  ];

  // 완료된 프로젝트
  const completedProjects = [
    {
      id: 1,
      brand: "푸드테크 스타트업",
      campaign: "신메뉴 론칭 캠페인",
      completedDate: "2024-02-28",
      budget: "4,000,000원",
      deliverables: "인스타툰 10편",
      rating: 5,
      feedback: "작업 속도도 빠르고 퀄리티도 훌륭했습니다. 다음에도 꼭 함께하고 싶어요!",
    },
    {
      id: 2,
      brand: "교육 플랫폼",
      campaign: "학습 동기부여 시리즈",
      completedDate: "2024-02-15",
      budget: "3,200,000원",
      deliverables: "인스타툰 8편",
      rating: 4.5,
      feedback: "기대 이상의 결과물이었습니다. 소통도 원활했습니다.",
    },
    {
      id: 3,
      brand: "패션 브랜드",
      campaign: "SS 시즌 룩북",
      completedDate: "2024-01-30",
      budget: "6,500,000원",
      deliverables: "인스타툰 12편",
      rating: 5,
      feedback: "트렌디한 감각이 돋보였고, 우리 브랜드 정체성을 잘 살려주셨습니다.",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "검토 중", className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300" },
      accepted: { label: "수락됨", className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300" },
      rejected: { label: "거절됨", className: "bg-gray-100 text-gray-700 border-gray-300" },
      interviewing: { label: "인터뷰 예정", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300" },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">프로젝트 허브 🚀</h1>
          <p className="text-muted-foreground">
            제안, 지원, 진행, 완료까지 모든 협업을 한 곳에서 관리하세요
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Inbox className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-3xl font-black text-foreground">
                {receivedProposals.filter(p => p.status === "pending").length}
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">새 제안</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-3xl font-black text-foreground">
                {appliedCampaigns.filter(c => c.status === "pending" || c.status === "interviewing").length}
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">지원 대기</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-3xl font-black text-foreground">
                {ongoingProjects.length}
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">진행 중</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-3xl font-black text-foreground">
                {completedProjects.length}
              </span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">완료됨</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("received")}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "received"
                  ? "bg-muted text-[#00e5cc] border-b-2 border-[#00e5cc]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Inbox className="w-5 h-5" />
              받은 제안
              {receivedProposals.filter(p => p.status === "pending").length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-[#00e5cc] text-black text-xs rounded-full font-bold">
                  {receivedProposals.filter(p => p.status === "pending").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("applied")}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "applied"
                  ? "bg-muted text-[#00e5cc] border-b-2 border-[#00e5cc]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Send className="w-5 h-5" />
              지원 현황
            </button>
            <button
              onClick={() => setActiveTab("ongoing")}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "ongoing"
                  ? "bg-muted text-[#00e5cc] border-b-2 border-[#00e5cc]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              진행 중
              {ongoingProjects.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-bold">
                  {ongoingProjects.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === "completed"
                  ? "bg-muted text-[#00e5cc] border-b-2 border-[#00e5cc]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              완료됨
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* 받은 제안 */}
            {activeTab === "received" && (
              <div className="space-y-4">
                {receivedProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="bg-background rounded-xl border border-border p-6 hover:border-[#00e5cc]/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={proposal.companyLogo}
                        alt={proposal.companyName}
                        className="w-16 h-16 rounded-xl object-cover border border-border"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {proposal.campaignTitle}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-5 h-5" />
                                {proposal.companyName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-5 h-5" />
                                {proposal.receivedDate}
                              </span>
                            </div>
                          </div>
                          {getStatusBadge(proposal.status)}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">{proposal.message}</p>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <DollarSign className="w-5 h-5" />
                              예산
                            </div>
                            <p className="text-sm font-bold text-foreground">{proposal.budget}</p>
                          </div>
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Calendar className="w-5 h-5" />
                              마감
                            </div>
                            <p className="text-sm font-bold text-foreground">{proposal.deadline}</p>
                          </div>
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <FileText className="w-5 h-5" />
                              결과물
                            </div>
                            <p className="text-sm font-bold text-foreground">{proposal.deliverables.split(" ")[1]}</p>
                          </div>
                        </div>

                        {proposal.status === "pending" && (
                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              className="flex-1 bg-[#00e5cc] text-black hover:bg-[#00f0ff]"
                              onClick={() => navigate(`/creator/proposals/${proposal.id}`)}
                            >
                              <CheckCircle className="w-5 h-5 mr-2" />
                              수락하기
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-border text-muted-foreground hover:bg-muted"
                            >
                              <XCircle className="w-5 h-5 mr-2" />
                              거절하기
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 지원 현황 */}
            {activeTab === "applied" && (
              <div className="space-y-4">
                {appliedCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-background rounded-xl border border-border p-6 hover:border-[#00e5cc]/30 transition-all cursor-pointer"
                    onClick={() => navigate(`/creator/campaigns/${campaign.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={campaign.companyLogo}
                        alt={campaign.company}
                        className="w-16 h-16 rounded-xl object-cover border border-border"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {campaign.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-5 h-5" />
                                {campaign.company}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-5 h-5" />
                                지원일: {campaign.appliedDate}
                              </span>
                            </div>
                          </div>
                          {getStatusBadge(campaign.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <DollarSign className="w-5 h-5" />
                              예산
                            </div>
                            <p className="text-sm font-bold text-foreground">{campaign.budget}</p>
                          </div>
                          <div className="bg-card rounded-lg p-3 border border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Target className="w-5 h-5" />
                              분류
                            </div>
                            <p className="text-sm font-bold text-foreground">{campaign.type}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 진행 중 */}
            {activeTab === "ongoing" && (
              <div className="space-y-4">
                {ongoingProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-background rounded-xl border border-border p-6 hover:border-[#00e5cc]/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {project.campaign}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-5 h-5" />
                            {project.brand}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-5 h-5" />
                            마감: {project.deadline}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {project.status}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">진행률</span>
                        <span className="font-bold text-[#00e5cc]">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Stage & Milestone */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">현재 단계</div>
                        <p className="text-sm font-bold text-foreground">{project.stage}</p>
                      </div>
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">다음 마일스톤</div>
                        <p className="text-sm font-bold text-foreground">{project.nextMilestone}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-[#00e5cc] text-black hover:bg-[#00f0ff]"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        파일 업로드
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-border text-muted-foreground hover:bg-muted"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        메시지
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:bg-muted"
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 완료됨 */}
            {activeTab === "completed" && (
              <div className="space-y-4">
                {completedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-background rounded-xl border border-border p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {project.campaign}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-5 h-5" />
                            {project.brand}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-5 h-5" />
                            완료: {project.completedDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-bold text-foreground">{project.rating}</span>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="bg-card rounded-lg p-4 border border-border mb-4">
                      <p className="text-sm text-muted-foreground italic">"{project.feedback}"</p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">받은 금액</div>
                        <p className="text-sm font-bold text-green-400">{project.budget}</p>
                      </div>
                      <div className="bg-card rounded-lg p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">결과물</div>
                        <p className="text-sm font-bold text-foreground">{project.deliverables}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-border text-muted-foreground hover:bg-muted"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        결과물 보기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:bg-muted"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
