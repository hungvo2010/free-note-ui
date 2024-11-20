import { Circle } from "./Circle";
import { Shape } from "./Shape";

export class CircleAdapter implements Shape {
  private readonly circle: Circle;
  constructor(circle: Circle, private readonly id: number) {
    this.circle = circle;
  }
  draw(): void {
    this.circle.drawCircle();
  }
  getCenterPoint(): { x: number; y: number } {
    return this.circle.getCenterPoint();
  }
}
