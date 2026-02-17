import {
  DraftRequestData,
  DraftResponseData,
  ShapeData,
  RequestType,
} from "@features/whiteboard/hooks/machine/types";
import { WebSocketConnection } from "@shared/api/websocket/connection/WebSocketConnection";

export type MessagePayload = {
  messageId: string;
  payload: string;
};

export type Draft = {
  draftId: string;
  draftName: string;
  shapes?: ShapeData[];
};

export type DraftRequest = {
  ipAddress: string;
  port: string;
  socket: WebSocketConnection;
};

// MsgType enum for heartbeat messages
export enum MsgType {
  PING = "PING",
  PONG = "PONG",
}

// Re-export schema types for convenience
export { RequestType };
export type { DraftRequestData, DraftResponseData };
