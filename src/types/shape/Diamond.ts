import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { distance, isInLine } from "utils/GeometryUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";
import { UpdateState } from "types/Observer";

export class Diamond extends Shape {
  checkReUsedDrawable(offsetX: number, offsetY: number): boolean {
    if (!this.x2 || !this.y2) {
      return true;
    }
    if (this.drawable && offsetX === 0 && offsetY === 0) {
      this.roughCanvas?.draw(this.drawable);
      return true;
    }
    return false;
  }

  public update(state: UpdateState): void {
    super.update(state);
    this.drawable = undefined;
  }

  drawNew(offsetX: number, offsetY: number): void {
    this.drawable = this.drawDiamond(
      this.x1 + offsetX,
      this.y1 + offsetY,
      this.x2 + offsetX,
      this.y2 + offsetY
    );
  }
  private drawable: Drawable | undefined;
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
    const mainPoint = {
      x: (this.x1 + this.x2) / 2,
      y: (this.y1 + this.y2) / 2,
    };
    const angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    const distanceInY =
      (Math.sin(angle) * distance(this.x1, this.y1, this.x2, this.y2)) / 2;
    const left = [this.x1, this.y1 + distanceInY] as [number, number];
    const top = [mainPoint.x, mainPoint.y - distanceInY] as [number, number];
    const right = [this.x2, this.y2 - distanceInY] as [number, number];
    const bottom = [mainPoint.x, mainPoint.y + distanceInY] as [number, number];
    return (
      isInLine(x, y, left, top) ||
      isInLine(x, y, top, right) ||
      isInLine(x, y, right, bottom) ||
      isInLine(x, y, bottom, left)
    );
  }

  toVirtualCoordinates(x: number, y: number): void {
    this.x1 += x;
    this.y1 += y;
    this.drawable = undefined;
    this.x2 += x;
    this.y2 += y;
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    const newDiamond = new Diamond(
      this.roughCanvas,
      this.x1 + changeX,
      this.y1 + changeY
    );
    newDiamond.x2 = this.x2 + changeX;
    newDiamond.y2 = this.y2 + changeY;
    return newDiamond;
  }

  clone(x: number, y: number): Shape {
    const newDiamond = new Diamond(this.roughCanvas, this.x1, this.y1, this.getId());
    newDiamond.x2 = x;
    newDiamond.y2 = y;
    return newDiamond;
  }

  drawDiamond(x1: number, y1: number, x2: number, y2: number) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const mainPoint = {
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
    };
    const distanceInY = (Math.sin(angle) * distance(x1, y1, x2, y2)) / 2;
    const left = {
      x: x1,
      y: y1 + distanceInY,
    };
    const top = {
      x: mainPoint.x,
      y: mainPoint.y - distanceInY,
    };
    const right = {
      x: x2,
      y: y2 - distanceInY,
    };
    const bottom = {
      x: mainPoint.x,
      y: mainPoint.y + distanceInY,
    };
    return this.roughCanvas?.linearPath(
      [
        [left.x, left.y],
        [top.x, top.y],
        [right.x, right.y],
        [bottom.x, bottom.y],
        [left.x, left.y],
      ],
      {
        roughness: 1,
        seed: 1,
      }
    );
  }
}
