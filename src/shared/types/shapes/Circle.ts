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

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  drawCircle(
    roughCanvas: RoughCanvas | undefined,
    offsetX: number = 0,
    offsetY: number = 0,
  ) {
    if (this.radius < 3 || !roughCanvas) {
      return;
    }

    const canvas =
      (roughCanvas as any).canvas ||
      (document.getElementById("myCanvas") as HTMLCanvasElement);
    const ctx = canvas?.getContext("2d");

    if (!this.drawable) {
      // Create geometry at origin (0,0) using generator to avoid immediate drawing
      this.drawable = roughCanvas.generator.circle(0, 0, this.radius * 2, {
        roughness: 1,
        seed: 1,
      });
    }

    if (ctx && this.drawable) {
      ctx.save();
      ctx.translate(this.x + offsetX, this.y + offsetY);
      roughCanvas.draw(this.drawable);
      ctx.restore();
    }
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
