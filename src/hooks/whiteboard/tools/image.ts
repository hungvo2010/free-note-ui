import { ImageService } from "services/ImageService";
import type { Tool, ToolDeps } from "../types";

export function createImageTool(deps: ToolDeps): Tool {
  const { roughCanvas, reDrawController, setSelectedShape, getSelectedShape, dispatcher, canvas } = deps;

  return {
    onDown: (pos) => {
      ImageService.openImageDialog(
        (imageShape) => {
          reDrawController.addShape(imageShape);
          setSelectedShape(imageShape);
          dispatcher.addShape(imageShape);
        },
        roughCanvas,
        pos.x,
        pos.y,
        () => {
          reDrawController.reDraw(0, 0);
          getSelectedShape()?.drawBoundingBox(canvas);
        }
      );
    },
    onMove: () => {},
    onUp: () => {},
  };
}
