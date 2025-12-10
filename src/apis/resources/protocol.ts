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
  CONNECT = 1,
  DATA = 2,
  INVALID = -1,
}
