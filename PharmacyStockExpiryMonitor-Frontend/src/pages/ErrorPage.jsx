import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error = "An unexpected service error occurred while processing your inventory request.",
  onReset
}) {
  return (
    <div className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div className="panel" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "40px 28px" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "10px",
            backgroundColor: "#fef3c7",
            color: "#d97706",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px"
          }}
        >
          <AlertTriangle size={30} />
        </div>

        <div style={{ fontSize: "11px", fontWeight: "700", color: "#d97706", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
          System Notice • Service Error
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
          Temporary System Issue
        </h1>

        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px", lineHeight: "1.5" }}>
          {typeof error === "string" ? error : error?.message || "An unexpected error occurred while communicating with the inventory service."}
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            className="btn btn-light"
            onClick={onReset || (() => window.location.reload())}
          >
            <RefreshCw size={14} /> Retry Operation
          </button>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: "none" }}>
            <Home size={14} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
