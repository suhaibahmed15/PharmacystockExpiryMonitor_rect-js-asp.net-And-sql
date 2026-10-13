import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import useAuth from "../hooks/useAuth";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getActiveTitle = (pathname) => {
    if (pathname === "/") return "Dashboard Overview";
    if (pathname.startsWith("/medicines")) {
      if (pathname.includes("/new")) return "Add New Medicine";
      if (pathname.includes("/edit")) return "Edit Medicine";
      if (pathname.includes("/batches")) return "Medicine Batches";
      return "Medicine Inventory";
    }
    if (pathname.startsWith("/categories")) return "Medicine Categories";
    if (pathname.startsWith("/suppliers")) return "Suppliers Directory";
    if (pathname.startsWith("/batches")) return "Batches & Expiry Dates";
    if (pathname.startsWith("/purchases")) {
      if (pathname.includes("/new")) return "Create Purchase Order";
      return "Purchase Orders";
    }
    if (pathname.startsWith("/transactions")) return "Stock Ledger & Dispensing";
    if (pathname.startsWith("/alerts")) return "Stock & Expiry Alerts";
    if (pathname.startsWith("/intelligence")) return "AI Forecasts & Stock Intelligence";
    if (pathname.startsWith("/users")) return "User Management & Security";
    if (pathname.startsWith("/roles")) return "Role & Permission Management";
    if (pathname.startsWith("/unauthorized")) return "Access Restricted";
    return "Pharmacy Stock & Expiry Monitor";
  };

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={role}
      />

      <div className="main-area">
        <Topbar
          activeTitle={getActiveTitle(location.pathname)}
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <main className="page-content">
          <Outlet />
        </main>

        <footer className="page-footer">
          &copy; {new Date().getFullYear()} Pharmacy Stock and Expiry Monitor. Enterprise Inventory System.
        </footer>
      </div>
    </div>
  );
}
