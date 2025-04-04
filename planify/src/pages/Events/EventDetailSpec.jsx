import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/Events/EventDetailSpec.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { getEventSpecById } from "../../services/EventService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { parseISO } from "date-fns";
import { MdOutlineCategory } from "react-icons/md";
import { BiGridAlt } from "react-icons/bi";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import { RegisterParticipant } from "../../services/EventService";
import Swal from "sweetalert2";

function EventDetailSpec() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [bannerImages, setBannerImages] = useState([]);
  const [openLightbox, setOpenLightbox] = useState(false);

  // const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const data = await getEventSpecById(eventId);
        if (data.status === -2) {
          navigate("/home");
          return;
        }
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

  console.log("event:", event);
  async function HandleRegisterParticipant(){
    try{
      var eventId = event.id;
      var userId = localStorage.getItem("userId")
      const response = await RegisterParticipant(eventId,userId);
      console.log(JSON.stringify(response,null,2))
      if (response.status===201){
        console.log("register successfully");
        Swal.fire("Success",
                  "Register successfully",
                  "success"
                  );
      }else{
        Swal.fire("Error",
                  response?.status,
                  "error"
                  );
      }
    }catch(error){
      console.error(error);
    }
  }
  return (
    <>
      <Header />
      <div className="event-container">
        <div className="event-banner-gallery">
          <div className="gallery-left" onClick={() => setOpenLightbox(true)}>
            {bannerImages[0] && (
              <img
                src={fixDriveUrl(bannerImages[0])}
                alt="Main Event"
                className="main-banner-img"
              />
            )}
          </div>
          <div className="gallery-right">
            {bannerImages.slice(1, 3).map((img, index) => (
              <div className="thumbnail-wrapper" key={index}>
                <img
                  src={fixDriveUrl(img)}
                  alt={`Thumbnail ${index + 1}`}
                  className="thumbnail-img"
                  onClick={() => setOpenLightbox(true)}
                />
                {index === 1 && bannerImages.length > 3 && (
                  <button
                    className="view-all-btn"
                    onClick={() => setOpenLightbox(true)}
                  >
                    <BiGridAlt
                      style={{
                        marginRight: "6px",
                        fontSize: "17px",
                        marginBottom: "5px",
                      }}
                    />
                    <strong>View All Images</strong>
                  </button>
                )}
              </div>
            ))}
          </div>

          {openLightbox && (
            <Lightbox
              open={openLightbox}
              close={() => setOpenLightbox(false)}
              slides={bannerImages.map((url) => ({
                src: fixDriveUrl(url),
              }))}
              plugins={[Thumbnails]}
            />
          )}
        </div>
        <div style={{ marginRight: "70%" }}>
          <button className="btn btn-warning" style={{ height: "50px" }}
          onClick={HandleRegisterParticipant}>
            Đăng ký tham gia
          </button>
        </div>

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

          <div className="event-time">
            <FaClock className="icon-time" />
            <span>
              <strong> From:</strong>{" "}
              {event?.startTime
                ? formatDateTime(event.startTime)
                : "Not updated yet"}
            </span>
          </div>

          <div className="event-location">
            <FaMapMarkerAlt className="icon-location" />
            <span>
              <strong> Location:</strong>{" "}
              {event?.placed || "Location not updated"}
            </span>
          </div>

          <div className="event-time">
            <FaClock className="icon-time" />
            <span>
              <strong>To:</strong>{" "}
              {event?.endTime
                ? formatDateTime(event.endTime)
                : "Not updated yet"}
            </span>
          </div>

          <div className="event-category">
            <span>
              <MdOutlineCategory
                className="icon-category"
                style={{ marginRight: "10px", color: "orange" }}
              />
              <span style={{ fontWeight: "bold" }} className="event-info-span">
                Category:{" "}
              </span>
              {event?.categoryViewModel?.categoryEventName || "Not determined"}
            </span>
          </div>

          {/* <div style={{textAlign:'center', justifyContent:'center'}}>{event.targetAudience}</div> */}
        </div>
        <div className="event-description">
          <div>Slogan</div>
          <div className="eventDescription">
            <span> {event.sloganEvent}</span>
          </div>
        </div>
        <div className="event-description">
          <div>Description:</div>
          <div className="eventDescription">
            <span>{event.eventDescription}</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default EventDetailSpec;
