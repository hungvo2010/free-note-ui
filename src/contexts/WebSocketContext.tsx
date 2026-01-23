import { ConnectionManager } from "apis/resources/connection/ConnectionManager";
import { WebSocketConnection } from "apis/resources/connection/WebSocketConnection";
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
  const sessionId = getOrCreateSessionId(storage);
  const connection = connectionManager.getConnectionById(sessionId);

  initializeConnection(connection);

  return (
    <WebSocketContext.Provider
      value={{ webSocketConnection: connection, connectionManager }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

function getOrCreateSessionId(
  storage: ReturnType<typeof useSessionStorage>,
): string {
  let sessionId = storage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    storage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

function initializeConnection(connection: WebSocketConnection): void {
  console.log("healthy status of connection: " + connection.isHealthy());

  if (!connection.isHealthy()) {
    // Setup handlers BEFORE connecting to avoid race conditions
    setupConnectionHandlers(connection);
    connection.connect(handleConnectionReady);
  }

  if (connection.isHealthy()) {
    EventBus.publishReadyConnection();
  }
}

function setupConnectionHandlers(connection: WebSocketConnection): void {
  connection.setCloseHandler((socket, closeEvent) => {
    console.log("WebSocket closed - resetting connection state for reconnect");
    EventBus.notifyDisconnect();
    EventBus.resetConnectionState();
  });

  connection.setErrorHandler((socket, errorEvent) => {
    console.log("WebSocket error - resetting connection state for reconnect");
    EventBus.notifyDisconnect();
    handleConnectionError(connection);
  });

  connection.setHandler((socket, message) => {
    EventBus.getMessageSubject.notifyObservers(message);
  });
}

function handleConnectionError(connection: WebSocketConnection): void {
  let retryCount = 0;
  EventBus.resetConnectionState();

  const intervalId = setInterval(() => {
    console.log(`WebSocket error, retrying connection: ${retryCount++} time`);
    connection.connect((socket, event) => {
      console.log("WebSocket reconnected successfully");
      EventBus.notifyReconnect();
      EventBus.publishReadyConnection();
      clearInterval(intervalId);
    });
  }, 5000);
}

function handleConnectionReady(): void {
  console.log("WebSocket handshake successful");
  EventBus.publishReadyConnection();
}
