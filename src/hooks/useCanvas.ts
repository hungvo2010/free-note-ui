import { useState, useEffect, useRef } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Config } from "roughjs/bin/core";

export function useCanvas(config?: Config) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const canvasRef = useRef<HTMLCanvasElement>(
    document.getElementById("myCanvas") as HTMLCanvasElement
  );

  useEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = myCanvas.getContext("2d");
    if (myCanvas && ctx) {
      ctx.font = "20px iA Writer Quattro S";
    }
    const newRoughCanvas = rough.canvas(myCanvas, config);
    setCanvas(myCanvas);
    setRoughCanvas(newRoughCanvas);
  }, []);

  return { canvas, roughCanvas, canvasRef };
}
