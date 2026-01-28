import { DraftSyncClient } from "apis/resources/DraftSyncClient";
import { DispatcherApi, DraftEntity, Point } from "./types";

export function createDispatcherApi(
  dispatcher: DraftSyncClient | null,
): DispatcherApi {
  if (dispatcher == null) {
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
      dispatcher.setDraft(draftEntity);
    },
    addShape: (shape) => dispatcher.addShape(shape),
    updateShape: (id, shape) => dispatcher.updateShape(id, shape),
    deleteShapes: (ids) => dispatcher.deleteShapes(ids),
    pan: (offset: Point) => dispatcher.pan(offset),
  };
}
