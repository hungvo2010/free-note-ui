import { Profiler, useState } from "react";
import "./App.css";
import WhiteBoard from "./components/rough/WhiteBoard";
import Toolbar from "./components/toolbar/Toolbar";
import "./styles/global.scss";
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
    <>
      <Toolbar
        options={options}
        selected={selected}
        handleSelected={handleSelected}
      />
      <Profiler id="App" onRender={onRender}>
        <WhiteBoard type={options[selected]} />
      </Profiler>
    </>
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
