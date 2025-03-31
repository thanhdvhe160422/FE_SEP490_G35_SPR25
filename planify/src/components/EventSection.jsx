import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Author/Home.css";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import bannerImage from "../assets/banner-item-3.jpg";
import getPosts from "../services/EventService";
import getCategories from "../services/CategoryService";
import { getCampuses } from "../services/campusService";
import { searchEvents } from "../services/EventService";

const EVENTS_PER_PAGE = 5;

function EventSection() {
  const [myEventPages, setMyEventPages] = useState(1);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);
  const [isFiltered, setIsFiltered] = useState(false);
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
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
  const [filteredEvents, setFilteredEvents] = useState([]);

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
  const handleSearch = async () => {
    try {
      setIsFiltered(true);
      const params = {
        page: currentPage,
        pageSize: EVENTS_PER_PAGE,
        title: searchTerm,
        categoryId: selectedCategory,
        status: selectedStatus,
        startTime: selectedStart,
        endTime: selectedEnd,
        placed: selectedLocation,
      };
      const response = await searchEvents(params);

      if (response) {
        const items = Array.isArray(response.items) ? response.items : [];
        setFilteredEvents(items);
        setFilteredTotalPages(response.totalPages || 1);
      } else {
        setFilteredEvents([]);
        setFilteredTotalPages(1);
      }
    } catch (error) {
      console.error("Error searching events:", error);
      setFilteredTotalPages(1);
    }
  };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSelectedStart("");
    setSelectedEnd("");
    setSelectedLocation("");
    setIsFiltered(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (isFiltered) {
      setTimeout(() => {
        handleSearch();
      }, 0);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allData = await getPosts(currentPage, EVENTS_PER_PAGE);
        console.log("All Data from API:", allData);
        const validStatus = [0, 1, 2];
        const validEvent = allData.items.filter((post) =>
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
        setEvents(campusEvents);
        setTotalPages(allData.totalPages || 1);
      } catch (error) {
        console.error("❌ Lỗi khi lấy sự kiện:", error);
        setEvents([]);
        setTotalPages(1);
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
  }, [currentPage, campuses, campus]);
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

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [
    selectedCategory,
    searchTerm,
    selectedStatus,
    selectedStart,
    selectedEnd,
    selectedLocation,
    eventFilter,
  ]);
  useEffect(() => {
    if (events.length > 0) {
      const myEvents = events.filter(
        (event) => String(event.createBy) === String(currentUserId)
      );

      const pages = Math.ceil(myEvents.length / EVENTS_PER_PAGE);
      setMyEventPages(pages || 1);
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
                type="datetime-local"
                value={selectedStart}
                onChange={(e) => setSelectedStart(e.target.value)}
              />

              <label>End Time</label>
              <input
                type="datetime-local"
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
              <div
                className="filter-buttons"
                style={{ marginTop: "20px", display: "flex", gap: "10px" }}
              >
                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  style={{ flex: 1 }}
                >
                  Apply Filters
                </button>

                {isFiltered && (
                  <button
                    className="btn btn-secondary"
                    onClick={clearFilters}
                    style={{ flex: 1 }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
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
                          onClick={() => {
                            console.log("📊 CLICK MY EVENT");
                            console.log(
                              "currentUserId:",
                              currentUserId,
                              "kiểu dữ liệu:",
                              typeof currentUserId
                            );
                            console.log(
                              "Số lượng sự kiện của tôi:",
                              events.filter(
                                (event) =>
                                  String(event.createBy) ===
                                  String(currentUserId)
                              ).length
                            );
                            setEventFilter("my");
                          }}
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
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (
                            searchTerm.trim() === "" &&
                            !selectedCategory &&
                            !selectedStatus &&
                            !selectedStart &&
                            !selectedEnd &&
                            !selectedLocation
                          ) {
                            setIsFiltered(false);
                          } else {
                            handleSearch();
                          }
                        }}
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {isFiltered ? (
                filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div key={event.id} className="col-12 belarus_fast">
                      <div
                        style={{
                          height: "500px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                        className="belarus_items"
                      >
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
                        />

                        <div
                          className="belarus_content"
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
                                : statusEvent(
                                    event.startTime,
                                    event.endTime
                                  ) === "not started yet"
                                ? "not_started_status"
                                : "ended_status"
                            }`}
                          >
                            {statusEvent(event.startTime, event.endTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="col-12"
                    style={{
                      minHeight: "500px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      margin: "20px 0",
                      background: "#f9f9f9",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <div className="text-center">
                      <h3 style={{ color: "#555", fontWeight: "500" }}>
                        Không tìm thấy sự kiện nào
                      </h3>
                      <p style={{ color: "#777" }}>
                        Vui lòng thử lại với các tiêu chí tìm kiếm khác
                      </p>
                    </div>
                  </div>
                )
              ) : (
                (() => {
                  if (eventFilter === "my") {
                    const myEvents = events.filter(
                      (event) =>
                        String(event.createBy) === String(currentUserId)
                    );

                    if (myEvents.length === 0) {
                      return (
                        <div
                          className="col-12"
                          style={{
                            minHeight: "500px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            margin: "20px 0",
                            background: "#f9f9f9",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <div className="text-center">
                            <h3 style={{ color: "#555", fontWeight: "500" }}>
                              Bạn chưa có sự kiện nào
                            </h3>
                            <p style={{ color: "#777" }}>
                              Các sự kiện bạn tạo sẽ hiển thị ở đây
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return myEvents.map((event) => (
                      <div key={event.id} className="col-12 belarus_fast">
                        <div
                          style={{
                            height: "500px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                          className="belarus_items"
                        >
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
                              const userRole = (
                                localStorage.getItem("role") || ""
                              )
                                .trim()
                                .toLowerCase();
                              let targetUrl = `/event-detail-spec/${event.id}`;
                              if (
                                userRole === "campus manager" ||
                                userRole === "event organizer"
                              ) {
                                targetUrl = `/event-detail-EOG/${event.id}`;
                              }
                              navigate(targetUrl);
                            }}
                            style={{ cursor: "pointer" }}
                          />

                          <div
                            className="belarus_content"
                            onClick={() => {
                              const userRole = (
                                localStorage.getItem("role") || ""
                              )
                                .trim()
                                .toLowerCase();
                              let targetUrl = `/event-detail-spec/${event.id}`;
                              if (
                                userRole === "campus manager" ||
                                userRole === "event organizer"
                              ) {
                                targetUrl = `/event-detail-EOG/${event.id}`;
                              }
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
                                let targetUrl = `/event-detail-spec/${event.id}`;
                                if (
                                  userRole === "campus manager" ||
                                  userRole === "event organizer"
                                ) {
                                  targetUrl = `/event-detail-EOG/${event.id}`;
                                }
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
                                  : statusEvent(
                                      event.startTime,
                                      event.endTime
                                    ) === "not started yet"
                                  ? "not_started_status"
                                  : "ended_status"
                              }`}
                            >
                              {statusEvent(event.startTime, event.endTime)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ));
                  }

                  return events.map((event) => (
                    <div key={event.id} className="col-12 belarus_fast">
                      <div
                        style={{
                          height: "500px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                        className="belarus_items"
                      >
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
                            const userRole = (
                              localStorage.getItem("role") || ""
                            )
                              .trim()
                              .toLowerCase();
                            let targetUrl = `/event-detail-spec/${event.id}`;
                            if (
                              userRole === "campus manager" ||
                              userRole === "event organizer"
                            ) {
                              targetUrl = `/event-detail-EOG/${event.id}`;
                            }
                            navigate(targetUrl);
                          }}
                          style={{ cursor: "pointer" }}
                        />
                        <div
                          className="belarus_content"
                          onClick={() => {
                            const userRole = (
                              localStorage.getItem("role") || ""
                            )
                              .trim()
                              .toLowerCase();
                            let targetUrl = `/event-detail-spec/${event.id}`;
                            if (
                              userRole === "campus manager" ||
                              userRole === "event organizer"
                            ) {
                              targetUrl = `/event-detail-EOG/${event.id}`;
                            }
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
                              let targetUrl = `/event-detail-spec/${event.id}`;
                              if (
                                userRole === "campus manager" ||
                                userRole === "event organizer"
                              ) {
                                targetUrl = `/event-detail-EOG/${event.id}`;
                              }
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
                                : statusEvent(
                                    event.startTime,
                                    event.endTime
                                  ) === "not started yet"
                                ? "not_started_status"
                                : "ended_status"
                            }`}
                          >
                            {statusEvent(event.startTime, event.endTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>

            {(isFiltered
              ? filteredTotalPages
              : eventFilter === "my"
              ? myEventPages
              : totalPages) > 1 && (
              <div className="pagination_area" style={{ padding: "30px" }}>
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Prev
                    </button>
                  </li>
                  {/* This is the key part that needs to be fixed */}
                  {Array.from({
                    length: isFiltered ? filteredTotalPages : totalPages,
                  }).map((_, index) => (
                    <li
                      key={index}
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage ===
                      (isFiltered ? filteredTotalPages : totalPages)
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
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
