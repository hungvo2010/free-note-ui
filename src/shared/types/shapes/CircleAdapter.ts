import { RoughCanvas } from "roughjs/bin/canvas";
import { distance } from "@shared/utils/geometry/GeometryUtils";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";
import { SerializedShape } from "@shared/lib/serialization/ShapeSerializer";

export class CircleAdapter extends Shape {
  checkReUsedDrawable(offsetX: number, offsetY: number): boolean {
    const result = Object.is(this.roughCanvas, this.circle.getRoughCanvas());
    if (result) {
      this.circle.drawCircle();
    }
    return result;
  }
  drawFreshShape(offsetX: number, offsetY: number): void {
    const newCircle = new Circle(
      this.roughCanvas,
      this.circle.getX + offsetX,
      this.circle.getY + offsetY,
      this.circle.getRadius
    );
    newCircle.drawCircle();
  }
  updateRadius(radius: number) {
    this.circle.setRadius(radius);
  }
  private circle: Circle;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    circle: Circle,
    private readonly id: number
  ) {
    super(roughCanvas, String(id));
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

  drawInVirtualCoordinates(offsetX: number, offsetY: number): void {
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
      this.id
    );
  }

  getCenterPoint(): { x: number; y: number } {
    return this.circle.getCenterPoint();
  }
  getRadius(): number {
    return this.circle.getRadius;
  }

  serialize(): SerializedShape {
    const center = this.circle.getCenterPoint();
    return {
      type: "circle",
      data: {
        id: this.getId(),
        x: center.x,
        y: center.y,
        radius: this.getRadius(),
      },
    };
  }
}
