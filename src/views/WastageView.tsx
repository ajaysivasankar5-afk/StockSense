import React, { useState } from 'react';
import { AlertCircle, Trash2, Calendar, FileText, Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { WastageRecord } from '../types/inventory';

export const WastageView: React.FC = () => {
  const { products, wastageRecords, addWastageRecord } = useStore();
  const { success, error } = useToast();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState<WastageRecord['reason']>('Expired');
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Reasons per spec
  const reasonOptions: WastageRecord['reason'][] = [
    'Expired',
    'Damaged in store',
    'Spoiled/Mould',
    'Customer Return',
    'Handling Loss',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const wasteQty = parseFloat(qty);
    if (isNaN(wasteQty) || wasteQty <= 0) {
      error('Please enter a valid stock wasted quantity.');
      return;
    }

    const costVal = Math.round(wasteQty * selectedProduct.cost_price);

    addWastageRecord({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      qty: wasteQty,
      unit: selectedProduct.unit,
      reason,
      date: new Date().toISOString().split('T')[0],
      cost_value: costVal,
      notes: notes || undefined,
    });

    success(`Logged ${wasteQty} ${selectedProduct.unit} wastage (₹${costVal} value)`);
    setQty('');
    setNotes('');
  };

  const totalWastageCost = wastageRecords.reduce((acc, w) => acc + w.cost_value, 0);

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-ink mb-1">
            <span>Shrinkage Control</span>
            <span>·</span>
            <span>Loss Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text tracking-tight">
            Wastage & Expiry Tracker
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Log spoiled, broken, or expired items to refine future safety stock
            and shelf-life safety buffers.
          </p>
        </div>

        {/* Wasted value summary in amber, never red per directive */}
        <div className="p-3.5 bg-accent-tint border border-amber-300/80 rounded-xl text-amber-950 dark:bg-amber-950/40 dark:border-amber-700/60 dark:text-amber-200">
          <span className="text-xs font-semibold block uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Total Logged Wastage Value
          </span>
          <span className="font-heading font-bold text-2xl text-accent tabular-nums">
            ₹{totalWastageCost.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Simple Form Card on top per Directive */}
      <Card padding="md">
        <h2 className="text-base font-heading font-semibold text-text mb-4">
          Record New Stock Wastage
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item selector */}
            <div>
              <label
                htmlFor="product-select"
                className="block text-[13px] font-semibold text-text mb-1.5"
              >
                Select Product
              </label>
              <select
                id="product-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-surface-soft border border-border text-text rounded-lg py-2.5 px-3.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary-ring outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stock_on_hand} {p.unit} in stock)
                  </option>
                ))}
              </select>
            </div>

            {/* Qty wasted */}
            <div>
              <Input
                label={`Quantity Wasted (${selectedProduct?.unit || 'units'})`}
                type="number"
                step="any"
                min="0.1"
                placeholder="e.g. 2"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Reason Chips */}
          <div>
            <label className="block text-[13px] font-semibold text-text mb-2">
              Reason for Wastage
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {reasonOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    reason === r
                      ? 'bg-navy-900 text-white dark:bg-mint dark:text-navy-900 font-semibold'
                      : 'bg-surface-soft border border-border text-text-muted hover:text-text'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <Input
              label="Incident Notes (Optional)"
              placeholder="e.g. Fridge unchilled overnight during power outage"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-text-muted">
              {qty && selectedProduct && (
                <span>
                  Estimated Cost: <strong className="text-accent font-bold tabular-nums">₹{Math.round(parseFloat(qty || '0') * selectedProduct.cost_price)}</strong>
                </span>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
            >
              Record Wastage
            </Button>
          </div>
        </form>
      </Card>

      {/* Quiet Table Below per Directive */}
      <Card padding="md" className="space-y-4">
        <h3 className="font-heading font-semibold text-base text-text">
          Historical Wastage Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-soft border-b border-border text-text-muted font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3 text-right">Units Lost</th>
                {/* Wasted value shown in amber, never red per Directive */}
                <th className="py-2.5 px-3 text-right">Wasted Value</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {wastageRecords.map((w) => (
                <tr key={w.id} className="h-12 hover:bg-surface-soft/40">
                  <td className="py-2.5 px-3 tabular-nums text-text-muted">
                    {w.date}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-text">
                    {w.productName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-surface-soft border border-border text-text-muted text-[11px]">
                      {w.reason}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium text-text">
                    {w.qty} {w.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-accent">
                    ₹{w.cost_value.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-text-muted text-[11px] truncate max-w-xs">
                    {w.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
