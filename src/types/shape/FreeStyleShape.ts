import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { toVirtualX, toVirtualY } from "utils/CommonUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class FreeStyleShape implements Shape {
  private drawable: Drawable | undefined;
  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public points: [number, number][]
  ) {}
  getBoundingRect(): Rectangle {
    throw new Error("Method not implemented.");
  }
  isPointInShape(x: number, y: number): boolean {
    throw new Error("Method not implemented.");
  }

  toVirtualCoordinates(x: number, y: number): Shape {
    return new FreeStyleShape(this.roughCanvas, this.points);
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    const newPoints = this.points.map(
      (point) => [point[0] + changeX, point[1] + changeY] as [number, number]
    );
    return new FreeStyleShape(this.roughCanvas, newPoints);
  }

  draw(offsetX: number, offsetY: number): void {
    if (this.drawable && offsetX === 0 && offsetY === 0) {
      this.roughCanvas?.draw(this.drawable);
      return;
    }
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

  clone(x: number, y: number): Shape {
    return new FreeStyleShape(this.roughCanvas, [...this.points, [x, y]]);
  }
}
