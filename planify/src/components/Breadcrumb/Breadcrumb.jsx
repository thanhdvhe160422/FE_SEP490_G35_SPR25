import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumb.css";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const { state } = location;

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

  const sourceMap = {
    "my-favorite-events": "Sự kiện yêu thích",
    "my-drafts": "Sự kiện nháp",
    "my-event": "Sự kiện của tôi",
    "my-request": "Yêu cầu của tôi",
    "manage-request": "Quản lý yêu cầu",
    "event-detail-EOG": "Chi tiết sự kiện",
    "event-detail-spec": "Chi tiết sự kiện",
    "update-event": "Cập nhật sự kiện",
    "event-registered": "Sự kiện đã đăng ký",
    "history-event": "Sự kiện đã tham gia",
    "manage-permission": "Quản lý quyền hạn",
    "manage-eog": "Quản lý Event Organizer",
  };

  const isUpdateEvent = pathnames[0] === "update-event" && lastIsNumeric;
  let customPathnames = pathnames.filter((x) => !isNumeric(x));

  // Kiểm tra cả event-detail-EOG và event-detail-spec
  const isEventDetailPage =
    location.pathname.toLowerCase().startsWith("/event-detail-eog") ||
    location.pathname.toLowerCase().startsWith("/event-detail-spec");
  const isManagePermissionPage = location.pathname
    .toLowerCase()
    .startsWith("/manage-permission");
  const isFromRecognizedSource =
    (isEventDetailPage || isUpdateEvent || isManagePermissionPage) &&
    state?.from &&
    sourceMap[state.from];

  // Xác định trang chi tiết sự kiện trước đó cho update-event
  const previousDetailPage = state?.previousDetailPage || "event-detail-EOG"; // Mặc định là EOG nếu không có thông tin

  if (isFromRecognizedSource) {
    customPathnames = isUpdateEvent
      ? [state.from, previousDetailPage, "update-event"]
      : [state.from, ...customPathnames];
  } else if (isUpdateEvent) {
    customPathnames = [previousDetailPage, "update-event"];
  }

  return (
    <nav aria-label="breadcrumb">
      <ul className="breadcrumb">
        <li>
          <Link to={getHomePath()}>Trang chủ</Link>
        </li>

        {customPathnames.map((value, index) => {
          const isLast = index === customPathnames.length - 1;
          let to = "";

          if (index === 0 && isFromRecognizedSource) {
            to = `/${state.from}`;
          } else if (index === 0 && isUpdateEvent && !isFromRecognizedSource) {
            to = `/${previousDetailPage}/${pathnames[1]}`;
          } else if (
            index === 1 &&
            isUpdateEvent &&
            customPathnames[1] === previousDetailPage
          ) {
            to = `/${previousDetailPage}/${pathnames[1]}`;
          } else {
            const nonIdPath = pathnames.filter((x) => !isNumeric(x));
            const sliceIndex = nonIdPath.indexOf(value);
            to = `/${nonIdPath.slice(0, sliceIndex + 1).join("/")}`;
          }

          const displayName =
            (index === 0 && isFromRecognizedSource && sourceMap[state.from]) ||
            sourceMap[value] ||
            value;

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
