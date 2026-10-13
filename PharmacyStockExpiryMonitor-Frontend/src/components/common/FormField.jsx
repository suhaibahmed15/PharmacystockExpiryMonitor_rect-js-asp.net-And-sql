import React from "react";

export default function FormField({
  label,
  required = false,
  error = "",
  hint = "",
  children,
  className = ""
}) {
  return (
    <div className={`form-group ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label className="form-label">
          {label} {required && <span className="text-required">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
}
