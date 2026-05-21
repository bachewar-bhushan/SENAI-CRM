import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../../config/env';
import { useAnalyticsStore } from '../../store/analyticsStore';

export const SentimentChart = () => {
  const { sentimentTrend } = useAnalyticsStore();
  const [selectedSender, setSelectedSender] = useState('all');
  const [senders, setSenders] = useState([]);
  const [filteredTrend, setFilteredTrend] = useState([]);

  // Fetch list of senders
  useEffect(() => {
    fetchSenders();
  }, []);

  // Filter sentiment trend by sender
  useEffect(() => {
    if (selectedSender === 'all') {
      setFilteredTrend(sentimentTrend);
    } else {
      setFilteredTrend(sentimentTrend.filter(item => item.sender === selectedSender));
    }
  }, [selectedSender, sentimentTrend]);

  const fetchSenders = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/analytics/sentiment-trend`);
      if (response.data.success && response.data.data) {
        const uniqueSenders = [...new Set(response.data.data.map(item => item.sender))].filter(Boolean);
        setSenders(uniqueSenders);
      }
    } catch (err) {
      console.error('Failed to fetch senders:', err);
    }
  };

  if (!filteredTrend || filteredTrend.length === 0) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg text-center text-gray-500">
        <FiTrendingUp size={40} className="mx-auto mb-3 opacity-50" />
        <p>No sentiment data available</p>
      </div>
    );
  }

  const data = filteredTrend.map((item) => ({
    date: item.date ? new Date(item.date).toLocaleDateString() : 'N/A',
    sentiment: Math.round((item.average_sentiment || 0) * 100) / 100,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-900">
            Sentiment Trend
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600">Filter by Sender:</label>
          <select
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Senders</option>
            {senders.map(sender => (
              <option key={sender} value={sender}>
                {sender}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs font-medium text-gray-500">30 days</span>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" dark="#374151" />
            <XAxis dataKey="date" stroke="#6b7280" dark="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" dark="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
              formatter={(value) => value.toFixed(2)}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Sentiment Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
