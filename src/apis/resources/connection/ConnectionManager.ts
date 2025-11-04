import { WebSocketConnection } from "./SocketConnection";

export class ConnectionManager {
  constructor() {}

  private static connectionsMap: Map<string, WebSocketConnection> = new Map();

  initConnection(sessionId: string): WebSocketConnection {
    const connection = new WebSocketConnection();
    ConnectionManager.connectionsMap.set(sessionId, connection);
    return connection;
  }

  getConnectionById(sid: string): WebSocketConnection {
    const key = sid || "default";
    var connection = ConnectionManager.connectionsMap.get(key);
    if (!connection) {
      connection = this.initConnection(key);
    }
    return connection;
  }
}
