import React from 'react';
import { Plus, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onQuickAddExpense?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, onQuickAddExpense }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 hidden sm:block leading-none">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Add Expense Action */}
        {onQuickAddExpense && (
          <Button
            variant="brand"
            size="sm"
            onClick={onQuickAddExpense}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-sm font-semibold"
          >
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}

        {/* Currency Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{user?.currency || 'INR'} (₹)</span>
        </div>

        {/* User Mini Avatar on Mobile */}
        <div className="lg:hidden flex items-center">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase border border-emerald-200">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};
