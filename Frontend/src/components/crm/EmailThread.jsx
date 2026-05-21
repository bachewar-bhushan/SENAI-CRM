import { FiAlertCircle, FiTag } from 'react-icons/fi';
import { useCrmStore } from '../../store/crmStore';

const SentimentDot = ({ sentiment_score }) => {
  if (sentiment_score === undefined) return null;

  let color = 'bg-gray-400';
  if (sentiment_score > 0.3) color = 'bg-green-500';
  else if (sentiment_score < -0.3) color = 'bg-red-500';
  else color = 'bg-yellow-500';

  return (
    <span className={`inline-block w-3 h-3 rounded-full ${color}`} title={`Sentiment: ${(sentiment_score * 100).toFixed(0)}%`} />
  );
};

const highlightEntities = (text) => {
  if (!text) return text;

  // Match: monetary amounts ($X,XXX or $X.XX), ticket IDs (#XXXX), emails
  const patterns = [
    { regex: /\$[\d,]+(?:\.\d{2})?/g, className: 'bg-blue-100 text-blue-800 font-semibold' },
    { regex: /#\d+/g, className: 'bg-purple-100 text-purple-800 font-semibold' },
    { regex: /[\w.-]+@[\w.-]+\.\w+/g, className: 'bg-green-100 text-green-800 font-semibold' },
  ];

  let parts = [{ text, isEntity: false }];

  patterns.forEach(({ regex, className }) => {
    const newParts = [];
    parts.forEach(part => {
      if (part.isEntity) {
        newParts.push(part);
        return;
      }

      const matches = [];
      let lastIndex = 0;
      let match;
      const tempRegex = new RegExp(regex.source, 'g');

      while ((match = tempRegex.exec(part.text))) {
        if (match.index > lastIndex) {
          newParts.push({ text: part.text.substring(lastIndex, match.index), isEntity: false });
        }
        newParts.push({ text: match[0], isEntity: true, className });
        lastIndex = tempRegex.lastIndex;
      }

      if (lastIndex < part.text.length) {
        newParts.push({ text: part.text.substring(lastIndex), isEntity: false });
      }
    });
    parts = newParts;
  });

  return parts;
};

const HighlightedText = ({ text }) => {
  const parts = highlightEntities(text);
  return (
    <span>
      {parts.map((part, idx) =>
        part.isEntity ? (
          <span key={idx} className={`px-1 rounded ${part.className}`}>
            {part.text}
          </span>
        ) : (
          <span key={idx}>{part.text}</span>
        )
      )}
    </span>
  );
};

const UrgencyBadge = ({ urgency }) => {
  const config = {
    Critical: { bg: 'bg-red-100', text: 'text-red-700', icon: '🔴' },
    High: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🟠' },
    Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🟡' },
    Low: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔵' },
  };
  const cfg = config[urgency] || config.Medium;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border border-current/20`}>
      {cfg.icon} {urgency}
    </span>
  );
};

const CategoryBadge = ({ category }) => (
  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-300">
    <FiTag className="inline mr-1" size={12} />
    {category}
  </span>
);

const StatusBadge = ({ status }) => {
  const config = {
    'Replied': { bg: 'bg-green-100', text: 'text-green-700' },
    'Escalated': { bg: 'bg-red-100', text: 'text-red-700' },
    'Pending': { bg: 'bg-blue-100', text: 'text-blue-700' },
  };
  const cfg = config[status] || config.Pending;
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
      {status}
    </span>
  );
};

export const EmailThread = () => {
  const { threads, activeThreadId } = useCrmStore();

  const activeThread = threads.find((t) => t.id === activeThreadId);

  if (!activeThread) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FiAlertCircle size={40} className="mx-auto mb-3 opacity-50" />
        <p>Select a thread to view emails</p>
      </div>
    );
  }

  const emails = activeThread.emails || [];

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {emails.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No emails in this thread</p>
        </div>
      ) : (
        emails.map((email) => (
          <div
            key={email.id}
            className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
          >
            <div className="mb-3 flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 flex-1">
                <SentimentDot sentiment_score={email.sentiment_score} />
                <h5 className="font-semibold text-gray-900 text-sm flex-1">
                  {email.subject || 'No Subject'}
                </h5>
              </div>
              {email.status && (
                <StatusBadge status={email.status} />
              )}
            </div>
            <p className="text-gray-600 text-xs mb-3 flex items-center gap-1">
              📅 {email.timestamp
                ? new Date(email.timestamp).toLocaleString()
                : 'No timestamp'}
            </p>
            <p className="text-gray-800 text-sm mb-4 max-h-20 overflow-hidden leading-relaxed">
              <HighlightedText text={email.body} />
            </p>
            <div className="flex gap-2 flex-wrap">
              {email.urgency && <UrgencyBadge urgency={email.urgency} />}
              {email.category && <CategoryBadge category={email.category} />}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
