// Abstract API client with connection management, retry logic, and request cancellation

import {
  ApiClientConfig,
  ApiError,
  ApiRequest,
  ApiResponse,
  ConnectionEventHandlers,
  ConnectionState,
  MessageHandler,
  RequestOptions,
} from "./types";

export abstract class ApiClient<TRequest = unknown, TResponse = unknown> {
  protected state: ConnectionState = ConnectionState.DISCONNECTED;
  protected config: Required<ApiClientConfig>;
  protected eventHandlers: ConnectionEventHandlers = {};
  protected reconnectAttempts = 0;
  protected reconnectTimer?: number;
  protected heartbeatTimer?: number;
  protected pendingRequests = new Map<string, ApiRequest>();
  protected messageHandlers = new Set<MessageHandler<TResponse>>();

  constructor(config: ApiClientConfig) {
    this.config = {
      reconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      requestTimeout: 10000,
      ...config,
    };
  }

  // Abstract methods to be implemented by concrete clients
  protected abstract doConnect(): Promise<void>;
  protected abstract doDisconnect(): Promise<void>;
  protected abstract doSend(data: string): void;
  protected abstract isConnectionHealthy(): boolean;

  // Public API
  public async connect(): Promise<void> {
    if (this.state === ConnectionState.CONNECTED) {
      return;
    }

    this.updateState(ConnectionState.CONNECTING);

    try {
      await this.doConnect();
      this.reconnectAttempts = 0;
      this.updateState(ConnectionState.CONNECTED);
      this.startHeartbeat();
      this.eventHandlers.onConnect?.();
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  public async disconnect(): Promise<void> {
    this.stopReconnect();
    this.stopHeartbeat();
    this.updateState(ConnectionState.DISCONNECTED);

    await this.doDisconnect();
    this.cancelAllPendingRequests();
  }

  public async send<T extends TRequest, R extends TResponse>(
    request: T,
    options?: RequestOptions
  ): Promise<R> {
    if (!this.isConnectionHealthy()) {
      throw this.createError("NOT_CONNECTED", "Client is not connected");
    }

    const apiRequest = this.createRequest(request, options);
    this.pendingRequests.set(apiRequest.id, apiRequest);

    try {
      const serialized = this.serializeRequest(apiRequest);
      this.doSend(serialized);

      return await this.waitForResponse<R>(apiRequest, options);
    } catch (error) {
      this.pendingRequests.delete(apiRequest.id);
      throw error;
    }
  }

  public onMessage(handler: MessageHandler<TResponse>): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public on(handlers: ConnectionEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && this.isConnectionHealthy();
  }

  // Protected helper methods
  protected handleIncomingMessage(data: string): void {
    try {
      const response = this.deserializeResponse(data);
      this.notifyMessageHandlers(response);
    } catch (error) {
      console.error("Failed to handle incoming message:", error);
    }
  }

  protected handleConnectionError(error: unknown): void {
    const apiError = this.normalizeError(error);
    this.eventHandlers.onError?.(apiError);

    if (this.config.reconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      this.updateState(ConnectionState.FAILED);
    }
  }

  protected handleConnectionClose(reason: string): void {
    this.stopHeartbeat();
    this.eventHandlers.onDisconnect?.(reason);

    if (this.config.reconnect && this.state !== ConnectionState.DISCONNECTED) {
      this.scheduleReconnect();
    }
  }

  // Private helper methods
  private createRequest<T>(payload: T, options?: RequestOptions): ApiRequest<T> {
    return {
      id: this.generateRequestId(),
      payload,
      timestamp: Date.now(),
      abortController: options?.signal ? undefined : new AbortController(),
    };
  }

  private async waitForResponse<R>(
    request: ApiRequest,
    options?: RequestOptions
  ): Promise<R> {
    const timeout = options?.timeout ?? this.config.requestTimeout;
    const signal = options?.signal ?? request.abortController?.signal;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(this.createError("TIMEOUT", `Request timed out after ${timeout}ms`));
      }, timeout);

      signal?.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(request.id);
        reject(this.createError("ABORTED", "Request was aborted"));
      });

      // For now, resolve immediately (streaming protocol doesn't have request/response pairs)
      // Subclasses can override this behavior
      clearTimeout(timeoutId);
      this.pendingRequests.delete(request.id);
      resolve({} as R);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectAttempts++;
    this.updateState(ConnectionState.RECONNECTING);
    this.eventHandlers.onReconnecting?.(this.reconnectAttempts);

    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.reconnectAttempts = 0;
  }

  private startHeartbeat(): void {
    if (!this.config.heartbeatInterval) return;

    this.heartbeatTimer = window.setInterval(() => {
      if (!this.isConnectionHealthy()) {
        this.handleConnectionClose("Heartbeat failed");
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private cancelAllPendingRequests(): void {
    this.pendingRequests.forEach((request) => {
      request.abortController?.abort();
    });
    this.pendingRequests.clear();
  }

  private notifyMessageHandlers(response: TResponse): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(response);
      } catch (error) {
        console.error("Message handler error:", error);
      }
    });
  }

  private updateState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.eventHandlers.onStateChange?.(newState);
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected serializeRequest(request: ApiRequest): string {
    return JSON.stringify(request.payload);
  }

  protected deserializeResponse(data: string): TResponse {
    return JSON.parse(data) as TResponse;
  }

  protected createError(code: string, message: string, details?: unknown): ApiError {
    return { code, message, details };
  }

  protected normalizeError(error: unknown): ApiError {
    if (typeof error === "object" && error !== null && "code" in error) {
      return error as ApiError;
    }
    return this.createError(
      "UNKNOWN_ERROR",
      error instanceof Error ? error.message : String(error)
    );
  }
}
