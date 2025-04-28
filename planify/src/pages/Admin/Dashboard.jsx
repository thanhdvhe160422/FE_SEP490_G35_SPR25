import React, { useEffect, useState } from "react";
import "../../styles/Admin/customChart.css";
// import "../../assets/img/svg/Logo.svg";
// import "../../assets/css/style.min.css";
// import "../../assets/css/style.css";
import { CiLogout } from "react-icons/ci";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { FaHome, FaUsers, FaEdit, FaLock } from "react-icons/fa";
import {
  getCategoryAdmin,
  getEventByCampus,
  getEventByParticipant,
  getEventByYear,
  getNewEventByCampus,
} from "../../services/adminService";
import { getCampuses } from "../../services/campusService";
import logo from "../../assets/logo-fptu.png";

export default function Dashboard() {
  const [eventOganized, setEventOganized] = useState(true);
  const [eventRegistration, setEventRegistration] = useState(true);
  const [maxYAxisValue, setMaxYAxisValue] = useState(0);
  const [pieDatas, setPieDatas] = useState([]);
  const [data, setData] = useState([]);
  const yearNow = new Date().getFullYear();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const years = Array.from({ length: 10 }, (_, i) => yearNow - i);
  const [topEvent, setTopEvent] = useState([]);
  const [currentCampus, setCurrentCampus] = useState("Hòa Lạc");
  const [newEvent, setNewEvent] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [eventCampus, setEventCampus] = useState([]);
  const campusNames = campuses.map((campus) => campus.campusName);
  const handleChangeCampus = (event) => {
    setCurrentCampus(event.target.value);
  };
  const fetchEventByCampus = async () => {
    try {
      const response = await getEventByCampus();
      setEventCampus(response);
      console.log("Event by Campus: ", response);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const fetchCampuss = async () => {
    try {
      const response = await getCampuses();
      setCampuses(response);
      const campusNames = campuses.map((campus) => campus.campusName);
      console.log("Campuses: ", campuses);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };
  useEffect(() => {
    fetchCampuss();
  }, []);
  useEffect(() => {
    fetchEventByCampus();
  }, []);
  const fetchNewestEvent = async () => {
    try {
      const response = await getNewEventByCampus(currentCampus);
      setNewEvent(response);
      console.log("New Event: ", response);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };
  useEffect(() => {
    fetchNewestEvent();
  }, [currentCampus]);
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const fetchEventParticipants = async () => {
    try {
      const response = await getEventByParticipant();
      setTopEvent(response);
      console.log("Top Event: ", response);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };
  useEffect(() => {
    fetchEventParticipants();
  }, []);
  const fetchDataChart = async () => {
    try {
      const response = await getEventByYear(currentYear);
      const transformedData = response.map((item) => ({
        name: item.month,
        eventsOrganized: item.totalEvents,
        eventRegistrations: item.totalParticipants,
      }));
      setData(transformedData);
      console.log("Data Chart: ", response);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };
  useEffect(() => {
    fetchDataChart();
  }, [currentYear]);
  const handleYearChange = (event) => {
    const selectedYear = event.target.value;
    setCurrentYear(selectedYear);
    fetchDataChart(selectedYear);
  };
  useEffect(() => {
    fetchCategory();
  }, []);
  const fetchCategory = async () => {
    try {
      const response = await getCategoryAdmin();
      const transformedData = response.map((item) => ({
        categoryEventName: item.categoryEventName,
        value: item.totalUsed,
        totalUsed: item.totalUsed,
        percentage: item.percentage,
      }));
      setPieDatas(transformedData);
      console.log("Pie Data: ", response);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "http://localhost:3000" + "/css/style.min.css";
    document.head.appendChild(link);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href = "http://localhost:3000" + "/css/style.css";
    document.head.appendChild(link2);

    if (window.feather) {
      window.feather.replace();
    }

    return () => {
      document.head.removeChild(link);
    };
  }, []);
  const COLORS = [
    "#0088FE", // Xanh dương
    "#00C49F", // Xanh ngọc
    "#FFBB28", // Vàng
    "#FF8042", // Cam
    "#FF6384", // Hồng
    "#36A2EB", // Xanh nhạt
    "#9966FF", // Tím
  ];
  const getMaxValue = () => {
    let max = 0;
    data.forEach((item) => {
      if (eventOganized) max = Math.max(max, item.eventsOrganized);
      if (eventRegistration) max = Math.max(max, item.eventRegistrations);
    });

    const roundedMax = Math.ceil(max / 50) * 50 || 50;

    if (roundedMax > maxYAxisValue) {
      setMaxYAxisValue(roundedMax);
    }

    return Math.max(roundedMax, maxYAxisValue);
  };

  const getTicks = () => {
    const max = getMaxValue();
    const ticks = [0];
    for (let i = 10; i <= max; i += 10) {
      ticks.push(i);
    }
    return ticks;
  };
  const handleLogout = () => {
    localStorage.clear();
  };
  const formatPercent = (value) => {
    if (Number.isInteger(value)) {
      return `${value}`;
    }
    return `${value.toFixed(2).replace(".", ",")}`;
  };

  return (
    <>
      <div class="page-flex">
        <aside
          class="sidebar"
          style={{ width: "350px", position: "fixed", top: "0" }}
        >
          <div class="sidebar-start">
            <div class="sidebar-head">
              <a href="/dashboard" class="logo-wrapper" title="Home">
                <img src={logo} alt="" style={{ width: "150px" }} />
                <div class="logo-text">
                  <span class="logo-title">Planify</span>
                  <span class="logo-subtitle">Dashboard</span>
                </div>
              </a>
            </div>
            <div class="sidebar-body">
              <ul className="sidebar-body-menu">
                <li>
                  <a className="active" href="/dashboard">
                    <FaHome style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                    Dashboard
                  </a>
                </li>
                <li>
                  <a className="show-cat-btn" href="/manage-user">
                    <FaUsers
                      style={{ marginRight: "10px", fontSize: "20px" }}
                    />{" "}
                    Quản lý người dùng
                  </a>
                </li>
                <li>
                  <a href="manage-campus-manager">
                    <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                    Quản lý Campus Manager
                  </a>
                </li>
                <li>
                  <a href="/change-password">
                    <FaLock style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                    Đổi mật khẩu
                  </a>
                </li>
                <li>
                  <a href="/manage-campus">
                    <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                    Quản lý Campus
                  </a>
                </li>
                <li>
                  <a href="/loginAdmin" onClick={handleLogout}>
                    <CiLogout
                      style={{ marginRight: "10px", fontSize: "20px" }}
                    />{" "}
                    Đăng xuất
                  </a>
                </li>
                {/* <li>
                  <a className="show-cat-btn" href="#">
                    <FaThLarge style={{ marginRight: "10px", fontSize:'20px' }}  /> Extensions
                    <span
                      className="category__btn transparent-btn"
                      title="Open list"
                    >
                      <span className="sr-only">Open list</span>
                      <FaAngleDown />
                    </span>
                  </a>
                </li> */}
                {/* <li>
                  <a href="#">
                    <CiLogout style={{ marginRight: "10px", fontSize:'30px', marginTop:'100%' }} /> Settings
                  </a>
                </li> */}
              </ul>
              <ul className="sidebar-body-menu logout-section"></ul>
            </div>
          </div>
        </aside>
        <div class="main-wrapper" style={{ marginLeft: "350px" }}>
          <nav class="main-nav--bg"></nav>
          <main
            style={{ paddingTop: "20px", height: "100%" }}
            class="main users chart-page"
            id="skip-target"
          >
            <div
              style={{
                marginTop: "-40px",
                paddingLeft: "30px",
                paddingRight: "30px",
              }}
              class="container"
            >
              <div className="dashboard-main-grid">
                <div className="left-column">
                  <div style={{ height: "46%" }} className="chart-card">
                    <div
                      className="header-chart"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                      }}
                    >
                      <h3 style={{ fontWeight: "600", marginBottom: "20px" }}>
                        Thống kê sự kiện
                      </h3>
                      <div className="select-year">
                        <label htmlFor="year-select">Năm:</label>
                        <select
                          id="year-select"
                          value={currentYear}
                          onChange={handleYearChange}
                          style={{
                            marginLeft: "10px",
                            padding: "5px",
                            borderRadius: "4px",
                          }}
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div
                      style={{ fontSize: "small", width: "100%", height: 400 }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data}
                          margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={40}
                            interval={0}
                            tickFormatter={(value) =>
                              `Tháng ${parseInt(value.split("-")[1])}`
                            }
                          />
                          <YAxis
                            domain={[0, getMaxValue()]}
                            ticks={getTicks()}
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                          />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === "eventsOrganized") {
                                return [value, "Sự kiện đã tổ chức"];
                              }
                              if (name === "eventRegistrations") {
                                return [value, "Đăng ký sự kiện"];
                              }
                              return [value, name];
                            }}
                          />
                          <Legend
                            verticalAlign="top"
                            align="right"
                            wrapperStyle={{ marginTop: -30 }}
                            payload={[
                              {
                                id: "eventsOrganized",
                                type: "line",
                                value: (
                                  <span
                                    className={eventOganized ? "" : "inactive"}
                                  >
                                    Sự kiện đã tổ chức
                                  </span>
                                ),
                                color: eventOganized ? "#00c49f" : "#ccc",
                              },
                              {
                                id: "eventRegistrations",
                                type: "line",
                                value: (
                                  <span
                                    className={
                                      eventRegistration ? "" : "inactive"
                                    }
                                  >
                                    Đăng ký sự kiện
                                  </span>
                                ),
                                color: eventRegistration ? "#ff7300" : "#ccc",
                              },
                            ]}
                            onClick={(e) => {
                              if (e.id === "eventsOrganized") {
                                setEventOganized((prev) => !prev);
                              } else if (e.id === "eventRegistrations") {
                                setEventRegistration((prev) => !prev);
                              }
                            }}
                          />

                          {eventOganized && (
                            <Line
                              key={`line-eventsOrganized-${eventOganized}`}
                              type="monotone"
                              dataKey="eventsOrganized"
                              stroke="#00c49f"
                              strokeWidth={eventOganized ? 5 : 0}
                              dot={{
                                className: "chart-dot",
                                r: 6,
                                fill: "#ffffff",
                                stroke: "#00c49f",
                                strokeWidth: 3,
                              }}
                              isAnimationActive={true}
                            />
                          )}
                          {eventRegistration && (
                            <Line
                              key={`line-eventRegistrations-${eventRegistration}`}
                              type="monotone"
                              dataKey="eventRegistrations"
                              stroke="#ff7300"
                              strokeWidth={eventRegistration ? 5 : 0}
                              dot={false}
                              activeDot={{
                                className: "chart-dot",
                                r: 6,
                                fill: "#ffffff",
                                stroke: "#ff7300",
                                strokeWidth: 3,
                              }}
                              isAnimationActive={true}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="card-admin">
                    <h3 className="card-title">Sự kiện mới nhất</h3>
                    <label htmlFor="year-select">Campus:</label>
                    <select
                      id="campus-select"
                      value={currentCampus}
                      onChange={handleChangeCampus}
                      style={{
                        marginLeft: "10px",
                        padding: "5px",
                        borderRadius: "4px",
                      }}
                    >
                      {campusNames.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <ul className="user-list" style={{ paddingTop: "20px" }}>
                      {newEvent.map((user, i) => {
                        const now = new Date();
                        const start = new Date(user.startTime);

                        let status = "";
                        let color = "";

                        if (start > now) {
                          status = "Sắp diễn ra";
                          color = "green";
                        } else if (Math.abs(now - start) < 5 * 60 * 1000) {
                          status = "Đang diễn ra";
                          color = "orange";
                        } else {
                          status = "Đã diễn ra";
                          color = "gray";
                        }

                        return (
                          <li key={i} className="user-item">
                            <div className="user-info">
                              <div>{user.eventTitle}</div>
                              <div
                                style={{
                                  borderRadius: "4px",
                                  padding: "4px 8px",
                                  color: "white",
                                  backgroundColor: color,
                                  fontSize: "0.85em",
                                  marginTop: 4,
                                }}
                              >
                                {status}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="right-column">
                  <div style={{ height: "50%" }} className="chart-card">
                    <h3 style={{ fontWeight: "600", marginBottom: "20px" }}>
                      Thống kê loại sự kiện
                    </h3>
                    <PieChart width={300} height={300}>
                      <Pie
                        data={pieDatas}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        stroke="#fff"
                        strokeWidth={6}
                        cornerRadius={10}
                      >
                        {pieDatas.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div
                                style={{
                                  background: "#fff",
                                  border: "1px solid #ccc",
                                  padding: "10px",
                                  borderRadius: "4px",
                                }}
                              >
                                <p>{data.categoryEventName}</p>
                                <p>{formatPercent(data.percentage)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>

                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        textAlign: "left",
                        marginTop: "20px",
                        width: "100%",
                      }}
                    >
                      {pieDatas.map((item, index) => (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                            padding: "0 12px",
                          }}
                        >
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                backgroundColor: COLORS[index % COLORS.length],
                                borderRadius: "50%",
                                marginRight: 8,
                              }}
                            ></span>
                            {item.categoryEventName}
                          </span>
                          <span>{formatPercent(item.percentage)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card-admin buyers-profile">
                    <h3 className="card-title">Thống kê sự kiện theo Campus</h3>

                    <PieChart width={240} height={240}>
                      {" "}
                      <Pie
                        data={eventCampus}
                        dataKey="percent"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                      >
                        {eventCampus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div
                                style={{
                                  background: "#fff",
                                  border: "1px solid #ccc",
                                  padding: "10px",
                                  borderRadius: "4px",
                                }}
                              >
                                <p>{data.campusName}</p>
                                <p>{formatPercent(data.percent)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>

                    <ul className="buyers-legend">
                      {eventCampus.map((item, index) => (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                            padding: "0 12px",
                          }}
                        >
                          <span
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                backgroundColor: COLORS[index % COLORS.length],
                                borderRadius: "50%",
                                marginRight: 8,
                              }}
                            ></span>
                            {item.campusName}
                          </span>
                          <span>{formatPercent(item.percent)} %</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="card-admin full-width">
                  <h3 className="card-title">
                    Top 10 sự kiện có số lượng tham gia nhiều nhất
                  </h3>
                  <table className="product-table">
                    <thead>
                      <tr>
                        <th>Top</th>
                        <th>Tên</th>
                        <th>Bắt đầu</th>
                        <th>Kết thúc</th>
                        <th>Ngân sách</th>
                        <th>Người tham gia</th>
                        <th>Kiểu sự kiện</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topEvent.map((item, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{item.eventTitle}</td>
                          <td>{formatDate(item.startTime)}</td>
                          <td>{formatDate(item.endTime)}</td>
                          <td>{formatCurrency(item.amountBudget)}</td>
                          <td>{item.totalParticipants}</td>
                          <td>{item.categoryEventName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="space-3"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
