import React, { useEffect, useState } from "react";
import "./customChart.css";
import "./img/svg/Logo.svg";
import "./css/style.min.css";
import "./css/style.css";

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
  Cell,
  ResponsiveContainer,
} from "recharts";

const pieData = [
  { name: "Direct", value: 38, color: "#ff9f43" },
  { name: "Organic", value: 22, color: "#00cfe8" },
  { name: "Paid", value: 12, color: "#7367f0" },
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
  const [showDoanhThu, setShowDoanhThu] = useState(true);
  const [showChiPhi, setShowChiPhi] = useState(true);
  const [maxYAxisValue, setMaxYAxisValue] = useState(0);

  useEffect(() => {
    // Gọi sau khi script đã load trong index.html
    if (window.feather) {
      window.feather.replace();
    }
  }, []);

  const getMaxValue = () => {
    let max = 0;
    data.forEach((item) => {
      if (showDoanhThu) max = Math.max(max, item.eventsOrganized);
      if (showChiPhi) max = Math.max(max, item.eventRegistrations);
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
      <div class="layer"></div>

      <div class="page-flex">
        <aside class="sidebar">
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
              <ul class="sidebar-body-menu">
                <li>
                  <a className="active" href="/">
                    <span
                      className="icon home icon-dark"
                      aria-hidden="true"
                    ></span>{" "}
                    Dashboard
                  </a>
                </li>
              </ul>
              <ul class="sidebar-body-menu">
                <li>
                  <a class="show-cat-btn" href="##">
                    <span
                      class="icon user-3 icon-dark"
                      aria-hidden="true"
                    ></span>
                    Users
                  </a>
                </li>
                <li>
                  <a href="appearance.html">
                    <span class="icon edit icon-dark" aria-hidden="true"></span>
                    Appearance
                  </a>
                </li>
                <li>
                  <a class="show-cat-btn" href="##">
                    <span
                      class="icon category icon-dark"
                      aria-hidden="true"
                    ></span>
                    Extentions
                    <span
                      class="category__btn transparent-btn"
                      title="Open list"
                    >
                      <span class="sr-only">Open list</span>
                      <span class="icon arrow-down" aria-hidden="true"></span>
                    </span>
                  </a>
                  <ul class="cat-sub-menu">
                    <li>
                      <a href="extention-01.html">Extentions-01</a>
                    </li>
                    <li>
                      <a href="extention-02.html">Extentions-02</a>
                    </li>
                  </ul>
                </li>

                <li>
                  <a href="##">
                    <span
                      class="icon setting icon-dark"
                      aria-hidden="true"
                    ></span>
                    Settings
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
                  <div className="chart-card">
                    <h3 style={{ fontWeight: "600", marginBottom: "20px" }}>
                      Event Statistics
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer width="100%" height="110%">
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
                                    className={showDoanhThu ? "" : "inactive"}
                                  >
                                    Events Organized
                                  </span>
                                ),
                                color: showDoanhThu ? "#00c49f" : "#ccc",
                              },
                              {
                                id: "eventRegistrations",
                                type: "line",
                                value: (
                                  <span
                                    className={showChiPhi ? "" : "inactive"}
                                  >
                                    Event Registrations
                                  </span>
                                ),
                                color: showChiPhi ? "#ff7300" : "#ccc",
                              },
                            ]}
                            onClick={(e) => {
                              if (e.id === "eventsOrganized") {
                                setShowDoanhThu((prev) => !prev);
                              } else if (e.id === "eventRegistrations") {
                                setShowChiPhi((prev) => !prev);
                              }
                            }}
                          />

                          {showDoanhThu && (
                            <Line
                              key={`line-eventsOrganized-${showDoanhThu}`}
                              type="monotone"
                              dataKey="eventsOrganized"
                              stroke="#00c49f"
                              strokeWidth={showDoanhThu ? 5 : 0}
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
                          {showChiPhi && (
                            <Line
                              key={`line-eventRegistrations-${showChiPhi}`}
                              type="monotone"
                              dataKey="eventRegistrations"
                              stroke="#ff7300"
                              strokeWidth={showChiPhi ? 5 : 0}
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
                    <h3 className="card-title">Top Events </h3>
                    <div className="top-product-header">
                      <input className="search-bar" placeholder="Search..." />
                    </div>
                    <table className="product-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Orders</th>
                          <th>Price</th>
                          <th>Ads Spent</th>
                          <th>Refunds</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            img: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
                            name: "Nike v22",
                            desc: "Running Shoes",
                            orders: 8000,
                            price: "$130",
                            ads: "$9.500",
                            refund: "> 13",
                          },
                          {
                            img: "https://cdn-icons-png.flaticon.com/512/2920/2920052.png",
                            name: "Instax Camera",
                            desc: "Portable Camera",
                            orders: 3000,
                            price: "$45",
                            ads: "$4.500",
                            refund: "> 18",
                          },
                          {
                            img: "https://cdn-icons-png.flaticon.com/512/1532/1532480.png",
                            name: "Chair",
                            desc: "Relaxing chair",
                            orders: 6000,
                            price: "$80",
                            ads: "$5.800",
                            refund: "< 11",
                          },
                        ].map((item, i) => (
                          <tr key={i}>
                            <td>
                              <div className="product-cell">
                                <img src={item.img} alt={item.name} />
                                <div>
                                  <div>{item.name}</div>
                                  <small>{item.desc}</small>
                                </div>
                              </div>
                            </td>
                            <td>{item.orders}</td>
                            <td>{item.price}</td>
                            <td>{item.ads}</td>
                            <td>{item.refund}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="right-column">
                  <div className="chart-card">
                    <h3 style={{ fontWeight: "600", marginBottom: "20px" }}>
                      Categories Events
                    </h3>
                    <PieChart width={200} height={200}>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        fill="#8884d8"
                        paddingAngle={5}
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
                    <h3 className="card-title">New Customers</h3>
                    <ul className="user-list">
                      {[
                        { name: "Roselle Ehrman", country: "Brazil" },
                        { name: "Jone Smith", country: "Australia" },
                        { name: "Darron Handler", country: "Pakistan" },
                        { name: "Leatrice Kulik", country: "Moscow" },
                      ].map((user, i) => (
                        <li key={i} className="user-item">
                          <img
                            src={`https://i.pravatar.cc/150?img=${i + 20}`}
                            alt={user.name}
                            className="avatar"
                          />
                          <div className="user-info">
                            <div>{user.name}</div>
                            <small>{user.country}</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card">
                    <h3 className="card-title">Buyers Profile</h3>
                    <PieChart width={180} height={180}>
                      <Pie
                        data={[
                          { name: "Male", value: 50, color: "#ff9f43" },
                          { name: "Female", value: 35, color: "#00cfe8" },
                          { name: "Others", value: 15, color: "#ea5455" },
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        fill="#8884d8"
                        paddingAngle={5}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                    <ul className="legend-list">
                      <li>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#ff9f43" }}
                        ></span>{" "}
                        Male - 50%
                      </li>
                      <li>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#00cfe8" }}
                        ></span>{" "}
                        Female - 35%
                      </li>
                      <li>
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: "#ea5455" }}
                        ></span>{" "}
                        Others - 15%
                      </li>
                    </ul>
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
