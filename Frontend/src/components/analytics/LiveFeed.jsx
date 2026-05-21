import { FiActivity, FiMail, FiClock } from 'react-icons/fi';
import { useSocket } from '../../hooks/useSocket';
import { useAnalyticsStore } from '../../store/analyticsStore';

export const LiveFeed = () => {
  useSocket();
  const { liveFeed } = useAnalyticsStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="relative">
          <FiActivity className="text-green-600 animate-pulse" size={24} />
          <span className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Live Activity
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {liveFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FiMail size={40} className="opacity-50 mb-3" />
            <p className="text-sm font-medium">Waiting for live updates...</p>
          </div>
        ) : (
          liveFeed.map((event) => (
            <div
              key={event.id}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow border-l-4 border-l-green-500"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <FiMail className="text-green-600" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {event.from || 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-xs truncate mt-1">
                    {event.subject || 'No subject'}
                  </p>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                    <FiClock size={12} />
                    {event.timestamp}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
