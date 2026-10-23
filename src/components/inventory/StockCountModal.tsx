import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../ui/Toast';
import { Check, ChevronRight } from 'lucide-react';

export interface StockCountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockCountModal: React.FC<StockCountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, updateProductStock } = useStore();
  const { success } = useToast();

  // Local draft of stock values
  const [stockDraft, setStockDraft] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.id] = p.stock_on_hand;
    });
    return map;
  });

  const handleStockChange = (productId: string, val: number) => {
    setStockDraft((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleSaveAll = () => {
    let updatedCount = 0;
    products.forEach((p) => {
      const draftVal = stockDraft[p.id];
      if (draftVal !== undefined && draftVal !== p.stock_on_hand) {
        updateProductStock(p.id, draftVal);
        updatedCount++;
      }
    });

    success(`Updated stock counts for ${updatedCount} products.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="2-Minute Daily Stock Count"
      description="Quickly tap or type on-hand counts as you walk past shelves."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-border pr-1">
          {products.map((p, idx) => {
            const currentVal = stockDraft[p.id] ?? p.stock_on_hand;
            return (
              <div
                key={`${p.id}_${idx}`}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-text text-sm block">
                    {p.name}
                  </span>
                  <span className="text-text-muted text-[11px]">
                    {p.sku} · {p.supplier_name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStockChange(p.id, currentVal - 1)}
                    className="w-8 h-8 rounded-lg bg-surface-soft border border-border text-text font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={currentVal}
                    onChange={(e) =>
                      handleStockChange(p.id, parseInt(e.target.value) || 0)
                    }
                    className="w-16 py-1 px-2 text-center rounded-lg border border-border bg-surface text-text font-bold tabular-nums text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleStockChange(p.id, currentVal + 1)}
                    className="w-8 h-8 rounded-lg bg-surface-soft border border-border text-text font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-text-muted text-[11px] w-10 text-left">
                    {p.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            onClick={handleSaveAll}
            leftIcon={<Check size={16} strokeWidth={2} />}
          >
            Save Stock Counts
          </Button>
        </div>
      </div>
    </Modal>
  );
};
