export interface Shape {
  draw(): void;
  clone(x: number, y: number): Shape;
}
