import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Target,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Eye,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";

export function Campaigns() {
  const navigate = useNavigate();

  const campaigns = [
    {
      id: 1,
      title: "2024 봄 축제 홍보 캠페인",
      type: "지역행사",
      status: "active",
      progress: 75,
      startDate: "2024-03-01",
      endDate: "2024-03-31",
      budget: "5,000,000",
      spent: "3,750,000",
      mascot: "브랜디",
      applicants: 12,
      selected: 2,
      contents: 8,
      views: "125K",
      engagement: "8.5%",
      approvalStatus: "approved",
    },
    {
      id: 2,
      title: "에너지 절약 정책 홍보",
      type: "정책홍보",
      status: "recruiting",
      progress: 20,
      startDate: "2024-03-15",
      endDate: "2024-04-15",
      budget: "8,000,000",
      spent: "0",
      mascot: "올리",
      applicants: 8,
      selected: 0,
      contents: 0,
      views: "0",
      engagement: "0%",
      approvalStatus: "pending",
    },
    {
      id: 3,
      title: "청년 창업 지원 안내",
      type: "공공캠페인",
      status: "planning",
      progress: 10,
      startDate: "2024-04-01",
      endDate: "2024-05-31",
      budget: "12,000,000",
      spent: "0",
      mascot: "코코",
      applicants: 0,
      selected: 0,
      contents: 0,
      views: "0",
      engagement: "0%",
      approvalStatus: "review",
    },
    {
      id: 4,
      title: "여름 안전수칙 캠페인",
      type: "시민안전",
      status: "completed",
      progress: 100,
      startDate: "2024-01-10",
      endDate: "2024-02-28",
      budget: "6,000,000",
      spent: "5,800,000",
      mascot: "브랜디",
      applicants: 15,
      selected: 3,
      contents: 18,
      views: "230K",
      engagement: "12.3%",
      approvalStatus: "approved",
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      active: { label: "진행중", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300", icon: PlayCircle },
      recruiting: { label: "작가모집중", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300", icon: Users },
      planning: { label: "기획중", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300", icon: Target },
      completed: { label: "완료", color: "bg-muted text-foreground border-border", icon: CheckCircle },
    };
    return configs[status] || configs.planning;
  };

  const getApprovalConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      approved: { label: "승인완료", color: "bg-green-600" },
      pending: { label: "승인대기", color: "bg-yellow-600" },
      review: { label: "검토중", color: "bg-blue-600" },
    };
    return configs[status] || configs.review;
  };

  return (
    <DashboardLayout userType="business">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              캠페인 관리
            </h1>
            <p className="text-muted-foreground">
              진행 중인 캠페인의 상태와 성과를 관리하세요
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
            onClick={() => navigate("/business/campaigns/new")}
          >
            <Plus className="w-5 h-5 mr-2" />
            새 캠페인 시작
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-black text-foreground">1</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">진행중</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-black text-foreground">1</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">승인대기</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-foreground">1</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">기획중</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-black text-foreground">1</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">완료</p>
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

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const statusConfig = getStatusConfig(campaign.status);
            const approvalConfig = getApprovalConfig(campaign.approvalStatus);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={campaign.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/business/campaigns/${campaign.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-foreground">
                          {campaign.title}
                        </h3>
                        <Badge className={`${statusConfig.color} border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge className={`${approvalConfig.color} text-white`}>
                          {approvalConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {campaign.type}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {campaign.startDate} ~ {campaign.endDate}
                        </span>
                        <span className="font-semibold text-indigo-600">
                          마스코트: {campaign.mascot}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold text-foreground">진행률</span>
                      <span className="font-black text-foreground">{campaign.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-6 gap-4">
                    <div className="text-center p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="text-xs text-purple-600 mb-1 font-semibold">지원자</div>
                      <div className="font-black text-purple-700 text-lg">
                        {campaign.applicants}명
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-xs text-green-600 mb-1 font-semibold">선정</div>
                      <div className="font-black text-green-700 text-lg">
                        {campaign.selected}명
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">예산</div>
                      <div className="font-black text-foreground text-sm">
                        {campaign.budget}원
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">콘텐츠</div>
                      <div className="font-black text-indigo-600 text-sm">
                        {campaign.contents}개
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">조회수</div>
                      <div className="font-black text-blue-600 text-sm">
                        {campaign.views}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">참여율</div>
                      <div className="font-black text-green-600 text-sm">
                        {campaign.engagement}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}