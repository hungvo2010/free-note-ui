import { RoughCanvas } from "roughjs/bin/canvas";
import { PADDING } from "./Constant";
import { calculatePadding, distance } from "./GeometryUtils";

export function clearLastRectangle(
  canvas: HTMLCanvasElement,
  lastVisitedPoints: number[][],
  startPoint: { x: number; y: number }
) {
  const lastX = lastVisitedPoints[lastVisitedPoints.length - 1][0];
  const lastY = lastVisitedPoints[lastVisitedPoints.length - 1][1];
  const angle = Math.atan2(lastY - startPoint.y, lastX - startPoint.x);
  const padding = calculatePadding((angle * 180) / Math.PI, PADDING);
  clearRect(
    canvas,
    startPoint.x - padding[0],
    startPoint.y - padding[1],
    lastX - startPoint.x + padding[0] * 2,
    lastY - startPoint.y + padding[1] * 2
  );
}

export const clearRect = (
  canvas: HTMLCanvasElement | undefined,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const ctx = canvas?.getContext("2d");
  ctx?.clearRect(x, y, width, height);
};

const clearCircle = (
  canvas: HTMLCanvasElement | undefined,
  x: number,
  y: number,
  radius: number
) => {
  const context = canvas?.getContext("2d");
  if (context) {
    context.save();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
  }
};

const drawWord = (
  canvas: HTMLCanvasElement | undefined,
  x: number,
  y: number
) => {
  const ctx = canvas?.getContext("2d");
  if (ctx && canvas) {
    // setCurrentText("");
  }
  // clearInterval(caretInterval.current);
  // setIsCaretVisible(true);
  // caretInterval.current = setInterval(() => {
  //   setIsCaretVisible((prev) => !prev);
  // }, 500);
};

const drawArrow = (
  roughCanvas: any,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  drawLine(roughCanvas, x1, y1, x2, y2);
  if (distance(x1, y1, x2, y2) < 20) return;

  const headLength = 15;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  drawLine(
    roughCanvas,
    x2,
    y2,
    x2 - headLength * Math.cos(angle - Math.PI / 6),
    y2 - headLength * Math.sin(angle - Math.PI / 6)
  );
  drawLine(
    roughCanvas,
    x2,
    y2,
    x2 - headLength * Math.cos(angle + Math.PI / 6),
    y2 - headLength * Math.sin(angle + Math.PI / 6)
  );
};

export const drawLine = (
  roughCanvas: RoughCanvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  return roughCanvas?.line(x1, y1, x2, y2, {
    roughness: 1,
    stroke: "black",
    seed: 3,
  });
};

const drawCircle = (
  roughCanvas: any,
  x: number,
  y: number,
  x1: number,
  y1: number
) => {
  const angle = Math.atan2(y1 - y, x1 - x);

  roughCanvas?.circle(
    (x + x1) / 2,
    (y + y1) / 2,
    (distance(x1, y1, x, y) * Math.cos(angle)) / 2,
    {
      roughness: 1,
      stroke: "black",
      curveFitting: 0.95,
    }
  );
};

const drawRect = (x: number, y: number, x1: number, y1: number) => {
  // roughCanvasRef.current?.rectangle(x, y, x1 - x, y1 - y, {
  //     roughness: 1,
  //     stroke: "black",
  // });
};


export function updateCursorType(canvas: HTMLCanvasElement, cursor: string) {
  canvas.style.cursor = cursor;
}

const drawPen = (
  roughCanvas: any,
  curvePoints: [number, number][],
  x2: number,
  y2: number
) => {
  roughCanvas?.curve([...curvePoints, [x2, y2]], {
    roughness: 0.1,
    strokeWidth: 2,
  });
};

// function updateLastRect(shapes: Shape[], x: number, y: number) {
//     const lastRect = shapes[shapes.length - 1] as RectangleAdapter;
//     shapes[shapes.length - 1] = new RectangleAdapter(
//       new Rectangle(
//         roughCanvas,
//         lastRect.getStartPoint().x,
//         lastRect.getStartPoint().y,
//         x - positionRef.current.x,
//         y - positionRef.current.y
//       ),
//       new Date().getMilliseconds()
//     );
//   }

//   function updateLastDiamond(shapes: Shape[], x: number, y: number) {
//     const lastDiamond = shapes[shapes.length - 1] as Diamond;
//     const newDiamond = new Diamond(roughCanvas, lastDiamond.x1, lastDiamond.y1);
//     newDiamond.x2 = x;
//     newDiamond.y2 = y;
//     shapes[shapes.length - 1] = newDiamond;
//   }

//   function updateShapePoint(shapes: Shape[], x: number, y: number) {
//     const shapePoints = shapes[shapes.length - 1] as FreeStyleShape;
//     const newFreeStyleShape = new FreeStyleShape(roughCanvas, [
//       ...shapePoints.points,
//       [x, y],
//     ]);
//     shapes[shapes.length - 1] = newFreeStyleShape;
//   }

//   function updateLastCircle(shapes: Shape[], x: number, y: number) {
//     const lastCircle = shapes[shapes.length - 1] as CircleAdapter;
//     shapes[shapes.length - 1] = new CircleAdapter(
//       new Circle(
//         roughCanvas,
//         (lastCircle.getCenterPoint().x + x) / 2,
//         (lastCircle.getCenterPoint().y + y) / 2,
//         distance(x, y, positionRef.current.x, positionRef.current.y) / 2
//       ),
//       new Date().getMilliseconds()
//     );
//   }

// function updateLastRect(shapes: Shape[], x: number, y: number) {
//     const lastRect = shapes[shapes.length - 1] as RectangleAdapter;
//     shapes[shapes.length - 1] = new RectangleAdapter(
//       new Rectangle(
//         roughCanvas,
//         lastRect.getStartPoint().x,
//         lastRect.getStartPoint().y,
//         x - positionRef.current.x,
//         y - positionRef.current.y
//       ),
//       new Date().getMilliseconds()
//     );
//   }

// function updateLastDiamond(shapes: Shape[], x: number, y: number) {
//     const lastDiamond = shapes[shapes.length - 1] as Diamond;
//     const newDiamond = new Diamond(roughCanvas, lastDiamond.x1, lastDiamond.y1);
//     newDiamond.x2 = x;
//     newDiamond.y2 = y;
//     shapes[shapes.length - 1] = newDiamond;
//   }

// function updateLastArrow(shapes: Shape[], x: number, y: number) {
//     const lastArrow = shapes[shapes.length - 1] as Arrow;
//     const newArrow = new Arrow(roughCanvas, lastArrow.x1, lastArrow.y1);
//     newArrow.x2 = x;
//     newArrow.y2 = y;
//     shapes[shapes.length - 1] = newArrow;
//   }

// function updateLastLine(shapes: Shape[], x: number, y: number) {
//     const lastLine = shapes[shapes.length - 1] as Line;
//     const newLine = new Line(roughCanvas, lastLine.x1, lastLine.y1);
//     newLine.x2 = x;
//     newLine.y2 = y;
//     shapes[shapes.length - 1] = newLine;
//   }

// function updateLastCircle(shapes: Shape[], x: number, y: number) {
//     const lastCircle = shapes[shapes.length - 1] as CircleAdapter;
//     shapes[shapes.length - 1] = new CircleAdapter(
//       new Circle(
//         roughCanvas,
//         (lastCircle.getCenterPoint().x + x) / 2,
//         (lastCircle.getCenterPoint().y + y) / 2,
//         distance(x, y, positionRef.current.x, positionRef.current.y) / 2
//       ),
//       new Date().getMilliseconds()
//     );
//   }

// function updateShapePoint(shapes: Shape[], x: number, y: number) {
//     const shapePoints = shapes[shapes.length - 1] as FreeStyleShape;
//     const newFreeStyleShape = new FreeStyleShape(roughCanvas, [
//       ...shapePoints.points,
//       [x, y],
//     ]);
//     shapes[shapes.length - 1] = newFreeStyleShape;
//   }

export function toVirtualX(
  xReal: number,
  offsetX: number,
  scale: number
): number {
  return (xReal + offsetX) * scale;
}

export function toVirtualY(
  yReal: number,
  offsetY: number,
  scale: number
): number {
  return (yReal + offsetY) * scale;
}

export function toRealX(
  xVirtual: number,
  offsetX: number,
  scale: number
): number {
  return xVirtual / scale - offsetX;
}

export function toRealY(
  yVirtual: number,
  offsetY: number,
  scale: number
): number {
  return yVirtual / scale - offsetY;
}
