import { useState } from 'react';
import { FiCpu, FiSend, FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../../config/env';
import { useCrmStore } from '../../store/crmStore';

export const ActionButtons = () => {
  const { threads, activeThreadId } = useCrmStore();
  const [loading, setLoading] = useState(null);
  const [message, setMessage] = useState(null);

  // Get the first email ID from the active thread
  const getEmailId = () => {
    if (!activeThreadId) return null;
    const activeThread = threads.find(t => t.id === activeThreadId);
    if (!activeThread || !activeThread.emails || activeThread.emails.length === 0) return null;
    return activeThread.emails[0].id;
  };

  const handleAction = async (action) => {
    const emailId = getEmailId();
    if (!emailId) {
      setMessage({
        type: 'error',
        text: 'Please select an email thread first',
      });
      return;
    }

    try {
      setLoading(action);
      setMessage(null);

      switch (action) {
        case 'run-agent':
          await axios.post(`${BACKEND_URL}/agent/run/${emailId}`);
          setMessage({ type: 'success', text: 'Agent executed successfully' });
          break;

        case 'approve':
          await axios.post(`${BACKEND_URL}/drafts/${emailId}/approve`, {
            approved_by: 'user',
          });
          setMessage({ type: 'success', text: 'Draft approved and sent' });
          break;

        case 'escalate':
          await axios.post(`${BACKEND_URL}/agent/escalate`, {
            emailId: emailId,
            reason: 'Manual escalation',
            priority: 'High',
          });
          setMessage({ type: 'success', text: 'Email escalated for human review' });
          break;

        case 'spam':
          await axios.patch(`${BACKEND_URL}/contacts/${emailId}/status`, {
            category: 'Spam',
            status: 'Spam',
          });
          setMessage({ type: 'success', text: 'Email marked as spam' });
          break;

        default:
          break;
      }
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
      setMessage({
        type: 'error',
        text: `Failed to ${action.replace('-', ' ')}. ${err.response?.data?.message || ''}`,
      });
    } finally {
      setLoading(null);
    }
  };

  if (!activeThreadId) {
    return null;
  }

  return (
    <div className="glass-panel p-6">
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-300'
              : 'bg-red-50 text-red-700 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction('run-agent')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium text-sm transition-colors"
        >
          <FiCpu size={18} />
          Run Agent
        </button>

        <button
          onClick={() => handleAction('approve')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm transition-colors"
        >
          <FiSend size={18} />
          Approve & Send
        </button>

        <button
          onClick={() => handleAction('escalate')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium text-sm transition-colors"
        >
          <FiAlertTriangle size={18} />
          Escalate
        </button>

        <button
          onClick={() => handleAction('spam')}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium text-sm transition-colors"
        >
          <FiTrash2 size={18} />
          Mark Spam
        </button>
      </div>
    </div>
  );
};
