import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Receipt,
  PiggyBank,
  PieChart,
  TrendingUp,
  Umbrella,
  Plus,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/common/ProgressBar';
import { CategoryBadge } from '../components/common/Badge';
import { CardSkeleton, Spinner } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { dashboardApi } from '../services/dashboardApi';
import { DashboardData } from '../types/dashboard.types';
import { formatINR } from '../utils/currency';
import { formatDate } from '../utils/dates';
import { CATEGORY_COLORS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await dashboardApi.getSummary();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const handleExpenseCreated = () => {
      fetchDashboard();
    };

    window.addEventListener('savvyscholar:expense_created', handleExpenseCreated);
    return () => {
      window.removeEventListener('savvyscholar:expense_created', handleExpenseCreated);
    };
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse" />
          <div className="h-72 bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Could not load dashboard"
        description="We had trouble retrieving your financial summary. Please refresh."
        actionText="Try Again"
        onAction={fetchDashboard}
      />
    );
  }

  // Prepare Pie Chart Data
  const pieData = data.categorySpending.map((c) => ({
    name: c.category,
    value: c.amount,
    color: CATEGORY_COLORS[c.category as keyof typeof CATEGORY_COLORS]?.hex || '#94a3b8',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Smart Financial Insights Banner (if any) */}
      {data.smartInsights && data.smartInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.smartInsights.slice(0, 2).map((insight) => (
            <div
              key={insight.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                insight.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : insight.type === 'positive'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-sky-50/70 border-sky-200 text-sky-900'
              }`}
            >
              <div className="p-1 rounded-lg shrink-0 mt-0.5">
                {insight.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                ) : insight.type === 'positive' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Info className="w-5 h-5 text-sky-600" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold">{insight.title}</p>
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Core Fin-tech KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Income"
          value={formatINR(data.user.monthlyIncome)}
          subtitle="Configured base income"
          icon={Wallet}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />

        <StatCard
          title="This Month's Spending"
          value={formatINR(data.currentMonth.totalSpent)}
          subtitle={`${data.currentMonth.transactionCount} transactions in ${data.currentMonth.monthName.split(' ')[0]}`}
          icon={Receipt}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />

        <StatCard
          title="Estimated Net Savings"
          value={formatINR(data.currentMonth.netSavings)}
          subtitle={
            data.user.monthlyIncome > 0
              ? `${data.currentMonth.savingsRate}% monthly savings rate`
              : 'Add income to calculate rate'
          }
          icon={PiggyBank}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          trend={
            data.user.monthlyIncome > 0
              ? {
                  value: `${data.currentMonth.savingsRate}%`,
                  isPositive: data.currentMonth.savingsRate >= 20,
                }
              : undefined
          }
        />

        <StatCard
          title="Budget Utilization"
          value={
            data.budgets.totalAllocated > 0
              ? `${data.budgets.utilizationPercentage}%`
              : 'Not Configured'
          }
          subtitle={
            data.budgets.totalAllocated > 0
              ? `₹${data.currentMonth.totalSpent.toLocaleString('en-IN')} of ₹${data.budgets.totalAllocated.toLocaleString('en-IN')}`
              : 'Set up your category budgets'
          }
          icon={PieChart}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Main Grid: Spending Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Spending Breakdown & Quick Action shortcuts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending by Category Card */}
          <Card
            title="Spending by Category"
            subtitle={`Distribution of ₹${data.currentMonth.totalSpent.toLocaleString('en-IN')} spent this month`}
            action={
              <Link to="/expenses">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All
                </Button>
              </Link>
            }
          >
            {data.categorySpending.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No expenses logged this month"
                description="Start recording your canteen meals, travel, and textbooks to unlock spending breakdowns."
                actionText="Add First Expense"
                onAction={() => window.dispatchEvent(new CustomEvent('savvyscholar:expense_created'))}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                {/* Donut Chart */}
                <div className="md:col-span-5 h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number) => [formatINR(val), 'Spent']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                {/* Progress bars list */}
                <div className="md:col-span-7 space-y-3.5">
                  {data.categorySpending.slice(0, 5).map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{cat.category}</span>
                        <span className="font-bold text-slate-900">
                          {formatINR(cat.amount)}{' '}
                          <span className="text-slate-400 font-normal">({cat.percentage}%)</span>
                        </span>
                      </div>
                      <ProgressBar
                        value={cat.percentage}
                        colorScheme="emerald"
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Recent Transactions List */}
          <Card
            title="Recent Transactions"
            subtitle="Your latest logged financial activities"
            action={
              <Link to="/expenses">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Manage
                </Button>
              </Link>
            }
          >
            {data.recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No recent transactions recorded.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryBadge category={tx.category} showIcon={false} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{tx.title}</p>
                        <p className="text-[11px] text-slate-500">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-slate-900">
                        - {formatINR(tx.amount)}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Col: Savings Goals Preview & Emergency Fund Runway */}
        <div className="space-y-6">
          {/* Active Savings Goals Card */}
          <Card
            title="Savings Goals"
            subtitle="Milestones in progress"
            action={
              <Link to="/savings">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  All Goals
                </Button>
              </Link>
            }
          >
            {data.savingsGoals.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-500 mb-3">No active savings goals yet.</p>
                <Link to="/savings">
                  <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                    Set a Goal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.savingsGoals.map((goal) => (
                  <div
                    key={goal._id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{goal.title}</span>
                      <span className="font-extrabold text-emerald-700">{goal.percentage}%</span>
                    </div>
                    <ProgressBar value={goal.percentage} colorScheme="emerald" size="sm" />
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Saved: {formatINR(goal.currentAmount)}</span>
                      <span>Target: {formatINR(goal.targetAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Emergency Fund & Survival Runway */}
          <Card
            title="Emergency Cushion"
            subtitle="Financial security runway"
            action={
              <Link to="/emergency-fund">
                <Button variant="ghost" size="sm">
                  Details
                </Button>
              </Link>
            }
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Survival Runway
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  {data.emergencyFund.runwayMonths} Months
                </span>
              </div>
              <p className="text-2xl font-black text-white">
                {formatINR(data.emergencyFund.currentAmount)}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Funded Progress</span>
                  <span>{data.emergencyFund.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.emergencyFund.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Portfolio & Wealth Snapshot */}
          <Card
            title="Investments Snapshot"
            subtitle="Assets & holdings"
            action={
              <Link to="/investments">
                <Button variant="ghost" size="sm">
                  Portfolio
                </Button>
              </Link>
            }
          >
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Portfolio Value
                </span>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  {formatINR(data.investments.totalCurrentValue)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                    data.investments.gainLoss >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {data.investments.returnRate}%
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {data.investments.holdingCount} Assets
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
