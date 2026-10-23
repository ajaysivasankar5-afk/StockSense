import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../ui/Toast';
import { Plus, Package, ShieldCheck } from 'lucide-react';
import { Product } from '../../types/inventory';

export interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose }) => {
  const { suppliers, addProduct } = useStore();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Grocery & Staples');
  const [unit, setUnit] = useState('pcs');
  const [stockOnHand, setStockOnHand] = useState('10');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 'sup_1');
  const [leadTimeDays, setLeadTimeDays] = useState('2');
  const [shelfLifeDays, setShelfLifeDays] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [packSize, setPackSize] = useState('6');
  const [moq, setMoq] = useState('12');

  const categories = [
    'Grocery & Staples',
    'Dairy & Bakery',
    'Beverages',
    'Snacks & Confectionery',
    'Personal Care',
    'Household & Cleaning',
  ];

  const units = ['pcs', 'pouches', 'packets', 'kg', 'bottles', 'boxes', 'loaves', 'tins'];

  // Auto-generate SKU draft if user types name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!sku) {
      const acronym = val
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 3)
        .map((w) => w.substring(0, 3).toUpperCase())
        .join('-');
      if (acronym) {
        setSku(acronym + '-' + Math.floor(100 + Math.random() * 900));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      error('Please enter the product name.');
      return;
    }

    const cost = parseFloat(costPrice);
    const selling = parseFloat(sellingPrice);
    if (isNaN(cost) || cost <= 0) {
      error('Please enter a valid cost price.');
      return;
    }
    if (isNaN(selling) || selling <= 0) {
      error('Please enter a valid selling price.');
      return;
    }

    const stock = Math.max(0, parseInt(stockOnHand) || 0);
    const lead = Math.max(1, parseInt(leadTimeDays) || 2);
    const shelf = shelfLifeDays.trim() ? Math.max(1, parseInt(shelfLifeDays)) : null;
    const pack = Math.max(1, parseInt(packSize) || 1);
    const minOrder = Math.max(1, parseInt(moq) || 1);

    const chosenSupplier = suppliers.find((s) => s.id === supplierId);

    addProduct({
      sku: sku.trim() || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      name: name.trim(),
      category,
      unit,
      stock_on_hand: stock,
      in_transit: 0,
      supplier_id: supplierId,
      supplier_name: chosenSupplier?.name || 'Local Wholesale Vendor',
      lead_time_days: lead,
      shelf_life_days: shelf,
      cost_price: cost,
      selling_price: selling,
      pack_size: pack,
      moq: minOrder,
      demand_multiplier: 1.0,
      batches: shelf ? [{ qty: stock, expiry_date: new Date(Date.now() + shelf * 86400000).toISOString().split('T')[0] }] : [],
      received_date: new Date().toISOString().split('T')[0],
    });

    success(`Added "${name}" to Items Master.`);
    // Reset form
    setName('');
    setSku('');
    setCostPrice('');
    setSellingPrice('');
    setShelfLifeDays('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Inventory Item"
      description="Register a new retail product with lead time, shelf life, and order constraints."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            placeholder="e.g. Amul Butter Pasteurized 100g"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="SKU Code"
            placeholder="e.g. DAI-BUT-100"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            helperText="Auto-generated if left empty"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-soft border border-border text-text rounded-lg py-2.5 px-3.5 text-sm outline-none focus:border-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">
              Unit of Measure
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-surface-soft border border-border text-text rounded-lg py-2.5 px-3.5 text-sm outline-none focus:border-primary"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Stock on Hand"
            type="number"
            min="0"
            placeholder="0"
            value={stockOnHand}
            onChange={(e) => setStockOnHand(e.target.value)}
          />

          <Input
            label="Cost Price (₹) *"
            type="number"
            step="any"
            min="0.1"
            placeholder="e.g. 48"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            required
          />

          <Input
            label="Selling Price (₹) *"
            type="number"
            step="any"
            min="0.1"
            placeholder="e.g. 56"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">
              Primary Supplier
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full bg-surface-soft border border-border text-text rounded-lg py-2.5 px-3.5 text-sm outline-none focus:border-primary"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.default_lead_time}d lead)
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Supplier Lead Time (Days)"
            type="number"
            min="1"
            placeholder="2"
            value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(e.target.value)}
            helperText="Days from ordering until delivery"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Shelf Life (Days)"
            type="number"
            min="1"
            placeholder="Empty = Non-perishable"
            value={shelfLifeDays}
            onChange={(e) => setShelfLifeDays(e.target.value)}
            helperText="Enforces safety reorder cap"
          />

          <Input
            label="Pack Size Multiplier"
            type="number"
            min="1"
            placeholder="6"
            value={packSize}
            onChange={(e) => setPackSize(e.target.value)}
            helperText="Supplier case/crate size"
          />

          <Input
            label="Min Order Qty (MOQ)"
            type="number"
            min="1"
            placeholder="12"
            value={moq}
            onChange={(e) => setMoq(e.target.value)}
            helperText="Minimum vendor batch"
          />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <Button size="sm" variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            size="md"
            variant="primary"
            type="submit"
            leftIcon={<Plus size={16} strokeWidth={2} />}
          >
            Add Item to Inventory
          </Button>
        </div>
      </form>
    </Modal>
  );
};
