import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, RefreshCw, ChevronRight, Building, Clock, AlertTriangle, ShieldCheck, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ReorderItem } from '../types/inventory';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProductDrawer } from '../components/inventory/ProductDrawer';
import { AddItemModal } from '../components/inventory/AddItemModal';
import { SupplierManageModal } from '../components/inventory/SupplierManageModal';
import { useToast } from '../components/ui/Toast';
import { StockSparklineGraph } from '../components/ui/Chart';

export const ItemsView: React.FC<{ onOpenStockCount: () => void }> = ({ onOpenStockCount }) => {
  const { products, forecasts, reorderItems, updateProductStock, addToOldStock, removeFromOldStock } = useStore();
  const { success } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, categoryFilter]);

  const selectedForecast = selectedProduct ? forecasts.get(selectedProduct.id) || null : null;
  const selectedReorderItem = selectedProduct
    ? reorderItems.find((r) => r.productId === selectedProduct.id) || null
    : null;

  const handleStockQuickChange = (productId: string, delta: number, currentVal: number) => {
    const newVal = Math.max(0, currentVal + delta);
    updateProductStock(productId, newVal);
    success(`Stock updated to ${newVal}`, {
      label: 'Undo',
      onClick: () => updateProductStock(productId, currentVal),
    });
  };

  const handleSellItems = (productId: string, currentStock: number, qtyToSell = 5) => {
    const newStock = Math.max(0, currentStock - qtyToSell);
    updateProductStock(productId, newStock);
    success(`Sold ${qtyToSell} units. Stock moved down to ${newStock}!`);
  };

  const handleBuyItems = (productId: string, currentStock: number, qtyToBuy = 10) => {
    const newStock = currentStock + qtyToBuy;
    updateProductStock(productId, newStock);
    success(`Restocked +${qtyToBuy} units. Stock moved up to ${newStock}!`);
  };

  const handleRebuyItem = (productId: string, currentStock: number, recommendedQty = 12) => {
    const newStock = currentStock + (recommendedQty || 12);
    updateProductStock(productId, newStock);
    success(`Rebought +${recommendedQty || 12} units! Graph updated.`);
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-text tracking-tight">
            Items Master & Live Stock Movement
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {products.length} registered items · Sell, Buy, or Rebuy items to watch stock trajectory graphs move in real time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus size={14} strokeWidth={2.5} />}
          >
            Add Item
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsSupplierModalOpen(true)}
            leftIcon={<Building size={14} />}
          >
            Suppliers
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenStockCount}
            leftIcon={<RefreshCw size={14} />}
          >
            Quick Stock Count
          </Button>
        </div>
      </div>

      {/* Clean Single Search Bar */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
          <Search size={18} strokeWidth={1.5} />
        </div>
        <input
          type="text"
          placeholder="Search products by name, SKU, or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface-soft border border-border text-text rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary-ring outline-none transition-colors placeholder:text-text-muted/60"
        />
      </div>

      {/* Interactive Category Filter Tabs (functional segmented buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              categoryFilter === cat
                ? 'bg-navy-900 text-white dark:bg-mint dark:text-navy-900 font-semibold'
                : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-soft'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Desktop & Tablet Table / Mobile Cards */}
      <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-soft border-b border-border text-text-muted font-semibold sticky top-0">
                <th className="py-3 px-4 w-12 text-center">S.No</th>
                <th className="py-3 px-4">Items & SKU</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Stock Trajectory Graph</th>
                <th className="py-3 px-4 text-right">Stock on Hand</th>
                <th className="py-3 px-4 text-center">Sell / Buy / Rebuy Actions</th>
                <th className="py-3 px-4">Buying Recommendation</th>
                <th className="py-3 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((p, idx) => {
                const reorder = reorderItems.find((r) => r.productId === p.id);
                return (
                  <tr
                    key={`${p.id}_${idx}`}
                    onClick={() => setSelectedProduct(p)}
                    className="h-16 hover:bg-surface-soft/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-center tabular-nums text-text-muted">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-text group-hover:text-primary-ink transition-colors line-clamp-1">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {p.sku} · {p.supplier_name}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right tabular-nums font-medium text-text">
                      ₹{p.selling_price}
                    </td>

                    {/* Stock Movement Sparkline Graph Column */}
                    <td className="py-2.5 px-4 text-center">
                      <StockSparklineGraph
                        currentStock={p.stock_on_hand}
                        reorderPoint={reorder?.reorder_point || 12}
                        dailyDemand={reorder?.daily_demand || 2}
                        unit={p.unit}
                      />
                    </td>

                    <td
                      className="py-2.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleStockQuickChange(p.id, -1, p.stock_on_hand)}
                          className="w-6 h-6 rounded bg-surface-soft hover:bg-slate-300 text-text font-bold text-xs transition-colors flex items-center justify-center cursor-pointer shrink-0"
                          title="Decrease"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={p.stock_on_hand}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) {
                              updateProductStock(p.id, Math.max(0, val));
                            }
                          }}
                          className="w-14 py-1 px-1 text-center bg-surface-soft border border-border rounded font-bold text-xs text-text tabular-nums outline-none focus:border-primary focus:ring-1 focus:ring-primary-ring"
                          title="Click to type stock quantity directly"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockQuickChange(p.id, 1, p.stock_on_hand)}
                          className="w-6 h-6 rounded bg-surface-soft hover:bg-slate-300 text-text font-bold text-xs transition-colors flex items-center justify-center cursor-pointer shrink-0"
                          title="Increase"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Quick Sell / Buy / Rebuy Movement Action Buttons */}
                    <td
                      className="py-2.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSellItems(p.id, p.stock_on_hand, 5)}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 rounded font-semibold text-[11px] flex items-center gap-0.5 transition-colors cursor-pointer"
                          title="Record sale: Moves graph down"
                        >
                          <ArrowDownRight size={12} />
                          Sell 5
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBuyItems(p.id, p.stock_on_hand, 10)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 rounded font-semibold text-[11px] flex items-center gap-0.5 transition-colors cursor-pointer"
                          title="Restock/Buy: Moves graph up"
                        >
                          <ArrowUpRight size={12} />
                          Buy 10
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRebuyItem(p.id, p.stock_on_hand, reorder?.final_qty || 12)}
                          className="px-2 py-1 bg-navy-900 text-white dark:bg-mint dark:text-navy-900 hover:opacity-90 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Rebuy recommended qty: Moves graph up"
                        >
                          <RefreshCw size={10} />
                          Rebuy
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right tabular-nums text-text-muted">
                      {p.in_transit > 0 ? (
                        <span className="text-primary-ink font-semibold">
                          +{p.in_transit}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      {reorder ? (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              reorder.priority_label === 'Critical'
                                ? 'critical'
                                : 'ok'
                            }
                          >
                            Order {reorder.final_qty} {p.unit}
                          </Badge>
                          <span className="text-[11px] text-text-muted truncate max-w-[200px]">
                            {reorder.reason}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="overstock">No order needed</Badge>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.is_old_stock ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromOldStock(p.id);
                              success(`Removed ${p.name} from Old Stock`);
                            }}
                            className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/80 rounded text-[11px] font-semibold hover:bg-amber-200 transition-colors cursor-pointer"
                            title="Click to remove from old stock"
                          >
                            ⚠️ Old Stock
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToOldStock(p.id);
                              success(`Marked ${p.name} as Old Stock`);
                            }}
                            className="px-2 py-0.5 bg-surface-soft text-text-muted hover:text-text hover:bg-slate-200 border border-border rounded text-[11px] font-medium transition-colors cursor-pointer"
                            title="Add item to old stock"
                          >
                            + Old Stock
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-text-muted group-hover:text-text">
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Compact Cards View per Directive */}
        <div className="md:hidden divide-y divide-border">
          {filteredProducts.map((p, idx) => {
            const reorder = reorderItems.find((r) => r.productId === p.id);
            return (
              <div
                key={`mob_${p.id}_${idx}`}
                onClick={() => setSelectedProduct(p)}
                className="p-4 hover:bg-surface-soft/60 active:bg-surface-soft transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-text-muted">
                      #{idx + 1} · {p.sku}
                    </span>
                    <h4 className="text-sm font-semibold text-text leading-snug">
                      {p.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.is_old_stock && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                        ⚠️ Old Stock
                      </span>
                    )}
                    {reorder ? (
                      <Badge
                        variant={
                          reorder.priority_label === 'Critical' ? 'critical' : 'ok'
                        }
                      >
                        {reorder.priority_label}
                      </Badge>
                    ) : (
                      <Badge variant="overstock">OK</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-text-muted pt-1">
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <span>Stock: </span>
                    <input
                      type="number"
                      min="0"
                      value={p.stock_on_hand}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateProductStock(p.id, Math.max(0, val));
                        }
                      }}
                      className="w-12 py-0.5 px-1 text-center bg-surface-soft border border-border rounded font-bold text-xs text-text tabular-nums outline-none focus:border-primary"
                    />
                    <span>{p.unit}</span>
                  </div>

                  <StockSparklineGraph
                    currentStock={p.stock_on_hand}
                    reorderPoint={reorder?.reorder_point || 12}
                    dailyDemand={reorder?.daily_demand || 2}
                    unit={p.unit}
                    width={90}
                    height={24}
                  />

                  <div>
                    <span>Rate: </span>
                    <span className="font-semibold text-text tabular-nums">
                      ₹{p.selling_price}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSellItems(p.id, p.stock_on_hand, 5)}
                      className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 rounded text-[11px] font-semibold flex items-center gap-0.5"
                    >
                      <ArrowDownRight size={11} />
                      Sell 5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuyItems(p.id, p.stock_on_hand, 10)}
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 rounded text-[11px] font-semibold flex items-center gap-0.5"
                    >
                      <ArrowUpRight size={11} />
                      Buy 10
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRebuyItem(p.id, p.stock_on_hand, reorder?.final_qty || 12)}
                    className="px-2 py-0.5 bg-navy-900 text-white dark:bg-mint dark:text-navy-900 rounded text-[11px] font-semibold flex items-center gap-1"
                  >
                    <RefreshCw size={10} />
                    Rebuy
                  </button>
                </div>
              </div>
            );
          })}
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

      {/* Add New Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Supplier Management Modal */}
      <SupplierManageModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
      />
    </div>
  );
};
