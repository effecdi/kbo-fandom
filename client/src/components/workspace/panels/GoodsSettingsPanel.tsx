import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  PHYSICAL_SIZES,
  GOODS_PHYSICAL_SIZE_MAP,
  type PhysicalSizeKey,
} from "@/lib/fandom-goods-config";
import { Printer, Ruler, Eye, EyeOff } from "lucide-react";

export function GoodsSettingsPanel() {
  const { state, dispatch } = useWorkspace();
  const fandomMeta = state.fandomMeta;
  const printSettings = state.printSettings;
  const templateType = fandomMeta?.templateType || "";

  const availableSizes = GOODS_PHYSICAL_SIZE_MAP[templateType] || [];
  const [selectedSizeKey, setSelectedSizeKey] = useState<PhysicalSizeKey | null>(
    availableSizes[0] || null
  );

  const [dpi, setDpi] = useState<72 | 150 | 300>(300);
  const [showBleed, setShowBleed] = useState(false);
  const [showTrim, setShowTrim] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(false);

  function handleApplySettings() {
    if (!selectedSizeKey) return;
    const size = PHYSICAL_SIZES[selectedSizeKey];
    dispatch({
      type: "SET_PRINT_SETTINGS",
      settings: {
        dpi,
        bleedMm: 3,
        showBleedMarks: showBleed,
        showTrimLines: showTrim,
        showSafeZone,
        physicalWidthMm: size.widthMm,
        physicalHeightMm: size.heightMm,
      },
    });
  }

  const currentSize = selectedSizeKey ? PHYSICAL_SIZES[selectedSizeKey] : null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider px-1">
        굿즈 인쇄 설정
      </h3>

      {/* Physical Size */}
      {availableSizes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-white/40 px-1 flex items-center gap-1">
            <Ruler className="w-3 h-3" /> 물리 사이즈
          </p>
          <div className="space-y-1">
            {availableSizes.map((sizeKey) => {
              const size = PHYSICAL_SIZES[sizeKey];
              const isSelected = selectedSizeKey === sizeKey;
              return (
                <button
                  key={sizeKey}
                  onClick={() => setSelectedSizeKey(sizeKey)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
                  }`}
                >
                  <span className="text-xs font-medium">{size.label}</span>
                  <span className="text-[10px] text-white/30 ml-auto">
                    {size.widthMm}×{size.heightMm}mm
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DPI */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-white/40 px-1 flex items-center gap-1">
          <Printer className="w-3 h-3" /> 해상도 (DPI)
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {([72, 150, 300] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDpi(d)}
              className={`px-2 py-2 rounded-xl border text-center text-xs font-medium transition-all ${
                dpi === d
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
              }`}
            >
              {d}
              <span className="block text-[10px] text-white/30 mt-0.5">
                {d === 72 ? "화면" : d === 150 ? "보통" : "인쇄"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pixel Preview */}
      {currentSize && (
        <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <p className="text-[10px] text-white/30">내보내기 시 픽셀 크기</p>
          <p className="text-xs text-white/70 font-mono mt-0.5">
            {Math.round((currentSize.widthMm / 25.4) * dpi)} × {Math.round((currentSize.heightMm / 25.4) * dpi)} px
          </p>
        </div>
      )}

      {/* Guide Toggles */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-white/40 px-1">가이드 표시</p>

        <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer">
          <input
            type="checkbox"
            checked={showBleed}
            onChange={() => setShowBleed(!showBleed)}
            className="w-3.5 h-3.5 rounded accent-primary"
          />
          {showBleed ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-white/30" />}
          <span className="text-xs text-white/60">블리드 마크 (3mm)</span>
        </label>

        <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer">
          <input
            type="checkbox"
            checked={showTrim}
            onChange={() => setShowTrim(!showTrim)}
            className="w-3.5 h-3.5 rounded accent-primary"
          />
          {showTrim ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-white/30" />}
          <span className="text-xs text-white/60">트림 라인</span>
        </label>

        <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer">
          <input
            type="checkbox"
            checked={showSafeZone}
            onChange={() => setShowSafeZone(!showSafeZone)}
            className="w-3.5 h-3.5 rounded accent-primary"
          />
          {showSafeZone ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-white/30" />}
          <span className="text-xs text-white/60">세이프존 (5mm 안쪽)</span>
        </label>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApplySettings}
        className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary text-xs font-bold"
      >
        설정 적용
      </button>
    </div>
  );
}
