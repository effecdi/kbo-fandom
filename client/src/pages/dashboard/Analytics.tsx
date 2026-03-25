import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  ArrowUp,
  ArrowDown,
  Users,
  Target,
  Eye,
  Heart,
} from "lucide-react";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type RevenueRecord,
  type ProjectRecord,
  type Campaign,
  type Collaboration,
} from "@/lib/local-store";

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `\u20A9${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `\u20A9${(amount / 1_000).toFixed(0)}K`;
  }
  return `\u20A9${amount.toLocaleString()}`;
}

export function AnalyticsPage() {
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

  // Computed metrics
  const totalRevenue = revenue
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPanels = projects.reduce((sum, p) => sum + p.panels, 0);
  const publishedProjects = projects.filter((p) => p.status === "published").length;
  const activeCollabs = collaborations.filter((c) => c.status === "in_progress").length;
  const totalCampaignBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

  // Month-over-month revenue change
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const currentMonthRev = revenue
    .filter((r) => r.date.startsWith(currentMonth) && r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const prevMonthRev = revenue
    .filter((r) => r.date.startsWith(prevMonth) && r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const revChange = prevMonthRev > 0
    ? Math.round(((currentMonthRev - prevMonthRev) / prevMonthRev) * 100)
    : currentMonthRev > 0 ? 100 : 0;

  // Average completion rate of collaborations
  const avgProgress = collaborations.length > 0
    ? Math.round(collaborations.reduce((sum, c) => sum + c.progress, 0) / collaborations.length)
    : 0;

  const metrics = [
    {
      label: "총 수익",
      value: formatCurrency(totalRevenue),
      change: `${revChange >= 0 ? "+" : ""}${revChange}%`,
      up: revChange >= 0,
      icon: DollarSign,
    },
    {
      label: "프로젝트",
      value: projects.length.toString(),
      change: `발행 ${publishedProjects}`,
      up: true,
      icon: FileText,
    },
    {
      label: "활성 협업",
      value: activeCollabs.toString(),
      change: `평균 ${avgProgress}% 진행`,
      up: activeCollabs > 0,
      icon: Users,
    },
    {
      label: "캠페인 예산",
      value: formatCurrency(totalCampaignBudget),
      change: `${campaigns.length}건`,
      up: true,
      icon: Target,
    },
  ];

  // Top projects by panels
  const topProjects = [...projects]
    .sort((a, b) => b.panels - a.panels)
    .slice(0, 5);

  // Revenue by project
  const revenueByProject = revenue
    .filter((r) => r.status === "completed")
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.project] = (acc[r.project] || 0) + r.amount;
      return acc;
    }, {});

  const topRevenueProjects = Object.entries(revenueByProject)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">분석</h1>
          <p className="text-muted-foreground mt-1">콘텐츠 성과를 확인하세요</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, i) => (
            <div key={i} className="rounded-2xl p-6 border bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className="w-5 h-5 text-muted-foreground" />
                <div className={`flex items-center gap-1 text-xs font-medium ${metric.up ? "text-green-500" : "text-red-500"}`}>
                  {metric.up ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                  {metric.change}
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Bar Chart Placeholder with real data */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">수익 분포</h2>
          {topRevenueProjects.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">수익 데이터가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topRevenueProjects.map(([project, amount], i) => {
                const maxAmount = topRevenueProjects[0][1];
                const widthPercent = Math.max(10, Math.round((amount / maxAmount) * 100));
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{project}</span>
                      <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-[#00e5cc] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">프로젝트 현황</h2>
            <div className="space-y-3">
              {topProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">프로젝트가 없습니다</p>
              ) : (
                topProjects.map((project, i) => {
                  const statusText = project.status === "published" ? "발행" : project.status === "draft" ? "초안" : "검토";
                  const statusColor = project.status === "published" ? "text-green-500" : project.status === "draft" ? "text-amber-500" : "text-blue-500";
                  return (
                    <div key={project.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-muted-foreground w-6">{i + 1}</span>
                        <div>
                          <span className="text-sm font-medium text-foreground">{project.title}</span>
                          <p className="text-xs text-muted-foreground">{project.panels}컷 · {project.updatedAt}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${statusColor}`}>{statusText}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">협업 진행률</h2>
            <div className="space-y-3">
              {collaborations.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">협업 데이터가 없습니다</p>
              ) : (
                collaborations.map((collab, i) => (
                  <div key={collab.id} className="p-3 rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{collab.projectName}</span>
                      <span className="text-xs text-muted-foreground">{collab.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          collab.progress === 100 ? "bg-green-500" : "bg-[#00e5cc]"
                        }`}
                        style={{ width: `${collab.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{collab.brand} · 단계 {collab.stage}/{collab.totalStages}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
