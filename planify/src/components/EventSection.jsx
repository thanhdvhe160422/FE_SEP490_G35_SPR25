import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Author/Home.css";
import bannerImage from "../assets/banner-item-3.jpg";
import getPosts from "../services/EventService";
import getCategories from "../services/CategoryService";

const POSTS_PER_PAGE = 5;

function EventSection() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPosts();
      const sortedPosts = data.sort((a, b) =>
        a.status === "running" ? -1 : 1
      );
      setPosts(sortedPosts);
    };

    const fetchCategories = async () => {
      const categoryData = await getCategories();
      setCategories(categoryData);
    };

    fetchData();
    fetchCategories();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory
      ? post.category === selectedCategory
      : true;
    const matchesSearch = searchTerm
      ? post.title.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesStatus = selectedStatus
      ? post.status === selectedStatus
      : true;
    const matchesStart = selectedStart
      ? new Date(post.start) >= new Date(selectedStart)
      : true;
    const matchesEnd = selectedEnd
      ? new Date(post.end) <= new Date(selectedEnd)
      : true;
    const matchesLocation = selectedLocation
      ? post.location.toLowerCase().includes(selectedLocation.toLowerCase())
      : true;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesStatus &&
      matchesStart &&
      matchesEnd &&
      matchesLocation
    );
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

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
                  <h2>List Event</h2>
                  <div className="filter_container">
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
                      type="text"
                      className="search_input"
                      placeholder="Search event..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {currentPosts.map((post) => (
                <div key={post.id} className="col-12 belarus_fast">
                  <div className="belarus_items">
                    <img
                      src={bannerImage}
                      alt="News"
                      onClick={() => navigate(`/news/${post.id}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <div className="belarus_content">
                      <h6>{post.location}</h6>
                      <p className="event_time">
                        <strong>From:</strong> {post.start}
                        <br />
                        <strong>To:</strong> {post.end}
                      </p>
                      <div
                        className="heding wow fadeInUp"
                        onClick={() => navigate(`/news/${post.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {post.title}
                      </div>
                      <div
                        className={`status_tag ${
                          post.status === "running"
                            ? "running_status"
                            : "not_started_status"
                        }`}
                      >
                        {post.status === "running"
                          ? "Running"
                          : "Not started yet"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
