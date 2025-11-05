import { RoughCanvas } from "roughjs/bin/canvas";
import { CircleAdapter } from "types/shape/CircleAdapter";
import { Shape } from "types/shape/Shape";
import { distance, isPointInShape } from "utils/GeometryUtils";
import { Subject } from "types/Subject";
import { Observer } from "types/Observer";

export class ReDrawController implements Subject {
  private theme: "light" | "dark" = "light";

  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public canvas: HTMLCanvasElement | undefined,
    public shapes: Shape[] = []
  ) {}
  
  registerObserver(observer: Observer): void {
    throw new Error("Method not implemented.");
  }
  removeObserver(observer: Observer): void {
    throw new Error("Method not implemented.");
  }
  notifyObservers(): void {
    for (const shape of this.shapes) {
      shape.update({
        roughCanvas: this.roughCanvas,
        theme: this.theme,
      });
    }
  }

  public setTheme(theme: "light" | "dark") {
    this.theme = theme;
  }

  private getStrokeOptions() {
    return {
      stroke: this.theme === "dark" ? "#ffffff" : "#000000",
      strokeWidth: 1,
    };
  }

  public addShape(shape: Shape) {
    this.shapes.push(shape);
  }

  public checkSelectedShape(x: number, y: number): Shape | undefined {
    const shape = this.shapes.find((shape) => isPointInShape(shape, x, y));
    return shape;
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
      newShape.updateRadius(distance(nextX, nextY, x, y));
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
    const ctx = this.canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas?.width || 0, this.canvas?.height || 0);
    }
    for (const shape of this.shapes || []) {
      shape.setRoughCanvas(this.roughCanvas);
      shape.draw(offsetX, offsetY);
    }
  }

  public setShapes(shapes: Shape[]): void {
    this.shapes = shapes;
  }

  public redrawUsingVirtualCoordinates(newOffsetX: number, newOffsetY: number) {
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i].toVirtualCoordinates(newOffsetX, newOffsetY);
    }
  }

  public getShapes() {
    return this.shapes;
  }

  public getShapesUnderPoint(x: number, y: number): Shape[] {
    return this.shapes.filter((shape) => isPointInShape(shape, x, y));
  }

  public removeShapes(shapesToRemove: Shape[]): void {
    this.shapes = this.shapes.filter(
      (shape) => !shapesToRemove.includes(shape)
    );
  }
}
