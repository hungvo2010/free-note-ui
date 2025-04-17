import { RoughCanvas } from "roughjs/bin/canvas";
import { Rectangle } from "./Rectangle";
import { calculatePadding } from "utils/GeometryUtils";

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

  public drawBoundingBox  (
    canvas: HTMLCanvasElement | undefined,
    shape: Shape
  )  {
    const boundingRect = shape.getBoundingRect();
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = "red"; // Highlight color
      ctx.lineWidth = 2;
      const startPoint = boundingRect.getStartPoint();
      const angle =
        (Math.atan2(boundingRect.getHeight, boundingRect.getWidth) * 180) /
        Math.PI;
      const padding = calculatePadding(angle, 4);
      ctx.strokeRect(
        startPoint.x - padding[0],
        startPoint.y - padding[1],
        boundingRect.getWidth + padding[0] * 2,
        boundingRect.getHeight + padding[1] * 2
      );
    }
  };
}
