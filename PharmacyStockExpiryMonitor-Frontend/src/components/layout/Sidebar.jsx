import React from "react";
import { NavLink } from "react-router-dom";
import { ROLES } from "../../utils/constants";

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  
  { label: "Medicines", path: "/medicines" },
  { label: "Batches & Expiry", path: "/batches" },
  { label: "Stock Ledger", path: "/transactions" },
  { label: "Purchases", path: "/purchases" },
  { label: "Alerts", path: "/alerts" },
  { label: "AI Intelligence", path: "/intelligence" },
  { label: "Categories", path: "/categories" },
  { label: "Suppliers", path: "/suppliers" },
  // { label: "Users", path: "/users", adminOnly: true },
  // { label: "Roles", path: "/roles", adminOnly: true }
];

export default function Sidebar({ userRole, isOpen = true, onClose }) {
  const isAdmin = userRole && userRole.toLowerCase() === ROLES.ADMIN.toLowerCase();

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-brand">
        <div className="brand-logo-icon">Rx</div>
        <div className="brand-text">
          <span className="brand-title">PharmaStock</span>
          <span className="brand-subtitle">Expiry Monitor</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => {
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-link-text">{item.label}</span>
              {item.adminOnly && <span className="admin-chip">Admin</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-role-badge">
          Role: <strong>{userRole || "User"}</strong>
        </div>
      </div>
    </aside>
  );
}
