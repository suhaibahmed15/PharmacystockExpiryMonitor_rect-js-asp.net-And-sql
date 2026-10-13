import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function NotFoundPage({ isUnauthorized = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAccessDenied = isUnauthorized || location.pathname.toLowerCase().includes("unauthorized");
  const isArchive = location.pathname.toLowerCase().includes("archive");

  return (
    <div className="container not-found-container" style={{ textAlign: "center", padding: "60px 20px" }}>
      <div
        className="panel"
        style={{
          maxWidth: "520px",
          margin: "0 auto",
          padding: "36px 28px",
          textAlign: "center"
        }}
      >
        <div
          style={{
            fontSize: "56px",
            fontWeight: "800",
            color: isAccessDenied ? "#dc2626" : "#0284c7",
            marginBottom: "8px",
            lineHeight: 1
          }}
        >
          {isAccessDenied ? "403" : "404"}
        </div>

        <h2 style={{ marginTop: 0, marginBottom: "10px", fontSize: "20px" }}>
          {isAccessDenied
            ? "Access Restricted / Unauthorized"
            : isArchive
            ? "Archive Records - Not Found"
            : "Page Not Found (404)"}
        </h2>

        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
          {isAccessDenied ? (
            <>
              You do not possess the required authorization permissions to access{" "}
              <code>{location.pathname}</code>. Only administrators can perform this action.
            </>
          ) : isArchive ? (
            <>
              The requested Archive page route (<code>{location.pathname}</code>) could not be found.
              Archived historical records have not been published.
            </>
          ) : (
            <>
              The route <code>{location.pathname}</code> could not be found or does not exist in this application.
            </>
          )}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
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
