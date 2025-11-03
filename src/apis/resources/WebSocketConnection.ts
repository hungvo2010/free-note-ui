import { getRemoteUrl } from "./Environment";
const remoteUrl = getRemoteUrl();

export class WebSocketConnection {
  private socket: WebSocket;
  private sessionId: string;
  constructor() {
    this.socket = new WebSocket(remoteUrl);
    this.sessionId = generateUUID();
  }

  public async connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    this.socket = new WebSocket(remoteUrl);
  }

  public sendAction(action: string): void {
    console.log("Sending action");
    console.log(this.socket)
    if (this.socket) {
      this.socket.send(action);
    }
  }

  public setHandler(
    handler: (socket: WebSocket, message: string) => void
  ): void {
    if (this.socket) {
      this.socket.onmessage = (event) => {
        handler(this.socket, event.data);
      };
    }
  }

  public setErrorHandler(
    handler: (socket: WebSocket, errorEvent: Event) => void
  ): void {
    if (this.socket) {
      this.socket.onerror = (errorEvent: Event) => {
        handler(this.socket, errorEvent);
      };
    }
  }

  public setCloseHandler(
    handler: (socket: WebSocket, closeEvent: CloseEvent) => void
  ): void {
    if (this.socket) {
      this.socket.onclose = (closeEvent: CloseEvent) => {
        handler(this.socket, closeEvent);
      };
    }
  }
  public setOpenHandler(
    handler: (socket: WebSocket, event: Event) => void
  ): void {
    if (this.socket) {
      this.socket.onopen = (event: Event) => {
        handler(this.socket, event);
      };
    }
  }

  public isHealthy(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public alreadySetUpHandler(): boolean {
    return this.socket.onopen !== null;
  }
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
