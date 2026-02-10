import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "./Shape";
import { Rectangle } from "./Rectangle";
import { SerializedShape } from "@shared/lib/serialization/ShapeSerializer";

export class ImageShape extends Shape {
  serialize(): SerializedShape {
    return {
      type: "image",
      data: {
        id: this.getId(),
        url: this.url,
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
      },
    };
  }

  tryReUse(offsetX: number, offsetY: number): boolean {
    return false;
  }

  private image: HTMLImageElement;
  private isLoaded: boolean = false;
  // Add a static redraw callback that can be set by WhiteBoard
  private static redrawCallback: (() => void) | null = null;

  // Method to set the redraw callback
  public static setRedrawCallback(callback: () => void): void {
    ImageShape.redrawCallback = callback;
  }

  constructor(
    roughCanvas: RoughCanvas | undefined,
    private url: string,
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {
    super(roughCanvas);
    this.image = new Image();

    // Set up load handler before setting src
    this.image.onload = () => {
      this.isLoaded = true;

      // Calculate dimensions if needed
      if (width === 0 || height === 0) {
        if (this.roughCanvas) {
          const canvas = document.getElementById(
            "myCanvas"
          ) as HTMLCanvasElement;
          if (canvas) {
            this.calculateOptimalDimensions(canvas);
          } else {
            // Fallback if canvas not available
            this.width = width === 0 ? this.image.width : width;
            this.height = height === 0 ? this.image.height : height;
          }
        }
      }

      // Trigger redraw when image loads
      if (ImageShape.redrawCallback) {
        ImageShape.redrawCallback();
      }
    };

    // Add error handling
    this.image.onerror = () => {
      console.error("Failed to load image:", url);
      // Create a placeholder for failed images
      this.width = width || 200;
      this.height = height || 200;
    };

    // Set src after handlers are in place
    this.image.src = url;
  }

  fullDrawShape(offsetX: number, offsetY: number): void {
    if (!this.roughCanvas) return;
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Only draw if the image is loaded
    if (this.isLoaded) {
      ctx.drawImage(
        this.image,
        this.x + offsetX,
        this.y + offsetY,
        this.width,
        this.height
      );
    } else {
      // Draw a placeholder while loading
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(
        this.x + offsetX,
        this.y + offsetY,
        this.width || 200,
        this.height || 200
      );
      ctx.strokeStyle = "#cccccc";
      ctx.strokeRect(
        this.x + offsetX,
        this.y + offsetY,
        this.width || 200,
        this.height || 200
      );
      ctx.fillStyle = "#999999";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Loading image...",
        this.x + offsetX + (this.width || 200) / 2,
        this.y + offsetY + (this.height || 200) / 2
      );
    }
  }

  private calculateOptimalDimensions(canvas: HTMLCanvasElement): void {
    // Get canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Set maximum dimensions (e.g., 80% of canvas size)
    const maxWidth = canvasWidth * 0.4;
    const maxHeight = canvasHeight * 0.4;

    // Get image's natural dimensions
    const imgWidth = this.image.width;
    const imgHeight = this.image.height;

    // Calculate scale factors
    const widthRatio = maxWidth / imgWidth;
    const heightRatio = maxHeight / imgHeight;

    // Use the smaller ratio to ensure image fits within constraints
    const scaleFactor = Math.min(widthRatio, heightRatio, 1); // Don't upscale small images

    // Set dimensions while maintaining aspect ratio
    this.width = Math.round(imgWidth * scaleFactor);
    this.height = Math.round(imgHeight * scaleFactor);

    // Ensure minimum dimensions
    this.width = Math.max(this.width, 100);
    this.height = Math.max(this.height, 100);
  }

  getBoundingRect(): Rectangle {
    return new Rectangle(
      this.roughCanvas,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  isPointInShape(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  applyNewCoordinates(changeX: number, changeY: number): Shape {
    const newImageShape = new ImageShape(
      this.roughCanvas,
      this.url,
      this.x + changeX,
      this.y + changeY,
      this.width,
      this.height
    );
    newImageShape.isLoaded = this.isLoaded;
    return newImageShape;
  }

  applyVirtualCoordinates(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  clone(x: number, y: number): Shape {
    return new ImageShape(
      this.roughCanvas,
      this.url,
      x,
      y,
      this.width,
      this.height
    );
  }
}
