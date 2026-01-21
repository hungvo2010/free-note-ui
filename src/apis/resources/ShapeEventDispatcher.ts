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
    const wireMessage = {
      draftId: this.currentDraft.draftId,
      draftName: this.currentDraft.draftName,
      requestType: RequestType.ADD,
      content: {
        shapes: [payload],
      },
    };
    console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
    this.socket.sendAction(JSON.stringify(wireMessage));
  }

  updateShape(id: string, patch: Shape) {
    const payload = ShapeSerialization.serialize(patch);
    const wireMessage = {
      draftId: this.currentDraft.draftId,
      draftName: this.currentDraft.draftName,
      requestType: RequestType.UPDATE,
      content: {
        shapes: [payload],
      },
    };
    console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
    this.socket.sendAction(JSON.stringify(wireMessage));
  }

  pan(offset: { x: number; y: number }) {
    // Pan is not part of the new schema, keeping for backward compatibility
    const action: DraftAction = {
      type: ActionType.UPDATE,
      data: { op: "pan", offset },
    };
    this.sendOne(action, RequestType.NOOP);
  }

  deleteShapes(ids: string[]) {
    const shapes = ids.map(id => ({ shapeId: id }));
    const wireMessage = {
      draftId: this.currentDraft.draftId,
      draftName: this.currentDraft.draftName,
      requestType: RequestType.REMOVE,
      content: {
        shapes,
      },
    };
    console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
    this.socket.sendAction(JSON.stringify(wireMessage));
  }

  creatingDraft() {
    const wireMessage = {
      draftId: this.currentDraft.draftId,
      draftName: this.currentDraft.draftName,
      requestType: RequestType.CONNECT,
      content: {
        shapes: [],
      },
    };
    console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
    this.socket.sendAction(JSON.stringify(wireMessage));
  }

  finalizeShape(id: string) {
    // Finalize is not explicitly in the new schema, treating as UPDATE
    const wireMessage = {
      draftId: this.currentDraft.draftId,
      draftName: this.currentDraft.draftName,
      requestType: RequestType.UPDATE,
      content: {
        shapes: [{ shapeId: id }],
      },
    };
    console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
    this.socket.sendAction(JSON.stringify(wireMessage));
  }

  private sendOne(
    action: DraftAction,
    requestType: RequestType = RequestType.NOOP
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
