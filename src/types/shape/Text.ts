import SimpleTextEditor from "components/editor/SimpleTextEditor";
import TextEditor, { Position } from "components/editor/TextEditor";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";
import { UpdateState } from "types/Observer";

export class TextShape extends Shape implements TextEditor {
  checkReUsedDrawable(offsetX: number, offsetY: number): boolean {
    return false;
  }
  private textEditor: TextEditor;
  private fontSize: number;
  private font: string;
  private fillStyle: string = "black";
  private maxWidth: number = 500;

  constructor(
    roughCanvas: RoughCanvas | undefined,
    private x: number,
    private y: number,
    initialText: string = "",
    id?: string
  ) {
    super(roughCanvas, id);
    // this.textEditor = new PieceTableTextEditor(null, initialText, "");
    this.textEditor = new SimpleTextEditor([initialText]);
    this.fontSize = 20;
    this.font = "Excalifont";
  }
  insert(content: string, at: Position): void {
    this.textEditor.insert(content, at);
  }
  delete(at: Position): void {
    this.textEditor.delete(at);
  }
  getContent(): string[] {
    return this.textEditor.getContent();
  }
  getText(): string {
    return this.textEditor.getText();
  }
  deleteRange(start: Position, end: Position): void {
    this.textEditor.deleteRange(start, end);
  }
  appendText(text: string): void {
    this.textEditor.appendText(text);
  }

  drawNew(offsetX: number = 0, offsetY: number = 0): void {
    if (!this.roughCanvas) return;
    // Get canvas from the DOM directly since we know its ID
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = `${this.fontSize}px ${this.font}`;
    ctx.fillStyle = this.fillStyle;

    const content = this.getContent();

    this.wrapText(ctx, content, this.x + offsetX, this.y + offsetY);
  }

  public update(state: UpdateState): void {
    this.fillStyle = state.theme === "dark" ? "white" : "black";
  }

  wrapText(
    ctx: CanvasRenderingContext2D,
    content: string[],
    x: number,
    y: number
  ) {
    const lineHeight = content.reduce(
      (a, b) => Math.max(a, this.getLineHeight(ctx, b)),
      0
    );
    for (let i = 0; i < content.length; i++) {
      let line = content[i];
      let lineWidth = ctx.measureText(line).width;
      if (lineWidth > this.maxWidth) {
        while (lineWidth > 0) {
          // Binary search to find the maximum number of characters that fit within maxWidth
          let start = 0;
          let end = line.length;
          let fitIndex = 0;

          while (start <= end) {
            const mid = Math.floor((start + end) / 2);
            const testWidth = ctx.measureText(line.substring(0, mid)).width;

            if (testWidth <= this.maxWidth) {
              fitIndex = mid;
              start = mid + 1;
            } else {
              end = mid - 1;
            }
          }

          const fitLine = line.substring(0, fitIndex);
          ctx.fillText(fitLine, x, y, this.maxWidth);
          line = line.substring(fitIndex);
          lineWidth -= this.maxWidth;
          y += lineHeight;
        }
        continue;
      }
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
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
    const metrics = this.textEditor
      .getContent()
      .map((a) => ctx.measureText(a))
      .reduce((a, b) => (a.width > b.width ? a : b));
    const height =
      this.getContent().reduce(
        (a, b) => Math.max(a, this.getLineHeight(ctx, b)),
        0
      ) * this.getNumberOfLines(ctx);

    // Calculate precise bounds
    const width = Math.min(Math.ceil(metrics.width), this.maxWidth); // Round up to ensure text fits
    const yOffset = metrics.actualBoundingBoxAscent || this.fontSize;

    return new Rectangle(
      this.roughCanvas,
      this.x, // Left edge
      this.y - yOffset, // Top edge, accounting for text baseline
      width,
      height
    );
  }

  getLineHeight(ctx: CanvasRenderingContext2D, text: string): number {
    // Set font properties
    ctx.font = `${this.fontSize}px ${this.font}`;
    const metrics = ctx.measureText(text);

    // Get full text metrics including height
    const actualHeight =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return actualHeight || this.fontSize; // Fallback to fontSize if metrics not available
  }

  getNumberOfLines(ctx: CanvasRenderingContext2D): number {
    const content = this.getContent();
    let result = 0;
    for (let i = 0; i < content.length; i++) {
      let line = content[i];
      let lineWidth = ctx.measureText(line).width;
      if (lineWidth < this.maxWidth) {
        result++;
        continue;
      }
      while (lineWidth > 0) {
        // Binary search to find the maximum number of characters that fit within maxWidth
        let start = 0;
        let end = line.length;
        let fitIndex = 0;

        while (start <= end) {
          const mid = Math.floor((start + end) / 2);
          const testWidth = ctx.measureText(line.substring(0, mid)).width;

          if (testWidth <= this.maxWidth) {
            fitIndex = mid;
            start = mid + 1;
          } else {
            end = mid - 1;
          }
        }
        line = line.substring(fitIndex);
        lineWidth -= this.maxWidth;
        result++;
      }
    }
    return result;
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
      this.textEditor.getContent().join("\n"),
      this.getId()
    );
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
