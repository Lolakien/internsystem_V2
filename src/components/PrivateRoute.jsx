import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import endPoints from "../routers/router";

const PrivateRoute = ({ allowedRoles }) => {
  const { accessToken, role, redirectPath } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={redirectPath || "/"} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
