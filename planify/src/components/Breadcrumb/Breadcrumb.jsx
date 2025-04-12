import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumb.css";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const isNumeric = (str) => /^\d+$/.test(str);
  const lastIsNumeric = isNumeric(pathnames[pathnames.length - 1]);
  const { state } = location; // Lấy state từ useLocation

  const getHomePath = () => {
    const role = localStorage.getItem("role");
    if (role === "Campus Manager" || role === "Event Organizer") {
      return "/home";
    } else if (role === "Implementer") {
      return "/home-implementer";
    } else if (role === "Spectator") {
      return "/home-spec";
    } else {
      return "/login";
    }
  };

  // Logic tùy chỉnh cho update-event
  const isUpdateEvent = pathnames[0] === "update-event" && lastIsNumeric;
  let customPathnames = isUpdateEvent
    ? ["event-detail-spec", "update-event"]
    : pathnames.filter((x) => !isNumeric(x));

  // Nếu có state.from, thêm nguồn vào customPathnames
  if (state?.from && location.pathname === "/event-detail-EOG") {
    customPathnames = [state.from, ...customPathnames];
  }

  return (
    <nav aria-label="breadcrumb">
      <ul className="breadcrumb">
        <li>
          <Link to={getHomePath()}>Trang chủ</Link>
        </li>
        {customPathnames.map((value, index) => {
          const isLast = index === customPathnames.length - 1;
          let to;

          if (
            index === 0 &&
            state?.from &&
            location.pathname === "/event-detail-EOG"
          ) {
            // Trang nguồn (My Request hoặc Manage Request)
            to = `/${state.from}`;
          } else if (index === 0 && isUpdateEvent) {
            to = `/event-detail-eog/${pathnames[1]}`;
          } else {
            to = `/${pathnames
              .slice(0, pathnames.indexOf(value) + 1)
              .join("/")}`;
          }

          // Lấy displayName từ state nếu có
          const displayName =
            index === 0 &&
            state?.displayName &&
            location.pathname === "/event-detail-EOG"
              ? state.displayName
              : value;

          return isLast ? (
            <li key={to} className="active" aria-current="page">
              {displayName}
            </li>
          ) : (
            <li key={to}>
              <Link to={to}>{displayName}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
