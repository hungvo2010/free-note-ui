import { useState } from "react";
import "./App.css";
import WhiteBoard from "./components/rough/WhiteBoard";
import Toolbar from "./components/toolbar/Toolbar";
import "./styles/global.scss";
var options = [
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
  const [selected, setSelected] = useState(0);
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
      <WhiteBoard type={options[selected]} />
    </>
  );
}

export default App;
