import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Author/Home.css";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import bannerImage from "../assets/banner-item-3.jpg";
import getPosts from "../services/EventService";
import getCategories from "../services/CategoryService";
import { getCampuses } from "../services/campusService";

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
  const [campuses, setCampus] = useState([]);
  const navigate = useNavigate();

  const userRole = localStorage.getItem("role");
  const currentUserId = localStorage.getItem("userId");
  const campus = localStorage.getItem("campus");
  useEffect(() => {
    const fetchCampus = async () => {
      try {
        const campusData = await getCampuses();
        setCampus(campusData);
        console.log("📌 Danh sách campus:", campusData);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách campus:", error);
        setCampus([]);
      }
    };

    fetchCampus();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allData = await getPosts();
        const validStatus = [0, 1, 2];
        const validEvent = allData.filter((post) =>
          validStatus.includes(post.status)
        );
        const currentCampus = (event) => {
          if (!Array.isArray(campuses)) {
            console.error("❌ Lỗi: campuses không phải là mảng", campuses);
            return "Unknown";
          }
          const campus = campuses.find((cat) => cat.id === event.campusId);
          return campus ? campus.campusName : "Unknown";
        };
        const campusEvents = validEvent.filter(
          (event) => currentCampus(event) === campus
        );
        if (!allData || allData.length === 0) return;
        const getStatusPriority = (event) => {
          const status = statusEvent(event.startTime, event.endTime);
          return status === "running"
            ? 1
            : status === "not started yet"
            ? 2
            : 3;
        };

        const sortedEvents = campusEvents
          .map((event) => ({
            ...event,
            status: statusEvent(event.startTime, event.endTime),
          }))
          .sort((a, b) => getStatusPriority(a) - getStatusPriority(b));

        setEvents(sortedEvents);
        console.log("....", sortedEvents);
      } catch (error) {
        console.error("❌ Lỗi khi lấy sự kiện:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoryData = await getCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh mục:", error);
      }
    };
    fetchData();
    fetchCategories();
  }, [campuses, campus]);
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const statusEvent = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now >= startTime && now <= endTime) return "running";
    if (now < startTime) return "not started yet";
    return "closed";
  };

  const filteredEvents = events.filter((event) => {
    if (!event) return false;

    const isMyEvent = event.createBy === currentUserId;

    return (
      (eventFilter === "list" || (eventFilter === "my" && isMyEvent)) &&
      (!selectedCategory || event.categoryEventId === selectedCategory) &&
      (!searchTerm ||
        event.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedStatus === "" ||
        statusEvent(event.startTime, event.endTime) === selectedStatus) &&
      (!selectedStart ||
        new Date(event.startTime) >= new Date(selectedStart)) &&
      (!selectedEnd || new Date(event.endTime) <= new Date(selectedEnd)) &&
      (!selectedLocation ||
        event.placed?.toLowerCase().includes(selectedLocation.toLowerCase()))
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  );

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
  useEffect(() => {
    if (events.length > 0) {
      const hasMyEvent = events.some(
        (event) => event.createBy === currentUserId
      );
      setEventFilter(hasMyEvent ? "my" : "list");
    }
  }, [events, currentUserId]);
  const currentCategory = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);

    return category ? category.categoryEventName : "Unknown";
  };
  const fixDriveUrl = (url) => {
    if (!url.includes("drive.google.com/uc?id=")) return url;
    const fileId = url.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
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
                <option value="closed">Closed</option>
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
                      {(userRole?.toLowerCase() === "event organizer" ||
                        userRole?.toLowerCase() === "implementer") && (
                        <button
                          className={`filter_button ${
                            eventFilter === "my" ? "active" : ""
                          }`}
                          onClick={() => setEventFilter("my")}
                        >
                          My Event
                        </button>
                      )}
                      <button
                        className={`filter_button ${
                          eventFilter === "list" ? "active" : ""
                        }`}
                        onClick={() => setEventFilter("list")}
                      >
                        List Event
                      </button>
                    </div>
                    <div className="filter_other">
                      <select
                        className="post_select"
                        value={selectedCategory}
                        onChange={(e) =>
                          setSelectedCategory(Number(e.target.value))
                        }
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.categoryEventName}
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
                <p className="col-12 no-events-message">
                  No valid events found.
                </p>
              ) : (
                currentEvents.map((event) => (
                  <div key={event.id} className="col-12 belarus_fast">
                    <div className="belarus_items">
                      <img
                        src={
                          event.eventMedias?.length > 0
                            ? fixDriveUrl(
                                event.eventMedias[0].mediaDTO.mediaUrl
                              )
                            : bannerImage
                        }
                        alt="News"
                        onClick={() => {
                          const userRole = (localStorage.getItem("role") || "")
                            .trim()
                            .toLowerCase();
                          console.log(
                            "🔍 User Role khi bấm vào sự kiện:",
                            userRole
                          );
                          console.log("🔍 Event Data:", event);

                          let targetUrl = `/event-detail-spec/${event.id}`;
                          if (
                            userRole === "campus manager" ||
                            userRole === "event organizer"
                          ) {
                            targetUrl = `/event-detail-EOG/${event.id}`;
                          }

                          console.log("🚀 Điều hướng đến:", targetUrl);
                          navigate(targetUrl);
                        }}
                        style={{ cursor: "pointer" }}
                      />

                      <div
                        className="belarus_content"
                        onClick={() => {
                          const userRole = (localStorage.getItem("role") || "")
                            .trim()
                            .toLowerCase();
                          console.log(
                            "🔍 User Role khi bấm vào sự kiện:",
                            userRole
                          );
                          console.log("🔍 Event Data:", event);

                          let targetUrl = `/event-detail-spec/${event.id}`;
                          if (
                            userRole === "campus manager" ||
                            userRole === "event organizer"
                          ) {
                            targetUrl = `/event-detail-EOG/${event.id}`;
                          }

                          console.log("🚀 Điều hướng đến:", targetUrl);
                          navigate(targetUrl);
                        }}
                      >
                        <div
                          className="heding wow fadeInUp"
                          onClick={() => {
                            const userRole = (
                              localStorage.getItem("role") || ""
                            )
                              .trim()
                              .toLowerCase();
                            console.log(
                              "🔍 User Role khi bấm vào sự kiện:",
                              userRole
                            );
                            console.log("🔍 Event Data:", event);

                            let targetUrl = `/event-detail-spec/${event.id}`;
                            if (
                              userRole === "campus manager" ||
                              userRole === "event organizer"
                            ) {
                              targetUrl = `/event-detail-EOG/${event.id}`;
                            }

                            console.log("🚀 Điều hướng đến:", targetUrl);
                            navigate(targetUrl);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {event.eventTitle}
                        </div>
                        <h5>
                          <FaMapMarkerAlt className="icon-location" />

                          {event.placed}
                        </h5>
                        <h5>
                          <MdOutlineCategory
                            className="icon-category"
                            style={{ marginRight: "10px", color: "orange" }}
                          />
                          {currentCategory(event.categoryEventId)}
                        </h5>
                        <p className="event_time">
                          <FaClock className="icon-time" />
                          <strong>From:</strong>{" "}
                          {formatDateTime(event.startTime)}
                          <br />
                          <strong>
                            <FaClock className="icon-time" />
                            To:
                          </strong>{" "}
                          {formatDateTime(event.endTime)}
                        </p>

                        <div
                          className={`status_tag ${
                            statusEvent(event.startTime, event.endTime) ===
                            "running"
                              ? "running_status"
                              : statusEvent(event.startTime, event.endTime) ===
                                "not started yet"
                              ? "not_started_status"
                              : "ended_status"
                          }`}
                        >
                          {statusEvent(event.startTime, event.endTime)}
                        </div>
                        {(userRole === "Campus Manager" ||
                          userRole === "Event Organizer") && (
                          <div className="progress_bar_container">
                            <div
                              className="progress_bar"
                              style={{
                                width: `${getProgress(
                                  event.startTime,
                                  event.endTime
                                )}%`,
                              }}
                            >
                              <span className="progress_text">
                                {Math.round(
                                  getProgress(event.startTime, event.endTime)
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

            {filteredEvents.length > EVENTS_PER_PAGE && (
              <div className="pagination_area" style={{ padding: "30px" }}>
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventSection;
