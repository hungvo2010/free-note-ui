import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import Arrow from "types/shape/Arrow";
import { Circle } from "types/shape/Circle";
import { CircleAdapter } from "types/shape/CircleAdapter";
import { Diamond } from "types/shape/Diamond";
import { FreeStyleShape } from "types/shape/FreeStyleShape";
import { Line } from "types/shape/Line";
import { Rectangle } from "types/shape/Rectangle";
import { RectangleAdapter } from "types/shape/RectangleAdapter";
import { Shape } from "types/shape/Shape";
import { resizeCanvasToDisplaySize } from "utils/DisplayUtils";
import { distance } from "utils/GeometryUtils";
import "./WhiteBoard.scss";

type DrawTypeProps = {
  type: string;
};

export default function WhiteBoard({ type }: DrawTypeProps) {
  const shapes = useRef<Shape[]>([]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const canvasRef = useRef(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef(startPosition);
  const roughCanvasRef = useRef(roughCanvas);
  const drawingRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      switch (type) {
        case "rect":
          shapes.current.push(
            new RectangleAdapter(
              new Rectangle(roughCanvas, x, y, 0, 0),
              new Date().getMilliseconds()
            )
          );
          break;
        case "circle":
          shapes.current.push(
            new CircleAdapter(
              new Circle(roughCanvas, x, y, 0),
              new Date().getMilliseconds()
            )
          );
          break;
        case "arrow":
          shapes.current.push(new Arrow(roughCanvas, x, y));
          break;
        case "line":
          shapes.current.push(new Line(roughCanvas, x, y));
          break;
        case "pen":
          shapes.current.push(new FreeStyleShape(roughCanvas, [[x, y]]));
          break;
        case "diam":
          shapes.current.push(new Diamond(roughCanvas, x, y));
      }
      drawingRef.current = true;
      setStartPosition({ x, y });
      positionRef.current = { x, y };
    },
    [type, roughCanvas]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drawingRef.current) return;
      const { x, y } = getCanvasCoordinates(e);
      switch (type) {
        case "rect":
          // clearLastRectangle();
          // drawRect(positionRef.current.x, positionRef.current.y, x, y);
          updateLastRect(shapes.current, x, y);
          reDraw();
          break;
        case "diam":
          updateLastDiamond(shapes.current, x, y);
          reDraw();
          break;
        case "arrow":
          updateLastArrow(shapes.current, x, y);
          reDraw();
          break;
        case "circle":
          updateLastCircle(shapes.current, x, y);
          reDraw();
          break;
        case "pen":
          updateShapePoint(shapes.current, x, y);
          reDraw();
          break;
        case "line":
          updateLastLine(shapes.current, x, y);
          reDraw();
          break;
      }
    },
    [type, roughCanvas]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      drawingRef.current = false;
    },
    [type]
  );

  const reDraw = useCallback(() => {
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    }
    for (const shape of shapes.current) {
      shape.draw();
    }
  }, [canvas]);

  useLayoutEffect(() => {
    function updateSize() {
      const canvas = canvasRef.current;
      if (canvas) {
        resizeCanvasToDisplaySize(canvas);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = myCanvas.getContext("2d");
    if (myCanvas && ctx) {
      ctx.font = "20px Excalifont";
    }
    const newRoughCanvas = rough.canvas(myCanvas);
    setCanvas(myCanvas);
    setRoughCanvas(newRoughCanvas);
    roughCanvasRef.current = newRoughCanvas;
  }, []);

  useEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    myCanvas.addEventListener("mousedown", handleMouseDown);
    myCanvas.addEventListener("mousemove", handleMouseMove);
    myCanvas.addEventListener("mouseup", handleMouseUp);
    return () => {
      console.log("on cleanup function");
      myCanvas.removeEventListener("mousedown", handleMouseDown);
      myCanvas.removeEventListener("mousemove", handleMouseMove);
      myCanvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    console.log("handleKeyDown: " + e.key.length);
  };

  const getCanvasCoordinates = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) {
      return { x: 0, y: 0 };
    }
    const rect = (
      canvasRef.current as HTMLCanvasElement
    ).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }, []);

  return (
    <canvas
      id="myCanvas"
      className="full-canvas"
      ref={canvasRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    ></canvas>
  );

  function updateLastRect(shapes: Shape[], x: number, y: number) {
    const lastRect = shapes[shapes.length - 1] as RectangleAdapter;
    shapes[shapes.length - 1] = new RectangleAdapter(
      new Rectangle(
        roughCanvas,
        lastRect.getStartPoint().x,
        lastRect.getStartPoint().y,
        x - positionRef.current.x,
        y - positionRef.current.y
      ),
      new Date().getMilliseconds()
    );
  }

  function updateLastArrow(shapes: Shape[], x: number, y: number) {
    const lastArrow = shapes[shapes.length - 1] as Arrow;
    const newArrow = new Arrow(roughCanvas, lastArrow.x1, lastArrow.y1);
    newArrow.x2 = x;
    newArrow.y2 = y;
    shapes[shapes.length - 1] = newArrow;
  }

  function updateLastLine(shapes: Shape[], x: number, y: number) {
    const lastLine = shapes[shapes.length - 1] as Line;
    const newLine = new Line(roughCanvas, lastLine.x1, lastLine.y1);
    newLine.x2 = x;
    newLine.y2 = y;
    shapes[shapes.length - 1] = newLine;
  }

  function updateLastDiamond(shapes: Shape[], x: number, y: number) {
    const lastDiamond = shapes[shapes.length - 1] as Diamond;
    const newDiamond = new Diamond(roughCanvas, lastDiamond.x1, lastDiamond.y1);
    newDiamond.x2 = x;
    newDiamond.y2 = y;
    shapes[shapes.length - 1] = newDiamond;
  }

  function updateShapePoint(shapes: Shape[], x: number, y: number) {
    const shapePoints = shapes[shapes.length - 1] as FreeStyleShape;
    const newFreeStyleShape = new FreeStyleShape(roughCanvas, [
      ...shapePoints.points,
      [x, y],
    ]);
    shapes[shapes.length - 1] = newFreeStyleShape;
  }

  function updateLastCircle(shapes: Shape[], x: number, y: number) {
    const lastCircle = shapes[shapes.length - 1] as CircleAdapter;
    shapes[shapes.length - 1] = new CircleAdapter(
      new Circle(
        roughCanvas,
        (lastCircle.getCenterPoint().x + x) / 2,
        (lastCircle.getCenterPoint().y + y) / 2,
        distance(x, y, positionRef.current.x, positionRef.current.y) / 2
      ),
      new Date().getMilliseconds()
    );
  }
}
