import { BrowserRouter, Route, Routes } from "react-router";
import WhiteboardPage from "WhiteBoardPage";
import "./App.css";
import "./styles/global.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/draft/:draftId" element={<WhiteboardPage />} />
        <Route path="/" element={<WhiteboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
