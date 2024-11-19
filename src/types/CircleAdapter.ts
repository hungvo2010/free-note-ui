import { Circle } from "./Circle";
import { Shape } from "./Shape";

export class CircleAdapter implements Shape {
  private readonly circle: Circle;
  constructor(circle: Circle) {
    this.circle = circle;
  }
  draw(): void {
    this.circle.drawCircle();
  }
}
