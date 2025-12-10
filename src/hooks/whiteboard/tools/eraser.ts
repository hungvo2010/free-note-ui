import { WhiteboardStyles } from "contexts/WhiteboardContext";
import { Shape } from "types/shape/Shape";
import type { Tool, ToolDeps } from "../types";

export function createEraserTool(
  deps: ToolDeps,
  whiteboardStyles: WhiteboardStyles
): Tool {
  const { canvas, reDrawController, dispatcher, refs } = deps;

  const drawCursor = (x: number, y: number) => {
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(x, y, refs.eraserSizeRef.current, 0, Math.PI * 2);
    ctx.strokeStyle = whiteboardStyles.strokeColor;
    ctx.stroke();
    if (refs.eraserCursorTimeoutRef.current !== null) {
      window.clearTimeout(refs.eraserCursorTimeoutRef.current);
    }
    refs.eraserCursorTimeoutRef.current = window.setTimeout(() => {
      reDrawController.reDraw(0, 0);
      refs.eraserCursorTimeoutRef.current = null;
    }, 150);
  };

  return {
    onDown: () => {
      refs.eraserModeRef.current = true;
    },
    onMove: (pos) => {
      if (!refs.eraserModeRef.current) return;
      const shapesToRemove = reDrawController.getShapesUnderPoint(pos.x, pos.y);
      if (shapesToRemove.length) {
        console.log("Eraser found shapes to remove:", shapesToRemove);
        const ids = reDrawController
          .getShapes()
          .filter((s: Shape) => shapesToRemove.includes(s))
          .map((s: Shape) => s.getId());
        reDrawController.removeShapes(shapesToRemove);
        dispatcher.deleteShapes(ids);
        reDrawController.reDraw(0, 0);
      }
      drawCursor(pos.x, pos.y);
    },
    onUp: () => {
      refs.eraserModeRef.current = false;
    },
  };
}
