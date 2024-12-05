import { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "types/shape/Shape";

export class ReDrawController {
    reDraw() {
        for (const shape of this.shapes) {
            shape.draw();
        }
    }
    constructor(
        public roughCanvas: RoughCanvas | undefined,
        public shapes: Shape[] = []
    ) { }

    public addShape(shape: Shape) {
        this.shapes.push(shape);
    }

    public updateLastShape(x: number, y: number) {
        const lastShape = this.shapes[this.shapes.length - 1];
        const newShape = lastShape.clone(x, y);
        this.shapes[this.shapes.length - 1] = newShape;
    }
}