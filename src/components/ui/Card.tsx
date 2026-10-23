import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6', // 20-24px padding per directive
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-surface border border-border rounded-[14px] ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
