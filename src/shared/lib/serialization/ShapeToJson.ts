import { Shape } from "@shared/types/shapes/Shape";

/**
 * New schema format for WebSocket messages
 */
export type ShapeJson = {
  shapeId: string;
  type: string;
  content: Record<string, any>;
};

/**
 * Legacy format used internally by shape classes
 */
export type LegacyShapeJson = {
  type: string;
  data: Record<string, any>;
};

/**
 * Converts a Shape object to the new JSON schema format
 */
export function shapeToJson(shape: Shape): ShapeJson {
  const legacy = shape.serialize() as LegacyShapeJson;
  
  return {
    shapeId: String(legacy.data.id),
    type: legacy.type,
    content: legacy.data,
  };
}

/**
 * Converts multiple Shape objects to JSON array
 */
export function shapesToJson(shapes: Shape[]): ShapeJson[] {
  return shapes.map(shapeToJson);
}
