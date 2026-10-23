import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/ui/Toast';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register } = useStore();
  const { success } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (mode === 'register' && !location.trim()) {
      setError('Please provide your store location/city.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        success('Logged into store workspace');
      } else {
        await register(
          email,
          name || 'Store Owner',
          storeName || 'My Retail Store',
          location || 'Salem, Tamil Nadu',
          password
        );
        success('Account created! Welcome to StockSense');
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed navy overlay at 40% */}
      <div
        className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Split Layout Modal on desktop: Left navy panel, right white form */}
      <div className="relative w-full max-w-3xl bg-surface rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.12)] border border-border z-10 overflow-hidden flex flex-col md:flex-row">
        {/* Left Navy Panel (desktop only) */}
        <div className="hidden md:flex md:w-5/12 bg-navy-900 text-on-navy p-8 flex-col justify-between border-r border-navy-700 relative overflow-hidden">
          <div
            className="absolute -top-16 -left-16 w-48 h-48 bg-primary/20 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div>
            <div className="font-heading font-bold text-2xl tracking-tight text-white mb-2">
              Stock<span className="text-mint">Sense</span>
            </div>
            <p className="text-xs text-on-navy-muted leading-relaxed">
              Small-Retail Demand Forecasting and Shelf-Life Replenishment.
            </p>
          </div>

          <div className="space-y-4 my-8">
            <div className="p-3.5 bg-navy-800/80 rounded-xl border border-navy-700 text-xs">
              <span className="text-mint font-semibold block mb-1">
                Zero Overstocking
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Calculates remaining usable days so you never reorder what will
                spoil before it sells.
              </p>
            </div>

            <div className="p-3.5 bg-navy-800/80 rounded-xl border border-navy-700 text-xs">
              <span className="text-mint font-semibold block mb-1">
                Instant Daily Stockout Radar
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Ranked order list prioritizes high-margin fast movers facing
                supplier lead times.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-on-navy-muted">
            PS11 Quantix 2K26 · Demo Edition
          </div>
        </div>

        {/* Right White Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-heading font-semibold text-text">
                  {mode === 'login' ? 'Welcome back' : 'Start 3-month free trial'}
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  {mode === 'login'
                    ? 'Enter your store credentials to continue'
                    : 'Get started with intelligent shelf-life replenishment'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-soft transition-colors"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>


            {error && (
              <div className="mb-4 p-3 bg-danger-tint border border-danger/30 text-danger text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-[400px]">
              {mode === 'register' && (
                <>
                  <Input
                    label="Your Name"
                    placeholder="e.g. S. Murugan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Store Name"
                    placeholder="e.g. Murugan Kirana & Provisions"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                  <Input
                    label="Store Location / City *"
                    placeholder="e.g. Salem, Tamil Nadu"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    helperText="Used for local weather insights & supplier distance"
                    required
                  />
                </>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="owner@yourstore.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {mode === 'login' ? 'Login to Store' : 'Create Store Account'}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
            <span>
              {mode === 'login' ? 'New to StockSense?' : 'Already have an account?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-primary-ink font-semibold hover:underline cursor-pointer"
            >
              {mode === 'login'
                ? 'Sign up for free trial'
                : 'Login with existing store'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
