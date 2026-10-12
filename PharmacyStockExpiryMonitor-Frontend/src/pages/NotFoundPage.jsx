import React from "react";
import { Link } from "react-router-dom";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div className="panel" style={{ maxWidth: "500px", width: "100%", textAlign: "center", padding: "40px 28px" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "10px",
            backgroundColor: "#f1f5f9",
            color: "#64748b",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px"
          }}
        >
          <FileQuestion size={30} />
        </div>

        <div style={{ fontSize: "11px", fontWeight: "700", color: "#0284c7", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
          Error 404 • Not Found
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px" }}>
          Resource or Record Not Located
        </h1>

        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px", lineHeight: "1.5" }}>
          The requested pharmacy record, batch detail, or navigation route could not be found on this system. It may have been archived, transferred, or does not exist.
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
