const EventBus = {
  handler: (msg: any) => {},
  onEvent(message: any) {
    this.handler(message);
  },

  setHandler(handler: (message: any) => void) {
    this.handler = handler;
  },
};

export default EventBus;
