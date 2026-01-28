import { useRef } from "react";

const useInteractionRefs = () => {
  const drawingRef = useRef(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const moveBoardRef = useRef(false);
  const eraserModeRef = useRef(false);
  const eraserSizeRef = useRef(10);
  const eraserCursorTimeoutRef = useRef<number | null>(null);
  const isDraggingShapeRef = useRef(false);
  const isEditingTextRef = useRef(false);
  return {
    drawingRef,
    positionRef,
    dragStartPosRef,
    moveBoardRef,
    eraserModeRef,
    eraserSizeRef,
    eraserCursorTimeoutRef,
    isDraggingShapeRef,
    isEditingTextRef,
  };
};

export default useInteractionRefs;
