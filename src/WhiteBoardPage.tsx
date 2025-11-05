import WhiteBoard from "components/rough/WhiteBoard";
import Toolbar from "components/toolbar/Toolbar";
import { ThemeProvider } from "contexts/ThemeContext";
import { StrictMode, useState } from "react";

const options = [
  "lock",
  "hand",
  "mouse",
  "rect",
  "diam",
  "circle",
  "arrow",
  "line",
  "pen",
  "word",
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
