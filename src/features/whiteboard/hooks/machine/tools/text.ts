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
      if (!refs.isEditingTextRef.current) return;
      
      // Allow browser shortcuts like Ctrl+R (reload), Cmd+R, F5, etc.
      if (e.ctrlKey || e.metaKey) {
        // Only handle specific text editing shortcuts, let others pass through
        if (!['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
          return; // Don't prevent default for non-text shortcuts
        }
      }
      
      // Allow F5 and other function keys
      if (e.key.startsWith('F')) {
        return;
      }
      
      e.preventDefault();
      
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
