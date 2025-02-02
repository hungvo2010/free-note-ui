import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";

export class Rectangle {
  private drawable: Drawable | undefined;
  constructor(
    private roughCanvas: RoughCanvas | undefined,
    private x: number,
    private y: number,
    private width: number,
    private height: number
  ) {}
  drawRectangle() {
    if (this.drawable) {
      this.roughCanvas?.draw(this.drawable);
      return;
    }
    this.drawable = this.roughCanvas?.rectangle(
      this.x,
      this.y,
      this.width,
      this.height,
      {
        roughness: 1,
        stroke: "black",
        seed: 1,
      }
    );
  }

  getStartPoint(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public get getWidth(): number {
    return this.width;
  }

  public get getHeight(): number {
    return this.height;
  }
}
