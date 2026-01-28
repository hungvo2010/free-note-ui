import { Shape } from "types/shape/Shape";
import { Rectangle } from "types/shape/Rectangle";
import { RectangleAdapter } from "types/shape/RectangleAdapter";
import { Circle } from "types/shape/Circle";
import { CircleAdapter } from "types/shape/CircleAdapter";
import Arrow from "types/shape/Arrow";
import { Line } from "types/shape/Line";
import { FreeStyleShape } from "types/shape/FreeStyleShape";
import { Diamond } from "types/shape/Diamond";
import { TextShape } from "types/shape/Text";
import { ImageShape } from "types/shape/ImageShape";

/**
 * Converts JSON to a Shape object
 * Supports both new schema format (shapeId, content) and legacy format (type, data)
 */
export function jsonToShape(json: any): Shape | undefined {
  const type = json.type;
  const content = json.content || json.data || {};
  const id = json.shapeId || content.id;
  
  if (!type) return undefined;

  switch (type) {
    case "rectangle":
      return createRectangle(content, id);
    case "circle":
      return createCircle(content, id);
    case "arrow":
      return createArrow(content, id);
    case "line":
      return createLine(content, id);
    case "freestyle":
      return createFreestyle(content, id);
    case "diamond":
      return createDiamond(content, id);
    case "text":
      return createText(content, id);
    case "image":
      return createImage(content);
    default:
      return undefined;
  }
}

/**
 * Converts an array of JSON objects to Shape objects
 */
export function jsonToShapes(jsonArray: any[]): Shape[] {
  const shapes: Shape[] = [];
  for (const json of jsonArray) {
    const shape = jsonToShape(json);
    if (shape) shapes.push(shape);
  }
  return shapes;
}

// Shape creation helpers

function createRectangle(content: any, id: any): Shape {
  const { x, y, width, height } = content;
  const rect = new Rectangle(undefined, x, y, width, height);
  const numId = toNumberId(id);
  return new RectangleAdapter(undefined, rect, numId);
}

function createCircle(content: any, id: any): Shape {
  const { x, y, radius } = content;
  const circle = new Circle(undefined, x, y, radius);
  const numId = toNumberId(id);
  return new CircleAdapter(undefined, circle, numId);
}

function createArrow(content: any, id: any): Shape {
  const { x1, y1, x2, y2 } = content;
  const arrow = new Arrow(undefined, x1, y1, id);
  arrow.x2 = x2;
  arrow.y2 = y2;
  return arrow;
}

function createLine(content: any, id: any): Shape {
  const { x1, y1, x2, y2 } = content;
  const line = new Line(undefined, x1, y1, id);
  line.x2 = x2;
  line.y2 = y2;
  return line;
}

function createFreestyle(content: any, id: any): Shape {
  const { points } = content;
  return new FreeStyleShape(undefined, points as [number, number][], id);
}

function createDiamond(content: any, id: any): Shape {
  const { x1, y1, x2, y2 } = content;
  const diam = new Diamond(undefined, x1, y1, id);
  diam.x2 = x2;
  diam.y2 = y2;
  return diam;
}

function createText(content: any, id: any): Shape {
  const { x, y, text } = content;
  return new TextShape(undefined, x, y, text, id);
}

function createImage(content: any): Shape {
  const { url, x, y, width, height } = content;
  return new ImageShape(undefined, url, x, y, width, height);
}

function toNumberId(id: unknown): number {
  if (typeof id === "number") return id;
  const parsed = parseInt(String(id), 10);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}
