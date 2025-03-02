import { useState, useEffect, useRef } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

export function useCanvas() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const canvasRef = useRef<HTMLCanvasElement>(
    document.getElementById("myCanvas") as HTMLCanvasElement
  );

  useEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = myCanvas.getContext("2d");
    if (myCanvas && ctx) {
      ctx.font = "20px Excalifont";
    }
    const newRoughCanvas = rough.canvas(myCanvas);
    setCanvas(myCanvas);
    setRoughCanvas(newRoughCanvas);
  }, []);

  return { canvas, roughCanvas, canvasRef };
}
