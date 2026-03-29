import { useState, useCallback } from "react";
import { useWorkspace, useCanvasRef } from "@/hooks/use-workspace";
import { mmToPx, PHYSICAL_SIZES, type PhysicalSizeKey } from "@/lib/fandom-goods-config";
import {
  X,
  Printer,
  Download,
  FileImage,
  Loader2,
  Check,
  Ruler,
  Eye,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type ExportFormat = "png" | "jpeg";

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function PrintExportDialog({ open, onClose }: Props) {
  const { state } = useWorkspace();
  const canvasRef = useCanvasRef();
  const printSettings = state.printSettings;
  const fandomMeta = state.fandomMeta;

  const [dpi, setDpi] = useState<72 | 150 | 300>(printSettings?.dpi || 300);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [includeBleed, setIncludeBleed] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const physicalW = printSettings?.physicalWidthMm || 55;
  const physicalH = printSettings?.physicalHeightMm || 85;
  const exportW = mmToPx(physicalW, dpi);
  const exportH = mmToPx(physicalH, dpi);

  const handleExport = useCallback(async () => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    setExporting(true);

    try {
      // Calculate multiplier based on export DPI vs screen DPI (72)
      const multiplier = dpi / 72;

      const dataUrl = fc.toDataURL({
        format: format === "jpeg" ? "jpeg" : "png",
        quality: format === "jpeg" ? 0.92 : 1,
        multiplier,
      });

      const ext = format === "jpeg" ? "jpg" : "png";
      const name = `${fandomMeta?.title || state.project.title}_${dpi}dpi.${ext}`;
      triggerDownload(dataUrl, name);

      setExported(true);
      setTimeout(() => setExported(false), 2500);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [canvasRef, dpi, format, fandomMeta, state.project.title]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="absolute inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-[480px] bg-[#0c0c0f] border border-white/[0.06] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Printer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white">인쇄용 내보내기</h2>
              <p className="text-[13px] text-white/40">고해상도 인쇄 품질 출력</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06]">
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Physical Size Display */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 space-y-2">
            <div className="flex items-center gap-2 text-white/50">
              <Ruler className="w-4 h-4" />
              <span className="text-[13px] font-medium">물리 사이즈</span>
            </div>
            <p className="text-lg font-bold text-white">
              {physicalW}mm × {physicalH}mm
            </p>
            <p className="text-[13px] text-white/30">
              ({(physicalW / 10).toFixed(1)}cm × {(physicalH / 10).toFixed(1)}cm)
            </p>
          </div>

          {/* DPI Selection */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-white/40 uppercase tracking-wider">해상도 (DPI)</label>
            <div className="grid grid-cols-3 gap-2">
              {([72, 150, 300] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDpi(d)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    dpi === d
                      ? "bg-primary/10 border-primary/30"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]"
                  }`}
                >
                  <p className={`text-sm font-bold ${dpi === d ? "text-primary" : "text-white/70"}`}>{d}</p>
                  <p className="text-[13px] text-white/30 mt-0.5">
                    {d === 72 ? "화면용" : d === 150 ? "보통 인쇄" : "고품질 인쇄"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-white/40 uppercase tracking-wider">포맷</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat("png")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  format === "png"
                    ? "bg-primary/10 border-primary/30"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]"
                }`}
              >
                <p className={`text-sm font-bold ${format === "png" ? "text-primary" : "text-white/70"}`}>PNG</p>
                <p className="text-[13px] text-white/30 mt-0.5">무손실, 투명 지원</p>
              </button>
              <button
                onClick={() => setFormat("jpeg")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  format === "jpeg"
                    ? "bg-primary/10 border-primary/30"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06]"
                }`}
              >
                <p className={`text-sm font-bold ${format === "jpeg" ? "text-primary" : "text-white/70"}`}>JPEG</p>
                <p className="text-[13px] text-white/30 mt-0.5">작은 파일 크기</p>
              </button>
            </div>
          </div>

          {/* Bleed marks */}
          <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer">
            <input
              type="checkbox"
              checked={includeBleed}
              onChange={() => setIncludeBleed(!includeBleed)}
              className="w-3.5 h-3.5 rounded accent-primary"
            />
            <Eye className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[13px] text-white/60">블리드 마크 + 트림 라인 포함</span>
          </label>

          {/* Export Info */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-1">
            <p className="text-[13px] text-white/30">내보내기 결과</p>
            <p className="text-[13px] text-white/60 font-mono">
              {exportW} × {exportH} px ({format.toUpperCase()})
            </p>
            <p className="text-[13px] text-white/30">
              예상 파일 크기: ~{format === "jpeg" ? Math.round(exportW * exportH * 3 / 10 / 1024) : Math.round(exportW * exportH * 4 / 3 / 1024)} KB
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-primary to-primary/80 text-black shadow-[0_4px_20px_rgba(0,229,204,0.2)] hover:shadow-[0_4px_28px_rgba(0,229,204,0.35)] active:scale-[0.98] disabled:opacity-50"
          >
            {exporting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> 내보내는 중...</>
            ) : exported ? (
              <><Check className="w-5 h-5" /> 다운로드 완료!</>
            ) : (
              <><Download className="w-5 h-5" /> {dpi}dpi {format.toUpperCase()} 내보내기</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
