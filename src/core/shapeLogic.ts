import { ActionType, DraftAction } from "hooks/whiteboard/types";
import { Shape } from "types/shape/Shape";
import { ShapeSerialization } from "core/ShapeSerializer";

export function getShapesToUpdate(
  draftAction: DraftAction | undefined
): Shape[] {
  if (draftAction?.type !== ActionType.UPDATE) {
    return [];
  }
  const draftData = draftAction.data;
  return ShapeSerialization.deserialize(draftData);
}

export function parseDraftAction(
  jsonData: Record<string, any>
): DraftAction | undefined {
  const content = jsonData?.payload?.data;
  if (!content) return undefined;
  return { type: content.type, data: content.details } as DraftAction;
}
