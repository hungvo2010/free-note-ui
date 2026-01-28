import { RoughCanvas } from "roughjs/bin/canvas";
import { ImageShape } from "@shared/types/shapes/ImageShape";

export class ImageService {
  static openImageDialog(
    onShapeCreated: (imageShape: ImageShape) => void,
    roughCanvas: RoughCanvas | undefined,
    x: number,
    y: number,
    onReDraw: () => void
  ): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && roughCanvas) {
        // const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(file);
        const imageShape = new ImageShape(roughCanvas, url, x, y, 0, 0);
        onShapeCreated(imageShape);
      }
    };
    input.click();
    ImageShape.setRedrawCallback(onReDraw);
  }
}
