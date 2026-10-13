import { useState, useMemo } from "react";
import { DEFAULT_PAGE_SIZE } from "../utils/constants";

/**
 * Custom hook to manage pagination & sorting state
 */
export function usePagination(initialOptions = {}) {
  const [page, setPage] = useState(initialOptions.initialPage || 1);
  const [pageSize, setPageSize] = useState(
    initialOptions.initialPageSize || DEFAULT_PAGE_SIZE
  );
  const [sortBy, setSortBy] = useState(initialOptions.initialSortBy || "");
  const [sortDirection, setSortDirection] = useState(
    initialOptions.initialSortDirection || "asc" // 'asc' | 'desc'
  );
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
    setPage(1);
  };

  const resetPagination = () => {
    setPage(1);
  };

  // Helper for client-side pagination on an array
  const paginateArray = (items = []) => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  };

  return {
    page,
    setPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    handleSort,
    totalCount,
    setTotalCount,
    totalPages,
    resetPagination,
    paginateArray
  };
}

export default usePagination;
