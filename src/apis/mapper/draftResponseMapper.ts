import { DraftResponseData } from "apis/resources/protocol";
import { ShapeSerialization } from "core/ShapeSerializer";
import { Shape } from "types/shape/Shape";

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
