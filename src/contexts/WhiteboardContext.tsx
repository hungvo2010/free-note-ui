import React, { createContext, useState, useRef, useEffect } from "react";
import { Shape } from "types/shape/Shape";
import { ReDrawController } from "main/ReDrawController";
import { useCanvas } from "hooks/useCanvas";
import { drawBoundingBox } from "utils/GeometryUtils";
import { useTheme } from "hooks/useTheme";
import { RoughCanvas } from "roughjs/bin/canvas";

interface WhiteboardContextType {
  shapes: React.MutableRefObject<Shape[]>;
  canvas: HTMLCanvasElement | undefined;
  roughCanvas: RoughCanvas | undefined;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectedShape: Shape | undefined;
  setSelectedShape: (shape: Shape | undefined) => void;
  reDrawController: ReDrawController;
  reDraw: (offsetX: number, offsetY: number) => void;
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
}

export const WhiteboardContext = createContext<
  WhiteboardContextType | undefined
>(undefined);

export const WhiteboardProvider: React.FC<{
  children: React.ReactNode;
  isLocked?: boolean;
}> = ({ children, isLocked: initialLocked = false }) => {
  const shapes = useRef<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<Shape | undefined>(
    undefined
  );
  const [isLocked, setIsLocked] = useState(initialLocked);
  const { theme } = useTheme();
  console.log("theme: " + theme);

  const { canvas, roughCanvas, canvasRef } = useCanvas({
    options: {
      stroke: theme === "dark" ? "white" : "#000000",
    },
  });
  console.log(roughCanvas);

  const reDrawController = React.useMemo(
    () => new ReDrawController(roughCanvas, shapes.current),
    [roughCanvas]
  );

  // Update theme in ReDrawController when it changes
  useEffect(() => {
    reDrawController.setTheme(theme);
  }, [theme, reDrawController]);

  const reDraw = React.useCallback(
    (offsetX: number, offsetY: number) => {
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      }
      reDrawController.reDraw(offsetX, offsetY);
      if (selectedShape) {
        drawBoundingBox(canvas, selectedShape);
      }
    },
    [canvas, reDrawController, selectedShape]
  );

  const value = {
    shapes,
    canvas,
    roughCanvas,
    canvasRef,
    selectedShape,
    setSelectedShape,
    reDrawController,
    reDraw,
    isLocked,
    setIsLocked,
  };

  return (
    <WhiteboardContext.Provider value={value}>
      {children}
    </WhiteboardContext.Provider>
  );
};
