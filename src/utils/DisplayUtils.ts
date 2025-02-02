export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

export function virtualHeight(
  canvas: HTMLCanvasElement,
  scale: number
): number {
  return canvas.clientHeight / scale;
}

export function virtualWidth(canvas: HTMLCanvasElement, scale: number): number {
  return canvas.clientWidth / scale;
}
