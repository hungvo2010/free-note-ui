import { ActionType, DraftAction } from "apis/DraftAction";
import { ShapeSerializer } from "core/ShapeSerializer";
import {
  WebSocketConnection,
  generateUUID,
} from "apis/resources/connection/SocketConnection";
import { Shape } from "types/shape/Shape";
import { RequestType } from "./protocol";

type DraftEntity = { draftId?: string; draftName?: string };

export class ShapeEventDispatcher {
  constructor(
    private socket: WebSocketConnection,
    private draftEntities: DraftEntity
  ) {}

  public setDraft(entities: DraftEntity) {
    this.draftEntities = entities;
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

  finalizeShape(id: string) {
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "finalize", id },
    };
    this.sendOne(action);
  }

  private sendOne(action: DraftAction) {
    const wireMessage = {
      messageId: generateUUID(),
      payload: {
        draftId: this.draftEntities.draftId,
        draftName: this.draftEntities.draftName,
        requestType: RequestType.DATA,
        content: {
          type: action.type,
          details: action.data,
        },
      },
    } as const;
    this.socket.sendAction(JSON.stringify(wireMessage));
  }
}
