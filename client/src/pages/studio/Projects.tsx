import { useState, useEffect, useCallback } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link, useNavigate } from "react-router";
import {
  Clock,
  Image,
  FileText,
  Search,
  Trash2,
  ChevronDown,
  MoreVertical,
  Heart,
} from "lucide-react";
import { QuickStartHero } from "@/components/workspace/QuickStartHero";
import {
  listItems,
  removeItem,
  updateItem,
  getFandomProfile,
  STORE_KEYS,
  type ProjectRecord,
} from "@/lib/local-store";

type StatusKey = ProjectRecord["status"];
type SortKey = "updatedAt" | "createdAt" | "title";

const statusLabel: Record<StatusKey, { text: string; color: string }> = {
  draft: { text: "초안", color: "bg-yellow-500/20 text-yellow-500" },
  published: { text: "발행됨", color: "bg-green-500/20 text-green-500" },
  review: { text: "검토중", color: "bg-blue-500/20 text-blue-500" },
};

const STATUS_FLOW: Record<StatusKey, StatusKey> = {
  draft: "review",
  review: "published",
  published: "draft",
};

export function StudioProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const profile = getFandomProfile();
  const themeColor = "var(--fandom-primary, #7B2FF7)";

  const loadProjects = useCallback(() => {
    setProjects(listItems<ProjectRecord>(STORE_KEYS.PROJECTS));
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClick() {
      setMenuOpenId(null);
    }
    if (menuOpenId) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [menuOpenId]);

  function handleDelete(id: string) {
    removeItem<ProjectRecord>(STORE_KEYS.PROJECTS, id);
    setDeleteConfirmId(null);
    loadProjects();
  }

  function handleStatusChange(id: string) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const nextStatus = STATUS_FLOW[project.status];
    updateItem<ProjectRecord>(STORE_KEYS.PROJECTS, id, {
      status: nextStatus,
      updatedAt: new Date().toISOString().split("T")[0],
    });
    setMenuOpenId(null);
    loadProjects();
  }

  const filtered = projects
    .filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title, "ko");
      // Date sort (newest first)
      return b[sortBy].localeCompare(a[sortBy]);
    });

  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7" style={{ color: themeColor }} />
            <h1 className="text-2xl font-black text-foreground">내 작품</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {profile ? `${profile.groupName} 팬아트 프로젝트` : "나의 팬아트 프로젝트"}
          </p>
        </div>

        {/* AI-First Quick Start Hero */}
        <QuickStartHero />

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">
            또는 기존 프로젝트 이어서 작업
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="프로젝트 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors"
              style={{ "--tw-ring-color": themeColor } as any}
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            {(
              [
                { id: "all" as const, label: "전체" },
                { id: "draft" as const, label: "초안" },
                { id: "review" as const, label: "검토중" },
                { id: "published" as const, label: "발행됨" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === f.id
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                style={statusFilter === f.id ? { background: themeColor } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-2 bg-card border border-border rounded-xl text-xs text-muted-foreground focus:outline-none cursor-pointer"
          >
            <option value="updatedAt">최근 수정순</option>
            <option value="createdAt">생성일순</option>
            <option value="title">이름순</option>
          </select>
        </div>

        {/* Project count */}
        <div className="mb-4 text-sm text-muted-foreground">
          총 {filtered.length}개 프로젝트
        </div>

        {/* Project Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl border border-border bg-card hover:shadow-lg transition-all overflow-hidden relative"
              >
                {/* Thumbnail - clicking navigates to editor */}
                <Link to={`/studio/editor/${project.id}`}>
                  <div className="aspect-video bg-muted flex items-center justify-center relative">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-10 h-10 text-muted-foreground/20" />
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusLabel[project.status].color}`}
                      >
                        {statusLabel[project.status].text}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <Link
                      to={`/studio/editor/${project.id}`}
                      className="flex-1 min-w-0"
                    >
                      <h3 className="font-semibold text-foreground transition-colors truncate group-hover:text-[var(--fandom-primary)]">
                        {project.title}
                      </h3>
                    </Link>

                    {/* Context menu */}
                    <div className="relative ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(
                            menuOpenId === project.id ? null : project.id,
                          );
                        }}
                        className="p-1 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>

                      {menuOpenId === project.id && (
                        <div
                          className="absolute right-0 top-8 w-44 rounded-xl shadow-xl overflow-hidden z-50 bg-card border border-border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleStatusChange(project.id)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <ChevronDown className="w-5 h-5" />
                            <span>
                              상태 변경 →{" "}
                              {statusLabel[STATUS_FLOW[project.status]].text}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmId(project.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span>삭제</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="w-5 h-5" />
                      <span>{project.panels}컷</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      <span>{project.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter !== "all"
                ? "검색 결과가 없습니다"
                : "아직 프로젝트가 없습니다"}
            </p>
            {!search && statusFilter === "all" && (
              <Link
                to="/fandom/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-colors hover:opacity-90"
                style={{ background: themeColor }}
              >
                첫 팬아트 만들기
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">
              프로젝트 삭제
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </StudioLayout>
  );
}
