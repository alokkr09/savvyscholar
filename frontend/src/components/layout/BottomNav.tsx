import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  BarChart3,
  Menu,
} from 'lucide-react';

const MOBILE_TABS = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Goals', path: '/savings', icon: Target },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export const BottomNav: React.FC<{ onOpenDrawer?: () => void }> = ({ onOpenDrawer }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150
              ${
                isActive
                  ? 'text-emerald-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{tab.name}</span>
          </NavLink>
        );
      })}

      {onOpenDrawer && (
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      )}
    </nav>
  );
};
