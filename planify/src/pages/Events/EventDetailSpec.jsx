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

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const data = await getEventById(eventId);

        setEvent({ ...data });
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      }
    };

    fetchEventDetail();
  }, [eventId]);
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
  return (
    <>
      <Header />
      <div className="event-container">
        <div className="event-details">
          <div className="event-title-container">
            <h1 style={{ color: "purple", fontWeight: "bold" }}>
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
            <FaTag className="icon-category" />
            <span>
              <strong> Event Type:</strong> {event.category}
            </span>
          </div>
          <div className="event-time">
            <FaClock className="icon-time" />
            <span>
              <strong> From:</strong> {formatDateTime(event.startTime)}
            </span>
          </div>
          <div>
            <FaClock className="icon-time" />
            <span>
              <strong>To:</strong> {formatDateTime(event.endTime)}
            </span>
          </div>
          <div className="event-location">
            <FaMapMarkerAlt className="icon-location" />
            <span>
              <strong> Location:</strong> {event.placed}
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default EventDetailSpec;
