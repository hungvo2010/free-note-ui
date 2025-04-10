import PieceTableTextEditor from "components/editor/PieceTableTextEditor";
import SimpleTextEditor from "components/editor/SimpleTextEditor";
import TextEditor from "components/editor/TextEditor";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

export class TextShape implements Shape {
  getContent(): string {
    return this.textEditor.getContent().join("\n");
  }
  private textEditor: TextEditor;
  private fontSize: number;
  private font: string;

  constructor(
    private roughCanvas: RoughCanvas | undefined,
    private x: number,
    private y: number,
    initialText: string = ""
  ) {
    // this.textEditor = new PieceTableTextEditor(null, initialText, "");
    this.textEditor = new SimpleTextEditor([initialText]);
    this.fontSize = 20;
    this.font = "Excalifont";
  }

  draw(offsetX: number = 0, offsetY: number = 0): void {
    if (!this.roughCanvas) return;
    // Get canvas from the DOM directly since we know its ID
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.fillStyle = "black";
    ctx.fillText(
      this.textEditor.getContent().join("\n"),
      this.x + offsetX,
      this.y + offsetY
    );
  }

  append(text: string): void {
    this.textEditor.appendText(text);
  }

  getBoundingRect(): Rectangle {
    // Use a cached canvas context for better performance
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Could not get canvas context for text measurement");
      return new Rectangle(this.roughCanvas, this.x, this.y, 0, 0);
    }

    // Set font properties
    ctx.font = `${this.fontSize}px ${this.font}`;
    const metrics = ctx.measureText(this.textEditor.getContent().join("\n"));

    // Get full text metrics including height
    const actualHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
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
    // Create a temporary canvas for text measurement
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    // Set up the font context
    ctx.font = `${this.fontSize}px ${this.font}`;
    const metrics = ctx.measureText(this.textEditor.getContent().join("\n"));

    // Get the vertical metrics
    const top = this.y - metrics.actualBoundingBoxAscent;
    const bottom = this.y + metrics.actualBoundingBoxDescent;

    // Get the horizontal metrics
    const left = this.x;
    const right = this.x + metrics.width;

    // Check if point is within the text bounds
    const isInside = x >= left && x <= right && y >= top && y <= bottom;
    return isInside;
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
    return new TextShape(
      this.roughCanvas,
      this.x,
      this.y,
      this.textEditor.getContent().join("\n")
    );
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
