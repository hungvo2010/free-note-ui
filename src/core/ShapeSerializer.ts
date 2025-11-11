import { Shape } from "types/shape/Shape";
import { ShapeFactory } from "utils/ShapeFactory";

export type SerializedShape = {
  type: string;
  data: Record<string, any>;
};

export const ShapeSerialization = {
  serialize(shape: Shape): SerializedShape {
    return shape.serialize();
  },

  deserialize(serializedShape: Record<string, any>): Shape[] {
    return []
  },
};
