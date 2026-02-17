import { BoundingBox } from "@shared/types/BoundingBox";
import { Rectangle } from "@shared/types/shapes/Rectangle";
import { Shape } from "@shared/types/shapes/Shape";
import { clearRect, updateCursorType } from "@shared/utils/CommonUtils";
import { PADDING } from "@shared/utils/Constant";
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
      clearBoundingBox(boundingBox);
      reDrawChangeShapes(boundingBox);
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

    const newBoundingBox = selectedShape.getBoundingBox();

    // Helper to get normalized bounds regardless of drawing direction
    const getEnds = (box: BoundingBox) => ({
      minX: Math.min(box.startPoint.x, box.startPoint.x + box.width),
      maxX: Math.max(box.startPoint.x, box.startPoint.x + box.width),
      minY: Math.min(box.startPoint.y, box.startPoint.y + box.height),
      maxY: Math.max(box.startPoint.y, box.startPoint.y + box.height),
    });

    const oldEnds = getEnds(oldBoundingBox);
    const newEnds = getEnds(newBoundingBox);

    const combinedBox: BoundingBox = {
      startPoint: {
        x: Math.min(oldEnds.minX, newEnds.minX),
        y: Math.min(oldEnds.minY, newEnds.minY),
      },
      width:
        Math.max(oldEnds.maxX, newEnds.maxX) -
        Math.min(oldEnds.minX, newEnds.minX),
      height:
        Math.max(oldEnds.maxY, newEnds.maxY) -
        Math.min(oldEnds.minY, newEnds.minY),
      lineWidth: 2,
    };

    reDrawDirtyRectangles(combinedBox);
    selectedShape.drawBoundingBox(canvas);

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

  function reDrawDirtyRectangles(boundingBox: BoundingBox) {
    clearBoundingBox(boundingBox);
    reDrawChangeShapes(boundingBox);
  }

  function reDrawChangeShapes(
    boundingBox: BoundingBox,
    excludedShapes: Shape[] = [],
  ) {
    const shapesNeedReDraw = reDrawController.findShapesNeedReDraw(
      boundingBox,
      excludedShapes,
    );
    shapesNeedReDraw.forEach((shape) => {
      shape.draw(0, 0);
    });
  }

  function clearBoundingBox(boundingBox: BoundingBox) {
    const margin = 2; // Extra margin to ensure selection box and rough edges are cleared
    const x1 = Math.min(
      boundingBox.startPoint.x,
      boundingBox.startPoint.x + boundingBox.width,
    );
    const y1 = Math.min(
      boundingBox.startPoint.y,
      boundingBox.startPoint.y + boundingBox.height,
    );
    const w = Math.abs(boundingBox.width);
    const h = Math.abs(boundingBox.height);

    clearRect(
      canvas,
      new Rectangle(
        undefined,
        x1 - margin,
        y1 - margin,
        w + margin * 2,
        h + margin * 2,
      ),
    );
  }
}
