import { WebSocketConnection } from "./WebSocketConnection";

export class ConnectionManager {
  constructor() {}

  private connectionsMap: Map<string, WebSocketConnection> = new Map();

  initConnection(sessionId: string): WebSocketConnection {
    const connection = new WebSocketConnection();
    this.connectionsMap.set(sessionId, connection);
    return connection;
  }

  getConnectionById(sid: string): WebSocketConnection {
    var connection = this.connectionsMap.get(sid);
    if (!connection) {
      connection = this.initConnection(sid);
    }
    return connection;
  }
}
