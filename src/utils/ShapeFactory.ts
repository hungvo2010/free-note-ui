import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "types/shape/Shape";
import { Rectangle } from "types/shape/Rectangle";
import { RectangleAdapter } from "types/shape/RectangleAdapter";
import { Circle } from "types/shape/Circle";
import { CircleAdapter } from "types/shape/CircleAdapter";
import Arrow from "types/shape/Arrow";
import { Line } from "types/shape/Line";
import { FreeStyleShape } from "types/shape/FreeStyleShape";
import { Diamond } from "types/shape/Diamond";

export class ShapeFactory {
  static createShape(
    type: string,
    roughCanvas: RoughCanvas | undefined,
    x: number,
    y: number
  ): Shape | undefined {
    switch (type) {
      case "rect":
        return new RectangleAdapter(
          roughCanvas,
          new Rectangle(roughCanvas, x, y, 0, 0),
          new Date().getMilliseconds()
        );
      case "circle":
        return new CircleAdapter(
          roughCanvas,
          new Circle(roughCanvas, x, y, 0),
          new Date().getMilliseconds()
        );
      case "arrow":
        return new Arrow(roughCanvas, x, y);
      case "line":
        return new Line(roughCanvas, x, y);
      case "pen":
        return new FreeStyleShape(roughCanvas, [[x, y]]);
      case "diam":
        return new Diamond(roughCanvas, x, y);
      default:
        return undefined;
    }
  }
}
