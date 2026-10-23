import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed navy overlay at 40% */}
      <div
        className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal box: bottom sheet on mobile, centered 20px radius on desktop */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-surface rounded-t-[20px] sm:rounded-[20px] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)] border border-border z-10 max-h-[90vh] overflow-y-auto transform transition-all duration-150`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-lg sm:text-xl font-heading font-semibold text-text">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-soft transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};
