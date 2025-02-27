import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import "./HeaderManagerCampus.css";
import logo from "../../assets/logo-fptu.png";

export default function HeaderManagerCampus() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:4000/notifications")
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy thông báo:", error);
      });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async () => {
    if (unreadCount > 0) {
      const updatedNotifications = notifications.map((notif) => ({
        ...notif,
        read: true,
      }));

      setNotifications(updatedNotifications);

      await Promise.all(
        updatedNotifications.map((notif) =>
          axios.patch(`http://localhost:4000/notifications/${notif.id}`, {
            read: true,
          })
        )
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate("/")}>
        <img src={logo} alt="FPT Logo" />
      </div>

      <nav className="navbar">
        <span
          onClick={() => navigate("/homeManagerCampus")}
          className="nav-item"
        >
          Home
        </span>
        <span
          onClick={() => navigate("/create-event-organizer")}
          className="nav-item"
        >
          Create Event Organizer
        </span>
        <span onClick={() => navigate("/create-event")} className="nav-item">
          Create Event
        </span>
      </nav>

      <div className="user-info">
        <div
          className="notification"
          onClick={() => {
            setShowPopup(!showPopup);
            markAsRead();
          }}
        >
          <span className="bell">🔔</span>
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

          {showPopup && (
            <div className="notification-popup">
              {notifications.length === 0 ? (
                <p>Không có thông báo</p>
              ) : (
                notifications.map((notif, index) => (
                  <div
                    key={index}
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

        <div className="profile" onClick={() => navigate("/profile")}>
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="avatar"
          />
          <span className="username">John Doe</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
