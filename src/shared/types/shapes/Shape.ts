import { SerializedShape } from "@shared/lib/serialization/ShapeSerializer";
import { PADDING } from "@shared/utils/Constant";
import { calculatePadding } from "@shared/utils/geometry/GeometryUtils";
import { RoughCanvas } from "roughjs/bin/canvas";
import { BoundingBox } from "../BoundingBox";
import { Rectangle } from "./Rectangle";

/**
 * Base class for all drawable shapes on the whiteboard.
 * Handles rendering, coordinate transformations, and serialization.
 */
export abstract class Shape {
  private readonly _id: string;

  abstract getBoundingRect(): Rectangle;
  abstract isPointInShape(x: number, y: number): boolean;
  abstract applyNewCoordinates(x: number, y: number): Shape;
  abstract applyVirtualCoordinates(x: number, y: number): void;

  public draw(offsetX: number, offsetY: number): void {
    if (this.tryReUse(offsetX, offsetY)) return;
    this.fullDrawShape(offsetX, offsetY);
  }

  abstract tryReUse(offsetX: number, offsetY: number): boolean;
  abstract fullDrawShape(offsetX: number, offsetY: number): void;
  abstract clone(x: number, y: number): Shape;
  abstract serialize(): SerializedShape;

  constructor(
    protected roughCanvas: RoughCanvas | undefined,
    id?: string,
  ) {
    this._id = id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  public getId(): string {
    return this._id;
  }

  /**
   * Updates the RoughCanvas reference for this shape.
   * Called when canvas context changes (e.g., theme switch, canvas resize).
   * Subclasses should override to clear cached drawables.
   */
  public refreshCanvas(roughCanvas: RoughCanvas | undefined): void {
    this.roughCanvas = roughCanvas;
  }

  public drawBoundingBox(
    canvas: HTMLCanvasElement | undefined,
  ): BoundingBox | null {
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      const lineWidth = 2;
      ctx.strokeStyle = "red"; // Highlight color
      ctx.lineWidth = lineWidth;
      const boundingBox = this.getBoundingBox();
      ctx.strokeRect(
        boundingBox.startPoint.x,
        boundingBox.startPoint.y,
        boundingBox.width,
        boundingBox.height,
      );
      return boundingBox;
    }
    return null;
  }

  public getBoundingBox(): BoundingBox {
    const lineWidth = 2;
    const boundingRect = this.getBoundingRect();
    const startPoint = boundingRect.getStartPoint();
    const padding = calculatePadding(
      boundingRect.getWidth,
      boundingRect.getHeight,
      PADDING,
    );
    // console.log("[Padding of getBoundingBox]: ", padding);

    return {
      startPoint: {
        x: startPoint.x - padding[0],
        y: startPoint.y - padding[1],
      },
      width: boundingRect.getWidth + padding[0] * 2,
      height: boundingRect.getHeight + padding[1] * 2,
      lineWidth,
    };
  }
}
