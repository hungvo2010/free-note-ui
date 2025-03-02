import { useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { Shape } from "types/shape/Shape";
import { ReDrawController } from "main/ReDrawController";
import { getCanvasCoordinates } from "utils/GeometryUtils";
import { updateCursorType } from "utils/CommonUtils";
import { ShapeFactory } from "utils/ShapeFactory";
import { Text } from "types/shape/Text";
import { ImageService } from "services/ImageService";
import { RoughCanvas } from "roughjs/bin/canvas";
import { resizeCanvasToDisplaySize } from "utils/DisplayUtils";
export function useWhiteboardEvents(
  shapes: React.MutableRefObject<Shape[]>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  roughCanvas: RoughCanvas,
  reDrawController: ReDrawController,
  reDraw: (offsetX: number, offsetY: number) => void,
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

  useLayoutEffect(() => {
    function updateSize() {
      console.log("updateSize");
      const canvas = canvasRef.current;
      if (canvas) {
        resizeCanvasToDisplaySize(canvas);
        reDraw(0, 0);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [canvasRef, reDraw]);

  // Effect to update cursor when lock state changes
  useEffect(() => {
    if (isLocked !== prevLockedRef.current) {
      prevLockedRef.current = isLocked;

      if (isLocked) {
        updateCursorType(canvasRef.current!, "not-allowed");
      } else {
        updateCursorType(canvasRef.current!, "default");
      }
    }
  }, [isLocked, canvasRef]);

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
      if (selectedShape && eventType === "mousemove") {
        setSelectedShape(selectedShape);
      }
      updateCursorType(canvas!, selectedShape ? cursorType : "default");
      if (eventType === "mousedown") {
        isDraggingShapeRef.current = true;
        updateCursorType(canvas!, "move");
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

      const { x, y } = getCanvasCoordinates(e, canvas!);
      positionRef.current = { x, y };
      dragStartPosRef.current = { x, y };

      if (isEditingTextRef.current && type !== "word") {
        isEditingTextRef.current = false;
        return;
      }

      if (type === "eraser") {
        // Just set eraser mode to true, don't erase yet
        eraserModeRef.current = true;
        updateCursorType(canvas!, "eraser");
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
        const textShape = new Text(roughCanvas, x, y, "");
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
      roughCanvas,
      reDraw,
      setSelectedShape,
      isEditingTextRef,
      reDrawController,
    ]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e, canvasRef.current);

      // Handle eraser dragging - move this to the top
      if (type === "eraser" && eraserModeRef.current) {
        // Find and remove shapes under the eraser
        const shapesToRemove = reDrawController.getShapesUnderPoint(x, y);
        if (shapesToRemove.length > 0) {
          // Remove the shapes
          reDrawController.removeShapes(shapesToRemove);
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

      // If locked, only allow cursor changes for better UX, but no edits
      if (type === "mouse") {
        // Still allow cursor to change when hovering over shapes
        // const hoverShape = checkSelectedShape(shapes.current, x, y);
        // // Only update selectedShape if it's different to avoid unnecessary rerenders
        // updateCursorType(
        //   canvasRef.current!,
        //   hoverShape ? "pointer" : "default"
        // );
        handleMouseEnter(x, y, "pointer", "mousemove");
        reDraw(0, 0);
        return;
      }

      const startPosition = positionRef.current;

      if (type === "hand" && moveBoardRef.current) {
        const offset = {
          x: x - startPosition.x,
          y: y - startPosition.y,
        };
        reDraw(offset.x, offset.y);
        return;
      }

      console.log(
        "isDraggingShapeRef.current",
        isDraggingShapeRef.current,
        selectedShape,
        type
      );
      if (selectedShape && type === "mouse") {
        selectedShape.toVirtualCoordinates(
          x - dragStartPosRef.current.x,
          y - dragStartPosRef.current.y
        );
        dragStartPosRef.current = { x, y };
        reDraw(0, 0);
        return;
      }

      if (type === "word" && isEditingTextRef.current) {
        updateCursorType(canvasRef.current!, "text");
        return;
      }

      updateCursorType(canvasRef.current!, "default");
      if (
        (!drawingRef.current && !isDraggingShapeRef.current) ||
        type === "image"
      )
        return;

      reDrawController.updateLastShape(startPosition.x, startPosition.y, x, y);
      reDraw(0, 0);
    },
    [
      type,
      eraserModeRef,
      reDrawController,
      reDraw,
      canvas,
      canvasRef,
      selectedShape,
      moveBoardRef,
      isDraggingShapeRef,
      isEditingTextRef,
      handleMouseEnter,
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
        const { x, y } = getCanvasCoordinates(e, canvasRef.current);
        const offset = {
          x: x - positionRef.current.x,
          y: y - positionRef.current.y,
        };
        reDrawController.updateCoordinates(offset.x, offset.y);
        reDraw(0, 0);
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
    [isLocked, type, reDrawController, canvasRef, reDraw]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isLocked) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedShape && !isEditingTextRef.current) {
          shapes.current = shapes.current.filter(
            (shape) => shape !== selectedShape
          );
          setSelectedShape(undefined);
          reDrawController.updateShapes(shapes.current);
          reDraw(0, 0);
        }
      }
    },
    [
      isLocked,
      selectedShape,
      isEditingTextRef,
      shapes,
      setSelectedShape,
      reDrawController,
      reDraw,
    ]
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
