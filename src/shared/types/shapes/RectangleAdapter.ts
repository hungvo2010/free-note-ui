import { SerializedShape } from "@shared/lib/serialization/ShapeSerializer";
import { toVirtualX, toVirtualY } from "@shared/utils/CommonUtils";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class RectangleAdapter extends Shape {
  serialize(): SerializedShape {
    const start = this.getStartPoint();
    const size = this.getSize();
    return {
      type: "rectangle",
      data: {
        id: this.getId(),
        x: start.x,
        y: start.y,
        width: size.width,
        height: size.height,
      },
    };
  }

  tryReUse(offsetX: number, offsetY: number): boolean {
    const result =
      Object.is(this.roughCanvas, this.rectangle.getRoughCanvas()) &&
      offsetX === 0 &&
      offsetY === 0;
    if (result) {
      this.rectangle.drawRectangle();
    }
    return result;
  }

  fullDrawShape(offsetX: number, offsetY: number): void {
    const newRectangle = new Rectangle(
      this.roughCanvas,
      toVirtualX(this.rectangle.getStartPoint().x, offsetX, 1),
      toVirtualY(this.rectangle.getStartPoint().y, offsetY, 1),
      this.rectangle.getWidth,
      this.rectangle.getHeight,
    );
    newRectangle.drawRectangle();
  }

  private rectangle: Rectangle;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    rectangle: Rectangle,
    private readonly id: number,
  ) {
    super(roughCanvas, String(id));
    this.rectangle = rectangle;
  }
  getBoundingRect(): Rectangle {
    return new Rectangle(
      this.roughCanvas,
      this.rectangle.getStartPoint().x,
      this.rectangle.getStartPoint().y,
      this.rectangle.getWidth,
      this.rectangle.getHeight,
    );
  }

  isPointInShape(x: number, y: number): boolean {
    const { x: startX, y: startY } = this.rectangle.getStartPoint();
    const width = this.rectangle.getWidth;
    const height = this.rectangle.getHeight;

    const adjustedWidth = Math.abs(width);
    const adjustedHeight = Math.abs(height);
    const rectX = startX + (width < 0 ? width : 0);
    const rectY = startY + (height < 0 ? height : 0);

    return (
      (x >= rectX - 2 &&
        x <= rectX + 2 &&
        y >= rectY &&
        y <= rectY + adjustedHeight) || // Left edge
      (x >= rectX + adjustedWidth - 2 &&
        x <= rectX + adjustedWidth + 2 &&
        y >= rectY &&
        y <= rectY + adjustedHeight) || // Right edge
      (y >= rectY - 2 &&
        y <= rectY + 2 &&
        x >= rectX &&
        x <= rectX + adjustedWidth) || // Top edge
      (y >= rectY + adjustedHeight - 2 &&
        y <= rectY + adjustedHeight + 2 &&
        x >= rectX &&
        x <= rectX + adjustedWidth) // Bottom edge
    );
  }

  inRange(val: number, start: number, end: number): boolean {
    return start <= end
      ? val >= start && val <= end
      : val >= end && val <= start;
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    return new RectangleAdapter(
      this.roughCanvas,
      new Rectangle(
        this.roughCanvas,
        this.rectangle.getStartPoint().x + changeX,
        this.rectangle.getStartPoint().y + changeY,
        this.rectangle.getWidth,
        this.rectangle.getHeight,
      ),
      this.id,
    );
  }

  clone(x: number, y: number): Shape {
    return new RectangleAdapter(
      this.roughCanvas,
      new Rectangle(
        this.roughCanvas,
        this.rectangle.getStartPoint().x,
        this.rectangle.getStartPoint().y,
        x - this.rectangle.getStartPoint().x,
        y - this.rectangle.getStartPoint().y,
      ),
      this.id,
    );
  }

  applyVirtualCoordinates(offsetX: number, offsetY: number): void {
    this.rectangle = new Rectangle(
      this.roughCanvas,
      this.rectangle.getStartPoint().x + offsetX,
      this.rectangle.getStartPoint().y + offsetY,
      this.rectangle.getWidth,
      this.rectangle.getHeight,
    );
  }

  getStartPoint(): { x: number; y: number } {
    return this.rectangle.getStartPoint();
  }
  getSize(): { width: number; height: number } {
    return { width: this.rectangle.getWidth, height: this.rectangle.getHeight };
  }
}
