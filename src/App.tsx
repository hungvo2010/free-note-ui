import { StrictMode, useState } from "react";
import "./App.css";
import WhiteBoard from "./components/rough/WhiteBoard";
import Toolbar from "./components/toolbar/Toolbar";
import "./styles/global.scss";
import { ThemeProvider } from "./contexts/ThemeContext";
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

function App() {
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

function onRender(
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  // console.log("Aggregate or log render timings...", {
  //   baseDuration,
  //   actualDuration,
  //   startTime,
  //   commitTime,
  // });
}

export default App;
