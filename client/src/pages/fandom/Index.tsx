import { useState, useEffect, useMemo, useRef } from "react";
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
import { lazy, Suspense } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const LanyardCard = lazy(() => import("@/components/fandom/lanyard-card"));
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

  // Build dashboard widgets (static — no liveGames dependency)
  const widgets: DashboardWidget[] = useMemo(() => {
    const w: DashboardWidget[] = [];

    // 1. Live Score → rendered OUTSIDE grid (see JSX below)

    // 2. Next Game Countdown
    if (fandomProfile && myGroup) {
      w.push({
        id: "next-game",
        title: "다음 경기",
        icon: Calendar,
        content: (
          <NextGameCountdown
            teamId={myGroup.id}
            teamName={myGroup.nameKo}
            teamColor={themeColor}
          />
        ),
      });
    }

    // 3. Quick Actions — compact pill buttons
    w.push({
      id: "quick-actions",
      title: "바로가기",
      icon: Zap,
      defaultColSpan: 2,
      content: (
        <QuickActionPills themeColor={themeColor} />
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

    // 5. Quick Stats — 4-column horizontal layout, modern design
    w.push({
      id: "quick-stats",
      title: "한눈에 보기",
      icon: TrendingUp,
      defaultColSpan: 2,
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/fandom/groups" className="rounded-2xl p-5 bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all">
            <Users className="w-7 h-7 text-violet-500 mb-3" />
            <CountUp value={groups.length} className="text-2xl font-black text-foreground leading-none" />
            <p className="text-base text-muted-foreground mt-1.5">KBO 구단</p>
          </Link>
          <Link to="/fandom/feed" className="rounded-2xl p-5 bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/10 transition-all">
            <Heart className="w-7 h-7 text-rose-500 mb-3" />
            <CountUp value={totalFanart} className="text-2xl font-black text-foreground leading-none" />
            <p className="text-base text-muted-foreground mt-1.5">팬아트</p>
          </Link>
          <Link to="/fandom/feed" className="rounded-2xl p-5 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
            <Rss className="w-7 h-7 text-cyan-500 mb-3" />
            <CountUp value={feedPosts.length} className="text-2xl font-black text-foreground leading-none" />
            <p className="text-base text-muted-foreground mt-1.5">피드 포스트</p>
          </Link>
          <Link to="/fandom/events" className="rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all">
            <Trophy className="w-7 h-7 text-amber-500 mb-3" />
            <CountUp value={activeEvents.length} className="text-2xl font-black text-foreground leading-none" />
            <p className="text-base text-muted-foreground mt-1.5">진행중 이벤트</p>
          </Link>
        </div>
      ),
    });

    // 6. My Team Feed
    if (myGroupPosts.length > 0 && fandomProfile) {
      w.push({
        id: "my-feed",
        title: `${myGroup?.nameKo || fandomProfile.groupName} 팬아트`,
        icon: Heart,
        moreLink: "/fandom/feed",
        defaultColSpan: 2,
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
                  <p className="text-[13px] font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-[13px] text-muted-foreground">{post.authorName}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      });
    }

    // 7. Fan Prediction Poll — polls its own live data (60s)
    w.push({
      id: "fan-poll",
      title: "팬 투표",
      icon: Vote,
      content: <FanPollWidget themeColor={themeColor} teamName={myGroup?.nameKo || fandomProfile?.groupName} teamId={fandomProfile?.groupId} />,
    });

    // 8. Upcoming Games (My Team Schedule) — horizontal scroll
    if (upcomingGames.length > 0) {
      w.push({
        id: "my-schedule",
        title: `${myGroup?.nameKo || fandomProfile?.groupName || "내 팀"} 경기 일정`,
        icon: Calendar,
        moreLink: "/fandom/schedule",
        noPadding: true,
        defaultColSpan: 2,
        content: (
          <div className="flex gap-3 overflow-x-auto pb-6 px-5 md:pb-8 md:px-7 scrollbar-hide">
            {upcomingGames.map((game) => (
              <div key={game.id} className="min-w-[220px] max-w-[280px] flex-shrink-0">
                <GameScheduleCard game={game} teams={groups} compact />
              </div>
            ))}
          </div>
        ),
      });
    }

    // 9. Trending Groups — compact list
    w.push({
      id: "trending",
      title: "인기 구단",
      icon: TrendingUp,
      moreLink: "/fandom/groups",
      content: (
        <div className="divide-y divide-border">
          {trendingGroups.map((group, i) => (
            <Link
              key={group.id}
              to={`/fandom/groups/${group.id}`}
              className="flex items-center gap-3 py-3 px-1 hover:bg-muted/40 transition-colors rounded-lg"
            >
              <span className="text-[13px] font-black text-muted-foreground w-5 text-center">{i + 1}</span>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
                style={{ backgroundColor: group.coverColor }}
              >
                {group.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground truncate">{group.nameKo}</p>
                <p className="text-[13px] text-muted-foreground truncate">{group.fandomName} · {group.city}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            </Link>
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
                  <p className="text-base font-bold text-foreground truncate">{project.title}</p>
                  <p className="text-[13px] text-muted-foreground">{project.panels}컷 · {project.updatedAt}</p>
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
    groups, fandomProfile, myGroup, themeColor,
    standings, liveStandings, feedPosts, myGroupPosts, activeEvents, myGroupEvents,
    otherActiveEvents, totalFanart, trendingGroups, upcomingGames,
    recentProjects,
  ]);

  // Find my team's finished game today → victory placard
  const myTeamWin = useMemo(() => {
    if (!fandomProfile?.groupId) return null;
    const myId = fandomProfile.groupId;
    const finished = liveGames.filter((g) => g.status === "finished");
    for (const g of finished) {
      const isHome = g.homeTeamId === myId;
      const isAway = g.awayTeamId === myId;
      if (!isHome && !isAway) continue;
      const myScore = isHome ? (g.homeScore ?? 0) : (g.awayScore ?? 0);
      const oppScore = isHome ? (g.awayScore ?? 0) : (g.homeScore ?? 0);
      const oppName = isHome ? g.awayTeamName : g.homeTeamName;
      if (myScore > oppScore) return { myScore, oppScore, oppName, won: true as const };
      if (myScore < oppScore) return { myScore, oppScore, oppName, won: false as const };
      return { myScore, oppScore, oppName, won: null }; // draw
    }
    return null;
  }, [liveGames, fandomProfile]);

  // GSAP entrance animations
  const headerRef = useRef<HTMLDivElement>(null);
  const lanyardRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    // Header text entrance
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );
    }
    // Lanyard card swing-in from right
    if (lanyardRef.current) {
      gsap.fromTo(
        lanyardRef.current,
        { opacity: 0, x: 60, rotate: 8 },
        { opacity: 1, x: 0, rotate: 0, duration: 1, delay: 0.3, ease: "elastic.out(1, 0.6)" },
      );
    }
  }, []);

  return (
    <StudioLayout>
      {/* 포토카드 — 헤더 border에 붙어서 매달림 (데스크톱만), 클릭 시 에디터 */}
      <Link
        ref={lanyardRef}
        to="/fandom/create"
        className="fixed top-16 right-4 lg:right-8 z-20 hidden md:block"
        title="포토카드 디자인하기"
        style={{ opacity: 0 }}
      >
        <Suspense fallback={null}>
          <LanyardCard
            teamColor={themeColor}
            teamName={myGroup?.nameKo || "KBO"}
            playerName={fandomProfile?.favoritePlayer}
            cardImageUrl={fandomProfile?.lanyardCardUrl}
            height={360}
          />
        </Suspense>
      </Link>

      <div className="max-w-6xl mx-auto">
        {/* Personalized Header */}
        <div ref={headerRef} className="mb-6" style={{ opacity: 0 }}>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-black text-foreground">
              {fandomProfile ? (
                <>
                  <span style={{ color: themeColor }}>{fandomProfile.nickname}</span>님의{" "}
                  {myGroup?.nameKo || fandomProfile.groupName} 팬덤
                </>
              ) : (
                "팬덤 허브"
              )}
            </h1>

            {/* Victory/Defeat/Draw — clean text only */}
            {myTeamWin && myTeamWin.won && (
              <div className="flex items-center gap-3 animate-in slide-in-from-right duration-500">
                <span className="text-[13px] font-bold text-muted-foreground">vs {myTeamWin.oppName}</span>
                <span className="text-[32px] md:text-[40px] font-black tracking-tighter" style={{ color: themeColor }}>
                  {myTeamWin.myScore} : {myTeamWin.oppScore}
                </span>
                <span className="text-2xl md:text-[28px] font-black" style={{ color: themeColor }}>
                  이겼다!!!!
                </span>
              </div>
            )}
            {myTeamWin && myTeamWin.won === false && (
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-muted-foreground">vs {myTeamWin.oppName}</span>
                <span className="text-2xl font-black text-foreground">{myTeamWin.myScore} : {myTeamWin.oppScore}</span>
                <span className="text-base font-bold text-muted-foreground">아쉬운 패배</span>
              </div>
            )}
            {myTeamWin && myTeamWin.won === null && (
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-muted-foreground">vs {myTeamWin.oppName}</span>
                <span className="text-2xl font-black text-foreground">{myTeamWin.myScore} : {myTeamWin.oppScore}</span>
                <span className="text-base font-bold text-muted-foreground">무승부</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Score — independent from dashboard grid, polls every 10s */}
        {liveGames.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 pt-2 pb-3">
              <Flame className="w-5 h-5 shrink-0" style={{ color: themeColor }} />
              <span className="text-2xl font-black text-foreground">
                {hasLiveGames ? "LIVE 경기" : "오늘의 경기"}
              </span>
            </div>
            <LiveGameSection
              games={liveGames}
              teams={groups}
              myTeamId={fandomProfile?.groupId}
            />
          </div>
        )}

        {/* Dashboard Grid (draggable widgets — no 10s polling) */}
        <DashboardGrid widgets={widgets} themeColor={themeColor} />
      </div>
    </StudioLayout>
  );
}

/** Quick action pills with stagger animation */
function QuickActionPills({ themeColor }: { themeColor: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const pills = containerRef.current.querySelectorAll("a");
    if (pills.length === 0) return;

    gsap.set(pills, { opacity: 0, y: 12, scale: 0.9 });
    const tween = gsap.to(pills, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      stagger: 0.06,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 90%",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const items = [
    { to: "/fandom/schedule", icon: Calendar, label: "경기 일정", color: themeColor },
    { to: "/fandom/standings", icon: BarChart3, label: "순위표", color: "#10b981" },
    { to: "/fandom/create", icon: Palette, label: "팬아트", color: themeColor },
    { to: "/fandom/stadium-guide", icon: MapPin, label: "직관 가이드", color: "#3b82f6" },
    { to: "/fandom/photocards", icon: Camera, label: "포토카드", color: "#ec4899" },
    { to: "/fandom/goods", icon: ShoppingBag, label: "굿즈 교환", color: "#f97316" },
  ];

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-border bg-muted/30 hover:bg-muted hover:border-foreground/20 transition-all"
        >
          <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
          <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

/** Fan Poll widget — polls its own live data every 60s (independent of dashboard) */
function FanPollWidget({
  themeColor,
  teamName,
  teamId,
}: {
  themeColor: string;
  teamName?: string;
  teamId?: string;
}) {
  const { liveGames } = useKboLiveScores(60000); // 60s poll (not 10s)
  const POLL_KEY = "kbo-fan-poll-v1";
  const today = new Date().toISOString().split("T")[0];

  // Find my team's game today
  const myGame = teamId
    ? liveGames.find((g) => g.homeTeamId === teamId || g.awayTeamId === teamId)
    : null;

  const isHome = myGame?.homeTeamId === teamId;
  const oppName = myGame ? (isHome ? myGame.awayTeamName : myGame.homeTeamName) : null;
  const isFinished = myGame?.status === "finished";
  const myScore = myGame ? (isHome ? (myGame.homeScore ?? 0) : (myGame.awayScore ?? 0)) : 0;
  const oppScore = myGame ? (isHome ? (myGame.awayScore ?? 0) : (myGame.homeScore ?? 0)) : 0;
  const actualWin = isFinished ? myScore > oppScore : null;

  // Vote state persisted per day
  const [voted, setVoted] = useState<string | null>(() => {
    try {
      const data = JSON.parse(localStorage.getItem(POLL_KEY) || "{}");
      return data.date === today ? data.choice : null;
    } catch { return null; }
  });
  const [votes, setVotes] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(POLL_KEY) || "{}");
      return data.date === today && data.votes ? data.votes : { win: 67, lose: 33 };
    } catch { return { win: 67, lose: 33 }; }
  });

  const handleVote = (choice: string) => {
    if (voted || isFinished) return;
    const newVotes = { ...votes, [choice === "win" ? "win" : "lose"]: votes[choice === "win" ? "win" : "lose"] + 1 };
    setVoted(choice);
    setVotes(newVotes);
    try { localStorage.setItem(POLL_KEY, JSON.stringify({ date: today, choice, votes: newVotes })); } catch {}
  };

  const total = votes.win + votes.lose;
  const winPct = Math.round((votes.win / total) * 100);
  const losePct = 100 - winPct;
  const predictedCorrect = isFinished && voted && ((voted === "win" && actualWin === true) || (voted === "lose" && actualWin === false));

  // No game today
  if (!myGame) {
    return (
      <div className="text-center py-6">
        <p className="text-base font-bold text-foreground mb-1">오늘의 예측</p>
        <p className="text-[13px] text-muted-foreground">
          {teamName || "내 팀"} 오늘 경기가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-bold text-foreground mb-1">오늘의 예측</p>
        <p className="text-[13px] text-muted-foreground">
          {teamName || "내 팀"} vs {oppName} — {myGame.status === "live" ? "경기 진행중!" : isFinished ? "경기 종료" : `${myGame.time} 시작`}
        </p>
      </div>

      {/* Result banner when finished */}
      {isFinished && (
        <div
          className="rounded-xl p-3 text-center text-white"
          style={{
            background: actualWin
              ? `linear-gradient(135deg, ${themeColor}, ${themeColor}BB)`
              : "linear-gradient(135deg, #374151, #1f2937)",
          }}
        >
          <p className="text-[28px] font-black">{myScore} : {oppScore}</p>
          <p className="text-base font-bold mt-1">
            {actualWin ? "승리!!!" : myScore === oppScore ? "무승부" : "아쉬운 패배"}
          </p>
          {voted && (
            <p className="text-[13px] mt-1 opacity-80">
              {predictedCorrect ? "예측 적중!" : "예측이 빗나갔어요"}
            </p>
          )}
        </div>
      )}

      {/* Vote buttons (disabled after game ends) */}
      {!isFinished && (
        <div className="space-y-2">
          <button
            onClick={() => handleVote("win")}
            disabled={!!voted}
            className={`w-full rounded-xl p-3 text-left transition-all border ${
              voted === "win" ? "border-current" : "border-border hover:border-foreground/20"
            } disabled:cursor-default`}
            style={voted === "win" ? { borderColor: themeColor, background: `${themeColor}10` } : {}}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-base font-bold text-foreground">{teamName} 승리</span>
              {voted && <span className="text-base font-black" style={{ color: themeColor }}>{winPct}%</span>}
            </div>
            {voted && (
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${winPct}%`, background: themeColor }} />
              </div>
            )}
          </button>

          <button
            onClick={() => handleVote("lose")}
            disabled={!!voted}
            className={`w-full rounded-xl p-3 text-left transition-all border ${
              voted === "lose" ? "border-current" : "border-border hover:border-foreground/20"
            } disabled:cursor-default`}
            style={voted === "lose" ? { borderColor: "#ef4444", background: "#ef444410" } : {}}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-base font-bold text-foreground">{oppName} 승리</span>
              {voted && <span className="text-base font-black text-red-500">{losePct}%</span>}
            </div>
            {voted && (
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-red-500 transition-all duration-500" style={{ width: `${losePct}%` }} />
              </div>
            )}
          </button>
        </div>
      )}

      {voted && !isFinished && (
        <p className="text-[13px] text-muted-foreground text-center">
          총 {total}명 참여 · 경기 종료 후 결과 확인!
        </p>
      )}
    </div>
  );
}

/** Animated number counter — rolls up from 0 on scroll */
function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current || value === 0) return;
    const el = ref.current;
    el.textContent = "0";

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration: 1,
      delay: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 92%",
        toggleActions: "play none none none",
      },
      onUpdate: () => {
        el.textContent = Math.round(obj.val).toLocaleString();
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value]);

  return <p ref={ref} className={className}>{value.toLocaleString()}</p>;
}
