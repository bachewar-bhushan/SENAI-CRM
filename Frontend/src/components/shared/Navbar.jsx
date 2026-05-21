import { Link, useLocation } from 'react-router-dom';
import { FiUsers, FiTrendingUp, FiGrid, FiMail } from 'react-icons/fi';

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-slate-900 font-bold text-2xl hover:opacity-90 transition-opacity"
          >
            <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 grid place-items-center shadow-md shadow-blue-500/20">
              <FiGrid size={20} className="text-white" />
            </span>
            <span className="tracking-tight">SenAi</span>
          </Link>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isActive('/')
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <FiUsers size={20} />
              <span>CRM</span>
            </Link>
            <Link
              to="/inbox"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isActive('/inbox')
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <FiMail size={20} />
              <span>Inbox</span>
            </Link>
            <Link
              to="/analytics"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                isActive('/analytics')
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <FiTrendingUp size={20} />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
