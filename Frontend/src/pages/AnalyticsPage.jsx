import { FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAnalyticsStore } from '../store/analyticsStore';
import { StatCard } from '../components/analytics/StatCard';
import { SentimentChart } from '../components/analytics/SentimentChart';
import { CategoryChart } from '../components/analytics/CategoryChart';
import { LiveFeed } from '../components/analytics/LiveFeed';
import { AtRiskAccountsPanel } from '../components/analytics/AtRiskAccountsPanel';
import { AgentPerformanceCard } from '../components/analytics/AgentPerformanceCard';
import { Loader } from '../components/shared/Loader';

export const AnalyticsPage = () => {
  useAnalytics();
  const { stats, loading, error } = useAnalyticsStore();

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <FiTrendingUp size={20} />
            Real-time insights and performance metrics
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg mb-6 flex items-center gap-2">
            <FiAlertCircle size={20} />
            {error}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : (
          <>
            {/* Stats Row */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 px-2">Key Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Pending" value={stats.pending} color="blue" />
                <StatCard label="Replied" value={stats.replied} color="green" />
                <StatCard label="Escalated" value={stats.escalated} color="red" />
                <StatCard label="Critical" value={stats.critical} color="cyan" />
                <StatCard label="Spam" value={stats.spam} color="yellow" />
              </div>
            </div>

            {/* Charts and Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-2">
                <div className="glass-panel overflow-hidden">
                  <div className="p-6">
                    <SentimentChart />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="glass-panel overflow-hidden">
                  <div className="p-6">
                    <CategoryChart />
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Performance and At-Risk Accounts */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentPerformanceCard />
              <AtRiskAccountsPanel />
            </div>

            {/* Live Feed Below Charts */}
            <div className="mt-6">
              <div className="glass-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-xl font-semibold text-slate-900">Live Activity Feed</h2>
                </div>
                <div className="p-6">
                  <LiveFeed />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
