import React from 'react';
import { ArrowRight, ShieldCheck, Zap, RefreshCw, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import shopkeeperImg from '../assets/images/shopkeeper_inventory_1792753808812.jpg';

export interface LandingPageProps {
  onStartTrial: () => void;
  onLogin: () => void;
  onExploreDemo: () => void;
  onOpenDesign: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial,
  onLogin,
  onExploreDemo,
  onOpenDesign,
}) => {
  return (
    <div className="w-full bg-bg text-text">
      {/* 1. Hero on signature gradient */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 text-on-navy [background:linear-gradient(135deg,#0F172A_0%,#0F2A2A_55%,#064E3B_100%)]">
        {/* Soft radial emerald glow behind hero */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/12 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-[1120px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Eyebrow, 2-line Display Headline, Sentence, Two buttons */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold tracking-wider uppercase text-mint">
                QUANTIX 2K26 · PS11 · SMALL-RETAIL REORDER PLANNER
              </div>

              <h1 className="font-heading font-bold text-3xl sm:text-5xl lg:text-[56px] leading-[1.12] tracking-tight text-white">
                Never run out.{' '}
                <span className="text-mint block mt-1">Never overstock.</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Small store owners order from memory. StockSense forecasts daily
                product demand and gives you a ranked reorder list with exact unit
                quantities in seconds.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onStartTrial}
                  rightIcon={<ArrowRight size={18} strokeWidth={2} />}
                >
                  Get Started
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onLogin}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Login to Store
                </Button>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-on-navy-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-mint" /> 2-minute daily use
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-mint" /> Shelf-life protected
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-mint" /> No credit card needed
                </span>
              </div>
            </div>

            {/* Right Column: Hero Art / Shopkeeper visual image with live badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-navy-700 bg-navy-800 shadow-[0_12px_36px_rgba(0,0,0,0.4)] group">
                <img
                  src={shopkeeperImg}
                  alt="StockSense retail shopkeeper checking stock on phone"
                  className="w-full h-[380px] sm:h-[420px] object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />

                {/* Floating Signature Top Priority Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-navy-900/90 border border-navy-700/80 backdrop-blur-md rounded-xl p-4 text-on-navy shadow-xl">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-on-navy-muted uppercase mb-1">
                    <span>AI Reorder Priority</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      LIVE DEMO
                    </span>
                  </div>
                  <div className="font-heading font-bold text-2xl text-mint tabular-nums">
                    Order 48 units
                  </div>
                  <div className="text-xs text-slate-300">
                    Run out in 2 days · Amul Taaza Milk 500ml
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Core Loop / How it Works: 5 numbered steps in a single clean row */}
      <section className="py-20 md:py-24 border-b border-border">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-ink block mb-2">
              The Core Loop
            </span>
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-text">
              From five inputs to one ranked order list
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                num: '01',
                title: 'Upload sales',
                desc: 'Drop photo of daily bill or sales CSV.',
              },
              {
                num: '02',
                title: 'Enter stock + lead time',
                desc: 'Quick 2-minute daily stock check.',
              },
              {
                num: '03',
                title: 'Forecast demand',
                desc: 'Auto-selects Croston, Holt-Winters or WMA.',
              },
              {
                num: '04',
                title: 'Rank quantity + urgency',
                desc: 'Safety stock, shelf-life cap, MOQ pack rules.',
              },
              {
                num: '05',
                title: 'Export',
                desc: '1-tap WhatsApp order or print PDF.',
              },
            ].map((step) => (
              <div key={step.num} className="relative pt-4 flex flex-col">
                {/* Thin emerald rule above number */}
                <div className="w-12 h-0.5 bg-primary mb-4" />
                <span className="font-heading font-bold text-2xl text-text-muted/50 mb-2 tabular-nums">
                  {step.num}
                </span>
                <h3 className="font-heading font-semibold text-base text-text mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How it solves the problem: Two-column BEFORE vs AFTER cards + 3 minimal benefit cards */}
      <section className="py-20 md:py-24">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-ink block mb-2">
              The Outcome
            </span>
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-text">
              From memory-based ordering to confident replenishment
            </h2>
          </div>

          {/* Two-column BEFORE (grey) vs AFTER (emerald tint) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* BEFORE Card */}
            <div className="bg-surface-soft border border-border rounded-[14px] p-8">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block mb-3">
                Before StockSense
              </span>
              <h3 className="text-xl font-heading font-semibold text-slate-800 mb-4">
                Memory · Stock-outs · Cash locked · Expiry waste
              </h3>
              <ul className="space-y-3 text-sm text-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-danger font-bold">×</span>
                  <span>Fast-moving items stock out unpredictably, losing loyal customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger font-bold">×</span>
                  <span>Slow-moving stock piles up on shelves, locking critical working capital</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-danger font-bold">×</span>
                  <span>Perishables expire unnoticed, causing painful weekly write-offs</span>
                </li>
              </ul>
            </div>

            {/* AFTER Card */}
            <div className="bg-primary-tint border border-emerald-300/70 rounded-[14px] p-8">
              <span className="text-xs uppercase font-bold tracking-wider text-primary-ink block mb-3">
                With StockSense
              </span>
              <h3 className="text-xl font-heading font-semibold text-emerald-950 dark:text-emerald-200 mb-4">
                Ranked list · Exact quantities · Less waste · Minutes per order
              </h3>
              <ul className="space-y-3 text-sm text-emerald-900 dark:text-emerald-300">
                <li className="flex items-start gap-2">
                  <span className="text-primary-ink font-bold">✓</span>
                  <span>Daily prioritized order recommendations so you never run out of staples</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-ink font-bold">✓</span>
                  <span>Strict shelf-life capping prevents ordering more than will sell before expiry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-ink font-bold">✓</span>
                  <span>Exact unit quantities rounded up to supplier pack sizes and MOQs</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3 Minimal Benefit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="md">
              <div className="w-10 h-10 rounded-lg bg-surface-soft flex items-center justify-center text-primary-ink mb-4">
                <ShieldCheck size={20} strokeWidth={1.5} />
              </div>
              <h4 className="font-heading font-semibold text-base text-text mb-2">
                Shelf-life aware
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Calculates remaining usable days with an expiry safety buffer. Never
                recommends buying more than can sell before expiry.
              </p>
            </Card>

            <Card padding="md">
              <div className="w-10 h-10 rounded-lg bg-surface-soft flex items-center justify-center text-primary-ink mb-4">
                <BarChart3 size={20} strokeWidth={1.5} />
              </div>
              <h4 className="font-heading font-semibold text-base text-text mb-2">
                Best model per product
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Auto-selects Croston/SBA for intermittent lines, Holt-Winters for
                weekly seasonality, or exponential smoothing based on holdout WAPE.
              </p>
            </Card>

            <Card padding="md">
              <div className="w-10 h-10 rounded-lg bg-surface-soft flex items-center justify-center text-primary-ink mb-4">
                <Zap size={20} strokeWidth={1.5} />
              </div>
              <h4 className="font-heading font-semibold text-base text-text mb-2">
                Explainable quantity
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                No black-box scores or jargon. Every recommended number explains
                exactly why: daily run rate, lead time, and days of cover.
              </p>
            </Card>
          </div>

          {/* Instant Launch Application Button */}
          <div className="mt-16 text-center">
            <Button variant="primary" size="lg" onClick={onExploreDemo}>
              Launch the Application
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Footer: Small muted links */}
      <footer className="py-12 border-t border-border bg-surface text-text-muted text-xs">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-heading font-semibold text-text">StockSense</span> ·
            Built for Quantix 2K26 PS11 · K.S.R College of Engineering
          </div>

          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-text transition-colors">
              Privacy
            </a>
            <a href="#terms" className="hover:text-text transition-colors">
              Terms
            </a>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('stocksense_cookie_consent');
                window.location.reload();
              }}
              className="hover:text-text transition-colors cursor-pointer"
            >
              Cookie Preferences
            </button>
            <button
              type="button"
              onClick={onOpenDesign}
              className="text-primary-ink font-medium hover:underline cursor-pointer"
            >
              /design preview
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
