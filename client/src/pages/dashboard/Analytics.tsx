import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import {
  BarChart3,
  TrendingUp,
  FileText,
  ArrowUp,
  Users,
  Heart,
  Image,
  Calendar,
} from "lucide-react";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type ProjectRecord,
  type FandomFeedPost,
  type FandomEvent,
  type FanCreator,
} from "@/lib/local-store";

export function AnalyticsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [fanarts, setFanarts] = useState<FandomFeedPost[]>([]);
  const [events, setEvents] = useState<FandomEvent[]>([]);
  const [creators, setCreators] = useState<FanCreator[]>([]);

  useEffect(() => {
    seedIfEmpty();
    setProjects(listItems<ProjectRecord>(STORE_KEYS.PROJECTS));
    setFanarts(listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED));
    setEvents(listItems<FandomEvent>(STORE_KEYS.FANDOM_EVENTS));
    setCreators(listItems<FanCreator>(STORE_KEYS.FAN_CREATORS));
  }, []);

  // Computed metrics
  const totalFanarts = fanarts.length;
  const totalLikes = fanarts.reduce((sum, f) => sum + f.likes, 0);
  const totalComments = fanarts.reduce((sum, f) => sum + f.commentCount, 0);
  const activeEvents = events.filter((e) => e.status === "active").length;
  const totalFollowers = creators.reduce((sum, c) => sum + c.followerCount, 0);
  const publishedProjects = projects.filter((p) => p.status === "published").length;

  const metrics = [
    {
      label: "팬아트",
      value: totalFanarts.toString(),
      change: `좋아요 ${totalLikes.toLocaleString()}`,
      icon: Image,
    },
    {
      label: "프로젝트",
      value: projects.length.toString(),
      change: `발행 ${publishedProjects}`,
      icon: FileText,
    },
    {
      label: "이벤트",
      value: events.length.toString(),
      change: `진행 중 ${activeEvents}`,
      icon: Calendar,
    },
    {
      label: "팔로워",
      value: totalFollowers.toLocaleString(),
      change: `크리에이터 ${creators.length}명`,
      icon: Users,
    },
  ];

  // Top fanarts by likes
  const topFanarts = [...fanarts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  // Likes by group
  const likesByGroup = fanarts.reduce<Record<string, number>>((acc, f) => {
    acc[f.groupName] = (acc[f.groupName] || 0) + f.likes;
    return acc;
  }, {});

  const topGroups = Object.entries(likesByGroup)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">분석</h1>
          <p className="text-muted-foreground mt-1">팬덤 활동 성과를 확인하세요</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, i) => (
            <div key={i} className="rounded-2xl p-6 border bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-1 text-[13px] font-medium text-green-500">
                  <ArrowUp className="w-5 h-5" />
                  {metric.change}
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Likes by Group Chart */}
        <div className="rounded-2xl border bg-card border-border p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">그룹별 좋아요 분포</h2>
          {topGroups.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topGroups.map(([group, likes], i) => {
                const maxLikes = topGroups[0][1];
                const widthPercent = Math.max(10, Math.round((likes / maxLikes) * 100));
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{group}</span>
                      <span className="text-muted-foreground">{likes.toLocaleString()} likes</span>
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
            <h2 className="text-lg font-bold text-foreground mb-4">인기 팬아트</h2>
            <div className="space-y-3">
              {topFanarts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">팬아트가 없습니다</p>
              ) : (
                topFanarts.map((fanart, i) => (
                  <div key={fanart.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-muted-foreground w-6">{i + 1}</span>
                      <div>
                        <span className="text-sm font-medium text-foreground">{fanart.title}</span>
                        <p className="text-[13px] text-muted-foreground">{fanart.groupName} · {fanart.authorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-pink-500">
                      <Heart className="w-4 h-4" />
                      {fanart.likes.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">프로젝트 현황</h2>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">프로젝트가 없습니다</p>
              ) : (
                projects.map((project) => {
                  const statusText = project.status === "published" ? "발행" : project.status === "draft" ? "초안" : "검토";
                  const statusColor = project.status === "published" ? "text-green-500" : project.status === "draft" ? "text-amber-500" : "text-blue-500";
                  return (
                    <div key={project.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors">
                      <div>
                        <span className="text-sm font-medium text-foreground">{project.title}</span>
                        <p className="text-[13px] text-muted-foreground">{project.panels}컷 · {project.updatedAt}</p>
                      </div>
                      <span className={`text-[13px] font-medium ${statusColor}`}>{statusText}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
