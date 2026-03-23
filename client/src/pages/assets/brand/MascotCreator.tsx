import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
  RefreshCw,
  Upload,
  User,
} from "lucide-react";
import { addItem, generateId, STORE_KEYS } from "@/lib/local-store";
import type { BrandAsset } from "./shared";
import { today } from "./shared";

const TONE_CHIPS = ["친근한", "전문적인", "혁신적인", "활기찬", "고급스러운", "따뜻한", "미래적인", "심플한"];
const PURPOSE_CHIPS = ["SNS 마케팅", "제품 홍보", "기업 브랜딩", "이벤트/캠페인", "굿즈/MD", "교육/안내"];
const STYLE_OPTIONS = ["simple-line", "cartoon", "watercolor", "pixel", "flat-design", "3d-render"];
const STYLE_LABELS: Record<string, string> = {
  "simple-line": "심플 라인",
  cartoon: "카툰",
  watercolor: "수채화",
  pixel: "픽셀아트",
  "flat-design": "플랫 디자인",
  "3d-render": "3D 렌더",
};

export function MascotCreatorPage() {
  const navigate = useNavigate();

  const [brandName, setBrandName] = useState("");
  const [concept, setConcept] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [style, setStyle] = useState("simple-line");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const toggleChip = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const buildPrompt = () => {
    let p = concept;
    if (selectedTones.length) p += ` 톤: ${selectedTones.join(", ")}.`;
    if (selectedPurposes.length) p += ` 용도: ${selectedPurposes.join(", ")}.`;
    return p;
  };

  const generate = async () => {
    if (!concept.trim()) return;
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(), style, gender: "neutral", genType: "mascot", source: "business" }),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      setResult(data.resultImageUrl || data.imageUrl || null);
    } catch {
      // silent — user sees placeholder
    } finally {
      setGenerating(false);
    }
  };

  const save = () => {
    const name = brandName.trim() || "새 마스코트";
    addItem<BrandAsset>(STORE_KEYS.BRAND_ASSETS, {
      id: generateId("ba"),
      name,
      type: "mascot",
      status: "draft",
      version: "1.0",
      downloads: 0,
      updatedAt: today(),
      imageUrl: result || undefined,
      description: concept,
      tags: [...selectedTones, ...selectedPurposes],
    });
    navigate("/assets/brand");
  };

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            AI 마스코트 생성
          </h1>
          <p className="text-sm text-white/40 mt-2">
            브랜드 컨셉을 입력하면 AI가 맞춤형 마스코트를 생성합니다
          </p>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form — 3col */}
          <div className="lg:col-span-3 space-y-6">
            {/* Brand name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">브랜드명</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="예: 올리베어"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors"
              />
            </div>

            {/* Concept */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">컨셉 / 설명</label>
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="마스코트의 외형, 분위기, 특징을 자유롭게 설명해주세요&#10;예: 귀여운 곰 캐릭터, 민트색 리본을 한, 둥글둥글한 체형"
                rows={4}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors resize-none"
              />
            </div>

            {/* Tone chips */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">톤 & 매너</label>
              <div className="flex flex-wrap gap-2">
                {TONE_CHIPS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleChip(selectedTones, t, setSelectedTones)}
                    className={`rounded-lg px-3 py-1.5 text-sm border transition-all ${
                      selectedTones.includes(t)
                        ? "bg-[#00e5cc]/10 border-[#00e5cc]/30 text-[#00e5cc]"
                        : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/[0.12]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose chips */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">용도</label>
              <div className="flex flex-wrap gap-2">
                {PURPOSE_CHIPS.map((p) => (
                  <button
                    key={p}
                    onClick={() => toggleChip(selectedPurposes, p, setSelectedPurposes)}
                    className={`rounded-lg px-3 py-1.5 text-sm border transition-all ${
                      selectedPurposes.includes(p)
                        ? "bg-[#00e5cc]/10 border-[#00e5cc]/30 text-[#00e5cc]"
                        : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/[0.12]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Style dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">스타일</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-[#00e5cc]/40 transition-colors appearance-none"
              >
                {STYLE_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-[#111] text-white">
                    {STYLE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate CTA */}
            <button
              onClick={generate}
              disabled={generating || !concept.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI가 생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI 마스코트 생성
                </>
              )}
            </button>
          </div>

          {/* Preview — 2col */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                <div className="aspect-square flex items-center justify-center relative">
                  {generating ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-[#00e5cc]/20 flex items-center justify-center mx-auto animate-pulse">
                        <Loader2 className="w-8 h-8 text-[#00e5cc] animate-spin" />
                      </div>
                      <p className="text-sm text-white/30">AI가 마스코트를 생성하고 있습니다...</p>
                    </div>
                  ) : result ? (
                    <img src={result} alt="Generated" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center space-y-3">
                      <User className="w-16 h-16 text-white/[0.06] mx-auto" />
                      <p className="text-xs text-white/20">생성 결과가 여기에 표시됩니다</p>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                {result && (
                  <div className="p-4 border-t border-white/[0.06] flex gap-3">
                    <button
                      onClick={save}
                      className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all"
                    >
                      <Check className="w-4 h-4" />
                      저장
                    </button>
                    <button
                      onClick={generate}
                      className="h-10 px-4 rounded-xl border border-white/[0.08] text-white/50 text-sm flex items-center gap-2 hover:border-white/[0.15] hover:text-white/70 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      재생성
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
