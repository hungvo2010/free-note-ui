import type React from "react";

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
  ensureDraft: () => void;
  addShape: (shape: any) => void;
  updateShape: (id: string, shape: any) => void;
  finalizeShape: (id: string) => void;
  deleteShapes: (ids: string[]) => void;
  pan: (offset: Point) => void;
};

export type ToolDeps = {
  canvas: HTMLCanvasElement | undefined;
  roughCanvas: any;
  reDrawController: any;
  shapes: React.MutableRefObject<any[]>;
  theme: string | undefined;
  setSelectedShape: (shape: any | null) => void;
  getSelectedShape: () => any | null;
  dispatcher: DispatcherApi;
  refs: InteractionRefs;
};
