import { create } from 'zustand';

export const useAnalyticsStore = create((set) => ({
  stats: {
    pending: 0,
    replied: 0,
    escalated: 0,
    critical: 0,
    spam: 0,
  },
  sentimentTrend: [],
  categoryBreakdown: [],
  liveFeed: [],
  loading: false,
  error: null,

  setStats: (stats) => set({ stats }),
  setSentimentTrend: (data) => set({ sentimentTrend: data }),
  setCategoryBreakdown: (data) => set({ categoryBreakdown: data }),
  pushToLiveFeed: (event) =>
    set((state) => ({
      liveFeed: [event, ...state.liveFeed].slice(0, 20),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
