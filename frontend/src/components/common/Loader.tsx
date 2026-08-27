import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', label }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin text-emerald-600 ${sizeStyles[size]}`} />
      {label && <p className="text-xs text-slate-500 font-medium">{label}</p>}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className = '',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech-card animate-pulse ${className}`}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-8 w-8 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-7 bg-slate-200 rounded w-36 mb-2" />
          <div className="h-3.5 bg-slate-100 rounded w-48" />
        </div>
      ))}
    </>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse">
      <div className="h-10 bg-slate-100 rounded-xl mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-50 rounded-lg mb-2 flex items-center px-4 gap-4">
          <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/6 ml-auto" />
          <div className="h-4 bg-slate-200 rounded w-1/12" />
        </div>
      ))}
    </div>
  );
};
