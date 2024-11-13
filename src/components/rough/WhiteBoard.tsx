import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import "./WhiteBoard.scss";

type DrawTypeProps = {
  type: string;
};

export default function WhiteBoard(props: DrawTypeProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const canvasRef = useRef(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const [drawing, setDrawing] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [isCaretVisible, setIsCaretVisible] = useState(true);
  const caretInterval = useRef(-1);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    function updateSize() {
      const canvas = canvasRef.current;
      if (canvas) {
        resizeCanvasToDisplaySize(canvas);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const myCanvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = myCanvas.getContext("2d");
    if (myCanvas && ctx) {
      ctx.font = "Just Another Hand, cursive";
    }
    setCanvas(myCanvas);
    setRoughCanvas(rough.canvas(myCanvas));

    myCanvas.addEventListener("mousedown", handleMouseDown);
    myCanvas.addEventListener("mousemove", handleMouseMove);
    myCanvas.addEventListener("mouseup", handleMouseUp);
    return () => {
      myCanvas.removeEventListener("mousedown", handleMouseDown);
      myCanvas.removeEventListener("mousemove", handleMouseMove);
      myCanvas.removeEventListener("mouseup", handleMouseUp);
      // clearInterval(caretInterval.current);
    };
  }, [drawing, startPosition]);

  useEffect(() => {
    const ctx = canvas?.getContext("2d");
    if (isCaretVisible && ctx) {
      const textWidth = ctx.measureText(currentText).width;
      ctx.beginPath();
      ctx.moveTo(startPosition.x + textWidth, startPosition.y - 12);
      ctx.lineTo(startPosition.x + textWidth, startPosition.y + 4);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      console.log("start drawWorld position: ", startPosition);
      const ctx = canvas?.getContext("2d");
      ctx?.clearRect(startPosition.x, 0, canvas?.width || 0, canvas?.height || 0);
      // ctx?.clearRect(10, 10, 120, 100);
    }
  }, [isCaretVisible]);

  const handleMouseDown = (e: MouseEvent) => {
    console.log("mouse down");
    const { x, y } = getCanvasCoordinates(e);
    setStartPosition({ x, y });
    switch (props.type) {
      case "word":
        drawWord(x, y);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    setCurrentText((val) => val + e.key);
  };

  const handleMouseMove = (e: MouseEvent) => {
    // console.log(e.clientX, e.clientY);
    // console.log("mouse move");
    setDrawing(true); // Begin drawing
  };

  const getCanvasCoordinates = (e: MouseEvent) => {
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    roughCanvas?.line(x1, y1, x2, y2, {
      roughness: 1,
      stroke: "black",
    });
  };

  const drawWord = (x: number, y: number) => {
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      canvas.focus();
      setCurrentText("");
    }
    console.log("start drawWord: ", { x, y });
    clearInterval(caretInterval.current);
    caretInterval.current = setInterval(() => {
      setIsCaretVisible((prev) => !prev);
    }, 500);
  };

  const drawCircle = (x: number, y: number, x1: number, y1: number) => {
    roughCanvas?.circle(x, y, distance(x1, y1, x, y), {
      roughness: 1,
      stroke: "black",
      curveFitting: 0.2,
    });
  };

  const drawDiamond = (x1: number, y1: number, x2: number, y2: number) => {
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
    roughCanvas?.linearPath(
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
      }
    );
  };

  const drawArrow = (x1: number, y1: number, x2: number, y2: number) => {
    drawLine(x1, y1, x2, y2);
    if (distance(x1, y1, x2, y2) < 20) return;

    const headLength = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    drawLine(
      x2,
      y2,
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    drawLine(
      x2,
      y2,
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!drawing) return;
    console.log("mouse up");
    const { x, y } = getCanvasCoordinates(e);
    switch (props.type) {
      case "rect":
        drawRect(roughCanvas, startPosition, x, y);
        break;
      case "line":
        drawLine(startPosition.x, startPosition.y, x, y);
        break;
      case "arrow":
        drawArrow(startPosition.x, startPosition.y, x, y);
        break;
      case "circle":
        drawCircle(startPosition.x, startPosition.y, x, y);
        break;
      case "diam":
        drawDiamond(startPosition.x, startPosition.y, x, y);
        break;
    }

    setDrawing(false);
  };

  return (
    <canvas
      id="myCanvas"
      className="full-canvas"
      ref={canvasRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    ></canvas>
  );
}

function drawRect(
  roughCanvas: RoughCanvas | undefined,
  startPosition: { x: number; y: number },
  x: number,
  y: number
) {
  roughCanvas?.rectangle(
    startPosition.x,
    startPosition.y,
    x - startPosition.x,
    y - startPosition.y,
    { roughness: 1, stroke: "black" }
  );
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  // look up the size the canvas is being displayed
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // If it's resolution does not match change it
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }

  return false;
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}
