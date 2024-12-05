import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { distance } from "utils/GeometryUtils";
import { Shape } from "./Shape";

export class Diamond implements Shape {
    private drawable: Drawable | undefined;
    public x2: number | undefined;
    public y2: number | undefined
    constructor(
        public roughCanvas: RoughCanvas | undefined,
        public x1: number, public y1: number,) { }
    clone(x: number, y: number): Shape {
        const newDiamond = new Diamond(this.roughCanvas, this.x1, this.y1);
        newDiamond.x2 = x;
        newDiamond.y2 = y;
        return newDiamond;
    }

    draw(): void {
        if (!this.x2 || !this.y2) {
            return;
        }
        if (this.drawable) {
            this.roughCanvas?.draw(this.drawable);
            return;
        }
        this.drawable = this.drawDiamond(this.x1, this.y1, this.x2, this.y2);
    }

    drawDiamond(x1: number, y1: number, x2: number, y2: number) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const mainPoint = {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
        };
        const distanceInY = (Math.sin(angle) * distance(x1, y1, x2, y2)) / 2;
        const left = {
            x: x1,
            y: y1 + distanceInY,
        };
        const top = {
            x: mainPoint.x,
            y: mainPoint.y - distanceInY,
        };
        const right = {
            x: x2,
            y: y2 - distanceInY,
        };
        const bottom = {
            x: mainPoint.x,
            y: mainPoint.y + distanceInY,
        };
        return this.roughCanvas?.linearPath(
            [
                [left.x, left.y],
                [top.x, top.y],
                [right.x, right.y],
                [bottom.x, bottom.y],
                [left.x, left.y],
            ],
            {
                roughness: 1,
                stroke: "black",
                seed: 1
            }
        );
    };

}