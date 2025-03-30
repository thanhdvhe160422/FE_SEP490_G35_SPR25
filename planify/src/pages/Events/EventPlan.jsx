import React, { useEffect, useRef, useState, useCallback } from "react";
import "../../styles/Events/EventPlan.css";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Form, Button, FormLabel } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Custom hook để lấy campusId và danh sách categories

// -----------------------------------------------?
const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const getCampusIdFromToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.campusId; // Điều chỉnh key nếu cần
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const campusId = getCampusIdFromToken();
      if (!campusId) {
        setError("Cannot retrieve campusId from token. Please log in again.");
        return;
      }

      try {
        const response = await axios.get(
          `https://localhost:44320/api/Categories/${campusId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch categories. Unable to connect to the server."
        );
      }
    };

    fetchCategories();
  }, [getCampusIdFromToken]);

  return { categories, error };
};

export default function EventPlan() {
  // State cho navigation
  const [index, setIndex] = useState(0);
  const screens = useRef([]);
  const dots = useRef([]);
  const modalRef = useRef(null);
  const shadeRef = useRef(null);

  // State cho form
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
    promotionalPlan: {
      before: "",
      during: "",
      after: "",
    },
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
    budgetRows: Array.from({ length: 5 }, () => ({
      name: "",
      quantity: 0,
      price: 0,
      total: 0,
    })),
    risks: [{ reason: "", description: "", solution: "" }],
  });

  // State phụ trợ
  const [minDateTime, setMinDateTime] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sử dụng custom hook để lấy categories
  const { categories, error } = useCategories();

  // Thiết lập thời gian tối thiểu cho datetime input
  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    setMinDateTime(localTime.toISOString().slice(0, 16));
  }, []);

  // Xử lý thay đổi dữ liệu form
  const handleFormChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Xử lý thay đổi kế hoạch truyền thông
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
      updated[index][field] = field === "name" ? value : Number(value);
      updated[index].total = updated[index].quantity * updated[index].price;
      return { ...prev, budgetRows: updated };
    });
  }, []);

  const updateQuantity = useCallback((index, delta) => {
    setFormData((prev) => {
      const updated = [...prev.budgetRows];
      const newQuantity = Math.max(0, updated[index].quantity + delta);
      updated[index].quantity = newQuantity;
      updated[index].total = newQuantity * updated[index].price;
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
      risks: [...prev.risks, { reason: "", description: "", solution: "" }],
    }));
  }, []);

  const handleRemoveRisk = useCallback((index) => {
    setFormData((prev) => {
      const updated = [...prev.risks];
      updated.splice(index, 1);
      return { ...prev, risks: updated };
    });
  }, []);

  // Navigation logic
  const indexMax = () => screens.current.length - 1;

  const goTo = useCallback((i) => {
    screens.current.forEach((el) => el.classList.remove("active"));
    dots.current.forEach((el) => el.classList.remove("active"));
    screens.current[i]?.classList.add("active");
    dots.current[i]?.classList.add("active");
  }, []);

  const updateScreen = useCallback(
    (i) => {
      goTo(i);
    },
    [goTo]
  );

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
      if (e.key === "ArrowLeft" && index > 0) {
        setIndex((i) => {
          const newIndex = i - 1;
          updateScreen(newIndex);
          return newIndex;
        });
      } else if (e.key === "ArrowRight" && index < indexMax()) {
        setIndex((i) => {
          const newIndex = i + 1;
          updateScreen(newIndex);
          return newIndex;
        });
      } else if (e.key === "ArrowUp") {
        openModal();
      } else if (e.key === "ArrowDown") {
        closeModal();
      }
    },
    [index, updateScreen, openModal, closeModal]
  );

  useEffect(() => {
    screens.current = Array.from(document.querySelectorAll(".screen"));
    dots.current = Array.from(document.querySelectorAll(".dot"));
    openModal();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openModal, handleKeyDown]);

  // Gửi dữ liệu lên server
  const handleSubmit = useCallback(async () => {
    // Validation
    if (!formData.eventTitle) {
      alert("Event title is required!");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      alert("Start time and end time are required!");
      return;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert("Start time must be earlier than end time!");
      return;
    }
    if (!formData.categoryEventId) {
      alert("Event category is required!");
      return;
    }

    setIsLoading(true);
    try {
      const eventData = {
        eventTitle: formData.eventTitle,
        eventDescription: "",
        startTime: formData.startTime,
        endTime: formData.endTime,
        categoryEventId: formData.categoryEventId,
        placed: formData.placed,
        measuringSuccess: "",
        goals: formData.goals,
        monitoringProcess: "",
        sizeParticipants: formData.sizeParticipants,
        promotionalPlan: JSON.stringify(formData.promotionalPlan),
        targetAudience: formData.targetAudience,
        sloganEvent: formData.sloganEvent,
        tasks: formData.tasks
          .filter(
            (task) =>
              task.taskName.trim() ||
              task.deadline ||
              task.budget > 0 ||
              task.description.trim() ||
              task.subtasks.some(
                (sub) =>
                  sub.subtaskName ||
                  sub.deadline ||
                  sub.amount > 0 ||
                  sub.description
              )
          )
          .map((task) => ({
            taskName: task.taskName,
            description: task.description,
            startTime: null,
            deadline: task.deadline
              ? new Date(task.deadline).toISOString()
              : null,
            budget: task.budget,
            subTasks: task.subtasks
              .filter(
                (sub) =>
                  sub.subtaskName.trim() ||
                  sub.deadline ||
                  sub.amount > 0 ||
                  sub.description.trim()
              )
              .map((subtask) => ({
                subTaskName: subtask.subtaskName,
                description: subtask.description,
                startTime: null,
                deadline: subtask.deadline
                  ? new Date(subtask.deadline).toISOString()
                  : null,
                budget: subtask.amount,
              })),
          })),
        risks: formData.risks
          .filter(
            (risk) =>
              risk.reason.trim() ||
              risk.description.trim() ||
              risk.solution.trim()
          )
          .map((risk, index) => ({
            name: `Risk ${index + 1}`,
            reason: risk.reason,
            solution: risk.solution,
            description: risk.description,
          })),
        costBreakdowns: formData.budgetRows
          .filter((row) => row.name.trim() && row.quantity > 0 && row.price > 0)
          .map((row) => ({
            name: row.name,
            quantity: row.quantity,
            priceByOne: row.price,
          })),
      };

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

      alert("Event created successfully!");
      console.log(response.data);
      closeModal();
    } catch (error) {
      console.error("Error creating event:", error);
      console.log(localStorage.getItem("token"));
      alert(
        "thanh " + error.response?.data?.message ||
          "Failed to create event. Unable to connect to the server."
      );
    } finally {
      setIsLoading(false);
    }
  }, [formData, closeModal]);

  // Hiển thị lỗi từ API nếu có
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  useEffect(() => {
    if (screens.current.length > 0 && dots.current.length > 0) {
      updateScreen(index);
    }
  }, [index, updateScreen]);

  return (
    <div className="working-container">
      <div className="walkthrough show reveal">
        <div className="walkthrough-body">
          <ul style={{ marginTop: "30px" }} className="screens animate">
            {/* Màn hình 1: Thông Tin Chung */}
            <li className="screen active">
              <h3>Thông Tin Chung</h3>
              <Form className="w-75 mx-auto text-start">
                <Form.Group controlId="formEventTitle" className="mb-3">
                  <Form.Label>Tên sự kiện</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên sự kiện"
                    value={formData.eventTitle}
                    onChange={(e) =>
                      handleFormChange("eventTitle", e.target.value)
                    }
                  />
                </Form.Group>

                <Form.Group
                  controlId="formCategory"
                  className="mb-3 position-relative"
                >
                  <Form.Label>Loại hình sự kiện</Form.Label>
                  <div className="dropdown-wrapper">
                    <Form.Control
                      as="select"
                      value={formData.categoryEventId}
                      onChange={(e) =>
                        handleFormChange(
                          "categoryEventId",
                          Number(e.target.value)
                        )
                      }
                      className="custom-select-with-icon"
                    >
                      <option value={0} disabled>
                        Chọn loại hình sự kiện
                      </option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.categoryEventName}
                        </option>
                      ))}
                    </Form.Control>
                    <FaChevronDown className="dropdown-icon" />
                  </div>
                </Form.Group>

                <Form.Group controlId="formStartTime" className="mb-3">
                  <Form.Label>Thời gian bắt đầu</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    min={minDateTime}
                    value={formData.startTime}
                    onChange={(e) =>
                      handleFormChange("startTime", e.target.value)
                    }
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formEndTime" className="mb-3">
                  <Form.Label>Thời gian kết thúc</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    min={minDateTime}
                    value={formData.endTime}
                    onChange={(e) =>
                      handleFormChange("endTime", e.target.value)
                    }
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formPlaced" className="mb-3">
                  <Form.Label>Địa điểm tổ chức</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập địa điểm"
                    value={formData.placed}
                    onChange={(e) => handleFormChange("placed", e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formSlogan" className="mb-3">
                  <Form.Label>Thông điệp của sự kiện</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    placeholder="Nhập thông điệp của sự kiện"
                    value={formData.sloganEvent}
                    onChange={(e) =>
                      handleFormChange("sloganEvent", e.target.value)
                    }
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    style={{
                      resize: "vertical",
                      overflowY: "auto",
                      maxHeight: "8.5em",
                      lineHeight: "1.5",
                      minHeight: "4.5em",
                    }}
                  />
                </Form.Group>

                <Form.Group controlId="formDescription" className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    // value={formData.description}
                    // onChange={(e) => handleFormChange("description", e.target.value)}
                    style={{
                      resize: "vertical",
                      overflowY: "auto",
                      maxHeight: "8.5em",
                      lineHeight: "1.5",
                      minHeight: "4.5em",
                    }}
                  />
                </Form.Group>
              </Form>
            </li>

            {/* Màn hình 2: Mục Tiêu Sự Kiện */}
            <li className="screen">
              <div className="media books"></div>
              <h3>MỤC TIÊU SỰ KIỆN</h3>
              <Form className="w-75 mx-auto text-start">
                <Form.Group controlId="formGoals" className="mb-3">
                  <Form.Label>Mục tiêu của sự kiện</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Nhập mục tiêu"
                    value={formData.goals}
                    onChange={(e) => handleFormChange("goals", e.target.value)}
                    style={{
                      resize: "vertical",
                      overflowY: "auto",
                      maxHeight: "4.5em",
                      minHeight: "4.5em",
                      lineHeight: "1.5",
                    }}
                    rows={3}
                  />
                </Form.Group>

                <Form.Group controlId="formTargetAudience" className="mb-3">
                  <Form.Label>Target Audience</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập đối tượng tham gia"
                    value={formData.targetAudience}
                    onChange={(e) =>
                      handleFormChange("targetAudience", e.target.value)
                    }
                    style={{
                      resize: "none",
                      overflowY: "auto",
                      maxHeight: "6.5em",
                      lineHeight: "1.5",
                    }}
                  />
                </Form.Group>

                <Form.Group controlId="formSizeParticipants" className="mb-3">
                  <Form.Label>Dự kiến bao nhiêu người</Form.Label>
                  <Form.Select
                    value={selectedOption}
                    onChange={handleSelectChange}
                  >
                    <option value="">Chọn số lượng</option>
                    <option value="50">50 người</option>
                    <option value="100">100 người</option>
                    <option value="200">200 người</option>
                    <option value="other">Khác</option>
                  </Form.Select>

                  {selectedOption === "other" && (
                    <Form.Control
                      className="mt-2"
                      type="number"
                      placeholder="Nhập số lượng người"
                      value={customValue}
                      onChange={handleCustomValueChange}
                    />
                  )}
                </Form.Group>

                <Form.Group controlId="formMeansureSuccess" className="mb-3">
                  <Form.Label>Measuring Success</Form.Label>
                  <Form.Control
                    type="text"
                    // value={formData.targetAudience}
                    // onChange={(e) =>
                    //   handleFormChange("targetAudience", e.target.value)
                    // }
                  />
                </Form.Group>
              </Form>
            </li>

            {/* Màn hình 3: Task & Sub-task */}
            <li className="screen">
              <h3>Task & Sub-task</h3>
              <Button variant="light" onClick={handleAddTask}>
                Create Work
              </Button>
              <div className="w-100 mt-3">
                {formData.tasks.map((task, i) => (
                  <div key={i} className="mb-4 p-3 border rounded bg-light">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="link"
                          className="p-0 text-dark"
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
                          placeholder="Task Name"
                          className="fw-semibold"
                        />
                      </div>
                      <Button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveTask(i)}
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="task-main-info">
                      <div className="form-group">
                        <Form.Label>Deadline</Form.Label>
                        <Form.Control
                          type="date"
                          value={task.deadline}
                          onChange={(e) =>
                            handleTaskChange(i, "deadline", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group">
                        <Form.Label>Budget</Form.Label>
                        <Form.Control
                          type="text"
                          value={task.budget
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                          onChange={(e) =>
                            handleTaskChange(
                              i,
                              "budget",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                        />
                      </div>
                      <div className="form-group">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          style={{ marginBottom: "0" }}
                          as="textarea"
                          rows={3}
                          className="description-box"
                          value={task.description}
                          onChange={(e) =>
                            handleTaskChange(i, "description", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {task.expanded && (
                      <div className="mt-3 border-top pt-3">
                        <h6
                          style={{
                            color: "red",
                            marginBottom: "50px",
                            marginRight: "100%",
                            marginTop: "20px",
                          }}
                        >
                          Subtasks
                        </h6>
                        {task.subtasks.map((sub, j) => (
                          <div key={j} className="row mb-2 align-items-start">
                            <div className="col-md-3">
                              <FormLabel>Sub-task Name</FormLabel>
                              <Form.Control
                                placeholder="Subtask Name"
                                value={sub.subtaskName}
                                onChange={(e) =>
                                  handleSubtaskChange(
                                    i,
                                    j,
                                    "subtaskName",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <FormLabel>Deadline</FormLabel>
                              <Form.Control
                                type="date"
                                value={sub.deadline}
                                onChange={(e) =>
                                  handleSubtaskChange(
                                    i,
                                    j,
                                    "deadline",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <FormLabel>Amount</FormLabel>
                              <Form.Control
                                type="text"
                                placeholder="Số tiền"
                                value={sub.amount
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                onChange={(e) =>
                                  handleSubtaskChange(
                                    i,
                                    j,
                                    "amount",
                                    e.target.value.replace(/\D/g, "")
                                  )
                                }
                              />
                            </div>
                            <div className="col-md-4">
                              <FormLabel>Description</FormLabel>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                className="description-box"
                                placeholder="Description"
                                value={sub.description}
                                onChange={(e) =>
                                  handleSubtaskChange(
                                    i,
                                    j,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
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
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleAddSubtask(i)}
                        >
                          Create subtask
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </li>

            {/* Màn hình 4: Dự Trù Kinh Phí */}
            <li className="screen">
              <div className="media comm"></div>
              <h3>DỰ TRÙ KINH PHÍ</h3>
              <div className="w-100 mx-auto text-start">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Name</th>
                      <th>PriceByOne</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.budgetRows.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={row.name}
                            onChange={(e) =>
                              handleBudgetChange(index, "name", e.target.value)
                            }
                            placeholder="Nhập tên"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={row.price
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            onChange={(e) =>
                              handleBudgetChange(
                                index,
                                "price",
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                          />
                        </td>
                        <td className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateQuantity(index, -1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            style={{ width: "60px" }}
                            min="0"
                            value={row.quantity}
                            onChange={(e) =>
                              handleBudgetChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                          />
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateQuantity(index, 1)}
                          >
                            +
                          </button>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={row.total.toLocaleString("vi-VN")}
                            readOnly
                          />
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const updated = [...formData.budgetRows];
                              updated.splice(index, 1);
                              setFormData((prev) => ({
                                ...prev,
                                budgetRows: updated,
                              }));
                            }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="6" className="text-center">
                        <button
                          className="btn btn-outline-primary"
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
                          + Thêm Chi Phí
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </li>

            <li className="screen">
              <div className="media comm"></div>
              <h3>KẾ HOẠCH </h3>
              <Form className="w-75 mx-auto text-start">
                <Form.Group controlId="formMonitoringProcess" className="mb-3">
                  <Form.Label>Monitoring Process</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    style={{
                      resize: "none",
                      overflow: "auto",
                      maxHeight: "5.4em",
                      lineHeight: "1.8em",
                    }}
                    // value={formData.promotionalPlan.after}
                    // onChange={(e) =>
                    //   handlePromotionalPlanChange("after", e.target.value)
                    // }
                  />
                </Form.Group>

                <Form.Group controlId="formPromotionalBefore" className="mb-3">
                  <Form.Label>Kế hoạch trước sự kiện</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    style={{
                      resize: "none",
                      overflow: "auto",
                      maxHeight: "5.4em",
                      lineHeight: "1.8em",
                    }}
                    placeholder="Nhập kế hoạch trước sự kiện"
                    value={formData.promotionalPlan.before}
                    onChange={(e) =>
                      handlePromotionalPlanChange("before", e.target.value)
                    }
                  />
                </Form.Group>

                <Form.Group controlId="formPromotionalDuring" className="mb-3">
                  <Form.Label>Kế hoạch trong sự kiện</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    style={{
                      resize: "none",
                      overflow: "auto",
                      maxHeight: "5.4em",
                      lineHeight: "1.8em",
                    }}
                    placeholder="Nhập kế hoạch trong sự kiện"
                    value={formData.promotionalPlan.during}
                    onChange={(e) =>
                      handlePromotionalPlanChange("during", e.target.value)
                    }
                  />
                </Form.Group>

                <Form.Group controlId="formPromotionalAfter" className="mb-3">
                  <Form.Label>Kế hoạch sau sự kiện</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    style={{
                      resize: "none",
                      overflow: "auto",
                      maxHeight: "5.4em",
                      lineHeight: "1.8em",
                    }}
                    placeholder="Nhập kế hoạch sau sự kiện"
                    value={formData.promotionalPlan.after}
                    onChange={(e) =>
                      handlePromotionalPlanChange("after", e.target.value)
                    }
                  />
                </Form.Group>
              </Form>
            </li>

            {/* Màn hình 6: Rủi Ro */}
            <li className="screen">
              <div className="media comm"></div>
              <h3>RỦI RO</h3>
              <div className="w-100 mx-auto text-start">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Rủi ro</th>
                      <th>Lý do</th>
                      <th>Mô tả</th>
                      <th>Giải pháp</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.risks.map((risk, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={`Risk ${index + 1}`}
                            readOnly
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={risk.reason}
                            onChange={(e) =>
                              handleRiskChange(index, "reason", e.target.value)
                            }
                            placeholder="Lý do"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={risk.description}
                            onChange={(e) =>
                              handleRiskChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Mô tả"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={risk.solution}
                            onChange={(e) =>
                              handleRiskChange(
                                index,
                                "solution",
                                e.target.value
                              )
                            }
                            placeholder="Giải pháp"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveRisk(index)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="5" className="text-center">
                        <button
                          className="btn btn-outline-primary"
                          onClick={handleAddRisk}
                        >
                          + Thêm rủi ro
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </li>
          </ul>

          <button
            className="prev-screen"
            onClick={() => {
              const newIndex = Math.max(0, index - 1); // 🔒 đảm bảo không nhỏ hơn 0
              setIndex(newIndex);
            }}
            style={{ visibility: index === 0 ? "hidden" : "visible" }}
          >
            <FaChevronLeft />
          </button>

          <button
            className="next-screen"
            onClick={() => {
              const newIndex = Math.min(index + 1, indexMax()); // 🔒 đảm bảo không vượt quá số slide
              setIndex(newIndex);
            }}
            style={{ visibility: index === indexMax() ? "hidden" : "visible" }}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="walkthrough-pagination">
          {[...Array(6)].map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot ${i === index ? "active" : ""}`}
              onClick={() => {
                setIndex(i);
                // updateScreen(i);
              }}
              aria-label={`Go to screen ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="button fixed-next save-draft"
          onClick={() => alert("Draft saved!")}
        >
          Save Draft
        </button>

        <button
          className={`button fixed-next ${
            index === indexMax() ? "finish" : ""
          }`}
          onClick={() => {
            if (index === indexMax()) {
              handleSubmit();
            } else {
              const newIndex = Math.min(index + 1, indexMax());
              setIndex(newIndex);
            }
          }}
          disabled={isLoading}
        >
          {isLoading
            ? "Submitting..."
            : index === indexMax()
            ? "Finish"
            : "Next"}
        </button>
      </div>
    </div>
  );
}
