import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Tags,
  Truck,
  Boxes,
  ShoppingCart,
  ClipboardList,
  Bell,
  TrendingUp,
  Users,
  Archive,
  Lock,
  X
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Medicines", path: "/medicines", icon: Pill },
  { label: "Batches & Expiry", path: "/batches", icon: Boxes },
  { label: "Stock Ledger", path: "/transactions", icon: ClipboardList },
  { label: "Purchases", path: "/purchases", icon: ShoppingCart },
  { label: "Alerts", path: "/alerts", icon: Bell },
  { label: "Forecasts", path: "/predictions", icon: TrendingUp },
  { label: "Categories", path: "/categories", icon: Tags },
  { label: "Suppliers", path: "/suppliers", icon: Truck },
  { label: "Archived Logs", path: "/archive", icon: Archive },
  { label: "Users & Security", path: "/users", icon: Users, adminOnly: true }
];

export default function Sidebar({ isOpen, onClose, unreadAlerts = 0, userRole }) {
  const isAdmin = userRole && userRole.toLowerCase() === "admin";

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
        <div className="brand">
          <div className="brand-logo">
            <Pill size={22} strokeWidth={2.5} />
          </div>
          <div>
            <b>PharmaCare</b>
            <small>STOCK & EXPIRY SYSTEM</small>
          </div>
          <button
            className="mobile-close icon-btn"
            onClick={onClose}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">INVENTORY & GOVERNANCE</div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isRestrictedForUser = item.adminOnly && !isAdmin;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={handleLinkClick}
                className={({ isActive }) => `nav-item ${isActive ? "selected" : ""}`}
                title={isRestrictedForUser ? "Requires Administrator Permission" : item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === "Alerts" && unreadAlerts > 0 && (
                  <span className="nav-alert">{unreadAlerts}</span>
                )}
                {isRestrictedForUser && (
                  <span className="nav-role-badge" style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <Lock size={10} /> Admin
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-version-tag">
            <span>v1.0.0 • Connected</span>
          </div>
        </div>
      </aside>

      {isOpen && (
        <button
          className="mobile-shade"
          onClick={onClose}
          aria-label="Close navigation overlay"
        />
      )}
    </>
  );
}
