import type React from "react";
import { ShapeEventDispatcher } from "apis/resources/ShapeEventDispatcher";
import { DispatcherApi, Point } from "./types";

export function createDispatcherApi(
  dispatcherRef: React.MutableRefObject<ShapeEventDispatcher | null>,
): DispatcherApi {
  return {
    ensureDraft: () => {
      // no-op here; hook will set draft on the underlying dispatcher
    },
    addShape: (shape) => dispatcherRef.current?.addShape(shape),
    updateShape: (id, shape) => dispatcherRef.current?.updateShape(id, shape),
    finalizeShape: (id) => dispatcherRef.current?.finalizeShape(id),
    deleteShapes: (ids) => dispatcherRef.current?.deleteShapes(ids),
    pan: (offset: Point) => dispatcherRef.current?.pan(offset),
  };
}

