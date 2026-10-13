import React from "react";
import { NavLink } from "react-router-dom";

export const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Medicines", path: "/medicines" },
  { label: "Batches & Expiry", path: "/batches" },
  { label: "Stock Ledger", path: "/transactions" },
  { label: "Purchases", path: "/purchases" },
  { label: "Alerts", path: "/alerts" },
  { label: "Categories", path: "/categories" },
  { label: "Suppliers", path: "/suppliers" },
  { label: "Users & Roles", path: "/users", adminOnly: true }
];

export default function Sidebar({ isOpen, onClose, userRole }) {
  const isAdmin = userRole && userRole.toLowerCase() === "admin";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Pharmacy Stock
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
