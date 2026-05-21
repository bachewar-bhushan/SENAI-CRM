import { useEffect } from 'react';
import { useCrmStore } from '../store/crmStore';
import { getThreads } from '../api/threads.api';

export const useThreads = (email) => {
  const { setThreads, setLoading, setError, clearError } = useCrmStore();

  useEffect(() => {
    if (!email) {
      setThreads([]);
      return;
    }

    const fetchThreads = async () => {
      try {
        clearError();
        setLoading(true);
        const threads = await getThreads(email);
        setThreads(threads || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch threads');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [email, setThreads, setLoading, setError, clearError]);
};
