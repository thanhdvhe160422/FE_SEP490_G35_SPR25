import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import refreshAccessToken from "../../services/refreshToken";
import {
  FaClipboardCheck,
  FaChartLine,
  FaBullseye,
  FaUsers,
  FaClock,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillAlt,
  FaQuoteLeft,
  FaUserFriends,
  FaBullhorn,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import "../../styles/Events/EventDetailEOG.css";
import { useSnackbar } from "notistack";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Swal from "sweetalert2";
import ListTask from "../../components/ListTask";
import ListMember from "../../components/ListMember";
import ListRisk from "../../components/ListRisk";
import ListCost from "../../components/ListCost";
import ListParticipant from "../../components/ListParticipant";

const EventDetailEOG = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [event, setEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [openActivityIds, setOpenActivityIds] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      const token = localStorage.getItem("token");
      console.log(token);
      try {
        let response = await fetch(
          `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === -2) {
          navigate("/home");
          return;
        }
        if (response.status === 401) {
          const newToken = await refreshAccessToken();

          if (newToken) {
            response = await fetch(
              `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to fetch event data after token refresh`);
            }
          } else {
            enqueueSnackbar("Your session has expired, please log in again.", {
              variant: "error",
            });
            navigate("/login");
            return;
          }
        }

        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }

        const data = await response.json();
        console.log("Fetched Event Data:", data);
        data.result.groups = [];
        setEvent(data.result);

        if (data.result.eventMedia && data.result.eventMedia.length > 0) {
          const imageUrls = data.result.eventMedia.map(
            (media) => media.mediaUrl
          );
          setImages(imageUrls);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        enqueueSnackbar(
          `Lỗi khi lấy dữ liệu sự kiện: ${
            error.message || "Lỗi không xác định"
          }`,
          { variant: "error" }
        );
      }
    };

    fetchEventData();
  }, [eventId]);
  const handleDeleteEvent = async () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    const result = await swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        let token = localStorage.getItem("token");

        let response = await fetch(
          `https://localhost:44320/api/Events/delete/${eventId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          const newToken = await refreshAccessToken();

          if (newToken) {
            response = await fetch(
              `https://localhost:44320/api/Events/delete/${eventId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
          } else {
            enqueueSnackbar("Your session has expired. Please log in again.", {
              variant: "error",
            });
            navigate("/login");
            return;
          }
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete event");
        }

        swalWithBootstrapButtons
          .fire({
            title: "Deleted!",
            text: "Your event has been deleted.",
            icon: "success",
          })
          .then(() => {
            navigate("/home");
          });
      } catch (error) {
        console.error("Error deleting event:", error);
        swalWithBootstrapButtons.fire({
          title: "Error!",
          text: error.message || "Failed to delete event. Please try again!",
          icon: "error",
        });
      }
    }
  };

  const formatDateTime = (dateTime) => {
    const date = parseISO(dateTime);
    return format(date, "HH:mm eeee, dd/MM/yyyy", { locale: vi });
  };

  const getEventStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { status: "Not Starting", color: "red" };
    } else if (now >= start && now <= end) {
      return { status: "Running", color: "green" };
    } else {
      return { status: "Closed", color: "gray" };
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!event) {
    return <div>Loading...</div>;
  }

  const eventStatus = getEventStatus(event.startTime, event.endTime);
  const fixDriveUrl = (url) => {
    if (!url.includes("drive.google.com/uc?id=")) return url;
    const fileId = url.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };
  const defaultImage = "https://via.placeholder.com/1000x500?text=No+Image";

  console.log("thanh123" + event.activities);

  return (
    <>
      <Header />
      <div className="event-container">
        {event && (
          <>
            <div className="event-header">
              <img
                src={fixDriveUrl(images[currentImageIndex] || defaultImage)}
                alt="Event"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
                referrerPolicy="no-referrer"
              />
              {images.length > 1 && (
                <>
                  <button
                    className="nav-button prev-button"
                    onClick={handlePrevImage}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="nav-button next-button"
                    onClick={handleNextImage}
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>

            <div className="event-details">
              <div className="event-title-container">
                <h1>{event.eventTitle}</h1>
                <div className="event-status" data-status={eventStatus.status}>
                  {eventStatus.status}
                </div>
              </div>

              <div className="time-section">
                <h3 className="section-title">Timeframe</h3>

                <div className="info-item">
                  <FaClock className="icon-time" />
                  <div>
                    <span className="event-info-span">Start Time:</span>
                    {formatDateTime(event.startTime)}
                  </div>
                </div>

                <div className="info-item">
                  <FaClock className="icon-time" />
                  <div>
                    <span className="event-info-span">End Time:</span>
                    {formatDateTime(event.endTime)}
                  </div>
                </div>

                <div className="info-item">
                  <FaMapMarkerAlt className="icon-location" />
                  <div>
                    <span className="event-info-span">Location:</span>
                    {event.placed}
                  </div>
                </div>
              </div>

              <div className="basic-info-section">
                <h3 className="section-title">Basic Information</h3>

                <div className="info-item">
                  <MdOutlineCategory className="icon-category" />
                  <div>
                    <span className="event-info-span">Category:</span>
                    {event.categoryEventName}
                  </div>
                </div>

                <div className="info-item">
                  <FaMoneyBillAlt className="icon-price" />
                  <div>
                    <span className="event-info-span"> Total Cost:</span>
                    {event.amountBudget.toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>

                {event.sizeParticipants && (
                  <div className="info-item">
                    <FaUsers />
                    <div>
                      <span className="event-info-span">Participants:</span>
                      {event.sizeParticipants}
                    </div>
                  </div>
                )}

                {event.sloganEvent && (
                  <div className="info-item">
                    <FaQuoteLeft />
                    <div>
                      <span className="event-info-span">Slogan:</span>
                      {event.sloganEvent}
                    </div>
                  </div>
                )}

                {event.targetAudience && (
                  <div className="info-item">
                    <FaUserFriends />
                    <div>
                      <span className="event-info-span">Target Audience:</span>
                      {event.targetAudience}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="goals-planning-section">
              <h3 className="section-title">Goals & Planning</h3>

              <div className="goals-section">
                {event.goals && (
                  <div className="info-item">
                    <FaBullseye />
                    <div>
                      <span className="event-info-span">Goals:</span>
                      {event.goals}
                    </div>
                  </div>
                )}

                {event.measuringSuccess && (
                  <div className="info-item">
                    <FaChartLine />
                    <div>
                      <span className="event-info-span">Success Metrics:</span>
                      {event.measuringSuccess}
                    </div>
                  </div>
                )}

                {event.promotionalPlan && (
                  <div className="info-item">
                    <FaBullhorn />
                    <div>
                      <span className="event-info-span">Promotional Plan:</span>
                      {event.promotionalPlan}
                    </div>
                  </div>
                )}

                {event.monitoringProcess && (
                  <div className="info-item">
                    <FaClipboardCheck />
                    <div>
                      <span className="event-info-span">
                        Monitoring Process:
                      </span>
                      {event.monitoringProcess}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="event-description">
              <div>Description:</div>
              <div className="eventDescription">
                <span>{event.eventDescription}</span>
              </div>
            </div>

            <div className="event-activities">
              <div className="activities-title">Activities in event:</div>
              <div className="activities-list">
                {event.activities && event.activities.length > 0 ? (
                  event.activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div
                        className="activity-header"
                        onClick={() =>
                          setOpenActivityIds((prev) =>
                            prev.includes(activity.id)
                              ? prev.filter((id) => id !== activity.id)
                              : [...prev, activity.id]
                          )
                        }
                      >
                        <strong>{activity.name}</strong>
                        <span className="toggle-icon">
                          {openActivityIds.includes(activity.id) ? (
                            <FaMinus />
                          ) : (
                            <FaPlus />
                          )}
                        </span>
                      </div>
                      {openActivityIds.includes(activity.id) && (
                        <div className="activity-content">
                          {activity.content}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <span>Chưa có hoạt động nào</span>
                )}
              </div>
            </div>
          </>
        )}

        <ListTask eventId={eventId} data={event} />
        <ListMember eventId={eventId} data={event} />
        <ListRisk eventId={eventId} data={event} />
        <ListCost eventId={eventId} data={event} />
        <ListParticipant eventId={eventId}></ListParticipant>
        <div className="event-actions">
          {event &&
            event.createdBy &&
            event.status === 0 &&
            localStorage.getItem("userId") === String(event.createdBy.id) && (
              <>
                <button
                  className="delete-event-btn"
                  onClick={handleDeleteEvent}
                  style={{
                    opacity: event.status === 1 || event.status === 2 ? 0.5 : 1,
                    cursor:
                      event.status === 1 || event.status === 2
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Delete event
                </button>
                <button
                  className="update-event-btn"
                  onClick={() => navigate(`/update-event/${eventId}`)}
                  style={{
                    opacity: event.status === 1 || event.status === 2 ? 0.5 : 1,
                    cursor:
                      event.status === 1 || event.status === 2
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Update event
                </button>
              </>
            )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventDetailEOG;
