import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { Shape } from "./Shape";

export class Line implements Shape {
    private drawable: Drawable | undefined;
    public x2: number | undefined;
    public y2: number | undefined
    constructor(
        public roughCanvas: RoughCanvas | undefined,
        public x1: number, public y1: number,) { }

    draw(): void {
        if (!this.x2 || !this.y2) {
            return;
        }
        if (this.drawable) {
            this.roughCanvas?.draw(this.drawable);
            return;
        }
        this.drawable = this.roughCanvas?.line(this.x1, this.y1, this.x2, this.y2, {
            roughness: 3,
            seed: 1,
            stroke: "black",
            strokeWidth: 1
        });
    }
}