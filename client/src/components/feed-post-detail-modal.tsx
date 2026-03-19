import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Eye, Trash2 } from "lucide-react";
import type { FeedPostWithAuthor } from "@shared/schema";

const GENRE_LABELS: Record<string, string> = {
  daily: "Daily",
  gag: "Comedy",
  romance: "Romance",
  fantasy: "Fantasy",
};

interface FeedPostDetailModalProps {
  post: FeedPostWithAuthor | null;
  onClose: () => void;
  onAuthorClick?: (userId: string) => void;
}

export function FeedPostDetailModal({ post, onClose, onAuthorClick }: FeedPostDetailModalProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (post) {
      setLiked(post.isLiked ?? false);
      setLikeCount(post.likeCount);
    }
  }, [post?.id]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      if (liked) {
        await apiRequest("DELETE", `/api/feed/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/feed/${post.id}/like`);
      }
    },
    onMutate: () => {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c - 1 : c + 1));
    },
    onError: () => {
      if (post) {
        setLiked(post.isLiked ?? false);
        setLikeCount(post.likeCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      await apiRequest("DELETE", `/api/feed/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      onClose();
    },
  });

  if (!post) return null;

  const displayName = post.authorName || post.userId.slice(0, 8);
  const isOwn = user?.id === post.userId;
  const createdAt = new Date(post.createdAt);

  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px]">
          {/* Image */}
          <div className="bg-black flex items-center justify-center min-h-[300px] sm:min-h-[500px]">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="p-5 space-y-4 flex flex-col">
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 flex-1 min-w-0"
                onClick={() => {
                  onClose();
                  onAuthorClick?.(post.userId);
                }}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={post.authorProfileImageUrl || ""} />
                  <AvatarFallback className="text-[13px]">
                    {(post.authorName || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                  {post.authorGenre && (
                    <Badge variant="secondary" className="text-[9px] mt-0.5">
                      {GENRE_LABELS[post.authorGenre] || post.authorGenre}
                    </Badge>
                  )}
                </div>
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold">{post.title}</h2>
              {post.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.description}</p>
              )}
            </div>

            <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {createdAt.toLocaleDateString()}
              </span>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 ${liked ? "text-red-500" : ""}`}
                onClick={() => isAuthenticated && likeMutation.mutate()}
                disabled={!isAuthenticated || likeMutation.isPending}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`} />
                <span className="font-medium">{likeCount}</span>
              </Button>

              {isOwn && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive ml-auto"
                  onClick={() => {
                    if (confirm("Delete this post?")) deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
