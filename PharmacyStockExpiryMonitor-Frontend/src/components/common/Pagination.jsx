import React from "react";
import { PAGE_SIZE_OPTIONS } from "../../utils/constants";

export default function Pagination({
  page = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  function getPageNumbers() {
    const pages = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span>
          Showing <b>{startItem}</b>–<b>{endItem}</b> of <b>{totalCount}</b> entries
        </span>

        {onPageSizeChange && (
          <div className="page-size-selector">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="btn-page-nav"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          title="First Page"
          aria-label="First Page"
        >
          «
        </button>

        <button
          type="button"
          className="btn-page-nav"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title="Previous Page"
          aria-label="Previous Page"
        >
          ‹
        </button>

        {pageNumbers[0] > 1 && (
          <>
            <button
              type="button"
              className={`page-num ${page === 1 ? "active" : ""}`}
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span className="page-ellipsis">…</span>}
          </>
        )}

        {pageNumbers.map((num) => (
          <button
            type="button"
            key={num}
            className={`page-num ${page === num ? "active" : ""}`}
            onClick={() => onPageChange(num)}
          >
            {num}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="page-ellipsis">…</span>
            )}
            <button
              type="button"
              className={`page-num ${page === totalPages ? "active" : ""}`}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="btn-page-nav"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Next Page"
          aria-label="Next Page"
        >
          ›
        </button>

        <button
          type="button"
          className="btn-page-nav"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Last Page"
          aria-label="Last Page"
        >
          »
        </button>
      </div>
    </div>
  );
}
