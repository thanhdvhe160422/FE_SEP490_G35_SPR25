import React from "react";
import ReactDOM from "react-dom/client"; // 🔥 Sử dụng React 18 API
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")); // 🔥 Dùng createRoot
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
