import { TextShape } from "types/shape/Text";
import { updateCursorType } from "utils/CommonUtils";
import type { Tool, ToolDeps } from "../types";

export function createTextTool(deps: ToolDeps): Tool {
  const { canvas, roughCanvas, reDrawController, setSelectedShape, refs } = deps;

  return {
    onDown: (pos) => {
      const textShape = new TextShape(roughCanvas, pos.x, pos.y, "");
      reDrawController.addShape(textShape);
      setSelectedShape(textShape);
      refs.isEditingTextRef.current = true;
      updateCursorType(canvas, "text");
    },
    onMove: () => {
      if (refs.isEditingTextRef.current) {
        updateCursorType(canvas, "text");
      }
    },
    onUp: () => {
      // no-op for now
    },
  };
}

