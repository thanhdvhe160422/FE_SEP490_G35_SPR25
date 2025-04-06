import React, { useEffect, useState } from "react";
import { getMyRequest } from "../../services/EventRequestService";
import Swal from "sweetalert2";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router";

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
  const pendingRequests = requests.filter((req) => req.status === 0);
  const approvedRequests = requests.filter((req) => req.status === 1);
  const rejectedRequests = requests.filter((req) => req.status === -1);

  return (
    <>
      <Header />
      <div className="manager-container">
        <h2>List Event Request</h2>
        <div className="requests-grid">
          <RequestColumn
            title="Not Approved Yet"
            requests={pendingRequests}
          ></RequestColumn>

          <RequestColumn title="Approved" requests={approvedRequests} />
          <RequestColumn title="Rejected" requests={rejectedRequests} />
        </div>
      </div>
      <Footer />
    </>
  );
}
function RequestColumn({ title, requests, children }) {
  const navigate = useNavigate();
  return (
    <div className="request-column">
      <h3>{title}</h3>
      {requests.length === 0 ? (
        <p>No requirements.</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="request-card">
            <h4
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(`/event-detail-EOG/${req.eventId}`);
              }}
            >
              {req.eventTitle}
            </h4>
            {req.reason && (
              <p>
                <strong>Reason:</strong> {req.reason}
              </p>
            )}
            <p>
              <strong>Create At: </strong> {formatDateTime(req.createdAt)}
            </p>
            {children && children(req)}
          </div>
        ))
      )}
    </div>
  );
}
const formatDateTime = (dateTime) => {
  return new Date(dateTime).toLocaleString("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default MyRequest;
