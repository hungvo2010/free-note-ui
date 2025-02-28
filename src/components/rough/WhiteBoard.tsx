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
import { Text } from "types/shape/Text";
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
  const [coordinator, setCoordinator] = useState<Coordinator>(
    new Coordinator(0, 0)
  );
  const [selectedShape, setSelectedShape] = useState<Shape | undefined>(
    undefined
  );
  const canvasRef = useRef<HTMLCanvasElement>(
    document.getElementById("canvas") as HTMLCanvasElement
  );
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const drawingRef = useRef(false);
  const moveBoardRef = useRef(false);
  const reDrawController = useMemo(
    () => new ReDrawController(roughCanvas, shapes.current),
    [roughCanvas]
  );
  const [isEditingText, setIsEditingText] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const handleMouseEnter = useCallback(
    (
      shapes: Shape[],
      x: number,
      y: number,
      cursorType: string,
      eventType: string
    ) => {
      const selectedShape = checkSelectedShape(shapes, x, y);
      setSelectedShape(selectedShape);
      updateCursorType(
        canvasRef.current!,
        selectedShape ? cursorType : "default"
      );
      if (eventType === "mousedown") {
        setIsDraggingShape(true);
      }
    },
    []
  );

  const handleAddTextShape = useCallback(
    (x: number, y: number) => {
      updateCursorType(canvasRef.current!, "text");
      const textShape = shapes.current.find(
        (shape) => shape instanceof Text && shape.isPointInShape(x, y)
      );
      if (textShape) {
        setIsEditingText(true);
        setSelectedShape(textShape);
        console.log("text shape: " + textInputRef.current);
        textInputRef.current?.focus();
        return;
      }
      const newShape = new Text(roughCanvas, x, y, "very first text");
      reDrawController.addShape(newShape);
      // newShape.draw(0, 0);
      // newShape.getBoundingRect().drawRectangle();
      setSelectedShape(newShape);
    },
    [roughCanvas, reDrawController]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e, canvasRef.current);
      positionRef.current = { x, y };
      dragStartPosRef.current = { x, y };

      if (isEditingText && type !== "word") {
        setIsEditingText(false);
        return;
      }

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
          updateCursorType(canvasRef.current!, "pointer");
          break;
        case "mouse":
          handleMouseEnter(shapes.current, x, y, "move", "mousedown");
          break;
        case "word":
          handleAddTextShape(x, y);
          break;
        default:
          return;
      }
      if (newShape) {
        reDrawController.addShape(newShape);
        drawingRef.current = true;
      }
      if (type !== "mouse" && type !== "word") {
        setSelectedShape(undefined);
      }
    },
    [
      type,
      roughCanvas,
      reDrawController,
      handleMouseEnter,
      isEditingText,
      handleAddTextShape,
    ]
  );
  const reDraw = useCallback(
    (offsetX: number, offsetY: number) => {
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      }
      reDrawController.reDraw(offsetX, offsetY);
      if (selectedShape && type === "mouse") {
        drawBoundingBox(canvas, selectedShape);
      }
    },
    [canvas, reDrawController, selectedShape, type]
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
        handleMouseEnter(shapes.current, x, y, "pointer", "mousemove");
        return;
      }

      if (type === "word" && isEditingText) {
        updateCursorType(canvasRef.current!, "text");
        return;
      }

      updateCursorType(canvasRef.current!, "default");
      if (!drawingRef.current && !isDraggingShape) return;

      reDrawController.updateLastShape(startPosition.x, startPosition.y, x, y);
      reDraw(0, 0);
    },
    [
      type,
      reDraw,
      reDrawController,
      isDraggingShape,
      selectedShape,
      isEditingText,
      handleMouseEnter,
    ]
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
        updateCursorType(canvasRef.current!, "default");
      }
      if (isDraggingShape) {
        setIsDraggingShape(false);
        updateCursorType(canvasRef.current!, "default");
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (!selectedShape || !(selectedShape instanceof Text)) return;

      const currentText = (selectedShape as Text).getText();
      const textPos = (selectedShape as Text).getPosition();
      const clickPos = positionRef.current;

      // Calculate approximate character position based on click position
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.font = "20px Excalifont";
      const charWidth = ctx.measureText("M").width; // Use M as average char width
      const clickOffset = Math.max(
        0,
        Math.round((clickPos.x - textPos.x) / charWidth)
      );
      const editPosition = Math.min(clickOffset, currentText.length);

      if (e.key === "Backspace") {
        const newText =
          currentText.slice(0, editPosition - 1) +
          currentText.slice(editPosition);
        (selectedShape as Text).setText(newText);
        reDraw(0, 0);
      } else if (e.key.length === 1) {
        const newText =
          currentText.slice(0, editPosition) +
          e.key +
          currentText.slice(editPosition);
        (selectedShape as Text).setText(newText);
        reDraw(0, 0);
      }
    },
    [selectedShape, reDraw, canvas]
  );

  const textInputStyle = useMemo(() => {
    if (!selectedShape || !(selectedShape instanceof Text))
      return { display: "none" };
    const pos = (selectedShape as Text).getPosition();
    return {
      position: "absolute" as const,
      left: `${pos.x}px`,
      top: `${pos.y - 20}px`,
      border: "none",
      background: "transparent",
      outline: "none",
      font: "20px Excalifont",
      display: isEditingText ? "block" : "none",
    };
  }, [selectedShape, isEditingText]);

  console.log("re render: " + isEditingText);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        id="myCanvas"
        className="full-canvas"
        ref={canvasRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      ></canvas>
      <textarea
        ref={textInputRef}
        style={{
          ...textInputStyle,
          caretColor: "black",
          caretShape: "bar",
        }}
        autoFocus={isEditingText}
        onBlur={() => setIsEditingText(false)}
        onChange={(e) => {
          if (selectedShape instanceof Text) {
            const textPos = (selectedShape as Text).getPosition();
            // setSelectedShape(
            //   new Text(roughCanvas, textPos.x, textPos.y, e.target.value)
            // );
          }
        }}
      />
    </div>
  );
}
