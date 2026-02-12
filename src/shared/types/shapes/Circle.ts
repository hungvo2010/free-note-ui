import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";

export class Circle {
  getRoughCanvas(): RoughCanvas | undefined {
    return this.roughCanvas;
  }
  private drawable: Drawable | undefined;
  constructor(
    private roughCanvas: RoughCanvas | undefined,
    private x: number,
    private y: number,
    private radius: number,
  ) {}

  drawCircle() {
    if (this.radius < 3) {
      console.log("radius < 3");
      return;
    }
    if (this.drawable) {
      console.log("Circle: reuse drawable");
      this.roughCanvas?.draw(this.drawable);
      return;
    }
    this.drawable = this.roughCanvas?.circle(this.x, this.y, this.radius * 2, {
      roughness: 1,
      seed: 1,
    });
  }
  getCenterPoint(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public get getRadius(): number {
    return this.radius;
  }

  public setRadius(radius: number) {
    this.radius = radius;
  }

  public get getX(): number {
    return this.x;
  }

  public get getY(): number {
    return this.y;
  }
}
