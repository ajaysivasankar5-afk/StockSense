import React, { useState } from 'react';
import { X, Building, Plus, Trash2, Star, Check, Phone, Clock, User, AlertTriangle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import { Supplier } from '../../types/inventory';

export interface SupplierManageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupplierManageModal: React.FC<SupplierManageModalProps> = ({ isOpen, onClose }) => {
  const { suppliers, primarySupplier, addSupplier, deleteSupplier, setPrimarySupplier, updateSupplier } = useStore();
  const { success, warning, error } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [leadTime, setLeadTime] = useState('2');
  const [isPrimary, setIsPrimary] = useState(false);

  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  if (!isOpen) return null;

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Please provide a supplier name.');
      return;
    }

    addSupplier({
      name: name.trim(),
      contact: contact.trim() || 'Wholesale Manager',
      phone: phone.trim() || '+91 98400 00000',
      default_lead_time: Math.max(1, parseInt(leadTime) || 2),
      is_primary: isPrimary,
    });

    success(`Supplier "${name.trim()}" added successfully${isPrimary ? ' as Primary' : ''}!`);
    setName('');
    setContact('');
    setPhone('');
    setLeadTime('2');
    setIsPrimary(false);
    setIsAdding(false);
  };

  const handleConfirmDelete = () => {
    if (!supplierToDelete) return;
    if (suppliers.length <= 1) {
      warning('You must keep at least one supplier in the system.');
      setSupplierToDelete(null);
      return;
    }

    const delName = supplierToDelete.name;
    deleteSupplier(supplierToDelete.id);
    success(`Supplier "${delName}" removed. Associated products reassigned to primary supplier.`);
    setSupplierToDelete(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-surface rounded-[20px] shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-tint text-primary-ink flex items-center justify-center">
              <Building size={18} strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg text-text">
                Supplier Management
              </h2>
              <p className="text-xs text-text-muted">
                Add, set primary, or remove wholesale distributors and lead times
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-soft transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list & Add Form */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Add Supplier Toggle / Form */}
          {!isAdding ? (
            <div className="flex items-center justify-between p-4 bg-surface-soft border border-border rounded-xl">
              <div>
                <span className="font-semibold text-xs text-text block">
                  Need to change or add a wholesale supplier?
                </span>
                <span className="text-[11px] text-text-muted">
                  Set lead times, contact details, and assign as primary supplier
                </span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsAdding(true)}
                leftIcon={<Plus size={14} strokeWidth={2.5} />}
              >
                Add Supplier
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateSupplier} className="p-4 bg-surface-soft border border-border rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-heading font-semibold text-xs text-text flex items-center gap-1.5">
                  <Plus size={14} className="text-primary-ink" />
                  <span>Register New Supplier</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-text-muted hover:text-text cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Supplier / Distributor Name *"
                  placeholder="e.g. Apex Consumer FMCG Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Contact Person Name"
                  placeholder="e.g. R. Venkatesh"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98400 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Default Lead Time (Days) *"
                  type="number"
                  min="1"
                  max="14"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-text">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-primary border-border focus:ring-primary-ring cursor-pointer"
                  />
                  <span>Make this my Primary Supplier</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="primary" type="submit">
                    Save Supplier
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Suppliers List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Registered Suppliers ({suppliers.length})
              </span>
              <span>Primary supplier handles default reorders</span>
            </div>

            <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden">
              {suppliers.map((sup) => {
                const isCurrentPrimary = sup.id === primarySupplier?.id || sup.is_primary;
                return (
                  <div
                    key={sup.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-soft/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-sm text-text">
                          {sup.name}
                        </span>
                        {isCurrentPrimary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-tint text-primary-ink border border-primary-ink/30">
                            <Star size={10} className="fill-primary-ink text-primary-ink" />
                            <span>PRIMARY SUPPLIER</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {sup.contact}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {sup.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Lead time: {sup.default_lead_time} days
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {!isCurrentPrimary && (
                        <button
                          type="button"
                          onClick={() => {
                            setPrimarySupplier(sup.id);
                            success(`Set "${sup.name}" as your Primary Supplier.`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:border-primary-ink hover:text-primary-ink bg-surface transition-colors cursor-pointer"
                        >
                          Set as Primary
                        </button>
                      )}

                      {suppliers.length > 1 && !isCurrentPrimary && (
                        <button
                          type="button"
                          onClick={() => setSupplierToDelete(sup)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-tint transition-colors cursor-pointer"
                          title="Delete supplier"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Alert Modal */}
        {supplierToDelete && (
          <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-20 animate-in fade-in duration-100">
            <div className="bg-surface border border-border rounded-xl p-5 max-w-sm w-full shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 text-danger">
                <AlertTriangle size={20} />
                <h4 className="font-heading font-semibold text-sm">Delete Supplier?</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Are you sure you want to delete <strong className="text-text">{supplierToDelete.name}</strong>? Any inventory items previously assigned to this distributor will be safely migrated to your primary supplier (<strong className="text-text">{primarySupplier?.name}</strong>).
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="secondary" onClick={() => setSupplierToDelete(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="danger" onClick={handleConfirmDelete}>
                  Yes, Delete Supplier
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-surface-soft border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span>{suppliers.length} suppliers registered</span>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
