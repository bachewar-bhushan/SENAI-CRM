import { FiMail } from 'react-icons/fi';
import { useCrmStore } from '../../store/crmStore';
import { Loader } from '../shared/Loader';

export const ThreadList = () => {
  const { threads, activeThreadId, setActiveThreadId, loading } = useCrmStore();

  if (loading) return <Loader />;

  if (!threads || threads.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FiMail size={40} className="mx-auto mb-3 opacity-50" />
        <p>No threads found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => setActiveThreadId(thread.id)}
          className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
            activeThreadId === thread.id
              ? 'border-blue-600 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-blue-400'
          }`}
        >
          <div className="flex items-start gap-3">
            <FiMail className={`flex-shrink-0 mt-0.5 ${
              activeThreadId === thread.id
                ? 'text-blue-600'
                : 'text-gray-400'
            }`} size={18} />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {thread.sender_email}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {thread.last_updated_at
                  ? new Date(thread.last_updated_at).toLocaleDateString()
                  : 'No date'}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
