import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, action?: { label: string; onClick: () => void }) => void;
  success: (message: string, action?: { label: string; onClick: () => void }) => void;
  warning: (message: string, action?: { label: string; onClick: () => void }) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      message: string,
      type: ToastType = 'success',
      action?: { label: string; onClick: () => void }
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-2), { id, type, message, action }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000); // auto-dismiss in 4s per directive
    },
    [removeToast]
  );

  const value: ToastContextType = {
    toast: addToast,
    success: (msg, act) => addToast(msg, 'success', act),
    warning: (msg, act) => addToast(msg, 'warning', act),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container: bottom-centre, small, auto-dismiss in 4s */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-sm w-full px-4 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center justify-between gap-3 bg-navy-900 text-on-navy px-4 py-2.5 rounded-xl border border-navy-700 shadow-[0_8px_30px_rgba(15,23,42,0.12)] text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-2 duration-150 w-auto"
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && (
                <CheckCircle2 size={16} className="text-primary shrink-0" strokeWidth={2} />
              )}
              {t.type === 'warning' && (
                <AlertTriangle size={16} className="text-accent shrink-0" strokeWidth={2} />
              )}
              {t.type === 'error' && (
                <AlertCircle size={16} className="text-danger shrink-0" strokeWidth={2} />
              )}
              {t.type === 'info' && (
                <Info size={16} className="text-info shrink-0" strokeWidth={2} />
              )}
              <span className="font-medium text-slate-100">{t.message}</span>
            </div>

            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  removeToast(t.id);
                }}
                className="text-mint font-semibold hover:underline px-1.5 py-0.5 rounded cursor-pointer shrink-0"
              >
                {t.action.label}
              </button>
            )}

            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-on-navy-muted hover:text-on-navy p-0.5 rounded cursor-pointer shrink-0"
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
