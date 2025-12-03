import { getRemoteUrl } from "environment/Environment";
const remoteUrl = getRemoteUrl();

export class WebSocketConnection {
  public static numberOfConnections: number = 0;
  private socket: WebSocket | null = null;
  private sessionId: string;
  constructor() {
    this.sessionId = generateUUID();
  }

  public async connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // if (!this.socket) {
      console.log("Creating new socket");
      this.socket = new WebSocket(remoteUrl);
      WebSocketConnection.numberOfConnections++;
      console.log(
        "Number of connections: " + WebSocketConnection.numberOfConnections
      );
    // }
  }

  public sendAction(action: string): void {
    try {
      // console.log("Sending action");
      if (this.socket) {
        this.socket.send(action);
      }
    } catch (error) {
      console.error("Failed to send action", error);
    }
  }

  public setHandler(
    handler: (socket: WebSocket | null, message: string) => void
  ): void {
    console.log(
      "about to setting handler, but wait this socket is:  " + this.socket
    );
    if (this.socket) {
      this.socket.onmessage = async (event) => {
        // console.log("Received message:  ", event.data);
        if (event.data instanceof Blob) {
          const text = await event.data.text();
          console.log("Message text:", text);
          handler(this.socket, text);
        } else {
          console.log("Message:", event.data);
        }
      };
    }
  }

  public setErrorHandler(
    handler: (socket: WebSocket | null, errorEvent: Event) => void
  ): void {
    if (this.socket) {
      this.socket.onerror = (errorEvent: Event) => {
        handler(this.socket, errorEvent);
      };
    }
  }

  public setCloseHandler(
    handler: (socket: WebSocket | null, closeEvent: CloseEvent) => void
  ): void {
    if (this.socket) {
      this.socket.onclose = (closeEvent: CloseEvent) => {
        handler(this.socket, closeEvent);
      };
    }
  }
  public setOpenHandler(
    handler: (socket: WebSocket | null, event: Event) => void
  ): void {
    if (this.socket) {
      this.socket.onopen = (event: Event) => {
        handler(this.socket, event);
      };
    }
  }

  public isHealthy(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  public alreadySetUpHandler(): boolean {
    return !!this.socket && this.socket.onopen !== null;
  }
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
