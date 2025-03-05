import { useState,useEffect } from "react";
import "../../styles/Events/EventDetailSpec.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {getEventDetailSpec} from "../../services/EventService";

function EventDetailSpec() {
    const [event, setEvent] = useState(null);
    useEffect(() => {
      const fetchEventDetail = async(eventId)=>{
        try{
            const data = await getEventDetailSpec(eventId);
            setEvent(data);
            console.log(event)
        }catch(error){
            console.error("Error loading event detail spectator: ",error);
        }
      }
      fetchEventDetail(2);
    });
  const images = event?.EventMedias?.map((media) => media.MediaDTO.Url);
  const [activeIndex, setActiveIndex] = useState(0);

  const changeSlide = (index) => {
    setActiveIndex(index);
  };

  return (
    <>
      <Header />
      <div className="event-container">
        <div className="event-header">
          <h2>{event.EventTitle}</h2>
        </div>
        <div className="event-content">
          <div className="event-info">
            <span className="event-time">
              <p>
                <strong>From: </strong>
                {event.StartTime}
              </p>

              <p>
                <strong>To: </strong>
                {event.EndTime}
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
            </span>
            <span className="event-location">
              <p>
                <strong>Category:</strong> {event.CategoryViewModel.Name}
              </p>
              <p>
                <strong>Location:</strong> {event.Placed}
              </p>
              <p>
                <strong>Description:</strong> {event.EventDescription}
              </p>
            </span>
          </div>
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
                  onClick={() => changeSlide(index)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default EventDetailSpec;
