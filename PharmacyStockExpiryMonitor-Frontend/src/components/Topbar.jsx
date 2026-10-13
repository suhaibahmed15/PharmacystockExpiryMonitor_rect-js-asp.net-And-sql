import React from "react";

export default function Topbar({ activeTitle, user, onLogout }) {
  const roleName =
    user?.role === "StoreManager"
      ? "Store Manager"
      : user?.role || "Pharmacist";

  return (
    <header className="topbar">
      <div className="topbar-title">
        Pharmacy Stock &gt; {activeTitle}
      </div>

      <div className="topbar-right">
        <span className="topbar-user">
          {user?.fullName || "User"} ({roleName})
        </span>
        <button
          type="button"
          onClick={onLogout}
          className="topbar-logout-btn"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
