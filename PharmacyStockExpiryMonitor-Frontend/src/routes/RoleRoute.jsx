import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RoleRoute({ allowedRoles = ["Admin"] }) {
  const { role } = useAuth();

  const userRoleNormalized = (role || "").toLowerCase();
  const isAllowed = allowedRoles.some(
    (allowed) => allowed.toLowerCase() === userRoleNormalized
  );

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
