import { useCanvas } from "hooks/useCanvas";
import { useTheme } from "hooks/useTheme";
import { ReDrawController } from "main/ReDrawController";
import React, { createContext, useRef, useState } from "react";
import { Shape } from "types/shape/Shape";
import { drawBoundingBox } from "utils/GeometryUtils";

interface WhiteboardContextType {
  shapes: React.MutableRefObject<Shape[]>;
  canvas: HTMLCanvasElement | undefined;
  roughCanvas: any;
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

  const { canvas, roughCanvas, canvasRef } = useCanvas({
    options: {
      stroke: theme === "dark" ? "white" : "#000000",
    },
  });

  const reDrawController = React.useMemo(
    () => new ReDrawController(roughCanvas, canvas, shapes.current),
    [roughCanvas, canvas]
  );

  const reDraw = React.useCallback(
    (offsetX: number, offsetY: number) => {
      reDrawController.reDraw(offsetX, offsetY);
      selectedShape?.drawBoundingBox(canvas, selectedShape);
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
