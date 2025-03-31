import React, { useEffect, useRef, useState, useCallback } from "react";
import "../../styles/Events/EventPlan.css";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Form, Button, FormLabel } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        setError("Không thể lấy campusId từ token. Vui lòng đăng nhập lại.");
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
        setError(err.response?.data?.message || "Lỗi khi lấy danh mục.");
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
    budgetRows: Array(5)
      .fill()
      .map(() => ({ name: "", quantity: 0, price: 0, total: 0 })),
    risks: [{ reason: "", description: "", solution: "" }],
  });

  const [minDateTime, setMinDateTime] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { categories, error } = useCategories();

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
      EndTime: formData.endTime
        ? new Date(formData.endTime).toISOString()
        : null,
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
          Deadline: task.deadline
            ? new Date(task.deadline).toISOString()
            : null,
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
            risk.reason.trim() ||
            risk.description.trim() ||
            risk.solution.trim()
        )
        .map((risk, index) => ({
          Name: `Risk ${index + 1}`,
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
    };
  }, [formData]);

  // Validation chung
  const validateForm = useCallback(() => {
    if (!formData.eventTitle) return "Tên sự kiện là bắt buộc!";
    if (!formData.startTime || !formData.endTime)
      return "Thời gian bắt đầu và kết thúc là bắt buộc!";
    if (new Date(formData.startTime) >= new Date(formData.endTime))
      return "Thời gian bắt đầu phải sớm hơn thời gian kết thúc!";
    if (!formData.categoryEventId) return "Loại hình sự kiện là bắt buộc!";
    if (!formData.placed) return "Địa điểm tổ chức là bắt buộc!";
    if (!formData.tasks.some((task) => task.taskName.trim()))
      return "Phải có ít nhất một task!";
    return null;
  }, [formData]);

  // Gửi yêu cầu tạo sự kiện
  const handleSubmit = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    console.log(localStorage.getItem("token"));
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
      console.log("sasdasda:" + response.data.result?.id);

      if (response.status === 201) {
        const eventId = response.data.result?.id || 0; // Lấy eventId từ phản hồi nếu có
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
        toast.success("Tạo sự kiện thành công và đã gửi yêu cầu!");
        closeModal();
      } else {
        toast.error(
          `Tạo sự kiện thất bại với mã trạng thái: ${response.status}`
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo sự kiện!");
      console.error("Lỗi chi tiết:", error);
    } finally {
      setIsLoading(false);
    }
  }, [prepareEventData, closeModal, validateForm]);

  // Gửi yêu cầu lưu bản nháp
  const handleSaveDraft = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const eventData = prepareEventData();
      const response = await axios.post(
        "https://localhost:44320/api/Events/save-draft",
        eventData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Lưu bản nháp thành công!");
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu bản nháp!");
      console.error("Lỗi chi tiết:", error);
    } finally {
      setIsLoading(false);
    }
  }, [prepareEventData, closeModal, validateForm]);

  return (
    <div className="working-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="walkthrough show reveal" ref={modalRef}>
        <div className="walkthrough-body">
          <ul style={{ marginTop: "30px" }} className="screens animate">
            {/* Màn hình 1: Thông Tin Chung */}
            <li className="screen active">
              <h3 className="text-primary">Thông Tin Chung</h3>
              <Form className="w-75 mx-auto text-start shadow p-4 rounded bg-light">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Tên sự kiện <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên sự kiện"
                    value={formData.eventTitle}
                    onChange={(e) =>
                      handleFormChange("eventTitle", e.target.value)
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                  <Form.Label>
                    Loại hình sự kiện <span className="text-danger">*</span>
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
                      Chọn loại hình
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
                    Thời gian bắt đầu <span className="text-danger">*</span>
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
                    Thời gian kết thúc <span className="text-danger">*</span>
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
                    Địa điểm tổ chức <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập địa điểm"
                    value={formData.placed}
                    onChange={(e) => handleFormChange("placed", e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Thông điệp sự kiện</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Nhập thông điệp"
                    value={formData.sloganEvent}
                    onChange={(e) =>
                      handleFormChange("sloganEvent", e.target.value)
                    }
                    style={{ resize: "vertical", minHeight: "80px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mô tả sự kiện</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập mô tả"
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    style={{ resize: "vertical", minHeight: "100px" }}
                  />
                </Form.Group>
              </Form>
            </li>

            {/* Màn hình 2: Mục Tiêu Sự Kiện */}
            <li className="screen">
              <h3 className="text-primary">Mục Tiêu Sự Kiện</h3>
              <Form className="w-75 mx-auto text-start shadow p-4 rounded bg-light">
                <Form.Group className="mb-3">
                  <Form.Label>Mục tiêu</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập mục tiêu"
                    value={formData.goals}
                    onChange={(e) => handleFormChange("goals", e.target.value)}
                    style={{ resize: "vertical", minHeight: "100px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Đối tượng tham gia</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập đối tượng"
                    value={formData.targetAudience}
                    onChange={(e) =>
                      handleFormChange("targetAudience", e.target.value)
                    }
                    style={{ resize: "vertical", minHeight: "100px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số lượng người tham gia</Form.Label>
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
                      placeholder="Nhập số lượng"
                      value={customValue}
                      onChange={handleCustomValueChange}
                    />
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Đo lường thành công</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập cách đo lường"
                    value={formData.measuringSuccess}
                    onChange={(e) =>
                      handleFormChange("measuringSuccess", e.target.value)
                    }
                  />
                </Form.Group>
              </Form>
            </li>

            {/* Màn hình 3: Task & Sub-task */}
            <li className="screen">
              <h3 className="text-primary">Task & Sub-task</h3>
              <Button variant="outline-primary mb-3" onClick={handleAddTask}>
                + Thêm Công Việc
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
                          placeholder="Tên Task"
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
                          Hạn chót <span className="text-danger">*</span>
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
                        <Form.Label>Ngân sách</Form.Label>
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
                        <Form.Label>Mô tả</Form.Label>
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
                              <Form.Label>Tên Subtask</Form.Label>
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
                              <Form.Label>Hạn chót</Form.Label>
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
                              <Form.Label>Số tiền</Form.Label>
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
                              <Form.Label>Mô tả</Form.Label>
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
                          + Thêm Subtask
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </li>

            {/* Màn hình 4: Dự Trù Kinh Phí */}
            <li className="screen">
              <h3 className="text-primary">Dự Trù Kinh Phí</h3>
              <div className="w-100 mx-auto text-start shadow p-4 rounded bg-light">
                <table className="table table-bordered table-hover">
                  <thead className="table-primary">
                    <tr>
                      <th>STT</th>
                      <th>Tên</th>
                      <th>Đơn giá (VNĐ)</th>
                      <th>Số lượng</th>
                      <th>Tổng (VNĐ)</th>
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
                            placeholder="Nhập tên"
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
                              handleBudgetChange(i, "quantity", e.target.value)
                            }
                            style={{ width: "60px", textAlign: "center" }}
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
                          + Thêm Chi Phí
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </li>

            {/* Màn hình 5: Kế Hoạch */}
            <li className="screen">
              <h3 className="text-primary">Kế Hoạch</h3>
              <Form className="w-75 mx-auto text-start shadow p-4 rounded bg-light">
                <Form.Group className="mb-3">
                  <Form.Label>Quy trình giám sát</Form.Label>
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
                  <Form.Label>Kế hoạch trước sự kiện</Form.Label>
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
                  <Form.Label>Kế hoạch trong sự kiện</Form.Label>
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
                  <Form.Label>Kế hoạch sau sự kiện</Form.Label>
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

            {/* Màn hình 6: Rủi Ro */}
            <li className="screen">
              <h3 className="text-primary">Rủi Ro</h3>
              <div className="w-100 mx-auto text-start shadow p-4 rounded bg-light">
                <table className="table table-bordered table-hover">
                  <thead className="table-primary">
                    <tr>
                      <th>Rủi ro</th>
                      <th>Lý do</th>
                      <th>Mô tả</th>
                      <th>Giải pháp</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.risks.map((risk, i) => (
                      <tr key={i}>
                        <td>{`Risk ${i + 1}`}</td>
                        <td>
                          <Form.Control
                            value={risk.reason}
                            onChange={(e) =>
                              handleRiskChange(i, "reason", e.target.value)
                            }
                            placeholder="Lý do"
                          />
                        </td>
                        <td>
                          <Form.Control
                            value={risk.description}
                            onChange={(e) =>
                              handleRiskChange(i, "description", e.target.value)
                            }
                            placeholder="Mô tả"
                          />
                        </td>
                        <td>
                          <Form.Control
                            value={risk.solution}
                            onChange={(e) =>
                              handleRiskChange(i, "solution", e.target.value)
                            }
                            placeholder="Giải pháp"
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
                      <td colSpan="5" className="text-center">
                        <Button
                          variant="outline-primary"
                          onClick={handleAddRisk}
                        >
                          + Thêm Rủi Ro
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
            style={{ visibility: index === indexMax() ? "hidden" : "visible" }}
          >
            <FaChevronRight />
          </Button>
        </div>

        <div className="walkthrough-pagination">
          {Array(6)
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
          variant="outline-success"
          className="button fixed-next save-draft"
          onClick={handleSaveDraft}
          disabled={isLoading}
        >
          {isLoading ? "Đang lưu..." : "Lưu Bản Nháp"}
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
            ? "Đang xử lý..."
            : index === indexMax()
            ? "Tạo Sự Kiện"
            : "Tiếp Theo"}
        </Button>
      </div>
      <div className="shade" ref={shadeRef} onClick={closeModal}></div>
    </div>
  );
}
