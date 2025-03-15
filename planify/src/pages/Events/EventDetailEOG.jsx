import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
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
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Swal from "sweetalert2";

const EventDetailEOG = () => {
  const [groups, setGroups] = useState([]);
  const [event, setEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { eventId } = useParams();

  // const backgroundImages = [];

  useEffect(() => {
    fetch(
      `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Event Data:", data);
        setEvent(data.result);

        if (data.result.eventMedia && data.result.eventMedia.length > 0) {
          const imageUrls = data.result.eventMedia.map(
            (media) => media.mediaUrl
          );
          setImages(imageUrls);
        }
      })
      .catch((error) => console.error("Error fetching event data:", error));
  }, [eventId]);

  useEffect(() => {
    fetch("http://localhost:4000/groups")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch groups data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Groups Data:", data);
        setGroups(data);
      })
      .catch((error) => console.error("Error fetching groups data:", error));
  }, []);

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
          fetch(`http://localhost:4000/events/${event.id}`, {
            method: "DELETE",
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
                  navigate("/list-event");
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
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your event is safe :)",
            icon: "error",
          });
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
                background: `url(${images[currentImageIndex]}) no-repeat center/cover`,
                padding: "30px",
                borderRadius: "10px",
                width: "90%",
                height: "500px",
                color: "white",
                position: "relative",
              }}
            >
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
                {groups.map((group) => (
                  <div
                    className="event-group-card"
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <div className="event-group-header">
                      <span>{group.name}</span>
                      <span className="group-cost">
                        Cost: {group.cost} <span>VNĐ</span>
                      </span>
                    </div>
                    <div className="event-group-members">
                      {group.members.map((member, index) => (
                        <div key={index} className="member-item">
                          <div>{member.name}</div>
                          <div className="member-email">{member.email}</div>
                        </div>
                      ))}
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
