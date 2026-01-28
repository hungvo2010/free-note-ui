import { BrowserRouter, Route, Routes } from "react-router";
import WhiteboardPage from "@pages/WhiteBoardPage";
import PlaygroundPage from "@features/playground/pages/PlaygroundPage";
import "@styles/App.css";
import "@styles/global.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/draft/:draftId" element={<WhiteboardPage />} />
        <Route path="/" element={<WhiteboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
