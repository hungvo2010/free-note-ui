import { getRemoteUrl } from "environment/Environment";
const remoteUrl = getRemoteUrl();

interface WebSocketHandlers {
  onOpen?: (socket: WebSocket | null, event: Event) => void;
  onMessage?: (socket: WebSocket | null, message: string) => void;
  onError?: (socket: WebSocket | null, errorEvent: Event) => void;
  onClose?: (socket: WebSocket | null, closeEvent: CloseEvent) => void;
}

export class WebSocketConnection {
  public static numberOfConnections: number = 0;
  private socket: WebSocket | null = null;
  private handlers: WebSocketHandlers = {};
  private messageQueue: string[] = [];
  private isConnected = false;

  constructor() {}

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
      this.handlers.onOpen = combineOpenHandlers(
        this.handlers.onOpen,
        onOpenHandler,
      );
    }
  }

  private attachAllHandlers(): void {
    if (!this.socket) return;

    if (this.handlers.onOpen) {
      this.socket.onopen = (event: Event) => {
        this.isConnected = true;
        this.flushMessageQueue();
        this.handlers.onOpen?.(this.socket, event);
      };
    }

    if (this.handlers.onMessage) {
      this.socket.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const text = await event.data.text();
          this.handlers.onMessage?.(this.socket, text);
        } else {
          console.log("Message inside websocket connection:", event.data);
          this.handlers.onMessage?.(this.socket, event.data);
        }
      };
    }

    if (this.handlers.onError) {
      this.socket.onerror = (errorEvent: Event) => {
        this.handlers.onError?.(this.socket, errorEvent);
      };
    }

    if (this.handlers.onClose) {
      this.socket.onclose = (closeEvent: CloseEvent) => {
        this.isConnected = false;
        this.handlers.onClose?.(this.socket, closeEvent);
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
    this.handlers.onMessage = handler;
    this.attachAllHandlers();
  }

  public setErrorHandler(
    handler: (socket: WebSocket | null, errorEvent: Event) => void,
  ): void {
    this.handlers.onError = handler;
    this.attachAllHandlers();
  }

  public setCloseHandler(
    handler: (socket: WebSocket | null, closeEvent: CloseEvent) => void,
  ): void {
    this.handlers.onClose = handler;
    this.attachAllHandlers();
  }

  public setOpenHandler(
    handler: (socket: WebSocket | null, event: Event) => void,
  ): void {
    this.handlers.onOpen = handler;
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

export type { WebSocketHandlers };
