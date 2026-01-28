// Core API client types and interfaces

export enum ConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  FAILED = "FAILED",
}

export interface ApiClientConfig {
  url: string;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  requestTimeout?: number;
}

export interface ApiRequest<T = unknown> {
  id: string;
  payload: T;
  timestamp: number;
  abortController?: AbortController;
}

export interface ApiResponse<T = unknown> {
  id: string;
  payload: T;
  timestamp: number;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ConnectionEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: ApiError) => void;
  onReconnecting?: (attempt: number) => void;
  onStateChange?: (state: ConnectionState) => void;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

export type RequestHandler<TRequest, TResponse> = (
  request: TRequest,
  options?: RequestOptions
) => Promise<TResponse>;

export type MessageHandler<T = unknown> = (message: T) => void;
