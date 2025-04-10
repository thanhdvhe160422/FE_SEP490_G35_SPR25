import React, { useEffect, useState } from "react";
import { getMyRequest } from "../../services/EventRequestService";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router";
import "../../styles/Events/MyRequest.css";

function MyRequest(props) {
  const [requests, setRequests] = useState([]);
  const userId = localStorage.getItem("userId");
  const fetchRequests = async () => {
    try {
      const response = await getMyRequest(userId);
      console.log("Fetched Requests: ", response.result);
      setRequests(response.result);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };
  useEffect(() => {
    fetchRequests();
  }, []);
  const pendingRequests = requests.filter((req) => req.status === 1);
  const approvedRequests = requests.filter((req) => req.status === 2);
  const rejectedRequests = requests.filter((req) => req.status === -1);

  return (
    <div
      className="event-request-page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <div className="event-request-content">
        <h2>Danh sách yêu cầu của tôi</h2>
        <div className="event-request-columns">
          <RequestColumn title="Chưa được duyệt" requests={pendingRequests} />
          <RequestColumn title="Đã duyệt" requests={approvedRequests} />
          <RequestColumn title="Đã từ chối" requests={rejectedRequests} />
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
function RequestColumn({ title, requests, children }) {
  const navigate = useNavigate();
  return (
    <div className="event-request-column">
      <h3>{title}</h3>
      {requests.length === 0 ? (
        <p className="empty-message">Không có yêu cầu nào</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="event-request-card">
            <h4
              className="event-request-title"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(`/event-detail-EOG/${req.eventId}`);
              }}
            >
              {req.eventTitle}
            </h4>
            {req.reason && (
              <p className="event-request-reason">
                <strong>Lý do:</strong> {req.reason}
              </p>
            )}
            <p className="event-request-date">
              <strong>Tạo: </strong> {formatDateTime(req.createdAt)}
            </p>
            {children && children(req)}
          </div>
        ))
      )}
    </div>
  );
}
const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString("vi", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default MyRequest;
