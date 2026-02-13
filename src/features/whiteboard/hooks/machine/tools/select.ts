import { BoundingBox } from "@shared/types/BoundingBox";
import { clearRect, updateCursorType } from "@shared/utils/CommonUtils";
import { calculatePadding } from "@shared/utils/geometry/GeometryUtils";
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

  let boundingBox: BoundingBox | null = null;
  let lastHoveredShapeId: string | null = null;

  const clearHoverHighlight = () => {
    if (boundingBox) {
      const padding = calculatePadding(
        boundingBox.width,
        boundingBox.height,
        2,
      );
      clearRect(
        canvas,
        boundingBox.startPoint.x - padding[0],
        boundingBox.startPoint.y - padding[1],
        boundingBox.width + padding[0] * 2,
        boundingBox.height + padding[1] * 2,
      );
      const shapesNeedReDraw =
        reDrawController.findShapesNeedReDraw(boundingBox);
      console.log(
        "shapes need to be re-draw:onHover: ",
        shapesNeedReDraw.length,
      );
      shapesNeedReDraw.forEach((shape) => {
        shape.draw(0, 0);
      });
      boundingBox = null;
    }
  };

  const handleHover = (pos: { x: number; y: number }) => {
    const hoverShape = reDrawController.checkSelectedShape(pos.x, pos.y);
    const hoverShapeId = hoverShape?.getId() || null;

    if (hoverShapeId !== lastHoveredShapeId) {
      clearHoverHighlight();
      lastHoveredShapeId = hoverShapeId;
      if (hoverShape) {
        boundingBox = hoverShape.drawBoundingBox(canvas);
      }
    }
    updateCursorType(canvas, hoverShape ? "pointer" : "default");
  };

  const handleDrag = (pos: { x: number; y: number }) => {
    const selectedShape = getSelectedShape();
    if (!selectedShape) return;

    const oldBoundingBox = selectedShape.getBoundingBox();

    selectedShape.applyVirtualCoordinates(
      pos.x - refs.dragStartPosRef.current.x,
      pos.y - refs.dragStartPosRef.current.y,
    );
    refs.setDraftStartPosition(pos);

    const oldPadding = calculatePadding(
      oldBoundingBox.width,
      oldBoundingBox.height,
      2,
    );

    const newBoundingBox = selectedShape.getBoundingBox();
    const newPadding = calculatePadding(
      newBoundingBox.width,
      newBoundingBox.height,
      2,
    );

    const combinedBox: BoundingBox = {
      startPoint: {
        x: Math.min(
          oldBoundingBox.startPoint.x - oldPadding[0],
          newBoundingBox.startPoint.x - newPadding[0],
        ),
        y: Math.min(
          oldBoundingBox.startPoint.y - oldPadding[1],
          newBoundingBox.startPoint.y - newPadding[1],
        ),
      },
      width:
        Math.max(
          oldBoundingBox.startPoint.x + oldBoundingBox.width + oldPadding[0],
          newBoundingBox.startPoint.x + newBoundingBox.width + newPadding[0],
        ) -
        Math.min(
          oldBoundingBox.startPoint.x - oldPadding[0],
          newBoundingBox.startPoint.x - newPadding[0],
        ),
      height:
        Math.max(
          oldBoundingBox.startPoint.y + oldBoundingBox.height + oldPadding[1],
          newBoundingBox.startPoint.y + newBoundingBox.height + newPadding[1],
        ) -
        Math.min(
          oldBoundingBox.startPoint.y - oldPadding[1],
          newBoundingBox.startPoint.y - newPadding[1],
        ),
      lineWidth: 2,
    };

    clearRect(
      canvas,
      combinedBox.startPoint.x,
      combinedBox.startPoint.y,
      combinedBox.width,
      combinedBox.height,
    );

    const shapesNeedReDraw = reDrawController.findShapesNeedReDraw(combinedBox);
    shapesNeedReDraw.forEach((shape) => {
      shape.draw(0, 0);
    });

    dispatcher.updateShape(selectedShape.getId(), selectedShape);
  };

  const onMove = (pos: { x: number; y: number }) => {
    const isHover = !refs.isDraggingShapeRef.current;

    if (isHover) {
      handleHover(pos);
    } else {
      handleDrag(pos);
    }
  };

  return {
    onDown: (pos) => {
      clearHoverHighlight();
      lastHoveredShapeId = null;

      const clickedShape = reDrawController.checkSelectedShape(pos.x, pos.y);
      setSelectedShape(clickedShape);

      if (clickedShape) {
        refs.isDraggingShapeRef.current = true;
        updateCursorType(canvas!, "move");
      } else {
        refs.isDraggingShapeRef.current = false;
        updateCursorType(canvas!, "default");
      }
      refs.setDraftStartPosition(pos);
    },

    onMove: onMove,

    onUp: (pos) => {
      refs.isDraggingShapeRef.current = false;

      const selectedShape = getSelectedShape();
      if (selectedShape) {
        dispatcher.updateShape(selectedShape.getId(), selectedShape);
      }

      handleHover(pos);
    },
  };
}
