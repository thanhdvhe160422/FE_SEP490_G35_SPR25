import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import "./Header.css";
import logo from "../../assets/logo-fptu.png";

export default function Header() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // Thêm trạng thái dropdown

  if (!localStorage.getItem("userRole")) {
    localStorage.setItem("userRole", "manager");
  }
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    axios
      .get(`http://localhost:4000/notifications?userId=${userId}`)
      .then((response) => {
        setNotifications(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy thông báo:", error);
      });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length > 0) {
      const updatedNotifications = notifications.map((notif) =>
        notif.read ? notif : { ...notif, read: true }
      );
      setNotifications(updatedNotifications);

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
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const navItemsByRole = {
    manager: [
      { label: "Home", path: "/home" },
      { label: "Create Event Organizer", path: "/create-event-organizer" },
      { label: "Create Event", path: "/create-event" },
    ],
    eventOrganizer: [
      { label: "Home", path: "/home" },
      { label: "Create Event", path: "/create-event" },
      { label: "History", path: "/history" },
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

        <div className="profile" onClick={() => setShowDropdown(!showDropdown)}>
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="avatar"
          />
          <span className="username">John Doe</span>

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
