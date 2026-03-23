import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import {
  Plus,
  Trash2,
  X,
  Check,
  Download,
  Star,
  Sparkles,
  Palette,
  FileText,
  Image,
  User,
  ChevronUp,
  Clock,
  AlertCircle,
  ArrowRight,
  Search,
  Layers,
} from "lucide-react";
import {
  listItems,
  addItem,
  updateItem,
  removeItem,
  generateId,
  STORE_KEYS,
} from "@/lib/local-store";
import {
  type BrandAsset,
  type AssetTab,
  ASSET_TYPE_CONFIG,
  STATUS_BADGE,
} from "./brand/shared";

// ─── Seed data ──────────────────────────────────────────────────────────────

function seedBrandAssets() {
  if (listItems<BrandAsset>(STORE_KEYS.BRAND_ASSETS).length > 0) return;
  const seeds: BrandAsset[] = [
    { id: generateId("ba"), name: "메인 마스코트 올리", type: "mascot", status: "approved", version: "3.0", downloads: 128, updatedAt: "2026-03-20" },
    { id: generateId("ba"), name: "봄 시즌 마스코트", type: "mascot", status: "review", version: "1.0", downloads: 32, updatedAt: "2026-03-18" },
    { id: generateId("ba"), name: "여름 캐릭터", type: "mascot", status: "draft", version: "0.5", downloads: 5, updatedAt: "2026-03-22" },
    { id: generateId("ba"), name: "메인 로고 (가로형)", type: "logo", status: "approved", version: "2.1", downloads: 256, updatedAt: "2026-03-19" },
    { id: generateId("ba"), name: "심볼 로고", type: "logo", status: "review", version: "1.5", downloads: 87, updatedAt: "2026-03-15" },
    { id: generateId("ba"), name: "메인 컬러 팔레트", type: "color", status: "approved", version: "1.0", downloads: 340, updatedAt: "2026-03-10", colors: ["#00e5cc", "#0ea5e9", "#111827", "#F9FAFB", "#6366F1"] },
    { id: generateId("ba"), name: "서브 컬러 팔레트", type: "color", status: "draft", version: "0.1", downloads: 5, updatedAt: "2026-03-22", colors: ["#FF6B6B", "#FFE66D", "#4ECDC4", "#2C3E50", "#FFFFFF"] },
    { id: generateId("ba"), name: "브랜드 가이드라인", type: "document", status: "approved", version: "4.0", downloads: 512, updatedAt: "2026-03-01", fileSize: "12.4 MB" },
    { id: generateId("ba"), name: "SNS 콘텐츠 가이드", type: "document", status: "review", version: "1.8", downloads: 156, updatedAt: "2026-03-12", fileSize: "3.2 MB" },
  ];
  seeds.forEach((s) => addItem(STORE_KEYS.BRAND_ASSETS, s));
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BrandAssetsPage() {
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [tab, setTab] = useState<AssetTab>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const flash = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const reload = useCallback(() => {
    setAssets(listItems<BrandAsset>(STORE_KEYS.BRAND_ASSETS));
  }, []);

  useEffect(() => {
    seedBrandAssets();
    reload();
  }, [reload]);

  const byType = (type: BrandAsset["type"]) => assets.filter((a) => a.type === type);
  const totalCount = assets.length;

  // Filtered list for bottom section
  const filteredAssets = assets
    .filter((a) => tab === "all" || a.type === tab)
    .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    removeItem<BrandAsset>(STORE_KEYS.BRAND_ASSETS, id);
    reload();
    setDeleteId(null);
    flash("에셋이 삭제되었습니다");
  };

  const handleStatusUp = (id: string) => {
    const a = assets.find((x) => x.id === id);
    if (!a || a.status === "approved") return;
    const next = a.status === "draft" ? "review" : "approved";
    updateItem<BrandAsset>(STORE_KEYS.BRAND_ASSETS, id, {
      status: next as any,
      updatedAt: new Date().toISOString().split("T")[0],
    });
    reload();
    flash(next === "review" ? "검토 요청됨" : "승인 완료");
  };

  const handleDownload = (id: string) => {
    const a = assets.find((x) => x.id === id);
    if (!a) return;
    updateItem<BrandAsset>(STORE_KEYS.BRAND_ASSETS, id, { downloads: a.downloads + 1 });
    reload();
    flash(`"${a.name}" 다운로드`);
  };

  // ─── Bento Card wrapper ─────────────────────────────────────────────────
  const BentoCard = ({
    children,
    className = "",
    gradient,
  }: {
    children: React.ReactNode;
    className?: string;
    gradient?: string;
  }) => (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.06]
        bg-white/[0.02] backdrop-blur-sm p-6 hover:border-[#00e5cc]/30
        hover:shadow-[0_0_30px_rgba(0,229,204,0.06)] transition-all duration-500 ${className}`}
    >
      {gradient && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );

  // ─── Render asset card (for bottom grid) ────────────────────────────────
  const renderCard = (asset: BrandAsset) => {
    const badge = STATUS_BADGE[asset.status];
    const isDeleting = deleteId === asset.id;
    const config = ASSET_TYPE_CONFIG[asset.type];
    const Icon = config.icon;

    return (
      <div
        key={asset.id}
        className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-[#00e5cc]/20 transition-all duration-300"
      >
        {/* Preview area */}
        <div className="aspect-[4/3] bg-gradient-to-br from-white/[0.02] to-transparent relative flex items-center justify-center overflow-hidden">
          {asset.imageUrl ? (
            <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-contain p-4" />
          ) : asset.colors ? (
            <div className="flex w-full h-full">
              {asset.colors.map((c, i) => (
                <div key={i} className="flex-1 relative group/swatch">
                  <div className="w-full h-full" style={{ backgroundColor: c }} />
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover/swatch:opacity-100 transition-opacity px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] text-white font-mono whitespace-nowrap">
                    {c}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Icon className="w-12 h-12 text-white/[0.06]" />
          )}

          {isDeleting ? (
            <div className="absolute top-2 right-2 flex gap-1 animate-in fade-in duration-100">
              <button onClick={() => handleDelete(asset.id)} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteId(null)} className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteId(asset.id)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/50 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {asset.fileSize && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] text-white/60 font-medium">
              {asset.fileSize}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-white/90 leading-snug">{asset.name}</h3>
            <span className={`shrink-0 ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/30">
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> v{asset.version}</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {asset.downloads}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {asset.updatedAt}</span>
          </div>
          <div className="flex gap-2">
            {asset.status !== "approved" && (
              <button
                onClick={() => handleStatusUp(asset.id)}
                className="flex-1 h-8 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border border-white/[0.06] text-white/50 hover:text-white/80 hover:border-white/[0.12] transition-all"
              >
                <ChevronUp className="w-3 h-3" />
                {asset.status === "draft" ? "검토 요청" : "승인"}
              </button>
            )}
            <button
              onClick={() => handleDownload(asset.id)}
              className="flex-1 h-8 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 border border-white/[0.06] text-white/50 hover:text-[#00e5cc] hover:border-[#00e5cc]/30 transition-all"
            >
              <Download className="w-3 h-3" />
              다운로드
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-lg backdrop-blur-xl text-sm font-medium animate-in slide-in-from-right duration-200 ${
            toast.ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {toast.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        {/* ════════════════════ Header ════════════════════ */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00e5cc]/20 to-[#0ea5e9]/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#00e5cc]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">브랜드 자산</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-white/40">마스코트 · 로고 · 컬러 · 문서를 한곳에서 관리하세요</p>
            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[11px] text-white/40 font-medium">
              총 {totalCount}개
            </span>
          </div>
        </div>

        {/* ════════════════════ Bento Grid ════════════════════ */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {/* ── Mascot Card (2col × 2row hero) ── */}
          <BentoCard className="col-span-2 row-span-2" gradient="from-purple-500/10 to-violet-500/5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">마스코트</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-500/10 text-[11px] text-purple-400 font-medium">
                {byType("mascot").length}개
              </span>
            </div>
            <p className="text-sm text-white/40 mb-6">AI로 브랜드 마스코트를 생성하고 관리하세요</p>

            {/* Recent mascots preview */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {byType("mascot").slice(0, 3).map((m) => (
                <div key={m.id} className="aspect-square rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden">
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt={m.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <User className="w-8 h-8 text-white/[0.08]" />
                  )}
                </div>
              ))}
              {byType("mascot").length === 0 && (
                <div className="col-span-3 h-32 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.06] flex items-center justify-center">
                  <p className="text-xs text-white/20">아직 마스코트가 없습니다</p>
                </div>
              )}
            </div>

            <Link
              to="/assets/brand/mascot/new"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              AI로 새 마스코트 만들기
            </Link>
          </BentoCard>

          {/* ── Logo Card (2col × 1row) ── */}
          <BentoCard className="col-span-2" gradient="from-amber-500/10 to-orange-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Image className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">로고</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/10 text-[11px] text-amber-400 font-medium">
                {byType("logo").length}개
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {byType("logo").slice(0, 2).map((l) => (
                <div key={l.id} className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center overflow-hidden">
                  {l.imageUrl ? (
                    <img src={l.imageUrl} alt={l.name} className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <Image className="w-6 h-6 text-white/[0.08]" />
                  )}
                </div>
              ))}
              {byType("logo").length === 0 && (
                <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.06] flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white/15" />
                </div>
              )}
              <Link
                to="/assets/brand/logo/new"
                className="ml-auto h-9 px-4 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-xs flex items-center gap-1.5 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                로고 업로드
              </Link>
            </div>
          </BentoCard>

          {/* ── Color Card (2col × 1row) ── */}
          <BentoCard className="col-span-2" gradient="from-pink-500/10 to-rose-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-pink-400" />
              <h2 className="text-lg font-bold text-white">컬러</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-pink-500/10 text-[11px] text-pink-400 font-medium">
                {byType("color").length}개
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {/* Swatch preview */}
              {byType("color").slice(0, 1).map((c) => (
                <div key={c.id} className="flex gap-1">
                  {(c.colors || []).map((hex, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-white/[0.08]" style={{ backgroundColor: hex }} />
                  ))}
                </div>
              ))}
              {byType("color").length === 0 && (
                <div className="flex gap-1">
                  {["#ccc", "#aaa", "#888", "#666", "#444"].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-white/[0.06] opacity-20" style={{ backgroundColor: c }} />
                  ))}
                </div>
              )}
              <Link
                to="/assets/brand/color/new"
                className="ml-auto h-9 px-4 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-xs flex items-center gap-1.5 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                팔레트 만들기
              </Link>
            </div>
          </BentoCard>

          {/* ── Document Card (4col fullwidth) ── */}
          <BentoCard className="col-span-4" gradient="from-blue-500/10 to-cyan-500/5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">문서</h2>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/10 text-[11px] text-blue-400 font-medium">
                {byType("document").length}개
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                {byType("document").slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <FileText className="w-4 h-4 text-blue-400/50" />
                    <span className="text-sm text-white/70 flex-1">{d.name}</span>
                    {d.fileSize && <span className="text-[10px] text-white/25">{d.fileSize}</span>}
                    <span className="text-[10px] text-white/20">{d.updatedAt}</span>
                  </div>
                ))}
                {byType("document").length === 0 && (
                  <p className="text-sm text-white/20 py-4">아직 문서가 없습니다</p>
                )}
              </div>
              <Link
                to="/assets/brand/document/new"
                className="shrink-0 h-9 px-4 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-xs flex items-center gap-1.5 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                문서 추가
              </Link>
            </div>
          </BentoCard>
        </div>

        {/* ════════════════════ All Assets Section ════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">전체 에셋</h2>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="에셋 검색..."
                className="pl-9 pr-4 py-2 w-64 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors"
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-6">
            {([
              { id: "all" as const, label: "전체" },
              { id: "mascot" as const, label: "마스코트" },
              { id: "logo" as const, label: "로고" },
              { id: "color" as const, label: "컬러" },
              { id: "document" as const, label: "문서" },
            ]).map((t) => {
              const count = t.id === "all" ? assets.length : byType(t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? "bg-[#00e5cc]/10 text-[#00e5cc] border border-[#00e5cc]/20"
                      : "text-white/40 hover:text-white/60 border border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  {t.label}
                  <span className="text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Asset grid */}
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssets.map(renderCard)}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <Layers className="w-12 h-12 text-white/[0.06] mx-auto" />
              <p className="text-sm text-white/30">
                {search ? "검색 결과가 없습니다" : "에셋이 없습니다"}
              </p>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
