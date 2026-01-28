import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "@shared/types/shapes/Shape";
import { Rectangle } from "@shared/types/shapes/Rectangle";
import { RectangleAdapter } from "@shared/types/shapes/RectangleAdapter";
import { Circle } from "@shared/types/shapes/Circle";
import { CircleAdapter } from "@shared/types/shapes/CircleAdapter";
import Arrow from "@shared/types/shapes/Arrow";
import { Line } from "@shared/types/shapes/Line";
import { FreeStyleShape } from "@shared/types/shapes/FreeStyleShape";
import { Diamond } from "@shared/types/shapes/Diamond";

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
