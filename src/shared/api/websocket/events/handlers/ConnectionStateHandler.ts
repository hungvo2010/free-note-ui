import { ConnectionStateObserver } from "../subjects/ConnectionStateObserver";
import { ConnectionReadyHandler } from "./ConnectionReadyHandler";

export class ConnectionStateHandler implements ConnectionStateObserver {
  constructor(private connectionReadyHandler: ConnectionReadyHandler) {}

  onDisconnect(): void {
    console.log("Connection lost, resetting state");
    this.connectionReadyHandler.reset();
  }

  onReconnect(): void {
    console.log("Connection restored");
    // State is already reset, observer will be notified via ConnectionReadySubject
  }
}
