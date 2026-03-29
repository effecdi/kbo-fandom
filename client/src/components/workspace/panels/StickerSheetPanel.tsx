import { useState } from "react";
import { useWorkspace } from "@/hooks/use-workspace";
import { useCopilot } from "@/hooks/use-copilot";
import { STICKER_GRID_PRESETS, STICKER_SIZE_PRESETS } from "@/lib/fandom-goods-config";
import { Grid3X3, Circle, Square, Copy } from "lucide-react";

type SheetSize = "A5" | "A6";
type StickerShape = "circle" | "square";

export function StickerSheetPanel() {
  const { state } = useWorkspace();
  const { sendMessage } = useCopilot();
  const fandomMeta = state.fandomMeta;

  const [sheetSize, setSheetSize] = useState<SheetSize>("A5");
  const [gridPreset, setGridPreset] = useState("3x4");
  const [stickerSize, setStickerSize] = useState("5cm");
  const [stickerShape, setStickerShape] = useState<StickerShape>("circle");

  const memberName = fandomMeta?.memberTags[0] || fandomMeta?.groupName || "";

  function handleGenerate() {
    const grid = STICKER_GRID_PRESETS.find(g => g.id === gridPreset);
    const size = STICKER_SIZE_PRESETS.find(s => s.id === stickerSize);
    const gridDesc = grid && grid.cols > 0 ? `${grid.cols}×${grid.rows} 배열` : "자유 배치";
    const shapeDesc = stickerShape === "circle" ? "원형" : "사각형";

    sendMessage(
      `${memberName} 귀여운 스티커 시트 디자인, ${sheetSize} 사이즈, ${gridDesc}, ` +
      `${size?.sizeMm || 50}mm ${shapeDesc} 스티커, 흰 배경, 키스컷 라인 포함, ` +
      `다양한 표정과 포즈, multiple cute sticker designs, white background, kiss-cut ready`
    );
  }

  function handleFillSheet() {
    sendMessage("현재 스티커를 복제해서 시트 빈 공간을 모두 채워줘");
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-wider px-1">
        스티커시트 레이아웃
      </h3>

      {/* Sheet Size */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">시트 사이즈</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(["A5", "A6"] as SheetSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setSheetSize(size)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                sheetSize === size
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
              }`}
            >
              <p className="text-[13px] font-semibold">{size}</p>
              <p className="text-[13px] text-white/30">
                {size === "A5" ? "148×210mm" : "105×148mm"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Preset */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">배열 방식</p>
        <div className="flex flex-wrap gap-1.5">
          {STICKER_GRID_PRESETS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGridPreset(g.id)}
              className={`px-2.5 py-1.5 rounded-lg border text-[13px] font-medium transition-all ${
                gridPreset === g.id
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sticker Size */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">스티커 크기</p>
        <div className="flex gap-1.5">
          {STICKER_SIZE_PRESETS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStickerSize(s.id)}
              className={`flex-1 px-2 py-1.5 rounded-lg border text-center text-[13px] font-medium transition-all ${
                stickerSize === s.id
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shape */}
      <div className="space-y-1.5">
        <p className="text-[13px] text-white/40 px-1">스티커 모양</p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setStickerShape("circle")}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border transition-all ${
              stickerShape === "circle"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span className="text-[13px]">원형</span>
          </button>
          <button
            onClick={() => setStickerShape("square")}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl border transition-all ${
              stickerShape === "square"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-white/60"
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span className="text-[13px]">사각형</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-1.5">
        <button
          onClick={handleGenerate}
          className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary text-[13px] font-bold flex items-center justify-center gap-2"
        >
          <Grid3X3 className="w-4 h-4" />
          스티커시트 생성
        </button>
        <button
          onClick={handleFillSheet}
          className="w-full py-2 rounded-xl border border-white/[0.06] hover:bg-white/[0.04] transition-all text-white/50 text-[13px] flex items-center justify-center gap-2"
        >
          <Copy className="w-3.5 h-3.5" />
          시트 채우기 (복제)
        </button>
      </div>
    </div>
  );
}
