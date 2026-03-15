/**
 * 자동화툰 레이아웃 유틸리티
 * 캔버스(450×600) 내에서 컷 수에 따른 영역 계산 + 울퉁불퉁 컷 보더 생성
 */

const DEFAULT_CANVAS_W = 540;
const DEFAULT_CANVAS_H = 675;
const PAD = 40;       // 캔버스 가장자리 여백
const GAP = 24;       // 컷 사이 간격
const BORDER_W = 3;   // 컷 보더 두께

export type CutLayoutType = "default" | "square";
export type CutBorderStyle = "wobbly" | "simple";

export interface CutRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 캔버스 내 컷 영역 배열 반환
 *   1컷: 전체 (패딩 포함)
 *   2컷: 2×1 그리드 (상/하 균등)
 *   3컷: 2×2 그리드 (좌상, 우상, 좌하) — 모든 셀 동일 크기
 *   4컷: 2×2 그리드
 *   layoutType "square" (4컷 전용): 각 컷을 정사각형으로 (세로 가운데 정렬)
 */
export function getCutRegions(cutsPerCanvas: number, layoutType: CutLayoutType = "default", canvasW?: number, canvasH?: number): CutRegion[] {
  const cw = canvasW ?? DEFAULT_CANVAS_W;
  const ch = canvasH ?? DEFAULT_CANVAS_H;
  const contentW = cw - PAD * 2;
  const contentH = ch - PAD * 2;

  // Square layout — 4컷 전용
  if (layoutType === "square" && cutsPerCanvas === 4) {
    const colW = (contentW - GAP) / 2;
    const rowH = (contentH - GAP) / 2;
    const squareSize = Math.min(colW, rowH);
    const offsetY = (contentH - squareSize * 2 - GAP) / 2;
    const offsetX = (contentW - squareSize * 2 - GAP) / 2;
    return [
      { x: PAD + offsetX, y: PAD + offsetY, width: squareSize, height: squareSize },
      { x: PAD + offsetX + squareSize + GAP, y: PAD + offsetY, width: squareSize, height: squareSize },
      { x: PAD + offsetX, y: PAD + offsetY + squareSize + GAP, width: squareSize, height: squareSize },
      { x: PAD + offsetX + squareSize + GAP, y: PAD + offsetY + squareSize + GAP, width: squareSize, height: squareSize },
    ];
  }

  switch (cutsPerCanvas) {
    case 1:
      return [{ x: PAD, y: PAD, width: contentW, height: contentH }];
    case 2: {
      const rowH = (contentH - GAP) / 2;
      return [
        { x: PAD, y: PAD, width: contentW, height: rowH },
        { x: PAD, y: PAD + rowH + GAP, width: contentW, height: rowH },
      ];
    }
    case 3: {
      const colW = (contentW - GAP) / 2;
      const rowH = (contentH - GAP) / 2;
      return [
        { x: PAD, y: PAD, width: colW, height: rowH },
        { x: PAD + colW + GAP, y: PAD, width: colW, height: rowH },
        { x: PAD, y: PAD + rowH + GAP, width: contentW, height: rowH },
      ];
    }
    case 4: {
      const colW = (contentW - GAP) / 2;
      const rowH = (contentH - GAP) / 2;
      return [
        { x: PAD, y: PAD, width: colW, height: rowH },
        { x: PAD + colW + GAP, y: PAD, width: colW, height: rowH },
        { x: PAD, y: PAD + rowH + GAP, width: colW, height: rowH },
        { x: PAD + colW + GAP, y: PAD + rowH + GAP, width: colW, height: rowH },
      ];
    }
    default:
      return [{ x: PAD, y: PAD, width: contentW, height: contentH }];
  }
}

// ---- 울퉁불퉁(wobbly) 손글씨 스타일 보더 ----

/** 시드 기반 pseudo-random (결정적 — 같은 시드면 같은 결과) */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** 울퉁불퉁한 둥근 사각형 경로를 여러 점으로 생성 */
function wobblyRoundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  cornerR: number,
  wobble: number,
  seed: number,
): { x: number; y: number }[] {
  const rand = seededRandom(seed);
  const pts: { x: number; y: number }[] = [];
  const r = Math.min(cornerR, w / 3, h / 3);
  const segLen = 8; // 점 간격 (작을수록 더 세밀)

  const jitter = () => (rand() - 0.5) * wobble;

  // 직선 구간 — segLen 간격으로 점 배치 + jitter
  const addStraight = (sx: number, sy: number, ex: number, ey: number) => {
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.round(len / segLen));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push({
        x: sx + dx * t + jitter(),
        y: sy + dy * t + jitter(),
      });
    }
  };

  // 모서리 원호 — 약 6~8개 점으로 표현
  const addCorner = (cx: number, cy: number, startAngle: number) => {
    const cornerSteps = 6;
    for (let i = 0; i <= cornerSteps; i++) {
      const angle = startAngle + (Math.PI / 2) * (i / cornerSteps);
      pts.push({
        x: cx + Math.cos(angle) * r + jitter() * 0.5,
        y: cy + Math.sin(angle) * r + jitter() * 0.5,
      });
    }
  };

  // 시계 방향: top → right → bottom → left
  // Top side (left to right)
  addStraight(x + r, y, x + w - r, y);
  // Top-right corner
  addCorner(x + w - r, y + r, -Math.PI / 2);
  // Right side (top to bottom)
  addStraight(x + w, y + r, x + w, y + h - r);
  // Bottom-right corner
  addCorner(x + w - r, y + h - r, 0);
  // Bottom side (right to left)
  addStraight(x + w - r, y + h, x + r, y + h);
  // Bottom-left corner
  addCorner(x + r, y + h - r, Math.PI / 2);
  // Left side (bottom to top)
  addStraight(x, y + h - r, x, y + r);
  // Top-left corner
  addCorner(x + r, y + r, Math.PI);

  // 닫기: 첫 점으로 돌아오기
  if (pts.length > 0) {
    pts.push({ x: pts[0].x, y: pts[0].y });
  }

  return pts;
}

/**
 * 보더 스타일에 따라 둥근 사각형 포인트 생성
 * - wobbly: cornerR=8, wobble=1.8 (울퉁불퉁 손글씨)
 * - simple: cornerR=4, wobble=0 (깔끔한 라운드 사각형)
 */
export function regenerateBorderPoints(
  x: number, y: number, w: number, h: number,
  borderStyle: CutBorderStyle, seed: number = 42,
): { x: number; y: number }[] {
  if (borderStyle === "simple") {
    return wobblyRoundedRect(x, y, w, h, 4, 0, seed);
  }
  return wobblyRoundedRect(x, y, w, h, 8, 1.8, seed);
}

/**
 * 각 컷 영역의 보더 LineElement 배열 반환
 * (story.tsx의 CanvasLineElement 호환)
 */
export function buildDividerLines(
  cutsPerCanvas: number,
  layoutType: CutLayoutType = "default",
  borderStyle: CutBorderStyle = "wobbly",
  borderWidth?: number,
  canvasW?: number,
  canvasH?: number,
): Array<{
  id: string;
  lineType: "straight";
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  opacity: number;
  startArrow: boolean;
  endArrow: boolean;
  dashPattern: "solid";
  zIndex: number;
  visible: boolean;
  borderStyle: CutBorderStyle;
}> {
  if (cutsPerCanvas <= 1) return [];

  const regions = getCutRegions(cutsPerCanvas, layoutType, canvasW, canvasH);

  return regions.map((region, i) => {
    const pts = regenerateBorderPoints(
      region.x, region.y, region.width, region.height,
      borderStyle, 42 + i * 137,
    );

    return {
      id: Math.random().toString(36).slice(2, 10),
      lineType: "straight" as const,
      points: pts,
      color: "#000000",
      strokeWidth: borderWidth ?? BORDER_W,
      opacity: 1,
      startArrow: false,
      endArrow: false,
      dashPattern: "solid" as const,
      zIndex: 100,
      visible: true,
      borderStyle,
    };
  });
}
