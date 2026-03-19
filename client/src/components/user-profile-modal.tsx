import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Users, FileText, UserPlus, UserMinus } from "lucide-react";
import type { UserPublicProfile, FeedPostWithAuthor } from "@shared/schema";

const GENRE_LABELS: Record<string, string> = {
  daily: "Daily",
  gag: "Comedy",
  romance: "Romance",
  fantasy: "Fantasy",
};

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
}

export function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery<UserPublicProfile>({
    queryKey: [`/api/users/${userId}/profile`],
    enabled: !!userId,
  });

  const { data: postsData } = useQuery<{ items: FeedPostWithAuthor[]; total: number }>({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      if (profile?.isFollowing) {
        await apiRequest("DELETE", `/api/users/${userId}/follow`);
      } else {
        await apiRequest("POST", `/api/users/${userId}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/profile`] });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/popular-creators"] });
    },
  });

  const isOwnProfile = user?.id === userId;

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Profile</DialogTitle>
        </DialogHeader>

        {profile && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.profileImageUrl || ""} />
                <AvatarFallback className="text-xl">
                  {(profile.authorName || profile.firstName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {profile.authorName || profile.firstName || "User"}
                </h3>
                {profile.genre && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {GENRE_LABELS[profile.genre] || profile.genre}
                  </Badge>
                )}
              </div>
              {isAuthenticated && !isOwnProfile && (
                <Button
                  variant={profile.isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className="gap-1.5"
                >
                  {profile.isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Posts", value: profile.postCount, icon: FileText },
                { label: "Followers", value: profile.followerCount, icon: Users },
                { label: "Following", value: profile.followingCount, icon: Users },
                { label: "Likes", value: profile.totalLikesReceived, icon: Heart },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-2 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-[13px] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {postsData && postsData.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Works</h4>
                <div className="grid grid-cols-3 gap-2">
                  {postsData.items.slice(0, 9).map((post) => (
                    <div
                      key={post.id}
                      className="aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <img
                        src={post.thumbnailUrl || post.imageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {postsData && postsData.items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No posts yet
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
