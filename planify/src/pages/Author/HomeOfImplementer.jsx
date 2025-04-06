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
    apiResponseStatus: "Not fetched",
    subtasksCount: 0,
    lastFetchTime: null,
  });

  const subTaskColors = [
    "#4285F4", // Blue
    "#EA4335", // Red
    "#FBBC05", // Yellow
    "#34A853", // Green
    "#FF9800", // Orange
    "#9C27B0", // Purple
    "#00BCD4", // Cyan
    "#795548", // Brown
    "#607D8B", // Blue Grey
    "#E91E63", // Pink
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
        height: calc(100vh - 120px);
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

    const weekLabel = `${formatDayMonth(startOfWeek)} to ${formatDayMonth(
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
        label: `${formatDayMonth(startOfWeek)} to ${formatDayMonth(endOfWeek)}`,
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

      console.log("Fetching subtasks with params:", {
        implementerId,
        startDate,
        endDate,
      });

      const response = await getSubtaskByImplementer(
        implementerId,
        startDate,
        endDate
      );

      console.log("Raw API response:", response);
      setDebugInfo((prev) => ({
        ...prev,
        apiResponseStatus: response ? "Success" : "Null",
        lastFetchTime: new Date().toLocaleTimeString(),
      }));

      if (!response) {
        console.warn("API returned null");
        setError("There are no subtasks for this week.");
        setSubtasks([]);
        return;
      }

      if (!response.items) {
        console.error("Invalid response format:", response);
        setError("Invalid response format from API");
        setSubtasks([]);
        return;
      }

      const sortedSubtasks = response.items.sort(
        (a, b) => new Date(a.deadline) - new Date(b.deadline)
      );

      console.log("Sorted subtasks to be rendered:", sortedSubtasks);
      console.log("Number of subtasks:", sortedSubtasks.length);

      setSubtasks(sortedSubtasks);
      setDebugInfo((prev) => ({
        ...prev,
        subtasksCount: sortedSubtasks.length,
      }));
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      setError("Failed to fetch subtasks: " + error.message);
      setSubtasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, [currentDate]);

  useEffect(() => {
    console.log("Current subtasks in state:", subtasks);
    console.log("Subtasks length:", subtasks.length);
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
        return "In Progress";
      case 1:
        return "Completed";
      default:
        return "Unknown";
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
      // Only update if current status is 0 (In Progress)
      if (currentStatus === 0) {
        // Set status to 1 (Completed)
        await updateSubtaskStatus(subTaskId, 1);

        // Update the local state to reflect the change
        setSubtasks((prevSubtasks) =>
          prevSubtasks.map((task) =>
            task.id === subTaskId ? { ...task, status: 1 } : task
          )
        );

        console.log(`Updated task ${subTaskId} status to Completed`);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
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
        throw new Error(`Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to update subtask status:", error);
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
        {/* Calendar controls */}
        <div className="calendar-controls">
          <button onClick={previousWeek}>← Previous Week</button>
          <div className="date-selectors">
            <label>
              Year:
              <select value={selectedYear} onChange={handleYearChange}>
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Week:
              <select value={selectedWeek} onChange={handleWeekChange}>
                {weeksInYear?.map((week, index) => (
                  <option key={index} value={index}>
                    {week.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button onClick={nextWeek}>Next Week →</button>
        </div>

        <div className="gantt-header">
          <div className="task-info">SubTask Information</div>
          <div className="timeline-header">
            {weekDates.map((date, index) => (
              <div key={index} className="day-column">
                <div className="day-name">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="day-date">{formatDayMonth(date)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="gantt-body">
          {loading ? (
            <div className="loading">Loading tasks...</div>
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
                console.log("Found task with status 0:", task);
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
                          Mark Complete
                        </button>
                      )}
                    </div>
                    <div className="task-details">
                      <div>
                        <span>Description:</span> {task.subTaskDescription}
                      </div>
                      <div>
                        <span>Budget:</span> {formatCurrency(task.amountBudget)}
                      </div>
                      <div>
                        <span>Task:</span> {task.taskName}
                      </div>
                      <div>
                        <span>Event:</span> {task.eventTitle}
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
Start: ${new Date(task.startTime).toLocaleString()}
End: ${new Date(task.deadline).toLocaleString()}
Budget: ${formatCurrency(task.amountBudget)}
Status: ${getStatusText(task.status)}`}
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
                        <div>Start: {formatDateTime(task.startTime)}</div>
                        <div>End: {formatDateTime(task.deadline)}</div>
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
                          Start: {formatDateTime(task.startTime)}
                        </div>
                        <div className="task-time-end">
                          End: {formatDateTime(task.deadline)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-tasks">No tasks found for this week.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default WeekCalendar;
