import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  Heart,
  Users,
  Sparkles,
  Trophy,
  ArrowRight,
  TrendingUp,
  Rss,
  Palette,
  Pen,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IdolGroupCard } from "@/components/fandom/idol-group-card";
import { FandomEventCard } from "@/components/fandom/fandom-event-card";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  getFandomProfile,
  type IdolGroup,
  type FandomFeedPost,
  type FandomEvent,
  type ProjectRecord,
} from "@/lib/local-store";

export function FandomIndex() {
  const [groups, setGroups] = useState<IdolGroup[]>([]);
  const [feedCount, setFeedCount] = useState(0);
  const [events, setEvents] = useState<FandomEvent[]>([]);
  const [myGroupPosts, setMyGroupPosts] = useState<FandomFeedPost[]>([]);
  const [recentProjects, setRecentProjects] = useState<ProjectRecord[]>([]);

  const fandomProfile = getFandomProfile();

  useEffect(() => {
    seedIfEmpty();
    setGroups(listItems<IdolGroup>(STORE_KEYS.IDOL_GROUPS));
    const allPosts = listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED);
    setFeedCount(allPosts.length);
    setEvents(listItems<FandomEvent>(STORE_KEYS.FANDOM_EVENTS));

    if (fandomProfile?.groupId) {
      setMyGroupPosts(
        allPosts.filter((p) => p.groupId === fandomProfile.groupId).slice(0, 4)
      );
    }

    // Load recent projects
    try {
      const projects = listItems<ProjectRecord>(STORE_KEYS.PROJECTS);
      setRecentProjects(projects.slice(0, 3));
    } catch { /* ignore */ }
  }, []);

  const trendingGroups = [...groups].sort((a, b) => b.followers - a.followers).slice(0, 4);
  const activeEvents = events.filter((e) => e.status === "active");
  const myGroupEvents = fandomProfile
    ? activeEvents.filter((e) => e.groupId === fandomProfile.groupId)
    : [];
  const otherActiveEvents = activeEvents
    .filter((e) => !fandomProfile || e.groupId !== fandomProfile.groupId)
    .slice(0, 3);
  const totalFanart = groups.reduce((sum, g) => sum + g.fanartCount, 0);

  const myGroup = groups.find((g) => g.id === fandomProfile?.groupId);
  const themeColor = myGroup?.coverColor || "#7B2FF7";

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Personalized Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-foreground">
              {fandomProfile ? (
                <>
                  <span style={{ color: themeColor }}>{fandomProfile.nickname}</span>님의{" "}
                  {fandomProfile.groupName} 팬덤
                </>
              ) : (
                "팬덤 허브"
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              {fandomProfile
                ? `최애 선수: ${fandomProfile.favoritePlayer} | 팬덤: ${fandomProfile.fandomName}`
                : "좋아하는 구단의 팬아트를 만들고, 팬덤과 소통하세요"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/editor/new">
              <Button
                variant="outline"
                className="font-bold gap-2"
              >
                <Pen className="w-5 h-5" />
                에디터 열기
              </Button>
            </Link>
            <Link to="/fandom/create">
              <Button
                className="font-bold gap-2 text-white"
                style={{ background: themeColor }}
              >
                <Sparkles className="w-5 h-5" />
                팬아트 만들기
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Action Cards */}
        {fandomProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/fandom/create"
              className="rounded-2xl p-5 border-2 transition-all hover:shadow-lg group"
              style={{ borderColor: `${themeColor}30`, background: `${themeColor}08` }}
            >
              <Palette className="w-8 h-8 mb-2" style={{ color: themeColor }} />
              <p className="font-bold text-foreground">내 그룹 팬아트 만들기</p>
              <p className="text-xs text-muted-foreground mt-1">
                {fandomProfile.groupName} 멤버의 팬아트를 제작하세요
              </p>
            </Link>
            <Link
              to="/fandom/feed"
              className="rounded-2xl p-5 border bg-card border-border hover:shadow-lg transition-all group"
            >
              <Rss className="w-8 h-8 text-cyan-500 mb-2" />
              <p className="font-bold text-foreground">팬덤 피드 보기</p>
              <p className="text-xs text-muted-foreground mt-1">
                {fandomProfile.groupName} 최신 팬아트 확인
              </p>
            </Link>
            <Link
              to="/fandom/events"
              className="rounded-2xl p-5 border bg-card border-border hover:shadow-lg transition-all group"
            >
              <Trophy className="w-8 h-8 text-amber-500 mb-2" />
              <p className="font-bold text-foreground">이벤트 참여하기</p>
              <p className="text-xs text-muted-foreground mt-1">
                진행중 이벤트 {activeEvents.length}개
              </p>
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link
            to="/fandom/groups"
            className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-violet-500" />
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-2xl font-black text-foreground">{groups.length}</p>
            <p className="text-sm text-muted-foreground">아이돌 그룹</p>
          </Link>

          <Link
            to="/fandom/feed"
            className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <Heart className="w-8 h-8 text-rose-500" />
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-2xl font-black text-foreground">{totalFanart.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">팬아트</p>
          </Link>

          <Link
            to="/fandom/feed"
            className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <Rss className="w-8 h-8 text-cyan-500" />
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-2xl font-black text-foreground">{feedCount}</p>
            <p className="text-sm text-muted-foreground">피드 포스트</p>
          </Link>

          <Link
            to="/fandom/events"
            className="rounded-2xl p-6 border bg-card border-border hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-2xl font-black text-foreground">
              {activeEvents.length}
            </p>
            <p className="text-sm text-muted-foreground">진행중 이벤트</p>
          </Link>
        </div>

        {/* My Group Events (if any) */}
        {myGroupEvents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: themeColor }} />
                <h2 className="text-lg font-bold text-foreground">
                  {fandomProfile?.groupName} 이벤트
                </h2>
              </div>
              <Link to="/fandom/events" className="text-sm hover:underline" style={{ color: themeColor }}>
                전체 보기
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myGroupEvents.map((event) => (
                <FandomEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" style={{ color: themeColor }} />
                <h2 className="text-lg font-bold text-foreground">최근 프로젝트</h2>
              </div>
              <Link to="/studio" className="text-sm hover:underline" style={{ color: themeColor }}>
                전체 보기
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/editor/${project.id}`}
                  className="rounded-2xl p-5 border bg-card border-border hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-foreground truncate">{project.title}</p>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {project.panels}컷 · {project.updatedAt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending Groups */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <h2 className="text-lg font-bold text-foreground">트렌딩 그룹</h2>
            </div>
            <Link to="/fandom/groups" className="text-sm text-violet-500 hover:underline">
              전체 보기
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingGroups.map((group) => (
              <IdolGroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>

        {/* Other Active Events */}
        {otherActiveEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-foreground">진행중 이벤트</h2>
              </div>
              <Link to="/fandom/events" className="text-sm text-amber-500 hover:underline">
                전체 보기
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherActiveEvents.map((event) => (
                <FandomEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StudioLayout>
  );
}
