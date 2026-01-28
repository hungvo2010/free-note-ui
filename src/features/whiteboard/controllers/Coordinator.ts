export class Coordinator {
    constructor(
        private readonly offsetX: number,
        private readonly offsetY: number
    ) {}    

    getOffsetX(): number {
        return this.offsetX;
    }

    getOffsetY(): number {
        return this.offsetY;
    }
}