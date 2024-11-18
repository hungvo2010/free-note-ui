import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import "./WhiteBoard.scss";

type DrawTypeProps = {
  type: string;
};

const PADDING = 10;

export default function WhiteBoard(props: DrawTypeProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const canvasRef = useRef(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const [drawing, setDrawing] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState("");
  const [isCaretVisible, setIsCaretVisible] = useState(true);
  const caretInterval = useRef(-1);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [lastCaret, setLastCaret] = useState({ x: 0, y: 0 });
  const lastCaretRef = useRef(lastCaret);
  const positionRef = useRef(startPosition);
  const roughCanvasRef = useRef(roughCanvas);
  const [curvePoints, setCurvePoints] = useState<[number, number][]>([[0, 0]]);
  const curvePointsRef = useRef(curvePoints);

  const drawPen = (x2: number, y2: number) => {
    roughCanvas?.curve([...curvePointsRef.current, [x2, y2]], {
      roughness: 0.1,
      strokeWidth: 2,
    });
  };

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const { x, y } = getCanvasCoordinates(e);
      switch (props.type) {
        case "word":
          clearRect(
            lastCaretRef.current.x - 2,
            lastCaretRef.current.y - 12,
            3,
            17
          );
          lastCaretRef.current = { x, y };
          setLastCaret({ x, y });
          drawWord(x, y);
          break;
        default:
          setDrawing(true);
      }
      setStartPosition({ x, y });
      positionRef.current = { x, y };
      console.log("handleMouseDown: ", { x, y });
      if (props.type === "pen") {
        setCurvePoints([[x, y]]);
        curvePointsRef.current = [[x, y]];
      }
    },
    [props.type]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drawing) return;
      const { x, y } = getCanvasCoordinates(e);
      switch (props.type) {
        case "rect":
          const lastX =
            curvePointsRef.current[curvePointsRef.current.length - 1][0];
          const lastY =
            curvePointsRef.current[curvePointsRef.current.length - 1][1];
          const angle = Math.atan2(
            lastY - positionRef.current.y,
            lastX - positionRef.current.x
          );
          const padding = calculatePadding((angle * 180) / Math.PI, PADDING);
          console.log(padding);
          clearRect(
            positionRef.current.x - padding[0],
            positionRef.current.y - padding[1],
            lastX - positionRef.current.x + padding[0] * 2,
            lastY - positionRef.current.y + padding[1] * 2
          );
          drawRect(positionRef.current.x, positionRef.current.y, x, y);
          break;
        case "pen":
          drawPen(x, y);
          break;
      }
      setCurvePoints((prev) => [...prev, [x, y]]);
      curvePointsRef.current = [...curvePointsRef.current, [x, y]];
    },
    [props.type, drawing]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      // if (!drawing) return;
      const { x, y } = getCanvasCoordinates(e);
      console.log("handleMouseUp: ", { x, y }, props.type);
      // console.log(positionRef.current);
      switch (props.type) {
        // case "rect":
        //   drawRect(positionRef.current.x, positionRef.current.y, x, y);
        //   break;
        case "line":
          drawLine(positionRef.current.x, positionRef.current.y, x, y);
          break;
        case "arrow":
          drawArrow(positionRef.current.x, positionRef.current.y, x, y);
          break;
        case "circle":
          drawCircle(positionRef.current.x, positionRef.current.y, x, y);
          break;
        case "diam":
          drawDiamond(positionRef.current.x, positionRef.current.y, x, y);
          break;
      }
      if (props.type !== "word") {
        clearRect(
          lastCaretRef.current.x - 1,
          lastCaretRef.current.y - 12,
          3,
          17
        );
      }
      setDrawing(false);
    },
    [props.type]
  );

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
      ctx.font = "20px Excalifont";
    }
    const newRoughCanvas = rough.canvas(myCanvas);
    setCanvas(myCanvas);
    setRoughCanvas(newRoughCanvas);
    roughCanvasRef.current = newRoughCanvas;

    myCanvas.addEventListener("mousedown", handleMouseDown);
    myCanvas.addEventListener("mousemove", handleMouseMove);
    myCanvas.addEventListener("mouseup", handleMouseUp);
    return () => {
      console.log("on cleanup function");
      myCanvas.removeEventListener("mousedown", handleMouseDown);
      myCanvas.removeEventListener("mousemove", handleMouseMove);
      myCanvas.removeEventListener("mouseup", handleMouseUp);
      // clearInterval(caretInterval.current);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  const clearRect = (x: number, y: number, width: number, height: number) => {
    const ctx = canvas?.getContext("2d");
    ctx?.clearRect(x, y, width, height);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    console.log("handleKeyDown: " + e.key.length);
    const ctx = canvas?.getContext("2d");
    if (ctx && props.type === "word") {
      // ctx.font = "30px Excalifont";
      const textWidth = ctx.measureText(currentText).width;
      clearRect(
        positionRef.current.x,
        positionRef.current.y - 12,
        textWidth,
        20
      );
      ctx?.fillText(
        currentText + e.key,
        positionRef.current.x,
        positionRef.current.y
      );
      setCurrentText((val) => val + e.key);
    }
  };

  const getCanvasCoordinates = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) {
      return { x: 0, y: 0 };
    }
    const rect = (
      canvasRef.current as HTMLCanvasElement
    ).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }, []);

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    roughCanvas?.line(x1, y1, x2, y2, {
      roughness: 1,
      stroke: "black",
    });
  };

  const drawWord = (x: number, y: number) => {
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      setCurrentText("");
    }
    clearInterval(caretInterval.current);
    setIsCaretVisible(true);
    caretInterval.current = setInterval(() => {
      setIsCaretVisible((prev) => !prev);
    }, 500);
  };

  const drawCircle = (x: number, y: number, x1: number, y1: number) => {
    roughCanvas?.circle((x + x1) / 2, (y + y1) / 2, distance(x1, y1, x, y), {
      roughness: 1,
      stroke: "black",
      curveFitting: 0.95,
    });
  };

  const drawRect = (x: number, y: number, x1: number, y1: number) => {
    roughCanvasRef.current?.rectangle(x, y, x1 - x, y1 - y, {
      roughness: 1,
      stroke: "black",
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

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
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

function calculatePadding(angle: number, lineWidth: number): [number, number] {
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
