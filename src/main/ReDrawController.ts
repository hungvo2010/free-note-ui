import { RoughCanvas } from "roughjs/bin/canvas";
import { CircleAdapter } from "types/shape/CircleAdapter";
import { Shape } from "types/shape/Shape";
import { distance } from "utils/GeometryUtils";

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

  public updateLastShape(
    x: number,
    y: number,
    currentX: number,
    currentY: number
  ) {
    const lastShape = this.shapes[this.shapes.length - 1];
    let nextX = currentX,
      nextY = currentY;
    if (lastShape instanceof CircleAdapter) {
      nextX = (currentX + x) / 2;
      nextY = (currentY + y) / 2;
    }
    const newShape = lastShape.clone(nextX, nextY);
    if (newShape instanceof CircleAdapter) {
      newShape.updateRadius(distance(currentX, currentY, x, y));
    }
    this.shapes[this.shapes.length - 1] = newShape;
  }

  public updateShape(newShape: Shape) {
    this.shapes[this.shapes.length - 1] = newShape;
  }

  public updateCoordinates(changeX: number, changeY: number) {
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i] = this.shapes[i].applyNewCoordinates(changeX, changeY);
    }
  }

  public reDraw(offsetX: number, offsetY: number) {
    for (const shape of this.shapes) {
      shape.draw(offsetX, offsetY);
    }
  }
}
