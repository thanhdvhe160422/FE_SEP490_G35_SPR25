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
    setEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(selectedCategory);
    const eventData = {
      id: event.id,
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription,
      startTime: event.startTime,
      endTime: event.endTime,
      amountBudget: event.amountBudget,
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
      sizeParticipants: event?.sizeParticipants || 0,
      promotionalPlan: event?.promotionalPlan || "",
      targetAudience: event?.targetAudience || "",
      sloganEvent: event?.sloganEvent || "",
    };

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
            //setDeleteImages((deleteImages) => [...deleteImages, item])
            // setDeleteImages((deleteImages) => {
            //   const updatedDeleteImages = [...deleteImages, item];
            //   console.log(
            //     "delete image: " + JSON.stringify(updatedDeleteImages, null, 2)
            //   );
            //   return updatedDeleteImages;
            // });
            //console.log("delete image: "+JSON.stringify(deleteImages,null,2));
          }
          // Swal.fire({
          //   icon: "success",
          //   title: "Deleted successfully!",
          //   showConfirmButton: false,
          //   timer: 2000,
          // });
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
  };
  // const handleUploadImages = async (eventId, token) => {
  //   //console.log("call api " + images.length);

  //   if (newImages.length === 0) return;

  //   const formData = new FormData();
  //   newImages.forEach((file) => formData.append("EventMediaFiles", file));
  //   formData.append("eventId", eventId);
  //   try {
  //     await axios.post(
  //       "https://localhost:44320/api/Events/upload-image",
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error("Image upload failed:", error.response?.data);
  //     enqueueSnackbar("Image upload failed. You can try uploading manually.", {
  //       variant: "warning",
  //     });
  //     throw new error();
  //   }
  // };
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
              />
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
              <label className="floating-label">Ngày kết thúc</label>
            </div>

            <div className="form-floating-group">
              <input
                type="number"
                name="amountBudget"
                id="AmountBudget"
                className="floating-input"
                value={event?.amountBudget}
                onChange={handleChange}
                placeholder="Budget Amount"
              />
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
              <label className="floating-label">Thước đo thành công</label>
            </div>

            <div className="form-floating-group">
              <input
                type="number"
                name="sizeParticipants"
                id="SizeParticipants"
                className="floating-input"
                value={event?.sizeParticipants}
                onChange={handleChange}
                placeholder="Number of Participants"
              />
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
              <label className="floating-label">Kế hoạch quảng cáo</label>
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
              <label className="floating-label">Quá trình giám sát</label>
            </div>

            <div className="text-end">
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
                <button type="submit" className="btn-submit">
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
