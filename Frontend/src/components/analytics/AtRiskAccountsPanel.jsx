import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../../config/env';

export const AtRiskAccountsPanel = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAtRiskAccounts();
  }, []);

  const fetchAtRiskAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query for emails with negative sentiment trends
      const response = await axios.get(`${BACKEND_URL}/analytics/sentiment-trend`);

      if (response.data.success && response.data.data) {
        // Filter for at-risk accounts (negative sentiment or critical urgency)
        const atRisk = response.data.data.filter(
          item =>
            (item.sentiment_score < -0.3 && item.count > 2) ||
            item.urgency === 'Critical'
        );
        setAccounts(atRisk.slice(0, 5)); // Show top 5 at-risk
      }
    } catch (err) {
      console.error('Failed to fetch at-risk accounts:', err);
      // Don't show error, graceful degradation
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center gap-2">
          <FiAlertTriangle className="text-red-600" size={22} />
          <h3 className="text-lg font-semibold text-slate-900">At-Risk Accounts</h3>
        </div>
        <button
          onClick={fetchAtRiskAccounts}
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
            Loading at-risk accounts...
          </div>
        ) : accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account, idx) => (
              <div
                key={idx}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-red-900 text-sm">
                    {account.sender || 'Unknown Sender'}
                  </p>
                  {account.sentiment_score !== undefined && (
                    <span className="text-xs font-medium px-2 py-1 rounded bg-white text-red-800">
                      Sentiment: {(account.sentiment_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-red-800">
                  {account.count || 1} recent emails • Urgency:{' '}
                  <strong>{account.urgency || 'Normal'}</strong>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm py-8">
            No at-risk accounts detected
          </p>
        )}
      </div>
    </div>
  );
};
