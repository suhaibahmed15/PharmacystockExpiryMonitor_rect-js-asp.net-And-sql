import React from "react";

export default function MedicineCell({ code, name, genericName }) {
  return (
    <div className="table-cell-title">
      <div className="table-cell-header">
        {code && <span className="code-badge">{code}</span>}
        <b>{name}</b>
      </div>
      {genericName && <span className="cell-subtitle">{genericName}</span>}
    </div>
  );
}
