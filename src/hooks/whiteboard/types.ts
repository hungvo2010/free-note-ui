import { ReDrawController } from "main/ReDrawController";
import type React from "react";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "types/shape/Shape";

export type Point = { x: number; y: number };

export type Tool = {
  onDown: (pos: Point) => void;
  onMove: (pos: Point) => void;
  onUp: (pos: Point) => void;
};

export type InteractionRefs = {
  drawingRef: React.MutableRefObject<boolean>;
  positionRef: React.MutableRefObject<Point>;
  dragStartPosRef: React.MutableRefObject<Point>;
  moveBoardRef: React.MutableRefObject<boolean>;
  eraserModeRef: React.MutableRefObject<boolean>;
  eraserSizeRef: React.MutableRefObject<number>;
  eraserCursorTimeoutRef: React.MutableRefObject<number | null>;
  isDraggingShapeRef: React.MutableRefObject<boolean>;
  isEditingTextRef: React.MutableRefObject<boolean>;
};

export type DispatcherApi = {
  ensureDraft: (draftEntity: DraftEntity) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, shape: Shape) => void;
  finalizeShape: (id: string) => void;
  deleteShapes: (ids: string[]) => void;
  pan: (offset: Point) => void;
};

export type ToolDeps = {
  canvas: HTMLCanvasElement | undefined;
  roughCanvas: RoughCanvas | undefined;
  reDrawController: ReDrawController;
  setSelectedShape: (shape: Shape | undefined) => void;
  getSelectedShape: () => Shape | undefined;
  dispatcher: DispatcherApi;
  refs: InteractionRefs;
};

export type DraftEntity = { draftId?: string; draftName?: string };

// Schema-aligned types from AsyncAPI registry
export type ShapeData = {
  shapeId: string;
  type?: string;
  content?: Record<string, any>;
};

export type DraftRequestData = {
  draftId?: string;
  draftName?: string;
  requestType: number; // 0=INIT, 1=CONNECT, 2=ADD, 3=UPDATE, 4=REMOVE, 5=NOOP
  content?: {
    shapes?: ShapeData[];
  };
};

export type DraftResponseData = {
  draftId?: string;
  draftName?: string;
  requestType?: number; // 0=INIT, 1=CONNECT, 2=ADD, 3=UPDATE, 4=REMOVE, 5=NOOP
  data?: {
    shapes?: ShapeData[];
  };
};
