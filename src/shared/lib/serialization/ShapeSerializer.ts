import { Shape } from "@shared/types/shapes/Shape";
import { jsonToShapes } from "./JsonToShape";
import { LegacyShapeJson, ShapeJson, shapeToJson } from "./ShapeToJson";

// Re-export types for backward compatibility
export type SerializedShape = ShapeJson | LegacyShapeJson;
export const ShapeSerialization = {
  serialize(shape: Shape): ShapeJson {
    return shapeToJson(shape);
  },

  deserialize(serializedShape: Record<string, any>): Shape[] {
    // New schema: expecting { shapes: [{ shapeId, type, content }] }
    if (Array.isArray(serializedShape.shapes)) {
      return jsonToShapes(serializedShape.shapes);
    }
    return [];
  },
};
