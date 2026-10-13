import React from "react";

/**
 * StatusBadge component for rendering active/inactive status,
 * alert classifications, and risk indicators.
 */
export default function StatusBadge({ status, label, variant, className = "" }) {
  // Determine variant automatically if not provided explicitly
  let computedVariant = variant || "neutral";
  let displayLabel = label;

  if (status === true || status === "active" || status === "Active") {
    computedVariant = variant || "success";
    displayLabel = label || "Active";
  } else if (status === false || status === "inactive" || status === "Inactive") {
    computedVariant = variant || "neutral";
    displayLabel = label || "Inactive";
  } else if (status === "resolved" || status === "Resolved") {
    computedVariant = variant || "success";
    displayLabel = label || "Resolved";
  } else if (status === "unresolved" || status === "Unresolved") {
    computedVariant = variant || "danger";
    displayLabel = label || "Unresolved";
  } else if (status === "expired" || status === "Expired") {
    computedVariant = variant || "danger";
    displayLabel = label || "Expired";
  } else if (status === "near-expiry" || status === "Near Expiry") {
    computedVariant = variant || "warning";
    displayLabel = label || "Near Expiry";
  } else if (status === "low-stock" || status === "Low Stock") {
    computedVariant = variant || "warning";
    displayLabel = label || "Low Stock";
  }

  return (
    <span className={`status-badge badge-${computedVariant} ${className}`}>
      <span className="badge-dot" />
      {displayLabel || String(status)}
    </span>
  );
}
