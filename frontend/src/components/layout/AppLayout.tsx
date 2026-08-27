import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Umbrella,
  User,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { ExpenseModal } from '../expenses/ExpenseModal';
import { expenseApi } from '../../services/expenseApi';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { CreateExpensePayload } from '../../types/expense.types';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { success } = useToast();

  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Map route pathname to page title and subtitle
  const getPageMeta = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return {
          title: `Welcome back, ${user?.name?.split(' ')[0] || 'Scholar'} 👋`,
          subtitle: "Here's your overall financial snapshot and metrics.",
        };
      case '/expenses':
        return {
          title: 'Expense Management',
          subtitle: 'Track, filter, and analyze every penny you spend.',
        };
      case '/budgets':
        return {
          title: 'Monthly Category Budgets',
          subtitle: 'Set spending limits and keep your student cash flow in check.',
        };
      case '/savings':
        return {
          title: 'Savings & Milestone Goals',
          subtitle: 'Build towards laptops, exams, travel, and personal milestones.',
        };
      case '/investments':
        return {
          title: 'Personal Investment Portfolio',
          subtitle: 'Track mutual funds, stocks, fixed deposits, and assets.',
        };
      case '/insurance':
        return {
          title: 'Insurance Policies & Renewals',
          subtitle: 'Maintain health, term, and gadget policies with renewal alerts.',
        };
      case '/emergency-fund':
        return {
          title: 'Emergency Cushion & Runway',
          subtitle: 'Calculate your months of survival runway and build your safety net.',
        };
      case '/analytics':
        return {
          title: 'Deep Financial Analytics',
          subtitle: 'Understand your spending distribution, income cash flow, and health score.',
        };
      case '/profile':
        return {
          title: 'Account Settings & Preferences',
          subtitle: 'Configure your base income, currency, and credentials.',
        };
      default:
        return { title: 'Savvy Scholar', subtitle: 'Financial Intelligence' };
    }
  };

  const { title, subtitle } = getPageMeta(location.pathname);

  const handleCreateExpense = async (data: CreateExpensePayload) => {
    await expenseApi.create(data);
    success('Expense Added', `Recorded ₹${data.amount} for "${data.title}"`);
    // Emit global event or navigate to trigger page data refresh
    window.dispatchEvent(new CustomEvent('savvyscholar:expense_created'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sticky Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Topbar */}
        <Topbar
          title={title}
          subtitle={subtitle}
          onQuickAddExpense={() => setIsQuickExpenseOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenDrawer={() => setIsMobileDrawerOpen(true)} />

      {/* Global Quick Add Expense Modal */}
      <ExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onSubmit={handleCreateExpense}
      />

      {/* Mobile "More" Drawer Modal */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-900">More Features</span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                <Link
                  to="/investments"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold text-sm"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Investments</span>
                </Link>
                <Link
                  to="/insurance"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold text-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Insurance</span>
                </Link>
                <Link
                  to="/emergency-fund"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold text-sm"
                >
                  <Umbrella className="w-4 h-4 text-emerald-600" />
                  <span>Emergency Fund</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold text-sm"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Profile & Settings</span>
                </Link>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
