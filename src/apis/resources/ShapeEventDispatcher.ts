import {
  WebSocketConnection,
  generateUUID,
} from "apis/resources/connection/SocketConnection";
import { ShapeSerialization } from "core/ShapeSerializer";
import { Shape } from "types/shape/Shape";
import { RequestType } from "./protocol";
import { ActionType, DraftAction, DraftEntity } from "hooks/whiteboard/types";

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
  addShape(shapeData: Shape) {
    const payload = ShapeSerialization.serialize(shapeData);
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "add", shape: payload },
    };
    this.sendOne(action);
  }

  updateShape(id: string, patch: Shape) {
    const payload = ShapeSerialization.serialize(patch);
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
      draftId: this.currentDraft.draftId,
      draftName: this.currentDraft.draftName,
      requestType,
      content: {
        type: action.type,
        details: action.data,
      },
    } as const;
    console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
    this.socket.sendAction(JSON.stringify(wireMessage));
  }
}
