import EventBus from "apis/resources/event/EventBus";
import { ShapeEventDispatcher } from "apis/resources/ShapeEventDispatcher";
import { WebSocketContext } from "contexts/WebSocketContext";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router";
import { ImageService } from "services/ImageService";
import { TextShape } from "types/shape/Text";
import { updateCursorType } from "utils/CommonUtils";
import { resizeCanvasToDisplaySize } from "utils/DisplayUtils";
import { getCanvasCoordinates } from "utils/GeometryUtils";
import { ShapeFactory } from "utils/ShapeFactory";
import { useTheme } from "./useTheme";
import { useWhiteboard } from "./useWhiteboard";

export function useWhiteboardEvents(isLocked: boolean, type: string) {
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
  const dispatcherRef = useRef<ShapeEventDispatcher | null>(null);
  const { theme } = useTheme();
  const {
    reDrawController,
    roughCanvas,
    selectedShape,
    shapes,
    canvas,
    setSelectedShape,
  } = useWhiteboard();
  const context = useContext(WebSocketContext);
  const navigate = useNavigate();
  if (!context) {
    throw new Error("useWebSocket must be used within a WhiteboardProvider");
  }
  const webSocketConnection = context.webSocketConnection;
  const params = useParams();

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

  const getDraftId = useCallback(() => {
    const value = params.draftId;
    console.log("get draft id: ", value);
    return typeof value === "string" && value !== "" ? value : undefined;
  }, [params]);

  const getDraftName = useCallback(() => {
    const value = params.draftName;
    console.log("get draft name: ", value);
    return typeof value === "string" && value !== "" ? value : undefined;
  }, [params]);

  const handleMouseDown = useCallback(
    async (e: MouseEvent) => {
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
      // await webSocketConnection?.connect();
      if (!dispatcherRef.current && webSocketConnection) {
        console.log("Creating dispatcher");
        dispatcherRef.current = new ShapeEventDispatcher(webSocketConnection, {
          draftId: getDraftId(),
          draftName: getDraftName(),
        });
        EventBus.setHandler(async (message) => {
          if (message instanceof Blob) {
            const text = await message.text();
            try {
              const json = JSON.parse(text);
              console.log("Parsed JSON: ", json);
              if (json.payload.draftId) {
                navigate(`/draft/${json.payload.draftId}`);
              }
            } catch (e) {
              console.log("Not JSON:", text);
            }
          } else {
            console.log("Message:", message);
          }
        });
      } else {
        dispatcherRef.current?.setDraft({
          draftId: getDraftId(),
          draftName: getDraftName(),
        });
      }

      if (type === "eraser") {
        // dont need to send action for eraser
        // Just set eraser mode to true, don't erase yet
        eraserModeRef.current = true;
        updateCursorType(canvas, "eraser");
        return;
      } else if (type === "image") {
        ImageService.openImageDialog(
          (imageShape) => {
            reDrawController.addShape(imageShape);
            console.log(imageShape);
            setSelectedShape(imageShape);
          },
          roughCanvas,
          x,
          y,
          () => {
            reDrawController.reDraw(0, 0);
            console.log("redraw image shape if any: ", selectedShape);
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
        dispatcherRef.current?.addShape(newShape);
      }
    },
    [
      isLocked,
      canvas,
      type,
      selectedShape,
      roughCanvas,
      reDrawController,
      isEditingTextRef,
      webSocketConnection,
      getDraftId,
      getDraftName,
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
          // Compute indices being removed for dispatching
          const ids = reDrawController
            .getShapes()
            .filter((s) => shapesToRemove.includes(s))
            .map((s) => s.getId());
          // Remove locally
          reDrawController.removeShapes(shapesToRemove);
          shapes.current = shapes.current.filter(
            (shape) => !shapesToRemove.includes(shape)
          );
          // Dispatch deletion
          dispatcherRef.current?.deleteShapes(ids);
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
        // Dispatch pan (board move) as an event
        dispatcherRef.current?.pan(offset);
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
        // Dispatch move of existing shape
        dispatcherRef.current?.updateShape(
          selectedShape.getId(),
          selectedShape
        );
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
      // console.log("update last shape");
      reDrawController.updateLastShape(startPosition.x, startPosition.y, x, y);
      const last =
        reDrawController.getShapes()[reDrawController.getShapes().length - 1];
      if (last) dispatcherRef.current?.updateShape(last.getId(), last);
      reDrawController.reDraw(0, 0);
    },
    [
      type,
      theme,
      eraserModeRef,
      reDrawController,
      canvas,
      handleMouseEnter,
      selectedShape,
      moveBoardRef,
      isDraggingShapeRef,
      isEditingTextRef,
      shapes,
    ]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isLocked) {
        return;
      }

      drawingRef.current = false;
      // finalize shape if we were drawing a new one (not moving/panning/eraser)
      if (
        type !== "hand" &&
        type !== "eraser" &&
        type !== "mouse" &&
        type !== "word"
      ) {
        const last =
          reDrawController.getShapes()[reDrawController.getShapes().length - 1];
        if (last) dispatcherRef.current?.finalizeShape(last.getId());
      }
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
