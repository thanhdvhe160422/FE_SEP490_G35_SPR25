import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Author/Home.css";
import bannerImage from "../assets/banner-item-3.jpg";
import getPosts from "../services/EventService";
import getCategories from "../services/CategoryService";

const EVENTS_PER_PAGE = 5;

function EventSection() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [eventFilter, setEventFilter] = useState("list");
  const navigate = useNavigate();

  localStorage.setItem("userRole", "implementer");
  const userRole = localStorage.getItem("userRole");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPosts();
      const sortedEvents = data.sort((a, b) =>
        a.status === "running" ? -1 : 1
      );
      setEvents(sortedEvents);
    };

    const fetchCategories = async () => {
      const categoryData = await getCategories();
      setCategories(categoryData);
    };

    fetchData();
    fetchCategories();
  }, []);

  const filteredEvents = (events || []).filter((event) => {
    if (!event) return false; // Kiểm tra nếu event là undefined/null

    const isMyEvent =
      event.organizerId === currentUserId ||
      event.implementerId === currentUserId;

    return (
      (eventFilter === "list" || (eventFilter === "my" && isMyEvent)) &&
      (!selectedCategory || event.category === selectedCategory) &&
      (!searchTerm ||
        event.title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedStatus || event.status === selectedStatus) &&
      (!selectedStart || new Date(event.start) >= new Date(selectedStart)) &&
      (!selectedEnd || new Date(event.end) <= new Date(selectedEnd)) &&
      (!selectedLocation ||
        event.location?.toLowerCase().includes(selectedLocation.toLowerCase()))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    searchTerm,
    selectedStatus,
    selectedStart,
    selectedEnd,
    selectedLocation,
    eventFilter,
  ]);

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const currentEvents = filteredEvents.slice(
    startIndex,
    startIndex + EVENTS_PER_PAGE
  );

  const getProgress = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now < startTime) return 0;
    if (now > endTime) return 100;

    return ((now - startTime) / (endTime - startTime)) * 100;
  };

  return (
    <section className="post_section news_post_2">
      <div className="container">
        <div className="row post_section_inner">
          <div className="col-lg-4 sidebar">
            <div className="filter_section">
              <h3>Filters</h3>
              <label>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="running">Running</option>
                <option value="not started yet">Not Started Yet</option>
              </select>

              <label>Start Time</label>
              <input
                type="date"
                value={selectedStart}
                onChange={(e) => setSelectedStart(e.target.value)}
              />

              <label>End Time</label>
              <input
                type="date"
                value={selectedEnd}
                onChange={(e) => setSelectedEnd(e.target.value)}
              />

              <label>Location</label>
              <input
                type="text"
                placeholder="Enter location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="col-lg-8 left_sidebar ls_2">
            <div className="row feature_post_area">
              <div className="col-12">
                <div className="feature_tittle">
                  <div className="filter_container">
                    <div className="filter_list">
                      <button
                        className={`filter_button ${
                          eventFilter === "list" ? "active" : ""
                        }`}
                        onClick={() => setEventFilter("list")}
                      >
                        List Event
                      </button>
                      {(userRole === "event organizer" ||
                        userRole === "implementer") && (
                        <button
                          className={`filter_button ${
                            eventFilter === "my" ? "active" : ""
                          }`}
                          onClick={() => setEventFilter("my")}
                        >
                          My Event
                        </button>
                      )}
                    </div>
                    <div className="filter_other">
                      <select
                        className="post_select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <input
                        style={{ width: "300px" }}
                        type="text"
                        className="search_input"
                        placeholder="Search event..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {currentEvents.length === 0 ? (
                <p className="no-events-message">
                  Không tìm thấy sự kiện nào hợp lệ.
                </p>
              ) : (
                currentEvents.map((event) => (
                  <div key={event.id} className="col-12 belarus_fast">
                    <div className="belarus_items">
                      <img
                        src={bannerImage}
                        alt="News"
                        onClick={() =>
                          navigate(`/event-detail-spec/${event.id}`)
                        }
                        style={{ cursor: "pointer" }}
                      />
                      <div className="belarus_content">
                        <h6>{event.location}</h6>
                        <p className="event_time">
                          <strong>From:</strong> {event.start}
                          <br />
                          <strong>To:</strong> {event.end}
                        </p>
                        <div
                          className="heding wow fadeInUp"
                          onClick={() =>
                            navigate(`/event-detail-spec/${event.id}`)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          {event.title}
                        </div>
                        <div
                          className={`status_tag ${
                            event.status === "running"
                              ? "running_status"
                              : "not_started_status"
                          }`}
                        >
                          {event.status === "running"
                            ? "Running"
                            : "Not started yet"}
                        </div>
                        {(userRole === "manager" ||
                          userRole === "event organizer") && (
                          <div className="progress_bar_container">
                            <div
                              className="progress_bar"
                              style={{
                                width: `${getProgress(
                                  event.start,
                                  event.end
                                )}%`,
                              }}
                            >
                              <span className="progress_text">
                                {Math.round(
                                  getProgress(event.start, event.end)
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pagination_area">
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
                    }
                  >
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() =>
                      setCurrentPage((prevPage) =>
                        Math.min(prevPage + 1, totalPages)
                      )
                    }
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventSection;
