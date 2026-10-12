import React from "react";
import { Menu, ChevronRight, Bell, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar({
  activeTitle,
  user,
  token,
  onLogout,
  onToggleSidebar,
  sidebarOpen,
  unreadAlerts = 0
}) {
  const navigate = useNavigate();

  const initials = (user?.fullName || user?.name || "Admin")
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="top-left">
        <button
          className="icon-btn menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Menu size={20} />
        </button>
        <div className="crumb">
          <span>PharmaCare</span>
          <ChevronRight size={14} />
          <b>{activeTitle}</b>
        </div>
      </div>

      <div className="top-actions">
        <button
          className="icon-btn bell-btn"
          onClick={() => navigate("/alerts")}
          aria-label="View alerts"
          title="Stock & Expiry Alerts"
        >
          <Bell size={18} />
          {unreadAlerts > 0 && <i className="bell-badge" />}
        </button>

        <div className="profile">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-text">
            <b>{user?.fullName || user?.name || "Administrator"}</b>
            <span>
              <Shield size={11} className="role-shield" />
              {user?.role || "Admin"}
            </span>
          </div>
          <button
            className="icon-btn logout-btn"
            onClick={token ? onLogout : () => navigate("/login")}
            title={token ? "Sign out" : "Sign in"}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
