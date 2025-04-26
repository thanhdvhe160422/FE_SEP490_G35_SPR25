import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useSnackbar } from "notistack";
import "../../styles/Events/UpdateEvent.css";
import Swal from "sweetalert2";
import Header from "../../components/Header/Header";
import {
  getEventEOGById,
  updateEvent,
  updateMedia,
} from "../../services/EventService";
import { getCategoryByCampusId } from "../../services/CategoryService";
import { getCampusIdByName } from "../../services/campusService";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";

const UpdateEventForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [images, setImages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const fileInputRef = useRef();
  const [newImages, setNewImages] = useState([]);
  const [isChangeImage, setIsChangeImage] = useState(0);
  const [isDeleteImage, setIsDeleteImage] = useState(0);
  const [isLoad, setIsLoad] = useState(false);
  const [errors, setErrors] = useState();
  const navigate = useNavigate();

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  const [event, setEvent] = useState({
    EventTitle: "Annual Tech Meetup",
    EventDescription: "An exciting gathering of tech enthusiasts...",
    StartTime: "2025-04-05T09:00",
    EndTime: "2025-04-05T17:00",
    AmountBudget: 5000,
    IsPublic: true,
    TimePublic: "2025-03-30T08:00",
    Status: "Planning",
    ManagerId: 1,
    Campus: "Hola",
    CategoryEventId: 3,
    Placed: "Main Hall, Campus A",
    CreatedAt: "2025-03-01T10:00",
    CreateBy: "admin01",
    UpdatedAt: "2025-03-31T09:00",
    UpdateBy: "admin02",
    MeasuringSuccess: "Participant feedback and engagement rate",
    Goals: "Networking, knowledge sharing",
    MonitoringProcess: "Daily check-ins with team leads",
    SizeParticipants: 170,
    PromotionalPlan: "Social media and posters",
    TargetAudience: "University students and alumni",
    SloganEvent: "Innovate. Connect. Grow.",
  });
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const campustName = localStorage.getItem("campus");
        const campusId = await getCampusIdByName(campustName);
        const response = await getCategoryByCampusId(campusId.id);
        //setImages(response.result.images || []);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };
    const fetchEventData = async () => {
      try {
        const response = await getEventEOGById(id);
        setEvent(response.result);
        setImages(response?.result?.eventMedia || []);
        setSelectedCategory(response.result.categoryEventId);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchCategoryData();
    fetchEventData();
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    var errorName;
    var error;
    if (name === "startTime") {
      errorName = "ngày bắt đầu";
      error = validateStartDate(value);
      setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: value,
      }));
      setErrors({ ...errors, [name]: error });
      error = validateEndDate(event.endTime);
      setErrors({ ...errors, endTime: error });
      return;
    }
    if (name === "endTime") {
      errorName = "ngày kết thúc";
      error = validateEndDate(value);
      setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: value,
      }));
      setErrors({ ...errors, [name]: error });
      return;
    }
    if (name === "amountBudget") {
      errorName = "ngân sách";
      const unformatted = value.replace(/\./g, "");
      if (!/^\d*$/.test(unformatted)) {
        return;
      }
      const parsedNumber = parseFormattedNumber(value);
      const formatted = formatNumber(parsedNumber);
      setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: formatted,
      }));
      error = validateNull(value, errorName);
      if (error !== "") {
        setErrors({ ...errors, [name]: error });
        return;
      }
      error = validateNumber(parsedNumber, errorName, 1_000_000_000_000);
      setErrors({ ...errors, [name]: error });
      return;
    }
    if (name === "sizeParticipants") {
      errorName = "số lượng người tham gia";
      const unformatted = value.replace(/\./g, "");

      if (!/^\d*$/.test(unformatted)) {
        return;
      }

      const parsedNumber = parseFormattedNumber(value);
      const formatted = formatNumber(parsedNumber);

      setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: formatted,
      }));

      error = validateNull(parsedNumber, errorName);
      if (error !== "") {
        setErrors({ ...errors, [name]: error });
        return;
      }

      error = validateNumber(parsedNumber, errorName, 4_294_967_295);
      setErrors({ ...errors, [name]: error });
      return;
    }
    var max;
    if (name === "eventTitle") {
      max = 50;
      errorName = "tiêu đề";
    }
    if (name === "placed") {
      max = 255;
      errorName = "vị trí";
    }
    if (name === "eventDescription") {
      max = 2000;
      errorName = "mô tả";
    }
    if (name === "sloganEvent") {
      max = 255;
      errorName = "khẩu hiệu";
    }
    if (name === "measuringSuccess") {
      max = 1000;
      errorName = "thước đo thành công";
    }
    if (name === "goals") {
      max = 1000;
      errorName = "mục tiêu";
    }
    if (name === "promotionalPlan") {
      max = 1500;
      errorName = "kế hoạch truyền thông";
    }
    if (name === "targetAudience") {
      max = 800;
      errorName = "đối tượng";
    }
    if (name === "monitoringProcess") {
      max = 1000;
      errorName = "quá trình giám sát";
    }
    error = validateMax(value, max, errorName);
    if (error !== "") {
      setEvent((prevEvent) => ({
        ...prevEvent,
        [name]: value.substring(0, max),
      }));
      setErrors({ ...errors, [name]: error });
      return;
    }
    error = validateNull(value, errorName);

    setEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountBudgetParsed = parseFormattedNumber(event.amountBudget);
    const sizeParticipantsParsed = parseFormattedNumber(event.sizeParticipants);
    const eventData = {
      id: event.id,
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription,
      startTime: event.startTime,
      endTime: event.endTime,
      amountBudget: amountBudgetParsed,
      status: event.status,
      managerId: event?.manager?.id ?? null,
      campusId: 1,
      categoryEventId: selectedCategory,
      placed: event.placed,
      createdAt: event.createdAt,
      createBy: event?.createdBy.id || "",
      measuringSuccess: event?.measuringSuccess || "",
      goals: event?.goals || "",
      monitoringProcess: event?.monitoringProcess || "",
      sizeParticipants: sizeParticipantsParsed,
      promotionalPlan: event?.promotionalPlan || "",
      targetAudience: event?.targetAudience || "",
      sloganEvent: event?.sloganEvent || "",
    };
    if (errors) {
      const hasError = Object.values(errors).some((err) => err && err !== "");
      if (hasError) {
        Swal.fire({
          title: "Thông tin không hợp lệ",
          icon: "error",
          timer: 2000,
        });
        return;
      }
    }
    try {
      setIsLoad(true);
      const response = await updateEvent(event.id, eventData);
      if (response && response.status === 200) {
        if (isDeleteImage === 1 || isChangeImage === 1) {
          try {
            const formData = new FormData();
            formData.append("EventId", event.id);
            newImages.forEach((file) =>
              formData.append("EventMediaFiles", file)
            );
            images.forEach((image) => {
              formData.append("ListMedia", image.id);
            });

            const isDeleteSuccesfully = await updateMedia(formData);
            setIsLoad(false);
            if (!isDeleteSuccesfully) throw new Error("Failed to delete media");
          } catch (error) {
            console.error(error);
            throw new error();
          }
        }

        Swal.fire({
          title: "Cập nhật thành công",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.getPopup().setAttribute("draggable", true);
          },
        }).then(() => {
          navigate(`/event-detail-EOG/${event.id}`);
        });
      } else {
        console.error("Update failed:", response);
        Swal.fire({
          title: "Error",
          text: response?.message || "Có lỗi xảy ra khi cập nhật",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error updating event:", error);
      Swal.fire({
        title: "Error",
        text: "Lỗi khi cập nhật",
        icon: "error",
      });
    }
  };

  const fixDriveUrl = (url) => {
    if (typeof url !== "string") return "";
    if (!url.includes("drive.google.com/uc?id=")) return url;
    const fileId = url.split("id=")[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  };

  // const defaultImage = "https://via.placeholder.com/1000x500?text=No+Image";

  const handleDeleteImage = (index, item) => {
    try {
      Swal.fire({
        title: "Bạn có chắc chắn muốn xóa ảnh này không?",
        text: "Ảnh sẽ bị xóa khỏi danh sách",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          const _newImages = [...images];
          _newImages.splice(index, 1);
          setImages(_newImages);
          if (item.id !== 0) {
            setIsDeleteImage(1);
          }
          if (_newImages.length === 0) {
            setErrors({ ...errors, image: "Vui lòng upload hình ảnh sự kiện" });
          } else {
            setErrors({ ...errors, image: "" });
          }
        }
      });
    } catch (error) {
      console.error("error when delete image: " + error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const _newImages = selectedFiles.map((file, index) => ({
      id: 0,
      mediaUrl: URL.createObjectURL(file),
    }));
    setImages((prevImages) => [...prevImages, ..._newImages]);
    setNewImages((prevNewImages) => [...prevNewImages, ...selectedFiles]);
    setIsChangeImage(1);
    setErrors({ ...errors, image: "" });
  };

  const validateMax = (value, max, name) => {
    if (value.length > max) {
      return `Không được vượt quá ${max} ký tự.`;
    }
    return "";
  };
  const validateNull = (value, name) => {
    if (!value) {
      return `Vui lòng nhập ${name}`;
    }
    return "";
  };
  const validateNumber = (value, name, max) => {
    if (value === null || value === undefined || isNaN(value)) {
      return `${name} không phải là số hợp lệ`;
    }

    if (value < 0) {
      return `${name} phải là số dương`;
    }

    const integerPartLength = Math.floor(value).toString().length;
    if (integerPartLength > 15) {
      return `${name} quá lớn – vui lòng nhập giá trị hợp lý`;
    }

    if (max !== undefined && value > max) {
      return `${name} không được vượt quá ${max.toLocaleString("vi-VN")}`;
    }

    return "";
  };

  const formatNumber = (value) => {
    if (!value || isNaN(value)) return "";
    return Number(value).toLocaleString("vi-VN");
  };

  const parseFormattedNumber = (formatted) => {
    formatted = String(formatted);
    if (!formatted) return 0;
    return Number(formatted.replace(/\./g, ""));
  };

  const validateStartDate = (value) => {
    const startDate = new Date(value);
    const currentDate = new Date();

    currentDate.setDate(1);

    const minStartDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + 2)
    );
    if (startDate < minStartDate)
      return `Thời gian bắt đầu phải cách thời gian hiện tại 2 tháng`;
    return "";
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMonth(now.getMonth() + 2);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const validateEndDate = () => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    if (end <= start) {
      return `Ngày kết thúc phải lớn hơn ngày bắt đầu`;
    }
    return "";
  };

  return (
    <>
      <Header />
      <Breadcrumb />
      {isLoad ? (
        <Loading></Loading>
      ) : (
        <div style={{ marginTop: "70px" }} className="update-event-container">
          <h2 style={{ paddingBottom: "30px" }} className="form-title">
            Cập nhật sự kiện
          </h2>
          <form onSubmit={handleSubmit} className="update-event-form">
            <div className="form-floating-group">
              <input
                type="text"
                name="eventTitle"
                id="EventTitle"
                className="floating-input"
                value={event?.eventTitle}
                onChange={handleChange}
                placeholder="Event Title"
              />
              {errors?.eventTitle && (
                <span className="text-danger">{errors?.eventTitle}</span>
              )}
              <label className="floating-label">Tiêu đề</label>
            </div>

            <div className="form-floating-group">
              <input
                type="text"
                name="placed"
                id="Placed"
                className="floating-input"
                value={event?.placed}
                onChange={handleChange}
                placeholder="Location"
              />
              {errors?.placed && (
                <span className="text-danger">{errors?.placed}</span>
              )}
              <label className="floating-label">Vị trí</label>
            </div>

            <div className="form-floating-group">
              <input
                type="datetime-local"
                name="startTime"
                id="StartTime"
                className="floating-input"
                value={event?.startTime}
                onChange={handleChange}
                placeholder="Start Time"
                min={getMinDateTime()}
              />
              {errors?.startTime && (
                <span className="text-danger">{errors?.startTime}</span>
              )}
              <label className="floating-label">Ngày bắt đầu</label>
            </div>

            <div className="form-floating-group">
              <input
                type="datetime-local"
                name="endTime"
                id="EndTime"
                className="floating-input"
                value={event?.endTime}
                onChange={handleChange}
                placeholder="End Time"
              />
              {errors?.endTime && (
                <span className="text-danger">{errors?.endTime}</span>
              )}
              <label className="floating-label">Ngày kết thúc</label>
            </div>

            <div className="form-floating-group">
              <input
                type="text"
                name="amountBudget"
                id="AmountBudget"
                className="floating-input"
                value={event?.amountBudget}
                onChange={handleChange}
                placeholder="Budget Amount"
              />
              {errors?.amountBudget && (
                <span className="text-danger">{errors?.amountBudget}</span>
              )}
              <label className="floating-label">Ngân sách</label>
            </div>

            <div className="form-floating-group">
              <select
                name="categoryEventId"
                id="CategoryEventId"
                className="floating-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryEventName}
                  </option>
                ))}
              </select>
              <label className="floating-label">Loại</label>
            </div>

            <div className="form-floating-group">
              <textarea
                name="eventDescription"
                id="EventDescription"
                className="floating-input"
                value={event?.eventDescription}
                onChange={handleChange}
                placeholder="Event Description"
                rows={3}
              />
              {errors?.eventDescription && (
                <span className="text-danger">{errors?.eventDescription}</span>
              )}
              <label className="floating-label">Mô tả</label>
            </div>

            <div className="form-floating-group">
              <textarea
                name="measuringSuccess"
                id="MeasuringSuccess"
                className="floating-input"
                value={event?.measuringSuccess}
                onChange={handleChange}
                placeholder="Measuring Success"
                rows={2}
              />
              {errors?.measuringSuccess && (
                <span className="text-danger">{errors?.measuringSuccess}</span>
              )}
              <label className="floating-label">Thước đo thành công</label>
            </div>

            <div className="form-floating-group">
              <input
                type="text"
                name="sizeParticipants"
                id="SizeParticipants"
                className="floating-input"
                value={event?.sizeParticipants}
                onChange={handleChange}
                placeholder="Number of Participants"
              />
              {errors?.sizeParticipants && (
                <span className="text-danger">{errors?.sizeParticipants}</span>
              )}
              <label className="floating-label">Số lượng người tham gia</label>
            </div>

            <div className="form-floating-group">
              <input
                type="text"
                name="sloganEvent"
                id="SloganEvent"
                className="floating-input"
                value={event?.sloganEvent}
                onChange={handleChange}
                placeholder="Event Slogan"
              />
              {errors?.sloganEvent && (
                <span className="text-danger">{errors?.sloganEvent}</span>
              )}
              <label className="floating-label">Khẩu hiệu</label>
            </div>
            <div className="form-floating-group">
              <textarea
                name="goals"
                id="Goals"
                className="floating-input"
                value={event?.goals}
                onChange={handleChange}
                placeholder="Event Goals"
                rows={2}
              />
              {errors?.goals && (
                <span className="text-danger">{errors?.goals}</span>
              )}
              <label className="floating-label">Mục tiêu</label>
            </div>

            <div className="form-floating-group">
              <textarea
                name="promotionalPlan"
                id="PromotionalPlan"
                className="floating-input"
                value={event?.promotionalPlan}
                onChange={handleChange}
                placeholder="Promotional Plan"
                rows={2}
              />
              {errors?.promotionalPlan && (
                <span className="text-danger">{errors?.promotionalPlan}</span>
              )}
              <label className="floating-label">Kế hoạch truyền thông</label>
            </div>

            <div className="form-floating-group">
              <input
                type="text"
                name="targetAudience"
                id="TargetAudience"
                className="floating-input"
                value={event?.targetAudience}
                onChange={handleChange}
                placeholder="Target Audience"
              />
              {errors?.targetAudience && (
                <span className="text-danger">{errors?.targetAudience}</span>
              )}
              <label className="floating-label">Đối tượng</label>
            </div>

            <div className="form-floating-group">
              <textarea
                name="monitoringProcess"
                id="MonitoringProcess"
                className="floating-input"
                value={event?.monitoringProcess}
                onChange={handleChange}
                placeholder="Monitoring Process"
                rows={2}
              />
              {errors?.monitoringProcess && (
                <span className="text-danger">{errors?.monitoringProcess}</span>
              )}
              <label className="floating-label">Quá trình giám sát</label>
            </div>

            <div className="text-end">
              {errors?.image && (
                <span className="text-danger">{errors?.image}</span>
              )}
              <div className="custom-image-grid">
                <div
                  className="grid-image add-image-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span className="plus-icon">➕</span>
                </div>

                {images.map((item, index) => (
                  <div
                    key={index}
                    className={`grid-image grid-image-${index + 1}`}
                  >
                    <img
                      src={fixDriveUrl(item.mediaUrl)}
                      alt={`Event ${index + 1}`}
                      className="event-image"
                      referrerPolicy="no-referrer"
                      onClick={() => openLightbox(index)}
                    />
                    <button
                      type="button"
                      className="delete-image-btn"
                      onClick={() => handleDeleteImage(index, item)}
                    >
                      ❌
                    </button>
                  </div>
                ))}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>

              {isOpen && (
                <Lightbox
                  open={isOpen}
                  close={() => setIsOpen(false)}
                  slides={images.map((img) => ({
                    src: fixDriveUrl(img.mediaUrl),
                  }))}
                  index={photoIndex}
                  on={{
                    view: ({ index }) => setPhotoIndex(index),
                  }}
                />
              )}

              <div style={{ marginTop: "30px" }}>
                {" "}
                <button
                  type="submit"
                  className="btn-submit"
                  onClick={handleSubmit}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default UpdateEventForm;
