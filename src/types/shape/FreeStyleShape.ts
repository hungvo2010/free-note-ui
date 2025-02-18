import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { Shape } from "./Shape";
import { toVirtualX, toVirtualY } from "utils/CommonUtils";

export class FreeStyleShape implements Shape {
  private drawable: Drawable | undefined;
  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public points: [number, number][],
    private offsetX: number,
    private offsetY: number
  ) {}

  toVirtualCoordinates(x: number, y: number): Shape {
    return new FreeStyleShape(this.roughCanvas, this.points, x, y);
  }

  applyNewCoordinates(x: number, y: number): Shape {
    var newPoints = this.points.map((point) => [toVirtualX(point[0], this.offsetX, 1), toVirtualY(point[1], this.offsetY, 1)] as [number, number]);
    return new FreeStyleShape(this.roughCanvas, newPoints, 0, 0);
  }

  draw(): void {
    if (this.drawable) {
      this.roughCanvas?.draw(this.drawable);
      return;
    }
    var newPoints = this.points.map((point) => [toVirtualX(point[0], this.offsetX, 1), toVirtualY(point[1], this.offsetY, 1)] as [number, number]);
    this.drawable = this.roughCanvas?.curve(newPoints, {
      roughness: 0.1,
      strokeWidth: 2,
    });
  }

  clone(x: number, y: number): Shape {
    return new FreeStyleShape(this.roughCanvas, [...this.points, [x, y]], this.offsetX, this.offsetY);
  }
}
