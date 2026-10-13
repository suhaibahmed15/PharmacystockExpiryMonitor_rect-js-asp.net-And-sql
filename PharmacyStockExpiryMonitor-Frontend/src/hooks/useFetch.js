import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "../api/axiosClient";

/**
 * Custom hook for data fetching with loading and error states
 * @param {Function} fetchFn - Async function returning data or axios response
 * @param {Array} dependencies - useEffect dependency array (optional)
 * @param {boolean} autoFetch - Whether to run on mount (default: true)
 */
export function useFetch(fetchFn, dependencies = [], autoFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState("");

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchFn(...args);
        const result = response?.data !== undefined ? response.data : response;
        setData(result);
        return { data: result, error: null };
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        return { data: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [fetchFn]
  );

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [...dependencies, autoFetch]);

  return { data, loading, error, execute, setData, setError };
}

export default useFetch;
