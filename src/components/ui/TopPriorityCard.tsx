import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';

export interface TopPriorityCardProps {
  headline: string; // e.g. "Order 48 units"
  subline: string;  // e.g. "Run out in 2 days"
  reason?: string;  // e.g. "Lead time is 2 days. 0 stock arrives after Friday."
  badgeText?: string; // e.g. "CRITICAL"
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const TopPriorityCard: React.FC<TopPriorityCardProps> = ({
  headline,
  subline,
  reason,
  badgeText = 'CRITICAL',
  actionLabel = 'Order Now',
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-navy-900 border border-navy-700 rounded-[14px] p-5 sm:p-6 text-on-navy relative overflow-hidden transition-all duration-150 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase font-semibold tracking-wider text-on-navy-muted">
          Top Priority Action
        </span>
        <Badge
          variant="critical"
          className="bg-accent/20 text-accent border border-accent/40 font-bold tracking-wide uppercase text-[11px]"
          icon={<AlertTriangle size={12} strokeWidth={2} />}
        >
          {badgeText}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="font-heading font-bold text-3xl sm:text-4xl text-mint tracking-tight tabular-nums">
          {headline}
        </div>
        <div className="text-base sm:text-lg font-medium text-slate-200">
          {subline}
        </div>
      </div>

      {reason && (
        <p className="mt-3 text-xs sm:text-sm text-on-navy-muted border-t border-navy-700/80 pt-3">
          {reason}
        </p>
      )}

      {onAction && (
        <div className="mt-5 pt-1">
          <button
            type="button"
            onClick={onAction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-navy-900 hover:bg-primary-hover active:bg-emerald-700 transition-colors cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
};
