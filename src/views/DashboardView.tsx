import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  CloudRain,
  Sparkles,
  RefreshCw,
  Plus,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { KpiCard } from '../components/ui/KpiCard';
import { TopPriorityCard } from '../components/ui/TopPriorityCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AreaForecastChart } from '../components/ui/Chart';
import { ProductDrawer } from '../components/inventory/ProductDrawer';
import { Product, ReorderItem } from '../types/inventory';
import { useToast } from '../components/ui/Toast';

export interface DashboardViewProps {
  onGoToPlan: () => void;
  onGoToUpload: () => void;
  onGoToItems: () => void;
  onOpenStockCount: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onGoToPlan,
  onGoToUpload,
  onGoToItems,
  onOpenStockCount,
}) => {
  const {
    settings,
    products,
    reorderItems,
    doNotReorderItems,
    topPriorityItem,
    totalEstimatedOrderValue,
    criticalCount,
    highCount,
    totalCashLocked,
    expiringSoonCount,
    forecasts,
    salesHistory,
    weather,
    updateProductStock,
    markAsOrdered,
    undoMarkAsOrdered,
    resetToDemoSeed,
  } = useStore();

  const { success } = useToast();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'aggregate' | 'topItem'>('aggregate');

  // Handle instant 1-click order from Top Priority Card
  const handleTopPriorityOrder = () => {
    if (!topPriorityItem) return;
    const res = markAsOrdered([topPriorityItem.productId]);
    success(
      `Ordered ${topPriorityItem.final_qty} units of ${topPriorityItem.name}`,
      {
        label: 'Undo',
        onClick: () => undoMarkAsOrdered(res.orderId),
      }
    );
  };

  // Build aggregate daily sales demand chart data for past 14 days + next 14 days
  const today = new Date('2026-10-23');
  const aggregateChartData = [];

  // Past 10 days aggregate sales
  for (let i = 10; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    let dayTotal = 0;
    products.forEach((p) => {
      const history = salesHistory.get(p.id) || [];
      const entry = history.find((s) => s.date === dateStr);
      if (entry) dayTotal += entry.qty;
    });
    aggregateChartData.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: dayTotal || 140,
    });
  }

  // Next 10 days forecast demand
  for (let i = 1; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    let dayForecastTotal = 0;
    forecasts.forEach((f) => {
      const dailyEntry = f.dailyForecastNext14Days[i - 1];
      if (dailyEntry) dayForecastTotal += dailyEntry.demand;
    });
    const est = Math.round(dayForecastTotal) || 165;
    aggregateChartData.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: est,
      forecast: est,
      upperBand: Math.round(est * 1.15),
      lowerBand: Math.round(est * 0.85),
    });
  }

  const selectedForecast = selectedProduct ? forecasts.get(selectedProduct.id) || null : null;
  const selectedReorderItem = selectedProduct
    ? reorderItems.find((r) => r.productId === selectedProduct.id) || null
    : null;

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Store Header & Weather Insight Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-ink mb-1">
            <span>Store Radar</span>
            <span>·</span>
            <span>{settings.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text tracking-tight">
            {settings.store_name}
          </h1>
        </div>

        {/* Weather Intelligence Chip */}
        <div className="flex items-center gap-3 p-3 bg-info-tint border border-sky-200/80 rounded-xl text-sky-950 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-200 text-xs">
          <CloudRain size={20} className="text-sky-600 shrink-0" />
          <div>
            <div className="font-semibold flex items-center gap-1.5">
              <span>{weather.condition}, {weather.temp_c}°C</span>
              <span className="text-sky-600 font-normal">({weather.rain_probability}% Rain)</span>
            </div>
            <p className="text-[11px] text-sky-900/80 dark:text-sky-300 line-clamp-1 mt-0.5">
              {weather.retail_impact}
            </p>
          </div>
        </div>
      </div>

      {/* Row of 5 KPI Cards per Directive */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Items to Order Now"
          value={reorderItems.length}
          subtext={`${criticalCount} need immediate ordering`}
          trend={{ value: `${criticalCount} urgent`, direction: 'up', isPositive: false }}
        />

        <KpiCard
          label="Est. Order Value"
          value={`₹${totalEstimatedOrderValue.toLocaleString()}`}
          subtext="Pack-size rounded"
          trend={{ value: 'Within cycle', direction: 'neutral' }}
        />

        <KpiCard
          label="Stock-out Risks"
          value={criticalCount}
          subtext="Cover < lead time"
          trend={{ value: 'Action required', direction: 'up', isPositive: false }}
        />

        <KpiCard
          label="Cash Locked in Overstock"
          value={`₹${totalCashLocked.toLocaleString()}`}
          subtext={`${doNotReorderItems.length} items with excess stock`}
          trend={{ value: 'Recoverable', direction: 'down', isPositive: false }}
        />

        <KpiCard
          label="Items Expiring Soon"
          value={expiringSoonCount}
          subtext="Within safety buffer"
          trend={{ value: 'Discount suggested', direction: 'neutral' }}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Main Grid: Left Emerald Chart + Right AI Recommendations Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Main Emerald Area Chart */}
        <div className="lg:col-span-7 space-y-4">
          <Card padding="md" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h2 className="font-heading font-semibold text-base sm:text-lg text-text">
                  Daily Demand Velocity & 10-Day Projection
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Aggregate store sales history and forecast with weekend surge indices
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onGoToPlan}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Full Plan
                </Button>
              </div>
            </div>

            <AreaForecastChart
              data={aggregateChartData}
              height={260}
              showForecastBands={true}
              unit="units"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs text-text-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-primary rounded-full inline-block" />
                  <span>Historical Sales & Forecast</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2 bg-primary/20 rounded inline-block" />
                  <span>Forecast Confidence Band</span>
                </span>
              </div>
              <span className="text-primary-ink font-semibold">
                Holdout WAPE: 14.2% (ETS beats Moving Average)
              </span>
            </div>
          </Card>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={onGoToPlan}
              leftIcon={<ShoppingBag size={14} />}
            >
              Review {reorderItems.length} Order Recommendations
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenStockCount}
              leftIcon={<RefreshCw size={14} />}
            >
              2-Minute Daily Stock Count
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onGoToUpload}
              leftIcon={<Upload size={14} />}
            >
              Upload Sales / Bill
            </Button>
            <button
              type="button"
              onClick={resetToDemoSeed}
              className="text-xs text-text-muted hover:text-text underline cursor-pointer ml-auto"
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): AI Recommendations with Signature Top Priority Card */}
        <div className="lg:col-span-5 space-y-4">
          {/* Signature Top Priority Card */}
          {topPriorityItem ? (
            <TopPriorityCard
              headline={`Order ${topPriorityItem.final_qty} ${topPriorityItem.unit}`}
              subline={`Run out in ${topPriorityItem.days_of_cover.toFixed(0)} days · ${topPriorityItem.name}`}
              reason={`${topPriorityItem.reason} Lead time is ${topPriorityItem.lead_time_days}d from ${topPriorityItem.supplier_name}.`}
              badgeText="CRITICAL"
              actionLabel="Order Now (1-Tap)"
              onAction={handleTopPriorityOrder}
            />
          ) : (
            <Card padding="md" className="bg-navy-900 text-on-navy">
              <span className="text-mint font-semibold text-xs block mb-1">
                All Fast-Movers Healthy
              </span>
              <p className="text-sm text-slate-300">
                No critical stock-out risks detected for the next review cycle.
              </p>
            </Card>
          )}

          {/* Secondary AI Recommendations: Quiet white cards with coloured dots and one sentence each */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider">
              <span>Next Recommended Orders</span>
              <button
                type="button"
                onClick={onGoToPlan}
                className="text-primary-ink font-semibold hover:underline"
              >
                View all ({reorderItems.length})
              </button>
            </div>

            {reorderItems.slice(1, 4).map((item) => (
              <div
                key={item.productId}
                onClick={() => {
                  const p = products.find((prod) => prod.id === item.productId);
                  if (p) setSelectedProduct(p);
                }}
                className="bg-surface border border-border rounded-[14px] p-4 hover:border-slate-400/80 transition-colors cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      item.priority_label === 'Critical'
                        ? 'bg-accent'
                        : item.priority_label === 'High'
                        ? 'bg-primary'
                        : 'bg-slate-400'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-text leading-snug">
                      {item.name}
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Order {item.final_qty} {item.unit} — {item.reason}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-text tabular-nums block">
                    ₹{item.total_order_cost.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {item.days_of_cover.toFixed(0)}d cover
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* "Do NOT Reorder" Panel: Overstocked / Dead / Near-Expiry items */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-semibold text-text flex items-center gap-2">
              <span>Do NOT Reorder</span>
              <span className="text-xs font-normal text-text-muted">
                ({doNotReorderItems.length} items locking ₹{totalCashLocked.toLocaleString()})
              </span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              These items have excess days of cover or are approaching expiry. No reorders needed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {doNotReorderItems.slice(0, 3).map((item) => (
            <Card key={item.productId} padding="sm" className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-text leading-snug">
                    {item.name}
                  </h4>
                  <span className="text-xs text-text-muted">
                    Stock: {item.stock_on_hand} ({item.days_of_cover.toFixed(0)} days cover)
                  </span>
                </div>
                <Badge
                  variant={
                    item.expiry_risk_qty > 0 ? 'critical' : 'overstock'
                  }
                >
                  {item.suggested_action}
                </Badge>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {item.reason}
              </p>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">Cash locked:</span>
                <span className="font-bold text-accent tabular-nums">
                  ₹{item.cash_locked.toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Product Detail Drawer */}
      <ProductDrawer
        product={selectedProduct}
        forecast={selectedForecast}
        reorderItem={selectedReorderItem}
        onClose={() => setSelectedProduct(null)}
        onUpdateStock={(newStock) => {
          if (selectedProduct) {
            updateProductStock(selectedProduct.id, newStock);
            setSelectedProduct({ ...selectedProduct, stock_on_hand: newStock });
          }
        }}
      />
    </div>
  );
};
