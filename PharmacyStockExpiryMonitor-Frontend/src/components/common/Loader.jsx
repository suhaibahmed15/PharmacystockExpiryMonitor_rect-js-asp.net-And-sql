import React from "react";

export default function Loader({ message = "Loading data...", size = "medium", centered = true }) {
  const content = (
    <div className={`loader-container loader-${size}`}>
      <div className="spinner" />
      {message && <p className="loader-text">{message}</p>}
    </div>
  );

  if (centered) {
    return <div className="loader-centered-wrapper">{content}</div>;
  }

  return content;
}
