import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout-overlay" />
      <div className="auth-card-container">
        <Outlet />
      </div>
     
    </div>
  );
}
