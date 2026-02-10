import { updateCursorType } from "@shared/utils/CommonUtils";
import type { Tool, ToolDeps } from "../types";

export function createSelectTool(deps: ToolDeps): Tool {
  const {
    canvas,
    reDrawController,
    dispatcher,
    setSelectedShape,
    getSelectedShape,
    refs,
  } = deps;

  const isHover = !refs.isDraggingShapeRef.current;

  return {
    onDown: (pos) => {
      const clickedShape = reDrawController.checkSelectedShape(pos.x, pos.y);
      setSelectedShape(clickedShape);
      refs.isDraggingShapeRef.current = !!clickedShape;
      updateCursorType(canvas!, "move");
      refs.setDraftStartPosition(pos);
    },
    onMove: (pos) => {
      if (isHover) {
        const hoverShape = reDrawController.checkSelectedShape(pos.x, pos.y);
        updateCursorType(canvas, hoverShape ? "pointer" : "default");
        const currentSelected = getSelectedShape();
        if (currentSelected !== hoverShape) {
          // setSelectedShape(hoverShape);
          reDrawController.reDraw(0, 0);
          hoverShape?.drawBoundingBox(canvas);
        }
        return;
      }
      const selectedShape = getSelectedShape();
      if (!selectedShape) return;
      selectedShape.applyVirtualCoordinates(
        pos.x - refs.dragStartPosRef.current.x,
        pos.y - refs.dragStartPosRef.current.y,
      );
      refs.setDraftStartPosition(pos);
      dispatcher.updateShape(selectedShape.getId(), selectedShape);
      reDrawController.reDraw(0, 0);
    },
    onUp: () => {
      refs.isDraggingShapeRef.current = false;
    },
  };
}
