import { DraftSyncClient } from "@features/draft/api/DraftSyncClient";
import { DispatcherApi, DraftEntity, Point } from "./types";

export function createDispatcherApi(
  socketClientDispatch: DraftSyncClient | null,
): DispatcherApi {
  if (socketClientDispatch == null) {
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
      socketClientDispatch.setDraft(draftEntity);
    },
    addShape: (shape) => socketClientDispatch.addShape(shape),
    updateShape: (id, shape) => socketClientDispatch.updateShape(id, shape),
    deleteShapes: (ids) => socketClientDispatch.deleteShapes(ids),
    pan: (offset: Point) => socketClientDispatch.pan(offset),
  };
}
