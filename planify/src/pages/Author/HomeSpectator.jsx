import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Pagination,
  Button,
  Badge,
} from "react-bootstrap";
import "../../styles/Author/HomeSpectator.css";
import Header from "../../components/Header/Header";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import getPosts, { searchEventsSpec } from "../../services/EventService";
import {
  createFavoriteEvent,
  deleteFavouriteEvent,
} from "../../services/EventService";
import getCategories from "../../services/CategoryService";

export default function HomeSpectator() {
  const [events, setEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const pageSize = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const role = localStorage.getItem("role");
  const [isImple, setImple] = useState(role === "Implementer" ? true : false);

  const fixDriveUrl = (url) => {
    if (!url || typeof url !== "string")
      return "https://placehold.co/600x400?text=Không+có+hình+ảnh";
    if (!url.includes("drive.google.com/uc?id=")) return url;
    const fileId = url.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };

  const getImageUrl = (eventMedias) => {
    if (!eventMedias || !eventMedias.length || !eventMedias[0].mediaDTO) {
      return "https://placehold.co/600x400?text=Không+có+hình+ảnh";
    }
    return eventMedias[0].mediaDTO.mediaUrl;
  };

  const handleCreateFavorite = async (eventId, e) => {
    try {
      e.stopPropagation();
      const response = await createFavoriteEvent(eventId);
      if (response.status === 201) {
        console.log("Đã thêm sự kiện vào danh sách yêu thích:", eventId);
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, isFavorite: true } : event
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện vào yêu thích:", error);
    }
  };

  const handleDeleteFavorite = async (eventId, e) => {
    try {
      e.stopPropagation();
      const response = await deleteFavouriteEvent(eventId);
      if (response.status === 200) {
        console.log("Đã xóa sự kiện khỏi danh sách yêu thích:", eventId);
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, isFavorite: false } : event
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa sự kiện khỏi yêu thích:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoryData = await getCategories();
      console.log("Danh sách danh mục từ API:", categoryData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setIsSearchMode(false);
      const role = localStorage.getItem("role");
      console.log("Vai trò: " + role);
      const response = await getPosts(currentPage, pageSize, role);

      if (response && response.items) {
        setEvents(response.items);
        setTotalEvents(response.totalCount || 0);
        setTotalPages(response.totalPages || 1);
        extractLocations(response.items);
      } else {
        console.error("Định dạng phản hồi API không mong đợi:", response);
        setEvents([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  const searchEvents = async (page = 1) => {
    try {
      setLoading(true);
      setIsSearchMode(true);

      const params = {
        page: page,
        pageSize: pageSize,
        name: searchTerm,
        placed: locationFilter.trim() !== "" ? locationFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        categoryId: categoryFilter,
      };

      console.log("Tham số tìm kiếm:", params);
      const response = await searchEventsSpec(params);

      if (response && response.items) {
        setEvents(response.items);
        setTotalEvents(response.totalCount || 0);
        setTotalPages(response.totalPages || 1);
        extractLocations(response.items);
      } else {
        setEvents([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sự kiện:", error);
      setEvents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const extractLocations = (eventsData) => {
    if (!eventsData || !Array.isArray(eventsData)) return;

    const locationsSet = new Set();
    eventsData.forEach((event) => {
      if (event.placed) {
        locationsSet.add(event.placed);
      }
    });
    setLocations(Array.from(locationsSet));
  };

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
    if (isSearchMode) {
      searchEvents(pageNumber);
    } else {
      fetchEvents(pageNumber);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    if (
      searchTerm.trim() !== "" ||
      statusFilter !== "All" ||
      categoryFilter.trim() !== "" ||
      locationFilter.trim() !== "" ||
      startDate !== "" ||
      endDate !== ""
    ) {
      searchEvents(1);
    } else {
      fetchEvents(1);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter("");
    setLocationFilter("");
    setStartDate("");
    setEndDate("");
    fetchEvents(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <>
      <Header />
      <div className="d-flex">
        <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? (
              <MdArrowBackIos size={18} />
            ) : (
              <MdArrowForwardIos size={18} />
            )}
          </div>

          {sidebarOpen && (
            <div className="sidebar-content">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Bộ lọc</h5>
                {/* <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Đặt lại
                </Button> */}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Kiểu sự kiện</Form.Label>
                <Form.Control
                  as="select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryEventName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Địa điểm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập địa điểm..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ngày bắt đầu</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ngày kết thúc</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </Form.Group>

              <Button
                variant="primary"
                className="w-100"
                onClick={handleApplyFilters}
              >
                Áp dụng bộ lọc
              </Button>

              {(searchTerm.trim() !== "" ||
                statusFilter !== "All" ||
                categoryFilter.trim() !== "" ||
                locationFilter.trim() !== "" ||
                startDate !== "" ||
                endDate !== "") && (
                <Button
                  style={{ backgroundColor: "red", marginTop: "10px" }}
                  className="w-100"
                  onClick={handleResetFilters}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex-grow-1 px-4" style={{ marginTop: "100px" }}>
          <Container fluid className="px-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Sự kiện</h2>
              <div className="d-flex" style={{ width: "50%" }}>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm sự kiện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleApplyFilters();
                    }
                  }}
                />
                <Button
                  style={{ width: "100px", padding: "6px" }}
                  variant="primary"
                  className="ms-2"
                  onClick={handleApplyFilters}
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>

            {(searchTerm ||
              statusFilter !== "All" ||
              categoryFilter ||
              locationFilter ||
              startDate ||
              endDate) && (
              <div className="mb-3">
                <span className="me-2">Bộ lọc đang áp dụng:</span>
                {searchTerm && (
                  <Badge bg="info" className="me-2">
                    Từ khóa: {searchTerm}
                  </Badge>
                )}
                {statusFilter !== "All" && (
                  <Badge bg="info" className="me-2">
                    Trạng thái:{" "}
                    {statusFilter === "Đang diễn ra"
                      ? "Đang diễn ra"
                      : statusFilter === "Đã kết thúc"
                      ? "Đã kết thúc"
                      : "Chưa diễn ra"}
                  </Badge>
                )}
                {categoryFilter && (
                  <Badge bg="info" className="me-2">
                    Kiểu sự kiện: {categoryFilter}
                  </Badge>
                )}
                {locationFilter && (
                  <Badge bg="info" className="me-2">
                    Địa điểm: {locationFilter}
                  </Badge>
                )}
                {startDate && (
                  <Badge bg="info" className="me-2">
                    Từ: {formatDate(startDate)}
                  </Badge>
                )}
                {endDate && (
                  <Badge bg="info" className="me-2">
                    Đến: {formatDate(endDate)}
                  </Badge>
                )}
              </div>
            )}

            <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : (
                <>
                  <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <Col key={event.id}>
                          <Card
                            className="h-100 shadow-sm event-card"
                            onClick={() => {
                              if (isImple) {
                                navigate(`/event-detail-spec/${event.id}`);
                              } else {
                                navigate(`/event-detail-spec/${event.id}`);
                              }
                            }}
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
                                  "https://placehold.co/600x400?text=Không+có+hình+ảnh";
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
                              onClick={(e) =>
                                event.isFavorite
                                  ? handleDeleteFavorite(event.id, e)
                                  : handleCreateFavorite(event.id, e)
                              }
                            >
                              {event.isFavorite ? (
                                <FaHeart size={20} color="red" />
                              ) : (
                                <FaRegHeart size={20} color="red" />
                              )}
                            </div>

                            <Card.Body>
                              <span
                                className={`status-badge ${
                                  event.statusMessage === "Đang diễn ra"
                                    ? "status-running"
                                    : event.statusMessage === "Đã kết thúc"
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
                                      "vi-VN",
                                      {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </small>
                                </div>
                                <div>
                                  <small className="text-muted">
                                    Địa điểm: {event.placed}
                                  </small>
                                </div>
                                {event.categoryViewModel && (
                                  <div>
                                    <small className="text-muted">
                                      Kiểu sự kiện:{" "}
                                      {
                                        event.categoryViewModel
                                          .categoryEventName
                                      }
                                    </small>
                                  </div>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Col xs={12}>
                        <div
                          className="d-flex flex-column justify-content-center align-items-center"
                          style={{ height: "300px" }}
                        >
                          <p className="text-muted text-center">
                            {totalEvents === 0
                              ? "Không có sự kiện nào."
                              : "Không tìm thấy sự kiện phù hợp với tiêu chí của bạn."}
                          </p>
                        </div>
                      </Col>
                    )}
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
                </>
              )}
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
