import { ConnectionManager } from "@shared/api/websocket/connection/ConnectionManager";
import { WebSocketConnection } from "@shared/api/websocket/connection/WebSocketConnection";
import { useContext, useMemo } from "react";
import { WebSocketContext } from "../contexts/WebSocketContext";

export const useWebSocketManager: () => ConnectionManager = () => {
  const connectionManager = useMemo(() => {
    return new ConnectionManager();
  }, []);
  return connectionManager;
};

export enum INSTANCE_TYPE {
  ECHO_ONLY,
  CORE_APPLICATION,
}

export const useWebSocketConnection: (
  type?: INSTANCE_TYPE
) => WebSocketConnection | null = (type = INSTANCE_TYPE.ECHO_ONLY) => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WhiteboardProvider");
  }
  return context.webSocketConnection;
};
