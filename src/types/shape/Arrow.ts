import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { drawLine } from "utils/CommonUtils";
import { Shape } from "./Shape";
import { Rectangle } from "./Rectangle";

export default class Arrow implements Shape {
  private mainDrawable: Drawable | undefined;
  private leftDrawable: Drawable | undefined;
  private rightDrawable: Drawable | undefined;
  public x2: number = 0;
  public y2: number = 0;

  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public x1: number,
    public y1: number
  ) {}
  getBoundingRect(): Rectangle {
    throw new Error("Method not implemented.");
  }
  isPointInShape(x: number, y: number): boolean {
    throw new Error("Method not implemented.");
  }

  toVirtualCoordinates(offsetX: number, offsetY: number): Shape {
    const newArrow = new Arrow(this.roughCanvas, this.x1, this.y1);
    newArrow.x2 = this.x2;
    newArrow.y2 = this.y2;
    return newArrow;
  }

  applyNewCoordinates(offsetX: number, offsetY: number): Shape {
    const newArrow = new Arrow(
      this.roughCanvas,
      this.x1 + offsetX,
      this.y1 + offsetY
    );
    newArrow.x2 = this.x2 + offsetX;
    newArrow.y2 = this.y2 + offsetY;
    return newArrow;
  }

  clone(x: number, y: number): Shape {
    const newArrow = new Arrow(this.roughCanvas, this.x1, this.y1);
    newArrow.x2 = x;
    newArrow.y2 = y;
    return newArrow;
  }

  draw(offsetX: number, offsetY: number): void {
    if (
      this.mainDrawable &&
      this.leftDrawable &&
      this.rightDrawable &&
      offsetX === 0 &&
      offsetY === 0
    ) {
      this.roughCanvas?.draw(this.mainDrawable);
      this.roughCanvas?.draw(this.leftDrawable);
      this.roughCanvas?.draw(this.rightDrawable);
      return;
    }
    if (!this.x1 || !this.y1 || !this.x2 || !this.y2) {
      return;
    }
    this.mainDrawable = drawLine(
      this.roughCanvas,
      this.x1 + offsetX,
      this.y1 + offsetY,
      this.x2 + offsetX,
      this.y2 + offsetY
    );
    // if (distance(this.x1, this.y1, this.x2, this.y2) < 20) return;

    const headLength = 15;
    const angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    this.leftDrawable = drawLine(
      this.roughCanvas,
      this.x2 + offsetX,
      this.y2 + offsetY,
      this.x2 + offsetX - headLength * Math.cos(angle - Math.PI / 6),
      this.y2 + offsetY - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.rightDrawable = drawLine(
      this.roughCanvas,
      this.x2 + offsetX,
      this.y2 + offsetY,
      this.x2 + offsetX - headLength * Math.cos(angle + Math.PI / 6),
      this.y2 + offsetY - headLength * Math.sin(angle + Math.PI / 6)
    );
  }
}
