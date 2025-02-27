import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Author/Login";
import Authorization from "./components/Authorization";
import HeaderManagerCampus from "./components/Header/HeaderManagerCampus";
import LoginAdmin from "./pages/Author/LoginAdmin";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/authorization" element={<Authorization />} />
        <Route path="/homeManagerCampus" element={<HeaderManagerCampus />} />
      </Routes>
    </div>
  );
}

export default App;
