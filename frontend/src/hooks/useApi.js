import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Generic hook for API calls with loading/error state.
 * Usage:
 *   const { execute, loading } = useApi();
 *   await execute(() => createRoom(data), 'Room created!');
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (fn, successMsg = null, errorMsg = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (successMsg) toast.success(successMsg);
      return result;
    } catch (err) {
      const msg = err?.response?.data?.message || errorMsg || 'Something went wrong';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
}
