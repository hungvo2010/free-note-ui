import { ActionType, DraftAction } from "apis/DraftAction";
import { Draft, MessagePayload } from "apis/resources/protocol";
import { WebSocketConnection, generateUUID } from "apis/resources/WebSocketConnection";
import { Shape } from "types/shape/Shape";
import { ShapeSerializer } from "apis/resources/ShapeSerializer";

type DraftIds = { draftId?: string; draftName?: string };

export class ShapeEventDispatcher {
  constructor(private socket: WebSocketConnection, private ids: DraftIds) {}

  private send(actions: DraftAction[]) {
    const draft: Draft = {
      draftId: this.ids.draftId || "",
      draftName: this.ids.draftName || "",
      draftActions: actions,
    };
    const payload: MessagePayload = {
      messageId: generateUUID(),
      payload: JSON.stringify(draft),
    };
    this.socket.sendAction(JSON.stringify(payload));
  }

  public setDraft(ids: DraftIds) {
    this.ids = ids;
  }

  // shapeData should be a serializable description of the shape
  addShape(shapeData: Record<string, any> | Shape) {
    const payload = (shapeData as Shape).draw
      ? ShapeSerializer.serialize(shapeData as Shape)
      : { type: (shapeData as any).type, data: shapeData };
    const action: DraftAction = {
      type: ActionType.INIT,
      data: { op: "add", shape: payload },
    };
    this.send([action]);
  }

  updateShape(id: string, patch: Record<string, any> | Shape) {
    const payload = (patch as Shape).draw
      ? ShapeSerializer.serialize(patch as Shape)
      : { type: (patch as any).type, data: patch };
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "update", id, patch: payload },
    };
    this.send([action]);
  }

  pan(offset: { x: number; y: number }) {
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "pan", offset },
    };
    this.send([action]);
  }

  deleteShapes(ids: string[]) {
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "delete", ids },
    };
    this.send([action]);
  }

  finalizeShape(id: string) {
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "finalize", id },
    };
    this.send([action]);
  }
}
