export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  default_lead_time: number;
  is_primary?: boolean;
}

export interface BatchInfo {
  qty: number;
  expiry_date: string; // YYYY-MM-DD
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock_on_hand: number;
  in_transit: number;
  supplier_id: string;
  supplier_name: string;
  lead_time_days: number;
  shelf_life_days: number | null; // null = non-perishable
  cost_price: number;
  selling_price: number;
  moq: number;
  pack_size: number;
  demand_multiplier: number;
  batches: BatchInfo[];
  updated_at: string;
  received_date?: string; // YYYY-MM-DD to track stock age
  is_old_stock?: boolean; // Manually or automatically tagged as old stock (>14 days)
  old_stock_added_at?: string;
  old_stock_notes?: string;
  removal_requested?: boolean;
  removal_scheduled_date?: string;
  removal_action?: 'dispose' | 'return_supplier' | 'clearance';
}

export interface DailySale {
  date: string; // YYYY-MM-DD
  qty: number;
  price: number;
}

export interface StoreSettings {
  store_name: string;
  owner_name: string;
  phone: string;
  city: string;
  service_level: number; // e.g. 0.95 -> z = 1.645
  review_cycle_days: number; // e.g. 3
  expiry_buffer: number; // e.g. 0.20 (20%)
  budget_cap: number | null;
  currency: string; // "₹"
  week_start: 'monday' | 'sunday';
}

export interface ForecastResult {
  productId: string;
  meanDaily: number;
  sigmaDaily: number;
  method: string;
  confidence: 'High' | 'Medium' | 'Low';
  wape: number;
  explanation: string;
  dailyForecastNext14Days: { date: string; demand: number; upperBand: number; lowerBand: number }[];
  pastSales: { date: string; qty: number }[];
}

export interface ReorderItem {
  productId: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  supplier_id: string;
  supplier_name: string;
  stock_on_hand: number;
  in_transit: number;
  daily_demand: number;
  lead_time_days: number;
  shelf_life_days: number | null;
  days_of_cover: number;
  safety_stock: number;
  reorder_point: number;
  order_up_to: number;
  recommended_qty: number;
  final_qty: number; // can be overridden by user
  pack_size: number;
  moq: number;
  cost_price: number;
  selling_price: number;
  total_order_cost: number;
  margin_per_unit: number;
  profit_at_risk: number;
  priority_score: number; // 0 - 100
  priority_label: 'Critical' | 'High' | 'Medium' | 'Low' | 'Overstock';
  stockout_date: string;
  order_by_date: string;
  reason: string;
  is_overridden: boolean;
  shelf_life_flag?: string;
  has_old_stock?: boolean;
  old_stock_units?: number;
  score_breakdown: {
    urgency: number;
    profit_risk: number;
    velocity: number;
  };
}

export interface DoNotReorderItem {
  productId: string;
  sku: string;
  name: string;
  category: string;
  stock_on_hand: number;
  lead_time_days: number;
  days_of_cover: number;
  cost_price: number;
  cash_locked: number;
  expiry_risk_qty: number;
  expiry_date?: string;
  suggested_action: 'Discount 15%' | 'Bundle with Fast-Mover' | 'Hold - Long Shelf Life' | 'Stop Ordering';
  reason: string;
}

export interface WastageRecord {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  unit: string;
  reason: 'Expired' | 'Damaged in store' | 'Spoiled/Mould' | 'Customer Return' | 'Handling Loss';
  date: string;
  cost_value: number;
  notes?: string;
}

export interface WeatherData {
  city: string;
  temp_c: number;
  condition: string;
  rain_probability: number;
  humidity: number;
  retail_impact: string;
}
