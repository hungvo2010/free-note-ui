import { RoughCanvas } from "roughjs/bin/canvas";
import { toVirtualX, toVirtualY } from "utils/CommonUtils";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class RectangleAdapter implements Shape {
  private readonly roughCanvas: RoughCanvas | undefined;
  private readonly rectangle: Rectangle;
  constructor(
    roughCanvas: RoughCanvas | undefined,
    private offsetX: number,
    private offsetY: number,
    rectangle: Rectangle,
    private readonly id: number
  ) {
    this.roughCanvas = roughCanvas;
    this.rectangle = rectangle;
  }
  applyNewCoordinates(x: number, y: number): Shape {
    return new RectangleAdapter(
      this.roughCanvas,
      0,
      0,
      new Rectangle(
        this.roughCanvas,
        toVirtualX(this.rectangle.getStartPoint().x, this.offsetX, 1),
        toVirtualY(this.rectangle.getStartPoint().y, this.offsetY, 1),
        this.rectangle.getWidth,
        this.rectangle.getHeight
      ),
      this.id
    );
  }
  clone(x: number, y: number): Shape {
    return new RectangleAdapter(
      this.roughCanvas,
      this.offsetX,
      this.offsetY,
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
      offsetX,
      offsetY,
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

  draw(): void {
    const newRectangle = new Rectangle(
      this.roughCanvas,
      toVirtualX(this.rectangle.getStartPoint().x, this.offsetX, 1),
      toVirtualY(this.rectangle.getStartPoint().y, this.offsetY, 1),
      this.rectangle.getWidth,
      this.rectangle.getHeight
    );
    newRectangle.drawRectangle();
  }

  getStartPoint(): { x: number; y: number } {
    return this.rectangle.getStartPoint();
  }
}
