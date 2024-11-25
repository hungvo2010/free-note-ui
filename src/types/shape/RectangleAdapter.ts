import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class RectangleAdapter implements Shape {
  private readonly rectangle: Rectangle;
  constructor(rectangle: Rectangle, private readonly id: number) {
    this.rectangle = rectangle;
  }

  draw(): void {
    this.rectangle.drawRectangle();
  }

  getStartPoint(): { x: number; y: number } {
    return this.rectangle.getStartPoint();
  }
}
