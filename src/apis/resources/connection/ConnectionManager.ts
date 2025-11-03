import { WebSocketConnection } from "./SocketConnection";

export class ConnectionManager {
  constructor() {}

  private connectionsMap: Map<string, WebSocketConnection> = new Map();

  initConnection(sessionId: string): WebSocketConnection {
    const connection = new WebSocketConnection();
    this.connectionsMap.set(sessionId, connection);
    return connection;
  }

  getConnectionById(sid: string): WebSocketConnection {
    const key = sid || "default";
    var connection = this.connectionsMap.get(key);
    if (!connection) {
      connection = this.initConnection(key);
    }
    return connection;
  }
}
