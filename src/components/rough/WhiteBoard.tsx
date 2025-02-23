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

import { Coordinator } from "main/Coordinator";
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
import { updateCursorType } from "utils/CommonUtils";
import { resizeCanvasToDisplaySize } from "utils/DisplayUtils";
import {
  checkSelectedShape,
  drawBoundingBox,
  getCanvasCoordinates,
} from "utils/GeometryUtils";
import "./WhiteBoard.scss";

type DrawTypeProps = {
  type: string;
};

export default function WhiteBoard({ type }: DrawTypeProps) {
  const shapes = useRef<Shape[]>([]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const [coordinator, setCoordinator] = useState<Coordinator>(
    new Coordinator(0, 0)
  );
  const [selectedShape, setSelectedShape] = useState<Shape | undefined>(
    undefined
  );
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
      dragStartPosRef.current = { x, y };
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
        case "mouse":
          handleMouseEnter(shapes.current, x, y);
          break;
        default:
          return;
      }
      if (newShape) {
        reDrawController.addShape(newShape);
        drawingRef.current = true;
      }
      if (type !== "mouse") {
        setSelectedShape(undefined);
      }
    },
    [type, roughCanvas, reDrawController]
  );

  const handleMouseEnter = useCallback(
    (shapes: Shape[], x: number, y: number) => {
      const selectedShape = checkSelectedShape(shapes, x, y);
      if (selectedShape) {
        setSelectedShape(selectedShape);
        setIsDraggingShape(true);
        updateCursorType(canvasRef.current, "move");
        return;
      }
    },
    []
  );

  const reDraw = useCallback(
    (offsetX: number, offsetY: number) => {
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      }
      reDrawController.reDraw(offsetX, offsetY);
      if (selectedShape) {
        drawBoundingBox(canvas, selectedShape);
      }
    },
    [canvas, reDrawController, selectedShape]
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

      if (type === "mouse") {
        if (isDraggingShape && selectedShape) {
          selectedShape.toVirtualCoordinates(
            x - dragStartPosRef.current.x,
            y - dragStartPosRef.current.y
          );
          dragStartPosRef.current = { x, y };
          reDraw(0, 0);
          return;
        }
        const shape = checkSelectedShape(shapes.current, x, y);
        if (shape) {
          updateCursorType(canvasRef.current, "pointer");
        } else {
          updateCursorType(canvasRef.current, "default");
        }
        return;
      }

      if (!drawingRef.current) return;

      reDrawController.updateLastShape(startPosition.x, startPosition.y, x, y);
      reDraw(0, 0);
    },
    [type, reDraw, reDrawController, isDraggingShape, selectedShape]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      drawingRef.current = false;
      if (type === "hand") {
        moveBoardRef.current = false;
        const { x, y } = getCanvasCoordinates(e, canvasRef.current);
        setCoordinator(
          (val) =>
            new Coordinator(
              val.getOffsetX() + x - positionRef.current.x,
              val.getOffsetY() + y - positionRef.current.y
            )
        );
        reDrawController.updateCoordinates(
          x - positionRef.current.x,
          y - positionRef.current.y
        );
        updateCursorType(canvasRef.current, "default");
      }
      if (isDraggingShape) {
        setIsDraggingShape(false);
        updateCursorType(canvasRef.current, "pointer");
        return;
      }
    },
    [type, reDrawController, isDraggingShape]
  );

  const handleCanvasBlur = useCallback(() => {
    setSelectedShape(undefined);
  }, []);

  useLayoutEffect(() => {
    function updateSize() {
      const canvas = canvasRef.current;
      if (canvas) {
        resizeCanvasToDisplaySize(canvas);
        reDraw(0, 0);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [reDraw]);

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
    myCanvas.addEventListener("blur", handleCanvasBlur);
    return () => {
      console.log("on cleanup function");
      myCanvas.removeEventListener("mousedown", handleMouseDown);
      myCanvas.removeEventListener("mousemove", handleMouseMove);
      myCanvas.removeEventListener("mouseup", handleMouseUp);
      myCanvas.removeEventListener("blur", handleCanvasBlur);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleCanvasBlur]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    console.log("handleKeyDown: " + e.key.length);
  };

  console.log("re render");

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
