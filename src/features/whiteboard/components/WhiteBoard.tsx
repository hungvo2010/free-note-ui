import { LockIndicator } from "@features/whiteboard/components/LockIndicator";
import { WebSocketProvider } from "@shared/contexts/WebSocketContext";
import { WhiteboardProvider } from "@features/whiteboard/contexts/WhiteboardContext";
import { useWhiteboard } from "@features/whiteboard/hooks/useWhiteboard";
import { useWhiteboardEvents } from "@features/whiteboard/hooks/useWhiteboardEvents";
import React, { useEffect } from "react";
import "./WhiteBoard.scss";

type DrawTypeProps = {
  type: string;
  isLocked?: boolean;
};

const WhiteboardContent: React.FC<DrawTypeProps> = ({
  type,
  isLocked = false,
}) => {
  const { canvas } = useWhiteboard();

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown } =
    useWhiteboardEvents(isLocked, type);

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
    <div className="whiteboard-container">
      <canvas
        id="myCanvas"
        className={`full-canvas ${isLocked ? "locked-canvas" : ""}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      ></canvas>

      <LockIndicator isLocked={isLocked} />
    </div>
  );
};

export default function WhiteBoard(props: DrawTypeProps) {
  return (
    <WebSocketProvider>
      <WhiteboardProvider isLocked={props.isLocked}>
        <WhiteboardContent {...props} />
      </WhiteboardProvider>
    </WebSocketProvider>
  );
}
