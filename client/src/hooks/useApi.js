import { useState, useCallback } from 'react';

/**
 * Lightweight fetch wrapper for API calls.
 * Returns { data, loading, error, request }.
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
      });
      const data = await res.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { loading, error, request };
}
