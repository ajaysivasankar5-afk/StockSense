import React from 'react';
import { X, Calendar, Clock, AlertTriangle, ShieldCheck, Tag, Star } from 'lucide-react';
import { Product, ForecastResult, ReorderItem } from '../../types/inventory';
import { Badge } from '../ui/Badge';
import { AreaForecastChart } from '../ui/Chart';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../ui/Toast';

export interface ProductDrawerProps {
  product: Product | null;
  forecast: ForecastResult | null;
  reorderItem: ReorderItem | null;
  onClose: () => void;
  onUpdateStock: (newStock: number) => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  product,
  forecast,
  reorderItem,
  onClose,
  onUpdateStock,
}) => {
  const { suppliers, primarySupplier, addToOldStock, removeFromOldStock } = useStore();
  const { success } = useToast();

  if (!product) return null;

  const currentSupplier = suppliers.find((s) => s.id === product.supplier_id || s.name === product.supplier_name);
  const isPrimarySupplier = currentSupplier?.is_primary || primarySupplier?.id === product.supplier_id;

  // Prepare chart data combining past 14 days + next 14 days forecast
  const chartData = [
    ...(forecast?.pastSales?.slice(-10).map((s) => ({
      label: s.date.slice(5),
      value: s.qty,
    })) || []),
    ...(forecast?.dailyForecastNext14Days?.slice(0, 10).map((f) => ({
      label: f.date.slice(5),
      value: f.demand,
      forecast: f.demand,
      upperBand: f.upperBand,
      lowerBand: f.lowerBand,
    })) || []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      {/* Dimmed overlay */}
      <div
        className="fixed inset-0 bg-navy-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-surface h-full shadow-[0_8px_30px_rgba(15,23,42,0.12)] border-l border-border z-10 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between gap-4 sticky top-0 bg-surface z-20">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {product.sku}
              </span>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs font-medium text-text-muted">
                {product.category}
              </span>
            </div>
            <h2 className="text-xl font-heading font-semibold text-text leading-snug">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-text-muted">
                Supplier: <span className="font-medium text-text">{product.supplier_name}</span>
              </p>
              {isPrimarySupplier && (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold rounded flex items-center gap-1">
                  <Star size={10} className="fill-emerald-600 stroke-emerald-600" />
                  Primary Supplier
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text p-2 rounded-lg hover:bg-surface-soft transition-colors"
            aria-label="Close drawer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Old Stock Lifecycle Action Block */}
          <div className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
                <Tag size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Old Stock Lifecycle</span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                {product.is_old_stock
                  ? `Marked as old stock since ${product.old_stock_added_at || 'recent'}`
                  : 'Tag item as stagnant inventory for clearance audit'}
              </p>
            </div>
            {product.is_old_stock ? (
              <button
                type="button"
                onClick={() => {
                  removeFromOldStock(product.id);
                  success(`Removed ${product.name} from Old Stock`);
                }}
                className="px-3 py-1.5 bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Remove Old Stock
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  addToOldStock(product.id, undefined, 'Tagged manually in item drawer');
                  success(`Added ${product.name} to Old Stock`);
                }}
                className="px-3 py-1.5 bg-navy-900 text-white dark:bg-mint dark:text-navy-900 hover:opacity-90 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Add this to Old Stock
              </button>
            )}
          </div>
          {/* Status summary banner */}
          {reorderItem && (
            <div
              className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                reorderItem.priority_label === 'Critical'
                  ? 'bg-accent-tint border-amber-300/80 text-amber-950 dark:bg-amber-950/30 dark:text-amber-200'
                  : 'bg-primary-tint border-emerald-300/80 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      reorderItem.priority_label === 'Critical' ? 'critical' : 'ok'
                    }
                  >
                    {reorderItem.priority_label}
                  </Badge>
                  <span className="text-xs font-semibold">
                    Stockout in {reorderItem.days_of_cover.toFixed(0)} days
                  </span>
                </div>
                <p className="text-sm font-medium mt-1.5">{reorderItem.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-text-muted block">Recommended</span>
                <span className="font-heading font-bold text-2xl text-text tabular-nums">
                  {reorderItem.final_qty}{' '}
                  <span className="text-xs font-normal text-text-muted">
                    {product.unit}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Quick Stock on Hand Counter */}
          <div className="bg-surface-soft border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Current Stock on Hand
              </span>
              <span className="text-2xl font-heading font-bold text-text tabular-nums">
                {product.stock_on_hand}{' '}
                <span className="text-sm font-normal text-text-muted">
                  {product.unit}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateStock(Math.max(0, product.stock_on_hand - 1))}
                className="w-9 h-9 rounded-lg bg-surface border border-border text-text font-bold hover:bg-slate-200 transition-colors flex items-center justify-center text-base"
                title="Decrease stock"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => onUpdateStock(product.stock_on_hand + 1)}
                className="w-9 h-9 rounded-lg bg-surface border border-border text-text font-bold hover:bg-slate-200 transition-colors flex items-center justify-center text-base"
                title="Increase stock"
              >
                +
              </button>
            </div>
          </div>

          {/* Forecast & Stock Projection Chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-heading font-semibold text-text">
                Demand History & 14-Day Forecast
              </span>
              <span className="text-xs text-primary-ink font-medium">
                {forecast?.method || 'Holt-Winters ETS'}
              </span>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <AreaForecastChart
                data={chartData}
                height={200}
                showForecastBands={true}
                reorderPoint={reorderItem?.reorder_point}
                currentStock={product.stock_on_hand}
                shelfLifeDayIndex={
                  product.shelf_life_days && product.shelf_life_days <= 14
                    ? 10 + product.shelf_life_days
                    : undefined
                }
                unit={product.unit}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-border text-xs text-text-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-primary rounded-full inline-block" />
                  <span>Forecast Demand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-navy-900 dark:bg-slate-300 rounded-full inline-block" />
                  <span>ROP ({reorderItem?.reorder_point || 0})</span>
                </div>
                {product.shelf_life_days && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-accent rounded-full inline-block" />
                    <span>Shelf Life ({product.shelf_life_days}d)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mathematical Factor Breakdown */}
          {reorderItem && (
            <div className="space-y-3">
              <span className="text-sm font-heading font-semibold text-text block">
                Why this quantity? (Calculation Breakdown)
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-surface-soft border border-border rounded-lg">
                  <span className="text-text-muted block">Daily Sales Rate</span>
                  <span className="text-base font-bold text-text tabular-nums">
                    {reorderItem.daily_demand} {product.unit}/day
                  </span>
                </div>
                <div className="p-3 bg-surface-soft border border-border rounded-lg">
                  <span className="text-text-muted block">Supplier Lead Time</span>
                  <span className="text-base font-bold text-text tabular-nums">
                    {product.lead_time_days} days
                  </span>
                </div>
                <div className="p-3 bg-surface-soft border border-border rounded-lg">
                  <span className="text-text-muted block">Safety Stock (SS)</span>
                  <span className="text-base font-bold text-text tabular-nums">
                    {reorderItem.safety_stock} {product.unit}
                  </span>
                </div>
                <div className="p-3 bg-surface-soft border border-border rounded-lg">
                  <span className="text-text-muted block">Reorder Point (ROP)</span>
                  <span className="text-base font-bold text-text tabular-nums">
                    {reorderItem.reorder_point} {product.unit}
                  </span>
                </div>
              </div>

              {/* Priority Score Breakdown */}
              <div className="p-4 bg-surface border border-border rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text">
                    Priority Score: {reorderItem.priority_score} / 100
                  </span>
                  <span className="text-[11px] text-text-muted">
                    0.45·Urgency + 0.35·Margin + 0.20·Velocity
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-text-muted mb-1">
                      <span>Urgency ({reorderItem.days_of_cover.toFixed(1)}d cover vs {product.lead_time_days}d lead)</span>
                      <span className="tabular-nums font-semibold text-text">
                        {reorderItem.score_breakdown.urgency}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-soft h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-accent h-full rounded-full"
                        style={{ width: `${reorderItem.score_breakdown.urgency}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-text-muted mb-1">
                      <span>Profit-at-Risk (₹{reorderItem.profit_at_risk})</span>
                      <span className="tabular-nums font-semibold text-text">
                        {reorderItem.score_breakdown.profit_risk}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-soft h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${reorderItem.score_breakdown.profit_risk}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-text-muted mb-1">
                      <span>Sales Velocity Share</span>
                      <span className="tabular-nums font-semibold text-text">
                        {reorderItem.score_breakdown.velocity}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-soft h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-navy-900 dark:bg-slate-300 h-full rounded-full"
                        style={{ width: `${reorderItem.score_breakdown.velocity}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Perishable info & Constraints */}
          <div className="p-4 bg-surface-soft border border-border rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-text font-semibold">
              <ShieldCheck size={16} className="text-primary-ink" />
              <span>Ordering Constraints</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-text-muted pt-1">
              <div>Pack size: <span className="font-semibold text-text">{product.pack_size} {product.unit}</span></div>
              <div>Min Order Qty (MOQ): <span className="font-semibold text-text">{product.moq} {product.unit}</span></div>
              <div>Cost price: <span className="font-semibold text-text">₹{product.cost_price}</span></div>
              <div>Selling price: <span className="font-semibold text-text">₹{product.selling_price}</span></div>
            </div>
            {product.shelf_life_days && (
              <div className="mt-2 pt-2 border-t border-border text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0" />
                <span>
                  Shelf life is {product.shelf_life_days} days. Orders strictly capped to prevent unsellable expiry waste.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
