import { RoughCanvas } from "roughjs/bin/canvas";
import { distance } from "utils/GeometryUtils";
import { Circle } from "./Circle";
import { Shape } from "./Shape";
import { toVirtualX, toVirtualY } from "utils/CommonUtils";

export class CircleAdapter implements Shape {
  updateRadius(radius: number) {
    this.circle.setRadius(radius);
  }
  private readonly circle: Circle;
  private roughCanvas: RoughCanvas | undefined;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    circle: Circle,
    private readonly id: number,
    private offsetX: number,
    private offsetY: number
  ) {
    this.circle = circle;
    this.roughCanvas = roughCanvas;
    this.id = id;
  }

  toVirtualCoordinates(offsetX: number, offsetY: number): Shape {
    return new CircleAdapter(this.roughCanvas, this.circle, this.id, offsetX, offsetY);
  }

  applyNewCoordinates(offsetX: number, offsetY: number): Shape {
    var newCircle = new Circle(
      this.roughCanvas,
      toVirtualX(this.circle.getX, this.offsetX, 1),
      toVirtualY(this.circle.getY, this.offsetY, 1),
      this.circle.getRadius
    );
    return new CircleAdapter(this.roughCanvas, newCircle, this.id, 0, 0);
  }

  clone(x: number, y: number): Shape {
    return new CircleAdapter(
      this.roughCanvas,
      new Circle(
        this.roughCanvas,
        x,
        y,
        distance(x, y, this.circle.getX, this.circle.getY) / 2
      ),
      new Date().getMilliseconds(),
      this.offsetX,
      this.offsetY
    );
  }

  draw(): void {
    var newCircle = new Circle(
      this.roughCanvas,
      toVirtualX(this.circle.getX, this.offsetX, 1),
      toVirtualY(this.circle.getY, this.offsetY, 1),
      this.circle.getRadius
    );
    newCircle.drawCircle();
  }

  getCenterPoint(): { x: number; y: number } {
    return this.circle.getCenterPoint();
  }
}
