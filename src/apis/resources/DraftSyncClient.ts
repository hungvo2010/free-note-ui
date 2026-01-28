import {
  WebSocketConnection
} from "apis/resources/connection/WebSocketConnection";
import { ShapeSerialization } from "core/ShapeSerializer";
import { DraftEntity, ShapeData } from "hooks/whiteboard/types";
import { Shape } from "types/shape/Shape";
import { AccumulatorThrottle, KeyedThrottle, Throttle } from "utils/Throttle";
import { DraftRequestData, RequestType } from "./protocol";

const THROTTLE_MS = 200; // Centralized throttle control for all updates

export class DraftSyncClient {
  private updateThrottle: KeyedThrottle<string, Shape>;
  private deleteThrottle: Throttle<string>;
  private panThrottle: AccumulatorThrottle<{ x: number; y: number }>;

  constructor(
    private socket: WebSocketConnection,
    private currentDraft: DraftEntity,
  ) {
    // Initialize throttles with flush callbacks
    this.updateThrottle = new KeyedThrottle(
      THROTTLE_MS,
      (shapes) => this.flushUpdateShapes(shapes)
    );

    this.deleteThrottle = new Throttle(
      THROTTLE_MS,
      (ids) => this.flushDeleteShapes(ids)
    );

    this.panThrottle = new AccumulatorThrottle(
      2000,
      (offset) => this.flushPan(offset),
      (current, next) => ({
        x: (current?.x || 0) + next.x,
        y: (current?.y || 0) + next.y,
      })
    );
  }

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
    this.updateThrottle.set(id, patch);
  }

  private flushUpdateShapes(shapes: Map<string, Shape>) {
    const serializedShapes = Array.from(shapes.values()).map((shape) =>
      ShapeSerialization.serialize(shape)
    );

    const wireMessage: DraftRequestData = {
      draftId: this.currentDraft.draftId,
      draftName: this.currentDraft.draftName,
      requestType: RequestType.UPDATE,
      content: {
        shapes: serializedShapes,
      },
    };

    console.log("Send message via WebSocket: " + JSON.stringify(wireMessage));
    this.socket.sendAction(JSON.stringify(wireMessage));
  }

  pan(offset: { x: number; y: number }) {
    this.panThrottle.add(offset);
  }

  private flushPan(_offset: { x: number; y: number }) {
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
    ids.forEach((id) => this.deleteThrottle.add(id));
  }

  private flushDeleteShapes(ids: string[]) {
    const shapes: ShapeData[] = ids.map((id) => ({
      shapeId: id,
    }));

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
