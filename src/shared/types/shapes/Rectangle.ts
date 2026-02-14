import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";

export class Rectangle {
  private drawable: Drawable | undefined;
  constructor(
    private roughCanvas: RoughCanvas | undefined,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
  ) {}

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public setSize(width: number, height: number) {
    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;
      this.drawable = undefined; // Invalidate cache on size change
    }
  }

  drawRectangle(
    roughCanvas: RoughCanvas | undefined,
    offsetX: number = 0,
    offsetY: number = 0,
  ) {
    if (!roughCanvas) return;

    // Use the canvas from roughCanvas if possible, otherwise fallback to DOM
    const canvas =
      (roughCanvas as any).canvas ||
      (document.getElementById("myCanvas") as HTMLCanvasElement);
    const ctx = canvas?.getContext("2d");

    if (!this.drawable) {
      this.drawable = roughCanvas.generator.rectangle(
        0,
        0,
        this.width,
        this.height,
        {
          roughness: 1,
          seed: 1,
        },
      );
    }

    if (ctx && this.drawable) {
      ctx.save();
      ctx.translate(this.x + offsetX, this.y + offsetY);
      roughCanvas.draw(this.drawable);
      ctx.restore();
    }
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

  public getRoughCanvas(): RoughCanvas | undefined {
    return this.roughCanvas;
  }
}
