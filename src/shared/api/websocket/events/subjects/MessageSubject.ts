export interface MessageObserver {
  update(message: Blob | string): void;
}

export class MessageSubject {
  private observers: MessageObserver[] = [];

  registerObserver(observer: MessageObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  removeObserver(observer: MessageObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(message: Blob | string): void {
    // console.log(
    //   "[notifyObservers] number of observers for MessageSubject: " +
    //     this.observers.length,
    // );
    for (const observer of this.observers) {
      observer.update(message);
    }
  }
}
