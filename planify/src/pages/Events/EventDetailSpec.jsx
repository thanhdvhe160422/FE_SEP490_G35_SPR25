import { useState } from "react";
import "../../styles/Events/EventDetailSpec.css";
function EventDetailSpec() {
  const event = {
    id: "1",
    EventTitle: "Su kien tet",
    StartTime: "01-01-2020",
    EndTime: "03-01-2020",
    EventDescription: "Su kien dien ra hang nam",
    Placed: "Duong 30m",
    CategoryEventId: "1",
    CategoryViewModel: { Id: "1", Name: "Tet" },
    EventMedias: [
      {
        Id: "1",
        EventId: "1",
        MediaId: "1",
        MediaDTO: { Id: "1", Url: "../../assets/fpt-campus.jpg" },
      },
      {
        Id: "2",
        EventId: "1",
        MediaId: "2",
        MediaDTO: { Id: "2", Url: "../../assets/banner-item-3.jpg" },
      },
    ],
  };
  const [image, setImage] = useState(event.EventMedias[0].MediaDTO.Url);
  const [activeDot, setActiveDot] = useState(null);
  const currentSlide = (index, Url) => {
    setImage(Url);
    setActiveDot(index);
  };
  return (
    <div className="p-2">
      <div className="d-flex flex-wrap m-5 align-items-end">
        <span className="fs-3 me-4">{event.EventTitle}</span>
        <span className="fs-6 p-1">
          {event.StartTime} - {event.EndTime}
        </span>
      </div>
      <div className="d-flex">
        <div className="col-4 m-1">
          <p>Category: {event.CategoryViewModel.Name}</p>
          <p>Placed: {event.Placed}</p>
          <p>Description: {event.EventDescription}</p>
        </div>
        <div className="col-7 m-1">
          <div className="slideshow-container d-flex justify-content-center">
            <div className="mySlides fade d-flex justify-content-center">
              <img className="" src={image} alt="..." />
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            {event.EventMedias.map((media, index) => (
              <span
                key={media.Id}
                className={`dot ${activeDot === index ? "active" : ""}`}
                onClick={() => currentSlide(index, media.MediaDTO.Url)}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default EventDetailSpec;
