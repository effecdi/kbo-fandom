import { useState, useRef, useCallback, useEffect } from "react";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Download, Image as ImageIcon, Wand2, LayoutGrid, Paintbrush, Trees, Trash2, CheckSquare, Square, Loader2, FolderPlus, Folder, X, Plus, Pencil, Check, RefreshCw, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { GenerationLight, CharacterFolder } from "@shared/schema";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 24;

interface GalleryPage {
  items: GenerationLight[];
  total: number;
  hasMore: boolean;
}

type CharacterFolderWithItems = CharacterFolder & { items: { generationId: number; thumbnailUrl?: string | null; characterName?: string | null; prompt?: string | null }[] };

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

function InlineNameEditor({ genId, initialName, prompt }: { genId: number; initialName: string | null | undefined; prompt: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName || "");
  const savedRef = useRef(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await apiRequest("PATCH", `/api/gallery/${genId}/name`, { name: newName });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/character-folders"] });
    },
  });

  const save = () => {
    if (savedRef.current) return;
    savedRef.current = true;
    mutation.mutate(name.trim());
    setEditing(false);
  };

  const startEdit = () => {
    savedRef.current = false;
    setName(initialName || "");
    setEditing(true);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { savedRef.current = true; setEditing(false); } }}
          onBlur={save}
          className="h-6 text-xs px-1.5"
          autoFocus
          maxLength={100}
        />
      </div>
    );
  }

  const displayName = initialName || prompt;
  return (
    <div className="flex items-center gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
      <p className="text-sm font-medium truncate flex-1">{displayName}</p>
      <button
        className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-70"
        onClick={(e) => { e.stopPropagation(); startEdit(); }}
        title="이름 편집"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  );
}

function FolderItemNameEditor({ genId, initialName, prompt }: { genId: number; initialName: string | null | undefined; prompt: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName || "");
  const savedRef = useRef(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await apiRequest("PATCH", `/api/gallery/${genId}/name`, { name: newName });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/character-folders"] });
    },
  });

  const save = () => {
    if (savedRef.current) return;
    savedRef.current = true;
    mutation.mutate(name.trim());
    setEditing(false);
  };

  const startEdit = () => {
    savedRef.current = false;
    setName(initialName || "");
    setEditing(true);
  };

  if (editing) {
    return (
      <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { savedRef.current = true; setEditing(false); } }}
          onBlur={save}
          className="h-6 text-xs px-1.5"
          autoFocus
          maxLength={100}
        />
      </div>
    );
  }

  const displayName = initialName || prompt || "캐릭터";
  return (
    <span
      className="text-xs truncate flex-1 min-w-0 cursor-pointer hover:underline"
      onClick={(e) => { e.stopPropagation(); startEdit(); }}
      title="클릭하여 이름 편집"
    >
      {displayName}
    </span>
  );
}

function FolderNameEditor({ folder, onUpdate }: { folder: CharacterFolderWithItems; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const savedRef = useRef(false);

  const mutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await apiRequest("PATCH", `/api/character-folders/${folder.id}`, { name: newName });
      return res.json();
    },
    onSuccess: onUpdate,
  });

  const save = () => {
    if (savedRef.current) return;
    savedRef.current = true;
    const trimmed = name.trim();
    if (trimmed && trimmed !== folder.name) {
      mutation.mutate(trimmed);
    }
    setEditing(false);
  };

  const startEdit = () => {
    savedRef.current = false;
    setName(folder.name);
    setEditing(true);
  };

  if (editing) {
    return (
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { savedRef.current = true; setEditing(false); } }}
        onBlur={save}
        className="h-6 text-sm font-semibold px-1"
        autoFocus
        maxLength={50}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <div className="flex items-center gap-1 min-w-0 flex-1">
      <span className="text-sm font-semibold truncate">{folder.name}</span>
      <button
        className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors opacity-0 group-hover/folder:opacity-70"
        onClick={(e) => { e.stopPropagation(); startEdit(); }}
        title="폴더 이름 수정"
      >
        <Pencil className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

export default function GalleryPage() {
  const [filter, setFilter] = useState<"all" | "character" | "pose" | "background">("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddToFolder, setShowAddToFolder] = useState(false);
  const [regenTarget, setRegenTarget] = useState<GenerationLight | null>(null);
  const [regenPrompt, setRegenPrompt] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();

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

  // Character folders
  const { data: characterFolders = [] } = useQuery<CharacterFolderWithItems[]>({
    queryKey: ["/api/character-folders"],
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    queryClient.invalidateQueries({ queryKey: ["/api/character-folders"] });
  };

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/character-folders", { name });
      return res.json();
    },
    onSuccess: () => {
      setNewFolderName("");
      invalidateAll();
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/character-folders/${id}`);
      return res.json();
    },
    onSuccess: invalidateAll,
  });

  const addToFolderMutation = useMutation({
    mutationFn: async ({ folderId, generationIds }: { folderId: number; generationIds: number[] }) => {
      const res = await apiRequest("POST", `/api/character-folders/${folderId}/items`, { generationIds });
      return res.json();
    },
    onSuccess: () => {
      setSelected(new Set());
      setShowAddToFolder(false);
      invalidateAll();
    },
  });

  const removeFolderItemMutation = useMutation({
    mutationFn: async ({ folderId, generationId }: { folderId: number; generationId: number }) => {
      const res = await apiRequest("DELETE", `/api/character-folders/${folderId}/items/${generationId}`);
      return res.json();
    },
    onSuccess: invalidateAll,
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

  const invalidateGallery = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/gallery/${id}`);
      return res.json();
    },
    onSuccess: invalidateAll,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await apiRequest("POST", "/api/gallery/bulk-delete", { ids });
      return res.json();
    },
    onSuccess: () => {
      setSelected(new Set());
      invalidateAll();
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/gallery");
      return res.json();
    },
    onSuccess: () => {
      setSelected(new Set());
      invalidateAll();
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async ({ id, prompt }: { id: number; prompt: string }) => {
      const res = await apiRequest("POST", `/api/gallery/${id}/regenerate`, { prompt });
      return res.json();
    },
    onSuccess: () => {
      setRegenTarget(null);
      setRegenPrompt("");
      invalidateAll();
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

  // Build a map: generationId → thumbnail for folder display
  const genThumbnailMap = new Map<number, { thumb: string; name: string | null | undefined; prompt: string }>();
  for (const item of allItems) {
    genThumbnailMap.set(item.id, {
      thumb: (item.thumbnailUrl || item.resultImageUrl) as string,
      name: item.characterName,
      prompt: item.prompt,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
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

          {/* Selection action bar */}
          {hasSelection && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-muted/50 border transition-all">
              <span className="text-sm font-medium flex-1">
                {selected.size}개 선택됨
              </span>
              <button
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 hover:border-primary/50"
                onClick={() => setShowAddToFolder(!showAddToFolder)}
              >
                <FolderPlus className="h-3.5 w-3.5" />
                폴더에 추가
              </button>
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

          {/* Add to folder dropdown */}
          {showAddToFolder && hasSelection && (
            <div className="mb-4 p-3 rounded-lg bg-background border space-y-2">
              <p className="text-xs font-medium text-muted-foreground">폴더 선택:</p>
              {characterFolders.length === 0 ? (
                <p className="text-xs text-muted-foreground">폴더가 없습니다. 오른쪽 사이드바에서 폴더를 먼저 만들어주세요.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {characterFolders.map((folder) => (
                    <button
                      key={folder.id}
                      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                      onClick={() => addToFolderMutation.mutate({ folderId: folder.id, generationIds: Array.from(selected) })}
                      disabled={addToFolderMutation.isPending}
                    >
                      <Folder className="h-3 w-3" />
                      {folder.name}
                    </button>
                  ))}
                </div>
              )}
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
                        <div className={`absolute top-2 left-2 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}>
                          {isSelected ? (
                            <CheckSquare className="h-6 w-6 text-primary drop-shadow-md" />
                          ) : (
                            <Square className="h-6 w-6 text-white/70 drop-shadow-md" />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end justify-end p-3 gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ visibility: "visible" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRegenPrompt("");
                              setRegenTarget(gen);
                            }}
                            title="재생성"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
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
                        <InlineNameEditor genId={gen.id} initialName={gen.characterName} prompt={gen.prompt} />
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

        {/* Right sidebar - Character Folders */}
        <div className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">캐릭터 폴더</h3>
            </div>

            {/* New folder input */}
            <div className="flex items-center gap-1.5">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFolderName.trim()) {
                    createFolderMutation.mutate(newFolderName.trim());
                  }
                }}
                placeholder="새 폴더 이름"
                className="h-8 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 shrink-0"
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
                onClick={() => {
                  if (newFolderName.trim()) createFolderMutation.mutate(newFolderName.trim());
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Folder list */}
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {characterFolders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  폴더가 없습니다
                </p>
              ) : (
                characterFolders.map((folder) => {
                  const isOpen = openFolders.has(folder.id);
                  return (
                    <div key={folder.id} className="rounded-lg border group/folder">
                      <div
                        className="flex items-center justify-between gap-1 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setOpenFolders(prev => {
                          const next = new Set(prev);
                          if (next.has(folder.id)) next.delete(folder.id);
                          else next.add(folder.id);
                          return next;
                        })}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-250 ${isOpen ? "" : "-rotate-90"}`} />
                          <FolderNameEditor folder={folder} onUpdate={invalidateAll} />
                          {folder.items.length > 0 && (
                            <span className="text-xs text-muted-foreground shrink-0">({folder.items.length})</span>
                          )}
                        </div>
                        <button
                          className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`"${folder.name}" 폴더를 삭제하시겠습니까?`)) {
                              deleteFolderMutation.mutate(folder.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {folder.items.length > 0 && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateRows: isOpen ? "1fr" : "0fr",
                            transition: "grid-template-rows 0.25s ease",
                          }}
                        >
                          <div style={{ overflow: "hidden" }}>
                            <div className="px-3 pb-3 space-y-1">
                              {folder.items.map((item) => {
                                const thumbFromFolder = item.thumbnailUrl;
                                const nameFromFolder = item.characterName;
                                const promptFromFolder = item.prompt || "";
                                // Fallback to genThumbnailMap for items that don't have embedded data yet
                                const fallback = genThumbnailMap.get(item.generationId);
                                const thumb = thumbFromFolder || fallback?.thumb;
                                const name = nameFromFolder ?? fallback?.name;
                                const prompt = promptFromFolder || fallback?.prompt || "";
                                return (
                                  <div key={item.generationId} className="flex items-center gap-2.5 py-1">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                                      {thumb ? (
                                        <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <ImageIcon className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <FolderItemNameEditor genId={item.generationId} initialName={name} prompt={prompt} />
                                    <button
                                      className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFolderItemMutation.mutate({ folderId: folder.id, generationId: item.generationId });
                                      }}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Regenerate dialog */}
      {regenTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !regenerateMutation.isPending && setRegenTarget(null)}>
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-md mx-4 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">캐릭터 재생성</h3>
              <button
                className="p-1 rounded hover:bg-muted transition-colors"
                onClick={() => !regenerateMutation.isPending && setRegenTarget(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="w-28 h-28 rounded-lg overflow-hidden bg-muted shrink-0 border">
                <img
                  src={regenTarget.thumbnailUrl || regenTarget.resultImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-medium truncate">{regenTarget.characterName || regenTarget.prompt}</p>
                <p className="text-xs text-muted-foreground">기존 캐릭터 이미지를 참고하여 새로운 이미지를 생성합니다.</p>
                <Badge variant="secondary" className="text-xs capitalize mt-1">{regenTarget.type}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">수정 프롬프트 (선택사항)</label>
              <Textarea
                placeholder="예: 웃는 표정으로 변경, 빨간 모자 추가, 다른 포즈..."
                value={regenPrompt}
                onChange={(e) => setRegenPrompt(e.target.value)}
                rows={3}
                className="text-sm resize-none"
                maxLength={500}
                disabled={regenerateMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">비워두면 같은 캐릭터의 변형 이미지가 생성됩니다.</p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                disabled={regenerateMutation.isPending}
                onClick={() => setRegenTarget(null)}
              >
                취소
              </Button>
              <Button
                size="sm"
                disabled={regenerateMutation.isPending}
                onClick={() => regenerateMutation.mutate({ id: regenTarget.id, prompt: regenPrompt })}
              >
                {regenerateMutation.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />생성 중...</>
                ) : (
                  <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />재생성</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
