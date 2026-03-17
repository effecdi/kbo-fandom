import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, FolderOpen, Loader2, Crown, Clock, MessageCircle, BookOpen, ArrowLeft, Folder } from "lucide-react";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { LoginRequiredDialog } from "@/components/login-required-dialog";
import { useLocation } from "wouter";

interface BubbleProject {
  id: number;
  name: string;
  thumbnailUrl: string | null;
  editorType: string;
  folderId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFolder {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditsPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { showLoginDialog, setShowLoginDialog } = useLoginGuard();
  const [, setLocation] = useLocation();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [deleteFolderConfirmId, setDeleteFolderConfirmId] = useState<number | null>(null);

  const { data: projects = [], isLoading } = useQuery<BubbleProject[]>({
    queryKey: ["/api/bubble-projects"],
    enabled: isAuthenticated,
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery<ProjectFolder[]>({
    queryKey: ["/api/project-folders"],
    enabled: isAuthenticated,
  });

  const { data: folderProjects = [], isLoading: folderProjectsLoading } = useQuery<BubbleProject[]>({
    queryKey: ["/api/project-folders", currentFolderId, "projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/project-folders/${currentFolderId}/projects`);
      return res.json();
    },
    enabled: isAuthenticated && currentFolderId !== null,
  });

  const { data: usage } = useQuery<any>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  const isPro = usage?.tier === "pro" || usage?.tier === "premium";

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bubble-projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bubble-projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/project-folders"] });
      toast({ title: "삭제 완료", description: "프로젝트가 삭제되었습니다." });
      setDeleteConfirmId(null);
    },
    onError: (err: any) => {
      toast({ title: "삭제 실패", description: err.message, variant: "destructive" });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/project-folders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bubble-projects"] });
      toast({ title: "삭제 완료", description: "폴더가 삭제되었습니다. 프로젝트는 보존됩니다." });
      setDeleteFolderConfirmId(null);
      setCurrentFolderId(null);
    },
    onError: (err: any) => {
      toast({ title: "삭제 실패", description: err.message, variant: "destructive" });
    },
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}시간 전`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}일 전`;
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
  };

  // Projects without a folder
  const unfolderedProjects = projects.filter((p) => !p.folderId);

  // Count projects per folder
  const folderProjectCounts = new Map<number, number>();
  for (const p of projects) {
    if (p.folderId) {
      folderProjectCounts.set(p.folderId, (folderProjectCounts.get(p.folderId) || 0) + 1);
    }
  }

  const currentFolder = folders.find((f) => f.id === currentFolderId);
  const loading = isLoading || foldersLoading;

  const renderProjectCard = (project: BubbleProject, episodeNum?: number) => (
    <Card
      key={project.id}
      className="group cursor-pointer hover-elevate"
      onClick={() => setLocation(`/${project.editorType === "story" ? "story" : "bubble"}?projectId=${project.id}`)}
      data-testid={`card-project-${project.id}`}
    >
      <div className="aspect-[3/4] bg-muted relative overflow-hidden rounded-t-md">
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmId(project.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="p-2.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-medium truncate flex-1">
            {episodeNum !== undefined ? `${episodeNum}화. ${project.name}` : project.name}
          </p>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 shrink-0">
            {project.editorType === "story" ? "스토리" : "말풍선"}
          </Badge>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          {currentFolderId !== null && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentFolderId(null)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            {currentFolderId !== null ? (
              <div className="flex items-center gap-1.5">
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setCurrentFolderId(null)}
                >
                  내 편집
                </button>
                <span className="text-xs text-muted-foreground">/</span>
                <h1 className="text-lg font-bold tracking-tight">{currentFolder?.name}</h1>
              </div>
            ) : (
              <>
                <h1 className="text-lg font-bold tracking-tight" data-testid="text-edits-title">내 편집</h1>
                <p className="text-xs text-muted-foreground mt-0.5">저장된 프로젝트를 관리하세요</p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isPro && (
            <Badge variant="secondary" className="gap-1" data-testid="badge-pro-status">
              <Crown className="h-3 w-3" />
              Pro
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={() => setLocation("/bubble")} className="gap-1.5" data-testid="button-new-bubble">
            <MessageCircle className="h-3.5 w-3.5" />
            말풍선
          </Button>
          <Button size="sm" variant="outline" onClick={() => setLocation("/story")} className="gap-1.5" data-testid="button-new-story">
            <BookOpen className="h-3.5 w-3.5" />
            스토리
          </Button>
          {currentFolderId !== null && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => setDeleteFolderConfirmId(currentFolderId)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              폴더 삭제
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : currentFolderId !== null ? (
        /* ── Folder Detail View ── */
        folderProjectsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : folderProjects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-medium mb-1">이 폴더에 프로젝트가 없습니다</h3>
            <p className="text-xs text-muted-foreground">에디터에서 프로젝트를 저장할 때 이 폴더를 선택해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {folderProjects.map((project, idx) => renderProjectCard(project, idx + 1))}
          </div>
        )
      ) : projects.length === 0 && folders.length === 0 ? (
        /* ── Empty State ── */
        <div className="text-center py-20">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-sm font-medium mb-1" data-testid="text-no-projects">저장된 프로젝트가 없습니다</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {isPro ? "에디터에서 프로젝트를 저장해보세요." : "Pro 멤버십으로 업그레이드하면 프로젝트를 저장할 수 있습니다."}
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setLocation("/bubble")} className="gap-1.5" data-testid="button-go-bubble-editor">
              <MessageCircle className="h-3.5 w-3.5" />
              말풍선 에디터
            </Button>
            <Button size="sm" variant="outline" onClick={() => setLocation("/story")} className="gap-1.5" data-testid="button-go-story-editor">
              <BookOpen className="h-3.5 w-3.5" />
              스토리 에디터
            </Button>
            {!isPro && (
              <Button size="sm" asChild className="gap-1.5" data-testid="button-upgrade-pro-edits">
                <a href="/pricing">
                  <Crown className="h-3.5 w-3.5" />
                  Pro 업그레이드
                </a>
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* ── Root View: Folders + Unfoldered Projects ── */
        <div className="space-y-6">
          {/* Folder Cards */}
          {folders.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">폴더</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="group cursor-pointer hover-elevate p-4"
                    onClick={() => setCurrentFolderId(folder.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Folder className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{folder.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {folderProjectCounts.get(folder.id) || 0}개 프로젝트
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Unfoldered Projects */}
          {unfolderedProjects.length > 0 && (
            <div>
              {folders.length > 0 && (
                <h2 className="text-sm font-semibold mb-3">폴더 없는 프로젝트</h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {unfolderedProjects.map((project) => renderProjectCard(project))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete project confirm */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">프로젝트 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} data-testid="button-cancel-delete">
              취소
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              className="gap-1.5"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete folder confirm */}
      <Dialog open={deleteFolderConfirmId !== null} onOpenChange={() => setDeleteFolderConfirmId(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-base">폴더 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">이 폴더를 삭제하시겠습니까? 폴더 안의 프로젝트는 보존됩니다.</p>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteFolderConfirmId(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteFolderConfirmId && deleteFolderMutation.mutate(deleteFolderConfirmId)}
              disabled={deleteFolderMutation.isPending}
              className="gap-1.5"
            >
              {deleteFolderMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  );
}
