import { SerializedShape } from "@shared/lib/serialization/ShapeSerializer";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { drawLine } from "@shared/utils/CommonUtils";
import { distanceToLine } from "@shared/utils/geometry/GeometryUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export default class Arrow extends Shape {
  tryReUse(offsetX: number, offsetY: number): boolean {
    if (this.mainDrawable && this.leftDrawable && this.rightDrawable) {
      this.drawCachedArrow(offsetX, offsetY);
      return true;
    }
    if (!this.x1 || !this.y1 || !this.x2 || !this.y2) {
      return true;
    }
    return false;
  }

  /**
   * Override to clear cached drawables when canvas changes.
   */
  public refreshCanvas(roughCanvas: RoughCanvas | undefined): void {
    super.refreshCanvas(roughCanvas);
    this.clearDrawableCache();
  }

  private clearDrawableCache(): void {
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
    id?: string,
  ) {
    super(roughCanvas, id);
  }

  getBoundingRect(): Rectangle {
    return new Rectangle(
      this.roughCanvas,
      this.x1,
      this.y1,
      this.x2 - this.x1,
      this.y2 - this.y1,
    );
  }

  isPointInShape(x: number, y: number): boolean {
    const dToLine = distanceToLine(x, y, [this.x1, this.y1], [this.x2, this.y2]);
    return dToLine <= 4;
  }

  applyVirtualCoordinates(offsetX: number, offsetY: number): void {
    this.x1 += offsetX;
    this.y1 += offsetY;
    this.x2 += offsetX;
    this.y2 += offsetY;
    // Cache is preserved as the relative geometry hasn't changed
  }

  applyNewCoordinates(offsetX: number, offsetY: number): Shape {
    const newArrow = new Arrow(
      this.roughCanvas,
      this.x1 + offsetX,
      this.y1 + offsetY,
    );
    newArrow.x2 = this.x2 + offsetX;
    newArrow.y2 = this.y2 + offsetY;
    return newArrow;
  }

  clone(x: number, y: number): Shape {
    const newArrow = new Arrow(this.roughCanvas, this.x1, this.y1, this.getId());
    newArrow.x2 = x;
    newArrow.y2 = y;
    return newArrow;
  }

  fullDrawShape(offsetX: number, offsetY: number): void {
    this.drawCachedArrow(offsetX, offsetY);
  }

  private drawCachedArrow(offsetX: number, offsetY: number) {
    if (!this.roughCanvas) return;

    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");

    if (!this.mainDrawable || !this.leftDrawable || !this.rightDrawable) {
      // Generate relative coordinates
      const dx = this.x2 - this.x1;
      const dy = this.y2 - this.y1;

      this.mainDrawable = this.roughCanvas.generator.line(0, 0, dx, dy, {
        roughness: 1,
        seed: 3,
      });

      const headLength = 15;
      const angle = Math.atan2(dy, dx);
      this.leftDrawable = this.roughCanvas.generator.line(
        dx,
        dy,
        dx - headLength * Math.cos(angle - Math.PI / 6),
        dy - headLength * Math.sin(angle - Math.PI / 6),
        { roughness: 1, seed: 3 },
      );
      this.rightDrawable = this.roughCanvas.generator.line(
        dx,
        dy,
        dx - headLength * Math.cos(angle + Math.PI / 6),
        dy - headLength * Math.sin(angle + Math.PI / 6),
        { roughness: 1, seed: 3 },
      );
    }

    if (ctx && this.mainDrawable && this.leftDrawable && this.rightDrawable) {
      ctx.save();
      ctx.translate(this.x1 + offsetX, this.y1 + offsetY);
      this.roughCanvas.draw(this.mainDrawable);
      this.roughCanvas.draw(this.leftDrawable);
      this.roughCanvas.draw(this.rightDrawable);
      ctx.restore();
    }
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
