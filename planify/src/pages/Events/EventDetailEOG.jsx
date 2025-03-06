import React, { useState, useEffect } from "react";
import "../../styles/Events/EventDetailEOG.css"; // Import file CSS riêng
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

const EventDetailEOG = () => {
  const [groups, setGroups] = useState([]);
  const [event, setEvent] = useState(null);

  // Gọi API để lấy dữ liệu sự kiện
  useEffect(() => {
    fetch("http://localhost:4000/events/2")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Event Data:", data); // Debug
        setEvent(data);
      })
      .catch((error) => console.error("Error fetching event data:", error));
  }, []);

  // Gọi API để lấy dữ liệu nhóm
  useEffect(() => {
    fetch("http://localhost:4000/groups") // Thay đổi URL này thành endpoint API của bạn
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch groups data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Groups Data:", data); // Debug
        setGroups(data);
      })
      .catch((error) => console.error("Error fetching groups data:", error));
  }, []);

  return (
    <>
      <Header />
      <div className="event-container">
        {event && (
          <>
            <div
              className="event-header"
              style={{
                background:
                  "url('https://images2.thanhnien.vn/528068263637045248/2024/2/7/youtube-tv-17072736627281851838672.jpg') no-repeat center/cover",
                padding: "30px",
                borderRadius: "10px",
                width: "90%",
                height: "500px",
                color: "white",
              }}
            >
              <div
                style={{
                  marginTop: "250px",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                <p>{event.Placed}</p>
                <p>
                  From: {event.StartTime} - To: {event.EndTime}
                </p>
                <h2>{event.EventTitle}</h2>
              </div>
              <span className="event-status">RUNNING</span>
            </div>

            <div className="event-member-group" style={{ width: "90%" }}>
              <h3>Member Group</h3>
              <div className="event-groups">
                {groups.map((group) => (
                  <div className="event-group-card" key={group.id}>
                    <div className="event-group-header">
                      <span>{group.name}</span>
                    </div>
                    <div className="event-group-members">
                      {group.members.map((member, index) => (
                        <div key={index} className="member-item">
                          {member}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button className="update-event-btn">Update event</button>
      </div>
      <Footer />
    </>
  );
};

export default EventDetailEOG;
