import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import Arrow from "types/Arrow";
import { Circle } from "types/Circle";
import { CircleAdapter } from "types/CircleAdapter";
import { Line } from "types/Line";
import { Rectangle } from "types/Rectangle";
import { RectangleAdapter } from "types/RectangleAdapter";
import { Shape } from "types/Shape";
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
  const [curvePoints, setCurvePoints] = useState<[number, number][]>([[0, 0]]);
  const curvePointsRef = useRef(curvePoints);
  const drawingRef = useRef(false);

  const drawPen = (x2: number, y2: number) => {
    roughCanvas?.curve([...curvePointsRef.current, [x2, y2]], {
      roughness: 0.1,
      strokeWidth: 2,
    });
  };

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
          updateLastRect(x, y);
          // drawRect(positionRef.current.x, positionRef.current.y, x, y);
          reDraw();
          break;
        case "diam":
          drawDiamond(positionRef.current.x, positionRef.current.y, x, y);
          break;
        case "arrow":
          updateLastArrow(x, y);
          reDraw();
          break;
        case "circle":
          updateLastCircle(x, y);
          reDraw();
          break;
        case "pen":
          drawPen(x, y);
          break;
        case "line":
          updateLastLine(x, y);
          reDraw();
          break;
      }
      setCurvePoints((prev) => [...prev, [x, y]]);
      curvePointsRef.current = [...curvePointsRef.current, [x, y]];
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

  const drawDiamond = (x1: number, y1: number, x2: number, y2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const mainPoint = {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
    };
    const distanceInY = (Math.sin(angle) * distance(x1, y1, x2, y2)) / 2;
    const left = {
      x: x1,
      y: y1 + distanceInY,
    };
    const top = {
      x: mainPoint.x,
      y: mainPoint.y - distanceInY,
    };
    const right = {
      x: x2,
      y: y2 - distanceInY,
    };
    const bottom = {
      x: mainPoint.x,
      y: mainPoint.y + distanceInY,
    };
    roughCanvas?.linearPath(
      [
        [left.x, left.y],
        [top.x, top.y],
        [right.x, right.y],
        [bottom.x, bottom.y],
        [left.x, left.y],
      ],
      {
        roughness: 1,
        stroke: "black",
      }
    );
  };

  return (
    <canvas
      id="myCanvas"
      className="full-canvas"
      ref={canvasRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    ></canvas>
  );

  function updateLastRect(x: number, y: number) {
    const lastRect = shapes.current[
      shapes.current.length - 1
    ] as RectangleAdapter;
    shapes.current[shapes.current.length - 1] = new RectangleAdapter(
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

  function updateLastArrow(x: number, y: number) {
    const lastArrow = shapes.current[shapes.current.length - 1] as Arrow;
    const newArrow = new Arrow(roughCanvas, lastArrow.x1, lastArrow.y1);
    newArrow.x2 = x;
    newArrow.y2 = y;
    shapes.current[shapes.current.length - 1] = newArrow;
  }

  function updateLastLine(x: number, y: number) {
    const lastLine = shapes.current[shapes.current.length - 1] as Line;
    const newLine = new Line(roughCanvas, lastLine.x1, lastLine.y1);
    newLine.x2 = x;
    newLine.y2 = y;
    shapes.current[shapes.current.length - 1] = newLine;
  }

  function updateLastCircle(x: number, y: number) {
    const lastCircle = shapes.current[
      shapes.current.length - 1
    ] as CircleAdapter;
    shapes.current[shapes.current.length - 1] = new CircleAdapter(
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
