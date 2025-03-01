import React, { createContext, useContext, useState, useRef } from 'react';
import { Shape } from 'types/shape/Shape';
import { ReDrawController } from 'main/ReDrawController';
import { useCanvas } from 'hooks/useCanvas';
import { drawBoundingBox } from 'utils/GeometryUtils';

interface WhiteboardContextType {
  shapes: React.MutableRefObject<Shape[]>;
  canvas: HTMLCanvasElement | undefined;
  roughCanvas: any;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectedShape: Shape | undefined;
  setSelectedShape: (shape: Shape | undefined) => void;
  isDraggingShape: boolean;
  setIsDraggingShape: (isDragging: boolean) => void;
  isEditingText: boolean;
  setIsEditingText: (isEditing: boolean) => void;
  reDrawController: ReDrawController;
  reDraw: (offsetX: number, offsetY: number) => void;
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
}

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

export const WhiteboardProvider: React.FC<{children: React.ReactNode, isLocked?: boolean}> = ({ 
  children, 
  isLocked: initialLocked = false 
}) => {
  const shapes = useRef<Shape[]>([]);
  const { canvas, roughCanvas, canvasRef } = useCanvas();
  const [selectedShape, setSelectedShape] = useState<Shape | undefined>(undefined);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isLocked, setIsLocked] = useState(initialLocked);
  
  const reDrawController = React.useMemo(
    () => new ReDrawController(roughCanvas, shapes.current),
    [roughCanvas]
  );
  
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
    isDraggingShape,
    setIsDraggingShape,
    isEditingText,
    setIsEditingText,
    reDrawController,
    reDraw,
    isLocked,
    setIsLocked
  };
  
  return (
    <WhiteboardContext.Provider value={value}>
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = () => {
  const context = useContext(WhiteboardContext);
  if (context === undefined) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider');
  }
  return context;
}; 