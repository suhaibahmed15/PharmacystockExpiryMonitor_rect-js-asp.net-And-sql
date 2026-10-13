import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isArchive = location.pathname.toLowerCase().includes("archive");

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
        <div style={{ fontSize: "52px", fontWeight: "800", color: "#0284c7", marginBottom: "6px" }}>
          404
        </div>
        <h2 style={{ marginTop: 0, marginBottom: "8px", fontSize: "19px" }}>
          {isArchive ? "Archive Records - 404 Not Found" : "Page Not Found (404)"}
        </h2>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>
          {isArchive ? (
            <>
              The requested Archive page route (<code>{location.pathname}</code>) could not be found.
              Archived historical records have not been published or this section is currently unavailable.
            </>
          ) : (
            <>
              The requested route <code>{location.pathname}</code> could not be found or does not exist.
            </>
          )}
        </p>

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
