import { ConnectionManager } from "@shared/api/websocket/connection/ConnectionManager";
import { Heartbeat } from "@shared/api/websocket/connection/Heartbeat";
import { WebSocketConnection } from "@shared/api/websocket/connection/WebSocketConnection";
import EventBus from "@shared/api/websocket/events/coordinator/EventBus";
import { useSessionStorage } from "@shared/hooks/useSessionStorage";
import { useWebSocketManager } from "@shared/hooks/useWebSocket";
import { createContext, useEffect, useRef } from "react";
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
  const heartbeatRef = useRef<Heartbeat | null>(null);
  const connectionRetryMaps = useRef<Map<WebSocketConnection, boolean>>(
    new Map()
  );

  useEffect(() => {
    initializeConnection(connection, heartbeatRef, connectionRetryMaps);

    return () => {
      // Cleanup heartbeat on unmount
      if (heartbeatRef.current) {
        heartbeatRef.current.stop();
      }
    };
  }, [connection]);

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

function initializeConnection(
  connection: WebSocketConnection,
  heartbeatRef: React.MutableRefObject<Heartbeat | null>,
  connectionRetryMaps: React.MutableRefObject<Map<WebSocketConnection, boolean>>,
): void {
  console.log("healthy status of connection: " + connection.isHealthy());

  // Setup handlers once - they'll be reused for all connections/reconnections
  setupConnectionHandlers(connection, heartbeatRef, connectionRetryMaps);

  if (!connection.isHealthy()) {
    connection.connect();
  } else {
    EventBus.publishReadyConnection();
    startHeartbeat(connection, heartbeatRef);
  }
}

function setupConnectionHandlers(
  connection: WebSocketConnection,
  heartbeatRef: React.MutableRefObject<Heartbeat | null>,
  connectionRetryMaps: React.MutableRefObject<Map<WebSocketConnection, boolean>>,
): void {
  // Handler for successful connection/reconnection
  connection.setOpenHandler(() => {
    console.log("WebSocket connection opened successfully");
    // Clear retry flag on successful connection
    connectionRetryMaps.current.delete(connection);
    EventBus.notifyReconnect();
    EventBus.publishReadyConnection();
    startHeartbeat(connection, heartbeatRef);
  });

  connection.setCloseHandler(() => {
    console.log("[CLOSE-EVENT] WebSocket closed - will attempt reconnect");
    stopHeartbeat(heartbeatRef);
    EventBus.notifyDisconnect();
    EventBus.resetConnectionState();
    attemptReconnect(connection, connectionRetryMaps);
  });

  connection.setErrorHandler(() => {
    console.log("[ERROR-EVENT] WebSocket error - will attempt reconnect");
    stopHeartbeat(heartbeatRef);
    EventBus.notifyDisconnect();
    EventBus.resetConnectionState();
    attemptReconnect(connection, connectionRetryMaps);
  });

  connection.setHandler((_socket, message) => {
    EventBus.publishMessage(message);
  });
}


function attemptReconnect(
  connection: WebSocketConnection,
  connectionRetryMaps: React.MutableRefObject<Map<WebSocketConnection, boolean>>,
): void {
  // Check if a retry is already in progress for this connection
  if (connectionRetryMaps.current.get(connection)) {
    console.log("Reconnection already in progress for this connection, skipping");
    return;
  }

  // Mark this connection as having an active retry
  connectionRetryMaps.current.set(connection, true);

  let retryCount = 0;
  const maxRetries = 10;
  const backOff = 5000; // miliseconds

  const execute = async () => {
    const connectionStatus = connection.isHealthy();
    if (connectionStatus) {
      console.log("connect successfully");
      connectionRetryMaps.current.delete(connection);
      return;
    }

    if (retryCount >= maxRetries) {
      console.error("Max reconnection attempts reached");
      connectionRetryMaps.current.delete(connection);
      return;
    }
    console.log(`Number of retry count: ${++retryCount}, at: ${new Date()}`);
    const nextDelay = Math.pow(2, retryCount) * backOff;
    const jitter = Math.random() * 100;
    const finalDelay = nextDelay + jitter;
    await new Promise((resolve) => setTimeout(resolve, finalDelay));
    return execute();
  };
  execute();
}

function startHeartbeat(
  connection: WebSocketConnection,
  heartbeatRef: React.MutableRefObject<Heartbeat | null>,
): void {
  if (!heartbeatRef.current) {
    heartbeatRef.current = new Heartbeat(connection, 30000); // 30 seconds
  }

  if (!heartbeatRef.current.isRunning()) {
    heartbeatRef.current.start();
  }
}

function stopHeartbeat(
  heartbeatRef: React.MutableRefObject<Heartbeat | null>,
): void {
  if (heartbeatRef.current) {
    heartbeatRef.current.stop();
  }
}
