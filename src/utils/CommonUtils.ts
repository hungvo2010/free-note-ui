import { PADDING } from "./Constant";
import { calculatePadding, distance } from "./GeometryUtils";

export function clearLastRectangle(canvas: HTMLCanvasElement, lastVisitedPoints: number[][], startPoint: { x: number; y: number }) {
    const lastX = lastVisitedPoints[lastVisitedPoints.length - 1][0];
    const lastY = lastVisitedPoints[lastVisitedPoints.length - 1][1];
    const angle = Math.atan2(
        lastY - startPoint.y,
        lastX - startPoint.x
    );
    const padding = calculatePadding((angle * 180) / Math.PI, PADDING);
    clearRect(
        canvas,
        startPoint.x - padding[0],
        startPoint.y - padding[1],
        lastX - startPoint.x + padding[0] * 2,
        lastY - startPoint.y + padding[1] * 2
    );
}

export const clearRect = (canvas: HTMLCanvasElement | undefined, x: number, y: number, width: number, height: number) => {
    const ctx = canvas?.getContext("2d");
    ctx?.clearRect(x, y, width, height);
};

const clearCircle = (canvas: HTMLCanvasElement | undefined, x: number, y: number, radius: number) => {
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



const drawWord = (canvas: HTMLCanvasElement | undefined, x: number, y: number) => {
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

const drawArrow = (roughCanvas: any, x1: number, y1: number, x2: number, y2: number) => {
    drawLine(roughCanvas, x1, y1, x2, y2);
    if (distance(x1, y1, x2, y2) < 20) return;

    const headLength = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    drawLine(roughCanvas,
        x2,
        y2,
        x2 - headLength * Math.cos(angle - Math.PI / 6),
        y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    drawLine(roughCanvas,
        x2,
        y2,
        x2 - headLength * Math.cos(angle + Math.PI / 6),
        y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
};

export const drawLine = (roughCanvas: any, x1: number, y1: number, x2: number, y2: number) => {
    roughCanvas?.line(x1, y1, x2, y2, {
        roughness: 1,
        stroke: "black",
    });
};



const drawCircle = (roughCanvas: any, x: number, y: number, x1: number, y1: number) => {
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

function reDrawRectangleV2() {
    // const x1 =
    //   curvePointsRef.current[curvePointsRef.current.length - 1][0];
    // const y1 =
    //   curvePointsRef.current[curvePointsRef.current.length - 1][1];
    // clearCircle(
    //   (positionRef.current.x + x1) / 2,
    //   (positionRef.current.y + y1) / 2,
    //   distance(x1, y1, positionRef.current.x, positionRef.current.y) / 2
    // );
    // drawCircle(positionRef.current.x, positionRef.current.y, x, y);
}