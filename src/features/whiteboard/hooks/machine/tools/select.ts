import { updateCursorType } from "@shared/utils/CommonUtils";
import type { Tool, ToolDeps } from "../types";

export function createSelectTool(deps: ToolDeps): Tool {
  const { canvas, reDrawController, dispatcher, setSelectedShape, getSelectedShape, refs } = deps;

  return {
    onDown: (pos) => {
      const clickedShape = reDrawController.checkSelectedShape(pos.x, pos.y);
      setSelectedShape(clickedShape);
      refs.isDraggingShapeRef.current = !!clickedShape;
      updateCursorType(canvas!, "move");
      refs.dragStartPosRef.current = pos;
    },
    onMove: (pos) => {
      if (!refs.isDraggingShapeRef.current) {
        const hoverShape = reDrawController.checkSelectedShape(pos.x, pos.y);
        updateCursorType(canvas, hoverShape ? "pointer" : "default");
        setSelectedShape(hoverShape);
        return;
      }
      const selectedShape = getSelectedShape();
      if (!selectedShape) return;
      selectedShape.drawInVirtualCoordinates(
        pos.x - refs.dragStartPosRef.current.x,
        pos.y - refs.dragStartPosRef.current.y,
      );
      refs.dragStartPosRef.current = pos;
      dispatcher.updateShape(selectedShape.getId(), selectedShape);
      reDrawController.reDraw(0, 0);
    },
    onUp: () => {
      refs.isDraggingShapeRef.current = false;
    },
  };
}
