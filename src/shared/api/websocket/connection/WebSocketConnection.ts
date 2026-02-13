import { getRemoteUrl } from "@config/environment/Environment";
const remoteUrl = getRemoteUrl();

interface WebSocketHandler {
  onOpen?: (socket: WebSocket | null, event: Event) => void;
  onMessage?: (socket: WebSocket | null, message: string) => void;
  onError?: (socket: WebSocket | null, errorEvent: Event) => void;
  onClose?: (socket: WebSocket | null, closeEvent: CloseEvent) => void;
}

export class WebSocketConnection {
  public static numberOfConnections: number = 0;
  private socket: WebSocket | null = null;
  private allHandler: WebSocketHandler = {};
  private messageQueue: string[] = [];
  private isConnected = false;
  private sessionId: string | null = null;

  constructor() {}

  public setSessionId(id: string): void {
    this.sessionId = id;
  }

  public getSessionId(): string | null {
    return this.sessionId;
  }

  public async connect(
    onOpenHandler?: (socket: WebSocket | null, event: Event) => void,
  ) {
    if (this.isHealthy()) {
      return;
    }

    this.updateOpenHandler(onOpenHandler);
    this.socket = createWebSocket();
    this.attachAllHandlers();
  }

  private updateOpenHandler(
    onOpenHandler?: (socket: WebSocket | null, event: Event) => void,
  ): void {
    if (onOpenHandler) {
      this.allHandler.onOpen = combineOpenHandlers(
        this.allHandler.onOpen,
        onOpenHandler,
      );
    }
  }

  private attachAllHandlers(): void {
    if (!this.socket) return;

    if (this.allHandler.onOpen) {
      this.socket.onopen = (event: Event) => {
        this.isConnected = true;
        this.flushMessageQueue();
        this.allHandler.onOpen?.(this.socket, event);
      };
    }

    if (this.allHandler.onMessage) {
      this.socket.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const text = await event.data.text();
          this.allHandler.onMessage?.(this.socket, text);
        } else {
          console.log("Message Receival: [RAW_TEXT]: ", event.data);
          this.allHandler.onMessage?.(this.socket, event.data);
        }
      };
    }

    if (this.allHandler.onError) {
      this.socket.onerror = (errorEvent: Event) => {
        this.allHandler.onError?.(this.socket, errorEvent);
      };
    }

    if (this.allHandler.onClose) {
      this.socket.onclose = (closeEvent: CloseEvent) => {
        this.isConnected = false;
        this.allHandler.onClose?.(this.socket, closeEvent);
      };
    }
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log(`Flushing ${this.messageQueue.length} queued messages`);
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          console.log(
            "Sending queued message:",
            message.substring(0, 100) + "...",
          );
          this.trySendMessage(message);
        }
      }
      console.log("All queued messages flushed");
    }
  }

  public sendAction(action: string): void {
    if (!this.isConnected || !this.isHealthy()) {
      console.log(
        "Connection not ready, queueing message:",
        action.substring(0, 100) + "...",
      );
      this.messageQueue.push(action);
      console.log(`Total queued messages: ${this.messageQueue.length}`);
      return;
    }
    console.log(
      "Sending message immediately:",
      action.substring(0, 100) + "...",
    );
    this.trySendMessage(action);
  }

  private trySendMessage(message: string): void {
    try {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(message);
        console.log("✓ Message sent successfully");
      } else {
        console.warn(
          "✗ Socket not in OPEN state, message dropped:",
          message.substring(0, 100),
        );
      }
    } catch (error) {
      console.error("✗ Failed to send action", error);
    }
  }

  public setHandler(
    handler: (socket: WebSocket | null, message: string) => void,
  ): void {
    this.allHandler.onMessage = handler;
    this.attachAllHandlers();
  }

  public setErrorHandler(
    handler: (socket: WebSocket | null, errorEvent: Event) => void,
  ): void {
    this.allHandler.onError = handler;
    this.attachAllHandlers();
  }

  public setCloseHandler(
    handler: (socket: WebSocket | null, closeEvent: CloseEvent) => void,
  ): void {
    this.allHandler.onClose = handler;
    this.attachAllHandlers();
  }

  public setOpenHandler(
    handler: (socket: WebSocket | null, event: Event) => void,
  ): void {
    this.allHandler.onOpen = handler;
    this.attachAllHandlers();
  }

  public isHealthy(): boolean {
    return this.hasOpenSocket();
  }

  private hasOpenSocket(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  public alreadySetUpHandler(): boolean {
    return this.hasHandlerAttached();
  }

  private hasHandlerAttached(): boolean {
    return !!this.socket && this.socket.onopen !== null;
  }
}

function createWebSocket(): WebSocket {
  console.log("Creating new socket");
  const socket = new WebSocket(remoteUrl);
  WebSocketConnection.numberOfConnections++;
  console.log(
    "Number of connections: " + WebSocketConnection.numberOfConnections,
  );
  return socket;
}

function combineOpenHandlers(
  existing?: (socket: WebSocket | null, event: Event) => void,
  additional?: (socket: WebSocket | null, event: Event) => void,
): ((socket: WebSocket | null, event: Event) => void) | undefined {
  if (!additional) return existing;

  return (socket, event) => {
    existing?.(socket, event);
    additional(socket, event);
  };
}

export type { WebSocketHandler as WebSocketHandlers };
