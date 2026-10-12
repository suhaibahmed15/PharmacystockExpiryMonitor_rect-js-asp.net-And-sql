import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, Navigate, Link } from "react-router-dom";
import { X, Check } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardPage from "./pages/DashboardPage";
import MedicinesPage from "./pages/MedicinesPage";
import BatchesPage from "./pages/BatchesPage";
import PurchasesPage from "./pages/PurchasesPage";
import StockLedgerPage from "./pages/StockLedgerPage";
import AlertsPage from "./pages/AlertsPage";
import PredictionsPage from "./pages/PredictionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";
import UsersPage from "./pages/UsersPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ErrorPage from "./pages/ErrorPage";
import { getAlerts } from "./api";

const pageTitles = {
  "/": "Dashboard",
  "/medicines": "Medicines",
  "/batches": "Batches",
  "/purchases": "Purchases",
  "/transactions": "Stock Ledger",
  "/alerts": "Alerts",
  "/predictions": "Forecasts",
  "/categories": "Categories",
  "/suppliers": "Suppliers",
  "/users": "Users & Roles",
  "/unauthorized": "Access Restricted",
  "/error": "System Error"
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("pharmacy_token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pharmacy_user") || "null");
    } catch {
      return null;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [toast, setToast] = useState("");
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Auto handle resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Load unread alerts count
  useEffect(() => {
    if (!token) return;
    getAlerts()
      .then(({ data }) => {
        const unread = (data || []).filter((a) => !a.isRead).length;
        setUnreadAlerts(unread);
      })
      .catch(() => {});
  }, [token, location.pathname]);

  // Toast timer
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  function handleLogin(jwtToken, userObj) {
    localStorage.setItem("pharmacy_token", jwtToken);
    localStorage.setItem("pharmacy_user", JSON.stringify(userObj));
    setToken(jwtToken);
    setUser(userObj);
    setToast(`Welcome back, ${userObj.fullName}!`);
    navigate("/");
  }

  function handleLogout() {
    localStorage.removeItem("pharmacy_token");
    localStorage.removeItem("pharmacy_user");
    setToken("");
    setUser(null);
    setToast("You have signed out.");
    navigate("/login");
  }

  const isLoginPage = location.pathname === "/login";
  const activeTitle = pageTitles[location.pathname] || "Workspace";

  return (
    <div className={`app-shell ${isLoginPage ? "login-shell" : sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
      {!isLoginPage && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadAlerts={unreadAlerts}
          userRole={user?.role}
        />
      )}

      <main className={`main-area ${isLoginPage ? "login-main" : ""}`}>
        {!isLoginPage && (
          <Topbar
            activeTitle={activeTitle}
            user={user}
            token={token}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            sidebarOpen={sidebarOpen}
            unreadAlerts={unreadAlerts}
          />
        )}

        {toast && (
          <div className="toast">
            <span className="toast-icon">
              <Check size={14} />
            </span>
            <span className="toast-message">{toast}</span>
            <button onClick={() => setToast("")} aria-label="Dismiss toast">
              <X size={14} />
            </button>
          </div>
        )}

        <Routes>
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/"
            element={
              token ? (
                <DashboardPage onSetToast={setToast} currentUser={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/medicines"
            element={
              token ? (
                <MedicinesPage onSetToast={setToast} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/batches"
            element={
              token ? (
                <BatchesPage onSetToast={setToast} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/purchases"
            element={
              token ? (
                <PurchasesPage onSetToast={setToast} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/transactions"
            element={
              token ? (
                <StockLedgerPage onSetToast={setToast} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/alerts"
            element={
              token ? (
                <AlertsPage onSetToast={setToast} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/predictions"
            element={
              token ? (
                <PredictionsPage onSetToast={setToast} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/categories"
            element={
              token ? (
                <CategoriesPage onSetToast={setToast} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/suppliers"
            element={
              token ? (
                <SuppliersPage onSetToast={setToast} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/users"
            element={
              !token ? (
                <Navigate to="/login" replace />
              ) : user?.role?.toLowerCase() === "admin" ? (
                <UsersPage onSetToast={setToast} currentUser={user} />
              ) : (
                <UnauthorizedPage userRole={user?.role} />
              )
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage userRole={user?.role} />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {!isLoginPage && (
          <footer className="page-footer">
            <span>© {new Date().getFullYear()} PharmaCare Hospital Pharmacy & Inventory Management System. All rights reserved.</span>
          </footer>
        )}
      </main>
    </div>
  );
}
