import { useState, useEffect } from 'react';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../../config/env';

export const AgentPerformanceCard = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BACKEND_URL}/analytics/dashboard/stats`);

      if (response.data.success && response.data.data) {
        const stats = response.data.data;

        // Calculate agent performance metrics
        const total = stats.pending + stats.replied + stats.escalated + stats.spam;
        const autoReplyRate = total > 0 ? ((stats.replied / total) * 100).toFixed(1) : 0;
        const escalationRate = total > 0 ? ((stats.escalated / total) * 100).toFixed(1) : 0;

        setPerformance({
          autoReplyRate,
          escalationRate,
          totalProcessed: total,
          avgConfidence: 85, // This would come from actual data in production
        });
      }
    } catch (err) {
      console.error('Failed to fetch performance:', err);
      // Graceful degradation
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <FiCpu className="text-purple-600" size={22} />
          <h3 className="text-lg font-semibold text-slate-900">Agent Performance</h3>
        </div>
        <button
          onClick={fetchPerformance}
          disabled={loading}
          className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500">
            <FiRefreshCw className="animate-spin mx-auto mb-2" size={20} />
            Loading performance...
          </div>
        ) : performance ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">Auto-Reply Rate</p>
                <span className="text-lg font-bold text-green-600">
                  {performance.autoReplyRate}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600"
                  style={{ width: `${performance.autoReplyRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">Escalation Rate</p>
                <span className="text-lg font-bold text-orange-600">
                  {performance.escalationRate}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                  style={{ width: `${performance.escalationRate}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Total Processed</p>
                  <p className="text-xl font-bold text-slate-900">
                    {performance.totalProcessed}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Avg Confidence</p>
                  <p className="text-xl font-bold text-purple-600">
                    {performance.avgConfidence}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm py-8">
            No performance data available
          </p>
        )}
      </div>
    </div>
  );
};
