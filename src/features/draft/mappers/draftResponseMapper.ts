import { DraftResponseData } from "@features/draft/api/protocol";
import { ShapeSerialization } from "@shared/lib/serialization/ShapeSerializer";
import { Shape } from "@shared/types/shapes/Shape";

export function shapesFromResponseData(
  draftResponse: DraftResponseData | undefined,
): Shape[] {
  if (!draftResponse?.data?.shapes) {
    return [];
  }
  return ShapeSerialization.deserialize(draftResponse.data);
}

export function parseDraftResponseData(
  jsonData: Record<string, any>,
): DraftResponseData | undefined {
  const requestType = jsonData?.requestType;
  const shapes = jsonData?.data?.shapes;

  return {
    draftId: jsonData?.draftId,
    draftName: jsonData?.draftName,
    requestType,
    data: { shapes: shapes || [] },
  };
}
