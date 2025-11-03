import { ConnectionManager } from "apis/resources/connection/ConnectionManager";
import { WebSocketConnection } from "apis/resources/connection/SocketConnection";
import { useContext, useMemo } from "react";
import { WebSocketContext } from "../contexts/WebSocketContext";
import { useSessionStorage } from "./useSessionStorage";

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
) => WebSocketConnection = (type = INSTANCE_TYPE.ECHO_ONLY) => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WhiteboardProvider");
  }
  return context.webSocketConnection;
};
