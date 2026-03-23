import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { ArrowLeft, Palette, Plus, Check, X, Copy } from "lucide-react";
import { addItem, generateId, STORE_KEYS } from "@/lib/local-store";
import type { BrandAsset } from "./shared";
import { today, PRESET_PALETTES } from "./shared";

export function ColorCreatorPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [colors, setColors] = useState<string[]>(["#00e5cc", "#0ea5e9", "#111827", "#F9FAFB", "#6366F1"]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const updateColor = (idx: number, val: string) => {
    const next = [...colors];
    next[idx] = val;
    setColors(next);
  };

  const removeColor = (idx: number) => {
    if (colors.length <= 2) return;
    setColors(colors.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const addColor = () => {
    if (colors.length >= 8) return;
    setColors([...colors, "#888888"]);
  };

  const copyHex = (idx: number) => {
    navigator.clipboard.writeText(colors[idx]);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1200);
  };

  const save = () => {
    const n = name.trim() || "새 컬러 팔레트";
    addItem<BrandAsset>(STORE_KEYS.BRAND_ASSETS, {
      id: generateId("ba"),
      name: n,
      type: "color",
      status: "draft",
      version: "1.0",
      downloads: 0,
      updatedAt: today(),
      colors: [...colors],
    });
    navigate("/assets/brand");
  };

  return (
    <StudioLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to="/assets/brand"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          브랜드 자산
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-pink-400" />
            </div>
            컬러 팔레트 빌더
          </h1>
          <p className="text-sm text-white/40 mt-2">브랜드 컬러를 조합하고 저장하세요</p>
        </div>

        {/* Palette name */}
        <div className="space-y-2 mb-8">
          <label className="text-sm font-semibold text-white/70">팔레트 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 2026 봄 시즌 컬러"
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors"
          />
        </div>

        {/* Live preview bar */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-white/70 mb-3 block">라이브 프리뷰</label>
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="flex h-24">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 relative group/swatch cursor-pointer transition-all hover:flex-[1.3]"
                  style={{ backgroundColor: c }}
                  onClick={() => setEditingIdx(editingIdx === i ? null : i)}
                >
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/swatch:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] text-white font-mono whitespace-nowrap">
                    {c}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Color editors */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-white/70 mb-3 block">색상 편집</label>
          <div className="space-y-3">
            {colors.map((c, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                  editingIdx === i
                    ? "border-[#00e5cc]/30 bg-[#00e5cc]/[0.03]"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <div className="relative">
                  <input
                    type="color"
                    value={c}
                    onChange={(e) => updateColor(i, e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  value={c}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#00e5cc]/40 transition-colors"
                />
                <button
                  onClick={() => copyHex(i)}
                  className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all"
                  title="복사"
                >
                  {copied === i ? <Check className="w-4 h-4 text-[#00e5cc]" /> : <Copy className="w-4 h-4" />}
                </button>
                {colors.length > 2 && (
                  <button
                    onClick={() => removeColor(i)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
                    title="삭제"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {colors.length < 8 && (
              <button
                onClick={addColor}
                className="w-full h-12 rounded-xl border-2 border-dashed border-white/[0.06] hover:border-[#00e5cc]/30 flex items-center justify-center gap-2 text-white/30 hover:text-[#00e5cc] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">색상 추가 ({colors.length}/8)</span>
              </button>
            )}
          </div>
        </div>

        {/* Preset palettes */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-white/70 mb-3 block">프리셋 팔레트</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PRESET_PALETTES.map((p) => (
              <button
                key={p.name}
                onClick={() => setColors([...p.colors])}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:border-[#00e5cc]/30 hover:shadow-[0_0_20px_rgba(0,229,204,0.04)] transition-all"
              >
                <div className="flex gap-1 mb-2">
                  {p.colors.map((c, i) => (
                    <div key={i} className="flex-1 h-6 rounded-md first:rounded-l-lg last:rounded-r-lg" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="text-[11px] text-white/40 group-hover:text-white/60 transition-colors">{p.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <button
          onClick={save}
          disabled={!name.trim()}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          팔레트 저장
        </button>
      </div>
    </StudioLayout>
  );
}
