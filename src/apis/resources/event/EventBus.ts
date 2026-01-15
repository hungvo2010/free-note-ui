const EventBus = {
  handler: (msg: Blob | string) => {},
  onEvent(message: Blob | string) {
    this.handler(message);
    if (message instanceof Blob) return;
  },

  setHandler(handler: (message: Blob | string) => void) {
    this.handler = handler;
  },
};

export default EventBus;
