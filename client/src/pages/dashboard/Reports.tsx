import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Target,
  ArrowUp,
  ArrowDown,
  Sparkles,
  PieChart,
  Download,
  DollarSign,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type RevenueRecord,
  type ProjectRecord,
  type Campaign,
  type Collaboration,
} from "@/lib/local-store";

type TimePeriod = "week" | "month" | "quarter" | "year";

const timePeriodLabels: Record<TimePeriod, string> = {
  week: "이번 주",
  month: "이번 달",
  quarter: "분기",
  year: "올해",
};

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `\u20A9${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `\u20A9${(amount / 1_000).toFixed(0)}K`;
  }
  return `\u20A9${amount.toLocaleString()}`;
}

export function ReportsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);

  useEffect(() => {
    seedIfEmpty();
    setProjects(listItems<ProjectRecord>(STORE_KEYS.PROJECTS));
    setRevenue(listItems<RevenueRecord>(STORE_KEYS.REVENUE));
    setCampaigns(listItems<Campaign>(STORE_KEYS.CAMPAIGNS));
    setCollaborations(listItems<Collaboration>(STORE_KEYS.COLLABORATIONS));
  }, []);

  // Computed KPI values
  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.status === "published").length;

  const totalCompletedRevenue = revenue
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const activeCampaigns = campaigns.filter((c) => c.status === "recruiting" || c.status === "active").length;
  const completedCampaigns = campaigns.filter((c) => c.status === "completed").length;

  const activeCollabs = collaborations.filter((c) => c.status === "in_progress").length;
  const completedCollabs = collaborations.filter((c) => c.status === "completed").length;

  // Average campaign budget
  const avgBudget = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + c.budget, 0) / campaigns.length)
    : 0;

  // Build KPI data from real stats
  const kpiData = [
    {
      label: "총 프로젝트",
      value: totalProjects.toString(),
      change: `발행 ${publishedProjects}`,
      up: true,
      icon: FileText,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      label: "캠페인 수",
      value: campaigns.length.toString(),
      change: `모집 중 ${activeCampaigns}`,
      up: true,
      icon: Target,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "총 수익",
      value: formatCurrency(totalCompletedRevenue),
      change: `${revenue.length}건 거래`,
      up: true,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "활성 협업",
      value: activeCollabs.toString(),
      change: `완료 ${completedCollabs}`,
      up: activeCollabs > 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">리포트</h1>
            <p className="text-muted-foreground mt-1">캠페인 성과와 주요 지표를 분석하세요</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            리포트 다운로드
          </Button>
        </div>

        {/* Time Period Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit mb-8">
          {(Object.keys(timePeriodLabels) as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                timePeriod === period
                  ? "bg-[#00e5cc] text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {timePeriodLabels[period]}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, i) => (
            <div key={i} className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-green-500" : "text-muted-foreground"}`}>
                  {kpi.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{kpi.value}</p>
              <p className="text-sm font-semibold text-muted-foreground mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Summary */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">수익 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">완료 수익</p>
              <p className="text-xl font-black text-green-500">{formatCurrency(totalCompletedRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">{revenue.filter(r => r.status === "completed").length}건</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">대기 중</p>
              <p className="text-xl font-black text-amber-500">
                {formatCurrency(revenue.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{revenue.filter(r => r.status === "pending").length}건</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">처리 중</p>
              <p className="text-xl font-black text-blue-500">
                {formatCurrency(revenue.filter(r => r.status === "processing").reduce((s, r) => s + r.amount, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{revenue.filter(r => r.status === "processing").length}건</p>
            </div>
          </div>
        </div>

        {/* Campaign Performance Table */}
        <div className="rounded-2xl border bg-card border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">캠페인 성과</h2>
            <Link to="/market/campaigns">
              <Button variant="ghost" size="sm" className="text-[#00e5cc] hover:text-[#00e5cc]/80 gap-1">
                <Target className="w-4 h-4" />
                전체 보기
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">캠페인</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">브랜드</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">예산</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">지원자</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      캠페인 데이터가 없습니다
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => {
                    const statusText = campaign.status === "recruiting" ? "모집중" : campaign.status === "active" ? "진행중" : "완료";
                    const statusColor = campaign.status === "recruiting" ? "text-cyan-500 bg-cyan-500/10" : campaign.status === "active" ? "text-green-500 bg-green-500/10" : "text-muted-foreground bg-muted";
                    return (
                      <tr key={campaign.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#00e5cc]/10 flex items-center justify-center">
                              <PieChart className="w-4 h-4 text-[#00e5cc]" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{campaign.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground text-right">{campaign.brand}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground text-right">{formatCurrency(campaign.budget)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground text-right">{campaign.applicants}명</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
