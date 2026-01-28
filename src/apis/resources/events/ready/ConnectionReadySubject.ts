export interface ConnectionReadyObserver {
  update(): void;
}

export class ConnectionReadySubject {
  private observers: ConnectionReadyObserver[] = [];
  private hasNotified = false;
  private notifiedObservers = new WeakSet<ConnectionReadyObserver>();

  registerObserver(observer: ConnectionReadyObserver): void {
    if (!this.observers.includes(observer)) {
      console.log("ConnectionReadySubject: Registering observer. Current count:", this.observers.length);
      this.observers.push(observer);
      console.log("ConnectionReadySubject: Observer registered. New count:", this.observers.length);
      
      // Replay: If already notified, immediately notify new observer
      if (this.hasNotified && !this.notifiedObservers.has(observer)) {
        console.log("ConnectionReadySubject: Replaying connection ready event for late observer");
        observer.update();
        this.notifiedObservers.add(observer);
      }
    } else {
      console.log("ConnectionReadySubject: Observer already registered, skipping");
    }
  }

  removeObserver(observer: ConnectionReadyObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      console.log("ConnectionReadySubject: Removing observer. Current count:", this.observers.length);
      this.observers.splice(index, 1);
      console.log("ConnectionReadySubject: Observer removed. New count:", this.observers.length);
    }
  }

  notifyObservers(): void {
    this.hasNotified = true;
    console.log("ConnectionReadySubject: Notifying observers. Count:", this.observers.length);
    for (const observer of this.observers) {
      // Only notify each observer once per connection
      if (!this.notifiedObservers.has(observer)) {
        console.log("ConnectionReadySubject: Notifying observer");
        observer.update();
        this.notifiedObservers.add(observer);
      } else {
        console.log("ConnectionReadySubject: Observer already notified, skipping");
      }
    }
  }

  reset(): void {
    console.log("ConnectionReadySubject: Resetting state for reconnection");
    this.hasNotified = false;
    this.notifiedObservers = new WeakSet<ConnectionReadyObserver>();
  }
}
