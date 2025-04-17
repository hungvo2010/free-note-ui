import { RoughCanvas } from "roughjs/bin/canvas";
import { Rectangle } from "./Rectangle";

export abstract class Shape {
  protected roughCanvas: RoughCanvas | undefined;
  abstract getBoundingRect(): Rectangle;
  abstract isPointInShape(x: number, y: number): boolean;
  abstract applyNewCoordinates(x: number, y: number): Shape;
  abstract toVirtualCoordinates(x: number, y: number): void;
  abstract draw(offsetX: number, offsetY: number): void;
  abstract clone(x: number, y: number): Shape;
  public setRoughCanvas(roughCanvas: RoughCanvas | undefined) {
    this.roughCanvas = roughCanvas;
  }
}
