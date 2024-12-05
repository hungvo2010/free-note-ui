import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import { ReDrawController } from "main/ReDrawController";
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
  const reDrawController = new ReDrawController(roughCanvas, shapes.current);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      let newShape: Shape;
      switch (type) {
        case "rect":
          newShape = new RectangleAdapter(
            roughCanvas,
            new Rectangle(roughCanvas, x, y, 0, 0),
            new Date().getMilliseconds()
          );
          break;
        case "circle":
          newShape = new CircleAdapter(
            roughCanvas,
            new Circle(roughCanvas, x, y, x, y, 0),
            new Date().getMilliseconds()
          );
          break;
        case "arrow":
          newShape = new Arrow(roughCanvas, x, y);
          break;
        case "line":
          newShape = new Line(roughCanvas, x, y);
          break;
        case "pen":
          newShape = new FreeStyleShape(roughCanvas, [[x, y]]);
          break;
        case "diam":
          newShape = new Diamond(roughCanvas, x, y);
          break;
        default:
          return;
      }
      reDrawController.addShape(newShape);
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
      reDrawController.updateLastShape(x, y);
      reDraw();
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
    reDrawController.reDraw();
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
}
