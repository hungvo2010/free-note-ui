import { ConnectionManager } from "apis/resources/ConnectionManager";
import { WebSocketConnection } from "apis/resources/WebSocketConnection";
import { useSessionStorage } from "hooks/useSessionStorage";
import { useWebSocketManager } from "hooks/useWebSocket";
import { createContext } from "react";
import { INSTANCE_TYPE } from "../hooks/useWebSocket";

interface WebSocketContextType {
  webSocketConnection: WebSocketConnection;
  connectionManager: ConnectionManager;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{
  children: React.ReactNode;
  type?: INSTANCE_TYPE;
}> = ({ children, type = INSTANCE_TYPE.ECHO_ONLY }) => {
  const connectionManager = useWebSocketManager();
  const sessionId = useSessionStorage().getItem("sessionId");
  const connection = connectionManager.getConnectionById(sessionId);

  if (!connection.alreadySetUpHandler()) {
    setupCorrectHandlers(connection, type);
  }

  return (
    <WebSocketContext.Provider
      value={{ webSocketConnection: connection, connectionManager }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// TODO: Move to other classes to maintain single responsibility
function setupCorrectHandlers(
  connection: WebSocketConnection,
  type: INSTANCE_TYPE
) {
  if (type === INSTANCE_TYPE.ECHO_ONLY) {
    connection.setOpenHandler((socket, event) => {
      console.log("WebSocket opened");
    });
    connection.setCloseHandler((socket, closeEvent) => {
      console.log("WebSocket closed");
    });
    connection.setErrorHandler((socket, errorEvent) => {
      console.log("WebSocket error");
    });
    connection.setHandler((socket, message) => {
      console.log("WebSocket message");
    });
  }
  if (type === INSTANCE_TYPE.CORE_APPLICATION) {
  }
}
