import React, { useEffect, useRef, useState } from "react";
import "../../styles/Events/EventPlan.css";
import { FaChevronLeft, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Form, Row, Col, Button } from "react-bootstrap";

export default function EventPlan() {
  const [index, setIndex] = useState(0);
  const screens = useRef([]);
  const dots = useRef([]);
  const modalRef = useRef(null);
  const shadeRef = useRef(null);
  const [minDateTime, setMinDateTime] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [customValue, setCustomValue] = useState("");

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
                    <Form.Label>Thông tin 1</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form2" className="mb-3">
                    <Form.Label>Thông tin 2</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 2" />
                  </Form.Group>

                  <Form.Group controlId="form3" className="mb-3">
                    <Form.Label>Thông tin 3</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 3" />
                  </Form.Group>

                  <Form.Group controlId="form4" className="mb-3">
                    <Form.Label>Thông tin 4</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 4" />
                  </Form.Group>

                  <Form.Group controlId="form5" className="mb-3">
                    <Form.Label>Thông tin 5</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 5" />
                  </Form.Group>
                </Form>
              </li>
              <li className="screen">
                <div className="media bars"></div>
                <h3>ĐỐI TƯỢNG MỤC TIÊU</h3>
                <Form className="w-75 mx-auto text-start">
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
                <h3>LỊCH TRÌNH CHI TIẾT (Task)</h3>
                <Button variant="light" onClick={handleAddRow}>
                  Thêm hoạt động
                </Button>
                <Form className="w-100 text-start">
                  <table className="table table-bordered text-white bg-transparent">
                    <thead>
                      <tr>
                        <th>Tên hoạt động</th>
                        <th>Bắt đầu</th>
                        <th>Kết thúc</th>
                        <th>Người phụ trách</th>
                        <th>Địa điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timelineRows.map((row, i) => (
                        <tr key={i}>
                          <td>
                            <Form.Control
                              type="text"
                              value={row.activity}
                              onChange={(e) =>
                                handleInputChange(i, "activity", e.target.value)
                              }
                              placeholder="Tên hoạt động"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="time"
                              value={row.startTime}
                              onChange={(e) =>
                                handleInputChange(
                                  i,
                                  "startTime",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="time"
                              value={row.endTime}
                              onChange={(e) =>
                                handleInputChange(i, "endTime", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              value={row.person}
                              onChange={(e) =>
                                handleInputChange(i, "person", e.target.value)
                              }
                              placeholder="Người phụ trách"
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              value={row.location}
                              onChange={(e) =>
                                handleInputChange(i, "location", e.target.value)
                              }
                              placeholder="Địa điểm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-end"></div>
                </Form>
              </li>
              <li className="screen">
                <div className="media comm"></div>
                <h3>CƠ CẤU NHÂN SỰ</h3>
                <Form className="w-75 mx-auto text-start">
                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Thông tin 1</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form2" className="mb-3">
                    <Form.Label>Thông tin 2</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 2" />
                  </Form.Group>

                  <Form.Group controlId="form3" className="mb-3">
                    <Form.Label>Thông tin 3</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 3" />
                  </Form.Group>

                  <Form.Group controlId="form4" className="mb-3">
                    <Form.Label>Thông tin 4</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 4" />
                  </Form.Group>

                  <Form.Group controlId="form5" className="mb-3">
                    <Form.Label>Thông tin 5</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 5" />
                  </Form.Group>
                </Form>
              </li>
              <li className="screen">
                <div className="media comm"></div>
                <h3>DỰ TRÙ KINH PHÍ</h3>
                <Form className="w-75 mx-auto text-start">
                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Thông tin 1</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form2" className="mb-3">
                    <Form.Label>Thông tin 2</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 2" />
                  </Form.Group>

                  <Form.Group controlId="form3" className="mb-3">
                    <Form.Label>Thông tin 3</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 3" />
                  </Form.Group>

                  <Form.Group controlId="form4" className="mb-3">
                    <Form.Label>Thông tin 4</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 4" />
                  </Form.Group>

                  <Form.Group controlId="form5" className="mb-3">
                    <Form.Label>Thông tin 5</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 5" />
                  </Form.Group>
                </Form>
              </li>{" "}
              <li className="screen">
                <div className="media comm"></div>
                <h3>KẾ HOẠCH TRUYỀN THÔNG</h3>
                <Form className="w-75 mx-auto text-start">
                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Thông tin 1</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form2" className="mb-3">
                    <Form.Label>Thông tin 2</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 2" />
                  </Form.Group>

                  <Form.Group controlId="form3" className="mb-3">
                    <Form.Label>Thông tin 3</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 3" />
                  </Form.Group>

                  <Form.Group controlId="form4" className="mb-3">
                    <Form.Label>Thông tin 4</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 4" />
                  </Form.Group>

                  <Form.Group controlId="form5" className="mb-3">
                    <Form.Label>Thông tin 5</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 5" />
                  </Form.Group>
                </Form>
              </li>{" "}
              <li className="screen">
                <div className="media comm"></div>
                <h3>HẬU CẦN & KỸ THUẬT</h3>
                <Form className="w-75 mx-auto text-start">
                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Thông tin 1</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form2" className="mb-3">
                    <Form.Label>Thông tin 2</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 2" />
                  </Form.Group>

                  <Form.Group controlId="form3" className="mb-3">
                    <Form.Label>Thông tin 3</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 3" />
                  </Form.Group>

                  <Form.Group controlId="form4" className="mb-3">
                    <Form.Label>Thông tin 4</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 4" />
                  </Form.Group>

                  <Form.Group controlId="form5" className="mb-3">
                    <Form.Label>Thông tin 5</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 5" />
                  </Form.Group>
                </Form>
              </li>{" "}
              <li className="screen">
                <div className="media comm"></div>
                <h3>ĐÁNH GIÁ SAU SỰ KIỆN</h3>
                <Form className="w-75 mx-auto text-start">
                  <Form.Group controlId="form1" className="mb-3">
                    <Form.Label>Thông tin 1</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 1" />
                  </Form.Group>

                  <Form.Group controlId="form2" className="mb-3">
                    <Form.Label>Thông tin 2</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 2" />
                  </Form.Group>

                  <Form.Group controlId="form3" className="mb-3">
                    <Form.Label>Thông tin 3</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 3" />
                  </Form.Group>

                  <Form.Group controlId="form4" className="mb-3">
                    <Form.Label>Thông tin 4</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 4" />
                  </Form.Group>

                  <Form.Group controlId="form5" className="mb-3">
                    <Form.Label>Thông tin 5</Form.Label>
                    <Form.Control type="text" placeholder="Nhập thông tin 5" />
                  </Form.Group>
                </Form>
              </li>
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
            {[...Array(9)].map((_, i) => (
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
