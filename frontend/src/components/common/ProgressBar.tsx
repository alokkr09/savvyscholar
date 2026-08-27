import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100+
  max?: number;
  showLabel?: boolean;
  colorScheme?: 'auto' | 'emerald' | 'indigo' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  colorScheme = 'auto',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let barColor = 'bg-emerald-500';
  if (colorScheme === 'auto') {
    if (percentage >= 100) barColor = 'bg-rose-500';
    else if (percentage >= 80) barColor = 'bg-amber-500';
    else barColor = 'bg-emerald-500';
  } else {
    const schemeMap = {
      emerald: 'bg-emerald-500',
      indigo: 'bg-indigo-600',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
    };
    barColor = schemeMap[colorScheme];
  }

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-slate-700">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
