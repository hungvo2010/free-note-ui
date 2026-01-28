import WhiteBoard from "@features/whiteboard/components/WhiteBoard";
import Toolbar from "@features/whiteboard/components/Toolbar";
import { ThemeProvider } from "@shared/contexts/ThemeContext";
import { StrictMode, useState } from "react";

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
  const [selected, setSelected] = useState(3);
  const handleSelected = (val: number) => {
    setSelected(val);
  };

  return (
    <ThemeProvider>
      <Toolbar
        options={options}
        selected={selected}
        handleSelected={handleSelected}
      />
      <StrictMode>
        <WhiteBoard
          type={options[selected]}
          isLocked={options[selected] === "lock"}
        />
        </StrictMode>
      </ThemeProvider>
  );
}
