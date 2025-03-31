import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useSnackbar } from "notistack";
import "../../styles/Events/UpdateEvent.css";
import Swal from "sweetalert2";
import Header from "../../components/Header/Header";
import { getEventEOGById,updateEvent } from "../../services/EventService";
import { getCategoryByCampusId } from "../../services/CategoryService";
import { getCampusIdByName } from "../../services/campusService";
const UpdateEventForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {id} = useParams();
  const [categories,setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(1);
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
  useEffect(()=>{
    
    const fetchCategoryData = async()=>{
      try{
        const campustName = localStorage.getItem("campus");
        const campusId = await getCampusIdByName(campustName);
        const response = await getCategoryByCampusId(campusId.id);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    }
    const fetchEventData = async ()=>{
      try {
        const response = await getEventEOGById(id);
        setEvent(response.result);
        setSelectedCategory(response.result.categoryEventId);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    }
    fetchCategoryData();
    fetchEventData();
  },[id])
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(selectedCategory)
    const eventData = {
      id: event.id,
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription,
      startTime: event.startTime,
      endTime: event.endTime,
      amountBudget: event.amountBudget,
      isPublic: event.isPublic ? 1 : 0, 
      timePublic: event.timePublic,
      status: event.status,
      managerId: event?.manager.id||"",
      campusId: 1,
      categoryEventId: selectedCategory,
      placed: event.placed,
      createdAt: event.createdAt,
      createBy: event?.createdBy.id||"",
      measuringSuccess: event?.measuringSuccess||"",
      goals: event?.goals||"",
      monitoringProcess: event?.monitoringProcess||"",
      sizeParticipants: event?.sizeParticipants||0,
      promotionalPlan: event?.promotionalPlan||"",
      targetAudience: event?.targetAudience||"",
      sloganEvent: event?.sloganEvent||"",
    };

    console.log("Updated Event:", eventData);

    try {
      const response = await updateEvent(event.id,eventData);
      if (response.status===200) {
        Swal.fire({
          title: "Event Updated Successfully",
          icon: "success",
          confirmButtonText: "OK",
          allowOutsideClick: true,
          allowEscapeKey: true,
          showCloseButton: true,
          didOpen: () => {
            Swal.getPopup().setAttribute("draggable", true);
          },
        });
      } else {
        Swal.fire({
          title: "Error",
          text: response.message || "There was an error updating the event.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Error updating event:", error);
      Swal.fire({
        title: "Error",
        text: "There was an error updating the event.",
        icon: "error",
      });
    }
};


  return (
    <>
      <Header />
      <div style={{ marginTop: "70px" }} className="update-event-container">
        <h2 style={{ paddingBottom: "30px" }} className="form-title">
          Update Event
        </h2>
        <form onSubmit={handleSubmit} className="update-event-form">
          <div className="form-floating-group">
            <input
              type="text"
              name="EventTitle"
              id="EventTitle"
              className="floating-input"
              value={event?.eventTitle}
              onChange={handleChange}
              placeholder="Event Title"
            />
            <label className="floating-label">Event Title</label>
          </div>

          <div className="form-floating-group">
            <textarea
              name="EventDescription"
              id="EventDescription"
              className="floating-input"
              value={event?.eventDescription}
              onChange={handleChange}
              placeholder="Event Description"
              rows={3}
            />
            <label className="floating-label">Event Description</label>
          </div>

          <div className="form-floating-group">
            <input
              type="datetime-local"
              name="StartTime"
              id="StartTime"
              className="floating-input"
              value={event?.startTime}
              onChange={handleChange}
              placeholder="Start Time"
            />
            <label className="floating-label">Start Time</label>
          </div>

          <div className="form-floating-group">
            <input
              type="datetime-local"
              name="EndTime"
              id="EndTime"
              className="floating-input"
              value={event?.endTime}
              onChange={handleChange}
              placeholder="End Time"
            />
            <label className="floating-label">End Time</label>
          </div>

          <div className="form-floating-group">
            <input
              type="number"
              name="AmountBudget"
              id="AmountBudget"
              className="floating-input"
              value={event?.amountBudget}
              onChange={handleChange}
              placeholder="Budget Amount"
            />
            <label className="floating-label">Budget Amount</label>
          </div>

          {/* <div className="form-floating-group">
          <input
            type="datetime-local"
            name="TimePublic"
            id="TimePublic"
            className="floating-input"
            value={event.TimePublic}
            onChange={handleChange}
            placeholder="Public Time"
          />
          <label className="floating-label">Public Time</label>
        </div> */}

          {/* <div className="form-floating-group">
          <input
            type="text"
            name="Status"
            id="Status"
            className="floating-input"
            value={event.Status}
            onChange={handleChange}
            placeholder="Status"
          />
          <label className="floating-label">Status</label>
        </div> */}

          {/* <div className="form-floating-group">
          <input
            type="number"
            name="ManagerId"
            id="ManagerId"
            className="floating-input"
            value={event.ManagerId}
            onChange={handleChange}
            placeholder="Manager ID"
          />
          <label className="floating-label">Manager ID</label>
        </div> */}

          {/* <div className="form-floating-group">
            <input
              name="Campus"
              id="Campus"
              className="floating-input"
              value={event?.Campus}
              onChange={handleChange}
              placeholder="Campus"
            />
            <label className="floating-label">Campus</label>
          </div> */}

          <div className="form-floating-group">
            {/* <input
              type="number"
              name="CategoryEventId"
              id="CategoryEventId"
              className="floating-input"
              value={event?.CategoryEventId}
              onChange={handleChange}
              placeholder="Category Event ID"
            /> */}
            
            <select
                  className="input-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryEventName}
                    </option>
                  ))}
                </select>
            <label className="floating-label">Category Event</label>
          </div>

          <div className="form-floating-group">
            <input
              type="text"
              name="Placed"
              id="Placed"
              className="floating-input"
              value={event?.placed}
              onChange={handleChange}
              placeholder="Location"
            />
            <label className="floating-label">Location</label>
          </div>

          <div className="form-group">
            <label className="field-label">Is Public</label>
            <input
              type="checkbox"
              name="IsPublic"
              id="IsPublic"
              className="form-check-input"
              checked={event?.isPublic}
              onChange={handleChange}
            />
          </div>

          <div className="form-floating-group">
            <textarea
              name="MeasuringSuccess"
              id="MeasuringSuccess"
              className="floating-input"
              value={event?.measuringSuccess}
              onChange={handleChange}
              placeholder="Measuring Success"
              rows={2}
            />
            <label className="floating-label">Measuring Success</label>
          </div>

          <div className="form-floating-group">
            <textarea
              name="Goals"
              id="Goals"
              className="floating-input"
              value={event?.goals}
              onChange={handleChange}
              placeholder="Event Goals"
              rows={2}
            />
            <label className="floating-label">Goals</label>
          </div>

          <div className="form-floating-group">
            <textarea
              name="MonitoringProcess"
              id="MonitoringProcess"
              className="floating-input"
              value={event?.monitoringProcess}
              onChange={handleChange}
              placeholder="Monitoring Process"
              rows={2}
            />
            <label className="floating-label">Monitoring Process</label>
          </div>

          <div className="form-floating-group">
            <input
              type="number"
              name="SizeParticipants"
              id="SizeParticipants"
              className="floating-input"
              value={event?.sizeParticipants}
              onChange={handleChange}
              placeholder="Number of Participants"
            />
            <label className="floating-label">Number of Participants</label>
          </div>

          <div className="form-floating-group">
            <textarea
              name="PromotionalPlan"
              id="PromotionalPlan"
              className="floating-input"
              value={event?.promotionalPlan}
              onChange={handleChange}
              placeholder="Promotional Plan"
              rows={2}
            />
            <label className="floating-label">Promotional Plan</label>
          </div>

          <div className="form-floating-group">
            <input
              type="text"
              name="TargetAudience"
              id="TargetAudience"
              className="floating-input"
              value={event?.targetAudience}
              onChange={handleChange}
              placeholder="Target Audience"
            />
            <label className="floating-label">Target Audience</label>
          </div>

          <div className="form-floating-group">
            <input
              type="text"
              name="SloganEvent"
              id="SloganEvent"
              className="floating-input"
              value={event?.sloganEvent}
              onChange={handleChange}
              placeholder="Event Slogan"
            />
            <label className="floating-label">Slogan</label>
          </div>

          <div className="text-end">
            <button type="submit" className="btn-submit">
              Update Event
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UpdateEventForm;
