import { ConnectionManager } from "apis/resources/connection/ConnectionManager";
import { WebSocketConnection } from "apis/resources/connection/SocketConnection";
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
  const storage = useSessionStorage();
  let sessionId: string | null = storage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    storage.setItem("sessionId", sessionId);
  }
  const connection = connectionManager.getConnectionById(sessionId);

  if (!connection.isHealthy()) {
    connection.connect();
  }
  if (!connection.alreadySetUpHandler()) {
    setupCorrectHandlers(connection);
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
function setupCorrectHandlers(connection: WebSocketConnection) {
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
    // console.log("websocket received message: ", message);
    
  });
}
