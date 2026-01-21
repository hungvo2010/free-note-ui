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
  // New schema: direct properties draftId, requestType, data.shapes
  const requestType = jsonData?.requestType;
  const shapes = jsonData?.data?.shapes;
  
  if (requestType === undefined) {
    // Fallback to old schema format
    const content = jsonData?.payload?.data;
    if (!content) return undefined;
    return { type: content.type, data: content.details } as DraftAction;
  }
  
  // Map new requestType to ActionType
  let actionType = ActionType.INVALID;
  if (requestType === 2 || requestType === 3) { // ADD or UPDATE
    actionType = ActionType.UPDATE;
  }
  
  return { 
    type: actionType, 
    data: { shapes: shapes || [] } 
  } as DraftAction;
}
