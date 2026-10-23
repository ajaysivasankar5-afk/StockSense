import React, { useState, useRef } from 'react';
import {
  CloudRain,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Info,
  Building,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { ReorderItem } from '../types/inventory';

export const AiReportView: React.FC = () => {
  const {
    settings,
    reorderItems,
    doNotReorderItems,
    weather,
    totalEstimatedOrderValue,
    criticalCount,
    highCount,
    overrideReorderQty,
    markAsOrdered,
    undoMarkAsOrdered,
    orderHistory,
  } = useStore();

  const { success, warning } = useToast();

  const [showFormula, setShowFormula] = useState(false);
  const [groupBySupplier, setGroupBySupplier] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Mark as Ordered
  const handleMarkAsOrdered = () => {
    const res = markAsOrdered();
    success(
      `Marked ${res.count} items as Ordered (Total: ₹${res.totalAmount.toLocaleString()})`,
      {
        label: 'Undo',
        onClick: () => undoMarkAsOrdered(res.orderId),
      }
    );
  };

  // Generate crisp 1080px Report PNG via Canvas per Directive
  const generateReportPng = () => {
    setIsGeneratingPng(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    const rowHeight = 44;
    const itemsToDraw = reorderItems.filter((it) => it.final_qty > 0);
    const headerHeight = 220;
    const totalsHeight = 80;
    const footerHeight = 60;
    canvas.height = headerHeight + Math.max(1, itemsToDraw.length) * rowHeight + totalsHeight + footerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingPng(false);
      return;
    }

    // 1. Signature Gradient / Navy Header
    const grad = ctx.createLinearGradient(0, 0, 1080, headerHeight);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.55, '#0F2A2A');
    grad.addColorStop(1, '#064E3B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, headerHeight);

    // Header Content
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Poppins", sans-serif';
    ctx.fillText('Stock', 48, 70);
    ctx.fillStyle = '#10B981';
    ctx.fillText('Sense', 158, 70);

    ctx.fillStyle = '#6EE7B7';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('DAILY REORDER PLAN · QUANTIX 2K26 PS11', 48, 105);

    ctx.fillStyle = '#F1F5F9';
    ctx.font = 'bold 24px "Poppins", sans-serif';
    ctx.fillText(settings.store_name, 48, 150);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '15px "Inter", sans-serif';
    const todayStr = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillText(`${todayStr} · ${settings.city}`, 48, 182);

    // Weather pill in header
    ctx.fillStyle = '#1E293B';
    ctx.roundRect(820, 48, 210, 68, 10);
    ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 15px "Inter", sans-serif';
    ctx.fillText(`${weather.condition}, ${weather.temp_c}°C`, 840, 78);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText(`Rain: ${weather.rain_probability}% | Hum: ${weather.humidity}%`, 840, 100);

    // 2. White Table Background
    let currentY = headerHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, currentY, 1080, canvas.height - currentY);

    // Table Header Row
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, currentY, 1080, 52);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, currentY + 52);
    ctx.lineTo(1080, currentY + 52);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.fillText('S.NO', 48, currentY + 32);
    ctx.fillText('ITEM & SPECIFICATION', 110, currentY + 32);
    ctx.fillText('SUPPLIER', 480, currentY + 32);
    ctx.textAlign = 'right';
    ctx.fillText('ON HAND', 680, currentY + 32);
    ctx.fillText('ORDER QTY', 820, currentY + 32);
    ctx.fillText('EST. COST', 1030, currentY + 32);
    ctx.textAlign = 'left';

    currentY += 52;

    // Line items
    itemsToDraw.forEach((item, idx) => {
      // Row divider
      ctx.strokeStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.moveTo(48, currentY + rowHeight);
      ctx.lineTo(1032, currentY + rowHeight);
      ctx.stroke();

      ctx.font = '14px "Inter", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(String(idx + 1), 48, currentY + 28);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText(item.name.slice(0, 38), 110, currentY + 28);

      ctx.fillStyle = '#64748B';
      ctx.font = '13px "Inter", sans-serif';
      ctx.fillText(item.supplier_name.slice(0, 20), 480, currentY + 28);

      ctx.textAlign = 'right';
      ctx.fillText(`${item.stock_on_hand} ${item.unit}`, 680, currentY + 28);

      ctx.fillStyle = '#047857';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText(`${item.final_qty} ${item.unit}`, 820, currentY + 28);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText(`₹${item.total_order_cost.toLocaleString()}`, 1030, currentY + 28);
      ctx.textAlign = 'left';

      currentY += rowHeight;
    });

    // Emerald Totals Row per Directive
    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(0, currentY, 1080, totalsHeight);
    ctx.strokeStyle = '#A7F3D0';
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(1080, currentY);
    ctx.stroke();

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 18px "Poppins", sans-serif';
    ctx.fillText(`TOTAL: ${itemsToDraw.length} ITEMS TO DISPATCH`, 48, currentY + 46);

    ctx.textAlign = 'right';
    ctx.font = 'bold 24px "Poppins", sans-serif';
    ctx.fillText(`₹${totalEstimatedOrderValue.toLocaleString()}`, 1030, currentY + 48);
    ctx.textAlign = 'left';

    currentY += totalsHeight;

    // Clean Footer
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, currentY, 1080, footerHeight);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText('Generated by StockSense · Small-Retail Demand & Replenishment Intelligence', 48, currentY + 36);

    // Download trigger
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `stocksense_reorder_${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
    setIsGeneratingPng(false);
    success('Crisp 1080px Report PNG downloaded!');
  };

  // WhatsApp share text generator
  const handleWhatsAppShare = (supplierName?: string) => {
    let itemsForSupplier = reorderItems.filter((it) => it.final_qty > 0);
    if (supplierName) {
      itemsForSupplier = itemsForSupplier.filter((it) => it.supplier_name === supplierName);
    }

    if (!itemsForSupplier.length) {
      warning('No items to order for this supplier.');
      return;
    }

    let text = `*STOCKSENSE PURCHASE ORDER*\nStore: ${settings.store_name}\nDate: ${new Date().toLocaleDateString()}\n\n`;
    text += `Please dispatch the following units:\n`;
    itemsForSupplier.forEach((item, idx) => {
      text += `${idx + 1}. *${item.name}* - ${item.final_qty} ${item.unit} (Pack: ${item.pack_size})\n`;
    });
    text += `\n*Total Order Estimate:* ₹${itemsForSupplier
      .reduce((a, b) => a + b.total_order_cost, 0)
      .toLocaleString()}\n`;
    text += `Sent via StockSense Reorder Planner`;

    navigator.clipboard.writeText(text);
    success('WhatsApp order text copied to clipboard! Paste into chat with supplier.');
  };

  // Export CSV
  const handleExportCsv = () => {
    let csv = 'S.No,Product,SKU,Supplier,Stock on Hand,Recommended Qty,Final Order Qty,Unit,Cost Price,Total Cost,Priority,Order By\n';
    reorderItems.forEach((it, idx) => {
      csv += `${idx + 1},"${it.name}","${it.sku}","${it.supplier_name}",${it.stock_on_hand},${it.recommended_qty},${it.final_qty},"${it.unit}",${it.cost_price},${it.total_order_cost},"${it.priority_label}","${it.order_by_date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `stocksense_order_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Reorder plan CSV exported');
  };

  // Group items by supplier if requested
  const supplierGroups = React.useMemo(() => {
    const map = new Map<string, ReorderItem[]>();
    reorderItems.forEach((item) => {
      const list = map.get(item.supplier_name) || [];
      list.push(item);
      map.set(item.supplier_name, list);
    });
    return map;
  }, [reorderItems]);

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* 1. Weather strip at top in --info-tint per Directive */}
      <div className="p-4 bg-info-tint border border-sky-200/80 rounded-xl text-sky-950 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CloudRain size={24} className="text-sky-600 shrink-0" />
          <div>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <span>{weather.city}: {weather.condition}</span>
              <span className="text-sky-700 dark:text-sky-300 font-normal">
                · {weather.temp_c}°C · Rain {weather.rain_probability}% · Humidity {weather.humidity}%
              </span>
            </div>
            <p className="text-xs text-sky-900/80 dark:text-sky-300 mt-0.5">
              {weather.retail_impact}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="info">Weather Informed</Badge>
        </div>
      </div>

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-ink mb-1">
            <span>Optimal Replenishment Plan</span>
            <span>·</span>
            <span>Shelf-Life Capped</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text tracking-tight">
            Ranked Reorder List & Purchase Orders
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {reorderItems.length} registered items listed · {reorderItems.filter((i) => i.final_qty > 0).length} flagged for order ({criticalCount} critical)
          </p>
        </div>

        {/* Primary Action Button in Emerald with Navy Text per Directive */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={handleMarkAsOrdered}
            leftIcon={<CheckCircle2 size={16} strokeWidth={2} />}
          >
            Mark as Ordered (₹{totalEstimatedOrderValue.toLocaleString()})
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={generateReportPng}
            isLoading={isGeneratingPng}
            leftIcon={<Download size={16} />}
          >
            Download Report PNG
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => handleWhatsAppShare()}
            leftIcon={<Share2 size={16} />}
          >
            WhatsApp Text
          </Button>
        </div>
      </div>

      {/* 2. Formula shown as a collapsible "How we calculated this" section per Directive */}
      <Card padding="none" className="overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFormula(!showFormula)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-surface-soft/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Info size={18} className="text-primary-ink shrink-0" />
            <div>
              <span className="font-heading font-semibold text-sm sm:text-base text-text block">
                How we calculated this (Forecasting & Reorder Math)
              </span>
              <span className="text-xs text-text-muted">
                Step-by-step mathematical formulas: Safety stock, shelf-life caps, and priority ranking
              </span>
            </div>
          </div>
          {showFormula ? (
            <ChevronUp size={18} className="text-text-muted" />
          ) : (
            <ChevronDown size={18} className="text-text-muted" />
          )}
        </button>

        {showFormula && (
          <div className="p-5 border-t border-border bg-surface-soft/30 space-y-4 text-xs leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-surface border border-border rounded-xl">
                <span className="font-bold text-text block mb-1">
                  1. Safety Stock & Reorder Point
                </span>
                <p className="text-text-muted font-mono text-[11px] mb-2 bg-surface-soft p-1.5 rounded">
                  SS = z(95%) × σ_daily × √(L + R)
                  <br />
                  ROP = Demand_L + SS
                  <br />
                  Order-Up-To U = Demand_(L + R) + SS
                </p>
                <p className="text-text-muted">
                  Protects against demand surges and supplier shipping delays over
                  lead time (L) and review cycle (R = {settings.review_cycle_days}d).
                </p>
              </div>

              <div className="p-3.5 bg-surface border border-border rounded-xl">
                <span className="font-bold text-text block mb-1">
                  2. Shelf-Life Cap (Non-Negotiable)
                </span>
                <p className="text-text-muted font-mono text-[11px] mb-2 bg-surface-soft p-1.5 rounded">
                  Usable_days = ShelfLife × (1 - {settings.expiry_buffer * 100}%) - LeadTime
                  <br />
                  Cap U at Forecast Demand over Usable_days
                </p>
                <p className="text-text-muted">
                  Ensures perishable items (Milk, Bread, Dahi) are never ordered in
                  quantities exceeding what sells before expiry.
                </p>
              </div>

              <div className="p-3.5 bg-surface border border-border rounded-xl">
                <span className="font-bold text-text block mb-1">
                  3. Pack Size & MOQ Constraints
                </span>
                <p className="text-text-muted font-mono text-[11px] mb-2 bg-surface-soft p-1.5 rounded">
                  Raw_qty = max(0, U - effective_stock)
                  <br />
                  Final = ceil(Raw_qty / PackSize) × PackSize
                </p>
                <p className="text-text-muted">
                  Enforces manufacturer case pack multiples and minimum order quantities.
                </p>
              </div>

              <div className="p-3.5 bg-surface border border-border rounded-xl">
                <span className="font-bold text-text block mb-1">
                  4. Priority Ranking Score (0 - 100)
                </span>
                <p className="text-text-muted font-mono text-[11px] mb-2 bg-surface-soft p-1.5 rounded">
                  Score = 0.45·Urgency + 0.35·MarginRisk + 0.20·Velocity
                </p>
                <p className="text-text-muted">
                  Items with days of cover less than supplier lead time rank Critical
                  and #1 automatically.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Filter & Grouping Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGroupBySupplier(!groupBySupplier)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              groupBySupplier
                ? 'bg-navy-900 text-white dark:bg-mint dark:text-navy-900 border-transparent font-semibold'
                : 'bg-surface border-border text-text-muted hover:text-text'
            }`}
          >
            <Building size={14} />
            <span>Group by Supplier</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleExportCsv} leftIcon={<FileSpreadsheet size={14} />}>
            Export CSV
          </Button>
          <Button size="sm" variant="ghost" onClick={() => window.print()} leftIcon={<Printer size={14} />}>
            Print Sheet
          </Button>
        </div>
      </div>

      {/* 4. Recommendation Table with Inline Overrides */}
      {!groupBySupplier ? (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-soft border-b border-border text-text-muted font-semibold sticky top-0">
                  <th className="py-3 px-4 w-12 text-center">S.No</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Product & Supplier</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-right">Cover</th>
                  <th className="py-3 px-4 text-right">System Qty</th>
                  <th className="py-3 px-4 text-right">Final Order Qty</th>
                  <th className="py-3 px-4 text-right">Est. Cost</th>
                  <th className="py-3 px-4">Order By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reorderItems.map((item, idx) => (
                  <tr
                    key={item.productId}
                    className="h-14 hover:bg-surface-soft/60 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-center tabular-nums text-text-muted font-medium">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-4">
                      <Badge
                        variant={
                          item.priority_label === 'Critical'
                            ? 'critical'
                            : item.priority_label === 'High'
                            ? 'ok'
                            : 'overstock'
                        }
                      >
                        {item.priority_label}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-text line-clamp-1">
                          {item.name}
                        </div>
                        {item.has_old_stock && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/80 rounded text-[10px] font-bold shrink-0">
                            ⚠️ Old Stock on Hand
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {item.supplier_name} · Pack of {item.pack_size}
                        {item.shelf_life_flag && (
                          <span className="text-amber-700 dark:text-amber-400 ml-1">
                            · {item.shelf_life_flag}
                          </span>
                        )}
                        {(item.old_stock_units || 0) > 0 && (
                          <span className="text-amber-800 dark:text-amber-300 ml-1 font-medium">
                            · {item.old_stock_units} stagnant units (&gt;14d)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right tabular-nums text-text">
                      {item.stock_on_hand} {item.unit}
                    </td>

                    <td className="py-2.5 px-4 text-right tabular-nums font-medium text-text-muted">
                      {item.days_of_cover.toFixed(0)}d
                    </td>

                    {/* System recommended quantity */}
                    <td className="py-2.5 px-4 text-right tabular-nums text-text-muted">
                      {item.recommended_qty} {item.unit}
                    </td>

                    {/* Order-list override input per directive */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          min="0"
                          step={item.pack_size}
                          value={item.final_qty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            overrideReorderQty(item.productId, val);
                          }}
                          className={`w-20 py-1 px-2 text-right rounded border font-bold tabular-nums outline-none ${
                            item.is_overridden
                              ? 'bg-accent-tint border-accent text-accent-ink'
                              : 'bg-surface-soft border-border text-text focus:border-primary'
                          }`}
                        />
                        <span className="text-[11px] text-text-muted">
                          {item.unit}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-text">
                      ₹{item.total_order_cost.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-4 text-[11px] tabular-nums text-text-muted">
                      {item.order_by_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Emerald Totals Row per Directive */}
          <div className="p-4 bg-primary-tint border-t border-emerald-300/80 flex items-center justify-between text-xs sm:text-sm text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200">
            <span className="font-heading font-semibold">
              Total Order: {reorderItems.filter((i) => i.final_qty > 0).length} Items Selected
            </span>
            <div className="flex items-center gap-4">
              <span className="text-text-muted text-xs">Estimated Payable:</span>
              <span className="font-heading font-bold text-xl text-primary-ink tabular-nums">
                ₹{totalEstimatedOrderValue.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        /* Supplier Grouped View */
        <div className="space-y-6">
          {Array.from(supplierGroups.entries()).map(([supplierName, items]) => {
            const supplierCost = items.reduce((acc, it) => acc + it.total_order_cost, 0);
            const stagnantCount = items.filter((it) => it.has_old_stock).length;
            return (
              <Card key={supplierName} padding="none" className="overflow-hidden">
                <div className="p-4 bg-surface-soft border-b border-border flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-sm sm:text-base text-text">
                        {supplierName}
                      </h3>
                      {stagnantCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 rounded text-[10px] font-bold">
                          ⚠️ {stagnantCount} Old Stock Item{stagnantCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-muted">
                      {items.length} lines · Lead time: {items[0]?.lead_time_days} days
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-text tabular-nums text-sm">
                      Subtotal: ₹{supplierCost.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleWhatsAppShare(supplierName)}
                      leftIcon={<Share2 size={12} />}
                    >
                      Share PO
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-surface-soft/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text">
                            {item.name}
                          </span>
                          {item.has_old_stock && (
                            <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                              ⚠️ Stagnant
                            </span>
                          )}
                        </div>
                        <span className="text-text-muted text-[11px]">
                          Stock: {item.stock_on_hand} {item.unit} · {item.days_of_cover.toFixed(0)}d cover
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-bold text-primary-ink tabular-nums block">
                            {item.final_qty} {item.unit}
                          </span>
                          <span className="text-text-muted text-[11px]">
                            Pack of {item.pack_size}
                          </span>
                        </div>
                        <span className="font-bold text-text tabular-nums w-20 text-right">
                          ₹{item.total_order_cost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Report Image Preview Card with Fixed 1080px Width per Directive */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h2 className="text-lg font-heading font-semibold text-text">
            Exportable Report Preview Card (1080px Canvas)
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Designed for crystal-clear WhatsApp delivery or physical printing with dedicated Old Stock Audit section.
          </p>
        </div>

        {/* Visual Mock of the 1080px Report Card */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          {/* Navy Header */}
          <div className="p-6 text-on-navy [background:linear-gradient(135deg,#0F172A_0%,#0F2A2A_55%,#064E3B_100%)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-heading font-bold text-2xl text-white">
                Stock<span className="text-mint">Sense</span>
              </div>
              <div className="text-xs font-semibold text-mint mt-0.5">
                Daily Reorder Sheet · {settings.store_name}
              </div>
              <div className="text-[11px] text-on-navy-muted mt-1">
                {new Date().toDateString()} · {settings.city}
              </div>
            </div>

            <div className="p-3 bg-navy-800 rounded-xl border border-navy-700 text-xs">
              <span className="text-mint font-semibold block">Order Total</span>
              <span className="font-heading font-bold text-xl text-white tabular-nums">
                ₹{totalEstimatedOrderValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Dedicated Old Stock Audit (>14 Days) Block per Directive */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-bold text-amber-950 dark:text-amber-200 block">
                  Old Stock Audit Summary (&gt; 14 Days Shelf Resting)
                </span>
                <span className="text-[11px] text-amber-800 dark:text-amber-300">
                  {reorderItems.filter((i) => i.has_old_stock).length} stagnant reorder items identified in catalog
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-amber-800 dark:text-amber-300 block">Policy Threshold</span>
              <span className="font-bold text-amber-900 dark:text-amber-200">2-Week Clearance Queue</span>
            </div>
          </div>

          {/* White Body Table */}
          <div className="p-4 divide-y divide-border text-xs">
            {reorderItems.slice(0, 4).map((it, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-text">{it.name}</span>
                    {it.has_old_stock && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                        Old Stock
                      </span>
                    )}
                  </div>
                  <span className="text-text-muted text-[11px] block">
                    {it.supplier_name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary-ink tabular-nums">
                    {it.final_qty} {it.unit}
                  </span>
                  <span className="text-text-muted text-[11px] block tabular-nums">
                    ₹{it.total_order_cost.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Emerald Totals Row */}
          <div className="p-3.5 bg-primary-tint border-t border-emerald-300/80 flex items-center justify-between text-xs text-primary-ink font-semibold">
            <span>Totals Row</span>
            <span className="font-bold text-base">₹{totalEstimatedOrderValue.toLocaleString()}</span>
          </div>

          {/* Small footer */}
          <div className="p-3 bg-surface-soft border-t border-border flex items-center justify-between text-[11px] text-text-muted">
            <span>Generated by StockSense · PS11 Quantix 2K26</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={generateReportPng}>
                Download Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
