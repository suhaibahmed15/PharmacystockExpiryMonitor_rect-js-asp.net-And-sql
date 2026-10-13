import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function UnauthorizedPage({ userRole = "Pharmacist" }) {
  const navigate = useNavigate();

  const formattedRole =
    userRole === "StoreManager"
      ? "Store Manager"
      : userRole || "Pharmacist";

  return (
    <div className="container" style={{ textAlign: "center", padding: "60px 20px" }}>
      <div
        className="panel"
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          padding: "32px 24px",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: "52px", fontWeight: "800", color: "#dc2626", marginBottom: "6px" }}>
          403
        </div>
        <h2 style={{ marginTop: 0, marginBottom: "8px", fontSize: "19px", color: "#dc2626" }}>
          403 - Access Restricted / Unauthorized
        </h2>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
          You do not have administrative privileges to access User Management &amp; Roles.
        </p>
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "22px",
            fontSize: "13px",
            color: "#991b1b"
          }}
        >
          Your current logged-in role is: <strong>{formattedRole}</strong>.<br />
          Only users with the <strong>Admin</strong> role can view and manage user accounts and system permissions.
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            &larr; Go Back
          </button>
          <Link to="/" className="btn-primary" style={{ textDecoration: "none" }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
