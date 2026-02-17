import { Shape } from "@shared/types/shapes/Shape";

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

export function isInLine(
  x: number,
  y: number,
  start: [number, number],
  end: [number, number],
) {
  const minX = Math.min(start[0], end[0]);
  const maxX = Math.max(start[0], end[0]);
  const minY = Math.min(start[1], end[1]);
  const maxY = Math.max(start[1], end[1]);
  const dToLine = distanceToLine(x, y, start, end);
  return x >= minX && x <= maxX && y >= minY && y <= maxY && dToLine <= 4;
}

export function distanceToLine(
  x0: number,
  y0: number,
  start: [number, number],
  end: [number, number],
) {
  const [x1, y1] = start;
  const [x2, y2] = end;
  const numerator = Math.abs(
    (y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1,
  );
  const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
  return numerator / denominator;
}

export function calculatePadding(
  _width: number,
  _height: number,
  lineWidth: number,
): [number, number] {
  // If width is positive, pad right. If negative, pad left.
  // If height is positive, pad down. If negative, pad up.
  const xPadding = _width >= 0 ? lineWidth : -lineWidth;
  const yPadding = _height >= 0 ? lineWidth : -lineWidth;

  return [xPadding, yPadding];
}

export function getCanvasCoordinates(
  e: MouseEvent,
  canvas: HTMLCanvasElement | undefined,
) {
  if (!canvas) {
    return { x: 0, y: 0 };
  }
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return { x, y };
}

export const isPointInShape = (shape: Shape, x: number, y: number): boolean => {
  return shape.isPointInShape(x, y);
};

export const checkSelectedShape = (shapes: Shape[], x: number, y: number) => {
  const shape = shapes.find((shape) => isPointInShape(shape, x, y));
  return shape;
};

export function getShapesUnderPoint(
  shapes: Shape[],
  x: number,
  y: number,
): Shape[] {
  return shapes.filter((shape) => shape.isPointInShape(x, y));
}

export function normalizeRect({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const x2 = x + w;
  const y2 = y + h;

  const left = Math.min(x, x2);
  const right = Math.max(x, x2);
  const top = Math.min(y, y2);
  const bottom = Math.max(y, y2);

  return {
    x: left, // always top-left.x
    y: top, // always top-left.y
    width: right - left,
    height: bottom - top,
  };
}
