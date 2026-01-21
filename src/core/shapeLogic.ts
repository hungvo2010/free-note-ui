import { DraftResponseData, RequestType } from "apis/resources/protocol";
import { Shape } from "types/shape/Shape";
import { ShapeSerialization } from "core/ShapeSerializer";

export function getShapesToUpdate(
  draftResponse: DraftResponseData | undefined
): Shape[] {
  if (!draftResponse?.data?.shapes) {
    return [];
  }
  return ShapeSerialization.deserialize(draftResponse.data);
}

export function parseDraftResponse(
  jsonData: Record<string, any>
): DraftResponseData | undefined {
  // New schema: direct properties draftId, requestType, data.shapes
  const requestType = jsonData?.requestType;
  const shapes = jsonData?.data?.shapes;
  
  if (requestType === undefined) {
    // Fallback to old schema format
    const content = jsonData?.payload?.data;
    if (!content) return undefined;
    
    // Convert old format to new DraftResponseData
    return {
      draftId: jsonData?.draftId,
      draftName: jsonData?.draftName,
      requestType: RequestType.UPDATE,
      data: { shapes: content.details?.shapes || [] }
    };
  }
  
  // Return properly typed DraftResponseData
  return {
    draftId: jsonData?.draftId,
    draftName: jsonData?.draftName,
    requestType,
    data: { shapes: shapes || [] }
  };
}
