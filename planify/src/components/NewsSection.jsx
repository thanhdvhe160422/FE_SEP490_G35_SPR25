import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import bannerImage from "../assets/banner-item-3.jpg";
import getPosts from "../services/EventService";
import getCategories from "../services/CategoryService";

const POSTS_PER_PAGE = 5;

function NewsSection() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  // 🔥 Đặt `filteredPosts` trước khi dùng trong `useEffect`
  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;

  useEffect(() => {
    console.log("Selected Category:", selectedCategory);
    console.log("Filtered Posts:", filteredPosts);
  }, [selectedCategory, posts]); // ✅ Dùng `posts`, không dùng `filteredPosts`

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
          <div className="col-lg-8 left_sidebar ls_2">
            <div className="row feature_post_area">
              <div className="col-12">
                <div className="feature_tittle">
                  <h2>List Event</h2>
                  <div className="post_select_button">
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
                  </div>
                </div>
              </div>

              {currentPosts.map((post) => (
                <div key={post.id} className="col-12 belarus_fast">
                  <div className="belarus_items">
                    <img src={bannerImage} alt="News" />
                    <div className="belarus_content">
                      <h6 className="wow fadeInUp">{post.date}</h6>
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

export default NewsSection;
