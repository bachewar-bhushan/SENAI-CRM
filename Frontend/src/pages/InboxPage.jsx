import { useState, useEffect } from 'react';
import { FiMail, FiFilter, FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../config/env';

const TABS = {
  ALL: 'all',
  NEEDS_HUMAN: 'needs_human',
  AUTO_REPLIED: 'auto_replied',
  ESCALATED: 'escalated',
  SPAM: 'spam',
};

const TAB_LABELS = {
  all: 'All',
  needs_human: 'Needs Human',
  auto_replied: 'Auto-Replied',
  escalated: 'Escalated',
  spam: 'Spam',
};

const SENTIMENT_COLORS = {
  positive: 'bg-green-100 text-green-800',
  negative: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
  mixed: 'bg-yellow-100 text-yellow-800',
};

const URGENCY_COLORS = {
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800',
};

export const InboxPage = () => {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Fetch emails on mount
  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/analytics/all-emails`);
      if (response.data.success) {
        setEmails(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setError('Failed to load emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter emails based on active tab, search query, and date range
  useEffect(() => {
    let filtered = emails;

    // Filter by tab
    switch (activeTab) {
      case TABS.NEEDS_HUMAN:
        filtered = filtered.filter(e => e.requires_human === true);
        break;
      case TABS.AUTO_REPLIED:
        filtered = filtered.filter(e => e.status === 'Replied');
        break;
      case TABS.ESCALATED:
        filtered = filtered.filter(e => e.urgency === 'Critical' || e.urgency === 'High');
        break;
      case TABS.SPAM:
        filtered = filtered.filter(e => e.category === 'Spam');
        break;
      case TABS.ALL:
      default:
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          (e.subject?.toLowerCase().includes(query) ||
          e.body?.toLowerCase().includes(query) ||
          e.sender?.toLowerCase().includes(query))
      );
    }

    // Filter by date range
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(e => {
        const emailDate = new Date(e.timestamp);
        if (dateRange.start && emailDate < new Date(dateRange.start)) return false;
        if (dateRange.end && emailDate > new Date(dateRange.end)) return false;
        return true;
      });
    }

    setFilteredEmails(filtered);
  }, [emails, activeTab, searchQuery, dateRange]);

  const getSentimentLabel = (score) => {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    if (Math.abs(score) < 0.1) return 'neutral';
    return 'mixed';
  };

  const toggleThreadExpansion = (threadId) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
    }
    setExpandedThreads(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FiMail className="text-purple-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mission Control Inbox</h1>
            <p className="text-slate-600">Intelligent email triage and analysis</p>
          </div>
        </div>
        <button
          onClick={fetchEmails}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search emails by subject, body, or sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => setDateRange({ start: '', end: '' })}
              className="self-end px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg"
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {Object.entries(TAB_LABELS).map(([key, label]) => {
          let emailCount = 0;

          if (emails && emails.length > 0) {
            emailCount = emails.filter(e => {
              switch (key) {
                case 'needs_human':
                  return e.requires_human === true;
                case 'auto_replied':
                  return e.status === 'Replied';
                case 'escalated':
                  return e.urgency === 'Critical' || e.urgency === 'High';
                case 'spam':
                  return e.category === 'Spam';
                default:
                  return true;
              }
            }).length;
          }

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {label} ({emailCount})
            </button>
          );
        })}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-start gap-3">
          <FiAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <FiRefreshCw className="animate-spin text-purple-600 mr-2" size={24} />
          <span className="text-slate-600">Loading emails...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEmails.length === 0 && (
        <div className="text-center py-12">
          <FiMail size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No emails found in this view</p>
        </div>
      )}

      {/* Thread-Grouped Email List */}
      {!loading && filteredEmails.length > 0 && (
        <div className="space-y-2">
          {(() => {
            const threadMap = new Map();
            filteredEmails.forEach(email => {
              const threadId = email.thread_id || email.id;
              if (!threadMap.has(threadId)) {
                threadMap.set(threadId, []);
              }
              threadMap.get(threadId).push(email);
            });

            return Array.from(threadMap.entries()).map(([threadId, threadEmails]) => {
              const isExpanded = expandedThreads.has(threadId);
              const firstEmail = threadEmails[0];

              return (
                <div
                  key={threadId}
                  className="bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Thread Header Row */}
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleThreadExpansion(threadId)}
                  >
                    <span className="text-slate-600 font-bold">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-slate-900 flex-1">
                          {firstEmail.subject}
                        </p>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {threadEmails.length} email{threadEmails.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex gap-2">
                          {firstEmail.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                              {firstEmail.category}
                            </span>
                          )}
                          {firstEmail.sentiment_score !== undefined && (
                            <span className={`px-2 py-1 text-xs font-medium rounded ${SENTIMENT_COLORS[getSentimentLabel(firstEmail.sentiment_score)]}`}>
                              {getSentimentLabel(firstEmail.sentiment_score)}
                            </span>
                          )}
                          {firstEmail.urgency && (
                            <span className={`px-2 py-1 text-xs font-medium rounded ${URGENCY_COLORS[firstEmail.urgency]}`}>
                              {firstEmail.urgency}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Thread Summary */}
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">From:</span> {firstEmail.sender}
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500">
                            {new Date(firstEmail.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Thread Emails */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3 max-h-96 overflow-y-auto">
                      {threadEmails.map((email) => (
                        <div key={email.id} className="p-3 bg-white rounded border border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-slate-900 text-sm">{email.sender}</p>
                            <span className="text-xs text-slate-500">
                              {new Date(email.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                            {email.body}
                          </p>
                          {email.requires_human && (
                            <span className="inline-block mt-2 px-2 py-1 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-xs">
                              ⚠️ Needs Human Review
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && filteredEmails.length > 0 && (
        <div className="text-sm text-slate-600 text-center py-4">
          {(() => {
            const uniqueThreads = new Set(filteredEmails.map(e => e.thread_id || e.id)).size;
            return `Showing ${filteredEmails.length} emails in ${uniqueThreads} thread${uniqueThreads > 1 ? 's' : ''}`;
          })()}
        </div>
      )}
    </div>
  );
};
