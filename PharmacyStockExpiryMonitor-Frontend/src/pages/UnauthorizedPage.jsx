import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage({ userRole = "Pharmacist" }) {
  return (
    <div className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div className="panel" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "40px 28px" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "10px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px"
          }}
        >
          <ShieldAlert size={30} />
        </div>

        <div style={{ fontSize: "11px", fontWeight: "700", color: "#dc2626", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
          Error 403 • Access Restricted
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
          Authorization Required
        </h1>

        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: "1.5" }}>
          You do not have administrative permissions to view or configure User & Security Role Governance. Your current active role is <b>{userRole}</b>.
        </p>

        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 24px" }}>
          If you require access to security governance, please consult your pharmacy system administrator.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            className="btn btn-light"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
            <Home size={14} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
