import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { Shape } from "./Shape";

export class Line implements Shape {
    private drawable: Drawable | undefined
    constructor(
        public roughCanvas: RoughCanvas | undefined,
        public x1: number, public y1: number, private x2: number, private y2: number) { }

    draw(): void {
        if (this.drawable) {
            console.log("redraw line");
            this.roughCanvas?.draw(this.drawable);
            return;
        }
        this.drawable = this.roughCanvas?.line(this.x1, this.y1, this.x2, this.y2, {
            roughness: 1,
            seed: 3,
            stroke: "black",
            strokeWidth: 1
        });
    }
}