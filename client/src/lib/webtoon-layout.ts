/**
 * 자동화툰 레이아웃 유틸리티
 * 캔버스(450×600) 내에서 컷 수에 따른 영역 계산 + 울퉁불퉁 컷 보더 생성
 */

const CANVAS_W = 450;
const CANVAS_H = 600;
const PAD = 20;       // 캔버스 가장자리 여백
const GAP = 8;        // 컷 사이 간격
const BORDER_W = 3;   // 컷 보더 두께

export interface CutRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 캔버스 내 컷 영역 배열 반환 (12px padding, 12px gap)
 *   1컷: 전체 (패딩 포함)
 *   2컷: 상/하 분할
 *   3컷: 상단 좌/우 + 하단 전체
 *   4컷: 2×2 그리드
 */
export function getCutRegions(cutsPerCanvas: number): CutRegion[] {
  const contentW = CANVAS_W - PAD * 2;
  const contentH = CANVAS_H - PAD * 2;

  switch (cutsPerCanvas) {
    case 1:
      return [{ x: PAD, y: PAD, width: contentW, height: contentH }];
    case 2: {
      const h = (contentH - GAP) / 2;
      return [
        { x: PAD, y: PAD, width: contentW, height: h },
        { x: PAD, y: PAD + h + GAP, width: contentW, height: h },
      ];
    }
    case 3: {
      const topH = Math.round((contentH - GAP) * 0.45);
      const botH = contentH - GAP - topH;
      const colW = (contentW - GAP) / 2;
      return [
        { x: PAD, y: PAD, width: colW, height: topH },
        { x: PAD + colW + GAP, y: PAD, width: colW, height: topH },
        { x: PAD, y: PAD + topH + GAP, width: contentW, height: botH },
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
 * 각 컷 영역의 울퉁불퉁한 손글씨 스타일 보더 LineElement 배열 반환
 * (story.tsx의 CanvasLineElement 호환)
 */
export function buildDividerLines(cutsPerCanvas: number): Array<{
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
}> {
  if (cutsPerCanvas <= 1) return [];

  const regions = getCutRegions(cutsPerCanvas);

  return regions.map((region, i) => {
    const pts = wobblyRoundedRect(
      region.x,
      region.y,
      region.width,
      region.height,
      8,     // corner radius
      1.8,   // wobble amount
      42 + i * 137, // deterministic seed per cut
    );

    return {
      id: Math.random().toString(36).slice(2, 10),
      lineType: "straight" as const,
      points: pts,
      color: "#000000",
      strokeWidth: BORDER_W,
      opacity: 1,
      startArrow: false,
      endArrow: false,
      dashPattern: "solid" as const,
      zIndex: 100,
      visible: true,
    };
  });
}
