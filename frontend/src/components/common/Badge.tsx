import React from 'react';
import { ExpenseCategory } from '../../types/expense.types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/constants';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'emerald' | 'rose' | 'amber' | 'blue' | 'purple' | 'slate' | 'indigo';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/60',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: ExpenseCategory; showIcon?: boolean }> = ({
  category,
  showIcon = true,
}) => {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Miscellaneous'];
  const Icon = CATEGORY_ICONS[category];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${color.bg} ${color.text} ${color.border}`}
    >
      {showIcon && Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{category}</span>
    </span>
  );
};
