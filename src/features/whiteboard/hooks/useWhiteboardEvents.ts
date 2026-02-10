import { WebSocketContext } from "@shared/contexts/WebSocketContext";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { resizeCanvasToDisplaySize } from "@shared/utils/display/DisplayUtils";
import { getCanvasCoordinates } from "@shared/utils/geometry/GeometryUtils";
import { useDraft } from "@features/draft/hooks/useDraft";
import useInteractionRefs from "@shared/hooks/useInteractionRefs";
import { useShapeDispatcher } from "./useShapeDispatcher";
import { useWhiteboard } from "./useWhiteboard";
import { createDispatcherApi } from "./machine/dispatcher";
import {
  createDrawTool,
  createEraserTool,
  createImageTool,
  createPanTool,
  createSelectTool,
  createTextTool,
} from "./machine/tools";
import { ToolDeps } from "./machine/types";

export function useWhiteboardEvents(isLocked: boolean, type: string) {
  const {
    reDrawController,
    roughCanvas,
    selectedShape,
    canvas,
    setSelectedShape,
    whiteboardStyles,
  } = useWhiteboard();
  const { webSocketConnection } = useContext(WebSocketContext);
  const refs = useInteractionRefs();
  const { draftId, draftName } = useDraft();

  const dispatcher = useShapeDispatcher({
    webSocketConnection,
    draftId,
    draftName,
    roughCanvas,
    reDrawController,
  });

  const dispatcherApi = createDispatcherApi(dispatcher);
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
        // selectedShape?.drawBoundingBox(canvas);
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

  const handleMouseDown = useCallback(
    async (e: MouseEvent) => {
      if (isLocked) {
        return;
      }

      const { x, y } = getCanvasCoordinates(e, canvas);
      refs.positionRef.current = { x, y };
      refs.dragStartPosRef.current = { x, y };

      const commonType = ["eraser", "image", "hand", "select", "text"];

      if (commonType.includes(type)) {
        toolsMap[type as keyof typeof toolsMap].onDown({ x, y });
        return;
      }

      toolsMap["draw"].onDown({ x, y });
    },
    [isLocked, canvas, type, toolsMap, refs],
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
    [canvas, toolsMap, type],
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
    [type, toolsMap, canvas],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      toolsMap["text"].onKeyDown(e);
    },
    [toolsMap],
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
  };
}
