import { RoughCanvas } from "roughjs/bin/canvas";

export class Rectangle {
  constructor(
    private roughCanvas: RoughCanvas | undefined,
    private x: number,
    private y: number,
    private width: number,
    private height: number
  ) { }
  drawRectangle() {
    this.roughCanvas?.rectangle(this.x, this.y, this.width, this.height, {
      roughness: 1,
      stroke: "black",
    });
  }

  getStartPoint(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
