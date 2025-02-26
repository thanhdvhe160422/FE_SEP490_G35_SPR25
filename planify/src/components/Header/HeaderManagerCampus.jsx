import React from "react";
import "./HeaderManagerCampus.css";
import logo from "../../assets/logo-fptu.png";
import { useNavigate } from "react-router";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="FPT Logo"></img>
      </div>

      <nav className="navbar">
        <a href="#">Home</a>
        <a href="#">Create Event</a>
        <a href="#">Create Event Organizer</a>
      </nav>

      <div className="user-info">
        <div className="notification">
          <span className="bell">🔔</span>
          <span className="badge">3</span>
        </div>

        <div className="profile" onClick={() => navigate("/profile")}>
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="avatar"
          />
          <span className="username">John Doe</span>
        </div>
      </div>
    </header>
  );
}
