export interface Shape {
  applyNewCoordinates(x: number, y: number): Shape;
  toVirtualCoordinates(x: number, y: number): Shape;
  draw(offsetX: number, offsetY: number): void;
  clone(x: number, y: number): Shape;
}
