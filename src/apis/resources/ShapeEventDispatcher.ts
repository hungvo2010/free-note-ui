import { ActionType, DraftAction } from "apis/DraftAction";
import {
  WebSocketConnection,
  generateUUID,
} from "apis/resources/connection/SocketConnection";
import { ShapeSerializer } from "core/ShapeSerializer";
import { Shape } from "types/shape/Shape";
import { RequestType } from "./protocol";

type DraftEntity = { draftId?: string; draftName?: string };

export class ShapeEventDispatcher {
  constructor(
    private socket: WebSocketConnection,
    private currentDraft: DraftEntity
  ) {}

  public setDraft(draft: DraftEntity) {
    this.currentDraft = draft;
    this.creatingDraft();
  }

  // shapeData should be a serializable description of the shape
  addShape(shapeData: Record<string, any> | Shape) {
    const payload = (shapeData as Shape).draw
      ? ShapeSerializer.serialize(shapeData as Shape)
      : { type: (shapeData as any).type, data: shapeData };
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "add", shape: payload },
    };
    this.sendOne(action);
  }

  updateShape(id: string, patch: Record<string, any> | Shape) {
    const payload = (patch as Shape).draw
      ? ShapeSerializer.serialize(patch as Shape)
      : { type: (patch as any).type, data: patch };
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "update", id, patch: payload },
    };
    this.sendOne(action);
  }

  pan(offset: { x: number; y: number }) {
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "pan", offset },
    };
    this.sendOne(action);
  }

  deleteShapes(ids: string[]) {
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "delete", ids },
    };
    this.sendOne(action);
  }

  creatingDraft() {
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "creating" },
    };
    this.sendOne(action, RequestType.CONNECT);
  }

  finalizeShape(id: string) {
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "finalize", id },
    };
    this.sendOne(action);
  }

  private sendOne(
    action: DraftAction,
    requestType: RequestType = RequestType.DATA
  ) {
    const wireMessage = {
      messageId: generateUUID(),
      payload: {
        draftId: this.currentDraft.draftId,
        draftName: this.currentDraft.draftName,
        requestType,
        content: {
          type: action.type,
          details: action.data,
        },
      },
    } as const;
    this.socket.sendAction(JSON.stringify(wireMessage));
  }
}
