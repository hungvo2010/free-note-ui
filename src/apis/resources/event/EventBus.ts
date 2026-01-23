import { ConnectionReadySubject } from "./ConnectionReadySubject";
import { ConnectionStateSubject } from "./ConnectionStateObserver";
import { MessageSubject } from "./MessageSubject";

class EventBus {
  private messageSubject = new MessageSubject();
  private connectionReadySubject = new ConnectionReadySubject();
  private connectionStateSubject = new ConnectionStateSubject();

  // Delegate to MessageSubject
  get getMessageSubject() {
    return this.messageSubject;
  }

  // Delegate to ConnectionReadySubject
  get getConnectionReadySubject() {
    return this.connectionReadySubject;
  }

  // Delegate to ConnectionStateSubject
  get connectionStateObservers() {
    return this.connectionStateSubject;
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
