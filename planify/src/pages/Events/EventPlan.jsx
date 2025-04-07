import React, { useEffect, useRef, useState, useCallback } from "react";
import "../../styles/Events/EventPlan.css";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaPlus,
} from "react-icons/fa";
import { Form, Button, FormLabel, Row, Col } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";
import Swal from "sweetalert2";
import Header from "../../components/Header/Header";

// Custom hook để lấy campusId và danh sách categories
const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const getCampusIdFromToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.campusId;
    } catch (err) {
      console.error("Lỗi giải mã token:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const campusId = getCampusIdFromToken();
      if (!campusId) {
        setError("Unable to get campusId from token. Please login again..");
        return;
      }
      try {
        const response = await axios.get(
          `https://localhost:44320/api/Categories/${campusId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Error while getting directory."
        );
      }
    };
    fetchCategories();
  }, [getCampusIdFromToken]);

  return { categories, error };
};

export default function EventPlan() {
  const [index, setIndex] = useState(0);
  const screens = useRef([]);
  const dots = useRef([]);
  const modalRef = useRef(null);
  const shadeRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventTitle: "",
    categoryEventId: 0,
    startTime: "",
    endTime: "",
    placed: "",
    sloganEvent: "",
    goals: "",
    targetAudience: "",
    sizeParticipants: 0,
    description: "",
    measuringSuccess: "",
    monitoringProcess: "",
    promotionalPlan: { before: "", during: "", after: "" },
    tasks: [
      {
        taskName: "",
        deadline: "",
        budget: 0,
        description: "",
        expanded: false,
        subtasks: [],
      },
    ],
    budgetRows: [{ name: "", quantity: 0, price: 0, total: 0 }],
    risks: [{ name: "", reason: "", description: "", solution: "" }],
    activities: [{ name: "", content: "" }],
  });

  const [minDateTime, setMinDateTime] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { categories, error } = useCategories();
  const [selectedImages, setSelectedImages] = useState([]);
  const selectedImagesRef = useRef([]);
  useEffect(() => {
    const now = new Date();
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  // Xử lý form
  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePromotionalPlanChange = useCallback((subField, value) => {
    setFormData((prev) => ({
      ...prev,
      promotionalPlan: { ...prev.promotionalPlan, [subField]: value },
    }));
  }, []);

  // Xử lý task
  const toggleExpand = useCallback((index) => {
    setFormData((prev) => {
      const updated = [...prev.tasks];
      updated[index].expanded = !updated[index].expanded;
      return { ...prev, tasks: updated };
    });
  }, []);

  const handleTaskChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.tasks];
      updated[index][field] = field === "budget" ? Number(value) : value;
      return { ...prev, tasks: updated };
    });
  }, []);

  const handleActivityChange = (index, field, value) => {
    const updated = [...formData.activities];
    updated[index][field] = value;
    setFormData({ ...formData, activities: updated });
  };

  const handleAddActivity = () => {
    setFormData({
      ...formData,
      activities: [...formData.activities, { name: "", content: "" }],
    });
  };

  const handleRemoveActivity = (index) => {
    const updated = formData.activities.filter((_, i) => i !== index);
    setFormData({ ...formData, activities: updated });
  };

  const handleAddTask = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          taskName: "",
          deadline: "",
          budget: 0,
          description: "",
          expanded: false,
          subtasks: [],
        },
      ],
    }));
  }, []);

  const handleAddSubtask = useCallback((taskIndex) => {
    setFormData((prev) => {
      const updated = [...prev.tasks];
      updated[taskIndex].subtasks.push({
        subtaskName: "",
        deadline: "",
        amount: 0,
        description: "",
      });
      return { ...prev, tasks: updated };
    });
  }, []);

  const handleSubtaskChange = useCallback(
    (taskIndex, subIndex, field, value) => {
      setFormData((prev) => {
        const updated = [...prev.tasks];
        updated[taskIndex].subtasks[subIndex][field] =
          field === "amount" ? Number(value) : value;
        return { ...prev, tasks: updated };
      });
    },
    []
  );

  const handleRemoveTask = useCallback((index) => {
    setFormData((prev) => {
      const updated = [...prev.tasks];
      updated.splice(index, 1);
      return { ...prev, tasks: updated };
    });
  }, []);

  const handleRemoveSubtask = useCallback((taskIndex, subIndex) => {
    setFormData((prev) => {
      const updated = [...prev.tasks];
      updated[taskIndex].subtasks.splice(subIndex, 1);
      return { ...prev, tasks: updated };
    });
  }, []);

  // Xử lý budget
  const handleBudgetChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.budgetRows];
      const row = { ...updated[index] };

      if (field === "name") {
        row.name = value;
      } else if (field === "price") {
        const price = Number(value);
        row.price = price;

        // Nếu quantity đang là 0 thì tự set = 1
        if (row.quantity === 0) {
          row.quantity = 1;
        }
      } else if (field === "quantity") {
        row.quantity = Number(value);
      }

      row.total = row.quantity * row.price;
      updated[index] = row;

      return { ...prev, budgetRows: updated };
    });
  }, []);

  const updateQuantity = useCallback((index, delta) => {
    setFormData((prev) => {
      const updated = [...prev.budgetRows];
      updated[index].quantity = Math.max(0, updated[index].quantity + delta);
      updated[index].total = updated[index].quantity * updated[index].price;
      return { ...prev, budgetRows: updated };
    });
  }, []);

  // Xử lý size participants
  const handleSelectChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSelectedOption(value);
      if (value !== "other") {
        setCustomValue("");
        handleFormChange("sizeParticipants", Number(value));
      } else {
        handleFormChange("sizeParticipants", 0);
      }
    },
    [handleFormChange]
  );

  const handleCustomValueChange = useCallback(
    (e) => {
      const value = e.target.value;
      setCustomValue(value);
      handleFormChange("sizeParticipants", Number(value));
    },
    [handleFormChange]
  );

  // Xử lý risks
  const handleRiskChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.risks];
      updated[index][field] = value;
      return { ...prev, risks: updated };
    });
  }, []);

  const handleAddRisk = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      risks: [
        ...prev.risks,
        { name: "", reason: "", description: "", solution: "" },
      ],
    }));
  }, []);

  const handleRemoveRisk = useCallback((index) => {
    setFormData((prev) => {
      const updated = [...prev.risks];
      updated.splice(index, 1);
      return { ...prev, risks: updated };
    });
  }, []);

  // Navigation
  const indexMax = () => screens.current.length - 1;

  const goTo = useCallback((i) => {
    screens.current.forEach((el) => el.classList.remove("active"));
    dots.current.forEach((el) => el.classList.remove("active"));
    screens.current[i]?.classList.add("active");
    dots.current[i]?.classList.add("active");
  }, []);

  const updateScreen = useCallback((i) => goTo(i), [goTo]);

  const closeModal = useCallback(() => {
    modalRef.current?.classList.remove("reveal");
    shadeRef.current?.classList.remove("reveal");
    setTimeout(() => {
      modalRef.current?.classList.remove("show");
      shadeRef.current?.classList.remove("show");
      setIndex(0);
      updateScreen(0);
    }, 200);
  }, [updateScreen]);

  const openModal = useCallback(() => {
    modalRef.current?.classList.add("show");
    shadeRef.current?.classList.add("show");
    setTimeout(() => {
      modalRef.current?.classList.add("reveal");
      shadeRef.current?.classList.add("reveal");
    }, 200);
    updateScreen(index);
  }, [index, updateScreen]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft" && index > 0)
        setIndex((i) => Math.max(0, i - 1));
      else if (e.key === "ArrowRight" && index < indexMax())
        setIndex((i) => Math.min(i + 1, indexMax()));
      else if (e.key === "ArrowUp") openModal();
      else if (e.key === "ArrowDown") closeModal();
    },
    [index, openModal, closeModal]
  );

  useEffect(() => {
    screens.current = Array.from(document.querySelectorAll(".screen"));
    dots.current = Array.from(document.querySelectorAll(".dot"));
    openModal();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openModal, handleKeyDown]);

  useEffect(() => {
    if (screens.current.length > 0 && dots.current.length > 0)
      updateScreen(index);
  }, [index, updateScreen]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Chuẩn bị dữ liệu gửi lên server
  const prepareEventData = useCallback(() => {
    const currentTime = new Date().toISOString();
    const promotionalPlanString = [
      formData.promotionalPlan.before,
      formData.promotionalPlan.during,
      formData.promotionalPlan.after,
    ]
        .filter(Boolean)
        .join(" - ");

    return {
      EventTitle: formData.eventTitle,
      EventDescription: formData.description,
      StartTime: formData.startTime
          ? new Date(formData.startTime).toISOString()
          : null,
      EndTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      CategoryEventId: formData.categoryEventId,
      Placed: formData.placed,
      MeasuringSuccess: formData.measuringSuccess,
      Goals: formData.goals,
      MonitoringProcess: formData.monitoringProcess,
      SizeParticipants: formData.sizeParticipants,
      PromotionalPlan: promotionalPlanString,
      TargetAudience: formData.targetAudience,
      SloganEvent: formData.sloganEvent,
      Tasks: formData.tasks
          .filter((task) => task.taskName.trim())
          .map((task) => ({
            TaskName: task.taskName,
            Description: task.description,
            StartTime: currentTime,
            Deadline: task.deadline ? new Date(task.deadline).toISOString() : null,
            Budget: task.budget,
            SubTasks: task.subtasks
                .filter((sub) => sub.subtaskName.trim())
                .map((subtask) => ({
                  SubTaskName: subtask.subtaskName,
                  Description: subtask.description,
                  StartTime: currentTime,
                  Deadline: subtask.deadline
                      ? new Date(subtask.deadline).toISOString()
                      : null,
                  Budget: subtask.amount,
                })),
          })),
      Risks: formData.risks
          .filter(
              (risk) =>
                  risk.name.trim() &&
                  (risk.reason.trim() || risk.description.trim() || risk.solution.trim())
          )
          .map((risk) => ({
            Name: risk.name,
            Reason: risk.reason,
            Solution: risk.solution,
            Description: risk.description,
          })),
      CostBreakdowns: formData.budgetRows
          .filter((row) => row.name.trim() && row.quantity > 0 && row.price > 0)
          .map((row) => ({
            Name: row.name,
            Quantity: row.quantity,
            PriceByOne: row.price,
          })),
      Activities: formData.activities
          .filter((activity) => activity.name.trim())
          .map((activity) => ({
            Name: activity.name,
            Content: activity.content,
          })),
    };
  }, [formData]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = [...selectedImagesRef.current, ...files];

    setSelectedImages(newImages);
    selectedImagesRef.current = newImages;

    console.log("call api thanh " + newImages.length);
    event.target.value = null;
  };

  const handleUploadImages = async (eventId, token) => {
    const images = selectedImagesRef.current;
    console.log("call api " + images.length);

    if (images.length === 0) return;

    const formData = new FormData();
    images.forEach((file) => formData.append("EventMediaFiles", file));
    formData.append("eventId", eventId);
    try {
      await axios.post(
        "https://localhost:44320/api/Events/upload-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      console.error("Image upload failed:", error.response?.data);
      enqueueSnackbar("Image upload failed. You can try uploading manually.", {
        variant: "warning",
      });
    }
  };

  // Validation chung
  const validateForm = useCallback(() => {
    if (!formData.eventTitle) return "Event title is required!";
    if (!formData.startTime || !formData.endTime)
      return "Start time and end time are required!";
    if (new Date(formData.startTime) >= new Date(formData.endTime))
      return "Start time must be earlier than end time!";
    if (!formData.categoryEventId) return "Event category is required!";
    if (!formData.placed) return "Event location is required!";
    if (!formData.tasks.some((task) => task.taskName.trim()))
      return "At least one task is required!";
    if (!formData.activities.some((activity) => activity.name.trim()))
      return "At least one activity with a name is required!";
    return null;
  }, [formData]);

  // Gửi yêu cầu tạo sự kiện
  const handleSubmit = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      enqueueSnackbar(validationError, { variant: "error" });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This event will be sent to the Campus Manager for approval.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, create it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      const eventData = prepareEventData();
      console.log("Payload gửi lên API:", eventData); // Kiểm tra payload
      const response = await axios.post(
          "https://localhost:44320/api/Events/create",
          eventData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
      );

      const eventId = response.data.result?.id || 0;
      await handleUploadImages(eventId, localStorage.getItem("token"));

      if (response.status === 201) {
        await axios.post(
            "https://localhost:44320/api/SendRequest",
            { eventId },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
        );

        await Swal.fire({
          title: "Created!",
          text: "Your event has been successfully submitted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        closeModal();
        navigate("/home");
      } else {
        enqueueSnackbar(
            `Failed to create event with status code: ${response.status}`,
            { variant: "error" }
        );
      }
    } catch (error) {
      enqueueSnackbar(
          error.response?.data?.message || "Error while creating event!",
          { variant: "error" }
      );
      console.error("Lỗi chi tiết:", error);
    } finally {
      setIsLoading(false);
    }
  }, [prepareEventData, closeModal, validateForm, navigate, enqueueSnackbar]);

  // Gửi yêu cầu lưu bản nháp
  const handleSaveDraft = useCallback(() => {
    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const validationError = validateForm();
        if (validationError) {
          enqueueSnackbar(validationError, { variant: "error" });
          return;
        }

        setIsLoading(true);
        try {
          const eventData = prepareEventData();
          const response = await axios.post(
            "https://localhost:44320/api/Events/create",
            eventData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          await handleUploadImages(
            response.data.result?.id,
            localStorage.getItem("token")
          );

          Swal.fire({
            title: "Saved!",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
              closeModal();
              navigate("/home");
            },
          });
        } catch (error) {
          enqueueSnackbar(
            error.response?.data?.message || "Error while saving draft!",
            { variant: "error" }
          );
          console.error("Lỗi chi tiết:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (result.isDenied) {
        Swal.fire({
          title: "Changes are not saved",
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }, [prepareEventData, closeModal, validateForm, navigate, enqueueSnackbar]);

  const totalBudget = formData.budgetRows.reduce(
    (sum, row) => sum + row.total,
    0
  );

  return (
    <>
      <Header />
      <div className="working-container">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="walkthrough show reveal" ref={modalRef}>
          <div className="walkthrough-body">
            <ul style={{ marginTop: "30px" }} className="screens animate">
              <li className="screen active">
                <h3 className="text-primary">General Information</h3>
                <Form className="w-75 mx-auto text-start shadow p-4 rounded bg-light">
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Event name<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter an event name"
                      value={formData.eventTitle}
                      onChange={(e) =>
                        handleFormChange("eventTitle", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>
                      Event type <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      as="select"
                      value={formData.categoryEventId}
                      onChange={(e) =>
                        handleFormChange(
                          "categoryEventId",
                          Number(e.target.value)
                        )
                      }
                    >
                      <option value={0} disabled>
                        Select type
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.categoryEventName}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Start Time <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      min={minDateTime}
                      value={formData.startTime}
                      onChange={(e) =>
                        handleFormChange("startTime", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      End Time <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      min={formData.startTime || minDateTime}
                      value={formData.endTime}
                      onChange={(e) =>
                        handleFormChange("endTime", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      Place <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Place"
                      value={formData.placed}
                      onChange={(e) =>
                        handleFormChange("placed", e.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Slogan</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Enter Slogan"
                      value={formData.sloganEvent}
                      onChange={(e) =>
                        handleFormChange("sloganEvent", e.target.value)
                      }
                      style={{ resize: "vertical", minHeight: "80px" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter Description"
                      value={formData.description}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      style={{ resize: "vertical", minHeight: "100px" }}
                    />
                  </Form.Group>
                </Form>
              </li>

              <li className="screen">
                <h3 className="text-primary">Goals</h3>
                <Form className="w-75 mx-auto text-start shadow p-4 rounded bg-light">
                  <Form.Group className="mb-3">
                    <Form.Label>Goals</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter goals"
                      value={formData.goals}
                      onChange={(e) =>
                        handleFormChange("goals", e.target.value)
                      }
                      style={{ resize: "vertical", minHeight: "100px" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Target Audience</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter target audience"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        handleFormChange("targetAudience", e.target.value)
                      }
                      style={{ resize: "vertical", minHeight: "100px" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Number of participants</Form.Label>
                    <Form.Select
                      value={selectedOption}
                      onChange={handleSelectChange}
                    >
                      <option value="">Select number</option>
                      <option value="500">500 người</option>
                      <option value="1000">1000 người</option>
                      <option value="2000">2000 người</option>
                      <option value="other">Others</option>
                    </Form.Select>
                    {selectedOption === "other" && (
                      <Form.Control
                        className="mt-2"
                        type="number"
                        placeholder="Nhập số lượng"
                        value={customValue}
                        onChange={handleCustomValueChange}
                      />
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Measuring success</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      style={{ resize: "vertical", minHeight: "150px" }}
                      placeholder="Enter measuring success"
                      value={formData.measuringSuccess}
                      onChange={(e) =>
                        handleFormChange("measuringSuccess", e.target.value)
                      }
                    />
                  </Form.Group>
                </Form>
              </li>

              <li className="screen">
                <h3 className="text-primary">Task & Sub-task</h3>
                <Button variant="outline-primary mb-3" onClick={handleAddTask}>
                  + Create Task
                </Button>
                <div className="w-100 mt-3">
                  {formData.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="mb-4 p-4 border rounded bg-light shadow"
                    >
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => toggleExpand(i)}
                          >
                            {task.expanded ? (
                              <FaChevronDown />
                            ) : (
                              <FaChevronRight />
                            )}
                          </Button>
                          <Form.Control
                            type="text"
                            value={task.taskName}
                            onChange={(e) =>
                              handleTaskChange(i, "taskName", e.target.value)
                            }
                            placeholder="Task name"
                            className="fw-bold"
                          />
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveTask(i)}
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="row">
                        <Form.Group className="col-md-4 mb-3">
                          <Form.Label>
                            Deadline <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={task.deadline}
                            min={minDateTime}
                            onChange={(e) =>
                              handleTaskChange(i, "deadline", e.target.value)
                            }
                          />
                        </Form.Group>
                        <Form.Group className="col-md-4 mb-3">
                          <Form.Label>Budget</Form.Label>
                          <Form.Control
                            type="text"
                            value={task.budget.toLocaleString("vi-VN")}
                            onChange={(e) =>
                              handleTaskChange(
                                i,
                                "budget",
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                          />
                        </Form.Group>
                        <Form.Group className="col-md-4 mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={task.description}
                            onChange={(e) =>
                              handleTaskChange(i, "description", e.target.value)
                            }
                            style={{ resize: "vertical", minHeight: "80px" }}
                          />
                        </Form.Group>
                      </div>

                      {task.expanded && (
                        <div className="mt-3 border-top pt-3">
                          <h6 className="text-danger">Subtasks</h6>
                          {task.subtasks.map((sub, j) => (
                            <div key={j} className="row mb-3 align-items-start">
                              <Form.Group className="col-md-3">
                                <Form.Label>Subtask name</Form.Label>
                                <Form.Control
                                  value={sub.subtaskName}
                                  onChange={(e) =>
                                    handleSubtaskChange(
                                      i,
                                      j,
                                      "subtaskName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Tên Subtask"
                                />
                              </Form.Group>
                              <Form.Group className="col-md-3">
                                <Form.Label>Deadline</Form.Label>
                                <Form.Control
                                  type="datetime-local"
                                  value={sub.deadline}
                                  min={minDateTime}
                                  onChange={(e) =>
                                    handleSubtaskChange(
                                      i,
                                      j,
                                      "deadline",
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>
                              <Form.Group className="col-md-2">
                                <Form.Label>Budget</Form.Label>
                                <Form.Control
                                  value={sub.amount.toLocaleString("vi-VN")}
                                  onChange={(e) =>
                                    handleSubtaskChange(
                                      i,
                                      j,
                                      "amount",
                                      e.target.value.replace(/\D/g, "")
                                    )
                                  }
                                />
                              </Form.Group>
                              <Form.Group className="col-md-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  value={sub.description}
                                  onChange={(e) =>
                                    handleSubtaskChange(
                                      i,
                                      j,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    resize: "vertical",
                                    minHeight: "80px",
                                  }}
                                />
                              </Form.Group>
                              <div className="col-md-1 text-end">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRemoveSubtask(i, j)}
                                >
                                  ✕
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleAddSubtask(i)}
                          >
                            + Create Sub-task
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </li>

              <li className="screen">
                <h3 className="text-primary">Estimated costs</h3>
                <div className="w-100 mx-auto text-start shadow p-4 rounded bg-light">
                  <table className="table table-bordered table-hover">
                    <thead className="table-primary">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Unit Price (VNĐ)</th>
                        <th>Quantity</th>
                        <th>Total (VNĐ)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.budgetRows.map((row, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <Form.Control
                              value={row.name}
                              onChange={(e) =>
                                handleBudgetChange(i, "name", e.target.value)
                              }
                              placeholder="Enter name"
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={row.price.toLocaleString("vi-VN")}
                              onChange={(e) =>
                                handleBudgetChange(
                                  i,
                                  "price",
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                            />
                          </td>
                          <td className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => updateQuantity(i, -1)}
                            >
                              -
                            </Button>
                            <Form.Control
                              type="number"
                              value={row.quantity}
                              onChange={(e) =>
                                handleBudgetChange(
                                  i,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              style={{ width: "100px", textAlign: "center" }}
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => updateQuantity(i, 1)}
                            >
                              +
                            </Button>
                          </td>
                          <td>{row.total.toLocaleString("vi-VN")}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                const updated = [...formData.budgetRows];
                                updated.splice(i, 1);
                                setFormData((prev) => ({
                                  ...prev,
                                  budgetRows: updated,
                                }));
                              }}
                            >
                              ✕
                            </Button>
                          </td>
                        </tr>
                      ))}

                      <tr>
                        <td colSpan="4" className="text-end fw-bold">
                          Total:
                        </td>
                        <td className="fw-bold text-primary">
                          {totalBudget.toLocaleString("vi-VN")} VNĐ
                        </td>
                        <td></td>
                      </tr>

                      <tr>
                        <td colSpan="6" className="text-center">
                          <Button
                            variant="outline-primary"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                budgetRows: [
                                  ...prev.budgetRows,
                                  { name: "", quantity: 0, price: 0, total: 0 },
                                ],
                              }))
                            }
                          >
                            + Create Extra Cost
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>

              {/* Màn hình 5: Kế Hoạch */}
              <li className="screen">
                <h3 className="text-primary">Plans</h3>
                <Form className="w-75 mx-auto text-start shadow p-4 rounded bg-light">
                  <Form.Group className="mb-3">
                    <Form.Label>Monitoring Process</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.monitoringProcess}
                      onChange={(e) =>
                        handleFormChange("monitoringProcess", e.target.value)
                      }
                      style={{ resize: "vertical", minHeight: "100px" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Plan before the event</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.promotionalPlan.before}
                      onChange={(e) =>
                        handlePromotionalPlanChange("before", e.target.value)
                      }
                      style={{ resize: "vertical", minHeight: "100px" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Plan in the even</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.promotionalPlan.during}
                      onChange={(e) =>
                        handlePromotionalPlanChange("during", e.target.value)
                      }
                      style={{ resize: "vertical", minHeight: "100px" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Plan after the event</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.promotionalPlan.after}
                      onChange={(e) =>
                        handlePromotionalPlanChange("after", e.target.value)
                      }
                      style={{ resize: "vertical", minHeight: "100px" }}
                    />
                  </Form.Group>
                </Form>
              </li>

              <li className="screen">
                <h3 className="text-primary">Event Activities</h3>
                <div className="w-100 mx-auto text-start shadow p-4 rounded bg-light">
                  <table className="table table-bordered table-hover">
                    <thead className="table-primary">
                      <tr>
                        <th>STT</th>
                        <th>Name</th>
                        <th>Content</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.activities.map((activity, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              style={{ resize: "vertical", minHeight: "100px" }}
                              value={activity.name}
                              onChange={(e) =>
                                handleActivityChange(i, "name", e.target.value)
                              }
                              // placeholder="Tên hoạt động"
                            />
                          </td>
                          <td>
                            <Form.Control
                              as="textarea"
                              rows={5}
                              style={{ resize: "vertical", minHeight: "100px" }}
                              value={activity.content}
                              onChange={(e) =>
                                handleActivityChange(
                                  i,
                                  "content",
                                  e.target.value
                                )
                              }
                              // placeholder="Hoạt động"
                            />
                          </td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveActivity(i)}
                            >
                              ✕
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="4" className="text-center">
                          <Button
                            variant="outline-primary"
                            onClick={handleAddActivity}
                          >
                            + Create Activity
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>

              {/* Màn hình 6: Rủi Ro */}
              <li className="screen">
                <h3 className="text-primary">Risks</h3>
                <div className="w-100 mx-auto text-start shadow p-4 rounded bg-light">
                  <table className="table table-bordered table-hover">
                    <thead className="table-primary">
                      <tr>
                        <th>No.</th>
                        <th>Risk Name</th>
                        <th>Reason</th>
                        <th>Description</th>
                        <th>Solution</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.risks.map((risk, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <Form.Control
                              value={risk.name}
                              onChange={(e) =>
                                handleRiskChange(i, "name", e.target.value)
                              }
                              // placeholder="Tên rủi ro"
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={risk.reason}
                              onChange={(e) =>
                                handleRiskChange(i, "reason", e.target.value)
                              }
                              // placeholder="Lý do"
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={risk.description}
                              onChange={(e) =>
                                handleRiskChange(
                                  i,
                                  "description",
                                  e.target.value
                                )
                              }
                              // placeholder="Mô tả"
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={risk.solution}
                              onChange={(e) =>
                                handleRiskChange(i, "solution", e.target.value)
                              }
                              // placeholder="Giải pháp"
                            />
                          </td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveRisk(i)}
                            >
                              ✕
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="6" className="text-center">
                          <Button
                            variant="outline-primary"
                            onClick={handleAddRisk}
                          >
                            + Create Risk
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>

              <li className="screen">
                <h3 className="text-primary">Image</h3>
                <div className="w-100 mx-auto text-start shadow p-4 rounded bg-light">
                  <Form.Group className="mt-3">
                    <Row>
                      <Col xs={3} className="mb-3">
                        <label
                          className="w-100 h-100 d-flex align-items-center justify-content-center border rounded"
                          style={{
                            cursor: "pointer",
                            aspectRatio: "16/9",
                            minHeight: "120px",
                          }}
                        >
                          <FaPlus />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                        </label>
                      </Col>

                      {selectedImages.map((file, index) => (
                        <Col
                          xs={3}
                          key={index}
                          className="position-relative mb-3"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt="uploaded"
                            className="img-fluid rounded w-100 h-100 object-fit-cover"
                            style={{
                              aspectRatio: "16/9",
                              minHeight: "120px",
                              objectFit: "cover",
                            }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 p-1"
                            onClick={() =>
                              setSelectedImages(
                                selectedImages.filter((_, i) => i !== index)
                              )
                            }
                          >
                            ✕
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </Form.Group>
                </div>
              </li>
            </ul>

            <Button
              variant="outline-primary"
              className="prev-screen"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              style={{ visibility: index === 0 ? "hidden" : "visible" }}
            >
              <FaChevronLeft />
            </Button>

            <Button
              variant="outline-primary"
              className="next-screen"
              onClick={() => setIndex((i) => Math.min(i + 1, indexMax()))}
              style={{
                visibility: index === indexMax() ? "hidden" : "visible",
              }}
            >
              <FaChevronRight />
            </Button>
          </div>

          <div className="walkthrough-pagination">
            {Array(8)
              .fill()
              .map((_, i) => (
                <Button
                  key={i}
                  variant={i === index ? "primary" : "outline-secondary"}
                  className="dot"
                  onClick={() => setIndex(i)}
                />
              ))}
          </div>

          <Button
            style={{ marginTop: "30px" }}
            variant="outline-success"
            className="button fixed-next save-draft"
            onClick={handleSaveDraft}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Draft"}
          </Button>

          <Button
            variant={index === indexMax() ? "success" : "primary"}
            className="button fixed-next"
            onClick={() =>
              index === indexMax() ? handleSubmit() : setIndex((i) => i + 1)
            }
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : index === indexMax()
              ? "Create Event"
              : "Next"}
          </Button>
        </div>
        <div className="shade" ref={shadeRef} onClick={closeModal}></div>
      </div>
    </>
  );
}
