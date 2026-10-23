import React, { useState, useMemo } from 'react';
import {
  Clock,
  Package,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Trash2,
  Send,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Product } from '../types/inventory';

export const StockAgingReportView: React.FC = () => {
  const { products, updateProductStock, removeOldStock, addToOldStock } = useStore();
  const { success, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'old' | 'new'>('old');
  const [selectedRemovalProduct, setSelectedRemovalProduct] = useState<Product | null>(null);
  const [removalUnits, setRemovalUnits] = useState<string>('');
  const [removalType, setRemovalType] = useState<'dispose' | 'return_supplier' | 'clearance'>('dispose');
  const [removalNotes, setRemovalNotes] = useState('');

  // Add Item to Old Stock Modal State
  const [isAddOldStockOpen, setIsAddOldStockOpen] = useState(false);
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] = useState<string>('');
  const [addNotes, setAddNotes] = useState('');

  const today = new Date('2026-10-23');

  // Helper to calculate days between dates
  const calculateDaysInStock = (receivedDate?: string) => {
    if (!receivedDate) return 10;
    const rec = new Date(receivedDate);
    const diffTime = Math.abs(today.getTime() - rec.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Partition products into Old Stocks (>= 14 days) and New Stocks (< 14 days)
  const { oldStocks, newStocks } = useMemo(() => {
    const oldList: (Product & { daysInStock: number; capitalLocked: number })[] = [];
    const newList: (Product & { daysInStock: number; capitalValue: number })[] = [];

    products.forEach((p) => {
      const days = calculateDaysInStock(p.received_date);
      if (days >= 14) {
        oldList.push({
          ...p,
          daysInStock: days,
          capitalLocked: p.stock_on_hand * p.cost_price,
        });
      } else {
        newList.push({
          ...p,
          daysInStock: days,
          capitalValue: p.stock_on_hand * p.cost_price,
        });
      }
    });

    // Sort old stocks by days in stock descending (oldest first)
    oldList.sort((a, b) => b.daysInStock - a.daysInStock);
    // Sort new stocks by received date descending (newest first)
    newList.sort((a, b) => a.daysInStock - b.daysInStock);

    return { oldStocks: oldList, newStocks: newList };
  }, [products]);

  // Aggregate Metrics
  const totalOldCapital = oldStocks.reduce((acc, p) => acc + p.capitalLocked, 0);
  const totalNewCapital = newStocks.reduce((acc, p) => acc + p.capitalValue, 0);

  // Handle open removal modal
  const handleOpenRemovalModal = (prod: Product) => {
    setSelectedRemovalProduct(prod);
    setRemovalUnits(String(prod.stock_on_hand));
    setRemovalType(prod.shelf_life_days ? 'dispose' : 'return_supplier');
    setRemovalNotes('');
  };

  // Submit stock removal after 2-week threshold
  const handleConfirmRemoval = () => {
    if (!selectedRemovalProduct) return;
    const units = parseInt(removalUnits) || 0;
    if (units <= 0) {
      warning('Please enter a valid removal quantity.');
      return;
    }

    const previousStock = selectedRemovalProduct.stock_on_hand;
    const updatedStock = Math.max(0, previousStock - units);

    removeOldStock(
      selectedRemovalProduct.id,
      units,
      removalType,
      removalNotes || undefined
    );

    // Update product stock on hand
    updateProductStock(selectedRemovalProduct.id, updatedStock);

    success(
      `Removed ${units} units of ${selectedRemovalProduct.name} (> 2 weeks duration).`,
      {
        label: 'Undo',
        onClick: () => updateProductStock(selectedRemovalProduct.id, previousStock),
      }
    );

    setSelectedRemovalProduct(null);
  };

  // Export Stock Aging CSV Report
  const handleExportReport = () => {
    let csv = 'Stock Aging & Inventory Lifecycle Report,Date: ' + new Date().toISOString().split('T')[0] + '\n\n';
    csv += 'OLD STOCKS (>= 14 Days Stagnant Queue)\n';
    csv += 'S.No,SKU,Product Name,Supplier,Days on Shelf,Stock on Hand,Cost Price,Capital Locked (INR)\n';
    oldStocks.forEach((item, idx) => {
      csv += `${idx + 1},"${item.sku}","${item.name}","${item.supplier_name}",${item.daysInStock},${item.stock_on_hand},${item.cost_price},${item.capitalLocked}\n`;
    });
    csv += `Total Old Capital Locked,₹${totalOldCapital}\n\n`;

    csv += 'NEW STOCKS (< 14 Days Fresh Arrivals)\n';
    csv += 'S.No,SKU,Product Name,Supplier,Received Date,Days in Stock,Stock on Hand,Stock Value (INR)\n';
    newStocks.forEach((item, idx) => {
      csv += `${idx + 1},"${item.sku}","${item.name}","${item.supplier_name}","${item.received_date || ''}",${item.daysInStock},${item.stock_on_hand},${item.capitalValue}\n`;
    });
    csv += `Total Fresh Capital,₹${totalNewCapital}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Stock_Aging_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Stock Aging Report CSV exported successfully!');
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-ink mb-1">
            <span>Inventory Lifecycle Audit</span>
            <span>·</span>
            <span>2-Week Threshold</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text tracking-tight">
            Old Stocks vs. New Stocks Report
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Separate lifecycle reporting for new stock arrivals and stagnant inventory.
            Old stocks held for over 2 weeks are queued for clearance or supplier removal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={handleExportReport}
            leftIcon={<Download size={14} />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm" className="border-l-2 border-l-accent">
          <span className="text-xs font-semibold text-text-muted block">
            Old Stocks (≥ 14 Days)
          </span>
          <div className="font-heading font-bold text-2xl text-accent tabular-nums mt-1">
            {oldStocks.length} Items
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            Stagnant on shelves
          </span>
        </Card>

        <Card padding="sm" className="border-l-2 border-l-accent">
          <span className="text-xs font-semibold text-text-muted block">
            Old Capital Locked
          </span>
          <div className="font-heading font-bold text-2xl text-text tabular-nums mt-1">
            ₹{totalOldCapital.toLocaleString()}
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            Awaiting removal decision
          </span>
        </Card>

        <Card padding="sm" className="border-l-2 border-l-primary">
          <span className="text-xs font-semibold text-text-muted block">
            New Stocks (&lt; 14 Days)
          </span>
          <div className="font-heading font-bold text-2xl text-primary-ink tabular-nums mt-1">
            {newStocks.length} Items
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            Fresh retail batches
          </span>
        </Card>

        <Card padding="sm" className="border-l-2 border-l-primary">
          <span className="text-xs font-semibold text-text-muted block">
            New Capital Turnover
          </span>
          <div className="font-heading font-bold text-2xl text-text tabular-nums mt-1">
            ₹{totalNewCapital.toLocaleString()}
          </div>
          <span className="text-[11px] text-text-muted mt-1 block">
            Active velocity
          </span>
        </Card>
      </div>

      {/* View Switcher Tabs (Buttons with segmented active state per directive) */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('old')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'old'
                ? 'bg-navy-900 text-white dark:bg-mint dark:text-navy-900 shadow-sm'
                : 'bg-surface border border-border text-text-muted hover:text-text'
            }`}
          >
            <AlertTriangle size={15} className="text-accent" />
            <span>Old Stocks ({oldStocks.length})</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-accent/20 text-accent rounded-full">
              2+ Wks
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'new'
                ? 'bg-navy-900 text-white dark:bg-mint dark:text-navy-900 shadow-sm'
                : 'bg-surface border border-border text-text-muted hover:text-text'
            }`}
          >
            <CheckCircle2 size={15} className="text-primary-ink" />
            <span>New Stocks ({newStocks.length})</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-primary/20 text-primary-ink rounded-full">
              Recent
            </span>
          </button>
        </div>

        <span className="text-xs text-text-muted hidden sm:inline-block">
          {activeTab === 'old'
            ? 'Action: Ask for removal after 14-day duration'
            : 'Turnover tracking for fresh stock'}
        </span>
      </div>

      {/* Tab 1: Old Stocks & 2-Week Removal Queue */}
      {activeTab === 'old' && (
        <div className="space-y-4">
          <div className="p-4 bg-accent-tint border border-amber-300/80 rounded-xl text-amber-950 dark:bg-amber-950/40 dark:border-amber-700/60 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold block text-sm mb-0.5">
                2-Week Duration Threshold Exceeded
              </span>
              <p className="text-amber-900 dark:text-amber-300 text-[11px] leading-relaxed">
                The items below have been resting in inventory for 14 or more days with sluggish velocity.
                Store policy asks for clearance removal, return to supplier, or deep discount write-off to free locked cash.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setSelectedProductIdToAdd(products[0]?.id || '');
                  setAddNotes('');
                  setIsAddOldStockOpen(true);
                }}
                leftIcon={<AlertTriangle size={14} />}
              >
                + Add Item to Old Stock
              </Button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-soft border-b border-border text-text-muted font-semibold">
                    <th className="py-3 px-4 w-12 text-center">S.No</th>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Shelf Duration</th>
                    <th className="py-3 px-4 text-right">Units on Hand</th>
                    <th className="py-3 px-4 text-right">Capital Locked</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-right">Removal Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {oldStocks.map((item, idx) => {
                    const daysOverdue = item.daysInStock - 14;
                    return (
                      <tr
                        key={`old_${item.id}_${idx}`}
                        className="h-16 hover:bg-surface-soft/60 transition-colors"
                      >
                        <td className="py-2.5 px-4 text-center tabular-nums text-text-muted font-medium">
                          {idx + 1}
                        </td>

                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-text leading-snug">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-text-muted">
                            {item.sku} · {item.category}
                          </div>
                        </td>

                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Badge variant={item.daysInStock >= 28 ? 'danger' : 'critical'}>
                              {item.daysInStock} days on shelf
                            </Badge>
                          </div>
                          <span className="text-[11px] text-amber-800 dark:text-amber-300 block mt-0.5">
                            {daysOverdue > 0
                              ? `+${daysOverdue} days past 2-week limit`
                              : 'Reached 2-week limit'}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 text-right tabular-nums font-bold text-text">
                          {item.stock_on_hand} {item.unit}
                        </td>

                        <td className="py-2.5 px-4 text-right tabular-nums font-bold text-accent">
                          ₹{item.capitalLocked.toLocaleString()}
                        </td>

                        <td className="py-2.5 px-4 text-text-muted text-[11px]">
                          {item.supplier_name}
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenRemovalModal(item)}
                            leftIcon={<Trash2 size={13} />}
                          >
                            Ask for Removal
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals Summary Row */}
            <div className="p-4 bg-surface-soft border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">
                Total Stagnant Capital in Old Stocks:
              </span>
              <span className="font-heading font-bold text-base text-accent tabular-nums">
                ₹{totalOldCapital.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: New Stocks Report */}
      {activeTab === 'new' && (
        <div className="space-y-4">
          <div className="p-4 bg-primary-tint border border-emerald-300/80 rounded-xl text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-700/60 dark:text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold block text-sm mb-0.5">
                Fresh Inventory Arrivals (Past 14 Days)
              </span>
              <p className="text-emerald-900 dark:text-emerald-300 text-[11px] leading-relaxed">
                Active shipments received within the last 14 days. Monitored for turnover rate and sales velocity.
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-soft border-b border-border text-text-muted font-semibold">
                    <th className="py-3 px-4 w-12 text-center">S.No</th>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Received On</th>
                    <th className="py-3 px-4 text-right">Stock on Hand</th>
                    <th className="py-3 px-4 text-right">Stock Value</th>
                    <th className="py-3 px-4">Turnover Health</th>
                    <th className="py-3 px-4">Supplier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {newStocks.map((item, idx) => (
                    <tr
                      key={`new_${item.id}_${idx}`}
                      className="h-14 hover:bg-surface-soft/60 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-center tabular-nums text-text-muted font-medium">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-text">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {item.sku} · {item.category}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="tabular-nums font-medium text-text">
                          {item.received_date || 'Recent'}
                        </span>
                        <span className="text-[11px] text-text-muted block">
                          ({item.daysInStock} days ago)
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right tabular-nums font-bold text-text">
                        {item.stock_on_hand} {item.unit}
                      </td>

                      <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-text">
                        ₹{item.capitalValue.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-4">
                        <Badge variant="ok">
                          Fresh · Healthy Turnover
                        </Badge>
                      </td>

                      <td className="py-2.5 px-4 text-text-muted text-[11px]">
                        {item.supplier_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary Row */}
            <div className="p-4 bg-primary-tint border-t border-emerald-300/80 flex items-center justify-between text-xs">
              <span className="text-primary-ink font-semibold">
                Total Fresh Capital in New Stocks:
              </span>
              <span className="font-heading font-bold text-base text-primary-ink tabular-nums">
                ₹{totalNewCapital.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2-Week Removal Confirmation Modal */}
      {selectedRemovalProduct && (
        <Modal
          isOpen={!!selectedRemovalProduct}
          onClose={() => setSelectedRemovalProduct(null)}
          title={`Removal Action: ${selectedRemovalProduct.name}`}
          description={`Item has exceeded the 2-week shelf duration (${calculateDaysInStock(
            selectedRemovalProduct.received_date
          )} days on shelf). Select clearance disposition.`}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-surface-soft border border-border rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Current Stock on Hand:</span>
                <span className="font-bold text-text">
                  {selectedRemovalProduct.stock_on_hand} {selectedRemovalProduct.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Locked Capital Value:</span>
                <span className="font-bold text-accent">
                  ₹{(
                    selectedRemovalProduct.stock_on_hand *
                    selectedRemovalProduct.cost_price
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Supplier:</span>
                <span className="font-medium text-text">
                  {selectedRemovalProduct.supplier_name}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">
                Removal Disposition
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-soft">
                  <input
                    type="radio"
                    name="removalType"
                    checked={removalType === 'dispose'}
                    onChange={() => setRemovalType('dispose')}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-semibold text-text block">
                      Disposal / Expiry Write-Off
                    </span>
                    <span className="text-text-muted text-[11px]">
                      Remove from shelf and log to shrinkage record
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-soft">
                  <input
                    type="radio"
                    name="removalType"
                    checked={removalType === 'return_supplier'}
                    onChange={() => setRemovalType('return_supplier')}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-semibold text-text block">
                      Return to Supplier
                    </span>
                    <span className="text-text-muted text-[11px]">
                      Dispatch return note to {selectedRemovalProduct.supplier_name}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-surface cursor-pointer hover:bg-surface-soft">
                  <input
                    type="radio"
                    name="removalType"
                    checked={removalType === 'clearance'}
                    onChange={() => setRemovalType('clearance')}
                    className="accent-primary"
                  />
                  <div>
                    <span className="font-semibold text-text block">
                      Flash Clearance Sale
                    </span>
                    <span className="text-text-muted text-[11px]">
                      Clear units at cost/discount to recover locked cash
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">
                Units to Remove ({selectedRemovalProduct.unit})
              </label>
              <input
                type="number"
                min="1"
                max={selectedRemovalProduct.stock_on_hand}
                value={removalUnits}
                onChange={(e) => setRemovalUnits(e.target.value)}
                className="w-full bg-surface-soft border border-border text-text rounded-lg py-2.5 px-3.5 text-sm outline-none focus:border-primary tabular-nums font-bold"
              />
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedRemovalProduct(null)}
              >
                Cancel
              </Button>
              <Button
                size="md"
                variant="danger"
                onClick={handleConfirmRemoval}
                leftIcon={<Trash2 size={16} />}
              >
                Confirm Stock Removal
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manual Add to Old Stock Modal */}
      {isAddOldStockOpen && (
        <Modal
          isOpen={isAddOldStockOpen}
          onClose={() => setIsAddOldStockOpen(false)}
          title="Add Item to Old Stock Registry"
          description="Select any registered item from inventory to manually classify as Old Stock (> 14 days duration)."
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Select Product
              </label>
              <select
                value={selectedProductIdToAdd}
                onChange={(e) => setSelectedProductIdToAdd(e.target.value)}
                className="w-full bg-surface-soft border border-border text-text rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — {p.stock_on_hand} {p.unit} on hand (Supplier: {p.supplier_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Notes / Reason for Old Stock Classification (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Slow turnover, packaging wear, supplier change pending..."
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                className="w-full bg-surface-soft border border-border text-text rounded-lg p-2.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddOldStockOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  if (selectedProductIdToAdd) {
                    addToOldStock(selectedProductIdToAdd, undefined, addNotes);
                    const prodName = products.find((p) => p.id === selectedProductIdToAdd)?.name || 'Item';
                    success(`Added ${prodName} to Old Stock`);
                    setIsAddOldStockOpen(false);
                  }
                }}
              >
                Add to Old Stock
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
