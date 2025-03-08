import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/Events/EventDetailSpec.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getEventById } from "../../services/EventService";

function EventDetailSpec() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const data = await getEventById(id);
        if (data) {
          setEvent(data);
        }
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      }
    };

    fetchEventDetail();
  }, [id]);

  if (!event) return <p>Loading event details...</p>;

  const images = event.EventMedias?.map((media) => media.MediaDTO.Url) || [];

  return (
    <>
      <Header />
      <div className="event-container">
        <div className="event-header">
          <h2 style={{ color: "red" }}>{event.EventTitle}</h2>
        </div>
        <div className="event-content">
          <div className="event-info">
            <div className="event-time">
              <p>
                <strong>From:</strong> {event.StartTime}
              </p>
              <p>
                <strong>To:</strong> {event.EndTime}
              </p>
              <div
                className={`status_tag ${
                  event.Status === "Running"
                    ? "running_status"
                    : "not_started_status"
                }`}
              >
                {event.Status}
              </div>
            </div>
            <div className="event-location">
              <p>
                <strong>Category:</strong> {event.CategoryViewModel?.Name}
              </p>
              <p>
                <strong>Location:</strong> {event.Placed}
              </p>
              <p>
                <strong>Description:</strong> {event.EventDescription}
              </p>
            </div>
          </div>
          {images.length > 0 && (
            <div className="event-slider">
              <div className="image-container">
                <img
                  src={images[activeIndex]}
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
