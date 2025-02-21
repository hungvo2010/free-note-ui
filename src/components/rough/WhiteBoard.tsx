import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
import { getCanvasCoordinates } from "utils/GeometryUtils";
import "./WhiteBoard.scss";
import { updateCursorType } from "utils/CommonUtils";

type DrawTypeProps = {
  type: string;
};

export default function WhiteBoard({ type }: DrawTypeProps) {
  const shapes = useRef<Shape[]>([]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(
    document.getElementById("canvas") as HTMLCanvasElement
  );
  const positionRef = useRef({ x: 0, y: 0 });
  const drawingRef = useRef(false);
  const moveBoardRef = useRef(false);
  const reDrawController = useMemo(
    () => new ReDrawController(roughCanvas, shapes.current),
    [roughCanvas]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e, canvasRef.current);
      positionRef.current = { x, y };
      let newShape: Shape | undefined;
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
            new Circle(roughCanvas, x, y, 0),
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
        case "hand":
          moveBoardRef.current = true;
          updateCursorType(canvasRef.current, "pointer");
          break;
        default:
          return;
      }
      if (newShape) {
        reDrawController.addShape(newShape);
        drawingRef.current = true;
      }
    },
    [type, roughCanvas, reDrawController]
  );

  const reDraw = useCallback(
    (offsetX: number, offsetY: number) => {
      // console.log("reDraw: " + offsetX + " " + offsetY);
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      }
      reDrawController.reDraw(offsetX, offsetY);
    },
    [canvas, reDrawController]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e, canvasRef.current);
      const startPosition = positionRef.current;

      if (type === "hand" && moveBoardRef.current) {
        const offset = {
          x: x - startPosition.x,
          y: y - startPosition.y,
        };
        reDraw(offset.x, offset.y);
        return;
      }

      if (!drawingRef.current) return;

      reDrawController.updateLastShape(startPosition.x, startPosition.y, x, y);
      reDraw(0, 0);
    },
    [type, reDraw, reDrawController]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      drawingRef.current = false;
      if (type === "hand") {
        moveBoardRef.current = false;
        const { x, y } = getCanvasCoordinates(e, canvasRef.current);
        setOffsetX((val) => val + x - positionRef.current.x);
        setOffsetY((val) => val + y - positionRef.current.y);
        reDrawController.updateCoordinates(
          x - positionRef.current.x,
          y - positionRef.current.y
        );
        updateCursorType(canvasRef.current, "default");
      }
    },
    [type, reDrawController]
  );

  useLayoutEffect(() => {
    function updateSize() {
      console.log("updateSize: " + offsetX + " " + offsetY);
      const canvas = canvasRef.current;
      if (canvas) {
        resizeCanvasToDisplaySize(canvas);
        reDraw(0, 0);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [reDraw, offsetX, offsetY]);

  useEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = myCanvas.getContext("2d");
    if (myCanvas && ctx) {
      ctx.font = "20px Excalifont";
    }
    const newRoughCanvas = rough.canvas(myCanvas);
    setCanvas(myCanvas);
    setRoughCanvas(newRoughCanvas);
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
