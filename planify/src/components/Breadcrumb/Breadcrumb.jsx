import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumb.css";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav aria-label="breadcrumb">
      <ul className="breadcrumb">
        <li>
          <Link to="/">Trang chủ</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

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
