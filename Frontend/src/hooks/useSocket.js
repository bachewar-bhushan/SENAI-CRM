import { useEffect } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config/env';
import { useAnalyticsStore } from '../store/analyticsStore';

export const useSocket = () => {
  const { pushToLiveFeed, stats, setStats } = useAnalyticsStore();

  useEffect(() => {
    try {
      const socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('email:new', (email) => {
        pushToLiveFeed({
          id: email.id || Date.now(),
          from: email.sender,
          subject: email.subject,
          timestamp: new Date(email.timestamp).toLocaleTimeString(),
        });
        setStats(prev => ({ ...prev, pending: (prev.pending || 0) + 1 }));
      });

      socket.on('connect', () => {
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      console.warn('Socket connection not available:', err.message);
    }
  }, [pushToLiveFeed, setStats]);
};
