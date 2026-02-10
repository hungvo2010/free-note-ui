import { RoughCanvas } from "roughjs/bin/canvas";
import { CircleAdapter } from "@shared/types/shapes/CircleAdapter";
import { Shape } from "@shared/types/shapes/Shape";
import { distance, isPointInShape } from "@shared/utils/geometry/GeometryUtils";

/**
 * Controller for managing whiteboard shapes and canvas rendering.
 * Handles shape lifecycle, rendering, and coordinate transformations.
 * 
 * Note: This class does NOT implement the Observer pattern.
 * React Context and hooks handle reactivity for theme/canvas updates.
 */
export class ReDrawController {
  private theme: "light" | "dark" = "light";
  private static readonly MAX_SHAPES = 10000; // Prevent unbounded growth

  constructor(
    public roughCanvas: RoughCanvas | undefined,
    public canvas: HTMLCanvasElement | undefined,
    public shapes: Shape[] = []
  ) {}

  /**
   * Gets the current number of shapes.
   */
  public getShapeCount(): number {
    return this.shapes.length;
  }

  /**
   * Checks if the shape limit has been reached.
   */
  public isShapeLimitReached(): boolean {
    return this.shapes.length >= ReDrawController.MAX_SHAPES;
  }

  /**
   * Clears all shapes and frees memory.
   * Should be called when resetting the whiteboard or on unmount.
   */
  public clearAllShapes(): void {
    this.shapes = [];
  }

  /**
   * Cleans up resources when the controller is no longer needed.
   * Call this on component unmount to prevent memory leaks.
   */
  public dispose(): void {
    this.clearAllShapes();
    this.canvas = undefined;
    this.roughCanvas = undefined;
  }

  /**
   * Merges a shape into the shapes array.
   * Updates existing shape if ID matches, otherwise adds new shape.
   */
  mergeShape(shape: Shape): void {
    const existingIndex = this.shapes.findIndex(
      (s) => s.getId() === shape.getId()
    );
    if (existingIndex >= 0) {
      this.shapes[existingIndex] = shape;
      return;
    }
    this.shapes.push(shape);
  }

  /**
   * Updates theme and synchronizes all shapes with current canvas/theme state.
   * Called by React when theme changes via WhiteboardContext.
   */
  public setTheme(theme: "light" | "dark"): void {
    this.theme = theme;
    this.syncShapesWithTheme();
  }

  /**
   * Synchronizes all shapes with current roughCanvas.
   * Called when canvas reference changes.
   */
  public syncShapesWithCanvasState(): void {
    for (const shape of this.shapes) {
      shape.setRoughCanvas(this.roughCanvas);
    }
  }

  /**
   * Updates theme-dependent shapes (like TextShape) with current theme.
   * Called when theme changes.
   */
  private syncShapesWithTheme(): void {
    for (const shape of this.shapes) {
      // TextShape has a setTheme method for color updates
      if ('setTheme' in shape && typeof shape.setTheme === 'function') {
        shape.setTheme(this.theme);
      }
    }
  }

  /**
   * Gets current theme value.
   */
  public getTheme(): "light" | "dark" {
    return this.theme;
  }

  /**
   * Gets stroke options based on current theme.
   */
  public getStrokeOptions() {
    return {
      stroke: this.theme === "dark" ? "#ffffff" : "#000000",
      strokeWidth: 1,
    };
  }

  /**
   * Adds a new shape to the canvas.
   * Returns false if shape limit is reached.
   */
  public addShape(shape: Shape): boolean {
    if (this.isShapeLimitReached()) {
      console.warn(`Shape limit reached (${ReDrawController.MAX_SHAPES}). Cannot add more shapes.`);
      return false;
    }
    shape.setRoughCanvas(this.roughCanvas);
    this.shapes.push(shape);
    return true;
  }

  public checkSelectedShape(x: number, y: number): Shape | undefined {
    const shape = this.shapes.find((shape) => isPointInShape(shape, x, y));
    return shape;
  }

  public updateLastShape(
    x: number,
    y: number,
    currentX: number,
    currentY: number
  ) {
    const lastShape = this.shapes[this.shapes.length - 1];
    let nextX = currentX,
      nextY = currentY;
    if (lastShape instanceof CircleAdapter) {
      nextX = (currentX + x) / 2;
      nextY = (currentY + y) / 2;
    }
    const newShape = lastShape.clone(nextX, nextY);
    if (newShape instanceof CircleAdapter) {
      newShape.updateRadius(distance(nextX, nextY, x, y));
    }
    this.shapes[this.shapes.length - 1] = newShape;
  }

  public updateShape(shapeId: string, newShape: Shape) {
    const shape = this.shapes.find((shape) => shape.getId() === shapeId);
    if (shape) {
      this.shapes[this.shapes.indexOf(shape)] = newShape;
    }
  }

  public updateCoordinates(changeX: number, changeY: number) {
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i] = this.shapes[i].applyNewCoordinates(changeX, changeY);
    }
  }

  public reDraw(offsetX: number, offsetY: number) {
    const ctx = this.canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas?.width || 0, this.canvas?.height || 0);
    }
    console.log("Redrawing shapes total length: ", this.shapes.length);
    for (const shape of this.shapes || []) {
      shape.setRoughCanvas(this.roughCanvas);
      shape.draw(offsetX, offsetY);
    }
  }

  public setShapes(shapes: Shape[]): void {
    this.shapes = shapes;
  }

  public redrawUsingVirtualCoordinates(newOffsetX: number, newOffsetY: number) {
    for (let i = 0; i < this.shapes.length; i++) {
      this.shapes[i].applyVirtualCoordinates(newOffsetX, newOffsetY);
    }
  }

  public getShapes() {
    return this.shapes;
  }

  public getShapesUnderPoint(x: number, y: number): Shape[] {
    return this.shapes.filter((shape) => isPointInShape(shape, x, y));
  }

  public removeShapes(shapesToRemove: Shape[]): void {
    // Mutate array in-place to maintain reference
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (shapesToRemove.includes(this.shapes[i])) {
        this.shapes.splice(i, 1);
      }
    }
  }
}
