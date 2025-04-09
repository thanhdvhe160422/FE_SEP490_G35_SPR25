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

import {
  FaHome,
  FaUserAlt,
  FaUsers,
  FaCog,
  FaEdit,
  FaThLarge,
  FaAngleDown,
} from "react-icons/fa";

const pieData = [
  { name: "Direct", value: 38, color: "#ff9f43" },
  { name: "Organic", value: 22, color: "#00cfe8" },
  { name: "Paid", value: 12, color: "#7367f0" },
  { name: "Social", value: 28, color: "#ea5455" },
  { name: "Social", value: 28, color: "#00cfe8" },
  { name: "Social", value: 28, color: "#ff9f43" },
  { name: "Social", value: 28, color: "#ea5455" },
];

const data = [
  { name: "Jan", eventsOrganized: 150, eventRegistrations: 120 },
  { name: "Feb", eventsOrganized: 120, eventRegistrations: 230 },
  { name: "Mar", eventsOrganized: 140, eventRegistrations: 190 },
  { name: "Apr", eventsOrganized: 250, eventRegistrations: 310 },
  { name: "May", eventsOrganized: 120, eventRegistrations: 910 },
  { name: "Jun", eventsOrganized: 170, eventRegistrations: 150 },
  { name: "Jul", eventsOrganized: 230, eventRegistrations: 260 },
  { name: "Aug", eventsOrganized: 190, eventRegistrations: 340 },
];

export default function Dashboard() {
  const [eventOganized, setEventOganized] = useState(true);
  const [eventRegistration, setEventRegistration] = useState(true);
  const [maxYAxisValue, setMaxYAxisValue] = useState(0);

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

  const getMaxValue = () => {
    let max = 0;
    data.forEach((item) => {
      if (eventOganized) max = Math.max(max, item.eventsOrganized);
      if (eventRegistration) max = Math.max(max, item.eventRegistrations);
    });

    const roundedMax = Math.ceil(max / 100) * 100 || 100;

    if (roundedMax > maxYAxisValue) {
      setMaxYAxisValue(roundedMax);
    }

    return Math.max(roundedMax, maxYAxisValue);
  };

  const getTicks = () => {
    const max = getMaxValue();
    const ticks = [0];
    for (let i = 200; i <= max; i += 200) {
      ticks.push(i);
    }
    return ticks;
  };

  return (
    <>
      <div class="page-flex">
        <aside class="sidebar" style={{ width: "400px" }}>
          <div class="sidebar-start">
            <div class="sidebar-head">
              <a href="/" class="logo-wrapper" title="Home">
                <span class="sr-only">Home</span>
                <span class="icon logo" aria-hidden="true"></span>
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
                    Danh sách Users
                  </a>
                </li>
                <li>
                  <a href="manage-campus-manager">
                    <FaEdit style={{ marginRight: "10px", fontSize: "20px" }} />{" "}
                    Quản lý Campus Manager
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
              <ul className="sidebar-body-menu logout-section">
                <li>
                  <a href="#">
                    <CiLogout
                      style={{ marginRight: "10px", fontSize: "40px" }}
                    />{" "}
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </aside>
        <div class="main-wrapper">
          <nav class="main-nav--bg">
            <div class="container main-nav">
              <div class="main-nav-start">
                <div class="search-wrapper">
                  <h2>Dashboard</h2>
                </div>
              </div>
              <div class="main-nav-end">
                <div class="nav-user-wrapper">
                  <button
                    href="##"
                    class="nav-user-btn dropdown-btn"
                    title="My profile"
                    type="button"
                  >
                    <span class="sr-only">My profile</span>
                    <span class="nav-user-img">
                      <picture>
                        <source
                          srcset="https://i.pinimg.com/736x/3f/3c/9a/3f3c9a765bdeb8b74d1fe6c5084f6b34.jpg"
                          type="image/webp"
                        />
                        <img
                          src={
                            "https://i.pinimg.com/736x/3f/3c/9a/3f3c9a765bdeb8b74d1fe6c5084f6b34.jpg"
                          }
                          alt="User name"
                        />
                      </picture>
                    </span>
                  </button>
                  <ul class="users-item-dropdown nav-user-dropdown dropdown">
                    <li>
                      <a href="##">
                        <i data-feather="user" aria-hidden="true"></i>
                        <span>Profile</span>
                      </a>
                    </li>
                    <li>
                      <a href="##">
                        <i data-feather="settings" aria-hidden="true"></i>
                        <span>Account settings</span>
                      </a>
                    </li>
                    <li>
                      <a class="danger" href="##">
                        <i data-feather="log-out" aria-hidden="true"></i>
                        <span>Log out</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
          <main
            style={{ marginTop: "-20px", height: "auto" }}
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
                    <h3 style={{ fontWeight: "600", marginBottom: "20px" }}>
                      Event Statistics
                    </h3>
                    <div style={{ width: "100%", height: 400 }}>
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
                          />
                          <YAxis
                            domain={[0, getMaxValue()]}
                            ticks={getTicks()}
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                          />
                          <Tooltip />
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
                                    Events Organized
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
                                    Event Registrations
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
                  <div className="card full-width">
                    <h3 className="card-title">
                      Top Events With Many Participants
                    </h3>
                    <div className="top-product-header">
                      <input className="search-bar" placeholder="Search..." />
                    </div>
                    <table className="product-table">
                      <thead>
                        <tr>
                          <th>Name Event</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Amount</th>
                          <th>Total</th>
                          <th>Creat By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            name: "Event A",
                            startTime: "2025-04-01 10:00",
                            endTime: "2025-04-01 12:00",
                            amount: "$500",
                            createdBy: "Alice",
                            totalParticipants: 120,
                          },
                          {
                            name: "Event B",
                            startTime: "2025-04-03 14:30",
                            endTime: "2025-04-03 17:00",
                            amount: "$750",
                            createdBy: "Bob",
                            totalParticipants: 85,
                          },
                          {
                            name: "Event C",
                            startTime: "2025-04-05 09:00",
                            endTime: "2025-04-05 11:30",
                            amount: "$300",
                            createdBy: "Charlie",
                            totalParticipants: 60,
                          },
                          {
                            name: "Event D",
                            startTime: "2025-04-07 13:00",
                            endTime: "2025-04-07 16:00",
                            amount: "$680",
                            createdBy: "Diana",
                            totalParticipants: 95,
                          },
                          {
                            name: "Event E",
                            startTime: "2025-04-09 08:30",
                            endTime: "2025-04-09 10:00",
                            amount: "$420",
                            createdBy: "Evan",
                            totalParticipants: 70,
                          },
                          {
                            name: "Event F",
                            startTime: "2025-04-11 15:00",
                            endTime: "2025-04-11 17:30",
                            amount: "$900",
                            createdBy: "Fiona",
                            totalParticipants: 140,
                          },
                          {
                            name: "Event G",
                            startTime: "2025-04-13 10:00",
                            endTime: "2025-04-13 12:00",
                            amount: "$350",
                            createdBy: "George",
                            totalParticipants: 55,
                          },
                          {
                            name: "Event H",
                            startTime: "2025-04-15 09:00",
                            endTime: "2025-04-15 11:00",
                            amount: "$600",
                            createdBy: "Hannah",
                            totalParticipants: 100,
                          },
                          {
                            name: "Event I",
                            startTime: "2025-04-17 14:00",
                            endTime: "2025-04-17 16:00",
                            amount: "$720",
                            createdBy: "Ivan",
                            totalParticipants: 110,
                          },
                          {
                            name: "Event J",
                            startTime: "2025-04-19 08:00",
                            endTime: "2025-04-19 10:30",
                            amount: "$480",
                            createdBy: "Julia",
                            totalParticipants: 90,
                          },
                        ].map((item, i) => (
                          <tr key={i}>
                            <td>{item.name}</td>
                            <td>{item.startTime}</td>
                            <td>{item.endTime}</td>
                            <td>{item.amount}</td>
                            <td>{item.totalParticipants}</td>
                            <td>{item.createdBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="right-column">
                  <div style={{ height: "50%" }} className="chart-card">
                    <h3 style={{ fontWeight: "600", marginBottom: "20px" }}>
                      Categories Events
                    </h3>
                    <PieChart width={300} height={300}>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        stroke="#fff"
                        strokeWidth={6}
                        cornerRadius={10}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
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
                      {pieData.map((item, index) => (
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
                                backgroundColor: item.color,
                                borderRadius: "50%",
                                marginRight: 8,
                              }}
                            ></span>
                            {item.name}
                          </span>
                          <span>{item.value}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card">
                    <h3 className="card-title">New Events</h3>
                    <ul className="user-list">
                      {[
                        { name: "Roselle Ehrman", status: "Approve" },
                        { name: "Jone Smith", status: "Waiting" },
                        { name: "Darron Handler", country: "Reject" },
                        { name: "Leatrice Kulik", country: "Approve" },
                      ].map((user, i) => (
                        <li key={i} className="user-item">
                          <div className="user-info">
                            <div>{user.name}</div>
                            <small>{user.status}</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card buyers-profile">
                    <h3 className="card-title">Profile</h3>
                    <div className="buyers-content">
                      <PieChart width={240} height={240}>
                        {" "}
                        <Pie
                          data={[
                            { name: "Male", value: 50, color: "#ff9f43" },
                            { name: "Female", value: 35, color: "#00cfe8" },
                            { name: "Others", value: 15, color: "#ea5455" },
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={5}
                        >
                          <Cell fill="#ff9f43" />
                          <Cell fill="#00cfe8" />
                          <Cell fill="#ea5455" />
                        </Pie>
                      </PieChart>

                      <ul className="buyers-legend">
                        <li>
                          <span
                            className="dot"
                            style={{ backgroundColor: "#ff9f43" }}
                          ></span>
                          <span className="label">Male</span>
                          <span className="percent">50%</span>
                        </li>
                        <li>
                          <span
                            className="dot"
                            style={{ backgroundColor: "#00cfe8" }}
                          ></span>
                          <span className="label">Female</span>
                          <span className="percent">35%</span>
                        </li>
                        <li>
                          <span
                            className="dot"
                            style={{ backgroundColor: "#ea5455" }}
                          ></span>
                          <span className="label">Others</span>
                          <span className="percent">15%</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
