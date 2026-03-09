import { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TrendingUp, Clock, Users } from "lucide-react";
import { FeedPostCard } from "@/components/feed-post-card";
import { FeedPostDetailModal } from "@/components/feed-post-detail-modal";
import { UserProfileModal } from "@/components/user-profile-modal";
import { PublishToFeedDialog } from "@/components/publish-to-feed-dialog";
import { supabase } from "@/lib/supabase";
import type { FeedPostWithAuthor } from "@shared/schema";

const PAGE_SIZE = 20;

interface FeedPage {
  items: FeedPostWithAuthor[];
  total: number;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

type FeedTab = "recent" | "popular" | "following";

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<FeedTab>("recent");
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [detailPost, setDetailPost] = useState<FeedPostWithAuthor | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const sort = tab === "popular" ? "popular" : "recent";
  const filter = tab === "following" ? "following" : undefined;

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<FeedPage>({
    queryKey: ["/api/feed", tab],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
        sort,
      });
      if (filter) params.set("filter", filter);

      const res = await fetch(`/api/feed?${params}`, { headers });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return totalLoaded < lastPage.total ? totalLoaded : undefined;
    },
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-20 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore works from creators
          </p>
        </div>
        {isAuthenticated && (
          <PublishToFeedDialog>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              Publish
            </Button>
          </PublishToFeedDialog>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as FeedTab)}>
        <TabsList>
          <TabsTrigger value="recent" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="popular" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Popular
          </TabsTrigger>
          {isAuthenticated && (
            <TabsTrigger value="following" className="gap-1.5">
              <Users className="h-4 w-4" />
              Following
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <p className="text-muted-foreground">
            {tab === "following" ? "No posts from creators you follow" : "No posts yet"}
          </p>
          {isAuthenticated && (
            <PublishToFeedDialog>
              <Button variant="outline" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create First Post
              </Button>
            </PublishToFeedDialog>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allItems.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                onAuthorClick={(userId) => setProfileUserId(userId)}
                onPostClick={(p) => setDetailPost(p)}
              />
            ))}
          </div>

          <div ref={loadMoreRef} className="py-4 text-center">
            {isFetchingNextPage && (
              <div className="flex justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>
        </>
      )}

      <FeedPostDetailModal
        post={detailPost}
        onClose={() => setDetailPost(null)}
        onAuthorClick={(userId) => setProfileUserId(userId)}
      />

      <UserProfileModal
        userId={profileUserId}
        onClose={() => setProfileUserId(null)}
      />
    </div>
  );
}
