import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  Sparkles,
  Heart,
  Users,
  Image,
  ArrowRight,
  FileText,
  BarChart3,
  Plus,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type FandomFeedPost,
  type FandomEvent,
  type FanCreator,
} from "@/lib/local-store";

export function DashboardIndex() {
  const [fanarts, setFanarts] = useState<FandomFeedPost[]>([]);
  const [events, setEvents] = useState<FandomEvent[]>([]);
  const [creators, setCreators] = useState<FanCreator[]>([]);

  useEffect(() => {
    seedIfEmpty();
    setFanarts(listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED));
    setEvents(listItems<FandomEvent>(STORE_KEYS.FANDOM_EVENTS));
    setCreators(listItems<FanCreator>(STORE_KEYS.FAN_CREATORS));
  }, []);

  // Computed stats
  const totalFanarts = fanarts.length;
  const totalLikes = fanarts.reduce((sum, f) => sum + f.likes, 0);
  const activeEvents = events.filter((e) => e.status === "active");
  const totalFollowers = creators.reduce((sum, c) => sum + c.followerCount, 0);

  // Recent activities
  const recentFanarts = [...fanarts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const now = new Date();

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

  const quickActions = [
    {
      to: "/fandom/create",
      icon: Plus,
      iconBg: "bg-[#00e5cc]/10",
      iconColor: "text-[#00e5cc]",
      title: "새 팬아트 만들기",
      desc: "AI로 팬아트를 생성하세요",
    },
    {
      to: "/fandom/events",
      icon: Calendar,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      title: "이벤트 참여",
      desc: "진행 중인 챌린지를 확인하세요",
    },
    {
      to: "/fandom/talk",
      icon: MessageCircle,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      title: "팬톡",
      desc: "팬들과 이야기를 나누세요",
    },
  ];

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">대시보드</h1>
          <p className="text-muted-foreground mt-1">
            내 팬덤 활동 요약과 주요 지표를 확인하세요
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{totalFanarts}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">내 팬아트</p>
            <p className="text-xs mt-1 text-muted-foreground">피드에 공유된 작품</p>
          </div>

          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{activeEvents.length}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">참여 이벤트</p>
            <p className="text-xs mt-1 text-muted-foreground">진행 중 {activeEvents.length}건</p>
          </div>

          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{totalLikes.toLocaleString()}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">받은 좋아요</p>
            <p className="text-xs mt-1 text-muted-foreground">전체 팬아트 합산</p>
          </div>

          <div className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-foreground">{totalFollowers.toLocaleString()}</span>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">팔로워</p>
            <p className="text-xs mt-1 text-muted-foreground">크리에이터 전체</p>
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
            <h2 className="text-lg font-bold text-foreground mb-4">최근 팬아트</h2>
            <div className="space-y-3">
              {recentFanarts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">아직 팬아트가 없습니다</p>
              ) : (
                recentFanarts.map((fanart) => (
                  <div key={fanart.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{fanart.title}</p>
                      <p className="text-xs text-muted-foreground">{fanart.groupName} · {formatRelativeDate(fanart.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Links to sub pages */}
        <div className="flex gap-4">
          <Link to="/dashboard/analytics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="w-5 h-5" />
              상세 분석
            </Button>
          </Link>
          <Link to="/fandom/feed">
            <Button variant="outline" className="gap-2">
              <Sparkles className="w-5 h-5" />
              팬아트 피드
            </Button>
          </Link>
          <Link to="/fandom/fans">
            <Button variant="outline" className="gap-2">
              <Users className="w-5 h-5" />
              팬 크리에이터
            </Button>
          </Link>
        </div>
      </div>
    </StudioLayout>
  );
}
