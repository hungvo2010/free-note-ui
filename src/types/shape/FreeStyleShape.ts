import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { Shape } from "./Shape";

export class FreeStyleShape implements Shape {
  private drawable: Drawable | undefined;
  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public points: [number, number][]
  ) {}
  toVirtualCoordinates(x: number, y: number): Shape {
    throw new Error("Method not implemented.");
  }
  applyNewCoordinates(x: number, y: number): Shape {
    throw new Error("Method not implemented.");
  }
  draw(): void {
    if (this.drawable) {
      this.roughCanvas?.draw(this.drawable);
      return;
    }
    this.drawable = this.roughCanvas?.curve(this.points, {
      roughness: 0.1,
      strokeWidth: 2,
    });
  }
  clone(x: number, y: number): Shape {
    return new FreeStyleShape(this.roughCanvas, [...this.points, [x, y]]);
  }
}
