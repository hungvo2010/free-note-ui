import { ReDrawController } from "main/ReDrawController";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { RoughCanvas } from "roughjs/bin/canvas";
import { ImageService } from "services/ImageService";
import { Shape } from "types/shape/Shape";
import { TextShape } from "types/shape/Text";
import { updateCursorType } from "utils/CommonUtils";
import { resizeCanvasToDisplaySize } from "utils/DisplayUtils";
import { getCanvasCoordinates } from "utils/GeometryUtils";
import { ShapeFactory } from "utils/ShapeFactory";
import { useTheme } from "./useTheme";
export function useWhiteboardEvents(
  shapes: React.MutableRefObject<Shape[]>,
  roughCanvas: RoughCanvas | undefined,
  reDrawController: ReDrawController,
  isLocked: boolean,
  type: string,
  selectedShape: Shape | undefined,
  setSelectedShape: (shape: Shape | undefined) => void,
  canvas: HTMLCanvasElement | undefined
) {
  const drawingRef = useRef(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const moveBoardRef = useRef(false);
  const eraserModeRef = useRef(false);
  const eraserSizeRef = useRef(10);
  const eraserCursorTimeoutRef = useRef<number | null>(null);
  const prevLockedRef = useRef(isLocked);
  const isDraggingShapeRef = useRef(false);
  const isEditingTextRef = useRef(false);
  const { theme } = useTheme();

  useLayoutEffect(() => {
    function updateSize() {
      if (canvas) {
        resizeCanvasToDisplaySize(canvas);
        reDrawController.reDraw(0, 0);
        selectedShape?.drawBoundingBox(canvas);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [canvas, reDrawController, selectedShape]);

  // Effect to update cursor when lock state changes
  useEffect(() => {
    if (isLocked !== prevLockedRef.current) {
      prevLockedRef.current = isLocked;

      if (isLocked) {
        updateCursorType(canvas, "not-allowed");
      } else {
        updateCursorType(canvas, "default");
      }
    }
  }, [isLocked, canvas]);

  // Clean up the eraser cursor timeout when component unmounts
  useEffect(() => {
    return () => {
      if (eraserCursorTimeoutRef.current !== null) {
        window.clearTimeout(eraserCursorTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(
    (x: number, y: number, cursorType: string, eventType: string) => {
      const selectedShape = reDrawController.checkSelectedShape(x, y);
      setSelectedShape(selectedShape);
      updateCursorType(canvas, selectedShape ? cursorType : "default");
      if (eventType === "mousedown") {
        updateCursorType(canvas, "move");
        return;
      }
    },
    [canvas, reDrawController, setSelectedShape]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (isLocked) {
        return;
      }

      const { x, y } = getCanvasCoordinates(e, canvas);
      positionRef.current = { x, y };
      dragStartPosRef.current = { x, y };

      if (isEditingTextRef.current && type !== "word") {
        isEditingTextRef.current = false;
        return;
      }

      if (type === "eraser") {
        // Just set eraser mode to true, don't erase yet
        eraserModeRef.current = true;
        updateCursorType(canvas, "eraser");
        return;
      } else if (type === "image") {
        ImageService.openImageDialog(
          (imageShape) => {
            reDrawController.addShape(imageShape);
          },
          roughCanvas,
          x,
          y,
          () => {
            reDrawController.reDraw(0, 0);
            selectedShape?.drawBoundingBox(canvas);
          }
        );
        return;
      } else if (type === "word") {
        const textShape = new TextShape(roughCanvas, x, y, "");
        reDrawController.addShape(textShape);
        setSelectedShape(textShape);
        isEditingTextRef.current = true;
        return;
      } else if (type === "mouse") {
        const clickedShape = reDrawController.checkSelectedShape(x, y);
        setSelectedShape(clickedShape);
        isDraggingShapeRef.current = true;
        updateCursorType(canvas!, "move");
        return;
      } else if (type === "hand") {
        moveBoardRef.current = true;
        updateCursorType(canvas!, "pointer");
        return;
      }

      drawingRef.current = true;
      const newShape = ShapeFactory.createShape(type, roughCanvas, x, y);
      if (newShape) {
        reDrawController.addShape(newShape);
      }
    },
    [
      isLocked,
      canvas,
      type,
      selectedShape,
      roughCanvas,
      reDrawController,
      setSelectedShape,
      isEditingTextRef,
    ]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e, canvas);

      // Handle eraser dragging - move this to the top
      if (type === "eraser" && eraserModeRef.current) {
        // Find and remove shapes under the eraser
        const shapesToRemove = reDrawController.getShapesUnderPoint(x, y);
        if (shapesToRemove.length > 0) {
          // Remove the shapes
          reDrawController.removeShapes(shapesToRemove);
          shapes.current = shapes.current.filter(
            (shape) => !shapesToRemove.includes(shape)
          );
          reDrawController.reDraw(0, 0);
        }

        // Draw eraser cursor
        const ctx = canvas?.getContext("2d");
        if (ctx) {
          // Draw after the main redraw to ensure it's on top
          ctx.beginPath();
          ctx.arc(x, y, eraserSizeRef.current, 0, Math.PI * 2);
          ctx.strokeStyle = theme === "dark" ? "#ffffff" : "#000000";
          ctx.stroke();

          // Clear previous timeout if exists
          if (eraserCursorTimeoutRef.current !== null) {
            window.clearTimeout(eraserCursorTimeoutRef.current);
          }

          // Set timeout to clear the cursor after a short delay
          eraserCursorTimeoutRef.current = window.setTimeout(() => {
            reDrawController.reDraw(0, 0); // Redraw without the cursor
            eraserCursorTimeoutRef.current = null;
          }, 150); // Adjust timing as needed (150ms works well)
        }
        return;
      }

      // If locked, only allow cursor changes for better UX, but no edits
      if (type === "mouse" && !isDraggingShapeRef.current) {
        const hoverShape = reDrawController.checkSelectedShape(x, y);
        updateCursorType(canvas, hoverShape ? "pointer" : "default");
        handleMouseEnter(x, y, "pointer", "mousemove");
        return;
      }

      const startPosition = positionRef.current;

      if (type === "hand" && moveBoardRef.current) {
        const offset = {
          x: x - startPosition.x,
          y: y - startPosition.y,
        };
        reDrawController.reDraw(offset.x, offset.y);
        return;
      }

      if (type === "mouse" && isDraggingShapeRef.current) {
        if (!selectedShape) {
          return;
        }
        selectedShape.toVirtualCoordinates(
          x - dragStartPosRef.current.x,
          y - dragStartPosRef.current.y
        );
        dragStartPosRef.current = { x, y };
        reDrawController.reDraw(0, 0);
        return;
      }

      if (type === "word" && isEditingTextRef.current) {
        updateCursorType(canvas, "text");
        return;
      }

      updateCursorType(canvas, "default");
      if (
        (!drawingRef.current && !isDraggingShapeRef.current) ||
        type === "image"
      )
        return;
      console.log("update last shape");
      reDrawController.updateLastShape(startPosition.x, startPosition.y, x, y);
      reDrawController.reDraw(0, 0);
    },
    [
      type,
      theme,
      eraserModeRef,
      shapes,
      reDrawController,
      canvas,
      handleMouseEnter,
      selectedShape,
      moveBoardRef,
      isDraggingShapeRef,
      isEditingTextRef,
    ]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isLocked) {
        return;
      }

      drawingRef.current = false;
      if (type === "hand") {
        moveBoardRef.current = false;
        const { x, y } = getCanvasCoordinates(e, canvas);
        const offset = {
          x: x - positionRef.current.x,
          y: y - positionRef.current.y,
        };
        reDrawController.updateCoordinates(offset.x, offset.y);
        updateCursorType(canvas, "default");
        reDrawController.reDraw(0, 0);
        return;
      }

      if (type === "eraser") {
        eraserModeRef.current = false;
        return;
      }

      if (type === "mouse") {
        isDraggingShapeRef.current = false;
      }
    },
    [isLocked, type, canvas, reDrawController]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      if (isLocked || !isEditingTextRef.current) return;
      const selectedTextShape = selectedShape as TextShape;
      if (e.key.length === 1) {
        selectedTextShape.append(e.key);
      }
      switch (e.key) {
        case "Backspace":
          selectedTextShape.delete({
            line: selectedTextShape.getContent().length - 1,
            col:
              selectedTextShape.getContent()[
                selectedTextShape.getContent().length - 1
              ].length - 1,
          });
          break;
        case "Enter":
          selectedTextShape.append("\n");
          break;
      }
      reDrawController.reDraw(0, 0);
    },
    [isLocked, selectedShape, isEditingTextRef, reDrawController]
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    drawingRef,
    positionRef,
    dragStartPosRef,
    moveBoardRef,
    eraserModeRef,
    eraserSizeRef,
  };
}
