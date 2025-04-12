import React, { useEffect } from "react";
import { WhiteboardProvider } from "contexts/WhiteboardContext";
import { useWhiteboardEvents } from "hooks/useWhiteboardEvents";
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
      canvas
    );

  useEffect(() => {
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, canvas]);

  return (
    <div style={{ position: "relative" }}>
      <canvas
        id="myCanvas"
        className={`full-canvas ${isLocked ? "locked-canvas" : ""}`}
        ref={canvasRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      ></canvas>

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
