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
  private sessionId: string;
  private handlers: WebSocketHandlers = {};
  private messageQueue: string[] = [];
  private isConnected = false;

  constructor() {
    this.sessionId = generateUUID();
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
      this.handlers.onOpen = combineOpenHandlers(
        this.handlers.onOpen,
        onOpenHandler,
      );
    }
  }

  private attachAllHandlers(): void {
    if (!this.socket) return;

    if (this.handlers.onOpen) {
      attachOpenHandler(this.socket, (socket, event) => {
        this.isConnected = true;
        this.flushMessageQueue();
        this.handlers.onOpen?.(socket, event);
      });
    }

    if (this.handlers.onMessage) {
      attachMessageHandler(this.socket, this.handlers.onMessage);
    }

    if (this.handlers.onError) {
      attachErrorHandler(this.socket, this.handlers.onError);
    }

    if (this.handlers.onClose) {
      attachCloseHandler(this.socket, (socket, event) => {
        this.isConnected = false;
        this.handlers.onClose?.(socket, event);
      });
    }
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log(`Flushing ${this.messageQueue.length} queued messages`);
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          console.log("Sending queued message:", message.substring(0, 100) + "...");
          this.trySendMessage(message);
        }
      }
      console.log("All queued messages flushed");
    }
  }

  public sendAction(action: string): void {
    if (!this.isConnected || !this.isHealthy()) {
      console.log("Connection not ready, queueing message:", action.substring(0, 100) + "...");
      this.messageQueue.push(action);
      console.log(`Total queued messages: ${this.messageQueue.length}`);
      return;
    }
    console.log("Sending message immediately:", action.substring(0, 100) + "...");
    this.trySendMessage(action);
  }

  private trySendMessage(message: string): void {
    try {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(message);
        console.log("✓ Message sent successfully");
      } else {
        console.warn("✗ Socket not in OPEN state, message dropped:", message.substring(0, 100));
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

export function generateUUID(): string {
  return crypto.randomUUID();
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

function attachOpenHandler(
  socket: WebSocket,
  handler: (socket: WebSocket | null, event: Event) => void,
): void {
  socket.onopen = (event: Event) => {
    handler(socket, event);
  };
}

function attachMessageHandler(
  socket: WebSocket,
  handler: (socket: WebSocket | null, message: string) => void,
): void {
  socket.onmessage = async (event) => {
    if (event.data instanceof Blob) {
      const text = await event.data.text();
      handler(socket, text);
    } else {
      console.log("Message:", event.data);
      handler(socket, event.data);
    }
  };
}

function attachErrorHandler(
  socket: WebSocket,
  handler: (socket: WebSocket | null, errorEvent: Event) => void,
): void {
  socket.onerror = (errorEvent: Event) => {
    handler(socket, errorEvent);
  };
}

function attachCloseHandler(
  socket: WebSocket,
  handler: (socket: WebSocket | null, closeEvent: CloseEvent) => void,
): void {
  socket.onclose = (closeEvent: CloseEvent) => {
    handler(socket, closeEvent);
  };
}
export type { WebSocketHandlers };
