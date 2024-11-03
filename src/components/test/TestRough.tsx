import { useEffect, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import "./TestRough.scss";

export default function TestRough() {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [elements, setElements] = useState<any>();
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const [drawing, setDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    setCanvas(myCanvas);
    setRoughCanvas(rough.canvas(myCanvas));

    const handleMouseDown = (e: MouseEvent) => {
      console.log("mouse down");
      const { x, y } = getCanvasCoordinates(e);
      console.log(x, y);
      setStartPosition({ x, y });
      setDrawing(true); // Begin drawing
    };

    const handleMouseMove = (e: MouseEvent) => {
      // console.log(e.clientX, e.clientY);
      // console.log("mouse move");
    };

    const getCanvasCoordinates = (e: MouseEvent) => {
      const rect = myCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return { x, y };
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!drawing) return;
      console.log("mouse up");
      const { x, y } = getCanvasCoordinates(e);
      console.log(x, y, startPosition);
      roughCanvas?.rectangle(
        startPosition.x,
        startPosition.y,
        Math.abs(x - startPosition.x),
        Math.abs(y - startPosition.y),
        { roughness: 1, stroke: "black" }
        // { fill: "red" }
      ); // x, y, width, height, e.clientY);

      setDrawing(false);
    };

    myCanvas.addEventListener("mousedown", handleMouseDown);
    myCanvas.addEventListener("mousemove", handleMouseMove);
    myCanvas.addEventListener("mouseup", handleMouseUp);
    return () => {
      myCanvas.removeEventListener("mousedown", handleMouseDown);
      myCanvas.removeEventListener("mousemove", handleMouseMove);
      myCanvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [drawing, startPosition]);

  return (
    <>
      <canvas className="full-canvas" id="myCanvas"></canvas>
      <br />
      {/* <button
        onClick={() => {
          if (!roughCanvas) return;
          roughCanvas.circle(80, 120, 50); // centerX, centerY, diameter
          roughCanvas.ellipse(300, 100, 150, 80); // centerX, centerY, width, height
          roughCanvas.line(80, 120, 300, 100); // x1, y1, x2, y2
        }}
      >
        Line
      </button> */}
    </>
  );
}
