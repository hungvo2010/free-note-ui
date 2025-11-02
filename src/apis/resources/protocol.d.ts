import { DraftAction } from "../DraftAction";
import { WebSocketConnection } from "./WebSocketConnection";

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
