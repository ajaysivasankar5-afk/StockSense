import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none select-none whitespace-nowrap shrink-0';

  const sizeStyles = {
    sm: 'h-9 px-3.5 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2', // 44px minimum touch target per directive
    lg: 'h-12 px-6 text-base gap-2.5',
  };

  const variantStyles = {
    // Primary: emerald fill, navy text (#0F172A on #10B981), hover darken, focus ring 3px
    primary:
      'bg-primary text-navy-900 hover:bg-primary-hover active:bg-emerald-700 focus-visible:ring-3 focus-visible:ring-primary-ring shadow-none',
    // Secondary: white fill, 1px border, navy text, hover surface-soft
    secondary:
      'bg-surface border border-border text-text hover:bg-surface-soft active:bg-slate-200 focus-visible:ring-3 focus-visible:ring-primary-ring',
    // Ghost: text only, emerald text on white (uses primary-ink)
    ghost:
      'bg-transparent text-primary-ink hover:underline active:opacity-80 p-0 h-auto font-medium focus-visible:ring-2 focus-visible:ring-primary-ring',
    // Danger: white fill, red text, red border (fills red on confirm)
    danger:
      'bg-surface border border-danger text-danger hover:bg-danger-tint active:bg-red-100 focus-visible:ring-3 focus-visible:ring-danger-tint',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="sr-only">Loading</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
