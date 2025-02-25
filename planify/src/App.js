import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Authorization from "./components/Authorization";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/authorization" element={<Authorization />} />
      </Routes>
    </div>
  );
}

export default App;
