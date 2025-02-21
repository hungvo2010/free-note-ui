import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { toVirtualX, toVirtualY } from "utils/CommonUtils";
import { Shape } from "./Shape";

export class Line implements Shape {
  private drawable: Drawable | undefined;
  public x2: number = 0;
  public y2: number = 0;
  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public x1: number,
    public y1: number
  ) {}

  toVirtualCoordinates(offsetX: number, offsetY: number): Shape {
    const newLine = new Line(this.roughCanvas, this.x1, this.y1);
    newLine.x2 = this.x2;
    newLine.y2 = this.y2;
    return newLine;
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
    if (!this.x2 || !this.y2) {
      return;
    }
    if (this.drawable && offsetX === 0 && offsetY === 0) {
      this.roughCanvas?.draw(this.drawable);
      return;
    }
    this.drawable = this.roughCanvas?.line(
      toVirtualX(this.x1, offsetX, 1),
      toVirtualY(this.y1, offsetY, 1),
      toVirtualX(this.x2 || 0, offsetX, 1),
      toVirtualY(this.y2 || 0, offsetY, 1),
      {
        roughness: 3,
        seed: 1,
        stroke: "black",
        strokeWidth: 1,
      }
    );
  }
}
