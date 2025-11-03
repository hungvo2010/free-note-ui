import { getRemoteUrl } from "../../../environment/Environment";
import EventBus from "../event/EventBus";
const remoteUrl = getRemoteUrl();

export class WebSocketConnection {
  private socket: WebSocket | null = null;
  private sessionId: string;
  constructor() {
    this.sessionId = generateUUID();
  }

  public async connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(remoteUrl);
    }
  }

  public sendAction(action: string): void {
    try {
      console.log("Sending action");
      if (this.socket) {
        this.socket.send(action);
      }
    } catch (error) {
      console.error("Failed to send action", error);
    }
  }

  public setHandler(
    handler: (socket: WebSocket, message: string) => void
  ): void {
    console.log(
      "about to setting handler, but wait this socket is:  " + this.socket
    );
    if (this.socket) {
      this.socket.onmessage = async (event) => {
        console.log("Received message:  ", event.data);
        if (event.data instanceof Blob) {
          const text = await event.data.text();
          console.log("Message text:", text);

          // If it’s JSON, parse it:
          try {
            const json = JSON.parse(text);
            console.log("Parsed JSON:", json);
          } catch (e) {
            console.log("Not JSON:", text);
          }
        } else {
          console.log("Message:", event.data);
        }
        handler(this.socket, event.data);
        EventBus.onEvent(event.data);
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
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  public alreadySetUpHandler(): boolean {
    return !!this.socket && this.socket.onopen !== null;
  }
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
