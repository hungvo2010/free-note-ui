import { ShapeEventDispatcher } from "apis/resources/ShapeEventDispatcher";
import { DispatcherApi, DraftEntity, Point } from "./types";

export function createDispatcherApi(
  dispatcherRef: ShapeEventDispatcher | null,
): DispatcherApi {
  if (dispatcherRef == null) {
    return {
      ensureDraft: () => {},
      addShape: (shape) => {},
      updateShape: (id, shape) => {},
      finalizeShape: (id) => {},
      deleteShapes: (ids) => {},
      pan: (offset: Point) => {},
    };
  }
  return {
    ensureDraft: (draftEntity: DraftEntity) => {
      dispatcherRef.setDraft(draftEntity);
    },
    addShape: (shape) => dispatcherRef.addShape(shape),
    updateShape: (id, shape) => dispatcherRef.updateShape(id, shape),
    finalizeShape: (id) => dispatcherRef.finalizeShape(id),
    deleteShapes: (ids) => dispatcherRef.deleteShapes(ids),
    pan: (offset: Point) => dispatcherRef.pan(offset),
  };
}
