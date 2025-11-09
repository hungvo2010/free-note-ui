import { SerializedShape } from "core/ShapeSerializer";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { UpdateState } from "types/Observer";
import { drawLine } from "utils/CommonUtils";
import { distanceToLine } from "utils/GeometryUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export default class Arrow extends Shape {
  checkReUsedDrawable(offsetX: number, offsetY: number): boolean {
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
      return true;
    }
    if (!this.x1 || !this.y1 || !this.x2 || !this.y2) {
      return true;
    }
    return false;
  }

  public update(state: UpdateState): void {
    super.update(state);
    this.mainDrawable = undefined;
    this.leftDrawable = undefined;
    this.rightDrawable = undefined;
  }

  private mainDrawable: Drawable | undefined;
  private leftDrawable: Drawable | undefined;
  private rightDrawable: Drawable | undefined;
  public x2: number = 0;
  public y2: number = 0;

  constructor(
    roughCanvas: RoughCanvas | undefined,
    public x1: number,
    public y1: number,
    id?: string
  ) {
    super(roughCanvas, id);
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
    const dToLine = distanceToLine(
      x,
      y,
      [this.x1, this.y1],
      [this.x2, this.y2]
    );
    return dToLine <= 4;
  }

  toVirtualCoordinates(offsetX: number, offsetY: number): void {
    this.x1 += offsetX;
    this.y1 += offsetY;
    this.x2 += offsetX;
    this.y2 += offsetY;
    this.mainDrawable = undefined;
    this.leftDrawable = undefined;
    this.rightDrawable = undefined;
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
    const newArrow = new Arrow(
      this.roughCanvas,
      this.x1,
      this.y1,
      this.getId()
    );
    newArrow.x2 = x;
    newArrow.y2 = y;
    return newArrow;
  }

  drawNew(offsetX: number, offsetY: number): void {
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

  serialize(): SerializedShape {
    return {
      type: "arrow",
      data: {
        id: this.getId(),
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
      },
    };
  }
}
