import React, { useState, useEffect } from "react";
import { Card, Col, Row, Spin, Empty, message } from "antd";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/Events/HistoryEvent.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

const EventHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritedEvents, setFavoritedEvents] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fixDriveUrl = (url) => {
    if (!url) return "https://placehold.co/600x400?text=No+Image";
    if (url.includes("drive.google.com")) {
      const fileId = url.match(/[-\w]{25,}/);
      return fileId
        ? `https://drive.google.com/uc?export=view&id=${fileId[0]}`
        : url;
    }
    return url;
  };

  // Hàm lấy URL ảnh từ eventMedias
  const getImageUrl = (eventMedias) => {
    if (!eventMedias || eventMedias.length === 0) {
      return "https://placehold.co/600x400?text=No+Image";
    }
    return (
      eventMedias[0].mediaUrl || "https://placehold.co/600x400?text=No+Image"
    );
  };

  const fetchEventHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://localhost:44320/api/JoinProject/view-attended-events-history?page=${currentPage}&pageSize=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.result) {
        setEvents(response.data.result);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching event history:", error);
      message.error("Không thể tải lịch sử sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoritedEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://localhost:44320/api/FavouriteEvent/get-list?page=${currentPage}&pageSize={pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.result) {
        setFavoritedEvents(response.data.result.map((fav) => fav.eventId));
      }
    } catch (error) {
      console.error("Error fetching favorited events:", error);
    }
  };

  const isEventFavorited = (eventId) => {
    return favoritedEvents.includes(eventId);
  };

  useEffect(() => {
    fetchEventHistory();
    fetchFavoritedEvents();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Header></Header>
      <div className="event-history-container" style={{ padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>Lịch Sử Sự Kiện</h2>

        {events.length === 0 ? (
          <Empty description="Bạn chưa tham gia sự kiện nào" />
        ) : (
          <Row gutter={[16, 16]}>
            {events.map((event) => (
              <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                <Card
                  className="h-100 shadow-sm event-card"
                  onClick={() => navigate(`/event-detail-spec/${event.id}`)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <Card.Img
                    variant="top"
                    src={fixDriveUrl(getImageUrl(event.eventMedias))}
                    height="180"
                    className="event-image"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/600x400?text=No+Image";
                    }}
                  />
                  <div
                    className="favorite-button"
                    style={{
                      position: "absolute",
                      top: "190px",
                      right: "10px",
                      zIndex: 10,
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: "50%",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                    onClick={(e) => isEventFavorited(event.id)}
                  >
                    {isEventFavorited(event.id) ? (
                      <FaHeart size={20} color="red" />
                    ) : (
                      <FaRegHeart size={20} color="red" />
                    )}
                  </div>

                  <Card.Body>
                    <span
                      className={`status-badge ${
                        event.statusMessage === "Running"
                          ? "status-running"
                          : event.statusMessage === "Closed"
                          ? "status-closed"
                          : "status-notyet"
                      }`}
                    >
                      {event.statusMessage}
                    </span>
                    <Card.Title
                      style={{ fontSize: "100%" }}
                      className="event-title fw-bold"
                    >
                      {event.eventTitle}
                    </Card.Title>
                    <div>
                      <div>
                        <small className="text-muted">
                          {new Date(event.startTime).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </small>
                      </div>
                      <div>
                        <small className="text-muted">
                          Location: {event.placed}
                        </small>
                      </div>
                      {event.categoryViewModel && (
                        <div>
                          <small className="text-muted">
                            Category:{" "}
                            {event.categoryViewModel.categoryEventName}
                          </small>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
      <Footer></Footer>
    </>
  );
};

export default EventHistory;
