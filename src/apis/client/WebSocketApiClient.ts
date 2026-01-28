// WebSocket implementation of ApiClient with automatic reconnection

import { ApiClient } from "./ApiClient";
import { ApiClientConfig } from "./types";

export class WebSocketApiClient<TRequest = unknown, TResponse = unknown> extends ApiClient<
  TRequest,
  TResponse
> {
  private socket: WebSocket | null = null;
  private messageQueue: string[] = [];

  constructor(config: ApiClientConfig) {
    super(config);
  }

  protected async doConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.config.url);

        this.socket.onopen = () => {
          this.flushMessageQueue();
          resolve();
        };

        this.socket.onmessage = async (event) => {
          const data = event.data instanceof Blob ? await event.data.text() : event.data;
          this.handleIncomingMessage(data);
        };

        this.socket.onerror = (event) => {
          reject(this.createError("CONNECTION_ERROR", "WebSocket connection failed", event));
        };

        this.socket.onclose = (event) => {
          this.handleConnectionClose(event.reason || "Connection closed");
        };
      } catch (error) {
        reject(this.normalizeError(error));
      }
    });
  }

  protected async doDisconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close(1000, "Client disconnect");
      this.socket = null;
    }
  }

  protected doSend(data: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("Socket not ready, queueing message");
      this.messageQueue.push(data);
      return;
    }

    try {
      this.socket.send(data);
    } catch (error) {
      console.error("Failed to send message:", error);
      this.messageQueue.push(data);
    }
  }

  protected isConnectionHealthy(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`Flushing ${this.messageQueue.length} queued messages`);
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach((message) => {
      this.doSend(message);
    });
  }

  public getSocket(): WebSocket | null {
    return this.socket;
  }
}
