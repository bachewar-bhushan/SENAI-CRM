import { useState, useEffect } from 'react';
import { FiBook, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../../config/env';
import { useCrmStore } from '../../store/crmStore';

export const RAGContextPanel = () => {
  const { threads, activeThreadId } = useCrmStore();
  const [chunks, setChunks] = useState([]);
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
      fetchRAGContext(emailId);
    }
  }, [activeThreadId, threads]);

  const fetchRAGContext = async (emailId) => {
    if (!emailId) return;

    try {
      setLoading(true);
      setError(null);

      // Get the email to extract subject for search query
      const emailResponse = await axios.get(`${BACKEND_URL}/api/status/${emailId}`);

      if (emailResponse.data.success) {
        // Search knowledge base with the email subject
        const searchResponse = await axios.get(
          `${BACKEND_URL}/rag/search`,
          { params: { q: emailResponse.data.data.message || 'policy' } }
        );

        if (searchResponse.data.success) {
          setChunks(searchResponse.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch RAG context:', err);
      // Don't show error for RAG failures, it's optional
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
        className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 cursor-pointer hover:from-amber-100 hover:to-orange-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <FiBook className="text-amber-600" size={20} />
          <h3 className="text-lg font-semibold text-slate-900">Knowledge Base Context</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            fetchRAGContext(emailId);
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
              <FiRefreshCw className="animate-spin text-amber-600 mr-2" size={20} />
              <span className="text-slate-600">Searching knowledge base...</span>
            </div>
          )}

          {!loading && chunks.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-amber-900 text-sm">
                      📚 {chunk.source_doc || 'Knowledge Base'}
                    </p>
                    {chunk.similarity_score && (
                      <span className="text-xs font-medium text-amber-700 bg-white px-2 py-1 rounded">
                        Match: {(chunk.similarity_score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {chunk.chunk_text?.substring(0, 200)}...
                  </p>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="text-slate-500 text-sm">
                No relevant knowledge base entries found for this email.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
};
