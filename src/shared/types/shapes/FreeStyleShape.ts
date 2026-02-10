import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { toVirtualX, toVirtualY } from "@shared/utils/CommonUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";
import { distance } from "@shared/utils/geometry/GeometryUtils";
import { SerializedShape } from "@shared/lib/serialization/ShapeSerializer";

export class FreeStyleShape extends Shape {
  serialize(): SerializedShape {
    return {
      type: "freestyle",
      data: { id: this.getId(), points: this.points },
    };
  }

  tryReUse(offsetX: number, offsetY: number): boolean {
    if (this.drawable && offsetX === 0 && offsetY === 0) {
      this.roughCanvas?.draw(this.drawable);
      return true;
    }
    return false;
  }

  /**
   * Override to clear cached drawable when canvas changes.
   */
  public setRoughCanvas(roughCanvas: RoughCanvas | undefined): void {
    super.setRoughCanvas(roughCanvas);
    this.drawable = undefined;
  }
  fullDrawShape(offsetX: number, offsetY: number): void {
    const newPoints = this.points.map(
      (point) =>
        [
          toVirtualX(point[0], offsetX, 1),
          toVirtualY(point[1], offsetY, 1),
        ] as [number, number]
    );
    this.drawable = this.roughCanvas?.curve(newPoints, {
      roughness: 0.1,
      strokeWidth: 2,
    });
  }
  private drawable: Drawable | undefined;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    public points: [number, number][],
    id?: string
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
      maxY - minY
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
      (point) => [point[0] + x, point[1] + y] as [number, number]
    );
    this.drawable = undefined;
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    const newPoints = this.points.map(
      (point) => [point[0] + changeX, point[1] + changeY] as [number, number]
    );
    return new FreeStyleShape(this.roughCanvas, newPoints);
  }
  clone(x: number, y: number): Shape {
    return new FreeStyleShape(this.roughCanvas, [...this.points, [x, y]]);
  }
}
