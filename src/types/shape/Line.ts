import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { toVirtualX, toVirtualY } from "utils/CommonUtils";
import { Shape } from "./Shape";

export class Line implements Shape {
  private drawable: Drawable | undefined;
  public x2: number | undefined;
  public y2: number | undefined;
  constructor(
    public roughCanvas: RoughCanvas | undefined,
    private offsetX: number,
    private offsetY: number,
    public x1: number,
    public y1: number
  ) {}
  toVirtualCoordinates(offsetX: number, offsetY: number): Shape {
    const newLine = new Line(
      this.roughCanvas,
      offsetX,
      offsetY,
      this.x1,
      this.y1
    );
    newLine.x2 = this.x2;
    newLine.y2 = this.y2;
    return newLine;
  }
  applyNewCoordinates(offsetX: number, offsetY: number): Shape {
    const newLine = new Line(
      this.roughCanvas,
      0,
      0,
      toVirtualX(this.x1, this.offsetX, 1),
      toVirtualY(this.y1, this.offsetY, 1)
    );
    newLine.x2 = toVirtualX(this.x2 || 0, this.offsetX, 1);
    newLine.y2 = toVirtualY(this.y2 || 0, this.offsetY, 1);
    return newLine;
  }
  clone(x: number, y: number): Shape {
    const newLine = new Line(
      this.roughCanvas,
      this.offsetX,
      this.offsetY,
      this.x1,
      this.y1
    );
    newLine.x2 = x;
    newLine.y2 = y;
    return newLine;
  }

  draw(): void {
    if (!this.x2 || !this.y2) {
      return;
    }
    if (this.drawable) {
      this.roughCanvas?.draw(this.drawable);
      return;
    }
    this.drawable = this.roughCanvas?.line(
      toVirtualX(this.x1, this.offsetX, 1),
      toVirtualY(this.y1, this.offsetY, 1),
      toVirtualX(this.x2 || 0, this.offsetX, 1),
      toVirtualY(this.y2 || 0, this.offsetY, 1),
      {
        roughness: 3,
        seed: 1,
        stroke: "black",
        strokeWidth: 1,
      }
    );
  }
}
