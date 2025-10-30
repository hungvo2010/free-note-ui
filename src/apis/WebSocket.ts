import { getRemoteUrl } from "./Environment";
const remoteUrl = getRemoteUrl();

export class WebSocketConnection {
  private socket: WebSocket | null;
  constructor() {
    this.socket = new WebSocket(remoteUrl);
  }

  public sendAction(action: string): void {
    if (this.socket) {
      this.socket.send(action);
    }
  }
  public setHandler(handler: (message: string) => void): void {
    if (this.socket) {
      this.socket.onmessage = (event) => {
        handler(event.data);
      };
    }
  }
  public setCloseHandler(handler: () => void): void {
    if (this.socket) {
      this.socket.onclose = () => {
        handler();
      };
    }
  }
  public setInitHandler(handler: () => void): void {
    if (this.socket) {
      this.socket.onopen = () => {
        handler();
      };
    }
  }
}

export function createConnection(): WebSocketConnection {
  return new WebSocketConnection();
}
