import { Shape } from "types/shape/Shape";
import { Rectangle } from "types/shape/Rectangle";
import { RectangleAdapter } from "types/shape/RectangleAdapter";
import { Circle } from "types/shape/Circle";
import { CircleAdapter } from "types/shape/CircleAdapter";
import Arrow from "types/shape/Arrow";
import { Line } from "types/shape/Line";
import { FreeStyleShape } from "types/shape/FreeStyleShape";
import { Diamond } from "types/shape/Diamond";
import { TextShape } from "types/shape/Text";
import { ImageShape } from "types/shape/ImageShape";

export type SerializedShape = {
  type: string;
  data: Record<string, any>;
};

export const ShapeSerialization = {
  serialize(shape: Shape): SerializedShape {
    return shape.serialize();
  },

  deserialize(serializedShape: Record<string, any>): Shape[] {
    // Expecting shape update payloads like:
    // { op: 'add', shape: { type, data } }
    // { op: 'update', id, patch: { type, data } }
    // Other ops (pan/delete/finalize/creating) yield no shapes here
    const op = serializedShape?.op;
    if (!op) return [];

    const build = (payload: SerializedShape | undefined): Shape[] => {
      if (!payload || !payload.type || !payload.data) return [];
      const shape = deserializeOne(payload);
      return shape ? [shape] : [];
    };

    if (op === "add") {
      return build(serializedShape.shape as SerializedShape);
    }
    if (op === "update") {
      return build(serializedShape.patch as SerializedShape);
    }
    // INIT could send array of shapes, support it if present
    if (op === "init" && Array.isArray(serializedShape.shapes)) {
      const shapes: Shape[] = [];
      for (const s of serializedShape.shapes) {
        const shape = deserializeOne(s as SerializedShape);
        if (shape) shapes.push(shape);
      }
      return shapes;
    }
    return [];
  },
};

function deserializeOne(serialized: SerializedShape): Shape | undefined {
  const { type, data } = serialized;
  switch (type) {
    case "rectangle": {
      const { id, x, y, width, height } = data;
      const rect = new Rectangle(undefined, x, y, width, height);
      const numId = toNumberId(id);
      return new RectangleAdapter(undefined, rect, numId);
    }
    case "circle": {
      const { id, x, y, radius } = data;
      const circle = new Circle(undefined, x, y, radius);
      const numId = toNumberId(id);
      return new CircleAdapter(undefined, circle, numId);
    }
    case "arrow": {
      const { id, x1, y1, x2, y2 } = data;
      const arrow = new Arrow(undefined, x1, y1, id);
      arrow.x2 = x2;
      arrow.y2 = y2;
      return arrow;
    }
    case "line": {
      const { id, x1, y1, x2, y2 } = data;
      const line = new Line(undefined, x1, y1, id);
      line.x2 = x2;
      line.y2 = y2;
      return line;
    }
    case "freestyle": {
      const { id, points } = data;
      return new FreeStyleShape(undefined, points as [number, number][], id);
    }
    case "diamond": {
      const { id, x1, y1, x2, y2 } = data;
      const diam = new Diamond(undefined, x1, y1, id);
      diam.x2 = x2;
      diam.y2 = y2;
      return diam;
    }
    case "text": {
      const { id, x, y, text } = data;
      return new TextShape(undefined, x, y, text, id);
    }
    case "image": {
      const { /* id, */ url, x, y, width, height } = data;
      // ImageShape constructor doesn't accept ID; merging by ID may not work for images
      return new ImageShape(undefined, url, x, y, width, height);
    }
    default:
      return undefined;
  }
}

function toNumberId(id: unknown): number {
  if (typeof id === "number") return id;
  const parsed = parseInt(String(id), 10);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}
