import { SerializedShape } from "core/ShapeSerializer";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Observer, UpdateState } from "core/Observer";
import { calculatePadding } from "utils/GeometryUtils";
import { Rectangle } from "./Rectangle";

export abstract class Shape implements Observer {
  private readonly _id: string;
  abstract getBoundingRect(): Rectangle;
  abstract isPointInShape(x: number, y: number): boolean;
  abstract applyNewCoordinates(x: number, y: number): Shape;
  abstract drawInVirtualCoordinates(x: number, y: number): void;
  public draw(offsetX: number, offsetY: number): void {
    if (this.checkReUsedDrawable(offsetX, offsetY)) return;
    this.drawFreshShape(offsetX, offsetY);
  }
  abstract checkReUsedDrawable(offsetX: number, offsetY: number): boolean;
  abstract drawFreshShape(offsetX: number, offsetY: number): void;
  abstract clone(x: number, y: number): Shape;
  public setRoughCanvas(roughCanvas: RoughCanvas | undefined) {
    this.roughCanvas = roughCanvas;
  }
  abstract serialize(): SerializedShape;

  constructor(protected roughCanvas: RoughCanvas | undefined, id?: string) {
    this._id = id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  public getId(): string {
    return this._id;
  }
  public observerUpdate(state: UpdateState): void {
    this.roughCanvas = state.roughCanvas;
  }

  public drawBoundingBox(canvas: HTMLCanvasElement | undefined) {
    const boundingRect = this.getBoundingRect();
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
  }
}
