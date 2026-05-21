import { useState, useEffect } from 'react';
import { FiCpu, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../../config/env';

export const AgentDemo = () => {
  const [demoEmails, setDemoEmails] = useState([]);
  const [emailId, setEmailId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loadingEmails, setLoadingEmails] = useState(true);

  // Fetch demo emails on mount
  useEffect(() => {
    const fetchDemoEmails = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/agent/demo-emails`);
        if (response.data.success) {
          setDemoEmails(response.data.data);
          if (response.data.data.length > 0) {
            setEmailId(response.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch demo emails:', err);
        setError('Failed to load demo emails. Make sure backend is running.');
      } finally {
        setLoadingEmails(false);
      }
    };

    fetchDemoEmails();
  }, []);

  const runAgent = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/agent/dry-run/${emailId}`,
        {}
      );

      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run agent. Make sure backend is running on localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    'Critical': 'bg-red-100 text-red-800 border-red-300',
    'High': 'bg-orange-100 text-orange-800 border-orange-300',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Low': 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50">
        <FiCpu className="text-purple-600" size={24} />
        <h2 className="text-xl font-semibold text-slate-900">🤖 AI Agent Demo</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Email Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900">Select Demo Email</label>

          {loadingEmails && (
            <div className="p-3 bg-blue-50 border border-blue-300 text-blue-700 rounded-lg flex items-center gap-2">
              <FiRefreshCw className="animate-spin" size={16} />
              Loading demo emails...
            </div>
          )}

          {!loadingEmails && demoEmails.length === 0 && (
            <div className="p-3 bg-orange-50 border border-orange-300 text-orange-700 rounded-lg">
              No demo emails found. Run: <code className="bg-orange-100 px-2 py-1 rounded text-xs">npm run seed</code>
            </div>
          )}

          <div className="space-y-2">
            {demoEmails.map((email) => (
              <button
                key={email.id}
                onClick={() => setEmailId(email.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  emailId === email.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{email.subject}</p>
                    <p className="text-sm text-slate-600">{email.preview}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${urgencyColors[email.urgency]}`}>
                    {email.urgency}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={runAgent}
          disabled={loading || loadingEmails || !emailId || demoEmails.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FiRefreshCw className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <FiCpu size={20} />
              Run AI Agent
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-start gap-3">
            <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Agent Reasoning */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FiCpu size={18} />
                Agent Reasoning
              </h3>
              <div className="space-y-2">
                {result.reasoning_trace && result.reasoning_trace.map((step, idx) => (
                  <div key={idx} className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>Thought:</strong> {step.thought}
                    </p>
                    <p>
                      <strong>Action:</strong> {step.action}
                    </p>
                    <p>
                      <strong>Observation:</strong> {step.observation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RAG Context */}
            {result.rag_sources_cited && result.rag_sources_cited.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">📚 Knowledge Base Retrieved</h3>
                <div className="space-y-2">
                  {result.rag_sources_cited.map((chunk, idx) => (
                    <div key={idx} className="text-sm text-amber-800 p-2 bg-white rounded border border-amber-100">
                      <p className="font-semibold text-amber-900">{chunk.source_doc || 'Knowledge Base'}</p>
                      <p className="text-xs mt-1">{chunk.chunk_text || chunk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Reply */}
            {result.suggested_reply && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <FiCheckCircle size={18} />
                  AI-Suggested Reply
                </h3>
                <p className="text-sm text-green-800 whitespace-pre-wrap leading-relaxed">
                  {result.suggested_reply}
                </p>
              </div>
            )}

            {/* Decision */}
            <div className={`p-4 rounded-lg border-2 ${
              result.requires_human || result.urgency === 'Critical'
                ? 'bg-red-50 border-red-300'
                : 'bg-green-50 border-green-300'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                result.requires_human || result.urgency === 'Critical'
                  ? 'text-red-900'
                  : 'text-green-900'
              }`}>
                ✓ Recommendation
              </h3>
              <p className={`text-lg font-bold ${
                result.requires_human || result.urgency === 'Critical'
                  ? 'text-red-700'
                  : 'text-green-700'
              }`}>
                {result.requires_human || result.urgency === 'Critical'
                  ? '🔴 Requires Human Review'
                  : '✅ Can Auto-Reply'}
              </p>
            </div>

            {/* Technical Details */}
            <details className="p-3 bg-slate-100 rounded-lg">
              <summary className="font-semibold text-slate-900 cursor-pointer">
                Technical Details (JSON)
              </summary>
              <pre className="mt-3 text-xs bg-slate-800 text-slate-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
