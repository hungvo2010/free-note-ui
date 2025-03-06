import { RoughCanvas } from "roughjs/bin/canvas";
import { ImageShape } from "types/shape/ImageShape";

export class ImageService {
  static openImageDialog(
    callback: (imageShape: ImageShape) => void,
    roughCanvas: RoughCanvas | undefined,
    x: number,
    y: number,
    onloadCallback: () => void
  ): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file && roughCanvas) {
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);
        const imageShape = new ImageShape(roughCanvas, url, x, y, 0, 0);
        callback(imageShape);
        ImageShape.setRedrawCallback(onloadCallback);
      }
    };
    input.click();
  }
}
