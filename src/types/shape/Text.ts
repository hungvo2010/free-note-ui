import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "./Shape";
import { Rectangle } from "./Rectangle";
import { RectangleAdapter } from "./RectangleAdapter";

export class Text implements Shape {
  private text: string;
  private fontSize: number;
  private font: string;

  constructor(
    private roughCanvas: RoughCanvas | undefined,
    private x: number,
    private y: number,
    initialText: string = ""
  ) {
    this.text = initialText;
    this.fontSize = 20;
    this.font = "Excalifont";
  }

  draw(offsetX: number = 0, offsetY: number = 0): void {
    if (!this.roughCanvas) return;
    // Get canvas from the DOM directly since we know its ID
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.fillStyle = "black";
    ctx.fillText(this.text, this.x + offsetX, this.y + offsetY);
  }

  getBoundingRect(): Rectangle {
    // Use a cached canvas context for better performance
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Could not get canvas context for text measurement');
      return new Rectangle(this.roughCanvas, this.x, this.y, 0, 0);
    }

    // Set font properties
    ctx.font = `${this.fontSize}px ${this.font}`;
    const metrics = ctx.measureText(this.text);

    // Get full text metrics including height
    const actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const height = actualHeight || this.fontSize; // Fallback to fontSize if metrics not available

    // Calculate precise bounds
    const width = Math.ceil(metrics.width); // Round up to ensure text fits
    const yOffset = metrics.actualBoundingBoxAscent || this.fontSize;

    return new Rectangle(
      this.roughCanvas,
      this.x, // Left edge
      this.y - yOffset, // Top edge, accounting for text baseline
      width,
      height
    );
  }

  isPointInShape(x: number, y: number): boolean {
    const boundingRect = this.getBoundingRect();
    console.log(boundingRect);
    const rect = new RectangleAdapter(undefined, boundingRect, 0);
    rect.draw(0, 0);
    return rect.isPointInShape(x, y);
  }

  applyNewCoordinates(x: number, y: number): Shape {
    this.x = x;
    this.y = y;
    return this;
  }

  toVirtualCoordinates(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  clone(x: number, y: number): Shape {
    return new Text(this.roughCanvas, this.x, this.y, this.text);
  }

  // Additional methods specific to Text
  setText(newText: string) {
    this.text = newText;
  }

  getText(): string {
    return this.text;
  }

  getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }
} 