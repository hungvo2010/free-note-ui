import { ConnectionReadySubject } from "./ready/ConnectionReadySubject";
import { ConnectionStateSubject } from "./reconnect/ConnectionStateObserver";
import { MessageSubject } from "./message/MessageSubject";

class EventBus {
  private messageSubject = new MessageSubject();
  private connectionReadySubject = new ConnectionReadySubject();
  private connectionStateSubject = new ConnectionStateSubject();

  // Message event handlers
  addMessageHandler(handler: any): void {
    this.messageSubject.registerObserver(handler);
  }

  removeMessageHandler(handler: any): void {
    this.messageSubject.removeObserver(handler);
  }

  // Connection ready event handlers
  addConnectionReadyHandler(handler: any): void {
    this.connectionReadySubject.registerObserver(handler);
  }

  removeConnectionReadyHandler(handler: any): void {
    this.connectionReadySubject.removeObserver(handler);
  }

  // Connection state event handlers
  addConnectionStateChange(handler: any): void {
    this.connectionStateSubject.registerObserver(handler);
  }

  removeConnectionStateChange(handler: any): void {
    this.connectionStateSubject.removeObserver(handler);
  }

  publishReadyConnection(): void {
    this.connectionReadySubject.notifyObservers();
  }

  // Reset connection state for reconnection scenarios
  resetConnectionState(): void {
    this.connectionReadySubject.reset();
  }

  // Notify about connection state changes
  notifyDisconnect(): void {
    this.connectionStateSubject.notifyDisconnect();
  }

  notifyReconnect(): void {
    this.connectionStateSubject.notifyReconnect();
  }
}

export default new EventBus();
