import { Shape } from "types/shape/Shape";

export type SerializedShape = {
  type: string;
  data: Record<string, any>;
};

export const ShapeSerializer = {
  serialize(shape: Shape): SerializedShape {
    return shape.serialize();
  },
};
