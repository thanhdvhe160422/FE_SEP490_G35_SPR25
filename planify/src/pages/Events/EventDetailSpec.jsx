import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/Events/EventDetailSpec.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getEventById } from "../../services/EventService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FaClock, FaMapMarkerAlt, FaTag } from "react-icons/fa";
import { parseISO } from "date-fns";

function EventDetailSpec() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [bannerImages, setBannerImages] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const data = await getEventById(eventId);
        const mediaList = data?.eventMedias ?? [];
        if (!Array.isArray(mediaList)) {
          console.error("eventMedias is not an array:", mediaList);
          setBannerImages([]);
          return;
        }

        const imageUrls = mediaList
          .map((media) => media?.mediaDTO?.mediaUrl)
          .filter((url) => !!url);

        setBannerImages(imageUrls);

        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      }
    };

    fetchEventDetail();
  }, [eventId]);
  useEffect(() => {
    if (bannerImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 3000); // 3s đổi ảnh
    return () => clearInterval(interval);
  }, [bannerImages]);
  const statusEvent = (start, end) => {
    const now = new Date();
    const startDateTime = new Date(start);
    const endDateTime = new Date(end);
    if (startDateTime <= now && now <= endDateTime) {
      return "running";
    } else if (now > endDateTime) {
      return "closed";
    } else {
      return "not started yet";
    }
  };
  if (!event) return <p>Loading event details...</p>;
  const formatDateTime = (dateTime) => {
    const date = parseISO(dateTime);
    return format(date, "HH:mm eeee, dd/MM/yyyy", { locale: vi });
  };
  const fixDriveUrl = (url) => {
    if (!url.includes("drive.google.com/uc?id=")) return url;
    const fileId = url.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };

  return (
    <>
      <Header />
      <div className="event-container">
        <div className="event-banner">
          {bannerImages.length > 0 ? (
              <div className="banner-slider">
                {bannerImages.map((img, index) => (
                    <img
                        key={index}
                        src={fixDriveUrl(img)}
                        alt={`Event Banner ${index}`}
                        className={`banner-image ${index === currentIndex ? "active" : ""}`}
                    />
                ))}
              </div>
          ) : (
              <p>No images available</p>
          )}
        </div>
        <div className="event-details">
          <div className="event-title-container">
            <h1 style={{color: "purple", fontWeight: "bold"}}>
              {event.eventTitle}
            </h1>
            <div
                className={`status_tag ${
                    statusEvent(event.startTime, event.endTime) === "running"
                        ? "running_status"
                        : statusEvent(event.startTime, event.endTime) ===
                        "not started yet"
                            ? "not_started_status"
                            : "ended_status"
                }`}
            >
              {statusEvent(event.startTime, event.endTime)}
            </div>
          </div>
          <div className="event-category">
            <FaTag className="icon-category"/>
            <span>
              <strong> Event Type:</strong> {event.category}
            </span>
          </div>
          <div className="event-time">
            <FaClock className="icon-time"/>
            <span>
              <strong> From:</strong> {formatDateTime(event.startTime)}
            </span>
          </div>
          <div>
            <FaClock className="icon-time"/>
            <span>
              <strong>To:</strong> {formatDateTime(event.endTime)}
            </span>
          </div>
          <div className="event-location">
            <FaMapMarkerAlt className="icon-location"/>
            <span>
              <strong> Location:</strong> {event.placed}
            </span>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default EventDetailSpec;
