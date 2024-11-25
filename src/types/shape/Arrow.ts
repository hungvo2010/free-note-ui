import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { distance } from "utils/GeometryUtils";
import { Shape } from "./Shape";

export default class Arrow implements Shape {
    private mainDrawable: Drawable | undefined;
    private leftDrawable: Drawable | undefined;
    private rightDrawable: Drawable | undefined;
    public x2: number | undefined;
    public y2: number | undefined;

    constructor(
        public roughCanvas: RoughCanvas | undefined,
        public x1: number,
        public y1: number,
    ) { }

    draw(): void {
        if (this.mainDrawable && this.leftDrawable && this.rightDrawable) {
            this.roughCanvas?.draw(this.mainDrawable);
            this.roughCanvas?.draw(this.leftDrawable);
            this.roughCanvas?.draw(this.rightDrawable);
            return;
        }
        if (!this.x1 || !this.y1 || !this.x2 || !this.y2) {
            return;
        }
        var main = this.drawLine(this.x1, this.y1, this.x2, this.y2);
        if (distance(this.x1, this.y1, this.x2, this.y2) < 20) return;

        this.mainDrawable = main;

        const headLength = 15;
        const angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
        this.leftDrawable = this.drawLine(
            this.x2,
            this.y2,
            this.x2 - headLength * Math.cos(angle - Math.PI / 6),
            this.y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.rightDrawable = this.drawLine(
            this.x2,
            this.y2,
            this.x2 - headLength * Math.cos(angle + Math.PI / 6),
            this.y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
    }

    private drawLine(x1: number, y1: number, x2: number, y2: number) {
        return this.roughCanvas?.line(x1, y1, x2, y2, {
            roughness: 1,
            stroke: "black",
            seed: 3
        });
    };
}