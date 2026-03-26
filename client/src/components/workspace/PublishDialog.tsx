import { useState, useCallback, useEffect } from "react";
import {
  X,
  Download,
  Image as ImageIcon,
  Images,
  Save,
  FolderOpen,
  Upload,
  Loader2,
  Check,
  Trash2,
  Clock,
  FileImage,
  Eye,
  Copy,
  CheckCheck,
  Rocket,
  HardDrive,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  Layers,
  Printer,
} from "lucide-react";
import { FabricImage } from "fabric";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useWorkspace, useActiveCut, useAllCuts } from "@/hooks/use-workspace";
import type { Cut } from "@/lib/workspace-types";
import {
  addItem,
  generateId,
  listItems,
  STORE_KEYS,
  type FandomFeedPost,
  type FandomEvent,
} from "@/lib/local-store";

// ─── Constants ──────────────────────────────────────────────────────────────

const SAVED_PROJECTS_KEY = "olli-saved-instatoons";

interface SavedProject {
  id: string;
  title: string;
  savedAt: string;
  cutCount: number;
  thumbnail: string | null;
}

type ActiveView = "publish" | "download" | "save" | "load" | "print";

// ─── Helpers ────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR");
}

function getSaved(): SavedProject[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_PROJECTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function setSaved(list: SavedProject[]) {
  localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(list));
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PublishDialog({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { state, dispatch, canvasRef } = useWorkspace();
  const activeCut = useActiveCut();
  const allCuts = useAllCuts();
  const fandomMeta = state.fandomMeta;
  const accentColor = "var(--fandom-accent, var(--fandom-primary, #7B2FF7))";

  const [view, setView] = useState<ActiveView>("publish");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Publish state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [activeEvents, setActiveEvents] = useState<{ id: string; title: string }[]>([]);

  // Download state
  const [dlCurrent, setDlCurrent] = useState(false);
  const [dlAll, setDlAll] = useState(false);
  const [dlProgress, setDlProgress] = useState(0);

  // Save state
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load state
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setTitle(state.project.title);
    setDesc("");
    setTags(fandomMeta ? [fandomMeta.groupName, ...fandomMeta.memberTags].join(", ") : "");
    setPublishing(false);
    setPublished(false);
    setSaving(false);
    setJustSaved(false);
    setDlCurrent(false);
    setDlAll(false);
    setDlProgress(0);
    setProjects(getSaved());
    setConfirmDelete(null);
    setToast(null);
    setSelectedEventId("");

    // Load active events for fandom mode
    if (fandomMeta) {
      try {
        const events = listItems<FandomEvent>(STORE_KEYS.FANDOM_EVENTS);
        setActiveEvents(
          events
            .filter((e: any) => e.status === "active" && (!fandomMeta.groupId || e.groupId === fandomMeta.groupId))
            .map((e: any) => ({ id: e.id, title: e.title }))
        );
      } catch { /* ignore */ }
    }
  }, [open, state.project.title]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Core: flush active cut to state ────────────────────────────────────
  const flushActiveCut = useCallback(() => {
    if (!canvasRef.current) return;
    const json = canvasRef.current.toJSON();
    dispatch({ type: "UPDATE_CUT_CANVAS", cutId: state.activeCutId, canvasJSON: json });
    const thumb = canvasRef.current.exportImage("jpeg");
    if (thumb) {
      dispatch({ type: "UPDATE_CUT_THUMBNAIL", cutId: state.activeCutId, thumbnailUrl: thumb });
    }
  }, [canvasRef, dispatch, state.activeCutId]);

  // ── Download current cut ───────────────────────────────────────────────
  const handleDownloadCurrent = useCallback(() => {
    if (!canvasRef.current) return;
    setDlCurrent(true);
    const dataUrl = canvasRef.current.exportImage("png");
    if (dataUrl) {
      triggerDownload(dataUrl, `${state.project.title}_컷${activeCut?.order || 1}.png`);
      setToast({ msg: "현재 컷 다운로드 완료", type: "ok" });
    }
    setTimeout(() => setDlCurrent(false), 1200);
  }, [canvasRef, state.project.title, activeCut]);

  // ── Download all cuts ──────────────────────────────────────────────────
  const handleDownloadAll = useCallback(async () => {
    if (!canvasRef.current) return;
    setDlAll(true);
    setDlProgress(0);

    // Save current canvas before switching
    const currentJSON = canvasRef.current.toJSON();
    const currentId = state.activeCutId;
    const total = allCuts.length;

    for (let i = 0; i < total; i++) {
      const cut = allCuts[i];
      setDlProgress(Math.round(((i) / total) * 100));

      if (cut.id === currentId) {
        // Current cut — export directly
        const img = canvasRef.current.exportImage("png");
        if (img) triggerDownload(img, `${state.project.title}_${i + 1}컷.png`);
      } else if (cut.canvasJSON || cut.backgroundImageUrl) {
        // Load other cut, render, export
        const fc = canvasRef.current.getCanvas();
        if (fc) {
          if (cut.canvasJSON) {
            await fc.loadFromJSON(cut.canvasJSON);
          } else {
            fc.clear();
          }
          // Manually load background image if not in canvasJSON
          if (cut.backgroundImageUrl && !fc.backgroundImage) {
            await new Promise<void>((resolve) => {
              const imgEl = new window.Image();
              imgEl.crossOrigin = "anonymous";
              imgEl.onload = () => {
                try {
                  const fabricImg = new FabricImage(imgEl, { originX: "left", originY: "top" });
                  fabricImg.scaleX = fc.width! / (fabricImg.width || 1);
                  fabricImg.scaleY = fc.height! / (fabricImg.height || 1);
                  fc.backgroundImage = fabricImg;
                } catch { /* fallback */ }
                resolve();
              };
              imgEl.onerror = () => resolve();
              imgEl.src = cut.backgroundImageUrl!;
            });
          }
          fc.requestRenderAll();
          await new Promise((r) => setTimeout(r, 300));
          const img = canvasRef.current.exportImage("png");
          if (img) triggerDownload(img, `${state.project.title}_${i + 1}컷.png`);
        }
      }
      // Stagger downloads to avoid browser blocking
      await new Promise((r) => setTimeout(r, 400));
    }

    // Restore original canvas
    if (currentJSON) {
      const fc = canvasRef.current.getCanvas();
      if (fc) {
        await fc.loadFromJSON(currentJSON);
        fc.requestRenderAll();
      }
    }

    setDlProgress(100);
    setToast({ msg: `${total}장 전체 다운로드 완료`, type: "ok" });
    setTimeout(() => { setDlAll(false); setDlProgress(0); }, 1500);
  }, [canvasRef, allCuts, state.activeCutId, state.project.title]);

  // ── Save project ──────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    setSaving(true);
    flushActiveCut();

    // Use requestAnimationFrame to let dispatch settle
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const payload = {
            project: state.project,
            scenes: state.scenes,
            activeSceneId: state.activeSceneId,
            activeCutId: state.activeCutId,
            canvasAspectRatio: state.canvasAspectRatio,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(`olli-project-${state.project.id}`, JSON.stringify(payload));

          // Update index
          const list = getSaved();
          const entry: SavedProject = {
            id: state.project.id,
            title: state.project.title,
            savedAt: payload.savedAt,
            cutCount: allCuts.length,
            thumbnail: allCuts[0]?.thumbnailUrl || null,
          };
          const idx = list.findIndex((p) => p.id === entry.id);
          if (idx >= 0) list[idx] = entry;
          else list.unshift(entry);
          setSaved(list);
          setProjects(list);

          setSaving(false);
          setJustSaved(true);
          setToast({ msg: "인스타툰이 저장되었습니다", type: "ok" });
          setTimeout(() => setJustSaved(false), 2500);
        } catch {
          setSaving(false);
          setToast({ msg: "저장 실패 — 저장소 용량을 확인하세요", type: "err" });
        }
      }, 150);
    });
  }, [flushActiveCut, state, allCuts]);

  // ── Load project ──────────────────────────────────────────────────────
  const handleLoad = useCallback((id: string) => {
    window.location.href = `/editor/${id}`;
  }, []);

  // ── Delete saved ──────────────────────────────────────────────────────
  const handleDelete = useCallback((id: string) => {
    localStorage.removeItem(`olli-project-${id}`);
    const list = getSaved().filter((p) => p.id !== id);
    setSaved(list);
    setProjects(list);
    setConfirmDelete(null);
    setToast({ msg: "삭제되었습니다", type: "ok" });
  }, []);

  // ── Publish ───────────────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    if (!title.trim()) return;
    setPublishing(true);
    flushActiveCut();

    // Save first
    try {
      const payload = {
        project: { ...state.project, title },
        scenes: state.scenes,
        activeSceneId: state.activeSceneId,
        activeCutId: state.activeCutId,
        canvasAspectRatio: state.canvasAspectRatio,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`olli-project-${state.project.id}`, JSON.stringify(payload));
      const list = getSaved();
      const entry: SavedProject = {
        id: state.project.id,
        title,
        savedAt: payload.savedAt,
        cutCount: allCuts.length,
        thumbnail: allCuts[0]?.thumbnailUrl || null,
      };
      const idx = list.findIndex((p) => p.id === entry.id);
      if (idx >= 0) list[idx] = entry;
      else list.unshift(entry);
      setSaved(list);
    } catch { /* ignore */ }

    // Simulate publish delay
    await new Promise((r) => setTimeout(r, 1800));

    // If fandom mode, create a fandom feed post
    if (fandomMeta) {
      const post: FandomFeedPost = {
        id: generateId("fp"),
        authorName: "나",
        authorAvatar: "ME",
        groupId: fandomMeta.groupId,
        groupName: fandomMeta.groupName,
        memberTags: fandomMeta.memberTags,
        title: title.trim(),
        description: desc.trim(),
        imageUrl: allCuts[0]?.thumbnailUrl || null,
        likes: 0,
        liked: false,
        commentCount: 0,
        type: fandomMeta.templateType,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      addItem(STORE_KEYS.FANDOM_FEED, post);
    }

    setPublishing(false);
    setPublished(true);
    dispatch({ type: "SET_PROJECT_TITLE", title });
  }, [title, desc, flushActiveCut, state, allCuts, dispatch, fandomMeta]);

  // ── Copy link ─────────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${location.origin}/gallery/feed?post=${state.project.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [state.project.id]);

  if (!open) return null;

  // ── View navigation items ─────────────────────────────────────────────
  const hasPrintSettings = !!state.printSettings;
  const NAV: { id: ActiveView; icon: typeof Upload; label: string }[] = [
    { id: "publish", icon: Rocket, label: "게시" },
    { id: "download", icon: Download, label: "다운로드" },
    ...(hasPrintSettings ? [{ id: "print" as ActiveView, icon: Printer, label: "인쇄 내보내기" }] : []),
    { id: "save", icon: Save, label: "저장" },
    { id: "load", icon: FolderOpen, label: "불러오기" },
  ];

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Toast */}
      {toast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg backdrop-blur-xl text-sm font-medium ${
            toast.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {toast.type === "ok" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.msg}
          </div>
        </div>
      )}

      {/* Dialog */}
      <div className="absolute inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-[720px] sm:max-h-[82vh] bg-[#0c0c0f] border border-white/[0.06] rounded-2xl shadow-[0_32px_64px_-8px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor})` }}>
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white tracking-tight">발행 센터</h2>
              <p className="text-[12px] text-white/40 mt-0.5 flex items-center gap-1.5">
                <Layers className="w-5 h-5" />
                {allCuts.length}컷 · {state.project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* ── Nav tabs ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 px-5 py-2 border-b border-white/[0.06] bg-white/[0.01]">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                view === n.id
                  ? "bg-white/[0.08] text-primary shadow-[inset_0_1px_0_rgba(123,47,247,0.1)]"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
              }`}
            >
              <n.icon className="w-5 h-5" />
              {n.label}
            </button>
          ))}
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          <div className="p-5 space-y-5">

            {/* ═══════ PUBLISH VIEW ═══════ */}
            {view === "publish" && (
              published ? (
                /* Success */
                <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, ${accentColor}, ${accentColor})` }}>
                      <CheckCheck className="w-9 h-9 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">게시 완료!</h3>
                    <p className="text-sm text-white/50 mt-1.5">
                      <span className="text-primary font-semibold">{title}</span>이(가) 피드에 게시되었습니다
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08]"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5" />}
                      {copied ? "복사됨" : "링크 복사"}
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 gap-2 font-bold"
                      style={
                        fandomMeta
                          ? { background: fandomMeta.coverColor, color: "#fff" }
                          : { background: accentColor, color: "#fff" }
                      }
                      onClick={() => {
                        if (fandomMeta) {
                          onClose();
                          navigate("/fandom/feed");
                        } else {
                          window.open("/gallery/feed", "_blank");
                        }
                      }}
                    >
                      <ExternalLink className="w-5 h-5" />
                      {fandomMeta ? "팬덤 피드에서 보기" : "피드에서 보기"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form */
                <div className="space-y-5">
                  {/* Cut preview strip */}
                  <div>
                    <label className="text-[12px] font-semibold text-white/30 uppercase tracking-widest mb-2.5 block">
                      컷 미리보기
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {allCuts.map((cut, i) => (
                        <div
                          key={cut.id}
                          className="shrink-0 w-[72px] h-[96px] rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.02] relative group"
                        >
                          {cut.thumbnailUrl ? (
                            <img src={cut.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileImage className="w-5 h-5 text-white/10" />
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
                            <span className="text-[12px] font-bold text-white/80">{i + 1}컷</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block">
                        제목
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="인스타툰 제목"
                        className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block">
                        설명 <span className="text-white/15 normal-case tracking-normal">(선택)</span>
                      </label>
                      <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="이 인스타툰에 대해 한 줄로 소개해보세요"
                        rows={2}
                        className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block">
                        태그 <span className="text-white/15 normal-case tracking-normal">(콤마 구분)</span>
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="일상, 코믹, 캐릭터"
                        className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
                      />
                      {tags && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tags.split(",").filter((t) => t.trim()).map((t, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[12px] font-medium bg-primary/10 text-primary border border-primary/10">
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fandom event selector */}
                    {fandomMeta && activeEvents.length > 0 && (
                      <div>
                        <label className="text-[12px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 block">
                          이벤트 참여 <span className="text-white/15 normal-case tracking-normal">(선택)</span>
                        </label>
                        <select
                          value={selectedEventId}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.06] transition-all"
                        >
                          <option value="">이벤트 선택 안함</option>
                          {activeEvents.map((event) => (
                            <option key={event.id} value={event.id}>
                              {event.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Publish CTA */}
                  <button
                    onClick={handlePublish}
                    disabled={publishing || !title.trim()}
                    className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                    style={
                      fandomMeta
                        ? {
                            background: `linear-gradient(135deg, ${fandomMeta.coverColor}, ${fandomMeta.coverColor}cc)`,
                            color: "#fff",
                            boxShadow: `0 4px 24px ${fandomMeta.coverColor}40`,
                          }
                        : {
                            background: `linear-gradient(to right, ${accentColor}, ${accentColor})`,
                            color: "#fff",
                          }
                    }
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        게시 중...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        {fandomMeta ? "팬덤에 게시하기" : "인스타툰 게시하기"}
                      </>
                    )}
                  </button>
                </div>
              )
            )}

            {/* ═══════ DOWNLOAD VIEW ═══════ */}
            {view === "download" && (
              <div className="space-y-5">
                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Current cut */}
                  <button
                    onClick={handleDownloadCurrent}
                    disabled={dlCurrent}
                    className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.04] transition-all text-left active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        dlCurrent ? "bg-emerald-500/20" : "bg-violet-500/10 group-hover:bg-violet-500/20"
                      }`}>
                        {dlCurrent ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-violet-400" />
                        )}
                      </div>
                      <Download className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-white">현재 컷 다운로드</h4>
                    <p className="text-[12px] text-white/35 mt-1 leading-relaxed">
                      컷 {activeCut?.order || 1} · PNG 2x 고화질
                    </p>
                  </button>

                  {/* All cuts */}
                  <button
                    onClick={handleDownloadAll}
                    disabled={dlAll}
                    className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.04] transition-all text-left active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        dlAll ? "bg-primary/20" : "bg-primary/10 group-hover:bg-primary/20"
                      }`}>
                        {dlAll ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <Images className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <Download className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {dlAll ? `다운로드 중 ${dlProgress}%` : "전체 다운로드"}
                    </h4>
                    <p className="text-[12px] text-white/35 mt-1 leading-relaxed">
                      {allCuts.length}장 일괄 · PNG 2x 고화질
                    </p>
                    {/* Progress bar */}
                    {dlAll && (
                      <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                          style={{ width: `${dlProgress}%` }}
                        />
                      </div>
                    )}
                  </button>
                </div>

                {/* Individual cut grid */}
                <div>
                  <label className="text-[12px] font-semibold text-white/30 uppercase tracking-widest mb-3 block">
                    개별 컷 선택 다운로드
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {allCuts.map((cut, i) => (
                      <button
                        key={cut.id}
                        onClick={async () => {
                          if (!canvasRef.current) return;
                          if (cut.id === state.activeCutId) {
                            const img = canvasRef.current.exportImage("png");
                            if (img) {
                              triggerDownload(img, `${state.project.title}_${i + 1}컷.png`);
                              setToast({ msg: `${i + 1}컷 다운로드 완료`, type: "ok" });
                            }
                          } else if (cut.canvasJSON || cut.backgroundImageUrl) {
                            // Load and render for high-quality export
                            const fc = canvasRef.current.getCanvas();
                            const currentJSON = canvasRef.current.toJSON();
                            if (fc) {
                              if (cut.canvasJSON) await fc.loadFromJSON(cut.canvasJSON);
                              else fc.clear();
                              if (cut.backgroundImageUrl && !fc.backgroundImage) {
                                await new Promise<void>((resolve) => {
                                  const imgEl = new window.Image();
                                  imgEl.crossOrigin = "anonymous";
                                  imgEl.onload = () => {
                                    try {
                                      const fabricImg = new FabricImage(imgEl, { originX: "left", originY: "top" });
                                      fabricImg.scaleX = fc.width! / (fabricImg.width || 1);
                                      fabricImg.scaleY = fc.height! / (fabricImg.height || 1);
                                      fc.backgroundImage = fabricImg;
                                    } catch {}
                                    resolve();
                                  };
                                  imgEl.onerror = () => resolve();
                                  imgEl.src = cut.backgroundImageUrl!;
                                });
                              }
                              fc.requestRenderAll();
                              await new Promise((r) => setTimeout(r, 300));
                              const img = canvasRef.current.exportImage("png");
                              if (img) {
                                triggerDownload(img, `${state.project.title}_${i + 1}컷.png`);
                                setToast({ msg: `${i + 1}컷 다운로드 완료`, type: "ok" });
                              }
                              // Restore current canvas
                              if (currentJSON) {
                                await fc.loadFromJSON(currentJSON);
                                fc.requestRenderAll();
                              }
                            }
                          } else if (cut.thumbnailUrl) {
                            triggerDownload(cut.thumbnailUrl, `${state.project.title}_${i + 1}컷.jpg`);
                            setToast({ msg: `${i + 1}컷 다운로드 완료`, type: "ok" });
                          } else {
                            setToast({ msg: "이 컷은 아직 비어있습니다", type: "err" });
                          }
                        }}
                        className="group relative aspect-[3/4] rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.02] hover:border-primary/30 transition-all active:scale-95"
                      >
                        {cut.thumbnailUrl ? (
                          <img src={cut.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileImage className="w-5 h-5 text-white/10" />
                          </div>
                        )}
                        {/* Order badge */}
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[12px] font-bold text-white/80">
                          {i + 1}
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Download className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ PRINT VIEW ═══════ */}
            {view === "print" && state.printSettings && (
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6 text-center">
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-primary/10 border border-primary/10 flex items-center justify-center">
                      <Printer className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-white">인쇄용 고해상도 내보내기</h3>
                      <p className="text-[12px] text-white/35 mt-1">
                        {state.printSettings.physicalWidthMm}×{state.printSettings.physicalHeightMm}mm · {state.printSettings.dpi} DPI
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (!canvasRef.current) return;
                        const multiplier = state.printSettings!.dpi / 72;
                        const fc = canvasRef.current.getCanvas();
                        if (!fc) return;
                        const dataUrl = fc.toDataURL({
                          format: "png",
                          quality: 1,
                          multiplier,
                        });
                        const a = document.createElement("a");
                        a.href = dataUrl;
                        a.download = `${state.project.title}_${state.printSettings!.dpi}dpi.png`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        setToast({ msg: `${state.printSettings!.dpi}dpi PNG 내보내기 완료`, type: "ok" });
                      }}
                      className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-primary to-primary/80 text-black shadow-[0_4px_20px_rgba(0,229,204,0.2)] hover:shadow-[0_4px_28px_rgba(0,229,204,0.35)] active:scale-[0.98]"
                    >
                      <Download className="w-5 h-5" />
                      {state.printSettings.dpi}dpi PNG 내보내기
                    </button>
                  </div>
                </div>

                {/* Birthday package batch download */}
                {state.birthdayCafePackage && allCuts.length > 1 && (
                  <button
                    onClick={handleDownloadAll}
                    disabled={dlAll}
                    className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 active:scale-[0.98]"
                  >
                    <Images className="w-5 h-5" />
                    {dlAll ? `패키지 다운로드 중 ${dlProgress}%` : `생카 패키지 전체 다운로드 (${allCuts.length}개)`}
                  </button>
                )}
              </div>
            )}

            {/* ═══════ SAVE VIEW ═══════ */}
            {view === "save" && (
              <div className="space-y-5">
                {/* Main save card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6 text-center">
                  {/* Decorative glow */}
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-primary/10 border border-primary/10 flex items-center justify-center">
                      <HardDrive className="w-7 h-7 text-primary" />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-bold text-white">{state.project.title}</h3>
                      <p className="text-[12px] text-white/35 mt-1 flex items-center justify-center gap-1.5">
                        <Layers className="w-5 h-5" />
                        {allCuts.length}컷 · 브라우저 로컬 저장
                      </p>
                    </div>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 bg-gradient-to-r from-primary to-primary/80 text-black shadow-[0_4px_20px_rgba(0,229,204,0.2)] hover:shadow-[0_4px_28px_rgba(0,229,204,0.35)] active:scale-[0.98]"
                    >
                      {saving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> 저장 중...</>
                      ) : justSaved ? (
                        <><Check className="w-5 h-5" /> 저장 완료!</>
                      ) : (
                        <><Save className="w-5 h-5" /> 인스타툰 저장</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Recent saves */}
                {projects.length > 0 && (
                  <div>
                    <label className="text-[12px] font-semibold text-white/30 uppercase tracking-widest mb-3 block">
                      최근 저장 기록
                    </label>
                    <div className="space-y-1.5">
                      {projects.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.04] bg-white/[0.02]"
                        >
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/[0.04] shrink-0">
                            {p.thumbnail ? (
                              <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileImage className="w-5 h-5 text-white/10" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-white/80 truncate">{p.title}</p>
                            <p className="text-[12px] text-white/25 mt-0.5 flex items-center gap-1.5">
                              <Layers className="w-2.5 h-2.5" />
                              {p.cutCount}컷
                              <span className="mx-0.5">·</span>
                              <Clock className="w-2.5 h-2.5" />
                              {relativeTime(p.savedAt)}
                            </p>
                          </div>
                          {p.id === state.project.id && (
                            <span className="px-1.5 py-0.5 rounded-md text-[12px] font-bold bg-primary/15 text-primary border border-primary/10">
                              현재
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ LOAD VIEW ═══════ */}
            {view === "load" && (
              projects.length === 0 ? (
                <div className="py-14 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <FolderOpen className="w-7 h-7 text-white/15" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/70">저장된 작업이 없습니다</h3>
                    <p className="text-xs text-white/30 mt-1">
                      작업을 저장하면 언제든 이어서 작업할 수 있습니다
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[12px] text-white/25">
                    저장된 인스타툰 {projects.length}개
                  </p>

                  <div className="space-y-2">
                    {projects.map((p) => {
                      const isCurrent = p.id === state.project.id;
                      const isDeleting = confirmDelete === p.id;

                      return (
                        <div
                          key={p.id}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                            isCurrent
                              ? "border-primary/20 bg-primary/[0.03]"
                              : "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]"
                          }`}
                        >
                          {/* Thumb */}
                          <div className="w-14 h-[72px] rounded-xl overflow-hidden bg-white/[0.04] shrink-0 border border-white/[0.04]">
                            {p.thumbnail ? (
                              <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileImage className="w-5 h-5 text-white/10" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-semibold text-white/90 truncate">{p.title}</p>
                              {isCurrent && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[12px] font-bold bg-primary/15 text-primary border border-primary/10">
                                  현재
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-white/30 mt-1 flex items-center gap-1.5">
                              <Layers className="w-5 h-5" />
                              {p.cutCount}컷
                              <span className="mx-0.5">·</span>
                              <Clock className="w-5 h-5" />
                              {relativeTime(p.savedAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isDeleting ? (
                              <div className="flex items-center gap-1 animate-in fade-in duration-150">
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                >
                                  삭제
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setConfirmDelete(p.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                                {!isCurrent && (
                                  <button
                                    onClick={() => handleLoad(p.id)}
                                    className="h-8 px-3.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95"
                                  >
                                    <RotateCcw className="w-5 h-5" />
                                    불러오기
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
