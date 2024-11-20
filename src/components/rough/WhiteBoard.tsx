import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";

import { Arrow } from "../../types/Arrow";
import { Circle } from "../../types/Circle";
import { CircleAdapter } from "../../types/CircleAdapter";
import { Rectangle } from "../../types/Rectangle";
import { RectangleAdapter } from "../../types/RectangleAdapter";
import { Shape } from "../../types/Shape";
import { calculatePadding, distance } from "../../utils/GeometryUtils";
import "./WhiteBoard.scss";

type DrawTypeProps = {
  type: string;
};

const PADDING = 10;

export default function WhiteBoard(props: DrawTypeProps) {
  const shapes = useRef<Shape[]>([]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const canvasRef = useRef(null);
  const [roughCanvas, setRoughCanvas] = useState<RoughCanvas>();
  const [drawing, setDrawing] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState("");
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
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
        case "rect":
          shapes.current.push(
            new RectangleAdapter(
              new Rectangle(roughCanvas, x, y, 0, 0),
              new Date().getMilliseconds()
            )
          );
          break;
        case "circle":
          shapes.current.push(
            new CircleAdapter(
              new Circle(roughCanvas, x, y, 0),
              new Date().getMilliseconds()
            )
          );
          break;
        case "arrow":
          shapes.current.push(new Arrow(roughCanvas, x, y));
          break;
      }
      setDrawing(true);
      setStartPosition({ x, y });
      positionRef.current = { x, y };
    },
    [props.type]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drawing) return;
      const { x, y } = getCanvasCoordinates(e);
      switch (props.type) {
        case "rect":
          // clearLastRectangle();
          updateLastRect(x, y);
          // drawRect(positionRef.current.x, positionRef.current.y, x, y);
          reDraw();
          break;
        case "diam":
          drawDiamond(positionRef.current.x, positionRef.current.y, x, y);
          break;
        case "arrow":
          updateLastArrow(x, y);
          reDraw();
          break;
        case "circle":
          updateLastCircle(x, y);
          // const x1 =
          //   curvePointsRef.current[curvePointsRef.current.length - 1][0];
          // const y1 =
          //   curvePointsRef.current[curvePointsRef.current.length - 1][1];
          // clearCircle(
          //   (positionRef.current.x + x1) / 2,
          //   (positionRef.current.y + y1) / 2,
          //   distance(x1, y1, positionRef.current.x, positionRef.current.y) / 2
          // );
          // drawCircle(positionRef.current.x, positionRef.current.y, x, y);
          reDraw();
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
      const { x, y } = getCanvasCoordinates(e);
      switch (props.type) {
        // case "rect":
        //   drawRect(positionRef.current.x, positionRef.current.y, x, y);
        //   break;
        case "line":
          drawLine(positionRef.current.x, positionRef.current.y, x, y);
          break;
        // case "arrow":
        //   drawArrow(positionRef.current.x, positionRef.current.y, x, y);
        //   break;
        // case "circle":
        //   drawCircle(positionRef.current.x, positionRef.current.y, x, y);
        //   break;
        // case "diam":
        //   drawDiamond(positionRef.current.x, positionRef.current.y, x, y);
        //   break;
      }
      setDrawing(false);
    },
    [props.type]
  );

  const reDraw = useCallback(() => {
    const ctx = canvas?.getContext("2d");
    // console.log("reDraw", ctx, shapes.current);
    if (ctx) {
      ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    }
    console.log("reDraw", shapes.current);
    for (const shape of shapes.current) {
      shape.draw();
    }
  }, [canvas]);

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

  const clearCircle = (x: number, y: number, radius: number) => {
    const context = canvas?.getContext("2d");
    if (context) {
      context.save();
      context.globalCompositeOperation = "destination-out";
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI, false);
      context.fill();
      context.restore();
    }
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
    // clearInterval(caretInterval.current);
    // setIsCaretVisible(true);
    // caretInterval.current = setInterval(() => {
    //   setIsCaretVisible((prev) => !prev);
    // }, 500);
  };

  const drawCircle = (x: number, y: number, x1: number, y1: number) => {
    const angle = Math.atan2(y1 - y, x1 - x);

    roughCanvas?.circle(
      (x + x1) / 2,
      (y + y1) / 2,
      (distance(x1, y1, x, y) * Math.cos(angle)) / 2,
      {
        roughness: 1,
        stroke: "black",
        curveFitting: 0.95,
      }
    );
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

  function updateLastRect(x: number, y: number) {
    const lastRect = shapes.current[
      shapes.current.length - 1
    ] as RectangleAdapter;
    shapes.current[shapes.current.length - 1] = new RectangleAdapter(
      new Rectangle(
        roughCanvas,
        lastRect.getStartPoint().x,
        lastRect.getStartPoint().y,
        x - positionRef.current.x,
        y - positionRef.current.y
      ),
      new Date().getMilliseconds()
    );
  }

  function updateLastArrow(x: number, y: number) {
    const lastArrow = shapes.current[shapes.current.length - 1] as Arrow;
    const newArrow = new Arrow(roughCanvas, lastArrow.x1, lastArrow.y1);
    newArrow.x2 = x;
    newArrow.y2 = y;
    shapes.current[shapes.current.length - 1] = newArrow;
  }

  function updateLastCircle(x: number, y: number) {
    const lastCircle = shapes.current[
      shapes.current.length - 1
    ] as CircleAdapter;
    shapes.current[shapes.current.length - 1] = new CircleAdapter(
      new Circle(
        roughCanvas,
        (lastCircle.getCenterPoint().x + x) / 2,
        (lastCircle.getCenterPoint().y + y) / 2,
        distance(x, y, positionRef.current.x, positionRef.current.y) / 2
      ),
      new Date().getMilliseconds()
    );
  }

  function clearLastRectangle() {
    const lastX = curvePointsRef.current[curvePointsRef.current.length - 1][0];
    const lastY = curvePointsRef.current[curvePointsRef.current.length - 1][1];
    const angle = Math.atan2(
      lastY - positionRef.current.y,
      lastX - positionRef.current.x
    );
    const padding = calculatePadding((angle * 180) / Math.PI, PADDING);
    clearRect(
      positionRef.current.x - padding[0],
      positionRef.current.y - padding[1],
      lastX - positionRef.current.x + padding[0] * 2,
      lastY - positionRef.current.y + padding[1] * 2
    );
  }
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
