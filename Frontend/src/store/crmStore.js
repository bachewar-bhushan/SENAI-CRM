import { create } from 'zustand';

export const useCrmStore = create((set) => ({
  selectedEmail: null,
  contact: null,
  threads: [],
  activeThreadId: null,
  loading: false,
  error: null,

  setSelectedEmail: (email) => set({ selectedEmail: email }),
  setContact: (contact) => set({ contact }),
  setThreads: (threads) => set({ threads }),
  setActiveThreadId: (threadId) => set({ activeThreadId: threadId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
