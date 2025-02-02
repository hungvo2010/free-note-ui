import { RoughCanvas } from "roughjs/bin/canvas";
import { distance } from "utils/GeometryUtils";
import { Circle } from "./Circle";
import { Shape } from "./Shape";

export class CircleAdapter implements Shape {
  private readonly circle: Circle;
  private roughCanvas: RoughCanvas | undefined;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    circle: Circle,
    private readonly id: number
  ) {
    this.circle = circle;
    this.roughCanvas = roughCanvas;
    this.id = id;
  }
  applyNewCoordinates(x: number, y: number): Shape {
    throw new Error("Method not implemented.");
  }
  clone(x: number, y: number): Shape {
    console.log(this.id);
    return new CircleAdapter(
      this.roughCanvas,
      new Circle(
        this.roughCanvas,
        (this.circle.x1 + x) / 2,
        (this.circle.y1 + y) / 2,
        this.circle.x1,
        this.circle.y1,
        distance(x, y, this.circle.x1, this.circle.y1) / 2
      ),
      new Date().getMilliseconds()
    );
  }
  draw(): void {
    this.circle.drawCircle();
  }
  getCenterPoint(): { x: number; y: number } {
    return this.circle.getCenterPoint();
  }
}
