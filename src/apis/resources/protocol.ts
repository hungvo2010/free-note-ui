import {
  DraftRequestData,
  DraftResponseData,
  ShapeData,
} from "hooks/whiteboard/types";
import { WebSocketConnection } from "./connection/WebSocketConnection";

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

// RequestType enum aligned with AsyncAPI schema
export enum RequestType {
  CONNECT = 1,
  ADD = 2,
  UPDATE = 3,
  REMOVE = 4,
  NOOP = 5,
  INVALID = -1,
}

// Re-export schema types for convenience
export type { DraftRequestData, DraftResponseData };
