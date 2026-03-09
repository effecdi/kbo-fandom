import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { FeedPostWithAuthor } from "@shared/schema";

interface FeedPostCardProps {
  post: FeedPostWithAuthor;
  onAuthorClick?: (userId: string) => void;
  onPostClick?: (post: FeedPostWithAuthor) => void;
}

export function FeedPostCard({ post, onAuthorClick, onPostClick }: FeedPostCardProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  useEffect(() => {
    setLiked(post.isLiked ?? false);
    setLikeCount(post.likeCount);
  }, [post.isLiked, post.likeCount]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (liked) {
        await apiRequest("DELETE", `/api/feed/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/feed/${post.id}/like`);
      }
    },
    onMutate: () => {
      setLiked(!liked);
      setLikeCount((c) => (liked ? c - 1 : c + 1));
    },
    onError: () => {
      setLiked(liked);
      setLikeCount(likeCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  const displayName = post.authorName || post.userId.slice(0, 8);
  const imageUrl = post.thumbnailUrl || post.imageUrl;

  return (
    <div className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md">
      <button
        className="aspect-[3/4] overflow-hidden bg-muted w-full cursor-pointer"
        onClick={() => onPostClick?.(post)}
      >
        <img
          src={imageUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </button>
      <div className="p-3 space-y-2">
        <button
          className="flex items-center gap-2 w-full text-left"
          onClick={() => onAuthorClick?.(post.userId)}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={post.authorProfileImageUrl || ""} />
            <AvatarFallback className="text-[10px]">
              {(post.authorName || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate flex-1">{displayName}</span>
          {post.authorGenre && (
            <Badge variant="secondary" className="text-[9px] shrink-0">
              {post.authorGenre === "daily" ? "Daily" : post.authorGenre === "gag" ? "Comedy" : post.authorGenre === "romance" ? "Romance" : post.authorGenre === "fantasy" ? "Fantasy" : post.authorGenre}
            </Badge>
          )}
        </button>

        <button
          className="text-sm font-medium truncate w-full text-left hover:text-primary transition-colors"
          onClick={() => onPostClick?.(post)}
        >
          {post.title}
        </button>

        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            onClick={() => isAuthenticated && likeMutation.mutate()}
            disabled={!isAuthenticated || likeMutation.isPending}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
