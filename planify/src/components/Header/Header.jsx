import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation
import "./Header.css";
import logo from "../../assets/logo-fptu.png";
import { getProfileById } from "../../services/userService";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { useSnackbar } from "notistack";
import { getNotification } from "../../services/EventService";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const [fullname, setFullname] = useState("");
  const [picture, setPicture] = useState("");
  const userRole = localStorage.getItem("role")?.toLowerCase() || "";
  console.log("User Role từ localStorage header:", userRole);

  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        await getNotification();
      } catch (error) {
        console.error("error while load incoming event notification: " + error);
      }
    };
    var token = localStorage.getItem("token");
    const savedMessages = JSON.parse(localStorage.getItem("messages")) || [];
    setMessages(savedMessages);

    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:44320/notificationHub", {
        accessTokenFactory: () => token,
      })
      .build();
    newConnection
      .start()
      .then(() => {
        console.log("Connected to SignalR");
        fetchNotification();
      })
      .catch((err) => console.error("Error while starting connection: " + err));

    newConnection.on("ReceiveNotification", (message, link) => {
      const localMessages = JSON.parse(localStorage.getItem("messages")) || [];
      const newMessages = [...localMessages, { message, link, isRead: false }];
      setMessages(newMessages);
      enqueueSnackbar(
        <>
          {message}
          <a href={link} target="_blank" rel="noopener noreferrer">
            Xem thêm
          </a>
        </>,
        {
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
          variant: "info",
        }
      );
    });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const handleLinkClick = (index) => {
    const updatedMessages = [...messages];
    updatedMessages[index].read = true;
    setMessages(updatedMessages);
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) return;
    const fetchData = async () => {
      try {
        const userData = await getProfileById(userId);
        setFullname(userData.data.firstName + " " + userData.data.lastName);
        setPicture(
          convertToDirectLink(
            userData?.data?.avatar?.mediaUrl || localStorage.getItem("avatar")
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
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
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };
  const handleLogo = (role) => {
    console.log("Role from handleLogo:", role);
    if (role === "event organizer") {
      navigate("/home");
    }
    if (role === "campus manager") {
      navigate("/home");
    }
    if (role === "implementer") {
      navigate("/home-implementer");
    }
    if (role === "spectator") {
      navigate("/home-spec");
    }
  };

  const navItemsByRole = {
    "campus manager": [
      { label: "Trang chủ", path: "/home" },
      { label: "Quản lý Event Organizer", path: "/manage-eog" },
      { label: "Quản lý loại sự kiện", path: "/category-event" },
      { label: "Quản lý yêu cầu", path: "/manage-request" },
      { label: "Sự kiện yêu thích", path: "/my-favorite-events" },
    ],
    "event organizer": [
      { label: "Trang chủ", path: "/home" },
      { label: "Tạo sự kiện", path: "/event-plan" },
      { label: "Yêu cầu của tôi", path: "/my-request" },
      { label: "Sự kiện của tôi", path: "/my-event" },
      { label: "Sự kiện yêu thích", path: "/my-favorite-events" },
      { label: "Sự kiện nháp", path: "/my-drafts" },
    ],
    implementer: [
      { label: "Trang chủ", path: "/home-implementer" },
      { label: "Danh sách sự kiện", path: "/home-spec" },
      { label: "Lịch sử sự kiện đã tham gia", path: "/history-event" },
      { label: "Sự kiện yêu thích", path: "/my-favorite-events" },
    ],
    spectator: [
      { label: "Trang chủ", path: "/home-spec" },
      { label: "Sự kiện yêu thích", path: "/my-favorite-events" },
      { label: "Sự kiện đã đăng ký", path: "/event-registered" },
    ],
  };

  const navItems = navItemsByRole[userRole] || [];

  function convertToDirectLink(googleDriveUrl) {
    if (!googleDriveUrl || !googleDriveUrl.includes("drive.google.com/uc?id="))
      return googleDriveUrl;
    const fileId = googleDriveUrl.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return (
    <header className="header">
      <div className="logo" onClick={() => handleLogo(userRole)}>
        <img src={logo} alt="FPT Logo" />
      </div>

      <nav className="navbar">
        {navItems.map((item, index) => (
          <span
            key={index}
            onClick={() => navigate(item.path)}
            className={`nav-item ${
              location.pathname === item.path ? "active" : ""
            }`}
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
              <div className="text-center">
                <h4 className="fw-bold">Notification</h4>
                {messages.length === 0 ? (
                  <p>No notification found!</p>
                ) : (
                  <table className="table table-hover mx-auto">
                    <tbody>
                      {messages
                        .slice()
                        .reverse()
                        .map((msg, index) => (
                          <tr key={index}>
                            <td
                              className={`text-start ${
                                msg.read ? "" : "table-secondary"
                              }`}
                            >
                              <a
                                href={msg.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-offset-2 link-underline link-underline-opacity-0 me-2"
                                onClick={() => handleLinkClick(index)}
                              >
                                {msg.message}
                                <span> </span>
                                <span className="text-decoration-underline">
                                  Detail!
                                </span>
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
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
            src={convertToDirectLink(picture)}
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
