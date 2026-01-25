import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AppProfiler } from "./components/AppProfiler.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppProfiler id="Root">
    <App />
  </AppProfiler>
);
