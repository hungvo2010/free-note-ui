import Toolbar from "@features/whiteboard/components/Toolbar";
import WhiteBoard from "@features/whiteboard/components/WhiteBoard";
import { ThemeProvider } from "@shared/contexts/ThemeContext";
import { StrictMode, useState } from "react";
import "./WhiteBoardPage.scss";

const options = [
  "lock",
  "hand",
  "select",
  "rect",
  "diam",
  "circle",
  "arrow",
  "line",
  "pen",
  "text",
  "image",
  "eraser",
  "ai",
];
export default function WhiteboardPage() {
  const [selected, setSelected] = useState(
    parseInt(localStorage.getItem("selectedTool")?.toString() || "3"),
  );
  const handleSelected = (val: number) => {
    setSelected(val);
    localStorage.setItem("selectedTool", val.toString());
  };

  return (
    <ThemeProvider>
      <div className="whiteboard-page">
        <Toolbar
          options={options}
          selected={selected}
          handleSelected={handleSelected}
        />
        <StrictMode>
          <div className="whiteboard-canvas-wrapper">
            <WhiteBoard
              type={options[selected]}
              isLocked={options[selected] === "lock"}
            />
          </div>
        </StrictMode>
      </div>
    </ThemeProvider>
  );
}
