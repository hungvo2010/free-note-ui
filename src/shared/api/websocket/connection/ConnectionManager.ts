import { WebSocketConnection } from "./WebSocketConnection";

/**
 * Manages WebSocket connections with automatic cleanup.
 * Prevents memory leaks by removing stale connections.
 */
export class ConnectionManager {
  private static connectionsMap: Map<string, WebSocketConnection> = new Map();
  private static readonly MAX_CONNECTIONS = 100; // Prevent unbounded growth
  private static readonly CONNECTION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  constructor() {}

  /**
   * Creates a new WebSocket connection.
   * Returns null if connection limit is reached.
   */
  createConnection(sessionId: string): WebSocketConnection | null {
    // Clean up stale connections before creating new one
    this.cleanupStaleConnections();

    if (
      ConnectionManager.connectionsMap.size >= ConnectionManager.MAX_CONNECTIONS
    ) {
      console.warn(
        `Connection limit reached (${ConnectionManager.MAX_CONNECTIONS})`,
      );
      return null;
    }

    const connection = new WebSocketConnection();
    connection.setSessionId(sessionId);
    ConnectionManager.connectionsMap.set(sessionId, connection);
    return connection;
  }

  /**
   * Gets or creates a connection by session ID.
   */
  getConnectionById(sid: string): WebSocketConnection {
    const sessionKey = sid || "default";
    let connection = ConnectionManager.connectionsMap.get(sessionKey);

    if (!connection) {
      const newConnection = this.createConnection(sessionKey);
      if (!newConnection) {
        // Fallback: force cleanup and try again
        this.forceCleanup();
        const retryConnection = this.createConnection(sessionKey);
        if (!retryConnection) {
          throw new Error("Unable to create connection: limit reached");
        }
        connection = retryConnection;
      } else {
        connection = newConnection;
      }
    }

    return connection;
  }

  /**
   * Removes a specific connection by session ID.
   */
  removeConnection(sessionId: string): boolean {
    return ConnectionManager.connectionsMap.delete(sessionId);
  }

  /**
   * Cleans up connections that are not healthy.
   */
  private cleanupStaleConnections(): void {
    const toRemove: string[] = [];

    ConnectionManager.connectionsMap.forEach((connection, sessionId) => {
      if (!connection.isHealthy()) {
        toRemove.push(sessionId);
      }
    });

    toRemove.forEach((sessionId) => {
      ConnectionManager.connectionsMap.delete(sessionId);
      console.log(`Cleaned up stale connection: ${sessionId}`);
    });
  }

  /**
   * Forces cleanup of oldest connections when limit is reached.
   */
  private forceCleanup(): void {
    const entries = Array.from(ConnectionManager.connectionsMap.entries());
    const toRemove = Math.ceil(entries.length * 0.2); // Remove 20% oldest

    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const [sessionId] = entries[i];
      ConnectionManager.connectionsMap.delete(sessionId);
      console.log(`Force cleaned up connection: ${sessionId}`);
    }
  }

  /**
   * Gets the current number of active connections.
   */
  getConnectionCount(): number {
    return ConnectionManager.connectionsMap.size;
  }

  /**
   * Clears all connections. Use with caution.
   */
  clearAllConnections(): void {
    ConnectionManager.connectionsMap.clear();
  }
}
