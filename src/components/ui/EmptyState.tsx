import React from 'react';
import { Button } from './Button';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-[14px] bg-surface/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center text-text-muted mb-3">
        {icon || <PackageOpen size={24} strokeWidth={1.5} />}
      </div>
      <p className="text-sm font-medium text-text max-w-sm mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
