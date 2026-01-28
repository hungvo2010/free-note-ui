import { updateCursorType } from "@shared/utils/CommonUtils";
import { ShapeFactory } from "@shared/utils/ShapeFactory";
import type { Tool, ToolDeps } from "../types";

export function createDrawTool(type: string, deps: ToolDeps): Tool {
  const { canvas, roughCanvas, reDrawController, dispatcher, refs } = deps;

  return {
    onDown: (pos) => {
      refs.drawingRef.current = true;
      refs.positionRef.current = pos;
      const newShape = ShapeFactory.createShape(
        type,
        roughCanvas,
        pos.x,
        pos.y
      );
      if (newShape) {
        reDrawController.addShape(newShape);
        dispatcher.addShape(newShape);
      }
    },

    onMove: (pos) => {
      updateCursorType(canvas, "default");
      if (!refs.drawingRef.current) return;
      const start = refs.positionRef.current;
      reDrawController.updateLastShape(start.x, start.y, pos.x, pos.y);
      const last =
        reDrawController.getShapes()[reDrawController.getShapes().length - 1];
      if (last) dispatcher.updateShape(last.getId(), last);
      reDrawController.reDraw(0, 0);
    },

    onUp: () => {
      refs.drawingRef.current = false;
    },
  };
}
