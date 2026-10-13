import React from "react";
import Loader from "./Loader";
import Pagination from "./Pagination";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "No records found.",
  sortBy = "",
  sortDirection = "asc",
  onSort = null,
  pagination = null, // { page, pageSize, totalCount, onPageChange, onPageSizeChange }
  className = ""
}) {
  return (
    <div className={`data-table-wrapper ${className}`}>
      <div className="table-container">
        <table className="simple-table data-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortBy === col.key;
                const canSort = col.sortable && onSort;

                return (
                  <th
                    key={col.key || col.header}
                    style={{ width: col.width }}
                    className={canSort ? "sortable-th" : ""}
                    onClick={canSort ? () => onSort(col.key) : undefined}
                  >
                    <div className="th-content">
                      <span>{col.header}</span>
                      {canSort && (
                        <span className="sort-indicator">
                          {isSorted ? (sortDirection === "asc" ? " ▲" : " ▼") : " ⇅"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "30px" }}>
                  <Loader message="Loading data..." centered={false} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: "center", padding: "32px", color: "#64748b" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map((col) => (
                    <td key={col.key || col.header}>
                      {col.render ? col.render(row, index) : row[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          pageSizeOptions={pagination.pageSizeOptions}
        />
      )}
    </div>
  );
}
