import { TextShape } from "types/shape/Text";
import { updateCursorType } from "utils/CommonUtils";
import type { Tool, ToolDeps } from "../types";

export type TextTool = Tool & {
  onKeyDown: (e: React.KeyboardEvent) => void;
};

export function createTextTool(deps: ToolDeps): TextTool {
  const {
    canvas,
    roughCanvas,
    reDrawController,
    setSelectedShape,
    refs,
    getSelectedShape,
  } = deps;

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
    onKeyDown: (e) => {
      e.preventDefault();
      if (!refs.isEditingTextRef.current) return;
      const selectedShape = getSelectedShape();
      if (!selectedShape || !(selectedShape instanceof TextShape)) return;
      const selectedTextShape = selectedShape as TextShape;
      if (e.key.length === 1) {
        selectedTextShape.append(e.key);
      }
      switch (e.key) {
        case "Backspace":
          selectedTextShape.delete({
            line: selectedTextShape.getContent().length - 1,
            col:
              selectedTextShape.getContent()[
                selectedTextShape.getContent().length - 1
              ].length - 1,
          });
          break;
        case "Enter":
          selectedTextShape.append("\n");
          break;
      }
      reDrawController.reDraw(0, 0);
    },
  };
}
