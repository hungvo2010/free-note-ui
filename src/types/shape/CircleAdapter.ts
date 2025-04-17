import { RoughCanvas } from "roughjs/bin/canvas";
import { distance } from "utils/GeometryUtils";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class CircleAdapter extends Shape {
  updateRadius(radius: number) {
    this.circle.setRadius(radius);
  }
  private circle: Circle;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    circle: Circle,
    private readonly id: number
  ) {
    super(roughCanvas);
    this.circle = circle;
    this.id = id;
  }
  getBoundingRect(): Rectangle {
    return new Rectangle(
      this.roughCanvas,
      this.circle.getX - this.circle.getRadius,
      this.circle.getY - this.circle.getRadius,
      this.circle.getRadius * 2,
      this.circle.getRadius * 2
    );
  }

  isPointInShape(x: number, y: number): boolean {
    const center = this.circle.getCenterPoint();
    const distanceFromCenter = distance(x, y, center.x, center.y);
    return Math.abs(distanceFromCenter - this.circle.getRadius) <= 4;
  }

  toVirtualCoordinates(offsetX: number, offsetY: number): void {
    this.circle = new Circle(
      this.roughCanvas,
      this.circle.getX + offsetX,
      this.circle.getY + offsetY,
      this.circle.getRadius
    );
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    const newCircle = new Circle(
      this.roughCanvas,
      this.circle.getX + changeX,
      this.circle.getY + changeY,
      this.circle.getRadius
    );
    return new CircleAdapter(this.roughCanvas, newCircle, this.id);
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
      new Date().getMilliseconds()
    );
  }

  draw(offsetX: number, offsetY: number): void {
    const newCircle = new Circle(
      this.roughCanvas,
      this.circle.getX + offsetX,
      this.circle.getY + offsetY,
      this.circle.getRadius
    );
    newCircle.drawCircle();
  }

  getCenterPoint(): { x: number; y: number } {
    return this.circle.getCenterPoint();
  }
}
