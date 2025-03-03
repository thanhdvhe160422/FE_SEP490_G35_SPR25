import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Author/Login";
import Authorization from "./components/Authorization";
import LoginAdmin from "./pages/Author/LoginAdmin";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Author/Home";
import Profile from "./pages/Author/Profile";
import CreateEvent from "./pages/Events/CreateEvent";
import UpdateProfile from "./pages/Author/UpdateProfile";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/authorization" element={<Authorization />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-event" element={<CreateEvent />} />
        
      </Routes>
    </div>
  );
}

export default App;
