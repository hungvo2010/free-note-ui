import { SerializedShape } from "@shared/lib/serialization/ShapeSerializer";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { toVirtualX, toVirtualY } from "@shared/utils/CommonUtils";
import { distanceToLine } from "@shared/utils/geometry/GeometryUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class Line extends Shape {
  serialize(): SerializedShape {
    return {
      type: "line",
      data: {
        id: this.getId(),
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
      },
    };
  }

  tryReUse(offsetX: number, offsetY: number): boolean {
    if (!this.x2 || !this.y2) {
      return true;
    }
    if (this.drawable) {
      this.drawCachedLine(offsetX, offsetY);
      return true;
    }
    return false;
  }

  fullDrawShape(offsetX: number, offsetY: number): void {
    this.drawCachedLine(offsetX, offsetY);
  }

  private drawCachedLine(offsetX: number, offsetY: number) {
    if (!this.roughCanvas) return;

    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");

    if (!this.drawable) {
      // Create at origin (0,0) using generator to avoid immediate drawing
      this.drawable = this.roughCanvas.generator.line(
        0,
        0,
        this.x2 - this.x1,
        this.y2 - this.y1,
        {
          roughness: 3,
          seed: 1,
          strokeWidth: 1,
        },
      );
    }

    if (ctx && this.drawable) {
      ctx.save();
      ctx.translate(this.x1 + offsetX, this.y1 + offsetY);
      this.roughCanvas.draw(this.drawable);
      ctx.restore();
    }
  }

  /**
   * Override to clear cached drawable when canvas changes.
   */
  public refreshCanvas(roughCanvas: RoughCanvas | undefined): void {
    super.refreshCanvas(roughCanvas);
    this.drawable = undefined;
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
    return distanceToLine(x, y, [this.x1, this.y1], [this.x2, this.y2]) <= 4;
  }

  applyVirtualCoordinates(offsetX: number, offsetY: number): void {
    this.x1 += offsetX;
    this.y1 += offsetY;
    this.x2 += offsetX;
    this.y2 += offsetY;
    // Cache is preserved as the relative geometry hasn't changed
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
    const newLine = new Line(this.roughCanvas, this.x1, this.y1, this.getId());
    newLine.x2 = x;
    newLine.y2 = y;
    return newLine;
  }
}
