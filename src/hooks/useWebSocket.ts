import { useContext } from "react";
import { WhiteboardContext } from "../contexts/WhiteboardContext";
import { WebSocketConnection } from "apis/WebSocket";

export const useWebSocket: () => WebSocketConnection = () => {
  const context = useContext(WhiteboardContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WhiteboardProvider");
  }
  return context.socketSonnection;
};
