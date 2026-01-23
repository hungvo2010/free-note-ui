import { WebSocketConnection } from "./WebSocketConnection";

export class ConnectionManager {
  constructor() {}

  private static connectionsMap: Map<string, WebSocketConnection> = new Map();

  createConnection(sessionId: string): WebSocketConnection {
    const connection = new WebSocketConnection();
    ConnectionManager.connectionsMap.set(sessionId, connection);
    return connection;
  }

  getConnectionById(sid: string): WebSocketConnection {
    const key = sid || "default";
    let connection = ConnectionManager.connectionsMap.get(key);
    if (!connection) {
      connection = this.createConnection(key);
    }
    return connection;
  }
}
