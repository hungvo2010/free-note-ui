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
import { TextShape } from "types/shape/Text";
import { updateCursorType } from "utils/CommonUtils";
import { resizeCanvasToDisplaySize } from "utils/DisplayUtils";
import { getCanvasCoordinates } from "utils/GeometryUtils";
import { useTheme } from "./useTheme";
import { useWhiteboard } from "./useWhiteboard";
import { createDispatcherApi } from "./whiteboard/dispatcher";
import { createDrawTool } from "./whiteboard/tools/draw";
import { createEraserTool } from "./whiteboard/tools/eraser";
import { createImageTool } from "./whiteboard/tools/image";
import { createPanTool } from "./whiteboard/tools/pan";
import { createSelectTool } from "./whiteboard/tools/select";
import { createTextTool } from "./whiteboard/tools/text";
import { ToolDeps } from "./whiteboard/types";

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
  const dispatcherApi = createDispatcherApi(dispatcherRef);
  const refs = {
    drawingRef,
    positionRef,
    dragStartPosRef,
    moveBoardRef,
    eraserModeRef,
    eraserSizeRef,
    eraserCursorTimeoutRef,
    isDraggingShapeRef,
    isEditingTextRef,
  };
  const getSelectedShape = () => selectedShape;
  const toolDeps: ToolDeps = {
    canvas,
    roughCanvas,
    reDrawController,
    shapes,
    theme,
    setSelectedShape,
    getSelectedShape,
    dispatcher: dispatcherApi,
    refs,
  };
  const toolsMap = {
    image: createImageTool(toolDeps),
    text: createTextTool(toolDeps),
    select: createSelectTool(toolDeps),
    pan: createPanTool(toolDeps),
    eraser: createEraserTool(toolDeps),
    draw: createDrawTool(type, toolDeps),
  };

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
        toolsMap[type].onDown({ x, y });
        return;
      } else if (type === "image") {
        toolsMap[type].onDown({ x, y });
        return;
      } else if (type === "word") {
        toolsMap["text"].onDown({ x, y });
        return;
      } else if (type === "mouse") {
        toolsMap["select"].onDown({ x, y });
        return;
      } else if (type === "hand") {
        toolsMap["pan"].onDown({ x, y });
      }

      toolsMap["draw"].onDown({ x, y });
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
      if (type === "eraser") {
        toolsMap[type].onMove({ x, y });
        return;
      }

      if (type === "hand") {
        toolsMap["pan"].onMove({ x, y });
        return;
      }

      // If locked, only allow cursor changes for better UX, but no edits
      if (type === "mouse") {
        toolsMap["select"].onMove({ x, y });
        return;
      }

      if (type === "word") {
        toolsMap["text"].onMove({ x, y });
        return;
      }

      toolsMap["draw"].onMove({ x, y });
    },
    [type]
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
        toolsMap[type.toString() as keyof typeof toolsMap].onUp({ x: 0, y: 0 });
      }

      if (type === "hand") {
        const { x, y } = getCanvasCoordinates(e, canvas);
        toolsMap["pan"].onUp({ x, y });
        return;
      }

      if (type === "eraser") {
        toolsMap["eraser"].onUp({ x: 0, y: 0 });
        return;
      }

      if (type === "mouse") {
        toolsMap["select"].onUp({ x: 0, y: 0 });
        return;
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
