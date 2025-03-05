import { useState } from "react";
import "../../styles/Events/EventDetailSpec.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

function EventDetailSpec() {
  const event = {
    id: "1",
    Status: "Running",
    EventTitle: "Sự kiện Tết",
    StartTime: "01-01-2020",
    EndTime: "03-01-2020",
    EventDescription: "Sự kiện diễn ra hàng năm với nhiều hoạt động thú vị.",
    Placed: "Phố đi bộ Nguyễn Huệ",
    CategoryViewModel: { Id: "1", Name: "Lễ hội" },
    EventMedias: [
      {
        Id: "1",
        MediaDTO: {
          Url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFYDy0dtqY-GmpwssQR-DKlQgrvsRy47FokQ&s",
        },
      },
      {
        Id: "2",
        MediaDTO: {
          Url: "https://blog.topcv.vn/wp-content/uploads/2021/07/sk2uEvents_Page_Header_2903ed9c-40c1-4f6c-9a69-70bb8415295b.jpg",
        },
      },
      {
        Id: "3",
        MediaDTO: {
          Url: "https://cdn.prod.website-files.com/6769617aecf082b10bb149ff/67763d8a2775bee07438e7a5_Events.png",
        },
      },
    ],
  };

  const images = event.EventMedias.map((media) => media.MediaDTO.Url);
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
