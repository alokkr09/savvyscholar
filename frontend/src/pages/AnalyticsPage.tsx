import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  CreditCard,
  HeartPulse,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { CategoryBadge } from '../components/common/Badge';
import { Spinner, CardSkeleton } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { analyticsApi } from '../services/analyticsApi';
import { AnalyticsData } from '../types/analytics.types';
import { formatINR } from '../utils/currency';
import { CATEGORY_COLORS } from '../utils/constants';
import { useToast } from '../context/ToastContext';

export const AnalyticsPage: React.FC = () => {
  const { error } = useToast();

  const [timeframeMonths, setTimeframeMonths] = useState(6);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await analyticsApi.getOverview(timeframeMonths);
      setData(res);
    } catch (err: any) {
      error('Failed to load analytics', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeframeMonths, error]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardSkeleton count={3} />
        </div>
        <div className="h-80 bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Could not load analytics"
        description="Please refresh or try another timeframe."
        actionText="Reload"
        onAction={fetchAnalytics}
      />
    );
  }

  const pieData = data.categoryDistribution.map((c) => ({
    name: c.category,
    value: c.amount,
    color: CATEGORY_COLORS[c.category as keyof typeof CATEGORY_COLORS]?.hex || '#94a3b8',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Timeframe Selector & Financial Health Score Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setTimeframeMonths(m)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframeMonths === m
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Last {m} Months
            </button>
          ))}
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Financial Health Score
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">{data.healthScore} / 100</span>
              <span className="text-xs font-bold text-emerald-600">
                {data.healthScore >= 80 ? 'Excellent' : data.healthScore >= 50 ? 'Good' : 'Needs Focus'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 KPI Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Spend (Selected Period)
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(data.summary.totalPeriodSpend)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Across {timeframeMonths} months
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Average Monthly Outflow
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatINR(data.summary.averageMonthlySpend)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Normalized monthly burn
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Monthly Income Baseline
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatINR(data.summary.monthlyIncome)}
          </p>
          <span className="text-xs text-slate-500 font-medium mt-0.5 block">
            Current configured income
          </span>
        </div>
      </div>

      {/* Income vs Spending Cash Flow Chart */}
      <Card
        title="Income vs Expenses Cash Flow Trend"
        subtitle="Month-by-month financial inflow vs outflow"
      >
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(val: number) => [formatINR(val)]}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Breakdown & Payment Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card title="Category Spending Distribution" subtitle="Where your money goes">
          {data.categoryDistribution.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No expense data available.</p>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [formatINR(val), 'Spent']} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {data.categoryDistribution.map((cat) => (
                  <div key={cat.category} className="py-2.5 flex items-center justify-between text-xs">
                    <CategoryBadge category={cat.category as any} />
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900">{formatINR(cat.amount)}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Payment Methods */}
        <Card title="Payment Method Breakdown" subtitle="Distribution by payment channel">
          {data.paymentMethods.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No payment transactions recorded.</p>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="space-y-3.5">
                {data.paymentMethods.map((pm) => (
                  <div key={pm.method} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {pm.method}
                      </span>
                      <span>
                        {formatINR(pm.amount)}{' '}
                        <span className="text-slate-400 font-normal">({pm.percentage}%)</span>
                      </span>
                    </div>
                    <ProgressBar value={pm.percentage} colorScheme="emerald" size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
