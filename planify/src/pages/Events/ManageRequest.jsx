import React, { useEffect, useState } from "react";
import "../../styles/Events/ManageRequest.css";
import {
  approveRequest,
  rejectRequest,
  getRequest,
} from "../../services/EventRequestService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";

function ManageRequest() {
  const [requests, setRequests] = useState([]);
  const [showPopupReject, setShowPopupReject] = useState(false);
  const [showPopupApprove, setShowPopupApprove] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveReason, setApproveReason] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getRequest();
        console.log("Fetched Requests: ", data);
        setRequests(data.result);
      } catch (error) {
        console.error("Error fetching requests:", error);
        Swal.fire("Error", "Unable to fetch requests.", "error");
      }
    };
    fetchRequests();
  }, []);
  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowPopupApprove(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowPopupReject(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await rejectRequest(selectedRequest.eventId, rejectReason);
      setRequests((prev) =>
        prev.filter((req) => req.eventId !== selectedRequest.eventId)
      );
      setShowPopupReject(false);
      setRejectReason("");
    } catch (error) {
      Swal.fire("Error", "Unable to reject request.", "error");
    }
  };

  const submitApprove = async () => {
    if (!approveReason || !approveReason.trim() === "") {
      Swal.fire("Error", "Please enter a reason for approval.", "error");
      return;
    }
    console.log("Approve Reason:", approveReason);
    try {
      console.log("Submitting approve request with payload:", {
        eventId: selectedRequest.eventId,
        reason: approveReason,
      });
      await approveRequest(selectedRequest.eventId, approveReason);
      setRequests((prev) =>
        prev.filter((req) => req.eventId !== selectedRequest.eventId)
      );
      setShowPopupApprove(false);
      setApproveReason("");
    } catch (error) {
      console.error("Error approving request:", error);
      Swal.fire("Error", "Unable to approve request.", "error");
    }
  };

  const pendingRequests = requests.filter((req) => req.status === 0);
  const approvedRequests = requests.filter((req) => req.status === 1);
  const rejectedRequests = requests.filter((req) => req.status === -1);

  return (
    <>
      <Header></Header>
      <div className="manager-container">
        <h2>List Event Request</h2>
        <div className="requests-grid">
          <RequestColumn title="Not Approved Yet" requests={pendingRequests}>
            {(req) => (
              <>
                <button
                  className="btn approve"
                  onClick={() => handleApprove(req)}
                >
                  Approve
                </button>
                <button
                  className="btn reject"
                  onClick={() => handleReject(req)}
                >
                  Reject
                </button>
              </>
            )}
          </RequestColumn>

          <RequestColumn title="Approved" requests={approvedRequests} />
          <RequestColumn title="Rejected" requests={rejectedRequests} />
        </div>

        {showPopupReject && (
          <div className="popup">
            <div className="popup-content">
              <h3>Reject Request</h3>
              <textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <button
                className="btn cancel"
                onClick={() => setShowPopupReject(false)}
              >
                Cancel
              </button>
              <button className="btn submit" onClick={submitReject}>
                Submit
              </button>
            </div>
          </div>
        )}
        {showPopupApprove && (
          <div className="popup">
            <div className="popup-content">
              <h3 style={{ color: "green" }}>Approve Request</h3>
              <textarea
                placeholder="Enter reason..."
                value={approveReason}
                onChange={(e) => setApproveReason(e.target.value)}
              />
              <button
                className="btn cancel"
                onClick={() => setShowPopupApprove(false)}
              >
                Cancel
              </button>
              <button
                style={{ backgroundColor: "green" }}
                className="btn submit"
                onClick={submitApprove}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer></Footer>
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
              {req.eventId}
            </h4>
            <p>
              <strong>From:</strong> {}
            </p>
            <p>
              <strong>To:</strong> {}
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
