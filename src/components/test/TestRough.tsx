import { useEffect, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import "./TestRough.scss";

type TestRoughSize = {
  width: number;
  height: number;
};

export default function TestRough() {
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const [elements, setElements] = useState([]);
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    setRoughCanvas(
      rough.canvas(document.getElementById("myCanvas") as HTMLCanvasElement)
    );
  }, [document.getElementById("myCanvas")]);

  useEffect(() => {
    if (!roughCanvas) return;
    roughCanvas.rectangle(140, 10, 100, 100, { fill: "white" });
  }, [roughCanvas]);

  return (
    <>
      <canvas className="full-canvas" id="myCanvas"></canvas>
      <br />
      <button
        onClick={() => {
          console.log("click");
          roughCanvas?.line(
            10,
            10 + 100 * Math.random(),
            10 + 10000 * Math.random(),
            10 + 10000 * Math.random()
          ),
            {
              strokeWidth: 1,
              stroke: "red",
            };
        }}
      >
        Line
      </button>
    </>
  );
}
