import { WebSocketConnection } from "./WebSocketConnection";

export class ConnectionQualification {
  isHealthy(connection: WebSocketConnection): boolean {
    return connection.isHealthy();
  }
}
