import { useState } from 'react';
import { FiSend, FiAlertCircle } from 'react-icons/fi';
import { useCrmStore } from '../../store/crmStore';
import { respondToEmail } from '../../api/threads.api';
import { validateReply } from '../../validators/reply.validator';

export const ReplyComposer = () => {
  const { threads, activeThreadId, setError, setLoading } = useCrmStore();
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeEmail = activeThread?.emails?.[activeThread.emails.length - 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const validationError = validateReply(message);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    if (!activeEmail?.id) {
      setLocalError('No email selected');
      return;
    }

    try {
      setIsSubmitting(true);
      await respondToEmail(activeEmail.id, message);
      setMessage('');
    } catch (err) {
      setLocalError(err.message || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeEmail) {
    return (
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-center border-2 border-dashed border-blue-300">
        <p className="text-gray-600 font-medium">Select an email to reply</p>
      </div>
    );
  }

  const charCount = message.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply (minimum 10 characters)..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-medium">
          {charCount} chars
        </div>
      </div>

      {localError && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
          <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-red-700 text-sm">{localError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
      >
        <FiSend size={20} />
        {isSubmitting ? 'Sending...' : 'Send Reply'}
      </button>
    </form>
  );
};
