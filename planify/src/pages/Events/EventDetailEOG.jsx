import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import refreshAccessToken from "../../services/refreshToken";
import {
  FaClipboardCheck,
  FaChartLine,
  FaBullseye,
  FaUsers,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillAlt,
  FaQuoteLeft,
  FaUserFriends,
  FaBullhorn,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import "../../styles/Events/EventDetailEOG.css";
import { useSnackbar } from "notistack";
import Header from "../../components/Header/Header";
import Swal from "sweetalert2";
import ListTask from "../../components/ListTask";
import ListMember from "../../components/ListMember";
import ListRisk from "../../components/ListRisk";
import ListCost from "../../components/ListCost";
import ListParticipant from "../../components/ListParticipant";
import {
  approveRequest,
  getRequest,
  rejectRequest,
  sendRequest,
} from "../../services/EventRequestService";
import Loading from "../../components/Loading";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Thumbnails } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { BiGridAlt } from "react-icons/bi";

const EventDetailEOG = () => {
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [event, setEvent] = useState(null);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [showPopupReject, setShowPopupReject] = useState(false);
  const [showPopupApprove, setShowPopupApprove] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openActivityIds, setOpenActivityIds] = useState([]);
  const role = localStorage.getItem("role");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveReason, setApproveReason] = useState("");
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
      await rejectRequest(event.requestId, rejectReason);
      setIsLoading(false);
      setShowPopupReject(false);
      setRejectReason("");
      await fetchEventData();

      Swal.fire({
        title: "Từ chối thành công",
        text: "Yêu cầu đã bị từ chối và cập nhật hệ thống.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu:", error);
      Swal.fire("Lỗi", "Không thể thực hiện từ chối yêu cầu.", "error");
    }
  };

  const submitApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      await approveRequest(event.requestId, approveReason);
      setIsLoading(false);
      setShowPopupApprove(false);
      setApproveReason("");
      await fetchEventData();
      Swal.fire({
        title: "Phê duyệt thành công",
        text: "Yêu cầu đã được xử lý và phê duyệt thành công.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Lỗi khi phê duyệt yêu cầu:", error);
      Swal.fire("Lỗi", "Không thể phê duyệt yêu cầu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchEventData = async () => {
    const token = localStorage.getItem("token");
    console.log(token);
    try {
      let response = await fetch(
        `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === -2) {
        navigate("/home");
        return;
      }
      if (response.status === 401) {
        const newToken = await refreshAccessToken();

        if (newToken) {
          response = await fetch(
            `https://localhost:44320/api/Events/get-event-detail?eventId=${eventId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch event data after token refresh`);
          }
        } else {
          enqueueSnackbar("Your session has expired, please log in again.", {
            variant: "error",
          });
          navigate("/login");
          return;
        }
      }

      if (!response.ok) {
        throw new Error("Failed to fetch event data");
      }

      const data = await response.json();
      console.log("Fetched Event Data:", data);
      data.result.groups = [];
      setEvent(data.result);
      setStatus(data.result.status);
      if (data.result.eventMedia && data.result.eventMedia.length > 0) {
        const imageUrls = data.result.eventMedia.map((media) => media.mediaUrl);
        setImages(imageUrls);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      enqueueSnackbar(
        `Lỗi khi lấy dữ liệu sự kiện: ${error.message || "Lỗi không xác định"}`,
        { variant: "error" }
      );
    }
  };
  useEffect(() => {
    console.log("abc");

    fetchEventData();
  }, [eventId, status]);
  const handleDeleteEvent = async () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    const result = await swalWithBootstrapButtons.fire({
      title: "Xác nhận xóa?",
      text: "Bạn sẽ không thể khôi phục lại dữ liệu này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Vâng, hãy xóa!",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        let token = localStorage.getItem("token");

        let response = await fetch(
          `https://localhost:44320/api/Events/delete/${eventId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          const newToken = await refreshAccessToken();

          if (newToken) {
            response = await fetch(
              `https://localhost:44320/api/Events/delete/${eventId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
          } else {
            enqueueSnackbar("Your session has expired. Please log in again.", {
              variant: "error",
            });
            navigate("/login");
            return;
          }
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Xóa sự kiện thất bại");
        }

        swalWithBootstrapButtons
          .fire({
            title: "Đã xóa!",
            text: "Sự kiện của bạn đã được xóa thành công.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
          })
          .then(() => {
            navigate("/home");
          });
      } catch (error) {
        console.error("Lỗi khi xóa sự kiện:", error);
        swalWithBootstrapButtons.fire({
          title: "Lỗi!",
          text: error.message || "Xóa sự kiện thất bại. Vui lòng thử lại!",
          icon: "error",
        });
      }
    }
  };

  const formatDateTime = (dateTime) => {
    const date = parseISO(dateTime);
    return format(date, "HH:mm eeee, dd/MM/yyyy", { locale: vi });
  };

  const getEventStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { status: "Chưa bắt đầu", color: "red" };
    } else if (now >= start && now <= end) {
      return { status: "Đang diễn ra", color: "green" };
    } else {
      return { status: "Đã kết thúc", color: "gray" };
    }
  };

  if (isLoading || !event) {
    return <Loading />;
  }
  const handleSendRequest = async (eventId) => {
    try {
      const response = await sendRequest(eventId);
      console.log("Send request response:", response);
      fetchEventData();
      Swal.fire({
        title: "Gửi yêu cầu",
        text: "Yêu cầu của bạn đã gửi thành công.",
        icon: "success",
        confirmButtonText: "OK",
        showCloseButton: false,
      });
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const eventStatus = getEventStatus(event.startTime, event.endTime);
  const fixDriveUrl = (url) => {
    if (!url.includes("drive.google.com/uc?id=")) return url;
    const fileId = url.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };
  const defaultImage = "https://via.placeholder.com/1000x500?text=No+Image";

  console.log("thanh123" + event.activities);

  return (
    <>
      <Header />
      <Breadcrumb />
      <div className="event-container">
        {event && (
          <>
            <div className="event-banner-gallery">
              {images.length === 1 || images.length === 2 ? (
                <div className="single-banner" style={{ position: "relative" }}>
                  <img
                    src={fixDriveUrl(images[0] || defaultImage)}
                    alt="Main Event"
                    className="single-banner-img"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setLightboxIndex(0);
                      setLightboxOpen(true);
                    }}
                  />
                  {images.length === 2 && (
                    <button
                      className="view-all-btn-single"
                      onClick={() => {
                        setLightboxIndex(0);
                        setLightboxOpen(true);
                      }}
                    >
                      <BiGridAlt
                        style={{ marginRight: "6px", fontSize: "17px" }}
                      />
                      <strong>Xem tất cả</strong>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div
                    className="gallery-left"
                    onClick={() => setLightboxOpen(true)}
                  >
                    {images[0] ? (
                      <img
                        src={fixDriveUrl(images[0])}
                        alt="Main Event"
                        className="main-banner-img"
                        style={{ cursor: "pointer" }}
                      />
                    ) : (
                      <img
                        src={defaultImage}
                        alt="Default"
                        className="main-banner-img"
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </div>
                  <div className="gallery-right">
                    {images.slice(1, 3).map((img, index) => (
                      <div className="thumbnail-wrapper" key={index}>
                        <img
                          src={fixDriveUrl(img)}
                          alt={`Thumbnail ${index + 1}`}
                          className="thumbnail-img"
                          onClick={() => {
                            setLightboxIndex(index + 1);
                            setLightboxOpen(true);
                          }}
                        />
                        {index === 1 && images.length > 3 && (
                          <button
                            className="view-all-btn"
                            onClick={() => {
                              setLightboxIndex(0);
                              setLightboxOpen(true);
                            }}
                          >
                            <BiGridAlt style={{ marginRight: 6 }} />
                            <strong>Xem tất cả</strong>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="event-details">
              <div className="event-title-container">
                <h1>{event.eventTitle}</h1>
                <div className="event-status" data-status={eventStatus.status}>
                  {eventStatus.status}
                </div>
              </div>

              <div className="time-section">
                <h3 className="section-title">Khung thời gian</h3>

                <div className="info-item">
                  <FaClock className="icon-time" />
                  <div>
                    <span className="event-info-span">Thời gian bắt đầu:</span>
                    {formatDateTime(event.startTime)}
                  </div>
                </div>

                <div className="info-item">
                  <FaClock className="icon-time" />
                  <div>
                    <span className="event-info-span">Thời gian kết thúc:</span>
                    {formatDateTime(event.endTime)}
                  </div>
                </div>

                <div className="info-item">
                  <FaMapMarkerAlt className="icon-location" />
                  <div>
                    <span className="event-info-span">Địa điểm:</span>
                    {event.placed}
                  </div>
                </div>
              </div>

              <div className="basic-info-section">
                <h3 className="section-title">Thông tin cơ bản</h3>

                <div className="info-item">
                  <MdOutlineCategory className="icon-category" />
                  <div>
                    <span className="event-info-span">Kiểu sự kiện:</span>
                    {event.categoryEventName}
                  </div>
                </div>

                <div className="info-item">
                  <FaMoneyBillAlt className="icon-price" />
                  <div>
                    <span className="event-info-span"> Tổng chi phí:</span>
                    {event.amountBudget.toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>

                <div className="info-item">
                  <FaUsers />
                  <div>
                    <span className="event-info-span">Người tham gia:</span>
                    {event.sizeParticipants}
                  </div>
                </div>

                {event.sloganEvent && (
                  <div className="info-item">
                    <FaQuoteLeft />
                    <div>
                      <span className="event-info-span">Slogan:</span>
                      {event.sloganEvent}
                    </div>
                  </div>
                )}

                {event.targetAudience && (
                  <div className="info-item">
                    <FaUserFriends />
                    <div>
                      <span className="event-info-span">
                        Đối tượng mục tiêu:
                      </span>
                      {event.targetAudience}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="goals-planning-section">
              <h3 className="section-title">Mục tiêu & Kế hoạch</h3>

              <div className="goals-section">
                {event.goals && (
                  <div className="info-item">
                    <FaBullseye />
                    <div>
                      <span className="event-info-span">Mục tiêu:</span>
                      {event.goals}
                    </div>
                  </div>
                )}

                {event.measuringSuccess && (
                  <div className="info-item">
                    <FaChartLine />
                    <div>
                      <span className="event-info-span">
                        Số liệu thành công:
                      </span>
                      {event.measuringSuccess}
                    </div>
                  </div>
                )}

                {event.promotionalPlan && (
                  <div className="info-item">
                    <FaBullhorn />
                    <div>
                      <span className="event-info-span">
                        Kế hoạch khuyến mại:
                      </span>
                      {event.promotionalPlan}
                    </div>
                  </div>
                )}

                {event.monitoringProcess && (
                  <div className="info-item">
                    <FaClipboardCheck />
                    <div>
                      <span className="event-info-span">
                        Quy trình giám sát:
                      </span>
                      {event.monitoringProcess}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="event-description">
              <div>Mô tả:</div>
              <div className="eventDescription">
                <span>{event.eventDescription}</span>
              </div>
            </div>

            <div className="event-activities">
              <div className="activities-title">Hoạt động:</div>
              <div className="activities-list">
                {event.activities && event.activities.length > 0 ? (
                  event.activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div
                        className="activity-header"
                        onClick={() =>
                          setOpenActivityIds((prev) =>
                            prev.includes(activity.id)
                              ? prev.filter((id) => id !== activity.id)
                              : [...prev, activity.id]
                          )
                        }
                      >
                        <strong>{activity.name}</strong>
                        <span className="toggle-icon">
                          {openActivityIds.includes(activity.id) ? (
                            <FaMinus />
                          ) : (
                            <FaPlus />
                          )}
                        </span>
                      </div>
                      {openActivityIds.includes(activity.id) && (
                        <div className="activity-content">
                          {activity.content}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <span>Chưa có hoạt động nào</span>
                )}
              </div>
            </div>
          </>
        )}

        <ListTask eventId={eventId} data={event} />
        <ListMember eventId={eventId} data={event} />
        <ListRisk eventId={eventId} data={event} />
        <ListCost eventId={eventId} data={event} />
        <ListParticipant eventId={eventId}></ListParticipant>
        <div className="event-actions">
          {event &&
            event.createdBy &&
            (event.status === 0 || event.status === -1) &&
            localStorage.getItem("userId") === String(event.createdBy.id) && (
              <>
                <button
                  className="delete-event-btn"
                  onClick={handleDeleteEvent}
                  style={{
                    opacity: event.status === 1 || event.status === 2 ? 0.5 : 1,
                    cursor:
                      event.status === 1 || event.status === 2
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Xóa sự kiện
                </button>
                <button
                  className="update-event-btn"
                  onClick={() =>
                    navigate(`/update-event/${eventId}`, {
                      state: { from: location.state?.from || "my-drafts" },
                    })
                  }
                  style={{
                    opacity: event.status === 1 || event.status === 2 ? 0.5 : 1,
                    cursor:
                      event.status === 1 || event.status === 2
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Cập nhật sự kiện
                </button>
                <button
                  className="update-event-btn"
                  onClick={() => handleSendRequest(event.id)}
                  style={{
                    opacity: event.status === 1 || event.status === 2 ? 0.5 : 1,
                    cursor:
                      event.status === 1 || event.status === 2
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Gửi yêu cầu
                </button>
              </>
            )}
          {event && role === "Campus Manager" && event.status === 1 && (
            <>
              <button
                className="btn approve"
                onClick={() => handleApprove(requests.id)}
              >
                Chấp nhận yêu cầu
              </button>
              <button
                className="btn reject"
                onClick={() => handleReject(requests.id)}
              >
                Hủy yêu cầu
              </button>
              {showPopupReject && (
                <div className="popup">
                  <div className="popup-content">
                    <h3>Từ chối yêu cầu</h3>
                    <textarea
                      placeholder="Nhập lý do từ chối..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <button
                      className="btn cancel"
                      onClick={() => setShowPopupReject(false)}
                    >
                      Hủy
                    </button>
                    <button className="btn submit" onClick={submitReject}>
                      Hủy yêu cầu
                    </button>
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
                      Duyệt yêu cầu
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          on={{
            view: ({ index }) => setLightboxIndex(index),
          }}
          slides={images.map((url) => ({ src: fixDriveUrl(url) }))}
          plugins={[Thumbnails]}
        />
      )}
    </>
  );
};

export default EventDetailEOG;
