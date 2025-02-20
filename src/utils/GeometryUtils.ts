export function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

export function calculatePadding(
  angle: number,
  lineWidth: number
): [number, number] {
  console.log("angle: " + angle);
  if (angle >= 0 && angle <= 90) {
    // bottom right corner
    return [lineWidth, lineWidth];
  } else if (angle > 90 && angle <= 180) {
    // top right corner
    return [-lineWidth, lineWidth];
  } else if (angle <= -90 && angle >= -180) {
    // top left corner
    return [-lineWidth, -lineWidth];
  } else if (angle >= -90 && angle < 0) {
    // bottom left corner
    return [lineWidth, -lineWidth];
  }
  return [0, 0];
}

export function getCanvasCoordinates(e: MouseEvent, canvas: HTMLCanvasElement) {
  if (!canvas) {
    return { x: 0, y: 0 };
  }
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return { x, y };
}
