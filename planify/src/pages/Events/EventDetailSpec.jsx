import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/Events/EventDetailSpec.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getEventById } from "../../services/EventService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

function EventDetailSpec() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const data = await getEventById(eventId);
        console.log(data);
        if (data) {
          setEvent(data);
        }
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      }
    };

    fetchEventDetail();
  }, [eventId]);

  if (!event) return <p>Loading event details...</p>;

  const images = event.EventMedias?.map((media) => media.MediaDTO.Url) || [];

  return (
    <>
      <Header />
      <div className="event-container">
        <div className="event-header">
          <h2 style={{ color: "red" }}>{event.eventTitle}</h2>
        </div>
        <div className="event-content">
          <div className="event-info">
            <div className="event-time">
              <p>
                <strong>From:</strong>{" "}
                {format(
                  new Date(event.startTime),
                  "EEEE, dd/MM/yyyy HH:mm:ss",
                  { locale: vi }
                )}
              </p>
              {/*  */}
              <p>
                <strong>To:</strong>{" "}
                {event?.endTime
                  ? format(
                      new Date(event.endTime),
                      "EEEE, dd/MM/yyyy HH:mm:ss",
                      { locale: vi }
                    )
                  : "Chưa có thời gian kết thúc"}
              </p>
              <div
                className={`status_tag ${
                  event.status === 1 ? "running_status" : "not_started_status"
                }`}
              >
                {event.status === 1 ? "Running" : "Not Started"}
              </div>
            </div>
            <div className="event-location">
              <p>
                <strong>Category:</strong>{" "}
                {event.categoryViewModel?.categoryEventName}
              </p>
              <p>
                <strong>Location:</strong> {event.placed}
              </p>
              <p>
                <strong>Description:</strong> {event.eventDescription}
              </p>
            </div>
          </div>
          {images.length > 0 && (
            <div className="event-slider">
              <div className="image-container">
                <img
                  src={event.eventMedias.mediaDTO.mediaUrl}
                  alt="Event"
                  className="event-image"
                />
              </div>
              <div className="dots">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${activeIndex === index ? "active" : ""}`}
                    onClick={() => setActiveIndex(index)}
                  ></span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default EventDetailSpec;
