import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  Supplier,
  DailySale,
  StoreSettings,
  ForecastResult,
  ReorderItem,
  DoNotReorderItem,
  WastageRecord,
  WeatherData,
} from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_SETTINGS,
  INITIAL_WEATHER,
  INITIAL_WASTAGE_RECORDS,
  generateDemoSalesHistory,
} from '../data/mockData';
import {
  computeProductForecast,
  generateReorderPlan,
} from '../services/reorderEngine';

export interface UserSession {
  email: string;
  name: string;
  storeName: string;
  token: string;
}

export interface OrderHistoryRecord {
  id: string;
  date: string;
  itemCount: number;
  totalCost: number;
  items: { productId: string; name: string; qty: number; cost: number }[];
  status: 'Ordered' | 'Received';
}

interface StoreContextType {
  // Auth
  user: UserSession | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, name: string, storeName: string, location?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  quickDemoLogin: (type?: 'kirana' | 'pharmacy' | 'bakery') => void;

  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Store data
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  products: Product[];
  suppliers: Supplier[];
  primarySupplier: Supplier | undefined;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  deleteSupplier: (supplierId: string) => void;
  setPrimarySupplier: (supplierId: string) => void;
  updateSupplier: (supplier: Supplier) => void;

  salesHistory: Map<string, DailySale[]>;
  wastageRecords: WastageRecord[];
  weather: WeatherData;
  orderHistory: OrderHistoryRecord[];

  // Reorder Plan Calculations
  forecasts: Map<string, ForecastResult>;
  reorderItems: ReorderItem[];
  doNotReorderItems: DoNotReorderItem[];
  topPriorityItem: ReorderItem | null;
  totalEstimatedOrderValue: number;
  criticalCount: number;
  highCount: number;
  totalCashLocked: number;
  expiringSoonCount: number;

  // Actions
  updateProductStock: (productId: string, newStock: number, previousStock?: number) => void;
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id' | 'updated_at'>) => void;
  addToOldStock: (productId: string, units?: number, notes?: string) => void;
  removeFromOldStock: (productId: string) => void;
  removeOldStock: (
    productId: string,
    unitsToRemove: number,
    removalType: 'dispose' | 'return_supplier' | 'clearance',
    reasonNotes?: string
  ) => void;
  overrideReorderQty: (productId: string, newQty: number) => void;
  markAsOrdered: (selectedItemIds?: string[]) => { orderId: string; totalAmount: number; count: number };
  undoMarkAsOrdered: (orderId: string) => void;
  addWastageRecord: (record: Omit<WastageRecord, 'id'>) => void;
  importSalesCSV: (salesRows: { date: string; sku?: string; name?: string; qty: number; price?: number }[]) => {
    importedCount: number;
    failedCount: number;
    matchedProducts: number;
  };
  resetToDemoSeed: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state: initial session is null so flow is Landing -> Login -> App
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('stocksense_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('stocksense_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('stocksense_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('stocksense_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('stocksense_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Products with deduplication logic to ensure all keys are strictly unique
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('stocksense_products');
    let list: Product[] = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    const seen = new Set<string>();
    list = list.map((p, idx) => {
      let id = p.id;
      if (!id || seen.has(id)) {
        id = (p.id || 'prod') + '_' + idx + '_' + Math.random().toString(36).substring(2, 6);
      }
      seen.add(id);
      return { ...p, id };
    });
    return list;
  });

  // Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('stocksense_suppliers');
    let list: Supplier[] = saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    if (list.length > 0 && !list.some((s) => s.is_primary)) {
      list[0] = { ...list[0], is_primary: true };
    }
    return list;
  });

  useEffect(() => {
    localStorage.setItem('stocksense_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const primarySupplier = useMemo(() => {
    return suppliers.find((s) => s.is_primary) || suppliers[0];
  }, [suppliers]);

  // Sales History
  const [salesHistory, setSalesHistory] = useState<Map<string, DailySale[]>>(() => {
    return generateDemoSalesHistory();
  });

  // Wastage
  const [wastageRecords, setWastageRecords] = useState<WastageRecord[]>(() => {
    const saved = localStorage.getItem('stocksense_wastage');
    return saved ? JSON.parse(saved) : INITIAL_WASTAGE_RECORDS;
  });

  // Order History for feedback loop
  const [orderHistory, setOrderHistory] = useState<OrderHistoryRecord[]>(() => {
    const saved = localStorage.getItem('stocksense_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Weather
  const [weather] = useState<WeatherData>(INITIAL_WEATHER);

  // Overrides Map
  const [qtyOverrides, setQtyOverrides] = useState<Map<string, number>>(new Map());

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('stocksense_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('stocksense_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('stocksense_wastage', JSON.stringify(wastageRecords));
  }, [wastageRecords]);

  useEffect(() => {
    localStorage.setItem('stocksense_orders', JSON.stringify(orderHistory));
  }, [orderHistory]);

  // Forecast computation
  const forecasts = useMemo(() => {
    const map = new Map<string, ForecastResult>();
    products.forEach((product) => {
      const history = salesHistory.get(product.id) || [];
      const forecast = computeProductForecast(product, history, settings);
      map.set(product.id, forecast);
    });
    return map;
  }, [products, salesHistory, settings]);

  // Plan generation
  const planResults = useMemo(() => {
    const result = generateReorderPlan(products, forecasts, settings);

    // Apply manual overrides if any
    result.reorderItems.forEach((item) => {
      if (qtyOverrides.has(item.productId)) {
        const override = qtyOverrides.get(item.productId)!;
        item.final_qty = override;
        item.is_overridden = override !== item.recommended_qty;
        item.total_order_cost = override * item.cost_price;
      }
    });

    // Recompute total order value
    result.totalEstimatedOrderValue = result.reorderItems.reduce(
      (acc, it) => acc + it.final_qty * it.cost_price,
      0
    );

    return result;
  }, [products, forecasts, settings, qtyOverrides]);

  // Helper to load and save registered accounts for proper multi-account recognition
  const getRegisteredAccounts = (): Record<string, { email: string; name: string; storeName: string; location?: string; password?: string }> => {
    try {
      const data = localStorage.getItem('stocksense_accounts');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const saveRegisteredAccount = (account: { email: string; name: string; storeName: string; location?: string; password?: string }) => {
    try {
      const accounts = getRegisteredAccounts();
      accounts[account.email.trim().toLowerCase()] = account;
      localStorage.setItem('stocksense_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  };

  // Auth actions
  const login = async (email: string, _password?: string): Promise<boolean> => {
    const cleanEmail = email.trim();
    const normalizedKey = cleanEmail.toLowerCase();
    const accounts = getRegisteredAccounts();
    const existing = accounts[normalizedKey];

    let name = '';
    let storeName = '';
    let city = settings.city;

    if (existing) {
      name = existing.name;
      storeName = existing.storeName;
      if (existing.location) city = existing.location;
    } else {
      // Clean readable human name from email address
      const prefix = cleanEmail.split('@')[0];
      const words = prefix.replace(/[^a-zA-Z]+/g, ' ').trim().split(' ').filter(Boolean);
      const cleanName = words.length > 0
        ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : 'Store Owner';
      name = cleanName;
      storeName = `${cleanName}'s Retail Store`;

      saveRegisteredAccount({
        email: cleanEmail,
        name,
        storeName,
        location: city,
      });
    }

    const userSession: UserSession = {
      email: cleanEmail,
      name,
      storeName,
      token: 'jwt-auth-' + Date.now(),
    };

    setUser(userSession);
    localStorage.setItem('stocksense_user', JSON.stringify(userSession));

    setSettings((prev) => {
      const updated = {
        ...prev,
        store_name: storeName,
        owner_name: name,
        city: city,
      };
      localStorage.setItem('stocksense_settings', JSON.stringify(updated));
      return updated;
    });

    return true;
  };

  const register = async (
    email: string,
    name: string,
    storeName: string,
    location?: string,
    password?: string
  ): Promise<boolean> => {
    const cleanEmail = email.trim();
    const cleanName = name.trim() || 'Store Owner';
    const cleanStore = storeName.trim() || `${cleanName}'s Store`;
    const cleanCity = location?.trim() || 'Salem, Tamil Nadu';

    saveRegisteredAccount({
      email: cleanEmail,
      name: cleanName,
      storeName: cleanStore,
      location: cleanCity,
      password,
    });

    const userSession: UserSession = {
      email: cleanEmail,
      name: cleanName,
      storeName: cleanStore,
      token: 'jwt-auth-' + Date.now(),
    };

    setUser(userSession);
    localStorage.setItem('stocksense_user', JSON.stringify(userSession));

    setSettings((prev) => {
      const updated = {
        ...prev,
        store_name: cleanStore,
        owner_name: cleanName,
        city: cleanCity,
      };
      localStorage.setItem('stocksense_settings', JSON.stringify(updated));
      return updated;
    });

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stocksense_user');
  };

  const quickDemoLogin = (type: 'kirana' | 'pharmacy' | 'bakery' = 'kirana') => {
    let name = 'Muruganandham S.';
    let storeName = 'Sri Murugan Kirana & Provisions';
    let email = 'murugan@stocksense.in';

    if (type === 'pharmacy') {
      name = 'Dr. Baladithyan R.';
      storeName = 'Apex Pharma & Wellness';
      email = 'apex.pharma@stocksense.in';
    } else if (type === 'bakery') {
      name = 'Chef Anthony S.';
      storeName = 'Crumb & Crust Artisanal Bakery';
      email = 'bakery@stocksense.in';
    }

    const session: UserSession = {
      email,
      name,
      storeName,
      token: 'mock-jwt-token-demo',
    };
    setUser(session);
    setSettings((prev) => ({ ...prev, store_name: storeName, owner_name: name }));
    localStorage.setItem('stocksense_user', JSON.stringify(session));
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Supplier Management
  const addSupplier = (newSup: Omit<Supplier, 'id'>) => {
    const id = 'sup_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5);
    const shouldBePrimary = suppliers.length === 0 || Boolean(newSup.is_primary);

    setSuppliers((prev) => {
      const updated = shouldBePrimary ? prev.map((s) => ({ ...s, is_primary: false })) : [...prev];
      return [...updated, { ...newSup, id, is_primary: shouldBePrimary }];
    });
  };

  const setPrimarySupplier = (supplierId: string) => {
    setSuppliers((prev) =>
      prev.map((s) => ({
        ...s,
        is_primary: s.id === supplierId,
      }))
    );
  };

  const deleteSupplier = (supplierId: string) => {
    setSuppliers((prev) => {
      if (prev.length <= 1) return prev; // Do not delete the only supplier
      const remaining = prev.filter((s) => s.id !== supplierId);
      const hasPrimary = remaining.some((s) => s.is_primary);
      if (!hasPrimary && remaining.length > 0) {
        remaining[0] = { ...remaining[0], is_primary: true };
      }
      return remaining;
    });

    // Reassign all products belonging to deleted supplier to the remaining primary supplier
    const targetSup = suppliers.find((s) => s.id !== supplierId && s.is_primary) ||
      suppliers.find((s) => s.id !== supplierId) ||
      suppliers[0];

    if (targetSup) {
      setProducts((prev) =>
        prev.map((p) =>
          p.supplier_id === supplierId
            ? {
                ...p,
                supplier_id: targetSup.id,
                supplier_name: targetSup.name,
                lead_time_days: targetSup.default_lead_time,
              }
            : p
        )
      );
    }
  };

  const updateSupplier = (updated: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setProducts((prev) =>
      prev.map((p) =>
        p.supplier_id === updated.id
          ? { ...p, supplier_name: updated.name, lead_time_days: updated.default_lead_time }
          : p
      )
    );
  };

  // Old Stock Management
  const addToOldStock = (productId: string, units?: number, notes?: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nowStr = new Date().toISOString();
        // Set received date to 16 days ago so it exceeds 14 days threshold
        const oldReceived = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          ...p,
          is_old_stock: true,
          received_date: oldReceived,
          old_stock_added_at: nowStr,
          old_stock_notes: notes || 'Manually added to 2-week old stock radar',
          stock_on_hand: units !== undefined && units > 0 ? units : p.stock_on_hand,
          updated_at: nowStr,
        };
      })
    );
  };

  const removeFromOldStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          is_old_stock: false,
          received_date: new Date().toISOString().split('T')[0],
          old_stock_added_at: undefined,
          old_stock_notes: undefined,
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  // Stock edit
  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock_on_hand: Math.max(0, newStock),
              updated_at: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...updated, updated_at: new Date().toISOString() } : p))
    );
  };

  const addProduct = (item: Omit<Product, 'id' | 'updated_at'>) => {
    const id = 'prod_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    const newProduct: Product = {
      ...item,
      id,
      received_date: item.received_date || new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  // 2-Week Duration Old Stock Removal Action
  const removeOldStock = (
    productId: string,
    unitsToRemove: number,
    removalType: 'dispose' | 'return_supplier' | 'clearance',
    reasonNotes?: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const actualRemove = Math.min(prod.stock_on_hand, unitsToRemove);
    const costVal = Math.round(actualRemove * prod.cost_price);

    let reasonLabel: WastageRecord['reason'] = 'Expired';
    let notes = `Old Stock Removal (> 14 days on shelf): ${removalType.replace('_', ' ').toUpperCase()}`;
    if (removalType === 'return_supplier') {
      reasonLabel = 'Handling Loss';
      notes = `Supplier Return (> 14 days stagnant): ${prod.supplier_name}`;
    } else if (removalType === 'clearance') {
      notes = `Clearance removal: Sold at deep discount or cleared`;
    }
    if (reasonNotes) {
      notes += ` · ${reasonNotes}`;
    }

    // Add to wastage record
    addWastageRecord({
      productId: prod.id,
      productName: prod.name,
      qty: actualRemove,
      unit: prod.unit,
      reason: reasonLabel,
      date: new Date().toISOString().split('T')[0],
      cost_value: costVal,
      notes,
    });
  };

  const overrideReorderQty = (productId: string, newQty: number) => {
    setQtyOverrides((prev) => {
      const next = new Map(prev);
      next.set(productId, Math.max(0, newQty));
      return next;
    });
  };

  // Feedback loop: Mark as ordered
  const markAsOrdered = (selectedItemIds?: string[]) => {
    const itemsToOrder = planResults.reorderItems.filter(
      (it) => it.final_qty > 0 && (!selectedItemIds || selectedItemIds.includes(it.productId))
    );

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const totalAmount = itemsToOrder.reduce((acc, it) => acc + it.final_qty * it.cost_price, 0);

    const record: OrderHistoryRecord = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      itemCount: itemsToOrder.length,
      totalCost: totalAmount,
      items: itemsToOrder.map((it) => ({
        productId: it.productId,
        name: it.name,
        qty: it.final_qty,
        cost: it.final_qty * it.cost_price,
      })),
      status: 'Ordered',
    };

    setOrderHistory((prev) => [record, ...prev]);

    // Optimistically update products: add ordered qty to in_transit
    setProducts((prev) =>
      prev.map((p) => {
        const ordered = itemsToOrder.find((it) => it.productId === p.id);
        if (ordered) {
          return {
            ...p,
            in_transit: (p.in_transit || 0) + ordered.final_qty,
          };
        }
        return p;
      })
    );

    // Clear overrides for ordered items
    setQtyOverrides((prev) => {
      const next = new Map(prev);
      itemsToOrder.forEach((it) => next.delete(it.productId));
      return next;
    });

    return { orderId, totalAmount, count: itemsToOrder.length };
  };

  const undoMarkAsOrdered = (orderId: string) => {
    const order = orderHistory.find((o) => o.id === orderId);
    if (!order) return;

    // Rollback in_transit
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = order.items.find((it) => it.productId === p.id);
        if (orderedItem) {
          return {
            ...p,
            in_transit: Math.max(0, (p.in_transit || 0) - orderedItem.qty),
          };
        }
        return p;
      })
    );

    // Remove from history
    setOrderHistory((prev) => prev.filter((o) => o.id !== orderId));
  };

  const addWastageRecord = (record: Omit<WastageRecord, 'id'>) => {
    const id = 'wastage_' + Date.now().toString(36);
    const fullRecord: WastageRecord = {
      ...record,
      id,
    };
    setWastageRecords((prev) => [fullRecord, ...prev]);

    // Deduct wasted units from product stock_on_hand
    setProducts((prev) =>
      prev.map((p) =>
        p.id === record.productId
          ? {
              ...p,
              stock_on_hand: Math.max(0, p.stock_on_hand - record.qty),
            }
          : p
      )
    );
  };

  const importSalesCSV = useCallback(
    (salesRows: { date: string; sku?: string; name?: string; qty: number; price?: number }[]) => {
      let importedCount = 0;
      let matchedCount = 0;

      const newSalesMap = new Map(salesHistory);

      salesRows.forEach((row) => {
        if (!row.date || isNaN(row.qty) || row.qty < 0) return;

        // Match product by SKU or Name
        const matched = products.find(
          (p) =>
            (row.sku && p.sku.toLowerCase() === row.sku.toLowerCase()) ||
            (row.name && p.name.toLowerCase().includes(row.name.toLowerCase()))
        );

        if (matched) {
          matchedCount++;
          const currentList = newSalesMap.get(matched.id) || [];
          // Replace or append
          const existingIdx = currentList.findIndex((s) => s.date === row.date);
          if (existingIdx >= 0) {
            currentList[existingIdx] = {
              date: row.date,
              qty: row.qty,
              price: row.price || matched.selling_price,
            };
          } else {
            currentList.push({
              date: row.date,
              qty: row.qty,
              price: row.price || matched.selling_price,
            });
          }
          newSalesMap.set(matched.id, [...currentList]);
          importedCount++;
        }
      });

      setSalesHistory(newSalesMap);

      return {
        importedCount,
        failedCount: salesRows.length - importedCount,
        matchedProducts: matchedCount,
      };
    },
    [products, salesHistory]
  );

  const resetToDemoSeed = () => {
    localStorage.removeItem('stocksense_products');
    localStorage.removeItem('stocksense_settings');
    localStorage.removeItem('stocksense_wastage');
    localStorage.removeItem('stocksense_orders');
    setProducts(INITIAL_PRODUCTS);
    setSettings(INITIAL_SETTINGS);
    setSuppliers(INITIAL_SUPPLIERS);
    setWastageRecords(INITIAL_WASTAGE_RECORDS);
    setOrderHistory([]);
    setQtyOverrides(new Map());
    setSalesHistory(generateDemoSalesHistory());
  };

  const value: StoreContextType = {
    user,
    login,
    register,
    logout,
    quickDemoLogin,
    isDarkMode,
    toggleDarkMode,
    settings,
    updateSettings,
    products,
    suppliers,
    primarySupplier,
    addSupplier,
    deleteSupplier,
    setPrimarySupplier,
    updateSupplier,
    salesHistory,
    wastageRecords,
    weather,
    orderHistory,
    forecasts,
    reorderItems: planResults.reorderItems,
    doNotReorderItems: planResults.doNotReorderItems,
    topPriorityItem: planResults.topPriorityItem,
    totalEstimatedOrderValue: planResults.totalEstimatedOrderValue,
    criticalCount: planResults.criticalCount,
    highCount: planResults.highCount,
    totalCashLocked: planResults.totalCashLocked,
    expiringSoonCount: planResults.expiringSoonCount,
    updateProductStock,
    updateProduct,
    addProduct,
    addToOldStock,
    removeFromOldStock,
    removeOldStock,
    overrideReorderQty,
    markAsOrdered,
    undoMarkAsOrdered,
    addWastageRecord,
    importSalesCSV,
    resetToDemoSeed,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
