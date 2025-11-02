import { Shape } from "types/shape/Shape";
import { CircleAdapter } from "types/shape/CircleAdapter";
import { RectangleAdapter } from "types/shape/RectangleAdapter";
import { Line } from "types/shape/Line";
import { FreeStyleShape } from "types/shape/FreeStyleShape";
import { TextShape } from "types/shape/Text";
import Arrow from "types/shape/Arrow";
import { Diamond } from "types/shape/Diamond";

export type SerializedShape = {
  type: string;
  data: Record<string, any>;
};

export const ShapeSerializer = {
  serialize(shape: Shape): SerializedShape {
    if (shape instanceof CircleAdapter) {
      const center = shape.getCenterPoint();
      return {
        type: "circle",
        data: { id: shape.getId(), x: center.x, y: center.y, radius: shape.getRadius() },
      };
    }
    if (shape instanceof RectangleAdapter) {
      const start = shape.getStartPoint();
      const size = shape.getSize();
      return {
        type: "rectangle",
        data: { id: shape.getId(), x: start.x, y: start.y, width: size.width, height: size.height },
      };
    }
    if (shape instanceof Line) {
      return {
        type: "line",
        data: { id: shape.getId(), x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 },
      };
    }
    if (shape instanceof Arrow) {
      return {
        type: "arrow",
        data: { id: shape.getId(), x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 },
      };
    }
    if (shape instanceof Diamond) {
      return {
        type: "diamond",
        data: { id: shape.getId(), x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 },
      };
    }
    if (shape instanceof FreeStyleShape) {
      return {
        type: "freestyle",
        data: { id: shape.getId(), points: shape.points },
      };
    }
    if (shape instanceof TextShape) {
      const pos = shape.getPosition();
      return {
        type: "text",
        data: { id: shape.getId(), x: pos.x, y: pos.y, text: shape.getText() },
      };
    }
    return { type: "unknown", data: {} };
  },
};
