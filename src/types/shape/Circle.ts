import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";

export class Circle {
  private drawable: Drawable | undefined;
  constructor(
    private roughCanvas: RoughCanvas | undefined, private x: number, private y: number, public readonly x1: number, public readonly y1: number, private radius: number) { }
  drawCircle() {
    if (this.drawable) {
      this.roughCanvas?.draw(this.drawable);
      return;
    }
    this.drawable = this.roughCanvas?.circle(this.x, this.y, this.radius, {
      roughness: 1,
      stroke: "black",
      seed: 1
    });
  }
  getCenterPoint(): { x: number; y: number; } {
    return { x: this.x, y: this.y };
  }
}
