import { DraftAction } from "hooks/whiteboard/types";
import { WebSocketConnection } from "./connection/SocketConnection";

export type MessagePayload = {
  messageId: string;
  payload: string;
};

export type Draft = {
  draftId: string;
  draftName: string;
  draftActions: DraftAction[];
};

export type DraftRequest = {
  ipAddress: string;
  port: string;
  socket: WebSocketConnection;
};

export enum RequestType {
  INIT = 0,
  CONNECT = 1,
  ADD = 2,
  UPDATE = 3,
  REMOVE = 4,
  NOOP = 5,
  INVALID = -1,
}
