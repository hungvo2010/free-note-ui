import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import WhiteboardPage from "WhiteBoardPage";
import "./App.css";
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
    <BrowserRouter>
      <Routes>
        <Route path="/draft/:draftId" element={<WhiteboardPage />} />
        <Route path="/" element={<WhiteboardPage />} />
      </Routes>
    </BrowserRouter>
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
