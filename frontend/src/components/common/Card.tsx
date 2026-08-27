import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  padding = 'md',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200/80 shadow-fintech-card transition-all duration-200
        ${hoverEffect ? 'hover:shadow-fintech-hover hover:border-slate-300' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 last:border-b-0 last:pb-0 last:mb-0">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
