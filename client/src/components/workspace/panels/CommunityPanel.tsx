import { useState, useEffect } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  Rss,
  Trophy,
  TrendingUp,
  Rocket,
  Heart,
  MessageCircle,
} from "lucide-react";
import {
  listItems,
  STORE_KEYS,
  type FandomFeedPost,
  type FandomEvent,
} from "@/lib/local-store";

export function CommunityPanel() {
  const { state, dispatch } = useWorkspace();
  const fandomMeta = state.fandomMeta;

  const [recentPosts, setRecentPosts] = useState<FandomFeedPost[]>([]);
  const [activeEvents, setActiveEvents] = useState<FandomEvent[]>([]);

  useEffect(() => {
    const posts = listItems<FandomFeedPost>(STORE_KEYS.FANDOM_FEED);
    const filtered = fandomMeta
      ? posts.filter((p) => p.groupId === fandomMeta.groupId)
      : posts;
    setRecentPosts(filtered.slice(0, 5));

    const events = listItems<FandomEvent>(STORE_KEYS.FANDOM_EVENTS);
    setActiveEvents(events.filter((e) => e.status === "active").slice(0, 3));
  }, [fandomMeta]);

  function handlePublishClick() {
    // Open publish dialog by dispatching custom event
    window.dispatchEvent(new CustomEvent("open-publish-dialog"));
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider px-1">커뮤니티</h3>

      {/* Quick publish button */}
      <button
        onClick={handlePublishClick}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all"
      >
        <Rocket className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary">팬덤에 게시</span>
      </button>

      {/* Recent feed */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Rss className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-semibold text-white/50">최근 피드</span>
        </div>
        {recentPosts.length > 0 ? (
          <div className="space-y-1">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="w-8 h-8 rounded-md object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-white/[0.04] shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/70 truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5" /> {post.likes}
                    </span>
                    <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                      <MessageCircle className="w-2.5 h-2.5" /> {post.commentCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-white/20 py-2 px-1">아직 피드가 없습니다</p>
        )}
      </div>

      {/* Active events */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-semibold text-white/50">진행 중 이벤트</span>
        </div>
        {activeEvents.length > 0 ? (
          <div className="space-y-1">
            {activeEvents.map((event) => (
              <div
                key={event.id}
                className="px-2 py-2 rounded-lg border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
              >
                <p className="text-[11px] font-medium text-white/70">{event.title}</p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {event.endDate} 마감
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-white/20 py-2 px-1">진행 중인 이벤트가 없습니다</p>
        )}
      </div>

      {/* Fanart ranking */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[11px] font-semibold text-white/50">팬아트 랭킹 Top 3</span>
        </div>
        {recentPosts.slice(0, 3).map((post, i) => (
          <div
            key={post.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <span className="text-[11px] font-black text-white/30 w-4 text-center">{i + 1}</span>
            <p className="text-[11px] text-white/60 truncate flex-1">{post.title}</p>
            <span className="text-[10px] text-white/30 flex items-center gap-0.5">
              <Heart className="w-2.5 h-2.5" /> {post.likes}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
