import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { useStore } from '../context/StoreContext';
import { useToast } from '../components/ui/Toast';

export interface LoginPageProps {
  onBackToLanding: () => void;
  onSuccessLogin: () => void;
  defaultMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToLanding,
  onSuccessLogin,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'register' && !location.trim()) {
      setError('Please provide your store location / city.');
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
        success('Store account created! Welcome to StockSense');
      }
      onSuccessLogin();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col md:flex-row">
        {/* Left Navy Panel (Desktop) */}
        <div className="hidden md:flex md:w-5/12 bg-navy-900 text-on-navy p-8 flex-col justify-between border-r border-navy-700 relative overflow-hidden">
          <div
            className="absolute -top-16 -left-16 w-48 h-48 bg-primary/20 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div>
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs text-on-navy-muted hover:text-white transition-colors cursor-pointer mb-6"
            >
              <ArrowLeft size={14} />
              <span>Back to Landing</span>
            </button>

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
                2-Week Stock Aging Radar
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Separates fresh stock from stagnant inventory and prompts for
                removal after 14 days.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-on-navy-muted">
            PS11 Quantix 2K26 · Final Application
          </div>
        </div>

        {/* Right White Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-heading font-semibold text-text">
                  {mode === 'login' ? 'Store Login' : 'Register Store Account'}
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  {mode === 'login'
                    ? 'Sign in to access your daily reorder planner'
                    : 'Set up your retail store profile and location'}
                </p>
              </div>
              <button
                type="button"
                onClick={onBackToLanding}
                className="md:hidden text-xs text-text-muted hover:text-text p-1 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Landing</span>
              </button>
            </div>


            {error && (
              <div className="mb-4 p-3 bg-danger-tint border border-danger/30 text-danger text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-[420px]">
              {mode === 'register' && (
                <>
                  <Input
                    label="Your Name *"
                    placeholder="e.g. S. Murugan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <Input
                    label="Store Name *"
                    placeholder="e.g. Murugan Kirana & Provisions"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                  {/* Location field in Sign Up / Register per user request */}
                  <Input
                    label="Store Location / City *"
                    placeholder="e.g. Salem, Tamil Nadu"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    helperText="Used for local weather insights & supplier distance"
                    leftIcon={<MapPin size={15} />}
                    required
                  />
                </>
              )}

              <Input
                label="Email Address *"
                type="email"
                placeholder="owner@yourstore.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <PasswordInput
                label="Password *"
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
                  {mode === 'login' ? 'Login to Store' : 'Create Store & Enter'}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
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
