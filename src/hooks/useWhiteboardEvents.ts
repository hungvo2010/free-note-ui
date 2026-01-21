import EventBus from "apis/resources/event/EventBus";
import { ShapeEventDispatcher } from "apis/resources/ShapeEventDispatcher";
import { WebSocketContext } from "contexts/WebSocketContext";
import { getShapesToUpdate, parseDraftResponse } from "core/shapeLogic";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router";
import { resizeCanvasToDisplaySize } from "utils/DisplayUtils";
import { getCanvasCoordinates } from "utils/GeometryUtils";
import { useDraft } from "./useDraft";
import useInteractionRefs from "./useInteractionRefs";
import { useWhiteboard } from "./useWhiteboard";
import { createDispatcherApi } from "./whiteboard/dispatcher";
import {
  createDrawTool,
  createEraserTool,
  createImageTool,
  createPanTool,
  createSelectTool,
  createTextTool,
} from "./whiteboard/tools";
import { ToolDeps } from "./whiteboard/types";

export function useWhiteboardEvents(isLocked: boolean, type: string) {
  const dispatcherRef = useRef<ShapeEventDispatcher | null>(null);
  const {
    reDrawController,
    roughCanvas,
    selectedShape,
    canvas,
    setSelectedShape,
    whiteboardStyles,
  } = useWhiteboard();
  const { webSocketConnection } = useContext(WebSocketContext);
  const navigate = useNavigate();
  const dispatcherApi = createDispatcherApi(dispatcherRef);
  const refs = useInteractionRefs();
  const { draftId, draftName } = useDraft();
  const getSelectedShape = () => selectedShape;
  const toolDeps: ToolDeps = {
    canvas,
    roughCanvas,
    reDrawController,
    setSelectedShape,
    getSelectedShape,
    dispatcher: dispatcherApi,
    refs,
  };

  const toolsMap = useMemo(() => {
    return {
      image: createImageTool(toolDeps),
      text: createTextTool(toolDeps),
      select: createSelectTool(toolDeps),
      hand: createPanTool(toolDeps),
      eraser: createEraserTool(toolDeps, whiteboardStyles),
      draw: createDrawTool(type, toolDeps),
    };
  }, [type, toolDeps, whiteboardStyles]);

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

  useEffect(() => {
    return () => {
      if (refs.eraserCursorTimeoutRef.current !== null) {
        window.clearTimeout(refs.eraserCursorTimeoutRef.current);
      }
    };
  }, []);

  const setupDispatcherAndEventBus = useCallback(() => {
    // TODO: temporarily only
    if (webSocketConnection && !dispatcherRef.current) {
      console.log("Creating dispatcher");
      dispatcherRef.current = new ShapeEventDispatcher(webSocketConnection, {
        draftId,
        draftName,
      });
      EventBus.setHandler(async (message) => {
        let jsonData: Record<string, any> = {};
        console.log("type of message: ", message);
        if (message instanceof Blob) {
          const text = await message.text();
          jsonData = JSON.parse(text);
        } else {
          jsonData = JSON.parse(message);
        }
        if (jsonData?.draftId && jsonData?.draftId !== draftId) {
          navigate(`/draft/${jsonData?.draftId}`); // creating new draft
        }

        const draftResponse = parseDraftResponse(jsonData);
        const shapesToUpdate = getShapesToUpdate(draftResponse);
        for (const shape of shapesToUpdate) {
          // attach current roughCanvas so it can draw
          shape.setRoughCanvas(roughCanvas);
          reDrawController.mergeShape(shape);
        }
        // trigger redraw after applying updates
        reDrawController.reDraw(0, 0);
      });
    } else {
      dispatcherApi.ensureDraft({
        draftId,
        draftName,
      });
    }
  }, [webSocketConnection, draftId, draftName, navigate, dispatcherApi]);

  const handleMouseDown = useCallback(
    async (e: MouseEvent) => {
      if (isLocked) {
        return;
      }

      const { x, y } = getCanvasCoordinates(e, canvas);
      refs.positionRef.current = { x, y };
      refs.dragStartPosRef.current = { x, y };
      setupDispatcherAndEventBus();

      const commonType = ["eraser", "image", "hand", "select", "text"];

      if (commonType.includes(type)) {
        toolsMap[type as keyof typeof toolsMap].onDown({ x, y });
        return;
      }

      toolsMap["draw"].onDown({ x, y });
    },
    [isLocked, canvas, type, setupDispatcherAndEventBus, toolsMap]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e, canvas);
      const commonType = ["eraser", "hand", "select", "text"];

      // Handle eraser dragging - move this to the top
      if (commonType.includes(type)) {
        toolsMap[type as keyof typeof toolsMap].onMove({ x, y });
        return;
      }

      toolsMap["draw"].onMove({ x, y });
    },
    [canvas, toolsMap, type]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const specialTypes = ["hand", "eraser", "select", "text"];
      if (!specialTypes.includes(type)) {
        toolsMap["draw"].onUp({ x: 0, y: 0 });
      }
      const { x, y } = getCanvasCoordinates(e, canvas);

      if (type === "hand" || type === "eraser" || type === "select") {
        toolsMap[type].onUp({ x, y });
        return;
      }
    },
    [type, toolsMap, canvas]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      toolsMap["text"].onKeyDown(e);
    },
    [toolsMap]
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
  };
}
