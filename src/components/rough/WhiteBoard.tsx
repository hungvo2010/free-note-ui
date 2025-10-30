import { LockIndicator } from "components/LockIndicator";
import { WhiteboardProvider } from "contexts/WhiteboardContext";
import { useTheme } from "hooks/useTheme";
import { useWhiteboard } from "hooks/useWhiteboard";
import { useWhiteboardEvents } from "hooks/useWhiteboardEvents";
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

  const { theme } = useTheme();

  const { handleMouseDown, handleMouseMove, handleMouseUp, handleKeyDown } =
    useWhiteboardEvents(isLocked, type);

  useEffect(() => {
    if (!canvas) return;

    // Update canvas stroke style based on theme
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = theme === "dark" ? "#ffffff" : "#000000";
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, canvas, theme]);

  return (
    <div style={{ position: "relative" }}>
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
    <WhiteboardProvider isLocked={props.isLocked}>
      <WhiteboardContent {...props} />
    </WhiteboardProvider>
  );
}
