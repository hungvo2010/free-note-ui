import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import rough from "roughjs";

import { Coordinator } from "main/Coordinator";
import { ReDrawController } from "main/ReDrawController";
import { Shape } from "types/shape/Shape";
import { Text } from "types/shape/Text";
import { resizeCanvasToDisplaySize } from "utils/DisplayUtils";
import {
  checkSelectedShape,
  drawBoundingBox,
  getCanvasCoordinates,
  getShapesUnderPoint,
} from "utils/GeometryUtils";
import "./WhiteBoard.scss";
import { updateCursorType } from "utils/CommonUtils";
import { ImageShape } from "types/shape/ImageShape";
import { ShapeFactory } from "utils/ShapeFactory";
import { ImageService } from "services/ImageService";
import { useCanvas } from "hooks/useCanvas";

type DrawTypeProps = {
  type: string;
};

export default function WhiteBoard({ type }: DrawTypeProps) {
  const shapes = useRef<Shape[]>([]);
  const { canvas, roughCanvas, canvasRef } = useCanvas();
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [coordinator, setCoordinator] = useState<Coordinator>(
    new Coordinator(0, 0)
  );
  const [selectedShape, setSelectedShape] = useState<Shape | undefined>(
    undefined
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
  const eraserModeRef = useRef(false);
  const eraserSizeRef = useRef(10); // Eraser size in pixels
  const eraserCursorTimeoutRef = useRef<number | null>(null);

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
        updateCursorType(canvasRef.current, "move");
        return;
      }
    },
    [canvasRef]
  );

  const handleAddTextShape = useCallback(
    (x: number, y: number) => {
      updateCursorType(canvasRef.current, "text");
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
    [roughCanvas, reDrawController, canvasRef]
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

      if (type === "eraser") {
        // Just set eraser mode to true, don't erase yet
        eraserModeRef.current = true;
        updateCursorType(canvasRef.current, "eraser");
        return;
      } else if (type === "image") {
        ImageService.openImageDialog(
          (imageShape) => {
            reDrawController.addShape(imageShape);
            reDraw(0, 0);
          },
          roughCanvas,
          x,
          y
        );
        return;
      } else if (type === "word") {
        handleAddTextShape(x, y);
        return;
      } else if (type === "hand") {
        moveBoardRef.current = true;
        updateCursorType(canvasRef.current, "pointer");
        return;
      } else if (type === "mouse") {
        handleMouseEnter(shapes.current, x, y, "move", "mousedown");
        return;
      }

      // Use the factory for other shape types
      newShape = ShapeFactory.createShape(type, roughCanvas, x, y);

      if (newShape) {
        reDrawController.addShape(newShape);
        drawingRef.current = true;
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
      reDraw,
      canvasRef,
    ]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e, canvasRef.current);
      
      // Handle eraser dragging - move this to the top
      if (type === "eraser" && eraserModeRef.current) {
        // Find and remove shapes under the eraser
        const shapesToRemove = getShapesUnderPoint(shapes.current, x, y);
        if (shapesToRemove.length > 0) {
          // Remove the shapes
          shapes.current = shapes.current.filter(
            shape => !shapesToRemove.includes(shape)
          );
          // Update the controller's shapes reference
          reDrawController.updateShapes(shapes.current);
          reDraw(0, 0);
        }
        
        // Draw eraser cursor
        const ctx = canvas?.getContext("2d");
        if (ctx) {
          // Draw after the main redraw to ensure it's on top
          ctx.beginPath();
          ctx.arc(x, y, eraserSizeRef.current, 0, Math.PI * 2);
          ctx.strokeStyle = "#000000";
          ctx.stroke();
          
          // Clear previous timeout if exists
          if (eraserCursorTimeoutRef.current !== null) {
            window.clearTimeout(eraserCursorTimeoutRef.current);
          }
          
          // Set timeout to clear the cursor after a short delay
          eraserCursorTimeoutRef.current = window.setTimeout(() => {
            reDraw(0, 0); // Redraw without the cursor
            eraserCursorTimeoutRef.current = null;
          }, 150); // Adjust timing as needed (150ms works well)
        }
        return;
      }

      const startPosition = positionRef.current;
      
      if (moveBoardRef.current) {
        const offset = {
          x: x - startPosition.x,
          y: y - startPosition.y,
        };
        reDraw(offset.x, offset.y);
        return;
      }
      
      if (isDraggingShape && selectedShape) {
        selectedShape.toVirtualCoordinates(
          x - dragStartPosRef.current.x,
          y - dragStartPosRef.current.y
        );
        dragStartPosRef.current = { x, y };
        console.log(Object.is(selectedShape, shapes.current[0]));
        reDraw(0, 0);
        return;
      }
      
      if (type === "word" && isEditingText) {
        updateCursorType(canvasRef.current, "text");
        return;
      }

      updateCursorType(canvasRef.current, "default");
      if ((!drawingRef.current && !isDraggingShape) || type === "image") return;

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
      canvasRef,
      eraserModeRef,
      eraserSizeRef,
      moveBoardRef,
      shapes,
      canvas,
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
        updateCursorType(canvasRef.current, "default");
      }
      if (isDraggingShape) {
        setIsDraggingShape(false);
        updateCursorType(canvasRef.current, "pointer");
        return;
      }

      if (type === "eraser") {
        eraserModeRef.current = false;
        return;
      }
    },
    [type, reDrawController, isDraggingShape, canvasRef]
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
  }, [reDraw, canvasRef]);

  useEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = myCanvas.getContext("2d");
    if (myCanvas && ctx) {
      ctx.font = "20px Excalifont";
    }
    const newRoughCanvas = rough.canvas(myCanvas);
    reDraw(0, 0);
  }, [reDraw, canvasRef]);

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

  useEffect(() => {
    // Set up the redraw callback for ImageShape
    ImageShape.setRedrawCallback(() => {
      reDraw(0, 0);
    });

    return () => {
      // Clear the callback on unmount
      ImageShape.setRedrawCallback(() => {});
    };
  }, [reDraw]);

  useEffect(() => {
    if (type === "image") {
      ImageService.openImageDialog(
        (imageShape) => {
          reDrawController.addShape(imageShape);
          reDraw(0, 0);
        },
        roughCanvas,
        canvas ? canvas.width / 2 - 100 : 0,
        canvas ? canvas.height / 2 - 100 : 0
      );
    }
  }, [type, roughCanvas, reDrawController, reDraw, canvas]);

  useEffect(() => {
    return () => {
      if (eraserCursorTimeoutRef.current !== null) {
        window.clearTimeout(eraserCursorTimeoutRef.current);
      }
    };
  }, []);

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
            setSelectedShape(
              new Text(roughCanvas, textPos.x, textPos.y, e.target.value)
            );
          }
        }}
      />
    </div>
  );
}
