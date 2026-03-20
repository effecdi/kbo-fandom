import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share2,
  Download,
  Calendar,
  Target,
  Users,
  DollarSign,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Reports() {
  const overallStats = [
    {
      label: "총 마스코트 활용",
      value: "5개",
      change: "+2",
      trend: "up",
      icon: Target,
      color: "indigo",
    },
    {
      label: "총 캠페인",
      value: "12건",
      change: "+3",
      trend: "up",
      icon: BarChart3,
      color: "blue",
    },
    {
      label: "총 조회수",
      value: "1.2M",
      change: "+15.3%",
      trend: "up",
      icon: Eye,
      color: "purple",
    },
    {
      label: "평균 참여율",
      value: "8.7%",
      change: "+2.1%",
      trend: "up",
      icon: Heart,
      color: "pink",
    },
    {
      label: "작가 협업",
      value: "8건",
      change: "+4",
      trend: "up",
      icon: Users,
      color: "green",
    },
    {
      label: "예산 집행률",
      value: "68%",
      change: "-5%",
      trend: "down",
      icon: DollarSign,
      color: "orange",
    },
  ];

  const campaignPerformance = [
    {
      name: "2024 봄 축제 홍보",
      views: "125K",
      engagement: "8.5%",
      reach: "98K",
      shares: "3.2K",
      budget: "5,000,000",
      roi: "245%",
      status: "진행중",
    },
    {
      name: "에너지 절약 캠페인",
      views: "45K",
      engagement: "6.2%",
      reach: "38K",
      shares: "1.8K",
      budget: "8,000,000",
      roi: "156%",
      status: "진행중",
    },
    {
      name: "여름 안전수칙",
      views: "230K",
      engagement: "12.3%",
      reach: "185K",
      shares: "8.5K",
      budget: "6,000,000",
      roi: "312%",
      status: "완료",
    },
  ];

  const topMascots = [
    { name: "브랜디", campaigns: 5, views: "355K", engagement: "9.2%" },
    { name: "올리", campaigns: 4, views: "245K", engagement: "7.8%" },
    { name: "코코", campaigns: 3, views: "180K", engagement: "6.5%" },
  ];

  return (
    <DashboardLayout userType="business">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              리포트 & 분석
            </h1>
            <p className="text-muted-foreground">
              마스코트 활용도와 캠페인 성과를 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="30days">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">최근 7일</SelectItem>
                <SelectItem value="30days">최근 30일</SelectItem>
                <SelectItem value="90days">최근 3개월</SelectItem>
                <SelectItem value="year">올해</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              리포트 다운로드
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {overallStats.map((stat, idx) => {
            const Icon = stat.icon;
            const isPositive = stat.trend === "up";
            const colorClasses = {
              indigo: "bg-indigo-100 text-indigo-600",
              blue: "bg-blue-100 text-blue-600",
              purple: "bg-purple-100 text-purple-600",
              pink: "bg-pink-100 text-pink-600",
              green: "bg-green-100 text-green-600",
              orange: "bg-orange-100 text-orange-600",
            }[stat.color];

            return (
              <div
                key={idx}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${colorClasses} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      isPositive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Campaign Performance */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-foreground">
                  캠페인 성과
                </h2>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </Button>
              </div>

              <div className="space-y-4">
                {campaignPerformance.map((campaign, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-foreground mb-1">
                          {campaign.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            campaign.status === "진행중"
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-foreground"
                          }`}>
                            {campaign.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            예산: {campaign.budget}원
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-green-600">
                          ROI {campaign.roi}
                        </div>
                        <div className="text-xs text-muted-foreground">투자 대비 효과</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Eye className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-black text-foreground">
                            {campaign.views}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">조회수</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Heart className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-black text-foreground">
                            {campaign.engagement}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">참여율</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-black text-foreground">
                            {campaign.reach}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">도달</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Share2 className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-black text-foreground">
                            {campaign.shares}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">공유</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Mascots */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <h2 className="text-xl font-black text-foreground mb-6">
                인기 마스코트
              </h2>

              <div className="space-y-4">
                {topMascots.map((mascot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-foreground mb-1">
                        {mascot.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mascot.campaigns}개 캠페인 · {mascot.views} 조회
                      </div>
                      <div className="text-xs font-semibold text-indigo-600">
                        참여율 {mascot.engagement}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <h3 className="font-black text-foreground mb-4">💡 인사이트</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">
                    <span className="font-semibold">브랜디</span> 마스코트가 가장 높은 참여율을 기록하고 있습니다
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">
                    작가 협업 캠페인의 평균 참여율이 <span className="font-semibold">38% 더 높습니다</span>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">
                    목요일 오후 2-4시에 가장 높은 조회수를 기록합니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-xl font-black text-foreground mb-4">
            리포트 내보내기
          </h2>
          <p className="text-muted-foreground mb-6">
            관공서 내부 보고용 리포트를 다운로드하세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">PDF 리포트</div>
                  <div className="text-xs text-muted-foreground">전체 성과 요약</div>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">Excel 데이터</div>
                  <div className="text-xs text-muted-foreground">상세 수치 분석</div>
                </div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">PPT 발표자료</div>
                  <div className="text-xs text-muted-foreground">내부 결재용</div>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}