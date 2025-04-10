import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumb.css";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const isNumeric = (str) => /^\d+$/.test(str);
  const lastIsNumeric = isNumeric(pathnames[pathnames.length - 1]);

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
  const customPathnames = isUpdateEvent
    ? ["event-detail-spec", "update-event"]
    : pathnames.filter((x) => !isNumeric(x));

  return (
    <nav aria-label="breadcrumb">
      <ul className="breadcrumb">
        <li>
          <Link to={getHomePath()}>Trang chủ</Link>
        </li>
        {customPathnames.map((value, index) => {
          const isLast = index === customPathnames.length - 1;
          const to =
            index === 0 && isUpdateEvent
              ? `/event-detail-eog/${pathnames[1]}`
              : `/${pathnames
                  .slice(0, pathnames.indexOf(value) + 1)
                  .join("/")}`;

          return isLast ? (
            <li key={to} className="active" aria-current="page">
              {value}
            </li>
          ) : (
            <li key={to}>
              <Link to={to}>{value}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
