import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import "../../styles/Author/HomeSpectator.css";
import Header from "../../components/Header/Header";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // solid và regular icon

export default function HomeSpectator() {
  const [events, setEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [likedEvents, setLikedEvents] = useState([]);

  function getStatus(start, end) {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (now < startTime) return "Not Yet";
    if (now >= startTime && now <= endTime) return "Running";
    return "Closed";
  }

  useEffect(() => {
    axios
      .get("http://localhost:4000/events")
      .then((res) => {
        setEvents(res.data);
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  const filteredEvents = events.filter((event) => {
    const status = getStatus(event.StartTime, event.EndTime);
    const matchStatus = statusFilter === "All" || status === statusFilter;
    const matchSearch = event.EventTitle.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const matchCategory =
      categoryFilter === "All" || event.Category === categoryFilter;
    const matchLocation =
      locationFilter === "All" || event.Placed === locationFilter;
    return matchStatus && matchSearch && matchCategory && matchLocation;
  });

  const toggleFavourite = (id, e) => {
    e.stopPropagation(); // Ngăn click vào card khi click icon
    setLikedEvents((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
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
              <h5>Filter</h5>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Not Yet</option>
                  <option>Running</option>
                  <option>Closed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Technology</option>
                  <option>Health</option>
                  <option>Environment</option>
                  <option>Education</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Hanoi</option>
                  <option>Ho Chi Minh City</option>
                  <option>Da Nang</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </div>

        <div className="flex-grow-1 px-4" style={{ marginTop: "100px" }}>
          <Container fluid className="px-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Upcoming Events</h2>
              <Form.Group className="mb-0 w-50">
                <Form.Control
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </div>

            <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {filteredEvents.map((event) => {
                  const status = getStatus(event.StartTime, event.EndTime);
                  return (
                    <Col key={event.Id}>
                      <Card
                        className="h-100 shadow-sm event-card"
                        onClick={() =>
                          navigate(`/event-detail-Spec?id=${event.Id}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <Card.Img
                          variant="top"
                          src={event.Image}
                          height="180"
                          className="event-image"
                          style={{ objectFit: "cover" }}
                        />
                        <Card.Body>
                          <div className="status-favourite-row d-flex justify-content-between align-items-center mb-2">
                            <span
                              className={`status-badge ${
                                status === "Running"
                                  ? "status-running"
                                  : status === "Closed"
                                  ? "status-closed"
                                  : "status-notyet"
                              }`}
                            >
                              {status}
                            </span>

                            {likedEvents.includes(event.Id) ? (
                              <FaHeart
                                className="favourite-icon active"
                                onClick={(e) => toggleFavourite(event.Id, e)}
                              />
                            ) : (
                              <FaRegHeart
                                className="favourite-icon"
                                onClick={(e) => toggleFavourite(event.Id, e)}
                              />
                            )}
                          </div>

                          <Card.Title
                            style={{ fontSize: "100%" }}
                            className="event-title fw-bold"
                          >
                            {event.EventTitle}
                          </Card.Title>
                          <Card.Text>
                            <div>
                              <small className="text-muted">
                                {new Date(event.StartTime).toLocaleString(
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
                                Place: {event.Placed}
                              </small>
                            </div>
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
