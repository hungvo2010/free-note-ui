import { RoughCanvas } from "roughjs/bin/canvas";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class RectangleAdapter implements Shape {
  private readonly roughCanvas: RoughCanvas | undefined;
  private readonly rectangle: Rectangle;
  constructor(roughCanvas: RoughCanvas | undefined, rectangle: Rectangle, private readonly id: number) {
    this.roughCanvas = roughCanvas;
    this.rectangle = rectangle;
  }
  clone(x: number, y: number): Shape {
    return new RectangleAdapter(
      this.roughCanvas,
      new Rectangle(
        this.roughCanvas,
        this.rectangle.getStartPoint().x,
        this.rectangle.getStartPoint().y,
        x - this.rectangle.getStartPoint().x,
        y - this.rectangle.getStartPoint().y
      ), this.id);
  }

  draw(): void {
    this.rectangle.drawRectangle();
  }

  getStartPoint(): { x: number; y: number } {
    return this.rectangle.getStartPoint();
  }
}
