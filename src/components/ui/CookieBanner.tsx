import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ShieldCheck, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [preferencesEnabled, setPreferencesEnabled] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('stocksense_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'stocksense_cookie_consent',
      JSON.stringify({ essential: true, analytics: true, preferences: true })
    );
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem(
      'stocksense_cookie_consent',
      JSON.stringify({ essential: true, analytics: false, preferences: false })
    );
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'stocksense_cookie_consent',
      JSON.stringify({
        essential: true,
        analytics: analyticsEnabled,
        preferences: preferencesEnabled,
      })
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 sm:bottom-6 left-0 sm:left-6 z-50 w-full sm:max-w-md p-4 sm:p-0">
      <div className="bg-surface border border-border sm:rounded-[14px] rounded-t-[14px] p-5 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary-ink" strokeWidth={2} />
            <span className="text-sm font-heading font-semibold text-text">
              Cookie Preferences
            </span>
          </div>
          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="text-text-muted hover:text-text p-1"
            aria-label="Dismiss cookie banner"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-text-muted leading-relaxed mb-4">
          StockSense uses cookies to remember your store settings and preserve
          uploaded sales models offline. We never sell your retail data.
        </p>

        {showPreferences ? (
          <div className="space-y-3 mb-4 text-xs border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-text block">Essential (Required)</span>
                <span className="text-text-muted">Authentication and active store cache</span>
              </div>
              <input
                type="checkbox"
                checked
                readOnly
                disabled
                className="rounded accent-primary opacity-60 cursor-not-allowed"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-text block">Store Preferences</span>
                <span className="text-text-muted">Remember filters, sort orders and units</span>
              </div>
              <input
                type="checkbox"
                checked={preferencesEnabled}
                onChange={(e) => setPreferencesEnabled(e.target.checked)}
                className="rounded accent-primary cursor-pointer w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-text block">Usage Analytics</span>
                <span className="text-text-muted">Helps improve forecast algorithms</span>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="rounded accent-primary cursor-pointer w-4 h-4"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPreferences(false)}
              >
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm" variant="primary" onClick={handleAcceptAll}>
              Accept all
            </Button>
            <Button size="sm" variant="secondary" onClick={handleRejectNonEssential}>
              Reject non-essential
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPreferences(true)}
              className="text-xs"
            >
              Preferences
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
