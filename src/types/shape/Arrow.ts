import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { drawLine } from "utils/CommonUtils";
import { distance } from "utils/GeometryUtils";
import { Shape } from "./Shape";

export default class Arrow implements Shape {
  private mainDrawable: Drawable | undefined;
  private leftDrawable: Drawable | undefined;
  private rightDrawable: Drawable | undefined;
  public x2: number | undefined;
  public y2: number | undefined;

  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public x1: number,
    public y1: number
  ) {}
  applyNewCoordinates(x: number, y: number): Shape {
    throw new Error("Method not implemented.");
  }
  clone(x: number, y: number): Shape {
    const newArrow = new Arrow(this.roughCanvas, this.x1, this.y1);
    newArrow.x2 = x;
    newArrow.y2 = y;
    return newArrow;
  }

  draw(): void {
    if (this.mainDrawable && this.leftDrawable && this.rightDrawable) {
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
      this.x1,
      this.y1,
      this.x2,
      this.y2
    );
    if (distance(this.x1, this.y1, this.x2, this.y2) < 20) return;

    const headLength = 15;
    const angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    this.leftDrawable = drawLine(
      this.roughCanvas,
      this.x2,
      this.y2,
      this.x2 - headLength * Math.cos(angle - Math.PI / 6),
      this.y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.rightDrawable = drawLine(
      this.roughCanvas,
      this.x2,
      this.y2,
      this.x2 - headLength * Math.cos(angle + Math.PI / 6),
      this.y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
  }
}
