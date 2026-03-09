import { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Download, Image as ImageIcon, Wand2, LayoutGrid, Paintbrush, Trees, Trash2, CheckSquare, Square, Loader2 } from "lucide-react";
import type { GenerationLight } from "@shared/schema";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 24;

interface GalleryPage {
  items: GenerationLight[];
  total: number;
  hasMore: boolean;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

export default function GalleryPage() {
  const [filter, setFilter] = useState<"all" | "character" | "pose" | "background">("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GalleryPage>({
    queryKey: ["/api/gallery", filter],
    refetchOnMount: "always",
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/gallery?limit=${PAGE_SIZE}&offset=${offset}&type=${filter}`, {
        headers,
      });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return lastPage.hasMore ? totalLoaded : undefined;
    },
  });

  // IntersectionObserver for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelected(new Set());
  }, [filter]);

  const allItems = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const queryClient = useQueryClient();

  const invalidateGallery = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/gallery/${id}`);
      return res.json();
    },
    onSuccess: invalidateGallery,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await apiRequest("POST", "/api/gallery/bulk-delete", { ids });
      return res.json();
    },
    onSuccess: () => {
      setSelected(new Set());
      invalidateGallery();
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/gallery");
      return res.json();
    },
    onSuccess: () => {
      setSelected(new Set());
      invalidateGallery();
    },
  });

  const downloadImage = async (genId: number) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/gallery/${genId}`, { headers });
      if (!res.ok) return;
      const fullGen = await res.json();
      const a = document.createElement("a");
      a.href = fullGen.resultImageUrl;
      a.download = `charagen-${Date.now()}.png`;
      a.click();
    } catch {
      // ignore
    }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isDeleting = bulkDeleteMutation.isPending || deleteAllMutation.isPending;
  const hasSelection = selected.size > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-gallery-title">갤러리</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">생성한 모든 캐릭터와 포즈를 확인하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList data-testid="tabs-gallery-filter">
              <TabsTrigger value="all" data-testid="tab-all">전체</TabsTrigger>
              <TabsTrigger value="character" data-testid="tab-characters">캐릭터</TabsTrigger>
              <TabsTrigger value="pose" data-testid="tab-poses">포즈</TabsTrigger>
              <TabsTrigger value="background" data-testid="tab-backgrounds">배경</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Selection action bar — appears when items are selected */}
      {hasSelection && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-muted/50 border transition-all">
          <span className="text-sm font-medium flex-1">
            {selected.size}개 선택됨
          </span>
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:border-red-400 disabled:opacity-40 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:border-red-500/50"
            disabled={isDeleting}
            onClick={() => {
              if (confirm(`${selected.size}개 항목을 삭제하시겠습니까?`)) {
                bulkDeleteMutation.mutate(Array.from(selected));
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            선택 삭제
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:border-red-400 disabled:opacity-40 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:border-red-500/50"
            disabled={total === 0 || isDeleting}
            onClick={() => {
              if (confirm("모든 항목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                deleteAllMutation.mutate();
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            전체 삭제
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-3.5 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">아직 이미지가 없어요</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            {filter === "all"
              ? "첫 번째 캐릭터를 만들어보세요"
              : `아직 ${filter === "character" ? "캐릭터가" : filter === "pose" ? "포즈가" : "배경이"} 없어요`}
          </p>
          <Button asChild data-testid="button-gallery-create">
            <a href="/create">캐릭터 만들기</a>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {allItems.map((gen) => {
              const isSelected = selected.has(gen.id);
              const imgSrc = gen.thumbnailUrl || gen.resultImageUrl;
              return (
                <Card
                  key={gen.id}
                  className={`overflow-hidden group hover-elevate cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
                  data-testid={`card-generation-${gen.id}`}
                  onClick={() => toggleSelect(gen.id)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={gen.prompt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    {/* Selection checkbox — always visible */}
                    <div className={`absolute top-2 left-2 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}>
                      {isSelected ? (
                        <CheckSquare className="h-6 w-6 text-primary drop-shadow-md" />
                      ) : (
                        <Square className="h-6 w-6 text-white/70 drop-shadow-md" />
                      )}
                    </div>
                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end justify-end p-3 gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ visibility: "visible" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("정말 삭제하시겠습니까?")) {
                            deleteMutation.mutate(gen.id);
                          }
                        }}
                        data-testid={`button-delete-${gen.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ visibility: "visible" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(gen.id);
                        }}
                        data-testid={`button-download-${gen.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <p className="text-sm font-medium truncate">{gen.prompt}</p>
                    <div className="flex items-center justify-between flex-wrap gap-1.5 mt-2">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {gen.type === "character" ? (
                          <><Wand2 className="h-3 w-3 mr-1" />{gen.type}</>
                        ) : gen.type === "background" ? (
                          <><Trees className="h-3 w-3 mr-1" />{gen.type}</>
                        ) : (
                          <><ImageIcon className="h-3 w-3 mr-1" />{gen.type}</>
                        )}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        {gen.characterId && (
                          <Link href={`/pose?characterId=${gen.characterId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-xs"
                              data-testid={`button-pose-${gen.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Paintbrush className="h-3 w-3" />
                              포즈
                            </Button>
                          </Link>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(gen.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
