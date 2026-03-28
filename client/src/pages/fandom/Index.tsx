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
            <p className="text-[13px] font-bold text-foreground">경기 일정</p>
          </Link>
          <Link
            to="/fandom/standings"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <BarChart3 className="w-6 h-6 text-emerald-500 mb-1.5" />
            <p className="text-[13px] font-bold text-foreground">순위표</p>
          </Link>
          <Link
            to="/fandom/create"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <Palette className="w-6 h-6 mb-1.5" style={{ color: themeColor }} />
            <p className="text-[13px] font-bold text-foreground">팬아트</p>
          </Link>
          <Link
            to="/fandom/stadium-guide"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <MapPin className="w-6 h-6 text-blue-500 mb-1.5" />
            <p className="text-[13px] font-bold text-foreground">직관 가이드</p>
          </Link>
          <Link
            to="/fandom/photocards"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <Camera className="w-6 h-6 text-pink-500 mb-1.5" />
            <p className="text-[13px] font-bold text-foreground">포토카드</p>
          </Link>
          <Link
            to="/fandom/goods"
            className="rounded-xl p-3 border bg-muted/30 border-border hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
          >
            <ShoppingBag className="w-6 h-6 text-orange-500 mb-1.5" />
            <p className="text-[13px] font-bold text-foreground">굿즈 교환</p>
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
            <p className="text-[13px] text-muted-foreground">KBO 구단</p>
          </Link>
          <Link to="/fandom/feed" className="rounded-xl p-3 bg-muted/30 hover:bg-muted transition-all group flex flex-col justify-center">
            <Heart className="w-6 h-6 text-rose-500 mb-1" />
            <p className="text-xl font-black text-foreground">{totalFanart.toLocaleString()}</p>
            <p className="text-[13px] text-muted-foreground">팬아트</p>
          </Link>
          <Link to="/fandom/feed" className="rounded-xl p-3 bg-muted/30 hover:bg-muted transition-all group flex flex-col justify-center">
            <Rss className="w-6 h-6 text-cyan-500 mb-1" />
            <p className="text-xl font-black text-foreground">{feedPosts.length}</p>
            <p className="text-[13px] text-muted-foreground">피드 포스트</p>
          </Link>
          <Link to="/fandom/events" className="rounded-xl p-3 bg-muted/30 hover:bg-muted transition-all group flex flex-col justify-center">
            <Trophy className="w-6 h-6 text-amber-500 mb-1" />
            <p className="text-xl font-black text-foreground">{activeEvents.length}</p>
            <p className="text-[13px] text-muted-foreground">진행중 이벤트</p>
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
                  <p className="text-[13px] font-medium text-foreground truncate">{post.title}</p>
                  <p className="text-[13px] text-muted-foreground">{post.authorName}</p>
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
      content: <FanPollWidget themeColor={themeColor} teamName={fandomProfile?.groupName} teamId={fandomProfile?.groupId} liveGames={liveGames} />,
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
                  <p className="text-[15px] font-bold text-foreground truncate">{project.title}</p>
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
    liveGames, hasLiveGames, groups, fandomProfile, myGroup, themeColor,
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

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto overflow-x-hidden">
        {/* Personalized Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">
              {fandomProfile ? (
                <>
                  <span style={{ color: themeColor }}>{fandomProfile.nickname}</span>님의{" "}
                  {fandomProfile.groupName} 팬덤
                </>
              ) : (
                "팬덤 허브"
              )}
            </h1>

            {/* Victory Placard — 타이틀 바로 옆 */}
            {myTeamWin && myTeamWin.won && (
              <div
                className="relative overflow-hidden rounded-2xl text-white flex items-center gap-3 px-5 py-2.5 animate-in slide-in-from-right duration-500"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}DD, ${themeColor}AA)`,
                  boxShadow: `0 4px 24px ${themeColor}55, 0 0 60px ${themeColor}22`,
                }}
              >
                {/* Sparkle effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-1 left-3 w-2 h-2 rounded-full bg-white/40 animate-ping" />
                  <div className="absolute bottom-1.5 right-4 w-1.5 h-1.5 rounded-full bg-white/30 animate-ping" style={{ animationDelay: "0.3s" }} />
                  <div className="absolute top-2 right-12 w-1 h-1 rounded-full bg-white/25 animate-ping" style={{ animationDelay: "0.7s" }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-pulse" />
                </div>

                <div className="relative z-10 flex items-center gap-3">
                  {/* Score */}
                  <div className="text-center leading-none">
                    <p className="text-[13px] font-bold opacity-70 mb-0.5">vs {myTeamWin.oppName}</p>
                    <p className="text-3xl md:text-4xl font-black tracking-tighter">
                      {myTeamWin.myScore} : {myTeamWin.oppScore}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-12 bg-white/30" />

                  {/* 이겼다!!!! text */}
                  <div className="text-center">
                    <p className="text-2xl md:text-3xl font-black tracking-tight" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                      이겼다!!!!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 패배/무승부 — 작게 */}
            {myTeamWin && myTeamWin.won === false && (
              <div className="rounded-xl bg-muted/60 border border-border px-4 py-2 flex items-center gap-2">
                <span className="text-[15px] font-bold text-muted-foreground">vs {myTeamWin.oppName}</span>
                <span className="text-xl font-black text-foreground">{myTeamWin.myScore} : {myTeamWin.oppScore}</span>
                <span className="text-[15px] font-bold text-muted-foreground">아쉬운 패배</span>
              </div>
            )}
            {myTeamWin && myTeamWin.won === null && (
              <div className="rounded-xl bg-muted/60 border border-border px-4 py-2 flex items-center gap-2">
                <span className="text-[15px] font-bold text-muted-foreground">vs {myTeamWin.oppName}</span>
                <span className="text-xl font-black text-foreground">{myTeamWin.myScore} : {myTeamWin.oppScore}</span>
                <span className="text-[15px] font-bold text-muted-foreground">무승부</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
            <p className="text-sm text-muted-foreground truncate">
              {fandomProfile
                ? `최애 선수: ${fandomProfile.favoritePlayer} | 팬덤: ${fandomProfile.fandomName}`
                : "좋아하는 구단의 팬아트를 만들고, 팬덤과 소통하세요"}
            </p>
            <Link to="/fandom/create" className="shrink-0">
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

/** Fan Poll widget — uses actual live game data */
function FanPollWidget({
  themeColor,
  teamName,
  teamId,
  liveGames,
}: {
  themeColor: string;
  teamName?: string;
  teamId?: string;
  liveGames: KboGameSchedule[];
}) {
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
        <p className="text-[15px] font-bold text-foreground mb-1">오늘의 예측</p>
        <p className="text-[13px] text-muted-foreground">
          {teamName || "내 팀"} 오늘 경기가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[15px] font-bold text-foreground mb-1">오늘의 예측</p>
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
          <p className="text-2xl font-black">{myScore} : {oppScore}</p>
          <p className="text-[15px] font-bold mt-1">
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
              <span className="text-[15px] font-bold text-foreground">{teamName} 승리</span>
              {voted && <span className="text-[15px] font-black" style={{ color: themeColor }}>{winPct}%</span>}
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
              <span className="text-[15px] font-bold text-foreground">{oppName} 승리</span>
              {voted && <span className="text-[15px] font-black text-red-500">{losePct}%</span>}
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
