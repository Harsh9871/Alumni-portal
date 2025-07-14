import React from "react";
import { Navigate } from "react-router-dom";
import LocalStorage from "../../utils/localStorage"; // or use localStorage directly

const ProtectedRoute = ({ children }) => {
  const token = LocalStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
