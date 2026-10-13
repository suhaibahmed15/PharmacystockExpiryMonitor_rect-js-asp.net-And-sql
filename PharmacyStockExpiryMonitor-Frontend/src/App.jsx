import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MedicinesPage from "./pages/MedicinesPage";
import CategoriesPage from "./pages/CategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";
import BatchesPage from "./pages/BatchesPage";
import PurchasesPage from "./pages/PurchasesPage";
import StockTransactionsPage from "./pages/StockTransactionsPage";
import AlertsPage from "./pages/AlertsPage";
import PredictionsPage from "./pages/PredictionsPage";
import UsersPage from "./pages/UsersPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = (newToken, newUserObj) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUserObj));
    setToken(newToken);
    setUser(newUserObj);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  // Helper for Topbar breadcrumb & title based on route path
  const getActiveTitle = (path) => {
    switch (path) {
      case "/":
        return "Dashboard Overview";
      case "/medicines":
        return "Medicine Inventory";
      case "/categories":
        return "Medicine Categories";
      case "/suppliers":
        return "Registered Suppliers";
      case "/batches":
        return "Batches & Expiry Dates";
      case "/purchases":
        return "Purchase Orders";
      case "/transactions":
        return "Stock Ledger & Dispensing";
      case "/alerts":
        return "System Stock Alerts";
      case "/predictions":
        return "AI Demand & Depletion Forecasts";
      case "/users":
        return "User Management & Security";
      case "/archive":
        return "Archived Records";
      case "/unauthorized":
        return "Access Restricted";
      default:
        return "Pharmacy Stock & Expiry Monitor";
    }
  };

  // Login view: Fullscreen without sidebar/topbar
  if (!token) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user?.role}
      />

      <div className="main-area">
        <Topbar
          activeTitle={getActiveTitle(location.pathname)}
          user={user}
          token={token}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        <main className="page-content">
          <Routes>
            <Route path="/" element={<DashboardPage currentUser={user} />} />
            <Route path="/medicines" element={<MedicinesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/batches" element={<BatchesPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/transactions" element={<StockTransactionsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route
              path="/users"
              element={
                user?.role?.toLowerCase() === "admin" ? (
                  <UsersPage currentUser={user} />
                ) : (
                  <UnauthorizedPage userRole={user?.role} />
                )
              }
            />
            <Route
              path="/unauthorized"
              element={<UnauthorizedPage userRole={user?.role} />}
            />
            <Route path="/archive" element={<NotFoundPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="page-footer">
          &copy; {new Date().getFullYear()} Pharmacy Stock and Expiry Monitor
        </footer>
      </div>
    </div>
  );
}
