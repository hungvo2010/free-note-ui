import { BoundingBox } from "@shared/types/BoundingBox";
import { clearRect, updateCursorType } from "@shared/utils/CommonUtils";
import { throttle } from "@shared/utils/performance/Throttle";
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
      clearRect(
        canvas,
        boundingBox.topLeft.x - 2,
        boundingBox.topLeft.y - 2,
        boundingBox.width + 4,
        boundingBox.height + 4,
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

    const newBoundingBox = selectedShape.getBoundingBox();

    const combinedBox: BoundingBox = {
      topLeft: {
        x: Math.min(oldBoundingBox.topLeft.x, newBoundingBox.topLeft.x),
        y: Math.min(oldBoundingBox.topLeft.y, newBoundingBox.topLeft.y),
      },
      width:
        Math.max(
          oldBoundingBox.topLeft.x + oldBoundingBox.width,
          newBoundingBox.topLeft.x + newBoundingBox.width,
        ) - Math.min(oldBoundingBox.topLeft.x, newBoundingBox.topLeft.x),
      height:
        Math.max(
          oldBoundingBox.topLeft.y + oldBoundingBox.height,
          newBoundingBox.topLeft.y + newBoundingBox.height,
        ) - Math.min(oldBoundingBox.topLeft.y, newBoundingBox.topLeft.y),
      lineWidth: 2,
    };

    clearRect(
      canvas,
      combinedBox.topLeft.x - 2,
      combinedBox.topLeft.y - 2,
      combinedBox.width + 4,
      combinedBox.height + 4,
    );

    const shapesNeedReDraw = reDrawController.findShapesNeedReDraw(combinedBox);
    console.log("onMOve: Shapes to re-draw: ", shapesNeedReDraw.length);
    shapesNeedReDraw.forEach((shape) => {
      shape.draw(0, 0);
    });

    dispatcher.updateShape(selectedShape.getId(), selectedShape);
  };

  const throttledOnMove = throttle((pos: { x: number; y: number }) => {
    const isHover = !refs.isDraggingShapeRef.current;

    if (isHover) {
      handleHover(pos);
    } else {
      handleDrag(pos);
    }
  }, 16);

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

    onMove: throttledOnMove,

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
