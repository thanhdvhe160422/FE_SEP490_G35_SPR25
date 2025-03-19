import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("role");

  const isAuthorized = allowedRoles.includes(userRole);
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  return isAuthorized ? children : <Navigate to="/authorization" />;
};

export default PrivateRoute;
