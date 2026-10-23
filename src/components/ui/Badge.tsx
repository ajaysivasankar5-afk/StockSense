import React from 'react';

export type BadgeVariant = 'critical' | 'ok' | 'overstock' | 'danger' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'ok',
  children,
  icon,
  className = '',
  ...props
}) => {
  const variantStyles = {
    // Critical: amber fill + matching dark text
    critical: 'bg-accent-tint text-amber-900 border border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700/50',
    // OK / Healthy: emerald fill + matching dark text (primary-ink)
    ok: 'bg-primary-tint text-primary-ink border border-emerald-300/60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-700/50',
    // Overstock: slate grey fill + dark text
    overstock: 'bg-surface-soft text-slate-700 border border-slate-300/60 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    // Danger / Expired / Error: red fill + dark text
    danger: 'bg-danger-tint text-red-900 border border-red-300/60 dark:bg-red-950/40 dark:text-red-200 dark:border-red-700/50',
    // Info / Weather: blue fill + dark text
    info: 'bg-info-tint text-sky-900 border border-sky-300/60 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-700/50',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-normal whitespace-nowrap select-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
