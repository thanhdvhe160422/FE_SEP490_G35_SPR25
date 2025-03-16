import React, { useEffect, useState } from "react";
import getPosts from "../../services/EventService";
import "../../styles/Events/ManageRequest.css";
import {
  approveRequest,
  rejectRequest,
} from "../../services/EventRequestService";

function ManageRequest() {
  const [requests, setRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const managerId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchRequests = async () => {
      const data = await getPosts();
      setRequests(data);
    };
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    await approveRequest(id, managerId);
    updateRequestStatus(id, 1);
  };

  const handleReject = (id) => {
    setSelectedRequest(id);
    setShowPopup(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    await rejectRequest(selectedRequest, rejectReason);
    updateRequestStatus(selectedRequest, -1);
    setShowPopup(false);
    setRejectReason("");
  };

  const updateRequestStatus = (id, status) => {
    setRequests((prevRequests) =>
      prevRequests.map((req) => (req.id === id ? { ...req, status } : req))
    );
  };

  const pendingRequests = requests.filter((req) => req.status === 0);
  const approvedRequests = requests.filter((req) => req.status === 1);
  const rejectedRequests = requests.filter((req) => req.status === -1);

  return (
    <div className="manager-container">
      <h2>List Event Request</h2>
      <div className="requests-grid">
        <RequestColumn title="Not Approved Yet" requests={pendingRequests}>
          {(req) => (
            <>
              <button
                className="btn approve"
                onClick={() => handleApprove(req.id)}
              >
                Approve
              </button>
              <button
                className="btn reject"
                onClick={() => handleReject(req.id)}
              >
                Reject
              </button>
            </>
          )}
        </RequestColumn>

        <RequestColumn title="Approved" requests={approvedRequests} />
        <RequestColumn title="Rejected" requests={rejectedRequests} />
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Reject Request</h3>
            <textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <button className="btn cancel" onClick={() => setShowPopup(false)}>
              Cancel
            </button>
            <button className="btn submit" onClick={submitReject}>
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function RequestColumn({ title, requests, children }) {
  return (
    <div className="request-column">
      <h3>{title}</h3>
      {requests.length === 0 ? (
        <p>No requirements.</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="request-card">
            <h4>{req.eventTitle}</h4>
            <p>
              <strong>From:</strong> {formatDateTime(req.startTime)}
            </p>
            <p>
              <strong>To:</strong> {formatDateTime(req.endTime)}
            </p>
            <p>
              <strong>Place:</strong> {req.placed}
            </p>
            <p>
              <strong>Description:</strong> {req.eventDescription}
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

export default ManageRequest;
