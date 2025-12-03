import { updateCursorType } from "utils/CommonUtils";
import type { Tool, ToolDeps } from "../types";

export function createPanTool(deps: ToolDeps): Tool {
  const { canvas, reDrawController, dispatcher, refs } = deps;

  return {
    onDown: (pos) => {
      refs.moveBoardRef.current = true;
      refs.positionRef.current = pos;
      updateCursorType(canvas!, "pointer");
    },
    onMove: (pos) => {
      if (!refs.moveBoardRef.current) return;
      const start = refs.positionRef.current;
      const offset = { x: pos.x - start.x, y: pos.y - start.y };
      reDrawController.reDraw(offset.x, offset.y);
      dispatcher.pan(offset);
    },
    onUp: (pos) => {
      if (!refs.moveBoardRef.current) return;
      refs.moveBoardRef.current = false;
      const start = refs.positionRef.current;
      const offset = { x: pos.x - start.x, y: pos.y - start.y };
      reDrawController.updateCoordinates(offset.x, offset.y);
      updateCursorType(canvas, "default");
      reDrawController.reDraw(0, 0);
    },
  };
}

