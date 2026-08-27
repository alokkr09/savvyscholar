import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-emerald-50',
  iconTextColor = 'text-emerald-600',
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-fintech-hover hover:border-slate-300 active:scale-[0.99]' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${iconBgColor} ${iconTextColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {trend && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-500 leading-none">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
