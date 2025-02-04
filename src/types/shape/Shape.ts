export interface Shape {
  applyNewCoordinates(x: number, y: number): Shape;
  toVirtualCoordinates(x: number, y: number): Shape;
  draw(): void;
  clone(x: number, y: number): Shape;
}
