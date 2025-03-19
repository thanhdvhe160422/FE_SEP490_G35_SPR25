import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getEventEOGById, updateEvent } from "../../services/EventService";
import getCategories from "../../services/CategoryService";
import Swal from "sweetalert2";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import LoadingHand from "../../components/Loading";
import { min } from "date-fns";

function UpdateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState({ result: {} });
  const [updating, setUpdating] = useState(false);
  const [categories, setCategories] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const data = await getEventEOGById(id);
      console.log("📌 Dữ liệu từ API:", data);
      if (data && !data.error) {
        setEvent({ result: data.result ?? data });
      } else if (data?.error === "expired") {
        Swal.fire("Error", "Session expired. Please login again.", "error");
        navigate("/login");
      }
      setLoading(false);
    };
    const fetchCategories = async () => {
      try {
        const categoryData = await getCategories();
        setCategories(categoryData);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh mục:", error);
      }
    };
    fetchCategories();
    fetchEvent();
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (!event.result.eventTitle?.trim()) {
      Swal.fire("Warning", "Event name cannot be empty!", "warning");
      return;
    }

    setUpdating(true);

    const updatedEvent = {
      id: event.result.id,
      eventTitle: event.result.eventTitle,
      eventDescription: event.result.eventDescription,
      startTime: event.result.startTime,
      endTime: event.result.endTime,
      amountBudget: event.result.amountBudget,
      isPublic: event.result.isPublic,
      timePublic: event.result.timePublic,
      status: event.result.status,
      campusName: event.result.campusName,
      categoryEventName: event.result.categoryEventName,
      placed: event.result.placed,
      updateBy: event.result.createdBy.id,
    };
    console.log(updatedEvent);

    const result = await updateEvent(id, updatedEvent);
    setUpdating(false);

    if (result && !result.error) {
      Swal.fire("Success", "Event updated successfully!", "success").then(() =>
        navigate(`/event-detail-EOG/${id}`)
      );
    } else if (result?.error === "expired") {
      Swal.fire("Error", "Session expired. Please login again.", "error");
      navigate("/login");
    }
  };
  if (loading) return <LoadingHand />;
  if (!event.result) return <p>Error: Event data not found.</p>;

  return (
    <>
      <Header />
      <div className="update-group-container" style={{ paddingTop: "100px" }}>
        <h2 className="update-group-title">Update Event</h2>
        <div className="form-group">
          <label className="form-label">Event Name:</label>
          <input
            type="text"
            className="form-input"
            value={event.result.eventTitle || ""}
            onChange={(e) =>
              setEvent({
                ...event,
                result: { ...event.result, eventTitle: e.target.value },
              })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">Event Description:</label>
          <textarea
            className="form-input"
            value={event.result.eventDescription || ""}
            onChange={(e) =>
              setEvent({
                ...event,
                result: { ...event.result, eventDescription: e.target.value },
              })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">Start Time:</label>
          <input
            type="datetime-local"
            className="form-input"
            value={event.result.startTime || ""}
            onChange={(e) =>
              setEvent({
                ...event,
                result: { ...event.result, startTime: e.target.value },
              })
            }
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="form-group">
          <label className="form-label">End Time:</label>
          <input
            type="datetime-local"
            className="form-input"
            value={event.result.endTime || ""}
            onChange={(e) =>
              setEvent({
                ...event,
                result: { ...event.result, endTime: e.target.value },
              })
            }
            min={event.result.startTime}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Amount Budget:</label>
          <input
            type="text"
            className="form-input"
            value={event.result.amountBudget?.toLocaleString("en-US") || ""}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/,/g, "");
              const numberValue = Number(rawValue);
              if (!isNaN(numberValue)) {
                setEvent({
                  ...event,
                  result: { ...event.result, amountBudget: numberValue },
                });
              }
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Placed:</label>
          <input
            type="text"
            className="form-input"
            value={event.result.placed || ""}
            onChange={(e) =>
              setEvent({
                ...event,
                result: { ...event.result, placed: e.target.value },
              })
            }
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category Event Name:</label>
          <select
            className="form-input"
            value={event.result.categoryEventName || ""}
            onChange={(e) =>
              setEvent({
                ...event,
                result: { ...event.result, categoryEventName: e.target.value },
              })
            }
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.categoryEventName}>
                {category.categoryEventName}
              </option>
            ))}
          </select>
        </div>
        <button
          className="update-button"
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update"}
        </button>
      </div>
      <Footer />
    </>
  );
}

export default UpdateEvent;
