import { RoughCanvas } from "roughjs/bin/canvas";
import { toVirtualX, toVirtualY } from "utils/CommonUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class RectangleAdapter implements Shape {
  private readonly roughCanvas: RoughCanvas | undefined;
  private readonly rectangle: Rectangle;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    rectangle: Rectangle,
    private readonly id: number
  ) {
    this.roughCanvas = roughCanvas;
    this.rectangle = rectangle;
  }
  getBoundingRect(): Rectangle {
    return new Rectangle(
      this.roughCanvas,
      this.rectangle.getStartPoint().x,
      this.rectangle.getStartPoint().y,
      this.rectangle.getWidth,
      this.rectangle.getHeight
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
      (x >= rectX - 2 && x <= rectX + 2 && y >= rectY && y <= rectY + adjustedHeight) || // Left edge
      (x >= rectX + adjustedWidth - 2 && x <= rectX + adjustedWidth + 2 && y >= rectY && y <= rectY + adjustedHeight) || // Right edge
      (y >= rectY - 2 && y <= rectY + 2 && x >= rectX && x <= rectX + adjustedWidth) || // Top edge
      (y >= rectY + adjustedHeight - 2 && y <= rectY + adjustedHeight + 2 && x >= rectX && x <= rectX + adjustedWidth) // Bottom edge
    );
  }

  inRange(val: number, start: number, end: number): boolean {
    return start <= end ? val >= start && val <= end : val >= end && val <= start;
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    return new RectangleAdapter(
      this.roughCanvas,
      new Rectangle(
        this.roughCanvas,
        this.rectangle.getStartPoint().x + changeX,
        this.rectangle.getStartPoint().y + changeY,
        this.rectangle.getWidth,
        this.rectangle.getHeight
      ),
      this.id
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
        y - this.rectangle.getStartPoint().y
      ),
      this.id
    );
  }

  toVirtualCoordinates(offsetX: number, offsetY: number): Shape {
    // console.log(
    //   "start point: " + JSON.stringify(this.rectangle.getStartPoint())
    // );
    return new RectangleAdapter(
      this.roughCanvas,
      new Rectangle(
        this.roughCanvas,
        this.rectangle.getStartPoint().x,
        this.rectangle.getStartPoint().y,
        this.rectangle.getWidth,
        this.rectangle.getHeight
      ),
      new Date().getMilliseconds()
    );
  }

  draw(offsetX: number, offsetY: number): void {
    if (offsetX === 0 && offsetY === 0) {
      this.rectangle.drawRectangle();
      return;
    }
    const newRectangle = new Rectangle(
      this.roughCanvas,
      toVirtualX(this.rectangle.getStartPoint().x, offsetX, 1),
      toVirtualY(this.rectangle.getStartPoint().y, offsetY, 1),
      this.rectangle.getWidth,
      this.rectangle.getHeight
    );
    newRectangle.drawRectangle();
  }

  getStartPoint(): { x: number; y: number } {
    return this.rectangle.getStartPoint();
  }
}
