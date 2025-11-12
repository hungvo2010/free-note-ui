import { ConnectionManager } from "apis/resources/connection/ConnectionManager";
import { WebSocketConnection } from "apis/resources/connection/SocketConnection";
import EventBus from "apis/resources/event/EventBus";
import { useSessionStorage } from "hooks/useSessionStorage";
import { useWebSocketManager } from "hooks/useWebSocket";
import { createContext } from "react";
import { INSTANCE_TYPE } from "../hooks/useWebSocket";

interface WebSocketContextType {
  webSocketConnection: WebSocketConnection | null;
  connectionManager: ConnectionManager | null;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  webSocketConnection: null,
  connectionManager: null,
});

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
    let retryCount = 0;
    const intervalId = setInterval(() => {
      connection.setOpenHandler((socket, event) => {
        clearInterval(intervalId);
      });
      console.log(`WebSocket error, retrying connection: ${retryCount++} time`);
      connection.connect();
    }, 5000);
  });
  connection.setHandler((socket, message) => {
    EventBus.onEvent(message);
  });
}
