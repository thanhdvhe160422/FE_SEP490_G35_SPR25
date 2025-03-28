import React, { useEffect, useRef, useState } from "react";
import "../../styles/Events/EventPlan.css";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Form, Row, Col, Button, FormLabel } from "react-bootstrap";

export default function EventPlan() {
  const [index, setIndex] = useState(0);
  const screens = useRef([]);
  const dots = useRef([]);
  const modalRef = useRef(null);
  const shadeRef = useRef(null);
  const [minDateTime, setMinDateTime] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [budgetRows, setBudgetRows] = useState(
    Array.from({ length: 5 }, () => ({
      name: "",
      quantity: 0,
      price: 0,
      total: 0,
    }))
  );
  const [tasks, setTasks] = useState([
    {
      taskName: "",
      deadline: "",
      budget: 0,
      description: "",
      expanded: false,
      subtasks: [],
    },
  ]);

  const toggleExpand = (index) => {
    const updated = [...tasks];
    updated[index].expanded = !updated[index].expanded;
    setTasks(updated);
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = field === "budget" ? Number(value) : value;
    setTasks(updated);
  };

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        taskName: "",
        deadline: "",
        budget: 0,
        description: "",
        expanded: false,
        subtasks: [],
      },
    ]);
  };

  const handleAddSubtask = (taskIndex) => {
    const updated = [...tasks];
    updated[taskIndex].subtasks.push({
      subtaskName: "",
      deadline: "",
      amount: 0,
      description: "",
    });
    setTasks(updated);
  };

  const handleSubtaskChange = (taskIndex, subIndex, field, value) => {
    const updated = [...tasks];
    updated[taskIndex].subtasks[subIndex][field] =
      field === "amount" ? Number(value) : value;
    setTasks(updated);
  };

  const handleRemoveTask = (index) => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  const handleBudgetChange = (index, field, value) => {
    const updated = [...budgetRows];
    updated[index][field] = field === "name" ? value : Number(value);
    updated[index].total = updated[index].quantity * updated[index].price;
    setBudgetRows(updated);
  };

  const updateQuantity = (index, delta) => {
    const updated = [...budgetRows];
    const newQuantity = Math.max(0, updated[index].quantity + delta);
    updated[index].quantity = newQuantity;
    updated[index].total = newQuantity * updated[index].price;
    setBudgetRows(updated);
  };

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
    if (e.target.value !== "other") {
      setCustomValue("");
    }
  };

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    setMinDateTime(localTime.toISOString().slice(0, 16));
  }, []);
  const indexMax = () => screens.current.length - 1;

  const goTo = (i) => {
    reset();
    screens.current[i]?.classList.add("active");
    dots.current[i]?.classList.add("active");
  };

  const reset = () => {
    screens.current.forEach((el) => el.classList.remove("active"));
    dots.current.forEach((el) => el.classList.remove("active"));
  };

  const updateScreen = (i) => {
    goTo(i);
    // setBtns(i);
  };

  const [timelineRows, setTimelineRows] = useState(
    Array.from({ length: 5 }, () => ({
      activity: "",
      startTime: "",
      endTime: "",
      person: "",
      location: "",
    }))
  );

  const handleInputChange = (index, field, value) => {
    const newRows = [...timelineRows];
    newRows[index][field] = value;
    setTimelineRows(newRows);
  };

  const handleAddRow = () => {
    setTimelineRows([
      ...timelineRows,
      { activity: "", startTime: "", endTime: "", person: "", location: "" },
    ]);
  };

  const setBtns = (i) => {
    const nextBtn = document.querySelector(".next-screen");
    const prevBtn = document.querySelector(".prev-screen");
    const finishBtn = document.querySelector(".finish");

    if (nextBtn) nextBtn.disabled = i === indexMax();
    if (prevBtn) prevBtn.disabled = i === 0;
    if (finishBtn) finishBtn.disabled = i !== indexMax();

    if (finishBtn) {
      finishBtn.classList.toggle("active", i === indexMax());
    }
  };

  const [risks, setRisks] = useState([
    { reason: "", description: "", solution: "" },
  ]);

  const handleRiskChange = (index, field, value) => {
    const updated = [...risks];
    updated[index][field] = value;
    setRisks(updated);
  };

  const handleAddRisk = () => {
    setRisks([...risks, { reason: "", description: "", solution: "" }]);
  };

  const handleRemoveRisk = (index) => {
    const updated = [...risks];
    updated.splice(index, 1);
    setRisks(updated);
  };

  const handleRemoveSubtask = (taskIndex, subIndex) => {
    const updated = [...tasks];
    updated[taskIndex].subtasks.splice(subIndex, 1);
    setTasks(updated);
  };
  

  const closeModal = () => {
    modalRef.current?.classList.remove("reveal");
    shadeRef.current?.classList.remove("reveal");
    setTimeout(() => {
      modalRef.current?.classList.remove("show");
      shadeRef.current?.classList.remove("show");
      setIndex(0);
      updateScreen(0);
    }, 200);
  };

  const openModal = () => {
    modalRef.current?.classList.add("show");
    shadeRef.current?.classList.add("show");
    setTimeout(() => {
      modalRef.current?.classList.add("reveal");
      shadeRef.current?.classList.add("reveal");
    }, 200);
    updateScreen(index);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      if (index > 0) {
        setIndex((i) => {
          const newIndex = i - 1;
          updateScreen(newIndex);
          return newIndex;
        });
      }
    } else if (e.key === "ArrowRight") {
      if (index < indexMax()) {
        setIndex((i) => {
          const newIndex = i + 1;
          updateScreen(newIndex);
          return newIndex;
        });
      }
    } else if (e.key === "ArrowUp") {
      openModal();
    } else if (e.key === "ArrowDown") {
      closeModal();
    }
  };

  useEffect(() => {
    screens.current = Array.from(document.querySelectorAll(".screen"));
    dots.current = Array.from(document.querySelectorAll(".dot"));
    openModal();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="working-container">
        <div className="walkthrough show reveal">
          <div className="walkthrough-body">
            <ul style={{ marginTop: "30px" }} className="screens animate">
              <li className="screen active">
                <h3>Thông Tin Chung</h3>

                <Form className="w-75 mx-auto text-start">
                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Tên sự kiện</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group
                    controlId="form2"
                    className="mb-3 position-relative"
                  >
                    <Form.Label>Loại hình sự kiện</Form.Label>
                    <div className="dropdown-wrapper">
                      <Form.Control
                        as="select"
                        defaultValue=""
                        className="custom-select-with-icon"
                      >
                        <option value="" disabled hidden>
                          Chọn loại hình sự kiện
                        </option>
                        <option value="online">Trực tuyến</option>
                        <option value="workshop">Hội thảo / Workshop</option>
                        <option value="competition">Cuộc thi</option>
                        <option value="volunteer">Tình nguyện</option>
                        <option value="other">Khác</option>
                      </Form.Control>
                      <FaChevronDown className="dropdown-icon" />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="formStartTime" className="mb-3">
                    <Form.Label>Thời gian bắt đầu</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      min={minDateTime}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="formStartTime" className="mb-3">
                    <Form.Label>Thời gian kết thúc</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      min={minDateTime}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="form5" className="mb-3">
                    <Form.Label>Địa điểm tổ chức</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 5" />
                  </Form.Group>

                  <Form.Group controlId="form5" className="mb-3">
                    <Form.Label>Thông điệp của sự kiện</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="Nhập thông điệp của sự kiện"
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      style={{
                        overflow: "hidden",
                        resize: "none",
                        minHeight: "60px",
                        lineHeight: "1.5",
                        transition: "height 0.2s ease",
                      }}
                    />
                  </Form.Group>
                </Form>
              </li>
              <li className="screen">
                <div className="media books"></div>
                <h3>MỤC TIÊU SỰ KIỆN</h3>
                <Form className="w-75 mx-auto text-start">
                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Mục tiêu của sự kiện</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Ai là người tham gia</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form2" className="mb-3">
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
                        onChange={(e) => setCustomValue(e.target.value)}
                      />
                    )}
                  </Form.Group>
                </Form>
              </li>






              <li className="screen">
                <h3>Task & Sub-task</h3>
                <Button variant="light" onClick={handleAddTask}>
                  Create Work
                </Button>
                <div className="w-100 mt-3">
                  {tasks.map((task, i) => (
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
          handleSubtaskChange(i, j, "subtaskName", e.target.value)
        }
      />
    </div>
    <div className="col-md-2">
    <FormLabel>Deadline</FormLabel>

      <Form.Control
        type="date"
        value={sub.deadline}
        onChange={(e) =>
          handleSubtaskChange(i, j, "deadline", e.target.value)
        }
      />
    </div>
    <div className="col-md-2">
    <FormLabel>Amount</FormLabel>

      <Form.Control
        type="text"
        placeholder="Số tiền"
        value={sub.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
        onChange={(e) =>
          handleSubtaskChange(i, j, "amount", e.target.value.replace(/\D/g, ""))
        }
      />
    </div>
    <div className="col-md-4">
    <FormLabel>Desciption</FormLabel>

      <Form.Control
        as="textarea"
        rows={3}
        className="description-box"
        placeholder="Description"
        value={sub.description}
        onChange={(e) =>
          handleSubtaskChange(i, j, "description", e.target.value)
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
                      {budgetRows.map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={row.name}
                              onChange={(e) =>
                                handleBudgetChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
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
                                const updated = [...budgetRows];
                                updated.splice(index, 1);
                                setBudgetRows(updated);
                              }}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Nút + để thêm dòng mới */}
                      <tr>
                        <td colSpan="6" className="text-center">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() =>
                              setBudgetRows([
                                ...budgetRows,
                                { name: "", quantity: 0, price: 0, total: 0 },
                              ])
                            }
                          >
                            + Thêm Chi Phí
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </li>{" "}
              <li className="screen">
                <div className="media comm"></div>
                <h3>KẾ HOẠCH TRUYỀN THÔNG</h3>
                <Form className="w-75 mx-auto text-start">
                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Kế hoạch trước sự kiện</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form2" className="mb-3">
                    <Form.Label>Kế hoạch trong sự kiện</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 2" />
                  </Form.Group>

                  <Form.Group controlId="form3" className="mb-3">
                    <Form.Label>Kế hoạch sau sự kiện</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 3" />
                  </Form.Group>
                </Form>
              </li>{" "}
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
                      {risks.map((risk, index) => (
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
                                handleRiskChange(
                                  index,
                                  "reason",
                                  e.target.value
                                )
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
              </li>{" "}
            </ul>

            <button
              className="prev-screen"
              onClick={() => {
                const newIndex = index - 1;
                setIndex(newIndex);
                updateScreen(newIndex);
              }}
              style={{ visibility: index === 0 ? "hidden" : "visible" }}
            >
              <FaChevronLeft />
            </button>

            <button
              className="next-screen"
              onClick={() => {
                const newIndex = index + 1;
                setIndex(newIndex);
                updateScreen(newIndex);
              }}
              style={{
                visibility: index === indexMax() ? "hidden" : "visible",
              }}
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
                  updateScreen(i);
                }}
                aria-label={`Go to screen ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="button fixed-next save-draft"
            onClick={() => {
            }}
          >
            Save Draft
          </button>

          <button
            className={`button fixed-next ${
              index === indexMax() ? "finish" : ""
            }`}
            onClick={() => {
              if (index === indexMax()) {
                closeModal();
              } else {
                const newIndex = index + 1;
                setIndex(newIndex);
                updateScreen(newIndex);
              }
            }}
          >
            {index === indexMax() ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
