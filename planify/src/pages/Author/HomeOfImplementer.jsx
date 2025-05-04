import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import "../../styles/Author/HomeOfImplementer.css";
import { getSubtaskByImplementer } from "../../services/subTaskService";

const WeekCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [weeksInYear, setWeeksInYear] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    apiResponseStatus: "Chưa lấy dữ liệu",
    subtasksCount: 0,
    lastFetchTime: null,
  });

  const subTaskColors = [
    "#4285F4", // Xanh dương
    "#EA4335", // Đỏ
    "#FBBC05", // Vàng
    "#34A853", // Xanh lá
    "#FF9800", // Cam
    "#9C27B0", // Tím
    "#00BCD4", // Xanh ngọc
    "#795548", // Nâu
    "#607D8B", // Xám xanh
    "#E91E63", // Hồng
  ];

  useEffect(() => {
    const savedDate = localStorage.getItem("currentDate");
    const savedYear = localStorage.getItem("selectedYear");
    const savedWeek = localStorage.getItem("selectedWeek");

    if (savedDate && savedYear && savedWeek) {
      const parsedDate = new Date(savedDate);
      setCurrentDate(parsedDate);
      setSelectedYear(parseInt(savedYear, 10));
      generateWeeksInYear(parseInt(savedYear, 10));
      setSelectedWeek(parseInt(savedWeek, 10));
    } else {
      generateWeeksInYear(new Date().getFullYear());
    }

    const style = document.createElement("style");
    style.textContent = `
      .gantt-container {
        padding-top: 130px;
        position: relative;
        width: 100%;
        height:100vh;
        overflow-x: hidden;
      }
      
      .calendar-controls {
        position: fixed;
        width: 100%;
        z-index: 10;
        top: 80px; 
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: white;
        border-bottom: 1px solid #e0e0e0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      
      .gantt-header {
        display: flex;
        position: fixed;
        width: 100%;
        z-index: 10;
        top: 130px;
        border-bottom: 2px solid #ddd;
        background-color: #f5f5f5;
        border-radius: 4px 4px 0 0;
        padding-top: 10px ;
      }
      
      .gantt-body {
        width: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .task-info {
        width: 30%;
        min-width: 250px;
        padding-right: 10px;
      }
      
      .timeline-header, .timeline {
        width: 70%;
        display: flex;
      }
      
      .day-column, .day-column-bg {
        flex: 1;
        text-align: center;
      }
      
      .task-row {
        display: flex;
        width: 100%;
        position: relative;
      }
      
      .task-bar {
        position: absolute;
        height: auto;
        min-height: 60px;
        border-radius: 4px;
        z-index: 1;
        padding: 5px 8px;
      }
      
      .task-time-info {
        position: absolute;
        bottom: -22px;
        left: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        color: #666;
        z-index: 2;
      }
      
      .task-time-start {
        text-align: left;
        white-space: nowrap;
      }
      
      .task-time-end {
        text-align: right;
        white-space: nowrap;
      }
      
      .task-bar-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        line-height: 1.4;
        color: white;
        font-weight: bold;
        margin-bottom: 2px;
      }
      
      .complete-button {
        position: absolute; 
        right: 8px;
        top: 8px;
        background: white;
        border: none;
        border-radius: 3px;
        padding: 2px 6px;
        font-size: 10px;
        cursor: pointer;
        color: #333;
      }
      
      .complete-button:hover {
        background: #eee;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("currentDate", currentDate.toISOString());
    localStorage.setItem("selectedYear", selectedYear.toString());
    localStorage.setItem("selectedWeek", selectedWeek.toString());
  }, [currentDate, selectedYear, selectedWeek]);

  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(
      date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1)
    );

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);

    const newYear = newDate.getFullYear();
    if (newYear !== selectedYear) {
      setSelectedYear(newYear);
      generateWeeksInYear(newYear);
    }

    updateSelectedWeek(newDate);
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);

    const newYear = newDate.getFullYear();
    if (newYear !== selectedYear) {
      setSelectedYear(newYear);
      generateWeeksInYear(newYear);
    }

    updateSelectedWeek(newDate);
  };

  const formatDayMonth = (date) => `${date.getDate()}/${date.getMonth() + 1}`;

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const updateSelectedWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(
      date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1)
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekLabel = `${formatDayMonth(startOfWeek)} đến ${formatDayMonth(
      endOfWeek
    )}`;
    const weekIndex = weeksInYear.findIndex((week) => week.label === weekLabel);

    if (weekIndex !== -1) {
      setSelectedWeek(weekIndex);
    }
  };

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    generateWeeksInYear(year);
  };

  const handleWeekChange = (event) => {
    const weekIndex = parseInt(event.target.value, 10);
    setSelectedWeek(weekIndex);
    const startOfWeek = new Date(weeksInYear[weekIndex].startDate);
    setCurrentDate(startOfWeek);
  };

  const generateWeeksInYear = (year) => {
    const weeks = [];
    let currentDate = new Date(year, 0, 1);

    while (currentDate.getDay() !== 1) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (currentDate.getFullYear() === year) {
      const startOfWeek = new Date(currentDate);
      const endOfWeek = new Date(currentDate);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      weeks.push({
        label: `${formatDayMonth(startOfWeek)} đến ${formatDayMonth(
          endOfWeek
        )}`,
        startDate: new Date(startOfWeek),
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    setWeeksInYear(weeks);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  };

  const weekDates = getWeekDates(currentDate);

  const fetchSubtasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const implementerId = localStorage.getItem("userId");
      const startDate = weekDates[0].toISOString();
      const endDate = weekDates[6].toISOString();

      console.log("Đang lấy danh sách nhiệm vụ phụ với tham số:", {
        implementerId,
        startDate,
        endDate,
      });

      const response = await getSubtaskByImplementer(
        implementerId,
        startDate,
        endDate
      );

      console.log("Phản hồi API thô:", response);
      setDebugInfo((prev) => ({
        ...prev,
        apiResponseStatus: response ? "Thành công" : "Không có dữ liệu",
        lastFetchTime: new Date().toLocaleTimeString("vi-VN"),
      }));

      if (!response) {
        console.warn("API trả về không có dữ liệu");
        setError("Không có nhiệm vụ phụ nào trong tuần này.");
        setSubtasks([]);
        return;
      }

      if (!response.items) {
        console.error("Định dạng phản hồi không hợp lệ:", response);
        setError("Định dạng phản hồi từ API không hợp lệ");
        setSubtasks([]);
        return;
      }

      const sortedSubtasks = response.items.sort(
        (a, b) => new Date(a.deadline) - new Date(b.deadline)
      );

      console.log("Danh sách nhiệm vụ phụ đã sắp xếp:", sortedSubtasks);
      console.log("Số lượng nhiệm vụ phụ:", sortedSubtasks.length);

      setSubtasks(sortedSubtasks);
      setDebugInfo((prev) => ({
        ...prev,
        subtasksCount: sortedSubtasks.length,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhiệm vụ phụ:", error);
      setError("Không thể lấy danh sách nhiệm vụ phụ: " + error.message);
      setSubtasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, [currentDate]);

  useEffect(() => {
    console.log("Danh sách nhiệm vụ phụ hiện tại trong state:", subtasks);
    console.log("Số lượng nhiệm vụ phụ:", subtasks.length);
  }, [subtasks]);

  const calculateTaskPosition = (task) => {
    const startDate = new Date(task.startTime);
    const endDate = new Date(task.deadline);

    const taskStart = new Date(startDate.setHours(0, 0, 0, 0));
    const taskEnd = new Date(endDate.setHours(0, 0, 0, 0));

    const weekStart = new Date(new Date(weekDates[0]).setHours(0, 0, 0, 0));
    const weekEnd = new Date(new Date(weekDates[6]).setHours(23, 59, 59, 999));

    let leftPos = 0;
    let rightPos = 100;

    if (taskStart < weekStart) {
      leftPos = 0;
    } else {
      const daysFromWeekStart = Math.floor(
        (taskStart - weekStart) / (1000 * 60 * 60 * 24)
      );
      leftPos = (daysFromWeekStart / 7) * 100;
    }

    if (taskEnd > weekEnd) {
      rightPos = 100;
    } else {
      const daysFromWeekStart =
        Math.floor((taskEnd - weekStart) / (1000 * 60 * 60 * 24)) + 1;
      rightPos = (daysFromWeekStart / 7) * 100;
    }

    return {
      left: `${leftPos}%`,
      width: `${rightPos - leftPos}%`,
    };
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Đang thực hiện";
      case 1:
        return "Đã hoàn thành";
      default:
        return "Không xác định";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 0:
        return {
          border: "none",
          opacity: 0.9,
        };
      case 1:
        return {
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 30.5L33 17.5L30.5 15L20 25.5L15.5 21L13 23.5L20 30.5Z' fill='white' /%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          backgroundSize: "20px 20px",
          opacity: 1,
        };
      default:
        return {};
    }
  };

  const getTaskColor = (taskId) => {
    const colorIndex = taskId % subTaskColors.length;
    return subTaskColors[colorIndex];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleStatusUpdate = async (subTaskId, currentStatus) => {
    try {
      if (currentStatus === 0) {
        await updateSubtaskStatus(subTaskId, 1);

        setSubtasks((prevSubtasks) =>
          prevSubtasks.map((task) =>
            task.id === subTaskId ? { ...task, status: 1 } : task
          )
        );

        console.log(
          `Đã cập nhật trạng thái nhiệm vụ ${subTaskId} thành Đã hoàn thành`
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái nhiệm vụ:", error);
    }
  };

  const updateSubtaskStatus = async (subTaskId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://localhost:44320/api/SubTasks/update-status/${subTaskId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Không thể cập nhật trạng thái nhiệm vụ phụ:", error);
      throw error;
    }
  };

  useEffect(() => {
    generateWeeksInYear(selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    updateSelectedWeek(currentDate);
  }, [currentDate, weeksInYear]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .task-bar.completed::after {
        content: "✓";
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: white;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Header />
      <div className="gantt-container">
        {/* Điều khiển lịch */}
        <div className="calendar-controls">
          <button onClick={previousWeek}>← Tuần trước</button>
          <div className="date-selectors">
            <label>
              Năm:
              <select value={selectedYear} onChange={handleYearChange}>
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tuần:
              <select value={selectedWeek} onChange={handleWeekChange}>
                {weeksInYear?.map((week, index) => (
                  <option key={index} value={index}>
                    {week.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button onClick={nextWeek}>Tuần sau →</button>
        </div>

        <div className="gantt-header">
          <div className="task-info">Thông tin nhiệm vụ phụ</div>
          <div className="timeline-header">
            {weekDates.map((date, index) => (
              <div key={index} className="day-column">
                <div className="day-name">
                  {date.toLocaleDateString("vi-VN", { weekday: "short" })}
                </div>
                <div className="day-date">{formatDayMonth(date)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="gantt-body">
          {loading ? (
            <div className="loading">Đang tải nhiệm vụ...</div>
          ) : error ? (
            <div
              className="error-message"
              style={{ padding: "20px", color: "red" }}
            >
              {error}
            </div>
          ) : subtasks && subtasks.length > 0 ? (
            subtasks.map((task, index) => {
              const taskColor = getTaskColor(task.id || index);
              const isCompleted = task.status === 1;
              const statusStyle = getStatusStyle(task.status);
              if (task.status === 0) {
                console.log("Tìm thấy nhiệm vụ với trạng thái 0:", task);
              }
              return (
                <div key={task.id || index} className="task-row">
                  <div className="task-info">
                    <div className="task-name">
                      {task.subTaskName}
                      {isCompleted && (
                        <span style={{ marginLeft: "10px", color: "green" }}>
                          ✓
                        </span>
                      )}
                      {task.status === 0 && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(task.id, task.status)
                          }
                          style={{
                            marginLeft: "10px",
                            padding: "3px 8px",
                            background: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Chưa hoàn thành
                        </button>
                      )}
                    </div>
                    <div className="task-details">
                      <div>
                        <span>Mô tả:</span> {task.subTaskDescription}
                      </div>
                      <div>
                        <span>Ngân sách:</span>{" "}
                        {formatCurrency(task.amountBudget)}
                      </div>
                      <div>
                        <span>Nhiệm vụ:</span> {task.taskName}
                      </div>
                      <div>
                        <span>Sự kiện:</span> {task.eventTitle}
                      </div>
                    </div>
                  </div>
                  <div className="timeline">
                    {weekDates.map((_, dayIndex) => (
                      <div key={dayIndex} className="day-column-bg"></div>
                    ))}
                    <div
                      className={`task-bar ${isCompleted ? "completed" : ""}`}
                      style={{
                        ...calculateTaskPosition(task),
                        backgroundColor: taskColor,
                        ...statusStyle,
                        height: "auto",
                        minHeight: "60px",
                        padding: "5px 8px",
                      }}
                      title={`${task.subTaskName}
Bắt đầu: ${new Date(task.startTime).toLocaleString("vi-VN")}
Kết thúc: ${new Date(task.deadline).toLocaleString("vi-VN")}
Ngân sách: ${formatCurrency(task.amountBudget)}
Trạng thái: ${getStatusText(task.status)}`}
                    >
                      <span
                        className="task-bar-label"
                        style={{ lineHeight: "1.4", marginBottom: "2px" }}
                      >
                        {task.subTaskName}
                      </span>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "white",
                          opacity: 0.9,
                        }}
                      >
                        <div>Bắt đầu: {formatDateTime(task.startTime)}</div>
                        <div>Kết thúc: {formatDateTime(task.deadline)}</div>
                      </div>
                      {task.status === 0 && (
                        <button
                          className="complete-button"
                          onClick={() =>
                            handleStatusUpdate(task.id, task.status)
                          }
                        >
                          ✓
                        </button>
                      )}
                      <div className="task-time-info">
                        <div className="task-time-start">
                          Bắt đầu: {formatDateTime(task.startTime)}
                        </div>
                        <div className="task-time-end">
                          Kết thúc: {formatDateTime(task.deadline)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-tasks">
              Không tìm thấy nhiệm vụ nào trong tuần này.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WeekCalendar;
