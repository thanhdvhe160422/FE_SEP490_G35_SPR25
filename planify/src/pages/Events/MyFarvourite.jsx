import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Pagination,
} from "react-bootstrap";
import "../../styles/Events/MyFarvourite.css";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import {
  deleteFavouriteEvent,
  getFavouriteEvents,
  getPosts,
} from "../../services/EventService";

export default function MyFarvourite() {
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const pageSize = 8;

  const fixDriveUrl = (url) => {
    if (!url || typeof url !== "string")
      return "https://placehold.co/600x400?text=No+Image";
    if (!url.includes("drive.google.com/uc?id=")) return url;
    const fileId = url.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };

  const getImageUrl = (eventMedias) => {
    if (!eventMedias || !eventMedias.length || !eventMedias[0].mediaDTO) {
      return "https://placehold.co/600x400?text=No+Image";
    }
    return eventMedias[0].mediaDTO.mediaUrl;
  };

  const fetchFavoriteEvents = async (page) => {
    try {
      setLoading(true);
      const response = await getFavouriteEvents(page, pageSize);

      if (response && response.items) {
        setFavoriteEvents(response.items);
        setTotalPages(response.totalPages || 1);
        setTotalEvents(response.totalCount || 0);
      } else {
        setFavoriteEvents([]);
        setTotalPages(1);
        setTotalEvents(0);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện yêu thích:", error);
      setFavoriteEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFavorite = async (eventId, e) => {
    try {
      e.stopPropagation();
      await deleteFavouriteEvent(eventId);
      setFavoriteEvents(
        favoriteEvents.filter((event) => event.eventId !== eventId)
      );
      console.log("Đã xóa sự kiện khỏi danh sách yêu thích:", eventId);

      if (favoriteEvents.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchFavoriteEvents(currentPage);
      }
    } catch (error) {
      console.error("Lỗi khi xóa sự kiện khỏi yêu thích:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchFavoriteEvents(pageNumber);
    window.scrollTo(0, 0);
  };

  const filteredEvents = favoriteEvents.filter((event) =>
    event.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchFavoriteEvents(currentPage);
  }, [currentPage]);

  return (
    <>
      <Header />
      <div className="d-flex">
        <div className="flex-grow-1 px-4" style={{ marginTop: "100px" }}>
          <Container fluid className="px-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Favorite Events</h2>
              <div className="d-flex" style={{ width: "50%" }}>
                <Form.Control
                  type="text"
                  placeholder="Search favorite events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div
                  className="text-center text-muted mt-5 py-5"
                  style={{ fontSize: "1.1rem" }}
                >
                  {searchTerm
                    ? "No favorite events match your search."
                    : "You haven't favorited any events yet."}
                  <div className="mt-3">
                    <Button variant="primary" onClick={() => navigate("/")}>
                      Browse Events
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {filteredEvents.map((event) => (
                      <Col key={event.eventId}>
                        <Card
                          className="h-100 shadow-sm event-card"
                          onClick={() =>
                            navigate(`/event-detail/${event.eventId}`)
                          }
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
                              top: "10px",
                              right: "10px",
                              zIndex: 10,
                              background: "rgba(255,255,255,0.7)",
                              borderRadius: "50%",
                              padding: "5px",
                              cursor: "pointer",
                            }}
                            onClick={(e) =>
                              handleDeleteFavorite(event.eventId, e)
                            }
                          >
                            <FaHeart size={20} color="red" />
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
                                  {new Date(event.startTime).toLocaleString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  )}
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

                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.First
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        />

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                          )
                          .map((page, index, array) => {
                            if (index > 0 && array[index - 1] !== page - 1) {
                              return [
                                <Pagination.Ellipsis
                                  key={`ellipsis-${page}`}
                                  disabled
                                />,
                                <Pagination.Item
                                  key={page}
                                  active={page === currentPage}
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </Pagination.Item>,
                              ];
                            }
                            return (
                              <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Pagination.Item>
                            );
                          })}

                        <Pagination.Next
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                        <Pagination.Last
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}

                  <div className="text-center mt-2 mb-4 text-muted">
                    Page {currentPage} / {totalPages || 1}
                    {filteredEvents.length > 0 &&
                      ` (Showing: ${filteredEvents.length} / Total: ${totalEvents} favorites)`}
                  </div>
                </>
              )}
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
