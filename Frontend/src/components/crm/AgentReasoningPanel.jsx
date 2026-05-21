import { useState, useEffect } from 'react';
import { FiCpu, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../../config/env';
import { useCrmStore } from '../../store/crmStore';

export const AgentReasoningPanel = () => {
  const { threads, activeThreadId } = useCrmStore();
  const [reasoning, setReasoning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const getEmailId = () => {
    if (!activeThreadId) return null;
    const activeThread = threads.find(t => t.id === activeThreadId);
    if (!activeThread || !activeThread.emails || activeThread.emails.length === 0) return null;
    return activeThread.emails[0].id;
  };

  useEffect(() => {
    const emailId = getEmailId();
    if (emailId) {
      fetchAgentReasoning(emailId);
    }
  }, [activeThreadId, threads]);

  const fetchAgentReasoning = async (emailId) => {
    if (!emailId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${BACKEND_URL}/agent/dry-run/${emailId}`,
        {}
      );

      if (response.data.success) {
        setReasoning(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reasoning:', err);
      setError('Failed to load agent reasoning. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const emailId = getEmailId();

  if (!emailId) {
    return null;
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 cursor-pointer hover:from-purple-100 hover:to-blue-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <FiCpu className="text-purple-600" size={20} />
          <h3 className="text-lg font-semibold text-slate-900">Agent Reasoning</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            fetchAgentReasoning(emailId);
          }}
          disabled={loading}
          className="text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {expanded && (
        <div className="p-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-start gap-2 mb-4">
              <FiAlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <FiRefreshCw className="animate-spin text-purple-600 mr-2" size={20} />
              <span className="text-slate-600">Analyzing email...</span>
            </div>
          )}

          {!loading && reasoning && (
            <div className="space-y-4">
              {reasoning.reasoning_trace && reasoning.reasoning_trace.length > 0 ? (
                reasoning.reasoning_trace.map((step, idx) => (
                  <div key={idx} className="border-l-4 border-purple-400 pl-4 py-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Step {idx + 1}
                    </div>
                    {step.thought && (
                      <p className="text-sm mb-2">
                        <strong className="text-purple-700">Thought:</strong>{' '}
                        <span className="text-slate-700">{step.thought}</span>
                      </p>
                    )}
                    {step.action && (
                      <p className="text-sm mb-2">
                        <strong className="text-blue-700">Action:</strong>{' '}
                        <span className="text-slate-700">{step.action}</span>
                      </p>
                    )}
                    {step.observation && (
                      <p className="text-sm text-slate-600">
                        <strong className="text-green-700">Observation:</strong>{' '}
                        <span>{step.observation.substring(0, 150)}...</span>
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No reasoning available yet.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
