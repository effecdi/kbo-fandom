import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  Sparkles,
  Target,
  Users,
  TrendingUp,
  ArrowRight,
  Eye,
  FileText,
  DollarSign,
  BarChart3,
  Plus,
  FolderOpen,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type RevenueRecord,
  type ProjectRecord,
  type Collaboration,
  type Campaign,
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

function getUserRole(): "creator" | "business" {
  return (localStorage.getItem("olli_user_role") as "creator" | "business") || "creator";
}

export function DashboardIndex() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const role = getUserRole();

  useEffect(() => {
    seedIfEmpty();
    setProjects(listItems<ProjectRecord>(STORE_KEYS.PROJECTS));
    setRevenue(listItems<RevenueRecord>(STORE_KEYS.REVENUE));
    setCollaborations(listItems<Collaboration>(STORE_KEYS.COLLABORATIONS));
    setCampaigns(listItems<Campaign>(STORE_KEYS.CAMPAIGNS));
  }, []);

  // Computed stats
  const totalCompletedRevenue = revenue
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const projectCount = projects.length;
  const draftCount = projects.filter((p) => p.status === "draft").length;
  const publishedCount = projects.filter((p) => p.status === "published").length;

  const activeCampaigns = campaigns.filter((c) => c.status === "recruiting" || c.status === "active");
  const pendingCollabs = collaborations.filter((c) => c.status === "pending" || c.status === "in_progress");

  // Current month revenue
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthRevenue = revenue
    .filter((r) => r.date.startsWith(currentMonth) && r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  // Previous month revenue for comparison
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const prevMonthRevenue = revenue
    .filter((r) => r.date.startsWith(prevMonth) && r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const revenueChange = prevMonthRevenue > 0
    ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
    : currentMonthRevenue > 0 ? 100 : 0;

  // Recent activities from real data
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 2);

  const recentRevenue = [...revenue]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  const recentActivities = [
    ...recentProjects.map((p) => ({
      text: `${p.title} ${p.status === "draft" ? "초안 저장" : p.status === "published" ? "발행" : "검토 중"}`,
      time: p.updatedAt,
      icon: FileText,
    })),
    ...recentRevenue.map((r) => ({
      text: `${r.project} - ${r.status === "completed" ? "정산 완료" : r.status === "pending" ? "대기 중" : "처리 중"}`,
      time: r.date,
      icon: DollarSign,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);

  function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "1일 전";
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  }

  // ─── Role-specific quick actions ─────────────────────────────────────
  const creatorQuickActions = [
    {
      to: "/studio/new",
      icon: Plus,
      iconBg: "bg-[#00e5cc]/10",
      iconColor: "text-[#00e5cc]",
      title: "새 프로젝트 만들기",
      desc: "템플릿으로 시작하세요",
    },
    {
      to: "/assets/characters/new",
      icon: Sparkles,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      title: "캐릭터 생성",
      desc: "AI로 캐릭터를 만드세요",
    },
    {
      to: "/market/campaigns",
      icon: Target,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      title: "캠페인 둘러보기",
      desc: "새로운 협업 기회를 찾으세요",
    },
  ];

  const businessQuickActions = [
    {
      to: "/assets/brand/mascot/new",
      icon: Sparkles,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      title: "AI 마스코트 생성",
      desc: "브랜드 마스코트를 만드세요",
    },
    {
      to: "/assets/brand",
      icon: FolderOpen,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      title: "브랜드 자산 관리",
      desc: "로고, 컬러, 문서를 관리하세요",
    },
    {
      to: "/market/creators",
      icon: Users,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      title: "크리에이터 찾기",
      desc: "협업할 작가를 검색하세요",
    },
  ];

  const quickActions = role === "business" ? businessQuickActions : creatorQuickActions;

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">대시보드</h1>
          <p className="text-muted-foreground mt-1">
            {role === "business"
              ? "브랜드 자산과 캠페인 현황을 확인하세요"
              : "활동 요약과 주요 지표를 확인하세요"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{projectCount}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">프로젝트</p>
            <p className="text-xs mt-1 text-muted-foreground">초안 {draftCount} · 발행 {publishedCount}</p>
          </div>

          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{collaborations.length}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">협업</p>
            <p className="text-xs mt-1 text-muted-foreground">진행 중 {pendingCollabs.length}건</p>
          </div>

          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{formatCurrency(totalCompletedRevenue)}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              {role === "business" ? "총 지출" : "총 수익"}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              이번 달 {revenueChange >= 0 ? "+" : ""}{revenueChange}%
            </p>
          </div>

          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{activeCampaigns.length}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">진행중 캠페인</p>
            <p className="text-xs mt-1 text-muted-foreground">전체 {campaigns.length}건</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border bg-card border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">빠른 시작</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">최근 활동</h2>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">아직 활동 내역이 없습니다</p>
              ) : (
                recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <activity.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeDate(activity.time)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Links to sub pages — role-aware */}
        <div className="flex gap-4">
          <Link to="/dashboard/analytics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="w-5 h-5" />
              상세 분석
            </Button>
          </Link>
          <Link to={role === "business" ? "/dashboard/reports" : "/dashboard/revenue"}>
            <Button variant="outline" className="gap-2">
              <DollarSign className="w-5 h-5" />
              {role === "business" ? "리포트" : "수익 관리"}
            </Button>
          </Link>
          {role === "business" && (
            <Link to="/assets/brand">
              <Button variant="outline" className="gap-2">
                <FolderOpen className="w-5 h-5" />
                브랜드 자산
              </Button>
            </Link>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
