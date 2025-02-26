import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Author/Login";
import Authorization from "./components/Authorization";
import HeaderManagerCampus from "./components/Header/HeaderManagerCampus";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/authorization" element={<Authorization />} />
        <Route path="/homeMC" element={<HeaderManagerCampus />}></Route>
      </Routes>
    </div>
  );
}

export default App;
