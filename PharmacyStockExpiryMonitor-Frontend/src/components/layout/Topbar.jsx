import React from "react";
// import alertApi from "../../api/alertApi"; // Temporarily commented out

export default function Topbar({
  activeTitle = "Overview",
  user,
  onLogout,
  onToggleSidebar,
  sidebarOpen
}) {
  // const [unreadAlerts, setUnreadAlerts] = useState(0);

  // Temporarily commented out alert polling:
  // useEffect(() => {
  //   let isMounted = true;
  //   const fetchUnreadCount = async () => {
  //     try {
  //       const res = await alertApi.getAll();
  //       const alerts = res.data || [];
  //       const unread = alerts.filter((a) => !a.isRead && !a.isResolved).length;
  //       if (isMounted) setUnreadAlerts(unread);
  //     } catch {
  //       // Ignore silent error
  //     }
  //   };
  //   fetchUnreadCount();
  //   const interval = setInterval(fetchUnreadCount, 30000);
  //   return () => {
  //     isMounted = false;
  //     clearInterval(interval);
  //   };
  // }, []);

  const roleName =
    user?.role === "StoreManager"
      ? "Store Manager"
      : user?.role || "Pharmacist";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
          <span className="hamburger-bar" />
        </button>

        <div className="topbar-title">
          <span className="title-section">Pharmacy Stock</span>
          <span className="title-chevron">&gt;</span>
          <span className="title-current">{activeTitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Unread Alerts Bell - Temporarily commented out
        <Link to="/alerts" className="topbar-bell-btn" title="View Alerts">
          <span className="bell-icon" role="img" aria-label="Alerts">
            🔔
          </span>
          {unreadAlerts > 0 && (
            <span className="unread-badge">
              {unreadAlerts > 99 ? "99+" : unreadAlerts}
            </span>
          )}
        </Link>
        */}

        {/* User Info */}
        <div className="topbar-user-info">
          <span className="user-avatar">
            {(user?.fullName || "U").charAt(0).toUpperCase()}
          </span>
          <div className="user-details">
            <span className="user-name">{user?.fullName || "User"}</span>
            <span className="user-role-label">{roleName}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="topbar-logout-btn"
          title="Sign out of system"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
