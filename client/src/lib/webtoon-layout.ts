/**
 * 자동화툰 레이아웃 유틸리티
 * 캔버스(450×600) 내에서 컷 수에 따른 영역 계산 + 구분선 생성
 */

const CANVAS_W = 450;
const CANVAS_H = 600;
const DIVIDER_THICKNESS = 3;

export interface CutRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 캔버스 내 컷 영역 배열 반환 */
export function getCutRegions(cutsPerCanvas: number): CutRegion[] {
  switch (cutsPerCanvas) {
    case 1:
      return [{ x: 0, y: 0, width: CANVAS_W, height: CANVAS_H }];
    case 2:
      return [
        { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H / 2 },
        { x: 0, y: CANVAS_H / 2, width: CANVAS_W, height: CANVAS_H / 2 },
      ];
    case 3:
      return [
        { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H / 3 },
        { x: 0, y: CANVAS_H / 3, width: CANVAS_W, height: CANVAS_H / 3 },
        { x: 0, y: (CANVAS_H * 2) / 3, width: CANVAS_W, height: CANVAS_H / 3 },
      ];
    case 4:
      return [
        { x: 0, y: 0, width: CANVAS_W / 2, height: CANVAS_H / 2 },
        { x: CANVAS_W / 2, y: 0, width: CANVAS_W / 2, height: CANVAS_H / 2 },
        { x: 0, y: CANVAS_H / 2, width: CANVAS_W / 2, height: CANVAS_H / 2 },
        { x: CANVAS_W / 2, y: CANVAS_H / 2, width: CANVAS_W / 2, height: CANVAS_H / 2 },
      ];
    default:
      return [{ x: 0, y: 0, width: CANVAS_W, height: CANVAS_H }];
  }
}

/** 컷 구분선 LineElement 배열 반환 (story.tsx의 CanvasLineElement 호환) */
export function buildDividerLines(cutsPerCanvas: number): Array<{
  id: string;
  type: "straight";
  x1: number; y1: number;
  x2: number; y2: number;
  strokeColor: string;
  strokeWidth: number;
  zIndex: number;
  visible: boolean;
}> {
  const lines: Array<{
    id: string;
    type: "straight";
    x1: number; y1: number;
    x2: number; y2: number;
    strokeColor: string;
    strokeWidth: number;
    zIndex: number;
    visible: boolean;
  }> = [];

  const makeLine = (x1: number, y1: number, x2: number, y2: number) => ({
    id: Math.random().toString(36).slice(2, 10),
    type: "straight" as const,
    x1, y1, x2, y2,
    strokeColor: "#000000",
    strokeWidth: DIVIDER_THICKNESS,
    zIndex: 100,
    visible: true,
  });

  switch (cutsPerCanvas) {
    case 2:
      lines.push(makeLine(0, CANVAS_H / 2, CANVAS_W, CANVAS_H / 2));
      break;
    case 3:
      lines.push(makeLine(0, CANVAS_H / 3, CANVAS_W, CANVAS_H / 3));
      lines.push(makeLine(0, (CANVAS_H * 2) / 3, CANVAS_W, (CANVAS_H * 2) / 3));
      break;
    case 4:
      lines.push(makeLine(CANVAS_W / 2, 0, CANVAS_W / 2, CANVAS_H));
      lines.push(makeLine(0, CANVAS_H / 2, CANVAS_W, CANVAS_H / 2));
      break;
  }

  return lines;
}
