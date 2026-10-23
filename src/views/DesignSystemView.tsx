import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Package,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { TopPriorityCard } from '../components/ui/TopPriorityCard';
import { KpiCard } from '../components/ui/KpiCard';
import { useToast } from '../components/ui/Toast';
import { useStore } from '../context/StoreContext';

export const DesignSystemView: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useStore();
  const { success, warning, error, info } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('SecretKey123');

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-ink mb-1">
            <span>StockSense UI Specification</span>
            <span>·</span>
            <span>Quantix 2K26 PS11</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text tracking-tight">
            Component Design System & State Catalog
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-xl">
            Live catalog demonstrating all components in default, hover, focus,
            loading, error, and disabled states under light and dark themes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? 'Preview Light Mode' : 'Preview Dark Mode'}
          </Button>
        </div>
      </div>

      {/* 1. Buttons Spec */}
      <section className="space-y-4">
        <h2 className="text-lg font-heading font-semibold text-text border-b border-border pb-2">
          1. Buttons (Primary = Emerald Fill with Navy Text #0F172A)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="sm" className="space-y-2">
            <span className="text-xs text-text-muted font-semibold block">
              Primary (44px, emerald fill, navy text)
            </span>
            <Button variant="primary" size="md">
              Primary Action
            </Button>
            <Button variant="primary" size="md" isLoading>
              Loading Action
            </Button>
            <Button variant="primary" size="md" disabled>
              Disabled Primary
            </Button>
          </Card>

          <Card padding="sm" className="space-y-2">
            <span className="text-xs text-text-muted font-semibold block">
              Secondary (White fill, 1px border)
            </span>
            <Button variant="secondary" size="md">
              Secondary Button
            </Button>
            <Button variant="secondary" size="md" isLoading>
              Loading Secondary
            </Button>
            <Button variant="secondary" size="md" disabled>
              Disabled Secondary
            </Button>
          </Card>

          <Card padding="sm" className="space-y-2">
            <span className="text-xs text-text-muted font-semibold block">
              Ghost (--primary-ink text on white)
            </span>
            <Button variant="ghost" size="md">
              Ghost Link
            </Button>
            <div className="pt-2">
              <Button variant="ghost" size="sm">
                Small Ghost
              </Button>
            </div>
          </Card>

          <Card padding="sm" className="space-y-2">
            <span className="text-xs text-text-muted font-semibold block">
              Danger (Border & text red, fill on confirm)
            </span>
            <Button variant="danger" size="md">
              Delete Record
            </Button>
            <Button variant="danger" size="md" disabled>
              Disabled Danger
            </Button>
          </Card>
        </div>
      </section>

      {/* 2. Inputs & PasswordInput */}
      <section className="space-y-4">
        <h2 className="text-lg font-heading font-semibold text-text border-b border-border pb-2">
          2. Inputs & Password Fields (10px vertical pad, surface-soft fill, label above)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Product Name"
            placeholder="e.g. Amul Taaza Milk 500ml"
            helperText="Enter official brand SKU name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <PasswordInput
            label="Store Admin Password"
            placeholder="••••••••"
            helperText="Click eye icon to toggle visibility"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
          />

          <Input
            label="Stock on Hand (Error State)"
            type="number"
            value="-5"
            readOnly
            error="Quantity cannot be negative."
          />
        </div>
      </section>

      {/* 3. Badges */}
      <section className="space-y-4">
        <h2 className="text-lg font-heading font-semibold text-text border-b border-border pb-2">
          3. Badges (Pill, tinted fill + matching dark text, paired with text labels)
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="critical">Critical · 1d cover</Badge>
          <Badge variant="ok">Healthy · 8d cover</Badge>
          <Badge variant="overstock">Overstock · 42d cover</Badge>
          <Badge variant="danger">Expired Batch</Badge>
          <Badge variant="info">Rain Forecast +25%</Badge>
        </div>
      </section>

      {/* 4. Signature Top Priority Card */}
      <section className="space-y-4">
        <h2 className="text-lg font-heading font-semibold text-text border-b border-border pb-2">
          4. "Top Priority" Card (Signature Component)
        </h2>
        <div className="max-w-xl">
          <TopPriorityCard
            headline="Order 48 units"
            subline="Run out in 2 days · Amul Taaza Milk"
            reason="Lead time is 1 day. Existing 8 units will be consumed before tonight."
            badgeText="CRITICAL"
            actionLabel="Order Now"
            onAction={() => success('Top priority order trigger clicked')}
          />
        </div>
      </section>

      {/* 5. KPI Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-heading font-semibold text-text border-b border-border pb-2">
          5. KPI Cards (Muted caption, big Poppins number, trend chip)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Items to Order Now"
            value="5"
            subtext="2 critical lines"
            trend={{ value: '2 urgent', direction: 'up', isPositive: false }}
          />
          <KpiCard
            label="Est. Order Value"
            value="₹14,280"
            subtext="Pack size rounded"
            trend={{ value: '+4.2%', direction: 'up', isPositive: true }}
          />
          <KpiCard
            label="Cash in Overstock"
            value="₹16,860"
            subtext="Recoverable capital"
            trend={{ value: '-8.1%', direction: 'down', isPositive: true }}
          />
          <KpiCard
            label="Expiring Soon"
            value="2"
            subtext="Perishables < 3d"
            trend={{ value: 'Check dahi', direction: 'neutral' }}
          />
        </div>
      </section>

      {/* 6. Toasts & Modal triggers */}
      <section className="space-y-4">
        <h2 className="text-lg font-heading font-semibold text-text border-b border-border pb-2">
          6. Feedback Systems: Modals, Toasts with Undo, Skeletons & Empty States
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              success('Stock updated optimistically', {
                label: 'Undo',
                onClick: () => info('Rolled back stock change!'),
              })
            }
          >
            Trigger Success Toast with Undo
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => warning('Low stock threshold breached for 3 items')}
          >
            Trigger Warning Toast
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => error('File exceeded 5MB size limit')}
          >
            Trigger Error Toast
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            Open Modal (20px radius, 40% navy dim)
          </Button>
        </div>

        {/* Shimmer Skeletons preview */}
        <div className="space-y-2 pt-4">
          <span className="text-xs text-text-muted font-semibold block">
            Shimmer Skeletons (Grey shimmer blocks instead of spinners)
          </span>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton height="32px" />
            <Skeleton height="32px" />
            <Skeleton height="32px" />
          </div>
        </div>

        {/* Empty State preview */}
        <div className="pt-4">
          <EmptyState
            icon={<Package size={24} />}
            message="No expired items recorded this week. All perishable stock rotated smoothly."
            actionLabel="Record New Wastage"
            onAction={() => info('Wastage form opened')}
          />
        </div>
      </section>

      {/* Modal Demonstration */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sample Minimalist Modal"
        description="Centered 20px radius on desktop, bottom sheet on mobile, dimmed navy overlay at 40%."
      >
        <div className="space-y-4 text-xs text-text-muted">
          <p>
            Every modal has clear purpose, one primary action, and closes on Escape or backdrop click.
          </p>
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                success('Modal action confirmed');
                setIsModalOpen(false);
              }}
            >
              Confirm Action
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
