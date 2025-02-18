import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { drawLine, toVirtualX, toVirtualY } from "utils/CommonUtils";
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
    public y1: number,
    private offsetX: number,
    private offsetY: number
  ) { }

  toVirtualCoordinates(offsetX: number, offsetY: number): Shape {
    var newArrow = new Arrow(
      this.roughCanvas,
      this.x1,
      this.y1,
      offsetX,
      offsetY
    );
    newArrow.x2 = this.x2;
    newArrow.y2 = this.y2;
    return newArrow;
  }

  applyNewCoordinates(offsetX: number, offsetY: number): Shape {
    var newArrow = new Arrow(
      this.roughCanvas,
      toVirtualX(this.x1, this.offsetX, 1),
      toVirtualY(this.y1, this.offsetY, 1),
      0,
      0
    );
    newArrow.x2 = toVirtualX(this.x2 || 0, this.offsetX, 1);
    newArrow.y2 = toVirtualY(this.y2 || 0, this.offsetY, 1);
    return newArrow;
  }

  clone(x: number, y: number): Shape {
    const newArrow = new Arrow(
      this.roughCanvas,
      this.x1,
      this.y1,
      this.offsetX,
      this.offsetY
    );
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
      toVirtualX(this.x1, this.offsetX, 1),
      toVirtualY(this.y1, this.offsetY, 1),
      toVirtualX(this.x2 || 0, this.offsetX, 1),
      toVirtualY(this.y2 || 0, this.offsetY, 1)
    );
    // if (distance(this.x1, this.y1, this.x2, this.y2) < 20) return;

    const headLength = 15;
    const angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    this.leftDrawable = drawLine(
      this.roughCanvas,
      toVirtualX(this.x2, this.offsetX, 1),
      toVirtualY(this.y2, this.offsetY, 1),
      toVirtualX(this.x2, this.offsetX, 1) - headLength * Math.cos(angle - Math.PI / 6),
      toVirtualY(this.y2, this.offsetY, 1) - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.rightDrawable = drawLine(
      this.roughCanvas,
      toVirtualX(this.x2, this.offsetX, 1),
      toVirtualY(this.y2, this.offsetY, 1),
      toVirtualX(this.x2, this.offsetX, 1) - headLength * Math.cos(angle + Math.PI / 6),
      toVirtualY(this.y2, this.offsetY, 1) - headLength * Math.sin(angle + Math.PI / 6)
    );
  }
}
