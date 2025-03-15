import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import "./Header.css";
import logo from "../../assets/logo-fptu.png";

export default function Header() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const [fullname, setFullname] = useState("");
  const [picture, setPicture] = useState("");

  // Lấy role từ localStorage, chuẩn hóa về chữ thường
  const userRole = localStorage.getItem("role")?.toLowerCase() || "";
  console.log("User Role từ localStorage header:", userRole);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setFullname(localStorage.getItem("fullName"));
    setPicture(localStorage.getItem("avatar"));

    if (!userId) return;

    axios
      .get(`http://localhost:4000/notifications?userId=${userId}`)
      .then((response) => setNotifications(response.data))
      .catch((error) => console.error("Lỗi khi lấy thông báo:", error));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        showDropdown
      ) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        showPopup
      ) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, showPopup]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length > 0) {
      setNotifications(
        notifications.map((notif) =>
          notif.read ? notif : { ...notif, read: true }
        )
      );

      await Promise.all(
        unreadNotifications.map((notif) =>
          axios.patch(`http://localhost:4000/notifications/${notif.id}`, {
            read: true,
          })
        )
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Map role với danh sách menu
  const navItemsByRole = {
    "campus manager": [
      { label: "Home", path: "/home" },
      { label: "Create Event Organizer", path: "/create-event-organizer" },
      { label: "Create Event", path: "/create-event" },
      { label: "Manage Requests", path: "/manager-request" },
    ],
    "event organizer": [
      { label: "Home", path: "/home" },
      { label: "Create Event", path: "/create-event" },
      { label: "My Request", path: "/my-request" },
    ],
    implementer: [
      { label: "Home", path: "/home" },
      { label: "Assigned Tasks", path: "/assigned-tasks" },
      { label: "History", path: "/history" },
    ],
    spectator: [{ label: "Home", path: "/home" }],
  };

  const navItems = navItemsByRole[userRole] || [];

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/home")}>
        <img src={logo} alt="FPT Logo" />
      </div>

      <nav className="navbar">
        {navItems.map((item, index) => (
          <span
            key={index}
            onClick={() => navigate(item.path)}
            className="nav-item"
          >
            {item.label}
          </span>
        ))}
      </nav>

      <div className="user-info">
        <div
          className="notification"
          onClick={() => {
            setShowPopup(!showPopup);
            markAsRead();
          }}
          ref={notificationRef}
        >
          <span className="bell">🔔</span>
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

          {showPopup && (
            <div className="notification-popup">
              {notifications.length === 0 ? (
                <p>Không có thông báo</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item ${
                      notif.read ? "" : "unread"
                    }`}
                  >
                    {notif.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div
          className="profile"
          onClick={() => setShowDropdown(!showDropdown)}
          ref={dropdownRef}
        >
          <span className="username">{fullname}</span>
          <img
            style={{ width: "40px", height: "40px" }}
            src={picture}
            alt="User Avatar"
            className="avatar"
          />

          {showDropdown && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => navigate("/profile")}
              >
                Profile
              </div>
              <div className="dropdown-item-logout" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
