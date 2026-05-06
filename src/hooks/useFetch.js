/**
 * Generic data-fetching hook with loading, error, and fallback states.
 * Usage: const { data, loading, error, refetch } = useFetch(fn, fallback, deps)
 */
import { useState, useEffect, useCallback } from "react";
import { showToast } from "../data";

export function useFetch(fetchFn, fallback = null, deps = []) {
  const [data,    setData]    = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result?.data ?? result);
    } catch (err) {
      setError(err.message);
      // Fall back to static data silently (so UI still works offline)
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}
