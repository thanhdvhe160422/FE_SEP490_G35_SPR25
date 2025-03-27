import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "../../components/Header/Header";
import "./../../styles/Author/HomeOfImplementer.css";

const WeekCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [weeksInYear, setWeeksInYear] = useState([]);

  useEffect(() => {
    const savedDate = localStorage.getItem("currentDate");
    const savedYear = localStorage.getItem("selectedYear");
    const savedWeek = localStorage.getItem("selectedWeek");

    if (savedDate && savedYear && savedWeek) {
      const parsedDate = new Date(savedDate);
      setCurrentDate(parsedDate);
      setSelectedYear(parseInt(savedYear, 10));
      setSelectedWeek(parseInt(savedWeek, 10));
      generateWeeksInYear(parseInt(savedYear, 10));
    } else {
      generateWeeksInYear(new Date().getFullYear());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentDate", currentDate.toISOString());
    localStorage.setItem("selectedYear", selectedYear.toString());
    localStorage.setItem("selectedWeek", selectedWeek.toString());
  }, [currentDate, selectedYear, selectedWeek]);

  const generateWeeksInYear = useCallback((year) => {
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
  }, []);

  const formatDayMonth = (date) => `${date.getDate()}/${date.getMonth() + 1}`;

  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(
      date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1)
    );

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
    updateSelectedWeek(newDate);
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
    updateSelectedWeek(newDate);
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

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  useEffect(() => {
    updateSelectedWeek(currentDate);
  }, [currentDate]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  };

  return (
    <>
      <Header />
      <div className="week-calendar">
        <div className="controls">
          <button onClick={previousWeek}>Previous Week</button>
          <button onClick={nextWeek}>Next Week</button>
        </div>
        <span>
          Year:{" "}
          <select
            className="year-select"
            value={selectedYear}
            onChange={handleYearChange}
          >
            {generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </span>
        <span>
          Week:{" "}
          <select
            className="week-select"
            value={selectedWeek}
            onChange={handleWeekChange}
          >
            {weeksInYear.map((week, index) => (
              <option key={index} value={index}>
                {week.label}
              </option>
            ))}
          </select>
        </span>

        <div className="week-dates">
          {weekDates.map((date, index) => (
            <div key={index} className="week-date">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
          ))}
        </div>

        <div className="week-label">
          {weekDates.map((date, index) => (
            <div key={index} className="week-date">
              {formatDayMonth(date)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default WeekCalendar;
