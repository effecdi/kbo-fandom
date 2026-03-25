import { useState } from "react";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import { FandomTagBadge } from "./fandom-tag-badge";
import { updateItem, STORE_KEYS, type FandomFeedPost } from "@/lib/local-store";

const TYPE_LABELS: Record<string, string> = {
  portrait: "포트레이트",
  photocard: "포토카드",
  wallpaper: "배경화면",
  fanart: "팬아트",
  sticker: "스티커",
  concept: "컨셉 포토",
  edit: "에디트",
  instatoon: "인스타툰",
  meme: "밈",
};

const TYPE_COLORS: Record<string, string> = {
  portrait: "bg-pink-500/20 text-pink-400",
  photocard: "bg-rose-500/20 text-rose-400",
  wallpaper: "bg-sky-500/20 text-sky-400",
  fanart: "bg-violet-500/20 text-violet-400",
  sticker: "bg-yellow-500/20 text-yellow-400",
  concept: "bg-indigo-500/20 text-indigo-400",
  edit: "bg-blue-500/20 text-blue-400",
  instatoon: "bg-primary/20 text-primary",
  meme: "bg-amber-500/20 text-amber-400",
};

interface FandomFeedPostCardProps {
  post: FandomFeedPost;
  onClick?: (post: FandomFeedPost) => void;
}

export function FandomFeedPostCard({ post, onClick }: FandomFeedPostCardProps) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);

  function toggleLike(e: React.MouseEvent) {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    updateItem<FandomFeedPost>(STORE_KEYS.FANDOM_FEED, post.id, {
      liked: newLiked,
      likes: newLiked ? post.likes + 1 : post.likes - 1,
    });
  }

  return (
    <div
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-foreground/15 transition-all hover:shadow-lg cursor-pointer"
      onClick={() => onClick?.(post)}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${TYPE_COLORS[post.type]}`}>
            {TYPE_LABELS[post.type]}
          </span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={toggleLike}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              liked ? "bg-rose-500/30 text-rose-400" : "bg-white/20 hover:bg-white/30 text-white"
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        {/* Fandom tags */}
        <div className="flex items-center gap-1 flex-wrap">
          <FandomTagBadge groupId={post.groupId} groupName={post.groupName} />
          {post.memberTags.slice(0, 2).map((m) => (
            <span key={m} className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
              {m}
            </span>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-foreground truncate">{post.title}</h3>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">{post.authorAvatar}</span>
          </div>
          <span className="text-xs text-muted-foreground">{post.authorName}</span>
          <span className="text-[11px] text-muted-foreground/50 ml-auto">{post.createdAt}</span>
        </div>

        <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 transition-colors ${liked ? "text-rose-400" : ""}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
            {likeCount.toLocaleString()}
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}
