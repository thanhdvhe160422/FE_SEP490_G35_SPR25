import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import "../../styles/Events/MyFarvourite.css";
import Header from "../../components/Header/Header";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // solid và regular icon
import { getMyFavouriteEvents,deleteFavouriteEvent } from "../../services/EventService";

export default function MyFarvourite() {
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

  // useEffect(() => {
  //   axios
  //     .get("http://localhost:4000/events")
  //     .then((res) => {
  //       setEvents(res.data);
  //     })
  //     .catch((err) => console.error("Error fetching events:", err));
  // }, []);
  useEffect(()=>{
    const fetchFavoriteEvent = async() =>{
      try{
        const response = await getMyFavouriteEvents(1,8);
        setEvents(response.items);
      }catch(error){
        console.log("Error while fetch favorite event: "+error);
      }
    }
    fetchFavoriteEvent();
  },[])
  // const filteredEvents = events
  //   .filter((event) => likedEvents.includes(event.Id))
  //   .filter((event) => {
  //     const status = getStatus(event.StartTime, event.EndTime);
  //     const matchStatus = statusFilter === "All" || status === statusFilter;
  //     const matchSearch = event.EventTitle.toLowerCase().includes(
  //       searchTerm.toLowerCase()
  //     );
  //     // const matchCategory =
  //     //   categoryFilter === "All" || event.Category === categoryFilter;
  //     const matchLocation =
  //       locationFilter === "All" || event.Placed === locationFilter;
  //     return matchStatus && matchSearch && matchLocation;
  //   });
  //   console.log(filteredEvents);

  const toggleFavourite = (id, e) => {
    e.stopPropagation();
    setLikedEvents((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };
  const HandleDeleteFavorite = (eventId) => {
    return async (e) => {
      e.stopPropagation();
      try {
        const isDelete = await deleteFavouriteEvent(eventId);
        if (isDelete?.status === 200) {
          const response = await getMyFavouriteEvents(1, 8);
          setEvents(response.items);
        }
      } catch (error) {
        console.log("Error while deleting favorite: " + error);
      }
    };
  };
  
  return (
    <>
      <Header />
      <div className="d-flex">
        <div className="flex-grow-1 px-4" style={{ marginTop: "100px" }}>
          <Container fluid className="px-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Farvourite Events</h2>
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
              {/* {filteredEvents.length === 0 ? ( */}
              {events?.length === 0 ? (
                <div
                  className="text-center text-muted mt-5"
                  style={{ fontSize: "1.1rem" }}
                >
                  You haven't favourited any events yet.
                </div>
              ) : (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                  {/* {filteredEvents.map((event) => { */}
                  {events?.map((event) => {
                    const status = getStatus(event.startTime, event.endTime);
                    return (
                      <Col key={event.id}>
                        <Card
                          className="h-100 shadow-sm event-card"
                          onClick={() => navigate(`/event-detail/${event.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <Card.Img
                            variant="top"
                            src={event?.eventMedia[0]?.mediaUrl}
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

                              {/* {likedEvents.includes(event.id) ? (
                                <FaHeart
                                  className="favourite-icon active"
                                  onClick={(e) => toggleFavourite(event.id, e)}
                                />
                              ) : (
                                <FaRegHeart
                                  className="favourite-icon"
                                  onClick={(e) => toggleFavourite(event.id, e)}
                                />
                              )} */}
                              <FaHeart
                                  className="favourite-icon active"
                                  onClick={HandleDeleteFavorite(event.id)}
                                />
                            </div>

                            <Card.Title
                              style={{ fontSize: "100%" }}
                              className="event-title fw-bold"
                            >
                              {event.eventTitle}
                            </Card.Title>
                            <Card.Text>
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
                                  Place: {event.placed}
                                </small>
                              </div>
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
