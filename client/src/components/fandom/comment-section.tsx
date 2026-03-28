import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentItem } from "./comment-item";
import {
  listItems,
  addItem,
  generateId,
  STORE_KEYS,
  type FandomComment,
} from "@/lib/local-store";

const themeColor = "var(--fandom-primary, #7B2FF7)";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<FandomComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    const all = listItems<FandomComment>(STORE_KEYS.FANDOM_COMMENTS);
    setComments(all.filter((c) => c.postId === postId));
  }, [postId]);

  function handleSubmit() {
    if (!newComment.trim()) return;
    const comment: FandomComment = {
      id: generateId("fc"),
      postId,
      authorName: "나",
      authorAvatar: "ME",
      content: newComment.trim(),
      likes: 0,
      liked: false,
      parentId: replyTo || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addItem(STORE_KEYS.FANDOM_COMMENTS, comment);
    setComments((prev) => [...prev, comment]);
    setNewComment("");
    setReplyTo(null);
  }

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesMap: Record<string, FandomComment[]> = {};
  comments
    .filter((c) => c.parentId)
    .forEach((c) => {
      if (!repliesMap[c.parentId!]) repliesMap[c.parentId!] = [];
      repliesMap[c.parentId!].push(c);
    });

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-bold text-foreground">
        댓글 {comments.length}개
      </h3>

      {/* Comment list */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {topLevel.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            첫 번째 댓글을 남겨보세요!
          </p>
        ) : (
          topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={repliesMap[comment.id] || []}
              onReply={(id) => setReplyTo(id)}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <div className="flex-1 relative">
          {replyTo && (
            <div className="text-[13px] text-muted-foreground mb-1 flex items-center gap-1">
              답글 작성 중...
              <button
                onClick={() => setReplyTo(null)}
                className="hover:underline"
                style={{ color: themeColor }}
              >
                취소
              </button>
            </div>
          )}
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="댓글을 입력하세요..."
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            onFocus={(e) => (e.currentTarget.style.borderColor = themeColor)}
            onBlur={(e) => (e.currentTarget.style.borderColor = "")}
          />
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="text-white"
          style={{ background: themeColor }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
