import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  TrendingUp,
  ShieldCheck,
  Umbrella,
  BarChart3,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Savings Goals', path: '/savings', icon: Target },
  { name: 'Investments', path: '/investments', icon: TrendingUp },
  { name: 'Insurance', path: '/insurance', icon: ShieldCheck },
  { name: 'Emergency Fund', path: '/emergency-fund', icon: Umbrella },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Profile & Settings', path: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
            Savvy Scholar
          </h1>
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mt-1">
            Financial Intelligence
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Financial Management
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group
                ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Student Wisdom Pill */}
      <div className="px-4 py-3 m-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm">
        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Smart Habit</span>
        </div>
        <p className="text-xs text-slate-300 leading-snug">
          "Pay yourself first: save 20% of whatever money you receive."
        </p>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-emerald-200">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Scholar'}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
