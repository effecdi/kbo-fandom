import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { updateItem, STORE_KEYS, type FandomComment } from "@/lib/local-store";

const themeColor = "var(--fandom-primary, #7B2FF7)";

interface CommentItemProps {
  comment: FandomComment;
  replies?: FandomComment[];
  onReply?: (commentId: string) => void;
}

export function CommentItem({ comment, replies = [], onReply }: CommentItemProps) {
  const [liked, setLiked] = useState(comment.liked);
  const [likeCount, setLikeCount] = useState(comment.likes);

  function toggleLike() {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => (newLiked ? c + 1 : c - 1));
    updateItem<FandomComment>(STORE_KEYS.FANDOM_COMMENTS, comment.id, {
      liked: newLiked,
      likes: newLiked ? comment.likes + 1 : comment.likes - 1,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: themeColor }}>
          <span className="text-[13px] text-white font-bold">{comment.authorAvatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{comment.authorName}</span>
            <span className="text-[13px] text-muted-foreground">{comment.createdAt}</span>
          </div>
          <p className="text-sm text-foreground/80 mt-0.5">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 text-[13px] transition-colors ${liked ? "text-rose-400" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
              {likeCount}
            </button>
            {onReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                답글
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 space-y-2 border-l-2 border-border pl-3">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
