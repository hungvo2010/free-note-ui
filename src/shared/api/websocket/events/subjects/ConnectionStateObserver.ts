// Observer for connection state changes (disconnect/reconnect)
export interface ConnectionStateObserver {
  onDisconnect(): void;
  onReconnect(): void;
}

export class ConnectionStateSubject {
  private observers: ConnectionStateObserver[] = [];

  registerObserver(observer: ConnectionStateObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  removeObserver(observer: ConnectionStateObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyDisconnect(): void {
    // console.log("Notifying observers of disconnect");
    for (const observer of this.observers) {
      observer.onDisconnect();
    }
  }

  notifyReconnect(): void {
    console.log("Notifying observers of reconnect");
    for (const observer of this.observers) {
      observer.onReconnect();
    }
  }
}
