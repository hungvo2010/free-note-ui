import { Rectangle } from "./Rectangle";

export interface Shape {
  getBoundingRect(): Rectangle;
  isPointInShape(x: number, y: number): boolean;
  applyNewCoordinates(x: number, y: number): Shape;
  toVirtualCoordinates(x: number, y: number): void;
  draw(offsetX: number, offsetY: number): void;
  clone(x: number, y: number): Shape;
}
