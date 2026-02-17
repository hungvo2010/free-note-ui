import { SerializedShape } from "@shared/lib/serialization/ShapeSerializer";
import { toVirtualX, toVirtualY } from "@shared/utils/CommonUtils";
import { distance } from "@shared/utils/geometry/GeometryUtils";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class FreeStyleShape extends Shape {
  serialize(): SerializedShape {
    return {
      type: "freestyle",
      data: { id: this.getId(), points: this.points },
    };
  }

  tryReUse(offsetX: number, offsetY: number): boolean {
    if (this.drawable) {
      this.drawCachedFreeStyle(offsetX, offsetY);
      return true;
    }
    return false;
  }

  /**
   * Override to clear cached drawable when canvas changes.
   */
  public refreshCanvas(roughCanvas: RoughCanvas | undefined): void {
    super.refreshCanvas(roughCanvas);
    this.drawable = undefined;
  }

  fullDrawShape(offsetX: number, offsetY: number): void {
    this.drawCachedFreeStyle(offsetX, offsetY);
  }

  private drawCachedFreeStyle(offsetX: number, offsetY: number) {
    if (!this.roughCanvas || this.points.length === 0) return;

    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");

    if (!this.drawable) {
      // Generate points relative to the first point (origin)
      const origin = this.points[0];
      const relativePoints = this.points.map(
        (p) => [p[0] - origin[0], p[1] - origin[1]] as [number, number],
      );
      this.drawable = this.roughCanvas.generator.curve(relativePoints, {
        roughness: 0.1,
        strokeWidth: 2,
        seed: 1,
      });
    }

    if (ctx && this.drawable) {
      const origin = this.points[0];
      ctx.save();
      ctx.translate(origin[0] + offsetX, origin[1] + offsetY);
      this.roughCanvas.draw(this.drawable);
      ctx.restore();
    }
  }

  private drawable: Drawable | undefined;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    public points: [number, number][],
    id?: string,
  ) {
    super(roughCanvas, id);
  }
  getBoundingRect(): Rectangle {
    const minX = Math.min(...this.points.map((point) => point[0]));
    const maxX = Math.max(...this.points.map((point) => point[0]));
    const minY = Math.min(...this.points.map((point) => point[1]));
    const maxY = Math.max(...this.points.map((point) => point[1]));
    return new Rectangle(
      this.roughCanvas,
      minX,
      minY,
      maxX - minX,
      maxY - minY,
    );
  }
  isPointInShape(x: number, y: number): boolean {
    for (let i = 0; i < this.points.length - 1; i++) {
      if (distance(x, y, this.points[i][0], this.points[i][1]) <= 4) {
        return true;
      }
    }
    return false;
  }

  applyVirtualCoordinates(x: number, y: number): void {
    this.points = this.points.map(
      (point) => [point[0] + x, point[1] + y] as [number, number],
    );
    // Cache is preserved as the relative geometry hasn't changed
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    const newPoints = this.points.map(
      (point) => [point[0] + changeX, point[1] + changeY] as [number, number],
    );
    return new FreeStyleShape(this.roughCanvas, newPoints);
  }
  clone(x: number, y: number): Shape {
    return new FreeStyleShape(this.roughCanvas, [...this.points, [x, y]]);
  }
}
