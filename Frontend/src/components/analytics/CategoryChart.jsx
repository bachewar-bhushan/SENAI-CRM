import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiBarChart2 } from 'react-icons/fi';
import { useAnalyticsStore } from '../../store/analyticsStore';

export const CategoryChart = () => {
  const { categoryBreakdown } = useAnalyticsStore();

  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg text-center text-gray-500">
        <FiBarChart2 size={40} className="mx-auto mb-3 opacity-50" />
        <p>No category data available</p>
      </div>
    );
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const data = categoryBreakdown.map((item) => ({
    category: item.category || 'Unknown',
    count: item.total || 0,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <FiBarChart2 className="text-cyan-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-900">
          Email Categories
        </h3>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" dark="#374151" />
            <XAxis dataKey="category" stroke="#6b7280" dark="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" dark="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Count">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
