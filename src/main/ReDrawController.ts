import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "types/shape/Shape";

export class ReDrawController {
  redrawUsingVirtualCoordinates(newOffsetX: number, newOffsetY: number) {
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i] = this.shapes[i].toVirtualCoordinates(
        newOffsetX,
        newOffsetY
      );
    }
  }
  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public shapes: Shape[] = []
  ) {}

  public addShape(shape: Shape) {
    this.shapes.push(shape);
  }

  public updateLastShape(x: number, y: number) {
    const lastShape = this.shapes[this.shapes.length - 1];
    const newShape = lastShape.clone(x, y);
    this.shapes[this.shapes.length - 1] = newShape;
  }

  public updateShape(newShape: Shape) {
    this.shapes[this.shapes.length - 1] = newShape;
  }

  public updateCoordinates(offsetX: number, offsetY: number) {
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i] = this.shapes[i].applyNewCoordinates(offsetX, offsetY);
    }
  }

  public reDraw() {
    for (const shape of this.shapes) {
      shape.draw();
    }
  }
}
