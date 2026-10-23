import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
  };
  highlight?: boolean;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  trend,
  className = '',
}) => {
  return (
    <Card className={`flex flex-col justify-between ${className}`} padding="sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded ${
              trend.direction === 'up'
                ? trend.isPositive
                  ? 'text-primary-ink bg-primary-tint'
                  : 'text-amber-800 bg-accent-tint'
                : trend.direction === 'down'
                ? trend.isPositive
                  ? 'text-primary-ink bg-primary-tint'
                  : 'text-danger bg-danger-tint'
                : 'text-text-muted bg-surface-soft'
            }`}
          >
            {trend.direction === 'up' && <TrendingUp size={12} strokeWidth={2} />}
            {trend.direction === 'down' && <TrendingDown size={12} strokeWidth={2} />}
            {trend.direction === 'neutral' && <Minus size={12} strokeWidth={2} />}
            <span>{trend.value}</span>
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="font-heading font-bold text-2xl sm:text-3xl text-text tracking-tight tabular-nums">
          {value}
        </div>
        {subtext && (
          <p className="mt-1 text-xs text-text-muted line-clamp-1">{subtext}</p>
        )}
      </div>
    </Card>
  );
};
