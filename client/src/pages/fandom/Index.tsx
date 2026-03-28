import { useState, useEffect, useMemo } from "react";
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
  Calendar,
  Music,
  MapPin,
  Camera,
  BarChart3,
  ShoppingBag,
  Flame,
  Vote,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamCard } from "@/components/fandom/team-card";
import { FandomEventCard } from "@/components/fandom/fandom-event-card";
import { FandomFeedPostCard } from "@/components/fandom/fandom-feed-post-card";
import { GameScheduleCard } from "@/components/fandom/game-schedule-card";
import { LiveGameSection } from "@/components/fandom/live-game-section";
import { NextGameCountdown } from "@/components/fandom/next-game-countdown";
import { StandingsTable } from "@/components/fandom/standings-table";
import { DashboardGrid, type DashboardWidget } from "@/components/fandom/dashboard-grid";
import { useKboLiveScores } from "@/hooks/use-kbo-live-scores";
import { useKboStandings } from "@/hooks/use-kbo-standings";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  getFandomProfile,
  type KboTeam,
  type KboGameSchedule,
  type KboStanding,
  type FandomFeedPost,
  type FandomEvent,
  type ProjectRecord,
} from "@/lib/local-store";

export function FandomIndex() {
  const [groups, setGroups] = useState<KboTeam[]>([]);
  const [standings, setStandings] = useState<KboStanding[]>([]);
  const [feedPosts, setFeedPosts] = useState<FandomFeedPost[]>([]);
  const [events, setEvents] = useState<FandomEvent[]>([]);
  const [myGroupPosts, setMyGroupPosts] = useState<FandomFeedPost[]>([]);
  const [recentProjects, setRecentProjects] = useState<ProjectRecord[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<KboGameSchedule[]>([]);

  const fandomProfile = getFandomProfile();

  // Real-time KBO scores from Naver Sports API (polls every 10s)
  const { liveGames, hasLiveGames, isLoading: scoresLoading } = useKboLiveScores(10000);
  // Real-time KBO standings (polls every 60s)
  const { standings: liveStandings } = useKboStandings(60000);

  useEffect(() => {
    seedIfEmpty();
    const allGroups = listItems<KboTeam>(STORE_KEYS.KBO_TEAMS);
    setGroups(allGroups);
    const allPosts = listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED);
    setFeedPosts(allPosts);
    setEvents(listItems<FandomEvent>(STORE_KEYS.FANDOM_EVENTS));

    if (fandomProfile?.groupId) {
      setMyGroupPosts(
        allPosts.filter((p) => p.groupId === fandomProfile.groupId).slice(0, 6)
      );
    }

    const allStandings = listItems<KboStanding>(STORE_KEYS.KBO_STANDINGS);
    setStandings(allStandings.sort((a, b) => a.rank - b.rank));

    // Upcoming games for my team
    const allGames = listItems<KboGameSchedule>(STORE_KEYS.KBO_SCHEDULE);
    if (fandomProfile?.groupId) {
      setUpcomingGames(
        allGames
          .filter((g) => g.homeTeamId === fandomProfile.groupId || g.awayTeamId === fandomProfile.groupId)
          .slice(0, 4)
      );
    }

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

  // Build dashboard widgets
  const widgets: DashboardWidget[] = useMemo(() => {
    const w: DashboardWidget[] = [];

    // 1. Live Score (always visible when there are games)
    if (liveGames.length > 0) {
      w.push({
        id: "live-score",
        title: hasLiveGames ? "LIVE 경기" : "오늘의 경기",
        icon: Flame,
        required: true,
        noPadding: true,
        content: (
          <div className="p-3">
            <LiveGameSection
              games={liveGames}
              teams={groups}
              myTeamId={fandomProfile?.groupId}
            />
          </div>
        ),
      });
    }

    // 2. Next Game Countdown
    if (fandomProfile && myGroup) {
      w.push({
        id: "next-game",
        title: "다음 경기",
        icon: Calendar,
        noPadding: true,
        content: (
          <div className="p-3 h-full">
            <NextGameCountdown
              teamId={myGroup.id}
              teamName={myGroup.nameKo}
              teamColor={themeColor}
            />
          </div>
        ),
      });
    }

    // 3. Quick Actions (shortcuts)
    w.push({
      id: "quick-actions",
      title: "바로가기",
      icon: Zap,
      content: (
        <div className="grid grid-cols-2 gap-2 h-full">
          <Link
            to="/fandom/schedule"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <Calendar className="w-6 h-6 mb-1.5" style={{ color: themeColor }} />
            <p className="text-xs font-bold text-foreground">경기 일정</p>
          </Link>
          <Link
            to="/fandom/standings"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <BarChart3 className="w-6 h-6 text-emerald-500 mb-1.5" />
            <p className="text-xs font-bold text-foreground">순위표</p>
          </Link>
          <Link
            to="/fandom/create"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <Palette className="w-6 h-6 mb-1.5" style={{ color: themeColor }} />
            <p className="text-xs font-bold text-foreground">팬아트</p>
          </Link>
          <Link
            to="/fandom/stadium-guide"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <MapPin className="w-6 h-6 text-blue-500 mb-1.5" />
            <p className="text-xs font-bold text-foreground">직관 가이드</p>
          </Link>
          <Link
            to="/fandom/photocards"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <Camera className="w-6 h-6 text-pink-500 mb-1.5" />
            <p className="text-xs font-bold text-foreground">포토카드</p>
          </Link>
          <Link
            to="/fandom/goods"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <ShoppingBag className="w-6 h-6 text-orange-500 mb-1.5" />
            <p className="text-xs font-bold text-foreground">굿즈 교환</p>
          </Link>
        </div>
      ),
    });

    // 4. KBO Standings (live data preferred, fallback to local seed)
    const hasLiveStandings = liveStandings.length > 0;
    if (hasLiveStandings || standings.length > 0) {
      w.push({
        id: "standings",
        title: "KBO 순위",
        icon: BarChart3,
        moreLink: "/fandom/standings",
        content: (
          <StandingsTable
            standings={standings}
            liveStandings={hasLiveStandings ? liveStandings : undefined}
            myTeamId={fandomProfile?.groupId}
            compact
          />
        ),
      });
    }

    // 5. Quick Stats
    w.push({
      id: "quick-stats",
      title: "한눈에 보기",
      icon: TrendingUp,
      content: (
        <div className="grid grid-cols-2 gap-3 h-full">
          <Link to="/fandom/groups" className="rounded-xl p-3 bg-muted/30 hover:bg-muted transition-all group flex flex-col justify-center">
            <Users className="w-6 h-6 text-violet-500 mb-1" />
            <p className="text-xl font-black text-foreground">{groups.length}</p>
            <p className="text-xs text-muted-foreground">KBO 구단</p>
          </Link>
          <Link to="/fandom/feed" className="rounded-xl p-3 bg-muted/30 hover:bg-muted transition-all group flex flex-col justify-center">
            <Heart className="w-6 h-6 text-rose-500 mb-1" />
            <p className="text-xl font-black text-foreground">{totalFanart.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">팬아트</p>
          </Link>
          <Link to="/fandom/feed" className="rounded-xl p-3 bg-muted/30 hover:bg-muted transition-all group flex flex-col justify-center">
            <Rss className="w-6 h-6 text-cyan-500 mb-1" />
            <p className="text-xl font-black text-foreground">{feedPosts.length}</p>
            <p className="text-xs text-muted-foreground">피드 포스트</p>
          </Link>
          <Link to="/fandom/events" className="rounded-xl p-3 bg-muted/30 hover:bg-muted transition-all group flex flex-col justify-center">
            <Trophy className="w-6 h-6 text-amber-500 mb-1" />
            <p className="text-xl font-black text-foreground">{activeEvents.length}</p>
            <p className="text-xs text-muted-foreground">진행중 이벤트</p>
          </Link>
        </div>
      ),
    });

    // 6. My Team Feed
    if (myGroupPosts.length > 0 && fandomProfile) {
      w.push({
        id: "my-feed",
        title: `${fandomProfile.groupName} 팬아트`,
        icon: Heart,
        moreLink: "/fandom/feed",
        content: (
          <div className="grid grid-cols-2 gap-2">
            {myGroupPosts.slice(0, 4).map((post) => (
              <div
                key={post.id}
                className="rounded-xl overflow-hidden border border-border bg-muted/30"
              >
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.title} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/20" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-[11px] text-muted-foreground">{post.authorName}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      });
    }

    // 7. Fan Prediction Poll (NEW)
    w.push({
      id: "fan-poll",
      title: "팬 투표",
      icon: Vote,
      content: <FanPollWidget themeColor={themeColor} teamName={fandomProfile?.groupName} />,
    });

    // 8. Upcoming Games (My Team Schedule) — horizontal scroll
    if (upcomingGames.length > 0) {
      w.push({
        id: "my-schedule",
        title: `${fandomProfile?.groupName || "내 팀"} 경기 일정`,
        icon: Calendar,
        moreLink: "/fandom/schedule",
        noPadding: true,
        content: (
          <div className="flex gap-3 overflow-x-auto pb-2 px-3 pt-1 scrollbar-hide">
            {upcomingGames.map((game) => (
              <div key={game.id} className="min-w-[280px] max-w-[320px] flex-shrink-0">
                <GameScheduleCard game={game} teams={groups} compact />
              </div>
            ))}
          </div>
        ),
      });
    }

    // 9. Trending Groups
    w.push({
      id: "trending",
      title: "인기 구단",
      icon: TrendingUp,
      moreLink: "/fandom/groups",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {trendingGroups.map((group) => (
            <TeamCard key={group.id} group={group} />
          ))}
        </div>
      ),
    });

    // 10. Events
    const allVisibleEvents = [...myGroupEvents, ...otherActiveEvents].slice(0, 3);
    if (allVisibleEvents.length > 0) {
      w.push({
        id: "events",
        title: "진행중 이벤트",
        icon: Trophy,
        moreLink: "/fandom/events",
        content: (
          <div className="space-y-3">
            {allVisibleEvents.map((event) => (
              <FandomEventCard key={event.id} event={event} />
            ))}
          </div>
        ),
      });
    }

    // 11. Recent Projects
    if (recentProjects.length > 0) {
      w.push({
        id: "projects",
        title: "최근 프로젝트",
        icon: FolderOpen,
        moreLink: "/studio",
        content: (
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/editor/${project.id}`}
                className="flex items-center justify-between rounded-xl p-3 bg-muted/30 hover:bg-muted transition-all group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{project.title}</p>
                  <p className="text-xs text-muted-foreground">{project.panels}컷 · {project.updatedAt}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        ),
      });
    }

    return w;
  }, [
    liveGames, hasLiveGames, groups, fandomProfile, myGroup, themeColor,
    standings, liveStandings, feedPosts, myGroupPosts, activeEvents, myGroupEvents,
    otherActiveEvents, totalFanart, trendingGroups, upcomingGames,
    recentProjects,
  ]);

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto overflow-x-hidden">
        {/* Personalized Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              {fandomProfile ? (
                <>
                  <span style={{ color: themeColor }}>{fandomProfile.nickname}</span>님의{" "}
                  {fandomProfile.groupName} 팬덤
                </>
              ) : (
                "팬덤 허브"
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {fandomProfile
                ? `최애 선수: ${fandomProfile.favoritePlayer} | 팬덤: ${fandomProfile.fandomName}`
                : "좋아하는 구단의 팬아트를 만들고, 팬덤과 소통하세요"}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/fandom/create">
              <Button
                className="font-bold gap-2 text-white text-sm"
                style={{ background: themeColor }}
              >
                <Sparkles className="w-4 h-4" />
                팬아트 만들기
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Grid (draggable widgets) */}
        <DashboardGrid widgets={widgets} themeColor={themeColor} />
      </div>
    </StudioLayout>
  );
}

/** Fan Poll widget (new feature based on research) */
function FanPollWidget({ themeColor, teamName }: { themeColor: string; teamName?: string }) {
  const [voted, setVoted] = useState<string | null>(null);
  const [votes, setVotes] = useState({ win: 67, lose: 33 });

  const handleVote = (choice: string) => {
    if (voted) return;
    setVoted(choice);
    if (choice === "win") {
      setVotes((prev) => ({ ...prev, win: prev.win + 1 }));
    } else {
      setVotes((prev) => ({ ...prev, lose: prev.lose + 1 }));
    }
  };

  const total = votes.win + votes.lose;
  const winPct = Math.round((votes.win / total) * 100);
  const losePct = 100 - winPct;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-foreground mb-1">오늘의 예측</p>
        <p className="text-xs text-muted-foreground">
          {teamName || "내 팀"} 오늘 경기 결과는?
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleVote("win")}
          className={`w-full rounded-xl p-3 text-left transition-all border ${
            voted === "win" ? "border-current" : "border-border hover:border-foreground/20"
          }`}
          style={voted === "win" ? { borderColor: themeColor, background: `${themeColor}10` } : {}}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-foreground">승리</span>
            {voted && <span className="text-sm font-black" style={{ color: themeColor }}>{winPct}%</span>}
          </div>
          {voted && (
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${winPct}%`, background: themeColor }}
              />
            </div>
          )}
        </button>

        <button
          onClick={() => handleVote("lose")}
          className={`w-full rounded-xl p-3 text-left transition-all border ${
            voted === "lose" ? "border-current" : "border-border hover:border-foreground/20"
          }`}
          style={voted === "lose" ? { borderColor: "#ef4444", background: "#ef444410" } : {}}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-foreground">패배</span>
            {voted && <span className="text-sm font-black text-red-500">{losePct}%</span>}
          </div>
          {voted && (
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-500"
                style={{ width: `${losePct}%` }}
              />
            </div>
          )}
        </button>
      </div>

      {voted && (
        <p className="text-xs text-muted-foreground text-center">
          총 {total}명 참여
        </p>
      )}
    </div>
  );
}
