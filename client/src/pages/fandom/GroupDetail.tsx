import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { FandomGroupHeader } from "@/components/fandom/fandom-group-header";
import { FandomFeedPostCard } from "@/components/fandom/fandom-feed-post-card";
import { FandomEventCard } from "@/components/fandom/fandom-event-card";
import { FandomRankingList } from "@/components/fandom/fandom-ranking-list";
import { CommentSection } from "@/components/fandom/comment-section";
import { Sparkles, Users as UsersIcon, Trophy, BarChart3, ArrowLeft, Music, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GameScheduleCard } from "@/components/fandom/game-schedule-card";
import { CheerSongCard } from "@/components/fandom/cheer-song-card";
import { StadiumInfoCard } from "@/components/fandom/stadium-info-card";
import {
  getItem,
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type KboTeam,
  type KboPlayer,
  type KboGameSchedule,
  type CheerSong,
  type StadiumGuide,
  type FandomFeedPost,
  type FandomEvent,
} from "@/lib/local-store";
import { Calendar } from "lucide-react";
import { useKboSchedule } from "@/hooks/use-kbo-schedule";

type GroupTab = "fanart" | "members" | "schedule" | "events" | "rankings" | "stadium";

const TABS: { id: GroupTab; label: string; icon: typeof Sparkles }[] = [
  { id: "fanart", label: "팬아트", icon: Sparkles },
  { id: "members", label: "선수", icon: UsersIcon },
  { id: "schedule", label: "경기일정", icon: Calendar },

  { id: "stadium", label: "직관", icon: MapPin },
  { id: "events", label: "이벤트", icon: Trophy },
  { id: "rankings", label: "랭킹", icon: BarChart3 },
];

export function FandomGroupDetail() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<KboTeam | null>(null);
  const [members, setMembers] = useState<KboPlayer[]>([]);
  const [posts, setPosts] = useState<FandomFeedPost[]>([]);
  const [events, setEvents] = useState<FandomEvent[]>([]);
  const [tab, setTab] = useState<GroupTab>("fanart");
  const [selectedPost, setSelectedPost] = useState<FandomFeedPost | null>(null);
  const [games, setGames] = useState<KboGameSchedule[]>([]);
  const [cheerSongs, setCheerSongs] = useState<CheerSong[]>([]);
  const [stadiumGuide, setStadiumGuide] = useState<StadiumGuide | null>(null);
  const [allTeams, setAllTeams] = useState<KboTeam[]>([]);
  const { games: scheduleGames } = useKboSchedule();

  useEffect(() => {
    seedIfEmpty();
    if (!id) return;
    const allGroups = listItems<KboTeam>(STORE_KEYS.KBO_TEAMS);
    setAllTeams(allGroups);
    const g = allGroups.find((gr) => gr.id === id) || null;
    setGroup(g);

    const allMembers = listItems<KboPlayer>(STORE_KEYS.KBO_PLAYERS);
    setMembers(allMembers.filter((m) => m.groupId === id));

    const allPosts = listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED);
    setPosts(allPosts.filter((p) => p.groupId === id));

    const allEvents = listItems<FandomEvent>(STORE_KEYS.FANDOM_EVENTS);
    setEvents(allEvents.filter((e) => e.groupId === id));

    // Games will be set from API hook below

    // Load cheer songs for this team
    const allSongs = listItems<CheerSong>(STORE_KEYS.CHEER_SONGS);
    setCheerSongs(allSongs.filter((s) => s.teamId === id).sort((a, b) => a.order - b.order));

    // Load stadium guide (LG and Doosan share Jamsil)
    const allGuides = listItems<StadiumGuide>(STORE_KEYS.STADIUM_GUIDES);
    const teamGuide = allGuides.find((sg) => sg.teamId === id);
    const fallbackGuide = id === "team-doo" ? allGuides.find((sg) => sg.teamId === "team-lg") : null;
    setStadiumGuide(teamGuide || fallbackGuide || null);
  }, [id]);

  // Update games from API schedule
  useEffect(() => {
    if (!id || scheduleGames.length === 0) return;
    setGames(scheduleGames.filter((g) => g.homeTeamId === id || g.awayTeamId === id));
  }, [id, scheduleGames]);

  if (!group) {
    return (
      <StudioLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">그룹을 찾을 수 없습니다</p>
          <Link to="/fandom/groups" className="text-sm text-primary hover:underline mt-2 inline-block">
            그룹 목록으로 돌아가기
          </Link>
        </div>
      </StudioLayout>
    );
  }

  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back */}
        <Link to="/fandom/groups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          그룹 목록
        </Link>

        {/* Header */}
        <FandomGroupHeader group={group} />

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border max-w-full overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.id
                  ? ""
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              style={tab === t.id ? { borderColor: group.coverColor, color: group.coverColor } : {}}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "fanart" && (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">아직 팬아트가 없습니다</p>
                <Link to="/fandom/create">
                  <Button
                    className="mt-3 text-white font-bold gap-2 hover:opacity-90"
                    size="sm"
                    style={{ backgroundColor: group.coverColor }}
                  >
                    <Sparkles className="w-4 h-4" />
                    첫 팬아트 만들기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <FandomFeedPostCard key={post.id} post={post} onClick={setSelectedPost} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "members" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-card border border-border rounded-2xl p-4 text-center hover:border-foreground/20 transition-all"
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white font-bold text-lg mb-3"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.slice(0, 1)}
                </div>
                <p className="text-sm font-bold text-foreground">{member.name}</p>
                <p className="text-[13px] text-muted-foreground">{member.nameKo}</p>
                <p className="text-[13px] text-muted-foreground mt-1">{member.position}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "schedule" && (
          <div>
            {games.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">등록된 경기 일정이 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {games.map((game) => (
                  <GameScheduleCard key={game.id} game={game} teams={allTeams} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "events" && (
          <div>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">등록된 이벤트가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <FandomEventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "stadium" && (
          <div>
            {stadiumGuide ? (
              <StadiumInfoCard guide={stadiumGuide} teamColor={group.coverColor} />
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">구장 정보가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {tab === "rankings" && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">크리에이터 랭킹</h3>
            <FandomRankingList groupId={group.id} />
          </div>
        )}

        {/* Post Detail Modal */}
        <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            {selectedPost && (
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px]">
                {/* Image */}
                <div className="bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center min-h-[250px] sm:min-h-[400px]">
                  {selectedPost.imageUrl ? (
                    <img src={selectedPost.imageUrl} alt={selectedPost.title} className="max-h-[70vh] w-full object-contain" />
                  ) : (
                    <Sparkles className="w-16 h-16 text-muted-foreground/20" />
                  )}
                </div>

                {/* Info + Comments */}
                <div className="p-5 space-y-4 flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: group.coverColor }}>
                      <span className="text-[13px] text-white font-bold">{selectedPost.authorAvatar}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{selectedPost.authorName}</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{selectedPost.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedPost.description}</p>

                  <div className="flex-1" />

                  <CommentSection postId={selectedPost.id} />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StudioLayout>
  );
}
