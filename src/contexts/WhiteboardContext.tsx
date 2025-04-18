import { useCanvas } from "hooks/useCanvas";
import { useTheme } from "hooks/useTheme";
import { ReDrawController } from "main/ReDrawController";
import React, { createContext, useMemo, useRef, useState } from "react";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "types/shape/Shape";

interface WhiteboardContextType {
  shapes: React.MutableRefObject<Shape[]>;
  canvas: HTMLCanvasElement | undefined;
  roughCanvas: RoughCanvas | undefined;
  selectedShape: Shape | undefined;
  setSelectedShape: (shape: Shape | undefined) => void;
  reDrawController: ReDrawController;
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
  const reDrawController = useRef<ReDrawController>();
  const [selectedShape, setSelectedShape] = useState<Shape | undefined>(
    undefined
  );
  const [isLocked, setIsLocked] = useState(initialLocked);
  const { theme } = useTheme();

  const options = useMemo(
    () => ({
      options: {
        stroke: theme === "dark" ? "white" : "#000000",
      },
    }),
    [theme]
  );

  const { canvas, roughCanvas } = useCanvas(options);

  reDrawController.current = new ReDrawController(
    roughCanvas,
    canvas,
    shapes.current
  );
  reDrawController.current.notifyObservers();

  const value = {
    shapes,
    canvas,
    roughCanvas,
    selectedShape,
    setSelectedShape,
    reDrawController: reDrawController.current,
    isLocked,
    setIsLocked,
  };

  return (
    <WhiteboardContext.Provider value={value}>
      {children}
    </WhiteboardContext.Provider>
  );
};
