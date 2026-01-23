import {
  WebSocketConnection
} from "apis/resources/connection/WebSocketConnection";
import { ShapeSerialization } from "core/ShapeSerializer";
import { DraftEntity, ShapeData } from "hooks/whiteboard/types";
import { Shape } from "types/shape/Shape";
import { DraftRequestData, RequestType } from "./protocol";

export class DraftSyncClient {
  constructor(
    private socket: WebSocketConnection,
    private currentDraft: DraftEntity,
  ) {}

  public setDraft(draft: DraftEntity) {
    this.currentDraft = draft;
    this.creatingDraft();
  }

  // shapeData should be a serializable description of the shape
  addShape(shapeData: Shape) {
    const payload = ShapeSerialization.serialize(shapeData);
    const wireMessage: DraftRequestData = {
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
    const wireMessage: DraftRequestData = {
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
    // Pan is not part of the new schema, using NOOP for backward compatibility
    const wireMessage: DraftRequestData = {
      draftId: this.currentDraft.draftId,
      draftName: this.currentDraft.draftName,
      requestType: RequestType.NOOP,
      content: {
        shapes: [],
      },
    };
    console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
    this.socket.sendAction(JSON.stringify(wireMessage));
  }

  deleteShapes(ids: string[]) {
    const shapes: ShapeData[] = ids.map((id) => ({ shapeId: id }));
    const wireMessage: DraftRequestData = {
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
    const wireMessage: DraftRequestData = {
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


}
