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
import Loading from "../../components/Loading";

function ManageRequest() {
  const [requests, setRequests] = useState([]);
  const [showPopupReject, setShowPopupReject] = useState(false);
  const [showPopupApprove, setShowPopupApprove] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveReason, setApproveReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
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
    if (!rejectReason.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập lý do từ chối yêu cầu.", "error");
      return;
    }
    setIsLoading(true);
    try {
      await rejectRequest(selectedRequest.id, rejectReason);
      setIsLoading(false);
      await fetchRequests();

      setShowPopupReject(false);
      setRejectReason("");

      Swal.fire(
        "Từ chối thành công",
        "Yêu cầu đã được xử lý và từ chối thành công.",
        "success"
      );
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu:", error);
      Swal.fire(
        "Lỗi",
        "Không thể xử lý từ chối yêu cầu. Vui lòng thử lại sau.",
        "error"
      );
    }
  };

  const submitApprove = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsLoading(true);
    try {
      console.log("Phê duyệt yêu cầu với ID:", selectedRequest.id);
      await approveRequest(selectedRequest.id, approveReason);
      setIsLoading(false);
      await fetchRequests();

      setShowPopupApprove(false);
      setApproveReason("");

      Swal.fire({
        title: "Phê duyệt thành công",
        text: "Yêu cầu đã được xử lý và phê duyệt thành công.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Lỗi khi phê duyệt yêu cầu:", error);
      Swal.fire(
        "Lỗi",
        "Không thể phê duyệt yêu cầu. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }
  const pendingRequests = requests.filter((req) => req.status === 1);
  const approvedRequests = requests.filter((req) => req.status === 2);
  const rejectedRequests = requests.filter((req) => req.status === -1);

  return (
    <>
      <Header />
      <div className="manager-container">
        <h2>Dánh sách yêu cầu</h2>
        <div className="requests-grid">
          <RequestColumn
            title="Chưa được chấp thuận"
            requests={pendingRequests}
          >
            {(req) => (
              <div className="d-flex justify-content-between">
                <button
                  className="btn approve"
                  onClick={() => handleApprove(req)}
                >
                  Phê duyệt
                </button>
                <button
                  className="btn reject"
                  onClick={() => handleReject(req)}
                >
                  Từ chối
                </button>
              </div>
            )}
          </RequestColumn>

          <RequestColumn title="Đã chấp thuận" requests={approvedRequests} />
          <RequestColumn title="Đã từ chối" requests={rejectedRequests} />
        </div>

        {showPopupReject && (
          <div className="popup">
            <div className="popup-content">
              <h3>Từ chối yêu cầu</h3>
              <textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="btn-request" style={{ display: "flex" }}>
                <button
                  className="btn cancel"
                  onClick={() => setShowPopupReject(false)}
                >
                  Hủy
                </button>
                <button className="btn submit" onClick={submitReject}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
        {showPopupApprove && (
          <div className="popup">
            <div className="popup-content">
              <h3 style={{ color: "green" }}>Phê duyệt yêu cầu</h3>
              <textarea
                placeholder="Nhập lý do..."
                value={approveReason}
                onChange={(e) => setApproveReason(e.target.value)}
              />
              <div className="btn-request" style={{ display: "flex" }}>
                <button
                  className="btn cancel"
                  onClick={() => setShowPopupApprove(false)}
                >
                  Hủy
                </button>
                <button
                  style={{ backgroundColor: "green" }}
                  className="btn submit"
                  onClick={submitApprove}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <Footer /> */}
    </>
  );
}

function RequestColumn({ title, requests, children }) {
  const navigate = useNavigate();
  return (
    <div className="request-column">
      <h3>{title}</h3>
      {requests.length === 0 ? (
        <p>Không có yêu cầu nào</p>
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
                <strong>Lý do:</strong> {req.reason}
              </p>
            )}

            <p>
              <strong>Từ:</strong> {formatDateTime(req.eventStartTime)}
            </p>
            <p>
              <strong>Đến:</strong> {formatDateTime(req.eventEndTime)}
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

export default ManageRequest;
