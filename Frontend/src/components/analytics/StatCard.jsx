import { FiClock, FiCheckCircle, FiAlertTriangle, FiZap, FiMail } from 'react-icons/fi';

export const StatCard = ({ label, value, color = 'blue' }) => {
  const iconMap = {
    Pending: FiClock,
    Replied: FiCheckCircle,
    Escalated: FiAlertTriangle,
    Critical: FiZap,
    Spam: FiMail,
  };

  const colorConfig = {
    blue: {
      bg: 'from-blue-600 to-blue-700',
      border: 'border-blue-400',
      icon: 'text-blue-200',
    },
    green: {
      bg: 'from-green-600 to-green-700',
      border: 'border-green-400',
      icon: 'text-green-200',
    },
    red: {
      bg: 'from-red-600 to-red-700',
      border: 'border-red-400',
      icon: 'text-red-200',
    },
    cyan: {
      bg: 'from-cyan-600 to-cyan-700',
      border: 'border-cyan-400',
      icon: 'text-cyan-100',
    },
    yellow: {
      bg: 'from-yellow-500 to-yellow-600',
      border: 'border-yellow-400',
      icon: 'text-yellow-100',
    },
  };

  const config = colorConfig[color] || colorConfig.blue;
  const IconComponent = iconMap[label] || FiClock;

  return (
    <div className={`relative p-6 rounded-lg bg-gradient-to-br ${config.bg} border ${config.border} shadow-lg overflow-hidden group hover:shadow-xl transition-shadow`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white/80">{label}</p>
          <IconComponent size={28} className={config.icon} />
        </div>
        <p className="text-4xl font-bold text-white">{value || 0}</p>
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity">
        <IconComponent size={80} className="text-white" />
      </div>
    </div>
  );
};
