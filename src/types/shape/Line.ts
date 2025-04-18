import { Drawable } from "roughjs/bin/core";
import { toVirtualX, toVirtualY } from "utils/CommonUtils";
import { distanceToLine } from "utils/GeometryUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";
import { RoughCanvas } from "roughjs/bin/canvas";
export class Line extends Shape {
  private drawable: Drawable | undefined;
  public x2: number = 0;
  public y2: number = 0;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    public x1: number,
    public y1: number
  ) {
    super(roughCanvas);
  }
  getBoundingRect(): Rectangle {
    return new Rectangle(
      this.roughCanvas,
      this.x1,
      this.y1,
      this.x2 - this.x1,
      this.y2 - this.y1
    );
  }
  isPointInShape(x: number, y: number): boolean {
    return distanceToLine(x, y, [this.x1, this.y1], [this.x2, this.y2]) <= 4;
  }

  toVirtualCoordinates(offsetX: number, offsetY: number): void {
    this.x1 += offsetX;
    this.y1 += offsetY;
    this.x2 += offsetX;
    this.y2 += offsetY;
    this.drawable = undefined;
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    const newLine = new Line(
      this.roughCanvas,
      this.x1 + changeX,
      this.y1 + changeY
    );
    newLine.x2 = this.x2 + changeX;
    newLine.y2 = this.y2 + changeY;
    return newLine;
  }

  clone(x: number, y: number): Shape {
    const newLine = new Line(this.roughCanvas, this.x1, this.y1);
    newLine.x2 = x;
    newLine.y2 = y;
    return newLine;
  }

  draw(offsetX: number, offsetY: number): void {
    // if (!this.x2 || !this.y2) {
    //   return;
    // }
    // if (this.drawable && offsetX === 0 && offsetY === 0) {
    //   this.roughCanvas?.draw(this.drawable);
    //   return;
    // }
    this.drawable = this.roughCanvas?.line(
      toVirtualX(this.x1, offsetX, 1),
      toVirtualY(this.y1, offsetY, 1),
      toVirtualX(this.x2 || 0, offsetX, 1),
      toVirtualY(this.y2 || 0, offsetY, 1),
      {
        roughness: 3,
        seed: 1,
        strokeWidth: 1,
      }
    );
  }
}
