import { useEffect } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore';
import { getDashboardStats, getSentimentTrend, getCategoryBreakdown } from '../api/analytics.api';

export const useAnalytics = () => {
  const { setStats, setSentimentTrend, setCategoryBreakdown, setLoading, setError, clearError } =
    useAnalyticsStore();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        clearError();
        setLoading(true);
        const [stats, sentiment, categories] = await Promise.all([
          getDashboardStats(),
          getSentimentTrend('', 30),
          getCategoryBreakdown(),
        ]);
        setStats(stats);
        setSentimentTrend(sentiment);
        setCategoryBreakdown(categories);
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [setStats, setSentimentTrend, setCategoryBreakdown, setLoading, setError, clearError]);
};
