import React from "react";
import { Link } from "react-router-dom";

export default function StatCard({
  title,
  value,
  linkTo,
  linkLabel = "View Details",
  color = "#0284c7",
  icon = null,
  subtitle = null,
  className = ""
}) {
  const content = (
    <div className={`stat-card-inner ${className}`}>
      <div className="stat-card-header">
        <h4 className="stat-card-title">{title}</h4>
        {icon && <div className="stat-card-icon" style={{ color }}>{icon}</div>}
      </div>
      <div className="stat-card-value" style={{ color }}>
        {value}
      </div>
      {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      {linkTo && <div className="stat-card-link-text">{linkLabel} &rarr;</div>}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="card-item stat-card">
        {content}
      </Link>
    );
  }

  return <div className="card-item stat-card">{content}</div>;
}
