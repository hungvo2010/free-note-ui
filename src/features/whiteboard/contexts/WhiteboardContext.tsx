import { useCanvas } from "@features/whiteboard/hooks/useCanvas";
import { useTheme } from "@shared/hooks/useTheme";
import { ReDrawController } from "@features/whiteboard/controllers/ReDrawController";
import React, { createContext, useEffect, useMemo, useRef, useState } from "react";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "@shared/types/shapes/Shape";

export type WhiteboardStyles = {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
};

interface WhiteboardContextType {
  shapes: React.MutableRefObject<Shape[]>;
  canvas: HTMLCanvasElement | undefined;
  roughCanvas: RoughCanvas | undefined;
  selectedShape: Shape | undefined;
  setSelectedShape: (shape: Shape | undefined) => void;
  reDrawController: ReDrawController;
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
  whiteboardStyles: WhiteboardStyles;
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

  const whiteboardStyles = useMemo(
    () => ({
      strokeColor: theme === "dark" ? "white" : "#4dabf7",
      strokeWidth: 3,
      fillColor: "none",
    }),
    [theme]
  );

  const options = useMemo(
    () => ({
      options: {
        stroke: whiteboardStyles.strokeColor,
        strokeWidth: whiteboardStyles.strokeWidth,
        fillColor: whiteboardStyles.fillColor,
      },
    }),
    [whiteboardStyles]
  );

  const { canvas, roughCanvas } = useCanvas(options);

  // Only create ReDrawController once, then update its properties
  if (!reDrawController.current) {
    reDrawController.current = new ReDrawController(
      roughCanvas,
      canvas,
      shapes.current
    );
  } else {
    // Update the canvas and roughCanvas references without recreating
    reDrawController.current.roughCanvas = roughCanvas;
    reDrawController.current.canvas = canvas;
  }
  // React handles reactivity: when theme/canvas changes, update controller
  reDrawController.current.setTheme(theme);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (reDrawController.current) {
        console.log("Cleaning up ReDrawController on unmount");
        reDrawController.current.dispose();
      }
    };
  }, []);

  const value = {
    shapes,
    canvas,
    roughCanvas,
    selectedShape,
    setSelectedShape,
    reDrawController: reDrawController.current,
    isLocked,
    setIsLocked,
    whiteboardStyles,
  };

  return (
    <WhiteboardContext.Provider value={value}>
      {children}
    </WhiteboardContext.Provider>
  );
};
