import React from "react";
import { Navigate } from "react-router-dom";
import LocalStorage from "../../utils/localStorage"; // or use localStorage directly

const ProtectedRoute = ({ children }) => {
  const email = LocalStorage.getItem("email");
  const password = LocalStorage.getItem("password");

  if (!email || !password) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
