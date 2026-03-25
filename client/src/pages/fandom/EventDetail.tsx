import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { FandomFeedPostCard } from "@/components/fandom/fandom-feed-post-card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  getItem,
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type FandomEvent,
  type FandomFeedPost,
} from "@/lib/local-store";

const themeColor = "var(--fandom-primary, #7B2FF7)";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "진행중", color: "text-green-500 bg-green-500/10" },
  upcoming: { label: "예정", color: "text-amber-500 bg-amber-500/10" },
  ended: { label: "종료", color: "text-gray-500 bg-gray-500/10" },
};

const TYPE_LABELS: Record<string, string> = {
  challenge: "챌린지",
  contest: "콘테스트",
  anniversary: "기념일",
  collab: "콜라보",
};

export function FandomEventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<FandomEvent | null>(null);
  const [submissions, setSubmissions] = useState<FandomFeedPost[]>([]);

  useEffect(() => {
    seedIfEmpty();
    if (!id) return;
    const e = getItem<FandomEvent>(STORE_KEYS.FANDOM_EVENTS, id);
    setEvent(e);

    // Get posts tagged with this event's group as "submissions"
    if (e) {
      const allPosts = listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED);
      setSubmissions(allPosts.filter((p) => p.groupId === e.groupId).slice(0, 6));
    }
  }, [id]);

  if (!event) {
    return (
      <StudioLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">이벤트를 찾을 수 없습니다</p>
          <Link to="/fandom/events" className="text-sm hover:underline mt-2 inline-block" style={{ color: themeColor }}>
            이벤트 목록으로 돌아가기
          </Link>
        </div>
      </StudioLayout>
    );
  }

  const status = STATUS_CONFIG[event.status];

  return (
    <StudioLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <Link to="/fandom/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          이벤트 목록
        </Link>

        {/* Event Banner */}
        <div className="rounded-2xl overflow-hidden border border-border bg-card">
          <div
            className="h-48 relative"
            style={{ background: `linear-gradient(135deg, ${event.coverColor}, ${event.coverColor}66)` }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${status.color}`}>
                  {status.label}
                </span>
                <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-sm">
                  {TYPE_LABELS[event.type]}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">{event.title}</h1>
              <p className="text-white/80 text-sm mt-1">{event.groupName}</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-foreground/80">{event.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <div>
                  <p className="text-[11px] text-muted-foreground">시작</p>
                  <p className="font-medium text-foreground">{event.startDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <div>
                  <p className="text-[11px] text-muted-foreground">마감</p>
                  <p className="font-medium text-foreground">{event.endDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <div>
                  <p className="text-[11px] text-muted-foreground">참여자</p>
                  <p className="font-medium text-foreground">{event.participants}명</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-[11px] text-muted-foreground">상품</p>
                  <p className="font-medium text-foreground text-[12px]">{event.prize}</p>
                </div>
              </div>
            </div>

            {event.status === "active" && (
              <Link to="/fandom/create">
                <Button className="text-white font-bold gap-2 w-full" style={{ background: themeColor }}>
                  <Sparkles className="w-4 h-4" />
                  이벤트 참여하기
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Submissions */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">참여작</h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border bg-card">
              <Sparkles className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">아직 참여작이 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {submissions.map((post) => (
                <FandomFeedPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
