import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

import refreshAccessToken from "../../services/refreshToken";
import {
  FaClock,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillAlt,
  FaTags,
} from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import "../../styles/Events/EventDetailEOG.css";
import { useSnackbar } from "notistack";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Swal from "sweetalert2";

const EventDetailEOG = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [groups, setGroups] = useState([]);
  const [event, setEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { eventId } = useParams();

  // const backgroundImages = [];
  const fixDriveUrl = (url) => {
    if (!url.includes("drive.google.com/uc?id=")) return url;
    const fileId = url.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };
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

  const handleDeleteEvent = () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          fetch(`https://localhost:44320/api/Events/delete/${eventId}`, {
            method: "PUT",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to delete event");
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
            })
            .catch((error) => {
              console.error("Error deleting event:", error);
              swalWithBootstrapButtons.fire({
                title: "Error!",
                text: "Failed to delete event. Please try again!",
                icon: "error",
              });
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      });
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

  return (
    <>
      <Header />
      <div className="event-container">
        {event && (
          <>
            <div
              className="event-header"
              style={{
                background: `url("${images[currentImageIndex]}") no-repeat center/cover`,
                padding: "30px",
                borderRadius: "10px",
                width: "90%",
                height: "500px",
                color: "white",
                position: "relative",
              }}
            >
              <img
                src={fixDriveUrl(images)}
                // src={images[currentImageIndex]}
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
                <h1 style={{ color: "purple", fontWeight: "bold" }}>
                  {event.eventTitle}
                </h1>
                <div
                  className="event-status"
                  data-status={eventStatus.status}
                  style={{ backgroundColor: eventStatus.color }}
                >
                  {eventStatus.status}
                </div>
              </div>
              <div className="event-time">
                <FaClock className="icon-time" />
                <span className="event-info-span">Start Time:</span>
                {formatDateTime(event.startTime)}
              </div>
              <div>
                <FaClock className="icon-time" />
                <span className="event-info-span">End Time:</span>
                {formatDateTime(event.endTime)}
              </div>
              <div className="event-location">
                <FaMapMarkerAlt className="icon-location" />
                <span className="event-info-span">Location:</span>
                {event.placed}
              </div>
              <div>
                <FaMoneyBillAlt
                  className="icon-price"
                  style={{ marginRight: "10px", color: "grey" }}
                />
                <span className="event-info-span">Total Cost:</span>
                {event.amountBudget.toLocaleString("vi-VN")} VNĐ
              </div>
              <div style={{ marginTop: "10px" }}>
                <MdOutlineCategory
                  className="icon-category"
                  style={{ marginRight: "10px", color: "orange" }}
                />
                <span className="event-info-span">Category:</span>
                {event.categoryEventName}
              </div>
            </div>

            <div className="event-description">
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                Description:
              </div>
              <div className="eventDescription">
                <span>{event.eventDescription}</span>
              </div>
            </div>

            <div className="event-member-group" style={{ width: "90%" }}>
              <h3>List Group</h3>
              <div className="event-groups">
                {event.groups.map((group) => (
                  <div
                    className="event-group-card"
                    key={group.id}
                    onClick={() => navigate(`/group-detail/${group.id}`)}
                  >
                    <div className="event-group-header">
                      <span style={{ color: "black" }}>{group.groupName}</span>
                      <span style={{ color: "blanchedalmond" }}>
                        {group.amountBudget.toLocaleString("vi-VN")} VNĐ
                      </span>
                    </div>

                    <div
                      className="event-group-members"
                      style={{ marginTop: "10px" }}
                    >
                      {group.joinGroups.length > 0 ? (
                        group.joinGroups.map((joinGroup) => (
                          <div
                            key={joinGroup.id}
                            className="member-item"
                            style={{ marginTop: "5px" }}
                          >
                            <span>
                              {joinGroup.implementerFirstName}{" "}
                              {joinGroup.implementerLastName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div>No implementers</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="event-actions">
          <button className="delete-event-btn" onClick={handleDeleteEvent}>
            Delete event
          </button>
          <button
            className="update-event-btn"
            onClick={() => {
              navigate("/update-event");
            }}
          >
            Update event
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default EventDetailEOG;
