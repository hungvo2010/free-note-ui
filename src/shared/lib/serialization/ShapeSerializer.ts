import { Shape } from "types/shape/Shape";
import { shapeToJson, ShapeJson, LegacyShapeJson } from "./serialization/ShapeToJson";
import { jsonToShape, jsonToShapes } from "./serialization/JsonToShape";

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

    // Legacy format support: { op: 'add', shape: {...} }
    const op = serializedShape?.op;
    if (!op) return [];

    const build = (payload: any): Shape[] => {
      if (!payload || !payload.type) return [];
      const shape = jsonToShape(payload);
      return shape ? [shape] : [];
    };

    if (op === "add") {
      return build(serializedShape.shape);
    }
    if (op === "update") {
      return build(serializedShape.patch);
    }
    if (op === "init" && Array.isArray(serializedShape.shapes)) {
      return jsonToShapes(serializedShape.shapes);
    }
    return [];
  },
};
