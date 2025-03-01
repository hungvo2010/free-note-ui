import { useCallback, useRef, useEffect } from 'react';
import { Shape } from 'types/shape/Shape';
import { ReDrawController } from 'main/ReDrawController';
import { getCanvasCoordinates, getShapesUnderPoint, checkSelectedShape } from 'utils/GeometryUtils';
import { updateCursorType } from 'utils/CommonUtils';
import { ShapeFactory } from 'utils/ShapeFactory';
import { Text } from 'types/shape/Text';
import { ImageService } from 'services/ImageService';
import { RoughCanvas } from 'roughjs/bin/canvas';
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
  isDraggingShape: boolean,
  setIsDraggingShape: (isDragging: boolean) => void,
  isEditingText: boolean,
  setIsEditingText: (isEditing: boolean) => void,
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

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (isLocked) {
      return;
    }
    
    const { x, y } = getCanvasCoordinates(e, canvasRef.current);
    positionRef.current = { x, y };
    dragStartPosRef.current = { x, y };

    if (isEditingText && type !== "word") {
      setIsEditingText(false);
      return;
    }

    if (type === "eraser") {
      // Just set eraser mode to true, don't erase yet
      eraserModeRef.current = true;
      updateCursorType(canvasRef.current!, "eraser");
      return;
    } else if (type === "image") {
      ImageService.openImageDialog(
        (imageShape) => {
          shapes.current.push(imageShape);
          reDraw(0, 0);
        },
        roughCanvas,
        x,
        y
      );
      return;
    } else if (type === "word") {
      const textShape = new Text(roughCanvas, x, y, "");
      shapes.current.push(textShape);
      setSelectedShape(textShape);
      setIsEditingText(true);
      return;
    } else if (type === "mouse") {
      const clickedShape = checkSelectedShape(shapes.current, x, y);
      if (clickedShape) {
        setSelectedShape(clickedShape);
        setIsDraggingShape(true);
        return;
      }
    } else if (type === "hand") {
      moveBoardRef.current = true;
      return;
    }

    drawingRef.current = true;
    const newShape = ShapeFactory.createShape(type, roughCanvas, x, y);
    if (newShape) {
      shapes.current.push(newShape);
      reDrawController.addShape(newShape);
    }
  }, [
    isLocked,
    canvasRef,
    isEditingText,
    type,
    roughCanvas,
    shapes,
    reDraw,
    setSelectedShape,
    setIsEditingText,
    setIsDraggingShape,
    reDrawController
  ]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
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

    // If locked, only allow cursor changes for better UX, but no edits
    if (isLocked) {
      if (type === "mouse") {
        // Still allow cursor to change when hovering over shapes
        const hoverShape = checkSelectedShape(shapes.current, x, y);
        updateCursorType(
          canvasRef.current!,
          hoverShape ? "pointer" : "not-allowed"
        );
      } else {
        // Show not-allowed cursor for all other tools when locked
        updateCursorType(canvasRef.current!, "not-allowed");
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
      reDraw(0, 0);
      return;
    }
    
    if (type === "word" && isEditingText) {
      updateCursorType(canvasRef.current!, "text");
      return;
    }

    updateCursorType(canvasRef.current!, "default");
    if ((!drawingRef.current && !isDraggingShape) || type === "image") return;

    reDrawController.updateLastShape(startPosition.x, startPosition.y, x, y);
    reDraw(0, 0);
  }, [
    type,
    eraserModeRef,
    shapes,
    reDrawController,
    reDraw,
    canvas,
    isLocked,
    canvasRef,
    moveBoardRef,
    isDraggingShape,
    selectedShape,
    isEditingText
  ]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
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
      positionRef.current = { x: 0, y: 0 };
    }

    if (type === "eraser") {
      eraserModeRef.current = false;
      return;
    }

    if (type === "mouse") {
      setIsDraggingShape(false);
    }
  }, [
    isLocked,
    type,
    reDrawController,
    canvasRef,
    setIsDraggingShape
  ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isLocked) return;
    
    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedShape && !isEditingText) {
        shapes.current = shapes.current.filter(
          (shape) => shape !== selectedShape
        );
        setSelectedShape(undefined);
        reDrawController.updateShapes(shapes.current);
        reDraw(0, 0);
      }
    }
  }, [
    isLocked,
    selectedShape,
    isEditingText,
    shapes,
    setSelectedShape,
    reDrawController,
    reDraw
  ]);

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
    eraserSizeRef
  };
} 