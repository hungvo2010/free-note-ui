import React, { useEffect } from "react";
import { WhiteboardProvider } from "contexts/WhiteboardContext";
import { useWhiteboardEvents } from "hooks/useWhiteboardEvents";
import { TextEditor } from "components/TextEditor";
import { LockIndicator } from "components/LockIndicator";
import "./WhiteBoard.scss";
import { useWhiteboard } from "hooks/useWhiteboard";

type DrawTypeProps = {
  type: string;
  isLocked?: boolean;
};

const WhiteboardContent: React.FC<DrawTypeProps> = ({
  type,
  isLocked = false,
}) => {
  const {
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
  } = useWhiteboard();

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown } =
    useWhiteboardEvents(
      shapes,
      canvasRef,
      roughCanvas,
      reDrawController,
      reDraw,
      isLocked,
      type,
      selectedShape,
      setSelectedShape,
      isDraggingShape,
      setIsDraggingShape,
      isEditingText,
      setIsEditingText,
      canvas
    );

  useEffect(() => {
    const myCanvas = canvasRef.current;
    if (!myCanvas) return;

    myCanvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      myCanvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, canvasRef]);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        id="myCanvas"
        className={`full-canvas ${isLocked ? "locked-canvas" : ""}`}
        ref={canvasRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      ></canvas>

      <TextEditor
        selectedShape={selectedShape}
        roughCanvas={roughCanvas}
        isEditingText={isEditingText}
        setIsEditingText={setIsEditingText}
        setSelectedShape={setSelectedShape}
        isLocked={isLocked}
      />

      <LockIndicator isLocked={isLocked} />
    </div>
  );
};

export default function WhiteBoard(props: DrawTypeProps) {
  return (
    <WhiteboardProvider isLocked={props.isLocked}>
      <WhiteboardContent {...props} />
    </WhiteboardProvider>
  );
}
