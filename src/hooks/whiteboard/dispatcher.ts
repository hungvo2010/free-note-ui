import { DraftSyncClient } from "apis/resources/DraftSyncClient";
import { DispatcherApi, DraftEntity, Point } from "./types";

export function createDispatcherApi(
  dispatcherRef: DraftSyncClient | null,
): DispatcherApi {
  if (dispatcherRef == null) {
    return {
      ensureDraft: () => {},
      addShape: (shape) => {},
      updateShape: (id, shape) => {},
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
    deleteShapes: (ids) => dispatcherRef.deleteShapes(ids),
    pan: (offset: Point) => dispatcherRef.pan(offset),
  };
}
